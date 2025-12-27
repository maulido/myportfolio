import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';

export async function POST(req: Request) {
    try {
        await dbConnect();
    } catch (e) {
        return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 });
    }

    try {
        const body = await req.json();
        const { sessionId, path, isHeartbeat, userAgent, isMobile } = body;

        if (!sessionId) {
            return NextResponse.json({ success: false, error: "Missing sessionId" }, { status: 400 });
        }

        let session = await Session.findOne({ sessionId });

        if (!session) {
            // New Session
            session = await Session.create({
                sessionId,
                startTime: new Date(),
                lastSeen: new Date(),
                pageViews: [path],
                userAgent: userAgent || 'Unknown',
                isMobile: !!isMobile
            });
        } else {
            // Update existing session
            const update: any = {
                lastSeen: new Date(),
                $addToSet: { pageViews: path }
            };

            // Calculate duration if it's a heartbeat or page transition
            const lastSeenTime = new Date(session.lastSeen).getTime();
            const now = new Date().getTime();
            const sessionStart = new Date(session.startTime).getTime();

            update.duration = Math.floor((now - sessionStart) / 1000);

            session = await Session.findOneAndUpdate(
                { sessionId },
                update,
                { new: true }
            );
        }

        return NextResponse.json({ success: true, data: session });
    } catch (error) {
        return NextResponse.json({ success: false, error: error }, { status: 400 });
    }
}
