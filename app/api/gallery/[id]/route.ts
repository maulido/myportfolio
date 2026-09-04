import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import dbConnect from '@/lib/db';
import GalleryItem from '@/models/GalleryItem';
import { UTApi } from 'uploadthing/server';

const utapi = new UTApi();

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    await dbConnect();

    try {
        // Get the gallery item first to extract file key
        const galleryItem = await GalleryItem.findById(id);

        if (!galleryItem) {
            return NextResponse.json({ success: false, error: "Gallery item not found" }, { status: 404 });
        }

        // Extract file key from imageUrl (format: https://utfs.io/f/[fileKey])
        if (galleryItem.imageUrl) {
            const fileKey = galleryItem.imageUrl.split('/f/')[1];
            if (fileKey) {
                try {
                    await utapi.deleteFiles(fileKey);
                    console.log(`Deleted file from UploadThing: ${fileKey}`);
                } catch (error) {
                    console.error('Failed to delete file from UploadThing:', error);
                    // Continue with database deletion even if file deletion fails
                }
            }
        }

        // Delete from database
        await GalleryItem.findByIdAndDelete(id);

        return NextResponse.json({ success: true, data: {} });
    } catch (error: unknown) {
        console.error('Delete error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete gallery item"
        }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    await dbConnect();

    try {
        const body = await request.json();

        // Get the current item to check if image is being replaced
        const currentItem = await GalleryItem.findById(id);
        if (!currentItem) {
            return NextResponse.json({ success: false, error: "Gallery item not found" }, { status: 404 });
        }

        // If imageUrl is being updated and is different from current, delete old file
        if (body.imageUrl && body.imageUrl !== currentItem.imageUrl && currentItem.imageUrl) {
            const oldFileKey = currentItem.imageUrl.split('/f/')[1];
            if (oldFileKey) {
                try {
                    await utapi.deleteFiles(oldFileKey);
                    console.log(`Deleted old file from UploadThing: ${oldFileKey}`);
                } catch (error) {
                    console.error('Failed to delete old file from UploadThing:', error);
                    // Continue with update even if old file deletion fails
                }
            }
        }

        const item = await GalleryItem.findByIdAndUpdate(id, body, { new: true });
        if (!item) {
            return NextResponse.json({ success: false, error: "Gallery item not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: item });
    } catch (error: unknown) {
        console.error('Update error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to update gallery item"
        }, { status: 500 });
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
    } catch (error: unknown) {
        console.error('GET Gallery Item Error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch gallery item"
        }, { status: 500 });
    }
}
