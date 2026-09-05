import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Navbar } from "@/components/Navbar";
import { AboutDetail } from "@/components/AboutDetail";
import { Experience } from "@/components/Experience";
import { Skills } from "@/components/Skills";
import { Certifications } from "@/components/Certifications";
import { Testimonials } from "@/components/Testimonials";

export const metadata: Metadata = {
    title: "About Me | Maulido - Network & Software Engineer",
    description: "Detailed professional biography, engineering philosophy, technical stack breakdown, and educational credentials of Maulido.",
    openGraph: {
        title: "About Me | Maulido - Network & Software Engineer",
        description: "Detailed professional biography, engineering philosophy, technical stack breakdown, and educational credentials of Maulido.",
        type: "profile",
    },
};

export default function AboutPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />
            <main className="flex-1 pt-20 pb-20">
                {/* Breadcrumbs */}
                <div className="container mx-auto px-4 md:px-6 pb-6">
                    <Breadcrumb items={[{ label: "About" }]} />
                </div>

                {/* In-depth Biography, Engineering Philosophy & Dual Tech Domains */}
                <AboutDetail />

                {/* Experience & Career Milestones */}
                <div className="mt-20">
                    <Experience />
                </div>

                {/* Technical Skills & Endorsements */}
                <div className="mt-20">
                    <Skills defaultMode="detailed" />
                </div>

                {/* Credentials & Certifications */}
                <div className="mt-20">
                    <Certifications />
                </div>

                {/* Testimonials & Endorsements */}
                <div className="mt-20">
                    <Testimonials />
                </div>
            </main>
        </div>
    );
}
