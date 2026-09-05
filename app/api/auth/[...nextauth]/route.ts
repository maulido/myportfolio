import NextAuth, { User, Session, NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import { AdapterUser } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rate-limit";

// Rate limit login attempts: 5 attempts per 15 minutes per username/IP
const loginLimiter = rateLimit({
    interval: 15 * 60 * 1000,
    uniqueTokenPerInterval: 500,
});

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours (hardened from default 30 days)
        updateAge: 60 * 60, // 1 hour rolling update
    },
    useSecureCookies: process.env.NODE_ENV === "production",
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const targetKey = credentials?.username
                    ? `login:${credentials.username.trim().toLowerCase()}`
                    : "login:unknown";

                try {
                    await loginLimiter.check(5, targetKey);
                } catch {
                    throw new Error("Too many failed attempts. Account temporarily locked for 15 minutes.");
                }

                await dbConnect();

                const admin = await Admin.findOne({ username: credentials?.username });

                if (admin && credentials?.password) {
                    const isValid = await bcrypt.compare(credentials.password, admin.password);
                    if (isValid) {
                        return {
                            id: admin._id.toString(),
                            name: admin.name,
                            email: admin.email
                        };
                    }
                }

                return null;
            }
        })
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }: { token: JWT; user?: User | AdapterUser }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            if (session.user) {
                (session.user as Session["user"] & { id: string }).id = token.id as string;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
