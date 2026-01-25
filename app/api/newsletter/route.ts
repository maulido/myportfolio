import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Newsletter from '@/models/Newsletter';

// GET - Fetch all newsletter subscribers
export async function GET() {
    try {
        await dbConnect();
        const subscribers = await Newsletter.find().sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: subscribers
        });
    } catch (error) {
        console.error('Newsletter GET error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch subscribers' },
            { status: 500 }
        );
    }
}

// POST - Subscribe to newsletter


export async function POST(req: Request) {
    try {
        const { email, name } = await req.json();

        if (!email) {
            return NextResponse.json(
                { success: false, message: 'Email is required' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if email already exists
        const existing = await Newsletter.findOne({ email: email.toLowerCase() });
        if (existing) {
            if (existing.subscribed) {
                return NextResponse.json(
                    { success: false, message: 'Already subscribed to newsletter' },
                    { status: 400 }
                );
            } else {
                // Re-subscribe
                existing.subscribed = true;
                existing.subscribedAt = new Date();
                existing.unsubscribedAt = undefined;
                if (name) existing.name = name;
                await existing.save();

                return NextResponse.json({
                    success: true,
                    message: 'Successfully re-subscribed to the newsletter!',
                });
            }
        }

        // Create new subscriber
        await Newsletter.create({
            email: email.toLowerCase(),
            name,
            subscribed: true,
            subscribedAt: new Date()
        });

        return NextResponse.json({
            success: true,
            message: 'Successfully subscribed to the newsletter!',
        });
    } catch (error) {
        console.error('Newsletter API Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

