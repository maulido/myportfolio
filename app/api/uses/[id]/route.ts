import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UsesItem from '@/models/UsesItem';

// GET - Get single uses item
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();

        const item = await UsesItem.findById(params.id).lean();

        if (!item) {
            return NextResponse.json(
                { success: false, error: 'Item not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: item });
    } catch (error) {
        console.error('Error fetching uses item:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch uses item' },
            { status: 500 }
        );
    }
}

// PUT - Update uses item (admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();

        const body = await request.json();
        const item = await UsesItem.findByIdAndUpdate(
            params.id,
            body,
            { new: true, runValidators: true }
        );

        if (!item) {
            return NextResponse.json(
                { success: false, error: 'Item not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: item });
    } catch (error: any) {
        console.error('Error updating uses item:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update uses item' },
            { status: 500 }
        );
    }
}

// DELETE - Delete uses item (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();

        const item = await UsesItem.findByIdAndDelete(params.id);

        if (!item) {
            return NextResponse.json(
                { success: false, error: 'Item not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: item });
    } catch (error) {
        console.error('Error deleting uses item:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete uses item' },
            { status: 500 }
        );
    }
}
