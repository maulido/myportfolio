import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import dbConnect from '@/lib/db';
import Media from '@/models/Media';

// GET - List all media files
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const limit = parseInt(searchParams.get('limit') || '100');

        const query = type ? { fileType: type } : {};

        const files = await Media.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({ success: true, data: files });
    } catch (error) {
        console.error('Error fetching media:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch media' },
            { status: 500 }
        );
    }
}

// POST - Create new media entry
export async function POST(request: NextRequest) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        await dbConnect();

        const body = await request.json();
        const file = await Media.create(body);

        return NextResponse.json({ success: true, data: file }, { status: 201 });
    } catch (error: unknown) {
        console.error('Error creating media:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to create media' },
            { status: 500 }
        );
    }
}

// DELETE - Bulk delete media files
export async function DELETE(request: NextRequest) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        await dbConnect();
        const body = await request.json();
        const { ids } = body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Array of media IDs is required' },
                { status: 400 }
            );
        }

        const result = await Media.deleteMany({ _id: { $in: ids } });

        return NextResponse.json({
            success: true,
            message: `${result.deletedCount} files deleted successfully`,
            deletedCount: result.deletedCount
        });
    } catch (error: unknown) {
        console.error('Error bulk deleting media:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to bulk delete media' },
            { status: 500 }
        );
    }
}
