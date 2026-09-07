import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import dbConnect from "@/lib/db";
import AiConversation from "@/models/AiConversation";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get("q")?.trim() || "";
        const status = searchParams.get("status")?.trim() || "";
        const filterLead = searchParams.get("lead") === "true";
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
        const skip = (page - 1) * limit;

        await dbConnect();

        const filter: Record<string, unknown> = {};

        if (status && ["active", "replied", "archived"].includes(status)) {
            filter.status = status;
        }

        if (filterLead) {
            filter.isLead = true;
        }

        if (search) {
            filter.$or = [
                { visitorName: { $regex: search, $options: "i" } },
                { visitorContact: { $regex: search, $options: "i" } },
                { lastMessage: { $regex: search, $options: "i" } },
                { "messages.content": { $regex: search, $options: "i" } }
            ];
        }

        const [conversations, totalCount, totalUnread] = await Promise.all([
            AiConversation.find(filter)
                .sort({ lastMessageAt: -1 })
                .skip(skip)
                .limit(limit)
                .select("sessionId visitorName visitorContact isLead category status unreadByAdmin lastMessage lastMessageAt createdAt")
                .lean(),
            AiConversation.countDocuments(filter),
            AiConversation.countDocuments({ unreadByAdmin: true })
        ]);

        return NextResponse.json({
            success: true,
            data: {
                conversations,
                pagination: {
                    page,
                    limit,
                    totalCount,
                    totalPages: Math.ceil(totalCount / limit)
                },
                totalUnread
            }
        });
    } catch (error) {
        console.error("Failed to list assistant chats:", error);
        return NextResponse.json(
            { success: false, error: "Gagal memuat daftar obrolan AI." },
            { status: 500 }
        );
    }
}
