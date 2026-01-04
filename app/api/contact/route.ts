import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    // Check if email service is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('[CONTACT API] Email service not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables.');

      // Return user-friendly message instead of 500 error
      return NextResponse.json({
        success: false,
        error: "Email service is not configured. Please contact the administrator directly or try again later."
      }, { status: 503 });
    }

    // Configure nodemailer with environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify transporter configuration
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error('[CONTACT API] Email transporter verification failed:', verifyError);
      return NextResponse.json({
        success: false,
        error: "Email service is currently unavailable. Please try again later."
      }, { status: 503 });
    }

    // Send email
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
    return NextResponse.json({ success: true, message: "Thank you! Your message has been sent successfully." });
  } catch (error) {
    // Log errors in all environments for debugging
    console.error("[CONTACT API] Email send error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to send email. Please try again later or contact us directly."
    }, { status: 500 });
  }
}
