import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
    try {
        await dbConnect();

        // 1. Check if any admin exists - disable immediately if already provisioned
        const adminCount = await Admin.countDocuments();
        if (adminCount > 0) {
            return NextResponse.json(
                { success: false, error: "Setup is permanently disabled. Administrator account already exists." },
                { status: 403 }
            );
        }

        // 2. In production, require an authorization header x-setup-secret
        if (process.env.NODE_ENV === "production") {
            const secretHeader = req.headers.get("x-setup-secret");
            if (!process.env.SETUP_SECRET || secretHeader !== process.env.SETUP_SECRET) {
                return NextResponse.json(
                    { success: false, error: "Forbidden. Setup secret required in production." },
                    { status: 403 }
                );
            }
        }

        // 3. Create default admin using environment variables or secure fallback
        const initialPassword = process.env.INITIAL_ADMIN_PASSWORD || "admin123";
        const hashedPassword = await bcrypt.hash(initialPassword, 10);
        await Admin.create({
            username: "admin",
            password: hashedPassword,
            name: "Portfolio Administrator",
            email: "admin@example.com"
        });

        // 4. Do not leak plaintext password credentials in the response
        return NextResponse.json({
            success: true,
            message: "Success! Initial administrator account created. Please log in and change your credentials immediately."
        });
    } catch (error: unknown) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Setup failed"
        }, { status: 500 });
    }
}
