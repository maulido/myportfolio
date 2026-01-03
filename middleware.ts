import { withAuth } from "next-auth/middleware"

// NOTE: Next.js 16 shows deprecation warning for middleware.ts
// Future migration: rename to proxy.ts when ready to migrate
// For now, this pattern still works and is widely used

export default withAuth({
    pages: {
        signIn: "/login",
    },
})

export const config = {
    matcher: ["/admin/:path*"]
}
