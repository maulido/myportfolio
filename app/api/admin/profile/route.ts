import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import dbConnect from "@/lib/db";
import Admin from "@/models/Admin";

/**
 * GET /api/admin/profile
 * Get current admin profile
 */
export async function GET() {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        await dbConnect();
        const session = authResult;

        const admin = await Admin.findById(session.user.id).select('-password');

        if (!admin) {
            return NextResponse.json({
                success: false,
                error: "Admin not found"
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                id: admin._id,
                username: admin.username,
                name: admin.name,
                email: admin.email,
                contactEmail: admin.contactEmail,
                contactPhone: admin.contactPhone,
                contactLocation: admin.contactLocation,
                createdAt: admin.createdAt,
                updatedAt: admin.updatedAt
            }
        });
    } catch (error) {
        console.error("Error fetching admin profile:", error);
        return NextResponse.json({
            success: false,
            error: "Failed to fetch profile"
        }, { status: 500 });
    }
}

/**
 * PUT /api/admin/profile
 * Update admin profile (username, name, email)
 */
export async function PUT(req: NextRequest) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        await dbConnect();
        const session = authResult;
        const { username, name, email, contactEmail, contactPhone, contactLocation } = await req.json();

        // Validate input
        if (!username || !name || !email) {
            return NextResponse.json({
                success: false,
                error: "Username, name, and email are required"
            }, { status: 400 });
        }

        // Check if username or email already exists (excluding current user)
        const existingAdmin = await Admin.findOne({
            _id: { $ne: session.user.id },
            $or: [{ username }, { email }]
        });

        if (existingAdmin) {
            if (existingAdmin.username === username) {
                return NextResponse.json({
                    success: false,
                    error: "Username already exists"
                }, { status: 400 });
            }
            if (existingAdmin.email === email) {
                return NextResponse.json({
                    success: false,
                    error: "Email already exists"
                }, { status: 400 });
            }
        }

        // Update admin profile
        const admin = await Admin.findByIdAndUpdate(
            session.user.id,
            { username, name, email, contactEmail, contactPhone, contactLocation },
            { new: true, runValidators: true }
        ).select('-password');

        if (!admin) {
            return NextResponse.json({
                success: false,
                error: "Admin not found"
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully",
            data: {
                id: admin._id,
                username: admin.username,
                name: admin.name,
                email: admin.email,
                contactEmail: admin.contactEmail,
                contactPhone: admin.contactPhone,
                contactLocation: admin.contactLocation,
                updatedAt: admin.updatedAt
            }
        });
    } catch (error) {
        console.error("Error updating admin profile:", error);
        return NextResponse.json({
            success: false,
            error: "Failed to update profile"
        }, { status: 500 });
    }
}
