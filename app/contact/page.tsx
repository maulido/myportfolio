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

import dbConnect from "@/lib/db";
import Faq from "@/models/Faq";

export const revalidate = 60;

export default async function ContactPage() {
    const settings = await getGlobalSettings();

    let initialFaqs: Array<{
        _id: string;
        question: string;
        question_id?: string;
        answer: string;
        answer_id?: string;
        category?: string;
        order: number;
        published: boolean;
    }> = [];

    try {
        await dbConnect();
        const rawFaqs = await Faq.find({ published: true })
            .sort({ order: 1, createdAt: 1 })
            .lean();

        if (rawFaqs && rawFaqs.length > 0) {
            initialFaqs = rawFaqs.map((f: Record<string, unknown>) => ({
                _id: String(f._id),
                question: String(f.question || ""),
                question_id: f.question_id ? String(f.question_id) : undefined,
                answer: String(f.answer || ""),
                answer_id: f.answer_id ? String(f.answer_id) : undefined,
                category: f.category ? String(f.category) : "General",
                order: typeof f.order === "number" ? f.order : 0,
                published: f.published !== false,
            }));
        }
    } catch (error) {
        console.error("Error fetching FAQs for contact page:", error);
    }

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />
            <main className="flex-1 pt-20">
                {/* Breadcrumbs */}
                <div className="container mx-auto px-4 md:px-6 py-4">
                    <Breadcrumb items={[{ label: "Contact" }]} />
                </div>

                {/* Main Contact Hub Experience */}
                <ContactPageContent initialSettings={settings} initialFaqs={initialFaqs} />
            </main>
        </div>
    );
}
