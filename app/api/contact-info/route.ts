import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admin from "@/models/Admin";
import Settings from "@/models/Settings";

export const dynamic = 'force-dynamic';

/**
 * GET /api/contact-info
 * Get public contact information with full Settings & Profile synchronization
 */
export async function GET() {
    try {
        await dbConnect();

        // Query Settings, AboutMe, and Admin in parallel to resolve the freshest contact info
        const [settingsList, aboutMeSetting, admin] = await Promise.all([
            Settings.find({ key: { $in: ['contactEmail', 'contactPhone', 'contactLocation', 'whatsappNumber'] } }).lean(),
            Settings.findOne({ key: 'aboutMe' }).lean(),
            Admin.findOne().sort({ updatedAt: -1 }).select('contactEmail contactPhone contactLocation email').lean()
        ]);

        const settingsMap: Record<string, unknown> = {};
        if (Array.isArray(settingsList)) {
            settingsList.forEach((s: { key?: string; value?: unknown }) => {
                if (s?.key && s?.value) settingsMap[s.key] = s.value;
            });
        }

        const aboutMe = (aboutMeSetting as { aboutMe?: { email?: string; phone?: string; location?: string } })?.aboutMe || {};

        const email = String(settingsMap.contactEmail || aboutMe.email || admin?.contactEmail || admin?.email || "email@example.com");
        const phone = String(settingsMap.contactPhone || settingsMap.whatsappNumber || aboutMe.phone || admin?.contactPhone || "+1 (555) 123-4567");
        const location = String(settingsMap.contactLocation || aboutMe.location || admin?.contactLocation || "Jakarta, Indonesia");

        return NextResponse.json({
            success: true,
            data: {
                email,
                phone,
                location
            }
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
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
