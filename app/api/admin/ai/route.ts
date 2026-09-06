import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireAuth } from "@/lib/auth-helpers";
import { getGlobalSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const settings = await getGlobalSettings();
    const apiKey = settings.geminiApiKey?.trim() || process.env.GEMINI_API_KEY?.trim();
    const modelName = settings.geminiModel?.trim() || "gemini-1.5-flash";

    if (!apiKey) {
        return NextResponse.json(
            {
                success: false,
                error: "GEMINI_API_KEY belum dikonfigurasi. Silakan atur di Admin Settings > Integrations atau tambahkan ke .env.local untuk mengaktifkan AI Assistant."
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

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: modelName
        });

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

        const result = await model.generateContent(prompt);
        const output = result.response.text().trim();

        return NextResponse.json({
            success: true,
            action,
            result: output
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
