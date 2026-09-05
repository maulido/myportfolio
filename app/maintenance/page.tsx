import type { Metadata } from "next";
import MaintenanceView from "@/components/MaintenanceView";
import { getGlobalSettings } from "@/lib/settings";

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

export default async function MaintenancePage() {
    const settings = await getGlobalSettings();

    return <MaintenanceView settings={settings} />;
}
