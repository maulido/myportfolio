import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { rateLimit } from '@/lib/rate-limit';
import dbConnect from '@/lib/db';
import ContactMessage from '@/models/ContactMessage';
import { requireAuth } from '@/lib/auth-helpers';

const contactLimiter = rateLimit({
  interval: 5 * 60 * 1000, // 5 minutes
  uniqueTokenPerInterval: 500,
});

/**
 * GET /api/contact
 * Admin endpoint to list contact form submissions
 */
export async function GET() {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    await dbConnect();
    const messages = await ContactMessage.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    console.error('[CONTACT API] Failed to fetch messages:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch contact messages' }, { status: 500 });
  }
}

/**
 * POST /api/contact
 * Public endpoint to submit contact messages
 */
export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    try {
      await contactLimiter.check(3, ip); // Max 3 messages per 5 minutes per IP
    } catch {
      return NextResponse.json(
        { success: false, error: "Too many messages sent. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    // Always persist the inquiry to the database so it is never lost
    await dbConnect();
    await ContactMessage.create({
      name,
      email,
      message,
      ip
    });

    // Attempt to send email if SMTP is configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: `"${name}" <${process.env.SMTP_USER}>`,
          to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
          subject: `Portfolio Contact: ${name}`,
          text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h3 style="color: #0070f3;">New Contact Form Submission</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 5px;">
                    <p><strong>Message:</strong></p>
                    <p>${message}</p>
                </div>
            </div>
          `,
        });

        if (process.env.NODE_ENV === 'development') {
          console.log(`[EMAIL SENT] From: ${email}, To: ${process.env.CONTACT_EMAIL || process.env.SMTP_USER}`);
        }
      } catch (emailError) {
        console.warn('[CONTACT API] Failed to send notification email (message saved to DB):', emailError);
      }
    } else {
      console.info('[CONTACT API] Message saved to database (SMTP not configured).');
    }

    return NextResponse.json({ success: true, message: "Thank you! Your message has been received successfully." });
  } catch (error) {
    console.error("[CONTACT API] Error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to process message. Please try again later."
    }, { status: 500 });
  }
}
