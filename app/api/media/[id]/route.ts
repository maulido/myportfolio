import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import dbConnect from '@/lib/db';
import Media from '@/models/Media';

// DELETE - Delete media file
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        await dbConnect();

        const { id } = await params;
        const file = await Media.findByIdAndDelete(id);

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'File not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: file });
    } catch (error) {
        console.error('Error deleting media:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete media' },
            { status: 500 }
        );
    }
}
