import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import GuestbookEntry from '@/models/GuestbookEntry';
import { rateLimit } from '@/lib/rate-limit';

const likeLimiter = rateLimit({
    interval: 5 * 60 * 1000, // 5 minutes
    uniqueTokenPerInterval: 500,
});

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
        try {
            await likeLimiter.check(20, ip); // Max 20 likes per 5 mins per IP
        } catch {
            return NextResponse.json(
                { success: false, error: 'Too many reactions. Please wait a few moments.' },
                { status: 429 }
            );
        }

        const { id } = await params;
        await dbConnect();

        const entry = await GuestbookEntry.findOneAndUpdate(
            { _id: id, approved: true, spam: false },
            { $inc: { likes: 1 } },
            { new: true }
        );

        if (!entry) {
            return NextResponse.json(
                { success: false, error: 'Signature not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            likes: entry.likes
        });
    } catch (error: unknown) {
        console.error('Error liking guestbook entry:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to like signature' },
            { status: 500 }
        );
    }
}
