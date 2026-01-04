import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// NOTE: Next.js 16 shows deprecation warning for middleware.ts
// Future migration: rename to proxy.ts when ready to migrate
// For now, this pattern still works and is widely used

export default withAuth(
    function middleware(request: NextRequest) {
        const response = NextResponse.next();

        // Security Headers
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-XSS-Protection', '1; mode=block');
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

        // Strict Transport Security (HTTPS only - enable in production)
        if (process.env.NODE_ENV === 'production') {
            response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return response;
    },
    {
        pages: {
            signIn: "/login",
        },
    }
)

export const config = {
    matcher: ["/admin/:path*"]
}
