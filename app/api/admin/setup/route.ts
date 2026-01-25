import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        await dbConnect();

        // Check if any admin exists
        const adminCount = await Admin.countDocuments();
        if (adminCount > 0) {
            return NextResponse.json({ message: "Admin already exists. This endpoint is disabled." }, { status: 403 });
        }

        // Create default admin
        const hashedPassword = await bcrypt.hash("admin123", 10);
        await Admin.create({
            username: "admin",
            password: hashedPassword,
            name: "Default Admin",
            email: "admin@example.com"
        });

        return NextResponse.json({
            message: "Success! Default admin created.",
            credentials: {
                username: "admin",
                password: "admin123"
            }
        });
    } catch (error: unknown) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Setup failed"
        }, { status: 500 });
    }
}
