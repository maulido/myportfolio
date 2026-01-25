import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
                { role: "model", parts: [{ text: "Understood. I will act as your professional portfolio assistant." }] },
                ...(history || [])
            ],
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
