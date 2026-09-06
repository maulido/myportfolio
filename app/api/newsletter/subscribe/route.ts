import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Newsletter from '@/models/Newsletter';
import { rateLimit } from '@/lib/rate-limit';
import { sanitizeEmail, sanitizeText } from '@/lib/sanitize';

const newsletterLimiter = rateLimit({
    interval: 10 * 60 * 1000, // 10 minutes
    uniqueTokenPerInterval: 500,
});

export async function POST(req: NextRequest) {
    try {
        // 1. IP Rate Limiter to prevent automated subscription spam
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
        try {
            await newsletterLimiter.check(5, ip); // Max 5 requests per 10 mins
        } catch {
            return NextResponse.json({
                success: false,
                error: 'Too many subscription requests. Please wait a few minutes before trying again.',
                message: 'Too many subscription requests. Please wait a few minutes before trying again.'
            }, { status: 429 });
        }

        const body = await req.json();
        const rawEmail = body?.email;
        const rawName = body?.name;

        const email = sanitizeEmail(rawEmail);
        const name = rawName ? sanitizeText(rawName) : undefined;

        // Basic email syntax validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email || !emailRegex.test(email)) {
            return NextResponse.json({
                success: false,
                error: 'A valid email address is required',
                message: 'A valid email address is required'
            }, { status: 400 });
        }

        await dbConnect();

        // Check if already subscribed
        const existing = await Newsletter.findOne({ email });

        if (existing) {
            if (existing.subscribed) {
                return NextResponse.json({
                    success: false,
                    error: 'This email is already subscribed to the newsletter.',
                    message: 'This email is already subscribed to the newsletter.'
                }, { status: 400 });
            } else {
                // Resubscribe
                existing.subscribed = true;
                existing.subscribedAt = new Date();
                existing.unsubscribedAt = undefined;
                if (name) existing.name = name;
                await existing.save();

                return NextResponse.json({
                    success: true,
                    message: 'Welcome back! Successfully resubscribed to the newsletter.'
                });
            }
        }

        // Create new subscription
        await Newsletter.create({
            email,
            name,
            subscribed: true,
            subscribedAt: new Date()
        });

        return NextResponse.json({
            success: true,
            message: 'Successfully subscribed to the newsletter! Thank you.'
        });
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to subscribe. Please try again later.',
            message: 'Failed to subscribe. Please try again later.'
        }, { status: 500 });
    }
}
