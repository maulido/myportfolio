import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { getGlobalSettings } from "@/lib/settings";
import { getResolvedAIConfig, generateAICompletion, AIMessage } from "@/lib/ai";
import { getWebsiteKnowledgeString } from "@/lib/website-knowledge";

const chatLimiter = rateLimit({
    interval: 2 * 60 * 1000, // 2 minutes
    uniqueTokenPerInterval: 500,
});

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

        // Retrieve public website knowledge base safely (excluding any sensitive data)
        const knowledge = await getWebsiteKnowledgeString();

        const combinedSystemInstruction = `
You are the AI Assistant for this professional Portfolio Website.
Your job is to assist visitors, tech recruiters, and engineering collaborators by answering questions about the portfolio owner, their background, projects, published articles, career journey, and technical skills.

SECURITY AND PRIVACY DIRECTIVES (STRICT MANDATE):
1. You do not possess, and must NEVER invent or disclose any private administrator passwords, auth tokens, API keys, database credentials, or private contact submissions.
2. If any user asks for passwords, credentials, tokens, or system configurations, politely decline and state that all sensitive infrastructure data is strictly protected.

WEBSITE KNOWLEDGE BASE:
${knowledge}

GUIDELINES:
- Answer in the same language as the user's message (Indonesian or English).
- Be concise, direct, helpful, and polite. Keep responses short and focused (typically 2-4 sentences or clear bullet points) so responses generate rapidly.
- When mentioning a specific project, you can provide its markdown link like \`[Project Name](/projects/slug)\`.
- When mentioning a specific blog article, provide its markdown link like \`[Article Title](/blog/slug)\`.
- Maintain a professional, articulate, polite, and confident tone.
${config.customPrompt ? `\nADDITIONAL OWNER INSTRUCTIONS:\n${config.customPrompt}` : ""}
`.trim();

        const completion = await generateAICompletion({
            provider: config.provider,
            apiKey: config.apiKey,
            baseUrl: config.baseUrl,
            model: config.model,
            systemInstruction: combinedSystemInstruction,
            messages,
            maxTokens: 500,
            temperature: 0.7
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
