import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

// Simple analytics event model
const AnalyticsEventSchema = new mongoose.Schema({
    event: { type: String, required: true },
    properties: { type: mongoose.Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
    userAgent: String,
    ip: String,
}, { timestamps: true });

const AnalyticsEvent = mongoose.models.AnalyticsEvent ||
    mongoose.model('AnalyticsEvent', AnalyticsEventSchema);

export async function POST(req: NextRequest) {
    try {
        const { event, properties, timestamp } = await req.json();

        await dbConnect();

        // Get user info
        const userAgent = req.headers.get('user-agent') || 'unknown';
        const ip = req.headers.get('x-forwarded-for') ||
            req.headers.get('x-real-ip') ||
            'unknown';

        await AnalyticsEvent.create({
            event,
            properties,
            timestamp: timestamp || new Date(),
            userAgent,
            ip,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Analytics tracking error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

// Get analytics data (for admin dashboard)
export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const days = parseInt(searchParams.get('days') || '7');
        const event = searchParams.get('event');

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const query: any = { timestamp: { $gte: startDate } };
        if (event) query.event = event;

        const events = await AnalyticsEvent.find(query).sort({ timestamp: -1 });

        // Aggregate stats
        const stats = {
            totalEvents: events.length,
            uniqueEvents: [...new Set(events.map(e => e.event))].length,
            eventCounts: events.reduce((acc: any, e) => {
                acc[e.event] = (acc[e.event] || 0) + 1;
                return acc;
            }, {}),
        };

        return NextResponse.json({
            success: true,
            data: {
                events: events.slice(0, 100), // Limit to 100 recent events
                stats,
            }
        });
    } catch (error) {
        console.error('Analytics fetch error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
