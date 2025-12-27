import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import GalleryItem from '@/models/GalleryItem';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await dbConnect();

    try {
        const deletedItem = await GalleryItem.findByIdAndDelete(id);
        if (!deletedItem) {
            return NextResponse.json({ success: false, error: "Gallery item not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
        return NextResponse.json({ success: false, error: error }, { status: 400 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await dbConnect();

    try {
        const body = await request.json();
        const item = await GalleryItem.findByIdAndUpdate(id, body, { new: true });
        if (!item) {
            return NextResponse.json({ success: false, error: "Gallery item not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: item });
    } catch (error) {
        return NextResponse.json({ success: false, error: error }, { status: 400 });
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await dbConnect();

    try {
        const item = await GalleryItem.findById(id);
        if (!item) {
            return NextResponse.json({ success: false, error: "Gallery item not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: item });
    } catch (error) {
        return NextResponse.json({ success: false, error: error }, { status: 400 });
    }
}
