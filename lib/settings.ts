import dbConnect from "@/lib/db";
import Settings from "@/models/Settings";

export interface GlobalSettings {
    siteTitle?: string;
    siteDescription?: string;
    contactEmail?: string;
    resumeUrl?: string;
    socialGithub?: string;
    socialLinkedin?: string;
    socialTwitter?: string;
    socialInstagram?: string;
    [key: string]: string | undefined;
}

export async function getGlobalSettings(): Promise<GlobalSettings> {
    try {
        await dbConnect();
        const settingsDocs = await Settings.find({});

        const settings: GlobalSettings = {};
        settingsDocs.forEach(doc => {
            if (doc.key) {
                settings[doc.key] = doc.value;
            }
        });

        return settings;
    } catch (error) {
        console.error("Failed to fetch global settings:", error);
        return {};
    }
}
