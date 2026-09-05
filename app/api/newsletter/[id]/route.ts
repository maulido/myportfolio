import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import dbConnect from "@/lib/db";
import Newsletter from "@/models/Newsletter";

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

        const updateData: { subscribed?: boolean; unsubscribedAt?: Date | null } = {};
        if (typeof body.subscribed === "boolean") {
            updateData.subscribed = body.subscribed;
            updateData.unsubscribedAt = body.subscribed ? null : new Date();
        }

        const subscriber = await Newsletter.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        if (!subscriber) {
            return NextResponse.json(
                { success: false, error: "Subscriber not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: subscriber });
    } catch (error) {
        console.error("Error updating subscriber:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update subscriber status" },
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

        const subscriber = await Newsletter.findByIdAndDelete(id);

        if (!subscriber) {
            return NextResponse.json(
                { success: false, error: "Subscriber not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Subscriber removed successfully"
        });
    } catch (error) {
        console.error("Error deleting subscriber:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete subscriber" },
            { status: 500 }
        );
    }
}
