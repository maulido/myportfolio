import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import dbConnect from "@/lib/db";
import { getGlobalSettings } from "@/lib/settings";
import { getResolvedAssistantAIConfig, getConfiguredProviders, generateAICompletion } from "@/lib/ai";
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
        await dbConnect();

        const convo = await AiConversation.findOne({ sessionId }).lean();
        if (!convo) {
            return NextResponse.json({ success: false, error: "Sesi percakapan tidak ditemukan." }, { status: 404 });
        }

        const settings = await getGlobalSettings();
        const config = getResolvedAssistantAIConfig(settings);

        if (!config.enabled) {
            return NextResponse.json({ success: false, error: "Layanan AI sedang dinonaktifkan." }, { status: 400 });
        }

        // Build conversation transcript
        const transcript = (convo.messages || [])
            .map((m: { sender: string; senderName?: string; content: string }) => {
                const senderLabel = m.sender === "admin" ? "Maulido (Admin)" : (m.sender === "bot" ? "AI Bot" : "Pengunjung");
                return `${senderLabel}: ${m.content}`;
            })
            .join("\n");

        const prompt = `Anda adalah asisten pribadi Maulido (Senior Network & Software Engineer).
Tugas Anda adalah menyusun SATU draf pesan balasan profesional langsung dari Maulido untuk pengunjung website portofolionya.

DATA PENGUNJUNG:
- Nama/Label: ${convo.visitorName || "Pengunjung"}
- Kontak: ${convo.visitorContact || "Belum ditinggalkan"}
- Status Lead: ${convo.isLead ? "Calon Klien / Rekruter / Tawaran Proyek" : "Tanya Jawab Umum"}
- Kategori: ${convo.category}

RIWAYAT PERCAKAPAN:
${transcript || "(Belum ada pesan tambahan dari pengunjung)"}

PETUNJUK PENULISAN DRAF:
1. Tulis pesan dari sudut pandang "Saya" (Maulido).
2. Gunakan bahasa yang sama dengan pesan terakhir pengunjung (Bahasa Indonesia atau English).
3. Nada bicara: Hangat, profesional, rendah hati, percaya diri, dan solutif.
4. Jika pengunjung bertanya tawaran kerja/proyek, sambut dengan antusias dan tawarkan kelanjutan diskusi melalui WhatsApp atau email resmi.
5. Panjang pesan: Singkat dan padat (2-4 kalimat).
6. Tuliskan HANYA isi teks balasannya saja, tanpa salam penutup berlebihan atau tanda kutip tambahan.`;

        const completion = await generateAICompletion({
            provider: config.provider,
            apiKey: config.apiKey,
            baseUrl: config.baseUrl,
            model: config.model,
            prompt,
            maxTokens: 350,
            temperature: 0.7,
            enableFailover: settings.aiAutoFailover !== "false",
            failoverProviders: getConfiguredProviders(settings)
        });

        if (!completion.success) {
            return NextResponse.json({
                success: false,
                error: completion.error || "Gagal menghasilkan draf balasan AI."
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            draft: completion.text.trim()
        });
    } catch (error: unknown) {
        console.error("AI Draft generation error:", error);
        const errMsg = error instanceof Error ? error.message : "Terjadi kesalahan server.";
        return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
    }
}
