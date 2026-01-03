import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Gallery from '@/models/Gallery';
import { UTApi } from 'uploadthing/server';

const utapi = new UTApi();

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await dbConnect();

    try {
        // Get the gallery item first to extract file key
        const galleryItem = await Gallery.findById(id);

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
        await Gallery.findByIdAndDelete(id);

        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
        console.error('Delete error:', error);
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
