import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';

export async function GET(req: Request) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    try {
        if (key) {
            const setting = await Settings.findOne({ key });
            return NextResponse.json({ success: true, data: setting?.value });
        }
        const settings = await Settings.find({});
        return NextResponse.json({ success: true, data: settings });
    } catch (error) {
        return NextResponse.json({ success: false, error: error }, { status: 400 });
    }
}

export async function POST(req: Request) {
    await dbConnect();
    try {
        const { key, value } = await req.json();
        const setting = await Settings.findOneAndUpdate(
            { key },
            { value },
            { upsert: true, new: true }
        );
        return NextResponse.json({ success: true, data: setting });
    } catch (error) {
        return NextResponse.json({ success: false, error: error }, { status: 400 });
    }
}
