import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import GuestbookEntry from '@/models/GuestbookEntry';

// GET - Get pending entries (admin only)
export async function GET() {
    try {
        await dbConnect();

        const entries = await GuestbookEntry.find({ approved: false, spam: false })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, data: entries });
    } catch (error) {
        console.error('Error fetching pending entries:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch pending entries' },
            { status: 500 }
        );
    }
}
