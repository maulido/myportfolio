import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Skill from '@/models/Skill';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Validate ObjectId format
        if (!id || id.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(id)) {
            return NextResponse.json(
                { success: false, error: "Invalid skill ID format" },
                { status: 400 }
            );
        }

        await dbConnect();
        const skill = await Skill.findById(id);

        if (!skill) {
            return NextResponse.json(
                { success: false, error: "Skill not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: skill });
    } catch (error: unknown) {
        console.error("API GET Skill Error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch skill"
        }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Validate ObjectId format
        if (!id || id.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(id)) {
            return NextResponse.json(
                { success: false, error: "Invalid skill ID format" },
                { status: 400 }
            );
        }

        await dbConnect();
        const body = await request.json();

        const skill = await Skill.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true
        });

        if (!skill) {
            return NextResponse.json(
                { success: false, error: "Skill not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: skill });
    } catch (error: unknown) {
        console.error("API PUT Skill Error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to update skill"
        }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Validate ObjectId format
        if (!id || id.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(id)) {
            return NextResponse.json(
                { success: false, error: "Invalid skill ID format" },
                { status: 400 }
            );
        }

        await dbConnect();
        const skill = await Skill.findByIdAndDelete(id);

        if (!skill) {
            return NextResponse.json(
                { success: false, error: "Skill not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: {} });
    } catch (error: unknown) {
        console.error("API DELETE Skill Error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete skill"
        }, { status: 500 });
    }
}
