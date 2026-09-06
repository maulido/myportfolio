import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";
import { getTelegramCredentials } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function GET() {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const startedAt = Date.now();

    // 1. Check MongoDB
    let dbStatus = "disconnected";
    let dbLatencyMs = -1;
    try {
        const dbStart = Date.now();
        await dbConnect();
        if (mongoose.connection.db) {
            await mongoose.connection.db.admin().ping();
            dbLatencyMs = Date.now() - dbStart;
            dbStatus = "healthy";
        } else {
            dbStatus = "connected_unready";
        }
    } catch {
        dbStatus = "error";
    }

    // 2. Check Telegram Bot API
    let telegramStatus = "disabled";
    let telegramLatencyMs = -1;
    let botUsername = "";
    try {
        const creds = await getTelegramCredentials();
        if (creds.botToken) {
            const tgStart = Date.now();
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const res = await fetch(`https://api.telegram.org/bot${creds.botToken}/getMe`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            telegramLatencyMs = Date.now() - tgStart;

            if (res.ok) {
                const data = await res.json();
                if (data.ok) {
                    telegramStatus = "healthy";
                    botUsername = data.result?.username || "";
                } else {
                    telegramStatus = "invalid_token";
                }
            } else {
                telegramStatus = `http_${res.status}`;
            }
        }
    } catch {
        telegramStatus = "unreachable";
    }

    // 3. Check UploadThing CDN
    let uploadThingStatus = "unknown";
    let uploadThingLatencyMs = -1;
    try {
        const utStart = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch("https://uploadthing.com", {
            method: "HEAD",
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        uploadThingLatencyMs = Date.now() - utStart;
        uploadThingStatus = res.ok || res.status < 400 ? "healthy" : `http_${res.status}`;
    } catch {
        uploadThingStatus = "unreachable";
    }

    // 4. Check GitHub API Rate Limit
    let githubStatus = "healthy";
    let githubRateRemaining = 60;
    let githubRateLimit = 60;
    let githubResetTime = "";
    try {
        const headers: HeadersInit = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Portfolio-Health-Check"
        };
        const token = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN;
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch("https://api.github.com/rate_limit", { 
            headers,
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
            const data = await res.json();
            githubRateRemaining = data.resources?.core?.remaining ?? 60;
            githubRateLimit = data.resources?.core?.limit ?? 60;
            githubResetTime = new Date((data.resources?.core?.reset ?? 0) * 1000).toLocaleTimeString();
        } else {
            githubStatus = `http_${res.status}`;
        }
    } catch {
        githubStatus = "unreachable";
    }

    // 5. SMTP Service Status
    const isSmtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);

    // 6. Node.js Runtime & Memory
    const memory = process.memoryUsage();
    const heapUsedMb = Math.round(memory.heapUsed / 1024 / 1024);
    const heapTotalMb = Math.round(memory.heapTotal / 1024 / 1024);
    const rssMb = Math.round(memory.rss / 1024 / 1024);

    const uptimeSeconds = Math.floor(process.uptime());
    const days = Math.floor(uptimeSeconds / (3600 * 24));
    const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const uptimeFormatted = `${days > 0 ? `${days}d ` : ""}${hours}h ${minutes}m`;

    return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        totalLatencyMs: Date.now() - startedAt,
        database: {
            status: dbStatus,
            latencyMs: dbLatencyMs,
            readyState: mongoose.connection.readyState,
        },
        telegram: {
            status: telegramStatus,
            latencyMs: telegramLatencyMs,
            botUsername
        },
        uploadThing: {
            status: uploadThingStatus,
            latencyMs: uploadThingLatencyMs
        },
        github: {
            status: githubStatus,
            remaining: githubRateRemaining,
            limit: githubRateLimit,
            resetTime: githubResetTime
        },
        smtp: {
            configured: isSmtpConfigured,
            host: process.env.SMTP_HOST || "none"
        },
        runtime: {
            nodeVersion: process.version,
            platform: process.platform,
            environment: process.env.NODE_ENV || "development",
            heapUsedMb,
            heapTotalMb,
            rssMb,
            uptime: uptimeFormatted,
            uptimeSeconds
        }
    });
}
