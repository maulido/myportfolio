import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import dbConnect from "@/lib/db";
import AiConversation from "@/models/AiConversation";

export const dynamic = "force-dynamic";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        const { sessionId } = await params;
        await dbConnect();

        const convo = await AiConversation.findOneAndUpdate(
            { sessionId },
            { $set: { unreadByAdmin: false } },
            { new: true }
        ).lean();

        if (!convo) {
            return NextResponse.json({ success: false, error: "Percakapan tidak ditemukan." }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: convo });
    } catch (error) {
        console.error("Failed to get assistant chat thread:", error);
        return NextResponse.json({ success: false, error: "Gagal mengambil percakapan." }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        const { sessionId } = await params;
        const body = await req.json();
        await dbConnect();

        const updateData: Record<string, unknown> = {};
        if (body.status && ["active", "replied", "archived"].includes(body.status)) {
            updateData.status = body.status;
        }

        const convo = await AiConversation.findOneAndUpdate(
            { sessionId },
            { $set: updateData },
            { new: true }
        ).lean();

        if (!convo) {
            return NextResponse.json({ success: false, error: "Percakapan tidak ditemukan." }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: convo });
    } catch (error) {
        console.error("Failed to update chat session status:", error);
        return NextResponse.json({ success: false, error: "Gagal memperbarui status percakapan." }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        const { sessionId } = await params;
        await dbConnect();

        const deleted = await AiConversation.findOneAndDelete({ sessionId });
        if (!deleted) {
            return NextResponse.json({ success: false, error: "Percakapan tidak ditemukan." }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Percakapan berhasil dihapus." });
    } catch (error) {
        console.error("Failed to delete assistant chat:", error);
        return NextResponse.json({ success: false, error: "Gagal menghapus percakapan." }, { status: 500 });
    }
}
