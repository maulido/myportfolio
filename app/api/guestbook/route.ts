import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import GuestbookEntry from '@/models/GuestbookEntry';
import { rateLimit } from '@/lib/rate-limit';

const guestbookLimiter = rateLimit({
    interval: 5 * 60 * 1000, // 5 minutes
    uniqueTokenPerInterval: 500,
});

// GET - Get approved guestbook entries (public)
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const entries = await GuestbookEntry.find({ approved: true, spam: false })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-email -ipAddress') // Don't expose email and IP
            .lean();

        const total = await GuestbookEntry.countDocuments({ approved: true, spam: false });

        return NextResponse.json(
            {
                success: true,
                data: entries,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
                },
            }
        );
    } catch (error) {
        console.error('Error fetching guestbook entries:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch entries' },
            { status: 500 }
        );
    }
}

// POST - Submit new guestbook entry
export async function POST(request: NextRequest) {
    try {
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';

        try {
            await guestbookLimiter.check(5, ip); // Max 5 submissions per 5 minutes per IP
        } catch {
            return NextResponse.json(
                { success: false, error: 'Too many submissions. Please wait a few minutes before trying again.' },
                { status: 429 }
            );
        }

        await dbConnect();

        const body = await request.json();
        const { sanitizeText, sanitizeEmail } = await import('@/lib/sanitize');
        const name = sanitizeText(body?.name);
        const message = sanitizeText(body?.message);
        const email = body?.email ? sanitizeEmail(body.email) : undefined;
        const website = body?.website ? sanitizeText(body.website) : undefined;

        if (!name || !message) {
            return NextResponse.json(
                { success: false, error: 'Valid name and message are required.' },
                { status: 400 }
            );
        }

        // Simple rate limiting check - max 10 entries per IP in last hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentEntries = await GuestbookEntry.countDocuments({
            ipAddress: ip,
            createdAt: { $gte: oneHourAgo }
        });

        if (recentEntries >= 10) {
            return NextResponse.json(
                { success: false, error: 'You have reached the maximum number of submissions (10 per hour). Please try again later.' },
                { status: 429 }
            );
        }

        const entry = await GuestbookEntry.create({
            name,
            message,
            email,
            website,
            ipAddress: ip,
            approved: false, // Require approval by default
            spam: false
        });

        return NextResponse.json({
            success: true,
            data: entry,
            message: 'Thank you! Your message will appear after approval.'
        }, { status: 201 });
    } catch (error: unknown) {
        console.error('Error creating guestbook entry:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to submit entry' },
            { status: 500 }
        );
    }
}
