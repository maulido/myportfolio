import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sanitizeText } from "@/lib/sanitize";
import dbConnect from "@/lib/db";
import AiConversation from "@/models/AiConversation";

export const dynamic = "force-dynamic";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        const { sessionId } = await params;
        const body = await req.json();
        const rawText = body?.message;

        if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
            return NextResponse.json({ success: false, error: "Pesan balasan tidak boleh kosong." }, { status: 400 });
        }

        const replyContent = sanitizeText(rawText.trim());
        if (!replyContent) {
            return NextResponse.json({ success: false, error: "Pesan balasan tidak valid." }, { status: 400 });
        }

        await dbConnect();

        const newMsg = {
            sender: "admin",
            senderName: "Maulido (Admin)",
            content: replyContent,
            timestamp: new Date()
        };

        const updated = await AiConversation.findOneAndUpdate(
            { sessionId },
            {
                $push: { messages: newMsg },
                $set: {
                    status: "replied",
                    unreadByVisitor: true,
                    unreadByAdmin: false,
                    lastMessage: replyContent.slice(0, 180),
                    lastMessageAt: new Date()
                }
            },
            { new: true }
        ).lean();

        if (!updated) {
            return NextResponse.json({ success: false, error: "Sesi percakapan tidak ditemukan." }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: updated,
            message: "Balasan berhasil dikirim ke pengunjung!"
        });
    } catch (error) {
        console.error("Failed to send admin reply:", error);
        return NextResponse.json({ success: false, error: "Gagal mengirim balasan admin." }, { status: 500 });
    }
}
