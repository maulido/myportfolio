import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireAuth } from "@/lib/auth-helpers";
import { getGlobalSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        const body = await req.json().catch(() => ({}));
        const inputKey = body?.apiKey?.trim();
        const inputModel = body?.model?.trim();

        // Settings fallback
        const settings = await getGlobalSettings();
        const settingsKey = settings.geminiApiKey?.trim();
        const envKey = process.env.GEMINI_API_KEY?.trim();

        let resolvedKey = "";
        let source: "custom" | "settings" | "env" = "env";

        if (inputKey) {
            resolvedKey = inputKey;
            source = "custom";
        } else if (settingsKey) {
            resolvedKey = settingsKey;
            source = "settings";
        } else if (envKey) {
            resolvedKey = envKey;
            source = "env";
        }

        if (!resolvedKey) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Tidak ada API Key yang ditemukan. Silakan masukkan Gemini API Key terlebih dahulu atau isi di file .env.local."
                },
                { status: 400 }
            );
        }

        const resolvedModel = inputModel || settings.geminiModel?.trim() || "gemini-1.5-flash";

        const startTime = Date.now();
        const genAI = new GoogleGenerativeAI(resolvedKey);
        const aiModel = genAI.getGenerativeModel({ model: resolvedModel });

        const result = await aiModel.generateContent("Balas dengan 'Operational' jika sistem AI berfungsi normal.");
        const reply = result.response.text().trim();
        const latencyMs = Date.now() - startTime;

        // Masked key display (e.g. AIzaSy...9xyz)
        const maskedKey = resolvedKey.length > 8
            ? `${resolvedKey.slice(0, 6)}...${resolvedKey.slice(-4)}`
            : "******";

        return NextResponse.json({
            success: true,
            model: resolvedModel,
            latencyMs,
            reply,
            source,
            maskedKey,
            message: `Koneksi Google Gemini (${resolvedModel}) sukses! Latency: ${latencyMs}ms. Status: Operational.`
        });
    } catch (error: unknown) {
        console.error("Gemini AI test connection error:", error);
        const message = error instanceof Error ? error.message : "Gagal menguji koneksi Gemini AI";
        return NextResponse.json(
            {
                success: false,
                error: message
            },
            { status: 400 }
        );
    }
}
