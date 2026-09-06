import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Analytics from '@/models/Analytics';

export async function GET(request: Request) {
    try {
        await dbConnect();
    } catch {
        return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 });
    }
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    try {
        let query = {};
        if (type) query = { type };

        const stats = await Analytics.find(query);
        return NextResponse.json({ success: true, data: stats });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch analytics"
        }, { status: 400 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
    } catch {
        return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 });
    }

    try {
        const { type, identifier } = await request.json();
        const stat = await Analytics.findOneAndUpdate(
            { type, identifier },
            { $inc: { count: 1 }, lastUpdated: Date.now() },
            { upsert: true, new: true }
        );
        return NextResponse.json({ success: true, data: stat });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to record analytics"
        }, { status: 400 });
    }
}
