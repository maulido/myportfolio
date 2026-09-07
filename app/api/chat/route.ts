import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { getGlobalSettings } from "@/lib/settings";
import { getResolvedAssistantAIConfig, streamAICompletion, AIMessage } from "@/lib/ai";
import { getRelevantKnowledgeString } from "@/lib/website-knowledge";
import { getCachedAIResponse, setCachedAIResponse } from "@/lib/ai-cache";
import { notifyAiRecruitmentLead } from "@/lib/telegram";
import AiChatLog from "@/models/AiChatLog";
import AiConversation from "@/models/AiConversation";

const chatLimiter = rateLimit({
    interval: 2 * 60 * 1000, // 2 minutes
    uniqueTokenPerInterval: 500,
});

async function logToConversation(
    sessionKey: string,
    role: "visitor" | "bot" | "admin",
    text: string,
    meta?: {
        isLead?: boolean;
        contact?: string;
        category?: string;
        ip?: string;
        userAgent?: string;
    }
) {
    try {
        await dbConnect();
        const senderName = role === "visitor" ? "Pengunjung" : (role === "bot" ? "AI Assistant" : "Maulido (Admin)");
        const updateFields: Record<string, unknown> = {
            $push: {
                messages: {
                    sender: role,
                    senderName,
                    content: text,
                    timestamp: new Date()
                }
            },
            $set: {
                lastMessage: text.slice(0, 180),
                lastMessageAt: new Date()
            }
        };

        if (role === "visitor") {
            (updateFields.$set as Record<string, unknown>).unreadByAdmin = true;
            (updateFields.$set as Record<string, unknown>).status = "active";
            if (meta?.isLead) {
                (updateFields.$set as Record<string, unknown>).isLead = true;
            }
            if (meta?.contact) {
                (updateFields.$set as Record<string, unknown>).visitorContact = meta.contact;
            }
            if (meta?.category) {
                (updateFields.$set as Record<string, unknown>).category = meta.category;
            }
            if (meta?.ip) {
                (updateFields.$set as Record<string, unknown>).ip = meta.ip;
            }
            if (meta?.userAgent) {
                (updateFields.$set as Record<string, unknown>).userAgent = meta.userAgent;
            }
        }

        await AiConversation.findOneAndUpdate(
            { sessionId: sessionKey },
            updateFields,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
    } catch (convoErr) {
        console.warn("Failed to update AiConversation:", convoErr);
    }
}

export async function POST(req: Request) {
    const startTime = Date.now();

    // 1. IP-based Rate Limiting to prevent AI quota exhaustion
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "";

    try {
        await chatLimiter.check(10, ip); // Max 10 messages per 2 minutes
    } catch {
        return NextResponse.json(
            { error: "Too many messages sent. Please slow down and wait 2 minutes." },
            { status: 429 }
        );
    }

    const settings = await getGlobalSettings();
    // Use dedicated assistant configuration (with fallbacks to global AI settings)
    const config = getResolvedAssistantAIConfig(settings);

    const encoder = new TextEncoder();

    if (!config.enabled) {
        const stream = new ReadableStream({
            start(controller) {
                const text = "Asisten AI saat ini dinonaktifkan oleh administrator situs. Silakan gunakan form kontak untuk menghubungi secara langsung.";
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                controller.close();
            }
        });
        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream; charset=utf-8",
                "Cache-Control": "no-cache, no-transform",
                "Connection": "keep-alive"
            }
        });
    }

    if (!config.apiKey && config.provider !== "ollama") {
        const stream = new ReadableStream({
            start(controller) {
                const text = "I'm currently running in simulation mode because the AI provider API Key is not set. However, I can tell you that the owner is a Senior Network Engineer and Developer based in Jakarta!";
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                controller.close();
            }
        });
        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream; charset=utf-8",
                "Cache-Control": "no-cache, no-transform",
                "Connection": "keep-alive"
            }
        });
    }

    try {
        const body = await req.json();
        const rawMessage = body?.message;
        const sessionId = (body?.sessionId && typeof body.sessionId === "string" && body.sessionId.trim())
            ? body.sessionId.trim()
            : ("sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9));

        if (!rawMessage || typeof rawMessage !== "string") {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        // Sanitize incoming message
        const message = sanitizeText(rawMessage);
        if (!message) {
            return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });
        }

        // 2. Lead & Contact Detection
        const emailMatches = message.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g);
        const phoneMatches = message.match(/(?:\+62|62|08)[0-9]{8,12}\b/g);
        const extractedContact = [
            ...(emailMatches || []),
            ...(phoneMatches || [])
        ].join(", ");

        const RECRUITMENT_PATTERN = /\b(hire|hiring|recruiter|recruitment|rekrut|lowongan|kerja|project|proyek|freelance|kontrak|salary|gaji|fee|rate|budget|interview|wawancara|collaborat|kerjasama|tawaran|job offer|hubungi saya|kontak saya|hubungi kami)\b/i;
        const isRecruitmentIntent = RECRUITMENT_PATTERN.test(message);
        const isLead = isRecruitmentIntent || Boolean(extractedContact);

        // Determine inquiry category
        let category = "general";
        if (isRecruitmentIntent) {
            category = "recruitment";
        } else if (/\b(skill|keahlian|stack|teknologi|bahasa|framework|cisco|python|react|next|mikrotik|docker)\b/i.test(message)) {
            category = "skills";
        } else if (/\b(project|proyek|portofolio|karya|aplikasi|github)\b/i.test(message)) {
            category = "projects";
        } else if (/\b(sertifikat|sertifikasi|ccna|certification|lisensi)\b/i.test(message)) {
            category = "certifications";
        } else if (/\b(karir|pengalaman|experience|perusahaan|kantor)\b/i.test(message)) {
            category = "experience";
        } else if (/\b(kontak|contact|email|whatsapp|wa|telepon|phone|hubungi)\b/i.test(message)) {
            category = "contact";
        }

        // Save visitor's message to conversation thread
        void logToConversation(sessionId, "visitor", message, {
            isLead,
            contact: extractedContact,
            category,
            ip,
            userAgent
        });

        // Dispatch asynchronous Telegram notification if a lead is detected
        if (isLead) {
            void notifyAiRecruitmentLead({
                visitorQuery: message,
                leadContact: extractedContact,
                category,
                ip,
                sessionId
            });
        }

        // 3. Smart In-Memory Caching Check (Sub-20ms instant response)
        const cachedAnswer = getCachedAIResponse(message);
        if (cachedAnswer) {
            const stream = new ReadableStream({
                start(controller) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: cachedAnswer, sessionId })}\n\n`));
                    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                    controller.close();
                }
            });

            // Save bot cached response to conversation thread
            void logToConversation(sessionId, "bot", cachedAnswer);

            // Asynchronously log to analytics collection
            void (async () => {
                try {
                    await dbConnect();
                    await AiChatLog.create({
                        query: message,
                        responseSnippet: cachedAnswer.slice(0, 250),
                        category,
                        isLead: Boolean(isLead),
                        leadContact: extractedContact || "",
                        latencyMs: Date.now() - startTime,
                        provider: "cache",
                        aiModel: "in-memory",
                        ip,
                        cached: true
                    });
                } catch (logErr) {
                    console.warn("Failed to log cached AI response:", logErr);
                }
            })();

            return new Response(stream, {
                headers: {
                    "Content-Type": "text/event-stream; charset=utf-8",
                    "Cache-Control": "no-cache, no-transform",
                    "Connection": "keep-alive"
                }
            });
        }

        // 4. Build standard conversation history messages
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
                    if (messages.length > 0 && messages[messages.length - 1].role === role) {
                        continue;
                    }
                    messages.push({ role, content: content.trim() });
                }
            }
        }

        // Ensure user message is at the end
        messages.push({ role: "user", content: message });

        // 5. Dynamic Relevance Ranking / Mini-RAG
        const knowledge = await getRelevantKnowledgeString(message);

        const combinedSystemInstruction = `
