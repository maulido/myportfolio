import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import dbConnect from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        const { id } = await params;
        const body = await req.json();

        await dbConnect();

        const updateData: { read?: boolean } = {};
        if (typeof body.read === "boolean") {
            updateData.read = body.read;
        }

        const message = await ContactMessage.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        if (!message) {
            return NextResponse.json(
                { success: false, error: "Message not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: message });
    } catch (error) {
        console.error("Error updating contact message:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update message" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        const { id } = await params;

        await dbConnect();

        const message = await ContactMessage.findByIdAndDelete(id);

        if (!message) {
            return NextResponse.json(
                { success: false, error: "Message not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Message deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting contact message:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete message" },
            { status: 500 }
        );
    }
}
