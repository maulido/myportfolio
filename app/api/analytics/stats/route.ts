import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Analytics from '@/models/Analytics';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Total page views
        const totalViews = await Analytics.countDocuments({
            type: 'pageview',
            createdAt: { $gte: startDate }
        });

        // Unique visitors (unique session IDs)
        const uniqueVisitors = await Analytics.distinct('sessionId', {
            createdAt: { $gte: startDate }
        });

        // Total sessions
        const totalSessions = await Analytics.countDocuments({
            type: 'session',
            createdAt: { $gte: startDate }
        });

        // Popular pages
        const popularPages = await Analytics.aggregate([
            {
                $match: {
                    type: 'pageview',
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$path',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 20
            },
            {
                $project: {
                    _id: 0,
                    path: '$_id',
                    count: 1
                }
            }
        ]);

        return NextResponse.json({
            success: true,
            data: {
                totalViews,
                uniqueVisitors: uniqueVisitors.length,
                totalSessions,
                popularPages
            }
        });
    } catch (error) {
        console.error('Error fetching analytics stats:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
