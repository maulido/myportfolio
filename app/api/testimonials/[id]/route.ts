import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Testimonial from '@/models/Testimonial';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await dbConnect();

    try {
        const testimonial = await Testimonial.findById(id);
        if (!testimonial) {
            return NextResponse.json({ success: false, error: "Testimonial not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: testimonial });
    } catch (error) {
        return NextResponse.json({ success: false, error: error }, { status: 400 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await dbConnect();

    try {
        const body = await request.json();
        const testimonial = await Testimonial.findByIdAndUpdate(id, body, { new: true });
        if (!testimonial) {
            return NextResponse.json({ success: false, error: "Testimonial not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: testimonial });
    } catch (error) {
        return NextResponse.json({ success: false, error: error }, { status: 400 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await dbConnect();

    try {
        const deletedTestimonial = await Testimonial.findByIdAndDelete(id);
        if (!deletedTestimonial) {
            return NextResponse.json({ success: false, error: "Testimonial not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
        return NextResponse.json({ success: false, error: error }, { status: 400 });
    }
}
