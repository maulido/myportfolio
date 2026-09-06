import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth-helpers';
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
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to fetch testimonial" },
            { status: 400 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    await dbConnect();

    try {
        const body = await request.json();
        const testimonial = await Testimonial.findByIdAndUpdate(id, body, { new: true });
        if (!testimonial) {
            return NextResponse.json({ success: false, error: "Testimonial not found" }, { status: 404 });
        }

        try {
            revalidatePath('/');
        } catch (revErr) {
            console.warn("revalidatePath error:", revErr);
        }

        return NextResponse.json({ success: true, data: testimonial });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to update testimonial" },
            { status: 400 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    await dbConnect();

    try {
        const deletedTestimonial = await Testimonial.findByIdAndDelete(id);
        if (!deletedTestimonial) {
            return NextResponse.json({ success: false, error: "Testimonial not found" }, { status: 404 });
        }

        try {
            revalidatePath('/');
        } catch (revErr) {
            console.warn("revalidatePath error:", revErr);
        }

        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to delete testimonial" },
            { status: 400 }
        );
    }
}
