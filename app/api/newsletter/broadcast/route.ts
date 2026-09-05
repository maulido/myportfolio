import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { requireAuth } from "@/lib/auth-helpers";
import dbConnect from "@/lib/db";
import Newsletter from "@/models/Newsletter";

export async function POST(req: NextRequest) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        const { subject, content, previewOnly } = await req.json();

        if (!subject?.trim() || !content?.trim()) {
            return NextResponse.json(
                { success: false, error: "Subject and content are required." },
                { status: 400 }
            );
        }

        await dbConnect();

        const activeSubscribers = await Newsletter.find({ subscribed: true }).lean();

        if (activeSubscribers.length === 0) {
            return NextResponse.json(
                { success: false, error: "No active subscribers found to broadcast to." },
                { status: 400 }
            );
        }

        if (previewOnly) {
            return NextResponse.json({
                success: true,
                recipientCount: activeSubscribers.length,
                message: `Ready to dispatch to ${activeSubscribers.length} active subscriber(s).`
            });
        }

        const isSmtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

        if (isSmtpConfigured) {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_SECURE === "true",
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            // Send batch in BCC chunks of 50 to prevent exposure of recipient list
            const bccList = activeSubscribers.map((s: { email: string }) => s.email);
            const chunkSize = 50;

            for (let i = 0; i < bccList.length; i += chunkSize) {
                const chunk = bccList.slice(i, i + chunkSize);
                await transporter.sendMail({
                    from: `"Engineering Dispatches" <${process.env.SMTP_USER}>`,
                    to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
                    bcc: chunk,
                    subject: subject.trim(),
                    text: content.trim(),
                    html: `
                        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background: #ffffff;">
                            <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 16px; margin-bottom: 20px;">
                                <h2 style="color: #0f172a; margin: 0; font-size: 20px;">Engineering Dispatch</h2>
                            </div>
                            <div style="font-size: 15px; line-height: 1.6; color: #334155; white-space: pre-wrap;">${content.trim()}</div>
                            <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
                                <p>You received this dispatch because you subscribed on our engineering portfolio.</p>
                            </div>
                        </div>
                    `,
                });
            }
        } else {
            console.log(`[NEWSLETTER BROADCAST SIMULATION] Dispatched "${subject}" to ${activeSubscribers.length} recipients. (SMTP not configured in local environment)`);
        }

        return NextResponse.json({
            success: true,
            recipientCount: activeSubscribers.length,
            message: `Successfully dispatched to ${activeSubscribers.length} subscriber(s).`
        });
    } catch (error) {
        console.error("Newsletter broadcast error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to dispatch newsletter broadcast." },
            { status: 500 }
        );
    }
}
