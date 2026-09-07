import { GoogleGenerativeAI } from "@google/generative-ai";
import { GlobalSettings } from "@/lib/settings";

export interface AIModelItem {
    id: string;
    name: string;
    description?: string;
    contextWindow?: number;
    tag?: string;
    isRecommended?: boolean;
}

export interface AIProviderPreset {
    id: string;
    name: string;
    defaultBaseUrl: string;
    defaultModel: string;
    recommendedModels: { id: string; name: string; tag?: string }[];
    availableModels: AIModelItem[];
    apiKeyHelpUrl?: string;
    isApiKeyRequired: boolean;
    description: string;
}

export const AI_PROVIDERS: Record<string, AIProviderPreset> = {
    gemini: {
        id: "gemini",
        name: "Google Gemini",
        defaultBaseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
        defaultModel: "gemini-flash-lite-latest",
        recommendedModels: [
            { id: "gemini-flash-lite-latest", name: "Gemini Flash Lite", tag: "⚡ Ultra Cepat (<1 detik)" },
            { id: "gemini-3.7-flash", name: "Gemini 3.7 Flash", tag: "Next-Gen 3.7" },
            { id: "gemini-flash-latest", name: "Gemini Flash Latest", tag: "Stabil" },
            { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash", tag: "Next-Gen 3.6" },
            { id: "gemini-pro-latest", name: "Gemini Pro Latest", tag: "Penalaran Flagship" },
        ],
        availableModels: [
            { id: "gemini-flash-lite-latest", name: "Gemini Flash Lite Latest", description: "Varian ultra hemat dan ultra cepat untuk respons chat seketika (<1 detik)", tag: "Paling Cepat", isRecommended: true, contextWindow: 1048576 },
            { id: "gemini-3.7-flash", name: "Gemini 3.7 Flash", description: "Model generasi 3.7 terbaru dari Google dengan kecepatan dan penalaran seimbang", tag: "Next-Gen 3.7", isRecommended: true, contextWindow: 1048576 },
            { id: "gemini-flash-latest", name: "Gemini Flash Latest", description: "Model Gemini Flash teranyar yang selalu update otomatis", tag: "Stabil", isRecommended: true, contextWindow: 1048576 },
            { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash", description: "Model generasi 3.6 Google yang sangat efisien dan stabil", tag: "Next-Gen 3.6", isRecommended: true, contextWindow: 1048576 },
            { id: "gemini-pro-latest", name: "Gemini Pro Latest", description: "Model penalaran mendalam dan analisis konteks masif terbaru", tag: "Penalaran Flagship", isRecommended: true, contextWindow: 2097152 },
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
        availableModels: [
            { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Model pintar, hemat biaya, dan berkecepatan tinggi untuk percakapan harian", tag: "Rekomendasi Utama", isRecommended: true, contextWindow: 128000 },
            { id: "gpt-4o", name: "GPT-4o", description: "Flagship multimodal paling cerdas dari OpenAI", tag: "Flagship", isRecommended: true, contextWindow: 128000 },
            { id: "o3-mini", name: "o3-mini", description: "Model penalaran generasi terbaru dengan kemampuan coding & sains luar biasa", tag: "Penalaran Baru", isRecommended: true, contextWindow: 200000 },
            { id: "o1", name: "o1", description: "Model penalaran mendalam tingkat doktoral untuk masalah kompleks", tag: "Deep Reasoning", contextWindow: 200000 },
            { id: "o1-mini", name: "o1-mini", description: "Model penalaran cepat khusus untuk pemecahan masalah coding dan matematika", tag: "Fast Reasoning", contextWindow: 128000 },
            { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "Model GPT-4 dengan basis pengetahuan luas dan jendela konteks 128k", contextWindow: 128000 },
            { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "Model legasi cepat dan murah", contextWindow: 16385 },
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
        availableModels: [
            { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B Versatile", description: "Model open-source terkuat dari Meta, kecepatan 300+ token/detik di Groq LPU", tag: "Paling Cepat & Bagus", isRecommended: true, contextWindow: 128000 },
            { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B Instant", description: "Kecepatan ekstrim (800+ token/s) dengan latensi nyaris nol", tag: "Ultra Cepat", isRecommended: true, contextWindow: 128000 },
            { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek R1 Distill Llama 70B", description: "Kemampuan berpikir dan penalaran logis DeepSeek R1 yang dioptimalkan di LPU Groq", tag: "Penalaran LPU", isRecommended: true, contextWindow: 128000 },
            { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", description: "Arsitektur Mixture-of-Experts efisien untuk konteks panjang 32k", contextWindow: 32768 },
            { id: "gemma2-9b-it", name: "Gemma 2 9B", description: "Model ringkas efisien dari Google yang berjalan di Groq", contextWindow: 8192 },
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
        availableModels: [
            { id: "deepseek-chat", name: "DeepSeek-V3 (Chat)", description: "Model umum canggih untuk percakapan, coding, dan penulisan teks", tag: "Rekomendasi Utama", isRecommended: true, contextWindow: 64000 },
            { id: "deepseek-reasoner", name: "DeepSeek-R1 (Reasoner)", description: "Model penalaran mendalam berbasis Chain-of-Thought untuk logika dan algoritma", tag: "Penalaran Berpikir", isRecommended: true, contextWindow: 64000 },
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
        availableModels: [
            { id: "meta-llama/llama-3.3-70b-instruct", name: "Meta: Llama 3.3 70B Instruct", description: "Model open source serbaguna berkinerja tinggi", tag: "Populer", isRecommended: true, contextWindow: 131072 },
            { id: "anthropic/claude-3.5-sonnet", name: "Anthropic: Claude 3.5 Sonnet", description: "Standar industri tertinggi untuk penulisan kode dan analisis mendalam", tag: "Flagship", isRecommended: true, contextWindow: 200000 },
            { id: "google/gemini-2.0-flash-exp:free", name: "Google: Gemini 2.0 Flash (Free Tier)", description: "Akses model generasi baru Google secara gratis via OpenRouter", tag: "Gratis", isRecommended: true, contextWindow: 1048576 },
            { id: "deepseek/deepseek-r1", name: "DeepSeek: R1 (Full)", description: "Model penalaran murni DeepSeek 671B", tag: "Reasoning", contextWindow: 163840 },
            { id: "deepseek/deepseek-chat", name: "DeepSeek: V3", description: "DeepSeek V3 chat & coding via OpenRouter", contextWindow: 64000 },
            { id: "mistralai/mistral-large", name: "Mistral: Large", description: "Model flagship multilingual dari Mistral AI", contextWindow: 128000 },
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
        availableModels: [
            { id: "llama3.3", name: "Llama 3.3", description: "Model lokal Meta generasi terbaru", isRecommended: true },
            { id: "llama3", name: "Llama 3 (8B)", description: "Model lokal populer dan stabil", isRecommended: true },
            { id: "deepseek-r1", name: "DeepSeek R1 Local", description: "Model penalaran lokal yang hemat resource", isRecommended: true },
            { id: "qwen2.5", name: "Qwen 2.5", description: "Model lokal sangat kuat untuk multilingual dan coding", isRecommended: true },
            { id: "mistral", name: "Mistral 7B", description: "Model lokal efisien dan ringan" },
            { id: "phi4", name: "Microsoft Phi-4", description: "Model penalaran sains & matematika dari Microsoft" },
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
        availableModels: [
            { id: "custom-model", name: "Custom Model", description: "Gunakan nama model dari server OpenAI-compatible Anda" }
        ],
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
    let model = settings.aiModel?.trim()
        || (provider === "gemini" ? settings.geminiModel?.trim() : "")
        || preset.defaultModel;

    // Auto-normalize if empty, invalid prefix, or known defunct models (1.5-flash, 2.5-flash return 404 on Google API)
    if (provider === "gemini") {
        if (!model || !model.startsWith("gemini-") || model === "gemini-1.5-flash" || model.includes("2.5-flash")) {
            model = preset.defaultModel; // "gemini-flash-latest"
        }
    }

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

        const executeGemini = async (targetModel: string) => {
            const genAI = new GoogleGenerativeAI(apiKey);
            const geminiModel = genAI.getGenerativeModel({
                model: targetModel,
                systemInstruction: options.systemInstruction || undefined
            });

            // Convert messages to Gemini format or single prompt
            if (messages.length === 1 || (messages.length === 2 && messages[0].role === "system")) {
                const userText = messages.find(m => m.role === "user")?.content || options.prompt || "";
                const result = await geminiModel.generateContent(userText);
                return result.response.text().trim();
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
            return result.response.text().trim();
        };

        try {
            const text = await executeGemini(model);
            return {
                success: true,
                text,
                provider,
                model,
                latencyMs: Date.now() - startTime
            };
        } catch (firstError: unknown) {
            const firstErrMsg = firstError instanceof Error ? firstError.message : "Gagal memproses via Google Gemini";
            console.warn(`[GEMINI] Model ${model} encountered error: ${firstErrMsg}`);

            // If the model encounters an error (e.g. 503 high demand or 404), automatically fallback and retry
            const fallbackModel = "gemini-flash-lite-latest";
            const secondaryFallback = "gemini-3.7-flash";
            const targetFallback = model !== fallbackModel ? fallbackModel : secondaryFallback;

            if (model !== targetFallback) {
                try {
                    console.info(`[GEMINI FALLBACK] Model ${model} failed, automatically retrying with ${targetFallback}...`);
                    const text = await executeGemini(targetFallback);
                    return {
                        success: true,
                        text,
                        provider,
                        model: targetFallback,
                        latencyMs: Date.now() - startTime
                    };
                } catch (fallbackError: unknown) {
                    const fallbackErrMsg = fallbackError instanceof Error ? fallbackError.message : "Error pada model fallback";
                    return {
                        success: false,
                        text: "",
                        provider,
                        model: targetFallback,
                        latencyMs: Date.now() - startTime,
                        error: fallbackErrMsg
                    };
                }
            }

            return {
                success: false,
                text: "",
                provider,
                model,
                latencyMs: Date.now() - startTime,
                error: firstErrMsg
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

/**
 * Fetches available models from the provider's remote API,
 * with automatic fallback to verified preset models if offline or no key.
 */
export async function fetchAvailableAIModels(options: {
    provider: string;
    apiKey?: string;
    baseUrl?: string;
}): Promise<{
    success: boolean;
    models: AIModelItem[];
    source: "api" | "preset";
    message?: string;
    error?: string;
}> {
    const provider = options.provider || "gemini";
    const preset = AI_PROVIDERS[provider] || AI_PROVIDERS.gemini;
    const apiKey = options.apiKey?.trim() || "";
    const baseUrl = (options.baseUrl?.trim() || preset.defaultBaseUrl).replace(/\/+$/, "");

    const fallbackModels: AIModelItem[] = preset.availableModels || preset.recommendedModels.map(m => ({
        id: m.id,
        name: m.name,
        tag: m.tag,
        isRecommended: true
    }));

    // If API key is required but not provided (except for ollama), return presets directly
    if (preset.isApiKeyRequired && !apiKey) {
        return {
            success: true,
            models: fallbackModels,
            source: "preset",
            message: `Menampilkan model katalog bawaan. Masukkan API Key dan klik 'Ambil Model dari API' untuk mengambil model aktif akun Anda.`
        };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

    try {
        if (provider === "gemini") {
            // Google Gemini models API
            const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                const errMsg = errData?.error?.message || `HTTP ${res.status} ${res.statusText}`;
                return {
                    success: false,
                    models: fallbackModels,
                    source: "preset",
                    error: `Gagal mengambil model dari Google API (${errMsg}). Menampilkan katalog bawaan.`
                };
            }

            const data = await res.json();
            const rawList = Array.isArray(data?.models) ? data.models : [];

            // Filter models: only generative models that support generateContent
            const models: AIModelItem[] = rawList
                .filter((m: { supportedGenerationMethods?: string[]; name?: string }) => {
                    const methods = m.supportedGenerationMethods || [];
                    const name = m.name || "";
                    return methods.includes("generateContent") && !name.includes("embedding") && !name.includes("aqa");
                })
                .map((m: { name: string; displayName?: string; description?: string; inputTokenLimit?: number }) => {
                    const id = m.name.replace(/^models\//, "");
                    let tag: string | undefined = undefined;
                    let isRec = false;

                    if (id === "gemini-flash-latest") {
                        tag = "Paling Stabil & Cepat";
                        isRec = true;
                    } else if (id === "gemini-flash-lite-latest") {
                        tag = "Ultra Cepat";
                        isRec = true;
                    } else if (id === "gemini-3.7-flash") {
                        tag = "Next-Gen 3.7";
                        isRec = true;
                    } else if (id === "gemini-3.6-flash") {
                        tag = "Next-Gen 3.6";
                        isRec = true;
                    } else if (id === "gemini-pro-latest") {
                        tag = "Penalaran Flagship";
                        isRec = true;
                    } else if (id.includes("3.8-flash")) {
                        tag = "3.8 Flash (High Demand)";
                    } else if (id.includes("flash")) {
                        tag = "Flash";
                        isRec = true;
                    } else if (id.includes("pro")) {
                        tag = "Penalaran";
                        isRec = true;
                    }

                    return {
                        id,
                        name: m.displayName || id,
                        description: m.description,
                        contextWindow: m.inputTokenLimit,
                        tag,
                        isRecommended: isRec
                    };
                })
                .sort((a: AIModelItem, b: AIModelItem) => {
                    const orderPriority = (id: string) => {
                        if (id === "gemini-flash-lite-latest") return 1;
                        if (id === "gemini-3.7-flash") return 2;
                        if (id === "gemini-flash-latest") return 3;
                        if (id === "gemini-3.6-flash") return 4;
                        if (id === "gemini-pro-latest") return 5;
                        if (id.includes("flash")) return 10;
                        if (id.includes("pro")) return 20;
                        return 50;
                    };

                    const pA = orderPriority(a.id);
                    const pB = orderPriority(b.id);
                    if (pA !== pB) return pA - pB;

                    if (a.isRecommended && !b.isRecommended) return -1;
                    if (!a.isRecommended && b.isRecommended) return 1;
                    return a.id.localeCompare(b.id);
                });

            if (models.length === 0) {
                return {
                    success: true,
                    models: fallbackModels,
                    source: "preset",
                    message: "Tidak ada model generatif ditemukan dari API. Menampilkan model bawaan."
                };
            }

            return {
                success: true,
                models,
                source: "api",
                message: `Berhasil mengambil ${models.length} model aktif langsung dari Google Gemini API!`
            };
        }

        if (provider === "ollama") {
            // Ollama local tags API
            const ollamaHost = baseUrl.replace(/\/v1\/?$/, "");
            const res = await fetch(`${ollamaHost}/api/tags`, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!res.ok) {
                return {
                    success: false,
                    models: fallbackModels,
                    source: "preset",
                    error: `Ollama tidak merespons di ${ollamaHost}. Pastikan Ollama sedang berjalan di komputer/server Anda.`
                };
            }

            const data = await res.json();
            const rawModels = Array.isArray(data?.models) ? data.models : [];
            const models: AIModelItem[] = rawModels.map((m: { name: string; details?: { parameter_size?: string } }) => ({
                id: m.name,
                name: m.name,
                description: m.details?.parameter_size ? `Parameter: ${m.details.parameter_size}` : "Model Lokal Ollama",
                isRecommended: true
            }));

            if (models.length === 0) {
                return {
                    success: true,
                    models: fallbackModels,
                    source: "preset",
                    message: "Belum ada model yang di-pull di Ollama. Menampilkan rekomendasi model."
                };
            }

            return {
                success: true,
                models,
                source: "api",
                message: `Berhasil menemukan ${models.length} model lokal dari Ollama!`
            };
        }

        // OpenAI-compatible /models endpoint (OpenAI, Groq, DeepSeek, OpenRouter, Custom)
        const modelsEndpoint = `${baseUrl}/models`;
        const headers: Record<string, string> = {};
        if (apiKey) {
            headers["Authorization"] = `Bearer ${apiKey}`;
        }
        if (provider === "openrouter") {
            headers["HTTP-Referer"] = "https://portfolio-website.local";
        }

        const res = await fetch(modelsEndpoint, { headers, signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const errMsg = errData?.error?.message || `HTTP ${res.status} ${res.statusText}`;
            return {
                success: false,
                models: fallbackModels,
                source: "preset",
                error: `Gagal mengambil model dari ${preset.name} (${errMsg}). Menampilkan katalog bawaan.`
            };
        }

        const data = await res.json();
        const rawList = Array.isArray(data?.data) ? data.data : (Array.isArray(data?.models) ? data.models : []);

        let models: AIModelItem[] = [];

        if (provider === "openai") {
            // Filter chat-capable models
            models = rawList
                .filter((m: { id: string }) => {
                    const id = m.id || "";
                    const isChat = /^(gpt-4|gpt-3\.5|o1|o3|chatgpt)/i.test(id);
                    const isExcluded = /audio|realtime|transcription|whisper|tts|dall-e|embedding|moderation|similarity/i.test(id);
                    return isChat && !isExcluded;
                })
                .map((m: { id: string }) => {
                    const id = m.id;
                    let tag: string | undefined = undefined;
                    let isRecommended = false;
                    if (id === "gpt-4o-mini") { tag = "Hemat & Cepat"; isRecommended = true; }
                    else if (id === "gpt-4o") { tag = "Flagship"; isRecommended = true; }
                    else if (id === "o3-mini") { tag = "Penalaran STEM"; isRecommended = true; }
                    else if (id === "o1" || id === "o1-mini") { tag = "Reasoning"; isRecommended = true; }

                    return {
                        id,
                        name: id,
                        tag,
                        isRecommended
                    };
                })
                .sort((a: AIModelItem, b: AIModelItem) => {
                    if (a.isRecommended && !b.isRecommended) return -1;
                    if (!a.isRecommended && b.isRecommended) return 1;
                    return a.id.localeCompare(b.id);
                });
        } else if (provider === "groq") {
            models = rawList
                .filter((m: { id?: string; active?: boolean }) => {
                    const id = m.id || "";
                    return m.active !== false && !id.toLowerCase().includes("whisper");
                })
                .map((m: { id: string; context_window?: number }) => {
                    const id = m.id;
                    let tag: string | undefined = undefined;
                    let isRecommended = false;
                    if (id.includes("llama-3.3-70b")) { tag = "Direkomendasikan"; isRecommended = true; }
                    else if (id.includes("llama-3.1-8b")) { tag = "Ultra Cepat"; isRecommended = true; }
                    else if (id.includes("r1-distill")) { tag = "Reasoning"; isRecommended = true; }

                    return {
                        id,
                        name: id,
                        contextWindow: m.context_window,
                        tag,
                        isRecommended
                    };
                });
        } else if (provider === "openrouter") {
            models = rawList
                .map((m: { id: string; name?: string; description?: string; context_length?: number; pricing?: { prompt?: string } }) => {
                    const id = m.id;
                    const isFree = id.includes(":free") || m.pricing?.prompt === "0";
                    return {
                        id,
                        name: m.name || id,
                        description: m.description,
                        contextWindow: m.context_length,
                        tag: isFree ? "Free Tier" : undefined,
                        isRecommended: isFree || id.includes("claude-3.5-sonnet") || id.includes("llama-3.3-70b")
                    };
                })
                .slice(0, 100); // Top 100 models
        } else {
            // DeepSeek or Custom OpenAI
            models = rawList.map((m: { id: string; name?: string }) => ({
                id: m.id,
                name: m.name || m.id,
                isRecommended: true
            }));
        }

        if (models.length === 0) {
            return {
                success: true,
                models: fallbackModels,
                source: "preset",
                message: `Tidak ada model ditemukan dari endpoint. Menampilkan model bawaan.`
            };
        }

        return {
            success: true,
            models,
            source: "api",
            message: `Berhasil mengambil ${models.length} model langsung dari API ${preset.name}!`
        };
    } catch (error: unknown) {
        clearTimeout(timeoutId);
        const errMsg = error instanceof Error
            ? (error.name === "AbortError" ? "Koneksi ke endpoint model timeout (12s)" : error.message)
            : "Terjadi kesalahan saat memuat model";

        return {
            success: false,
            models: fallbackModels,
            source: "preset",
            error: `${errMsg}. Menampilkan katalog bawaan.`
        };
    }
}
