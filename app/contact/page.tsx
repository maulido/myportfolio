import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ContactPageContent } from "@/components/ContactPageContent";
import { getGlobalSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getGlobalSettings();
    const brandName = settings.brandName || "Maulido";
    const title = `Contact & Technical Advisory | ${brandName}`;
    const description = settings.contactHeroSubtitle || "Get in touch for enterprise network engineering, full-stack software architecture, cloud solutions, and technical consulting.";

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "website",
            locale: "en_US",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
    };
}

export default async function ContactPage() {
    const settings = await getGlobalSettings();

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />
            <main className="flex-1 pt-20">
                {/* Breadcrumbs */}
                <div className="container mx-auto px-4 md:px-6 py-4">
                    <Breadcrumb items={[{ label: "Contact" }]} />
                </div>

                {/* Main Contact Hub Experience */}
                <ContactPageContent initialSettings={settings} />
            </main>
        </div>
    );
}
