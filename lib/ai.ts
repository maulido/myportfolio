import { GoogleGenerativeAI } from "@google/generative-ai";
import { GlobalSettings } from "@/lib/settings";

export interface AIProviderPreset {
    id: string;
    name: string;
    defaultBaseUrl: string;
    defaultModel: string;
    recommendedModels: { id: string; name: string; tag?: string }[];
    apiKeyHelpUrl?: string;
    isApiKeyRequired: boolean;
    description: string;
}

export const AI_PROVIDERS: Record<string, AIProviderPreset> = {
    gemini: {
        id: "gemini",
        name: "Google Gemini",
        defaultBaseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
        defaultModel: "gemini-1.5-flash",
        recommendedModels: [
            { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", tag: "Cepat & Gratis" },
            { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", tag: "Penalaran Lanjut" },
            { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", tag: "Next-Gen" },
        ],
        apiKeyHelpUrl: "https://aistudio.google.com/app/apikey",
        isApiKeyRequired: true,
        description: "Model kecerdasan buatan dari Google dengan kuota gratis melimpah di Google AI Studio.",
    },
    openai: {
        id: "openai",
        name: "OpenAI (ChatGPT)",
        defaultBaseUrl: "https://api.openai.com/v1",
        defaultModel: "gpt-4o-mini",
        recommendedModels: [
            { id: "gpt-4o-mini", name: "GPT-4o Mini", tag: "Hemat & Cepat" },
            { id: "gpt-4o", name: "GPT-4o", tag: "Flagship" },
            { id: "o3-mini", name: "o3-mini", tag: "Penalaran STEM" },
            { id: "gpt-4-turbo", name: "GPT-4 Turbo", tag: "Legasi" },
        ],
        apiKeyHelpUrl: "https://platform.openai.com/api-keys",
        isApiKeyRequired: true,
        description: "Standar industri kecerdasan buatan global untuk percakapan alami dan coding.",
    },
    groq: {
        id: "groq",
        name: "Groq (LPU Ultra-Fast)",
        defaultBaseUrl: "https://api.groq.com/openai/v1",
        defaultModel: "llama-3.3-70b-versatile",
        recommendedModels: [
            { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", tag: "Direkomendasikan (Cepat)" },
            { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek R1 Distill 70B", tag: "Reasoning" },
            { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", tag: "Long Context" },
            { id: "gemma2-9b-it", name: "Gemma 2 9B", tag: "Ringan" },
        ],
        apiKeyHelpUrl: "https://console.groq.com/keys",
        isApiKeyRequired: true,
        description: "Hardware LPU berkecepatan 300+ token/detik dengan tier gratis tanpa kartu kredit.",
    },
    deepseek: {
        id: "deepseek",
        name: "DeepSeek",
        defaultBaseUrl: "https://api.deepseek.com/v1",
        defaultModel: "deepseek-chat",
        recommendedModels: [
            { id: "deepseek-chat", name: "DeepSeek-V3 Chat", tag: "Performa Tinggi & Hemat" },
            { id: "deepseek-reasoner", name: "DeepSeek-R1", tag: "Penalaran Berpikir" },
        ],
        apiKeyHelpUrl: "https://platform.deepseek.com/api_keys",
        isApiKeyRequired: true,
        description: "Model open-source terkemuka di dunia dengan kapabilitas matematika dan programming mutakhir.",
    },
    openrouter: {
        id: "openrouter",
        name: "OpenRouter (All-in-One)",
        defaultBaseUrl: "https://openrouter.ai/api/v1",
        defaultModel: "meta-llama/llama-3.3-70b-instruct",
        recommendedModels: [
            { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", tag: "Cepat" },
            { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", tag: "Coding Terbaik" },
            { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash (Free)", tag: "Gratis" },
            { id: "mistralai/mistral-large", name: "Mistral Large", tag: "Multilingual" },
        ],
        apiKeyHelpUrl: "https://openrouter.ai/keys",
        isApiKeyRequired: true,
        description: "Satu API key untuk mengakses ratusan model (Claude, GPT, Llama, Mistral, dll).",
    },
    ollama: {
        id: "ollama",
        name: "Ollama (Local / Offline)",
        defaultBaseUrl: "http://localhost:11434/v1",
        defaultModel: "llama3",
        recommendedModels: [
            { id: "llama3", name: "Llama 3", tag: "Umum" },
            { id: "deepseek-r1", name: "DeepSeek R1", tag: "Local Reasoning" },
            { id: "mistral", name: "Mistral", tag: "Efisien" },
            { id: "qwen2.5", name: "Qwen 2.5", tag: "Coding" },
        ],
        apiKeyHelpUrl: "https://ollama.com",
        isApiKeyRequired: false,
        description: "Jalankan model AI secara offline di komputer/server Anda tanpa API key dan tanpa biaya.",
    },
    custom: {
        id: "custom",
        name: "Custom (OpenAI-Compatible)",
        defaultBaseUrl: "https://api.example.com/v1",
        defaultModel: "custom-model",
        recommendedModels: [],
        apiKeyHelpUrl: "",
        isApiKeyRequired: true,
        description: "Gunakan server LLM kustom (vLLM, LiteLLM, Together AI, Perplexity, dsb).",
    },
};

export interface ResolvedAIConfig {
    provider: string;
    apiKey: string;
    baseUrl: string;
    model: string;
    enabled: boolean;
    customPrompt?: string;
    source: "settings" | "env" | "fallback";
}

export function getResolvedAIConfig(settings: GlobalSettings): ResolvedAIConfig {
    const provider = settings.aiProvider || (settings.geminiApiKey || process.env.GEMINI_API_KEY ? "gemini" : "gemini");
    const preset = AI_PROVIDERS[provider] || AI_PROVIDERS.gemini;

    // Resolve API Key
    let apiKey = settings.aiApiKey?.trim() || "";
    let source: "settings" | "env" | "fallback" = "settings";

    if (!apiKey) {
        if (provider === "gemini" && settings.geminiApiKey?.trim()) {
            apiKey = settings.geminiApiKey.trim();
        } else if (process.env.AI_API_KEY) {
            apiKey = process.env.AI_API_KEY.trim();
            source = "env";
        } else if (provider === "gemini" && process.env.GEMINI_API_KEY) {
            apiKey = process.env.GEMINI_API_KEY.trim();
            source = "env";
        } else if (provider === "openai" && process.env.OPENAI_API_KEY) {
            apiKey = process.env.OPENAI_API_KEY.trim();
            source = "env";
        } else if (provider === "groq" && process.env.GROQ_API_KEY) {
            apiKey = process.env.GROQ_API_KEY.trim();
            source = "env";
        } else {
            source = "fallback";
        }
    }

    // Resolve Model
    const model = settings.aiModel?.trim()
        || (provider === "gemini" ? settings.geminiModel?.trim() : "")
        || preset.defaultModel;

    // Resolve Base URL
    const baseUrl = settings.aiBaseUrl?.trim() || preset.defaultBaseUrl;

    // Resolve Enabled
    const enabled = settings.aiEnabled !== undefined
        ? settings.aiEnabled !== "false"
        : settings.geminiEnabled !== "false";

    // Resolve Custom Prompt
    const customPrompt = settings.aiCustomPrompt?.trim() || settings.geminiCustomPrompt?.trim() || "";

    return {
        provider,
        apiKey,
        baseUrl,
        model,
        enabled,
        customPrompt,
        source
    };
}

export interface AIMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface AICompletionOptions {
    provider?: string;
    apiKey?: string;
    baseUrl?: string;
    model?: string;
    messages?: AIMessage[];
    prompt?: string;
    systemInstruction?: string;
    maxTokens?: number;
    temperature?: number;
}

export interface AICompletionResult {
    success: boolean;
    text: string;
    provider: string;
    model: string;
    latencyMs: number;
    error?: string;
}

/**
 * Universal AI Completion function supporting Google Gemini native SDK
 * and ANY OpenAI-compatible endpoint (OpenAI, Groq, DeepSeek, OpenRouter, Ollama, Custom).
 */
export async function generateAICompletion(options: AICompletionOptions): Promise<AICompletionResult> {
    const startTime = Date.now();
    const provider = options.provider || "gemini";
    const model = options.model || (AI_PROVIDERS[provider]?.defaultModel || "gemini-1.5-flash");
    const baseUrl = (options.baseUrl || AI_PROVIDERS[provider]?.defaultBaseUrl || "").replace(/\/+$/, "");
    const apiKey = options.apiKey?.trim() || "";
    const temperature = options.temperature ?? 0.7;
    const maxTokens = options.maxTokens ?? 1000;

    // Build standard messages array
    const messages: AIMessage[] = [];

    if (options.systemInstruction) {
        messages.push({ role: "system", content: options.systemInstruction });
    }

    if (Array.isArray(options.messages) && options.messages.length > 0) {
        messages.push(...options.messages);
    } else if (options.prompt) {
        messages.push({ role: "user", content: options.prompt });
    }

    if (messages.length === 0) {
        return {
            success: false,
            text: "",
            provider,
            model,
            latencyMs: Date.now() - startTime,
            error: "Prompt atau daftar pesan tidak boleh kosong."
        };
    }

    // 1. Native Google Gemini execution when provider is gemini and no custom base URL is supplied
    if (provider === "gemini" && (!options.baseUrl || options.baseUrl.includes("googleapis.com"))) {
        if (!apiKey) {
            return {
                success: false,
                text: "",
                provider,
                model,
                latencyMs: Date.now() - startTime,
                error: "Google Gemini API Key belum dikonfigurasi."
            };
        }

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const geminiModel = genAI.getGenerativeModel({
                model,
                systemInstruction: options.systemInstruction || undefined
            });

            // Convert messages to Gemini format or single prompt
            if (messages.length === 1 || (messages.length === 2 && messages[0].role === "system")) {
                const userText = messages.find(m => m.role === "user")?.content || options.prompt || "";
                const result = await geminiModel.generateContent(userText);
                const text = result.response.text().trim();
                return {
                    success: true,
                    text,
                    provider,
                    model,
                    latencyMs: Date.now() - startTime
                };
            }

            // Multi-turn conversation
            const history = messages
                .filter(m => m.role !== "system")
                .slice(0, -1)
                .map(m => ({
                    role: m.role === "assistant" ? "model" : "user",
                    parts: [{ text: m.content }]
                }));

            const lastUserMessage = messages[messages.length - 1]?.content || "";

            const chat = geminiModel.startChat({
                history,
                generationConfig: {
                    maxOutputTokens: maxTokens,
                    temperature
                }
            });

            const result = await chat.sendMessage(lastUserMessage);
            const text = result.response.text().trim();

            return {
                success: true,
                text,
                provider,
                model,
                latencyMs: Date.now() - startTime
            };
        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : "Gagal memproses via Google Gemini";
            return {
                success: false,
                text: "",
                provider,
                model,
                latencyMs: Date.now() - startTime,
                error: errMsg
            };
        }
    }

    // 2. Universal OpenAI-compatible Execution (OpenAI, Groq, DeepSeek, OpenRouter, Ollama, Custom)
    const endpoint = `${baseUrl}/chat/completions`;
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };

    if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
    }

    if (provider === "openrouter") {
        headers["HTTP-Referer"] = "https://portfolio-website.local";
        headers["X-Title"] = "Portfolio Assistant";
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

        const response = await fetch(endpoint, {
            method: "POST",
            headers,
            body: JSON.stringify({
                model,
                messages,
                temperature,
                max_tokens: maxTokens
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            let errorDetail = `HTTP ${response.status} ${response.statusText}`;
            try {
                const errData = await response.json();
                errorDetail = errData?.error?.message || errData?.message || JSON.stringify(errData);
            } catch {
                const rawText = await response.text();
                if (rawText) errorDetail = rawText.slice(0, 300);
            }

            return {
                success: false,
                text: "",
                provider,
                model,
                latencyMs: Date.now() - startTime,
                error: `Error dari provider ${AI_PROVIDERS[provider]?.name || provider}: ${errorDetail}`
            };
        }

        const data = await response.json();
        const text = (data.choices?.[0]?.message?.content || data.choices?.[0]?.text || "").trim();

        if (!text) {
            return {
                success: false,
                text: "",
                provider,
                model,
                latencyMs: Date.now() - startTime,
                error: "Provider mengembalikan respons kosong."
            };
        }

        return {
            success: true,
            text,
            provider,
            model,
            latencyMs: Date.now() - startTime
        };
    } catch (error: unknown) {
        const errMsg = error instanceof Error
            ? (error.name === "AbortError" ? "Request timeout setelah 25 detik" : error.message)
            : "Gagal menghubungi endpoint AI";

        return {
            success: false,
            text: "",
            provider,
            model,
            latencyMs: Date.now() - startTime,
            error: `Koneksi gagal (${baseUrl}): ${errMsg}`
        };
    }
}
