import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth-helpers';
import dbConnect from '@/lib/db';
import GuestbookEntry from '@/models/GuestbookEntry';

// PUT - Approve/reject entry (admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        await dbConnect();

        const { id } = await params;
        const body = await request.json();
        const { approved, spam, pinned, adminReply } = body;

        const updateData: Record<string, unknown> = {};
        if (approved !== undefined) updateData.approved = Boolean(approved);
        if (spam !== undefined) updateData.spam = Boolean(spam);
        if (pinned !== undefined) updateData.pinned = Boolean(pinned);
        if (adminReply !== undefined) {
            updateData.adminReply = adminReply ? String(adminReply).trim() : null;
            updateData.adminRepliedAt = adminReply ? new Date() : null;
        }

        const entry = await GuestbookEntry.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!entry) {
            return NextResponse.json(
                { success: false, error: 'Entry not found' },
                { status: 404 }
            );
        }

        try {
            revalidatePath('/guestbook');
            revalidatePath('/');
        } catch (revErr) {
            console.warn("revalidatePath error:", revErr);
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
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

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

        try {
            revalidatePath('/guestbook');
            revalidatePath('/');
        } catch (revErr) {
            console.warn("revalidatePath error:", revErr);
        }

        return NextResponse.json({ success: true, data: entry });
    } catch (error) {
        console.error('Error deleting entry:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to delete entry' },
            { status: 500 }
        );
    }
}
