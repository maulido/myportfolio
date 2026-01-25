import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import GuestbookEntry from '@/models/GuestbookEntry';

// PUT - Approve/reject entry (admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const { id } = await params;
        const body = await request.json();
        const { approved, spam } = body;

        const entry = await GuestbookEntry.findByIdAndUpdate(
            id,
            { approved, spam },
            { new: true }
        );

        if (!entry) {
            return NextResponse.json(
                { success: false, error: 'Entry not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: entry });
    } catch (error: unknown) {
        console.error('Error updating entry:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to update entry' },
            { status: 500 }
        );
    }
}

// DELETE - Delete entry (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const { id } = await params;
        const entry = await GuestbookEntry.findByIdAndDelete(id);

        if (!entry) {
            return NextResponse.json(
                { success: false, error: 'Entry not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: entry });
    } catch (error) {
        console.error('Error deleting entry:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete entry' },
            { status: 500 }
        );
    }
}
