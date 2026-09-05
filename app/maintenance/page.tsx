import { redirect } from "next/navigation";
import type { Metadata } from "next";
import MaintenanceView from "@/components/MaintenanceView";
import { getGlobalSettings } from "@/lib/settings";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getGlobalSettings();
    const title = settings.maintenanceTitle || "System Maintenance | Scheduled Upgrades";
    const description = settings.maintenanceMessage || "Our systems are currently undergoing scheduled maintenance and updates. We will be back online shortly.";

    return {
        title,
        description,
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default async function MaintenancePage({
    searchParams,
}: {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const settings = await getGlobalSettings();
    const isMaintenanceMode = settings.isMaintenanceMode === "true";

    // If site is NOT currently in maintenance mode:
    if (!isMaintenanceMode) {
        const resolvedParams = searchParams ? await searchParams : undefined;
        const isPreview = resolvedParams?.preview === "true";

        // Allow authenticated admins to preview the maintenance screen with ?preview=true
        if (isPreview) {
            const session = await getServerSession(authOptions);
            if (session?.user) {
                return <MaintenanceView settings={settings} />;
            }
        }

        // All other requests are redirected back to the home page
        redirect("/");
    }

    return <MaintenanceView settings={settings} />;
}
