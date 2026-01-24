import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admin from "@/models/Admin";

export const dynamic = 'force-dynamic';

/**
 * GET /api/contact-info
 * Get public contact information
 */
export async function GET() {
    try {
        await dbConnect();

        // Get the most recently updated admin
        const admin = await Admin.findOne().sort({ updatedAt: -1 }).select('contactEmail contactPhone contactLocation email');

        if (!admin) {
            // Return default values if no admin found
            return NextResponse.json({
                success: true,
                data: {
                    email: "email@example.com",
                    phone: "+1 (555) 123-4567",
                    location: "Jakarta, Indonesia"
                }
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                email: admin.contactEmail || admin.email || "email@example.com",
                phone: admin.contactPhone || "+1 (555) 123-4567",
                location: admin.contactLocation || "Jakarta, Indonesia"
            }
        });
    } catch (error) {
        console.error("Error fetching contact info:", error);

        // Return default values on error
        return NextResponse.json({
            success: true,
            data: {
                email: "email@example.com",
                phone: "+1 (555) 123-4567",
                location: "Jakarta, Indonesia"
            }
        });
    }
}
