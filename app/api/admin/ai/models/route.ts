import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { getGlobalSettings } from "@/lib/settings";
import { getResolvedAIConfig, getApiKeyForProvider, fetchAvailableAIModels, AI_PROVIDERS } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        const body = await req.json().catch(() => ({}));
        const inputProvider = body?.provider?.trim();
        const inputKey = body?.apiKey !== undefined ? body.apiKey.trim() : undefined;
        const inputBaseUrl = body?.baseUrl !== undefined ? body.baseUrl.trim() : undefined;

        // Settings fallback
        const settings = await getGlobalSettings();
        const config = getResolvedAIConfig(settings);

        const provider = inputProvider || config.provider || "gemini";
        const preset = AI_PROVIDERS[provider] || AI_PROVIDERS.gemini;

        const resolvedSavedKey = getApiKeyForProvider(settings, provider);
        const apiKey = (inputKey !== undefined && inputKey !== "") ? inputKey : resolvedSavedKey;
        const baseUrl = (inputBaseUrl !== undefined && inputBaseUrl !== "")
            ? inputBaseUrl
            : ((provider === "custom" || provider === "ollama") && settings.aiBaseUrl?.trim() ? settings.aiBaseUrl.trim() : preset.defaultBaseUrl);

        const result = await fetchAvailableAIModels({
            provider,
            apiKey,
            baseUrl
        });

        return NextResponse.json({
            success: result.success,
            provider,
            providerName: preset.name,
            models: result.models,
            source: result.source,
            message: result.message,
            error: result.error
        });
    } catch (error: unknown) {
        console.error("AI Models API error:", error);
        const message = error instanceof Error ? error.message : "Gagal memuat daftar model AI";
        return NextResponse.json(
            {
                success: false,
                error: message
            },
            { status: 500 }
        );
    }
}
