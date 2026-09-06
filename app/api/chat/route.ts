import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { getGlobalSettings } from "@/lib/settings";
import { getResolvedAIConfig, generateAICompletion, AIMessage } from "@/lib/ai";

const chatLimiter = rateLimit({
    interval: 2 * 60 * 1000, // 2 minutes
    uniqueTokenPerInterval: 500,
});

const SYSTEM_PROMPT = `
You are an AI assistant for a professional Portfolio Website. Your job is to answer questions about the portfolio owner (Me). 
Our background: Senior Network Engineer & Developer with expertise in Next.js, React, Node.js, Cisco, and Python.
Location: Jakarta, Indonesia.
Tone: Professional, helpful, and slightly futuristic.

Answer questions based on our skills and experience mentioned above. If questions are unrelated to the portfolio or technical expertise, politely redirect them.
`;

export async function POST(req: Request) {
    // 1. IP-based Rate Limiting to prevent AI quota exhaustion
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    try {
        await chatLimiter.check(10, ip); // Max 10 messages per 2 minutes
    } catch {
        return NextResponse.json(
            { error: "Too many messages sent. Please slow down and wait 2 minutes." },
            { status: 429 }
        );
    }

    const settings = await getGlobalSettings();
    const config = getResolvedAIConfig(settings);

    if (!config.enabled) {
        return NextResponse.json({
            response: "Asisten AI saat ini dinonaktifkan oleh administrator situs. Silakan gunakan form kontak untuk menghubungi secara langsung."
        });
    }

    if (!config.apiKey && config.provider !== "ollama") {
        return NextResponse.json({
            response: "I'm currently running in simulation mode because the AI provider API Key is not set. However, I can tell you that the owner is a Senior Network Engineer and Developer based in Jakarta!"
        });
    }

    try {
        const body = await req.json();
        const rawMessage = body?.message;

        if (!rawMessage || typeof rawMessage !== "string") {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        // Sanitize incoming message
        const message = sanitizeText(rawMessage);
        if (!message) {
            return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });
        }

        // Build standard conversation history messages
        const messages: AIMessage[] = [];
        if (Array.isArray(body?.history)) {
            for (const item of body.history) {
                const role = (item.role === 'model' || item.role === 'assistant') ? 'assistant' : 'user';
                let content = "";
                if (typeof item.content === 'string') {
                    content = item.content;
                } else if (Array.isArray(item.parts)) {
                    content = item.parts.map((p: { text?: string }) => p?.text || "").join("");
                }

                if (content.trim()) {
                    // Prevent consecutive duplicate roles
                    if (messages.length > 0 && messages[messages.length - 1].role === role) {
                        continue;
                    }
                    messages.push({ role, content: content.trim() });
                }
            }
        }

        // Ensure user message is at the end
        messages.push({ role: "user", content: message });

        const completion = await generateAICompletion({
            provider: config.provider,
            apiKey: config.apiKey,
            baseUrl: config.baseUrl,
            model: config.model,
            systemInstruction: config.customPrompt || SYSTEM_PROMPT,
            messages,
            maxTokens: 600
        });

        if (!completion.success) {
            console.error("AI Completion Failed:", completion.error);
            return NextResponse.json(
                { error: completion.error || "Gagal mendapatkan respon dari asisten AI." },
                { status: 500 }
            );
        }

        return NextResponse.json({ response: completion.text });
    } catch (error: unknown) {
        console.error("AI Chat API Error:", error);
        return NextResponse.json({ error: "Failed to get response from AI assistant." }, { status: 500 });
    }
}
