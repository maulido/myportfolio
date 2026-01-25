import { NextRequest, NextResponse } from 'next/server';
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
