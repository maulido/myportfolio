import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import dbConnect from '@/lib/db';
import Testimonial from '@/models/Testimonial';

export async function GET() {
    await dbConnect();

    try {
        const testimonials = await Testimonial.find({}).sort({ createdAt: -1 }).lean();
        return NextResponse.json(
            { success: true, data: testimonials },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
                },
            }
        );
    } catch (error) {
        return NextResponse.json({ success: false, error: error }, { status: 400 });
    }
}

export async function POST(request: Request) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    await dbConnect();

    try {
        const body = await request.json();
        const testimonial = await Testimonial.create(body);
        return NextResponse.json({ success: true, data: testimonial });
    } catch (error) {
        return NextResponse.json({ success: false, error: error }, { status: 400 });
    }
}
