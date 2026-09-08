import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import dbConnect from "@/lib/db";
import { getGlobalSettings } from "@/lib/settings";
import { getResolvedAIConfig, getConfiguredProviders, generateAICompletion } from "@/lib/ai";
import { sendTelegramMessage, escapeTelegramHtml } from "@/lib/telegram";
import AiConversation from "@/models/AiConversation";
import AiChatLog from "@/models/AiChatLog";

export const dynamic = "force-dynamic";

export async function POST() {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        await dbConnect();
        const settings = await getGlobalSettings();
        const config = getResolvedAIConfig(settings);

        if (!config.enabled) {
            return NextResponse.json({ success: false, error: "Layanan AI sedang dinonaktifkan." }, { status: 400 });
        }

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // 1. Fetch conversations and analytics logs
        const [recentConvos, leadsCount, totalLogs, unreadCount] = await Promise.all([
            AiConversation.find({ lastMessageAt: { $gte: sevenDaysAgo } })
                .sort({ lastMessageAt: -1 })
                .limit(25)
                .lean(),
            AiConversation.countDocuments({ isLead: true }),
            AiChatLog.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
            AiConversation.countDocuments({ unreadByAdmin: true })
        ]);

        const leadConvos = recentConvos.filter((c: { isLead: boolean }) => c.isLead);
        const categoriesCount: Record<string, number> = {};
        for (const c of recentConvos) {
            const cat = c.category || "general";
            categoriesCount[cat] = (categoriesCount[cat] || 0) + 1;
        }

        const recentSamples = recentConvos
            .slice(0, 10)
            .map((c: { lastMessage?: string; isLead?: boolean; category?: string; visitorContact?: string }) => {
                const leadTag = c.isLead ? "[LEAD/REKRUTER]" : "";
                const contactTag = c.visitorContact ? `(${c.visitorContact})` : "";
                return `- ${leadTag} [${c.category || "general"}] ${contactTag} "${c.lastMessage?.slice(0, 100) || ""}"`;
            })
            .join("\n");

        // 2. Synthesize AI Executive Briefing
        const prompt = `Anda adalah Executive Chief of Staff & Advisor untuk Maulido (Senior Network & Software Engineer).
Berdasarkan data interaksi pengunjung website portfolio selama 7 hari terakhir berikut:

METRIK UTAMA:
- Total Obrolan Aktif (7 hari): ${recentConvos.length} sesi
- Total Interaksi AI Query: ${totalLogs} query
- Prospek Rekruter/Klien Aktif: ${leadConvos.length} prospek (Total historis: ${leadsCount})
- Pesan Belum Dibaca Admin: ${unreadCount}
- Distribusi Kategori: ${JSON.stringify(categoriesCount)}

SAMPEL PERTANYAAN TERBARU:
${recentSamples || "Belum ada pertanyaan terbaru."}

TUGAS ANDA:
Buatkan "Executive AI Briefing" yang tajam, percaya diri, dan mudah dibaca cepat di Telegram (Gunakan format teks rapi dengan emoji, poin-poin singkat):
1. 📈 **Highlight Mingguan**: Ringkasan performa dan minat pasar terhadap profil Maulido.
2. 🎯 **Prospek & Kesempatan**: Status rekrutmen/proyek klien dan tindakan yang disarankan.
3. 💡 **Saran Strategis**: Topik atau proyek apa yang sebaiknya ditonjolkan/ditulis artikelnya berikutnya berdasarkan tren pertanyaan pengunjung.`;

        const completion = await generateAICompletion({
            provider: config.provider,
            apiKey: config.apiKey,
            baseUrl: config.baseUrl,
            model: config.model,
            prompt,
            maxTokens: 500,
            temperature: 0.7,
            enableFailover: settings.aiAutoFailover !== "false",
            failoverProviders: getConfiguredProviders(settings)
        });

        const briefingText = completion.success
            ? completion.text.trim()
            : `Ringkasan Otomatis:\n- Obrolan Minggu Ini: ${recentConvos.length} sesi\n- Prospek Klien/Rekruter: ${leadConvos.length}\n- Belum Dibaca: ${unreadCount}`;

        const formattedBriefing = escapeTelegramHtml(briefingText)
            .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
            .replace(/\*([^*]+)\*/g, '<i>$1</i>')
            .replace(/`([^`]+)`/g, '<code>$1</code>');

        const telegramHtml = `<b>📊 LAPORAN EKSEKUTIF AI PORTOFOLIO</b>\n<i>Periode 7 Hari Terakhir</i>\n\n${formattedBriefing}`;

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://maulido.dev';
        const tgResult = await sendTelegramMessage({
            text: telegramHtml,
            inlineKeyboard: [
                [
                    {
                        text: "👉 Buka Admin Live Chat",
                        url: `${baseUrl}/admin/assistant-chats`
                    }
                ]
            ]
        });

        return NextResponse.json({
            success: true,
            message: tgResult.success ? "Laporan eksekutif berhasil dikirim ke Telegram!" : "Laporan dibuat namun Telegram bot belum terkonfigurasi.",
            briefing: briefingText,
            telegramSent: tgResult.success,
            stats: {
                weeklyConversations: recentConvos.length,
                totalLeads: leadsCount,
                unreadByAdmin: unreadCount,
                totalLogs
            }
        });
    } catch (error: unknown) {
        console.error("AI Briefing error:", error);
        const errMsg = error instanceof Error ? error.message : "Gagal membuat laporan eksekutif.";
        return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
    }
}