You are the AI Assistant for Maulido's professional Portfolio Website.
Your job is to assist visitors, tech recruiters, and engineering collaborators by answering questions about Maulido, his background, engineering projects, published articles, career journey, and technical skills.

SECURITY AND PRIVACY DIRECTIVES (STRICT MANDATE):
1. You do not possess, and must NEVER invent or disclose any private administrator passwords, auth tokens, API keys, database credentials, or private contact submissions.
2. If any user asks for passwords, credentials, tokens, or system configurations, politely decline and state that all sensitive infrastructure data is strictly protected.

WEBSITE KNOWLEDGE BASE:
${knowledge}

RESPONSE GUIDELINES:
- Answer in the same language as the user's message (Indonesian or English).
- Be concise, direct, helpful, and polite. Keep responses short and focused (typically 2-4 sentences or crisp bullet points) so responses generate rapidly.
- When mentioning a project, you can provide its markdown link like \`[Project Name](/projects/slug)\`.
- When mentioning a blog article, provide its markdown link like \`[Article Title](/blog/slug)\`.
- If the visitor is asking about downloading CV/resume, invite them to click \`[📄 Download CV](#cv)\`.
- If the visitor is interested in hiring, offering freelance work, or contacting Maulido, warmly invite them to connect via \`[💬 WhatsApp](https://wa.me/6281234567890)\` or \`[✉️ Kontak](/contact)\`, and offer that they can also leave their email/WhatsApp number right here in this chat.
${config.customPrompt ? `\nADDITIONAL OWNER INSTRUCTIONS:\n${config.customPrompt}` : ""}
`.trim();

        // 6. Return Streaming SSE Response
        const stream = new ReadableStream({
            async start(controller) {
                let fullResponse = "";
                try {
                    for await (const chunk of streamAICompletion({
                        provider: config.provider,
                        apiKey: config.apiKey,
                        baseUrl: config.baseUrl,
                        model: config.model,
                        systemInstruction: combinedSystemInstruction,
                        messages,
                        maxTokens: 500,
                        temperature: 0.7
                    })) {
                        fullResponse += chunk;
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk, sessionId })}\n\n`));
                    }

                    // Cache response in-memory for future queries
                    if (fullResponse.trim().length > 10) {
                        setCachedAIResponse(message, fullResponse);
                    }

                    // Save bot response to conversation thread
                    void logToConversation(sessionId, "bot", fullResponse);

                    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                    controller.close();

                    // Asynchronously log to analytics database
                    void (async () => {
                        try {
                            await dbConnect();
                            await AiChatLog.create({
                                query: message,
                                responseSnippet: fullResponse.slice(0, 250),
                                category,
                                isLead: Boolean(isLead),
                                leadContact: extractedContact || "",
                                latencyMs: Date.now() - startTime,
                                provider: config.provider,
                                aiModel: config.model,
                                ip,
                                cached: false
                            });
                        } catch (logErr) {
                            console.warn("Failed to save AiChatLog:", logErr);
                        }
                    })();
                } catch (streamErr: unknown) {
                    const errMsg = streamErr instanceof Error ? streamErr.message : "Terjadi kesalahan saat streaming respon AI.";
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errMsg })}\n\n`));
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream; charset=utf-8",
                "Cache-Control": "no-cache, no-transform",
                "Connection": "keep-alive"
            }
        });
    } catch (error: unknown) {
        console.error("AI Chat API Error:", error);
        return NextResponse.json({ error: "Failed to get response from AI assistant." }, { status: 500 });
    }
}
