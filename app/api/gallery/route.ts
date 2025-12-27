import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import GalleryItem from '@/models/GalleryItem';

export async function GET() {
    await dbConnect();

    try {
        const items = await GalleryItem.find({}).sort({ date: -1 });
        return NextResponse.json({ success: true, data: items });
    } catch (error) {
        return NextResponse.json({ success: false, error: error }, { status: 400 });
    }
}

export async function POST(req: Request) {
    await dbConnect();

    try {
        const body = await req.json();
        const item = await GalleryItem.create(body);
        return NextResponse.json({ success: true, data: item }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error }, { status: 400 });
    }
}
