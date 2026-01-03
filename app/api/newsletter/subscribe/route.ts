import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Newsletter from '@/models/Newsletter';

export async function POST(req: NextRequest) {
    try {
        const { email, name } = await req.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({
                success: false,
                message: 'Valid email is required'
            }, { status: 400 });
        }

        await dbConnect();

        // Check if already subscribed
        const existing = await Newsletter.findOne({ email: email.toLowerCase() });

        if (existing) {
            if (existing.subscribed) {
                return NextResponse.json({
                    success: false,
                    message: 'This email is already subscribed'
                }, { status: 400 });
            } else {
                // Resubscribe
                existing.subscribed = true;
                existing.subscribedAt = new Date();
                existing.unsubscribedAt = undefined;
                await existing.save();

                return NextResponse.json({
                    success: true,
                    message: 'Successfully resubscribed!'
                });
            }
        }

        // Create new subscription
        await Newsletter.create({
            email: email.toLowerCase(),
            name,
            subscribed: true,
            subscribedAt: new Date()
        });

        // TODO: Send welcome email via SendGrid
        // await sendWelcomeEmail(email, name);

        return NextResponse.json({
            success: true,
            message: 'Successfully subscribed! Check your email for confirmation.'
        });
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to subscribe. Please try again.'
        }, { status: 500 });
    }
}
