import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import dbConnect from "@/lib/db";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";

/**
 * POST /api/admin/change-password
 * Change admin password
 */
export async function POST(req: NextRequest) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        await dbConnect();
        const session = authResult as { user: { id: string } };
        const { currentPassword, newPassword, confirmPassword } = await req.json();

        // Validate input
        if (!currentPassword || !newPassword || !confirmPassword) {
            return NextResponse.json({
                success: false,
                error: "All password fields are required"
            }, { status: 400 });
        }

        // Check if new passwords match
        if (newPassword !== confirmPassword) {
            return NextResponse.json({
                success: false,
                error: "New passwords do not match"
            }, { status: 400 });
        }

        // Validate password strength
        if (newPassword.length < 8) {
            return NextResponse.json({
                success: false,
                error: "Password must be at least 8 characters long"
            }, { status: 400 });
        }

        // Get admin with password
        const admin = await Admin.findById(session.user.id);

        if (!admin) {
            return NextResponse.json({
                success: false,
                error: "Admin not found"
            }, { status: 404 });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, admin.password);

        if (!isValidPassword) {
            return NextResponse.json({
                success: false,
                error: "Current password is incorrect"
            }, { status: 401 });
        }

        // Check if new password is same as current
        const isSamePassword = await bcrypt.compare(newPassword, admin.password);
        if (isSamePassword) {
            return NextResponse.json({
                success: false,
                error: "New password must be different from current password"
            }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        admin.password = hashedPassword;
        await admin.save();

        return NextResponse.json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        console.error("Error changing password:", error);
        return NextResponse.json({
            success: false,
            error: "Failed to change password"
        }, { status: 500 });
    }
}
