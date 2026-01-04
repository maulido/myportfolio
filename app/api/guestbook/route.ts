import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import GuestbookEntry from '@/models/GuestbookEntry';

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

        return NextResponse.json({
            success: true,
            data: entries,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
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
        await dbConnect();

        const body = await request.json();

        // Get IP address for spam prevention
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

        // Simple rate limiting check - max 3 entries per IP in last hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentEntries = await GuestbookEntry.countDocuments({
            ipAddress: ip,
            createdAt: { $gte: oneHourAgo }
        });

        if (recentEntries >= 3) {
            return NextResponse.json(
                { success: false, error: 'Too many submissions. Please try again later.' },
                { status: 429 }
            );
        }

        const entry = await GuestbookEntry.create({
            ...body,
            ipAddress: ip,
            approved: false // Require approval by default
        });

        return NextResponse.json({
            success: true,
            data: entry,
            message: 'Thank you! Your message will appear after approval.'
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating guestbook entry:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to submit entry' },
            { status: 500 }
        );
    }
}
