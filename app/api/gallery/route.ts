import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth-helpers';
import dbConnect from '@/lib/db';
import GalleryItem from '@/models/GalleryItem';

export async function GET() {
    try {
        await dbConnect();
        const items = await GalleryItem.find({}).sort({ date: -1 }).lean();
        return NextResponse.json(
            { success: true, data: items },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
                },
            }
        );
    } catch (error: unknown) {
        console.error("API GET Gallery Error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch gallery items"
        }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        await dbConnect();
        const body = await req.json();

        // Validate required fields
        if (!body.title || !body.imageUrl) {
            return NextResponse.json({
                success: false,
                error: "Title and image are required"
            }, { status: 400 });
        }

        const item = await GalleryItem.create(body);

        try {
            revalidatePath('/gallery');
            revalidatePath('/');
        } catch (revErr) {
            console.warn("revalidatePath error:", revErr);
        }

        return NextResponse.json({ success: true, data: item }, { status: 201 });
    } catch (error: unknown) {
        console.error("API POST Gallery Error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to create gallery item"
        }, { status: 400 });
    }
}
