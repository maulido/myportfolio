import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import dbConnect from '@/lib/db';
import CareerJourney from '@/models/CareerJourney';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Validate ObjectId format
        if (!id || id.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(id)) {
            return NextResponse.json(
                { success: false, error: "Invalid career entry ID format" },
                { status: 400 }
            );
        }

        await dbConnect();

        const career = await CareerJourney.findById(id);
        if (!career) {
            return NextResponse.json({ success: false, error: "Career entry not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: career });
    } catch (error: unknown) {
        console.error("API GET Career by ID Error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch career entry"
        }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        const { id } = await params;

        // Validate ObjectId format
        if (!id || id.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(id)) {
            return NextResponse.json(
                { success: false, error: "Invalid career entry ID format" },
                { status: 400 }
            );
        }

        await dbConnect();
        const body = await request.json();

        const career = await CareerJourney.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true
        });

        if (!career) {
            return NextResponse.json({ success: false, error: "Career entry not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: career });
    } catch (error: unknown) {
        console.error("API PUT Career Error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to update career entry"
        }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        const { id } = await params;

        // Validate ObjectId format
        if (!id || id.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(id)) {
            return NextResponse.json(
                { success: false, error: "Invalid career entry ID format" },
                { status: 400 }
            );
        }

        await dbConnect();

        const career = await CareerJourney.findByIdAndDelete(id);

        if (!career) {
            return NextResponse.json({ success: false, error: "Career entry not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: {} });
    } catch (error: unknown) {
        console.error("API DELETE Career Error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete career entry"
        }, { status: 500 });
    }
}
