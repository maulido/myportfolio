import { Breadcrumb } from "@/components/Breadcrumb";
import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { ProjectsPageContent } from "@/components/ProjectsPageContent";

export const metadata: Metadata = {
    title: "Projects | Maulido's Portfolio",
    description: "Explore featured software engineering and network engineering projects, open-source repositories, and technical solutions.",
    openGraph: {
        title: "Projects | Maulido's Portfolio",
        description: "Explore featured software engineering and network engineering projects, open-source repositories, and technical solutions.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Projects | Maulido's Portfolio",
        description: "Explore featured software engineering and network engineering projects, open-source repositories, and technical solutions.",
    },
};

export default function ProjectsPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 pt-16">
                {/* Breadcrumbs */}
                <div className="container mx-auto px-4 md:px-6 py-4">
                    <Breadcrumb items={[{ label: "Projects" }]} />
                </div>

                <ProjectsPageContent />
            </main>
        </div>
    );
}
