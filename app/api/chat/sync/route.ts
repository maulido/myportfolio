import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import AiConversation from "@/models/AiConversation";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get("sessionId")?.trim();

        if (!sessionId) {
            return NextResponse.json({ success: false, error: "sessionId is required" }, { status: 400 });
        }

        await dbConnect();

        const convo = await AiConversation.findOneAndUpdate(
            { sessionId },
            { $set: { unreadByVisitor: false } },
            { new: true }
        )
            .select("messages isLead status")
            .lean();

        if (!convo) {
            return NextResponse.json({
                success: true,
                messages: []
            }, {
                headers: { "Cache-Control": "no-store, max-age=0" }
            });
        }

        return NextResponse.json({
            success: true,
            messages: convo.messages || [],
            status: convo.status,
            isLead: convo.isLead
        }, {
            headers: { "Cache-Control": "no-store, max-age=0" }
        });
    } catch (error) {
        console.error("Chat sync error:", error);
        return NextResponse.json({ success: false, error: "Failed to sync chat" }, { status: 500 });
    }
}
