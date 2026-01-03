import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CareerJourney from '@/models/CareerJourney';

export async function GET(req: Request) {
    try {
        await dbConnect();

        // Get type filter from query params
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');

        // Build query
        const query = type ? { type } : {};

        const careers = await CareerJourney.find(query).sort({ startDate: -1 });
        return NextResponse.json({ success: true, data: careers });
    } catch (error: unknown) {
        console.error("API GET Career Error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Internal Server Error"
        }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        // Validate required fields
        if (!body.title || !body.organization || !body.startDate || !body.description) {
            return NextResponse.json({
                success: false,
                error: "Missing required fields: title, organization, startDate, description"
            }, { status: 400 });
        }

        const career = await CareerJourney.create(body);
        return NextResponse.json({ success: true, data: career }, { status: 201 });
    } catch (error: unknown) {
        console.error("API POST Career Error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to create career entry"
        }, { status: 400 });
    }
}
