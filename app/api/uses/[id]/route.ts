import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth-helpers';
import dbConnect from '@/lib/db';
import UsesItem from '@/models/UsesItem';

// GET - Get single uses item
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const { id } = await params;
        const item = await UsesItem.findById(id).lean();

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
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        await dbConnect();

        const { id } = await params;
        const body = await request.json();
        const item = await UsesItem.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true }
        );

        if (!item) {
            return NextResponse.json(
                { success: false, error: 'Item not found' },
                { status: 404 }
            );
        }

        try {
            revalidatePath('/uses');
            revalidatePath('/');
        } catch (revErr) {
            console.warn("revalidatePath error:", revErr);
        }

        return NextResponse.json({ success: true, data: item });
    } catch (error: unknown) {
        console.error('Error updating uses item:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to update uses item' },
            { status: 500 }
        );
    }
}

// DELETE - Delete uses item (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        await dbConnect();

        const { id } = await params;
        const item = await UsesItem.findByIdAndDelete(id);

        if (!item) {
            return NextResponse.json(
                { success: false, error: 'Item not found' },
                { status: 404 }
            );
        }

        try {
            revalidatePath('/uses');
            revalidatePath('/');
        } catch (revErr) {
            console.warn("revalidatePath error:", revErr);
        }

        return NextResponse.json({ success: true, data: item });
    } catch (error) {
        console.error('Error deleting uses item:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to delete uses item' },
            { status: 500 }
        );
    }
}
