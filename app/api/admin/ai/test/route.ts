import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { getGlobalSettings } from "@/lib/settings";
import { getResolvedAIConfig, generateAICompletion, AI_PROVIDERS } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        const body = await req.json().catch(() => ({}));
        const inputProvider = body?.provider?.trim();
        const inputKey = body?.apiKey !== undefined ? body.apiKey.trim() : undefined;
        const inputBaseUrl = body?.baseUrl !== undefined ? body.baseUrl.trim() : undefined;
        const inputModel = body?.model !== undefined ? body.model.trim() : undefined;

        // Settings fallback
        const settings = await getGlobalSettings();
        const config = getResolvedAIConfig(settings);

        const provider = inputProvider || config.provider || "gemini";
        const preset = AI_PROVIDERS[provider] || AI_PROVIDERS.gemini;

        const apiKey = inputKey !== undefined ? inputKey : config.apiKey;
        const baseUrl = inputBaseUrl !== undefined && inputBaseUrl !== "" ? inputBaseUrl : (config.baseUrl || preset.defaultBaseUrl);
        const model = inputModel || config.model || preset.defaultModel;

        if (!apiKey && provider !== "ollama") {
            return NextResponse.json(
                {
                    success: false,
                    error: `API Key untuk provider '${preset.name}' diperlukan untuk pengujian.`
                },
                { status: 400 }
            );
        }

        const completion = await generateAICompletion({
            provider,
            apiKey,
            baseUrl,
            model,
            prompt: "Test ping. Balas hanya dengan: 'AI Gateway Operational' singkat tanpa tanda kutip."
        });

        if (!completion.success) {
            return NextResponse.json(
                {
                    success: false,
                    provider,
                    model,
                    error: completion.error || "Gagal menghubungi endpoint AI."
                },
                { status: 400 }
            );
        }

        // Masked key display (e.g. sk-...9xyz)
        const maskedKey = apiKey.length > 8
            ? `${apiKey.slice(0, 5)}...${apiKey.slice(-4)}`
            : (provider === "ollama" ? "No Key Required" : "******");

        return NextResponse.json({
            success: true,
            provider,
            providerName: preset.name,
            model,
            baseUrl,
            latencyMs: completion.latencyMs,
            reply: completion.text,
            maskedKey,
            message: `Koneksi ${preset.name} (${model}) sukses! Latency: ${completion.latencyMs}ms. Status: Operational.`
        });
    } catch (error: unknown) {
        console.error("Universal AI test connection error:", error);
        const message = error instanceof Error ? error.message : "Gagal menguji koneksi AI";
        return NextResponse.json(
            {
                success: false,
                error: message
            },
            { status: 400 }
        );
    }
}
