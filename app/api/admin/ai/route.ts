import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { getGlobalSettings } from "@/lib/settings";
import { getResolvedAIConfig, generateAICompletion } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const settings = await getGlobalSettings();
    const config = getResolvedAIConfig(settings);

    if (!config.enabled) {
        return NextResponse.json(
            {
                success: false,
                error: "Layanan AI saat ini dinonaktifkan di Admin Settings > Integrations."
            },
            { status: 400 }
        );
    }

    if (!config.apiKey && config.provider !== "ollama") {
        return NextResponse.json(
            {
                success: false,
                error: `API Key untuk provider '${config.provider}' belum dikonfigurasi. Silakan atur di Admin Settings > Database & AI Services.`
            },
            { status: 400 }
        );
    }

    try {
        const body = await req.json();
        const { action, text, title, targetLang = "id" } = body;

        if (!action) {
            return NextResponse.json(
                { success: false, error: "Action is required" },
                { status: 400 }
            );
        }

        let prompt = "";
        if (action === "generate_excerpt") {
            prompt = `Anda adalah editor konten teknis untuk seorang Senior Network & Software Engineer.
Buat ringkasan / excerpt singkat (maksimal 2 kalimat, sekitar 140-160 karakter) yang menarik dan informatif untuk artikel atau projek berikut.
Bahasa output: ${targetLang === "id" ? "Bahasa Indonesia" : "English"}.
Judul: "${title || ""}"
Konten:
${(text || "").slice(0, 3000)}

Hanya berikan teks excerpt langsung tanpa pengantar atau tanda kutip.`;
        } else if (action === "translate") {
            const targetLanguageName = targetLang === "id" ? "Bahasa Indonesia" : "English";
            prompt = `Anda adalah penerjemah profesional khusus bidang Software Engineering dan Network Engineering.
Terjemahkan teks berikut ke dalam ${targetLanguageName}.
PENTING:
1. Pertahankan istilah teknis dalam bahasa aslinya (misal: BGP, OSPF, VLAN, Router, Next.js, API, Docker, CI/CD, Frontend, Backend, Database, Cloud, Cache, Latency, Throughput, dll).
2. Buat terjemahan yang natural, profesional, dan akurat untuk portofolio insinyur profesional.
3. Jangan tambahkan penjelasan pembuka atau penutup.

Teks untuk diterjemahkan:
${text}`;
        } else if (action === "generate_tags") {
            prompt = `Berdasarkan teks berikut, buat 5-7 tag / kategori teknologi yang paling relevan (misal: "Next.js", "Cisco", "BGP", "TypeScript", "Docker").
Teks:
${(text || "").slice(0, 2500)}

Keluarkan HANYA daftar tag dipisahkan dengan koma (contoh: Next.js, TypeScript, Network Automation).`;
        } else if (action === "improve_writing") {
            prompt = `Perbaiki dan sempurnakan gaya penulisan teks portofolio berikut agar terdengar lebih profesional, berbobot, dan percaya diri seperti seorang Senior Network & Software Engineer.
Bahasa: ${targetLang === "id" ? "Bahasa Indonesia" : "English"}.
Teks:
${text}

Hanya berikan teks hasil perbaikan tanpa catatan atau pembuka.`;
        } else {
            return NextResponse.json(
                { success: false, error: `Action '${action}' not supported` },
                { status: 400 }
            );
        }

        const completion = await generateAICompletion({
            provider: config.provider,
            apiKey: config.apiKey,
            baseUrl: config.baseUrl,
            model: config.model,
            prompt
        });

        if (!completion.success) {
            return NextResponse.json(
                { success: false, error: completion.error || "Gagal memproses permintaan AI" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            action,
            result: completion.text,
            provider: completion.provider,
            model: completion.model,
            latencyMs: completion.latencyMs
        });
    } catch (error) {
        console.error("Gemini AI API error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Gagal memproses permintaan AI"
            },
            { status: 500 }
        );
    }
}
