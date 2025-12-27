import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Testimonial from '@/models/Testimonial';

export async function GET() {
    await dbConnect();

    try {
        const testimonials = await Testimonial.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: testimonials });
    } catch (error) {
        return NextResponse.json({ success: false, error: error }, { status: 400 });
    }
}

export async function POST(request: Request) {
    await dbConnect();

    try {
        const body = await request.json();
        const testimonial = await Testimonial.create(body);
        return NextResponse.json({ success: true, data: testimonial });
    } catch (error) {
        return NextResponse.json({ success: false, error: error }, { status: 400 });
    }
}
