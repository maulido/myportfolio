import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import dbConnect from "@/lib/db";
import AiChatLog from "@/models/AiChatLog";

export const dynamic = "force-dynamic";

export async function GET() {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        await dbConnect();

        const [
            totalQueries,
            totalLeads,
            cachedQueries,
            categoryStats,
            recentLeads,
            recentQueries
        ] = await Promise.all([
            AiChatLog.countDocuments({}),
            AiChatLog.countDocuments({ isLead: true }),
            AiChatLog.countDocuments({ cached: true }),
            AiChatLog.aggregate([
                {
                    $group: {
                        _id: "$category",
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ]),
            AiChatLog.find({ isLead: true })
                .sort({ createdAt: -1 })
                .limit(10)
                .select("query leadContact category createdAt")
                .lean(),
            AiChatLog.find({})
                .sort({ createdAt: -1 })
                .limit(15)
                .select("query category isLead leadContact latencyMs cached createdAt")
                .lean()
        ]);

        // Calculate average latency
        const latencyStats = await AiChatLog.aggregate([
            { $match: { cached: false, latencyMs: { $gt: 0 } } },
            { $group: { _id: null, avgLatency: { $avg: "$latencyMs" } } }
        ]);

        const avgLatency = latencyStats[0]?.avgLatency ? Math.round(latencyStats[0].avgLatency) : 0;

        return NextResponse.json({
            success: true,
            data: {
                totalQueries,
                totalLeads,
                cachedQueries,
                avgLatency,
                categoryStats: categoryStats.map((c: { _id: string; count: number }) => ({
                    category: c._id || "general",
                    count: c.count
                })),
                recentLeads,
                recentQueries
            }
        });
    } catch (error) {
        console.error("Failed to fetch AI analytics insights:", error);
        return NextResponse.json(
            { success: false, error: "Gagal memuat analitik asisten AI." },
            { status: 500 }
        );
    }
}
