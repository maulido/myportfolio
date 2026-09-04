import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `
You are an AI assistant for a professional Portfolio Website. Your job is to answer questions about the portfolio owner (Me). 
Our background: Senior Network Engineer & Developer with expertise in Next.js, React, Node.js, Cisco, and Python.
Location: Jakarta, Indonesia.
Tone: Professional, helpful, and slightly futuristic.

Answer questions based on our skills and experience mentioned above. If questions are unrelated to the portfolio or technical expertise, politely redirect them.
If the GEMINI_API_KEY is not configured, fall back to a helpful simulation mode.
`;

export async function POST(req: Request) {
    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({
            response: "I'm currently running in simulation mode because the API Key is not set. However, I can tell you that the owner is a Senior Network Engineer and Developer based in Jakarta!"
        });
    }

    try {
        const { message, history } = await req.json();

        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: SYSTEM_PROMPT
        });

        // Filter and sanitize history: ensure it starts with user and alternates
        const validHistory: { role: string; parts: { text: string }[] }[] = [];
        if (Array.isArray(history)) {
            for (const item of history) {
                if ((item.role === 'user' || item.role === 'model') && Array.isArray(item.parts) && item.parts.length > 0) {
                    // Skip if consecutive duplicate roles
                    if (validHistory.length === 0 && item.role !== 'user') continue;
                    if (validHistory.length > 0 && validHistory[validHistory.length - 1].role === item.role) continue;
                    validHistory.push(item);
                }
            }
        }

        const chat = model.startChat({
            history: validHistory,
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ response: text });
    } catch (error: unknown) {
        console.error("Gemini API Error:", error);
        return NextResponse.json({ error: "Failed to get response from AI assistant." }, { status: 500 });
    }
}
