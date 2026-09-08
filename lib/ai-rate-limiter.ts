/**
 * AI Rate Limiter & Anti-Abuse Protection Module
 * 
 * Protects AI endpoints from quota exhaustion, scraping, and bot loops
 * using a dual-window sliding tracker (Burst Window + Standard Window).
 */

interface RateLimitRecord {
    timestamps: number[];
}

const windowTracker = new Map<string, RateLimitRecord>();

// Configuration Defaults
export const RATE_LIMIT_CONFIG = {
    // Standard window: Max 20 requests per 10 minutes
    WINDOW_MS: 10 * 60 * 1000,
    MAX_REQUESTS: 20,

    // Burst protection: Max 3 requests per 5 seconds
    BURST_WINDOW_MS: 5 * 1000,
    MAX_BURST: 3,

    // Maximum tracked IPs in memory to prevent memory bloat
    MAX_TRACKED_IPS: 5000,
};

/**
 * Prunes expired entries from tracker
 */
function pruneExpired(now: number): void {
    if (windowTracker.size < RATE_LIMIT_CONFIG.MAX_TRACKED_IPS) return;

    for (const [key, record] of windowTracker.entries()) {
        const valid = record.timestamps.filter(t => now - t < RATE_LIMIT_CONFIG.WINDOW_MS);
        if (valid.length === 0) {
            windowTracker.delete(key);
        } else {
            record.timestamps = valid;
        }
    }
}

export interface RateLimitResult {
    isAllowed: boolean;
    reason?: "limit" | "burst";
    remaining: number;
    resetSeconds: number;
}

/**
 * Checks and increments the rate limit count for a given IP address.
 */
export function checkAiRateLimit(rawIp: string): RateLimitResult {
    const ip = (rawIp || "127.0.0.1").trim();
    const now = Date.now();

    pruneExpired(now);

    let record = windowTracker.get(ip);
    if (!record) {
        record = { timestamps: [] };
        windowTracker.set(ip, record);
    }

    // Filter to standard window
    const validTimestamps = record.timestamps.filter(t => now - t < RATE_LIMIT_CONFIG.WINDOW_MS);
    record.timestamps = validTimestamps;

    // 1. Check Burst Protection (e.g. rapid automated clicks or loop attacks)
    const recentBurst = validTimestamps.filter(t => now - t < RATE_LIMIT_CONFIG.BURST_WINDOW_MS);
    if (recentBurst.length >= RATE_LIMIT_CONFIG.MAX_BURST) {
        const oldestBurst = recentBurst[0] || now;
        const resetSeconds = Math.max(1, Math.ceil((oldestBurst + RATE_LIMIT_CONFIG.BURST_WINDOW_MS - now) / 1000));
        return {
            isAllowed: false,
            reason: "burst",
            remaining: 0,
            resetSeconds
        };
    }

    // 2. Check Standard Window Rate Limit
    if (validTimestamps.length >= RATE_LIMIT_CONFIG.MAX_REQUESTS) {
        const oldest = validTimestamps[0] || now;
        const resetSeconds = Math.max(1, Math.ceil((oldest + RATE_LIMIT_CONFIG.WINDOW_MS - now) / 1000));
        return {
            isAllowed: false,
            reason: "limit",
            remaining: 0,
            resetSeconds
        };
    }

    // Record this request
    validTimestamps.push(now);
    const remaining = Math.max(0, RATE_LIMIT_CONFIG.MAX_REQUESTS - validTimestamps.length);

    return {
        isAllowed: true,
        remaining,
        resetSeconds: Math.ceil(RATE_LIMIT_CONFIG.WINDOW_MS / 1000)
    };
}

/**
 * Creates a graceful Server-Sent Events (SSE) Response explaining the rate limit
 * to the chat widget so it displays nicely instead of a generic network crash.
 */
export function createRateLimitStreamResponse(
    reason: "limit" | "burst",
    resetSeconds: number,
    waNumber: string
): Response {
    const encoder = new TextEncoder();
    const minutes = Math.ceil(resetSeconds / 60);

    const message = reason === "burst"
        ? `⚠️ **Aktivitas Terlalu Cepat Diterima**\n\nSistem mendeteksi pengiriman pesan berturut-turut dalam hitungan detik. Mohon tunggu sekitar ${resetSeconds} detik sebelum mengirim pertanyaan berikutnya.`
        : `⚠️ **Batas Penggunaan Wajar Tercapai**\n\nUntuk menjaga ketersediaan layanan dan mencegah beban berlebih, terdapat batas maksimal ${RATE_LIMIT_CONFIG.MAX_REQUESTS} pesan per 10 menit.\n\nSilakan tunggu sekitar ${minutes} menit lagi, atau hubungi Maulido langsung via [💬 WhatsApp](https://wa.me/${waNumber}) atau [✉️ Kontak](/contact).`;

    const stream = new ReadableStream({
        start(controller) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: message })}\n\n`));
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
        }
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-RateLimit-Limit": String(RATE_LIMIT_CONFIG.MAX_REQUESTS),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(resetSeconds)
        }
    });
}
