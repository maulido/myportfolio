import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';

export async function GET() {
    try {
        await dbConnect();
    } catch {
        return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 });
    }

    try {
        const totalVisitors = await Session.countDocuments();
        const avgDurationRes = await Session.aggregate([
            { $group: { _id: null, avg: { $avg: "$duration" } } }
        ]);

        // Device stats aggregation
        const deviceStats = await Session.aggregate([
            {
                $group: {
                    _id: "$isMobile",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Top pages aggregation
        const topPages = await Session.aggregate([
            { $unwind: "$pageViews" },
            { $group: { _id: "$pageViews", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const mobileCount = deviceStats.find(d => d._id === true)?.count || 0;
        const desktopCount = deviceStats.find(d => d._id === false)?.count || 0;

        const avgDuration = avgDurationRes.length > 0 ? Math.round(avgDurationRes[0].avg) : 0;

        return NextResponse.json({
            success: true,
            data: {
                totalVisitors,
                avgDuration,
                devices: {
                    mobile: mobileCount,
                    desktop: desktopCount
                },
                topPages
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error }, { status: 400 });
    }
}
