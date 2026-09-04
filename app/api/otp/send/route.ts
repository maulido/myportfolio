import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import OTP from '@/models/OTP';
import nodemailer from 'nodemailer';
import { rateLimit } from '@/lib/rate-limit';

const otpLimiter = rateLimit({
    interval: 10 * 60 * 1000, // 10 minutes
    uniqueTokenPerInterval: 500,
});

export async function POST(req: Request) {
    try {
        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
        try {
            await otpLimiter.check(5, ip); // Max 5 requests per 10 minutes per IP
        } catch {
            return NextResponse.json(
                { success: false, error: "Too many OTP requests. Please wait before trying again." },
                { status: 429 }
            );
        }

        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
        }

        await dbConnect();

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save to DB (overwrite if exists for this email)
        await OTP.findOneAndUpdate(
            { email },
            { otp, createdAt: new Date() },
            { upsert: true }
        );

        // Send OTP via email
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
            from: `"Portfolio Verification" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Your CV Download OTP",
            text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; text-align: center;">
                    <h2>CV Download Verification</h2>
                    <p>Use the following code to download the CV:</p>
                    <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; color: #0070f3;">
                        ${otp}
                    </div>
                    <p style="color: #666;">This code will expire in 5 minutes.</p>
                </div>
            `
        });

        return NextResponse.json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
        console.error("OTP Send Error:", error);
        return NextResponse.json({ success: false, error: "Failed to send OTP" }, { status: 500 });
    }
}
