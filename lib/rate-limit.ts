/**
 * Rate Limiting Utilities
 * In-memory rate limiting for API endpoints
 * For production, consider using Redis
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitRecord {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
        if (now > record.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

/**
 * Check rate limit for a request
 * @param request - Next.js request object
 * @param maxRequests - Maximum requests allowed in window
 * @param windowMs - Time window in milliseconds
 * @returns NextResponse with 429 if rate limited, null otherwise
 */
export function checkRateLimit(
    request: NextRequest,
    maxRequests: number = 10,
    windowMs: number = 60000
): NextResponse | null {
    // Get IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() :
        request.headers.get('x-real-ip') ||
        'unknown';

    // Create unique key for this endpoint + IP
    const endpoint = new URL(request.url).pathname;
    const key = `${ip}:${endpoint}`;

    const now = Date.now();
    const record = rateLimitStore.get(key);

    // No record or expired - create new
    if (!record || now > record.resetTime) {
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + windowMs
        });
        return null;
    }

    // Check if limit exceeded
    if (record.count >= maxRequests) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000);

        return NextResponse.json(
            {
                success: false,
                error: 'Too many requests. Please try again later.',
                retryAfter
            },
            {
                status: 429,
                headers: {
                    'Retry-After': retryAfter.toString(),
                    'X-RateLimit-Limit': maxRequests.toString(),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': record.resetTime.toString()
                }
            }
        );
    }

    // Increment count
    record.count++;

    return null;
}

/**
 * Get rate limit info for response headers
 */
export function getRateLimitHeaders(
    request: NextRequest,
    maxRequests: number = 10,
    windowMs: number = 60000
): Record<string, string> {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() :
        request.headers.get('x-real-ip') ||
        'unknown';

    const endpoint = new URL(request.url).pathname;
    const key = `${ip}:${endpoint}`;
    const record = rateLimitStore.get(key);

    if (!record) {
        return {
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': maxRequests.toString()
        };
    }

    const remaining = Math.max(0, maxRequests - record.count);

    return {
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': record.resetTime.toString()
    };
}
