import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';

export async function GET() {
    try {
        await dbConnect();
    } catch (e) {
        return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 });
    }

    try {
        const totalVisitors = await Session.countDocuments();
        const avgDurationRes = await Session.aggregate([
            { $group: { _id: null, avg: { $avg: "$duration" } } }
        ]);

        const avgDuration = avgDurationRes.length > 0 ? Math.round(avgDurationRes[0].avg) : 0;

        return NextResponse.json({
            success: true,
            data: {
                totalVisitors,
                avgDuration // in seconds
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error }, { status: 400 });
    }
}
