import { Metadata } from "next";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import { notFound } from "next/navigation";

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    try {
        const { slug } = await params;
        await dbConnect();
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);
        let project = await Project.findOne({ slug }).lean();
        if (!project && isObjectId) {
            project = await Project.findById(slug).lean();
        }

        if (!project) {
            return {
                title: "Project Not Found | Maulido",
                description: "The requested project could not be found."
            };
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://maulido.dev";
        const title = `${project.title} | Maulido - Portfolio`;
        const description = project.description || "Detailed technical showcase, architecture overview, and engineering solutions.";
        const ogImage = project.imageUrl || `${baseUrl}/projects/${slug}/opengraph-image`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                type: "website",
                url: `${baseUrl}/projects/${slug}`,
                images: [
                    {
                        url: ogImage,
                        width: 1200,
                        height: 630,
                        alt: project.title,
                    }
                ],
            },
            twitter: {
                card: "summary_large_image",
                title,
                description,
                images: [ogImage],
            },
            keywords: project.technologies || ["Software Engineering", "Network Engineering", "Portfolio", "Projects"]
        };
    } catch {
        return {
            title: "Project | Maulido",
            description: "Explore engineering projects and technical solutions."
        };
    }
}

export default async function ProjectLayout({ children, params }: LayoutProps) {
    const { slug } = await params;
    let project = null;

    try {
        await dbConnect();
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);
        project = await Project.findOne({ slug }).lean();
        if (!project && isObjectId) {
            project = await Project.findById(slug).lean();
        }
    } catch (e) {
        console.error("Project Layout fetch error:", e);
    }

    if (!project) {
        return notFound();
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://maulido.dev";

    const projectJsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": project.title,
        "description": project.description,
        "applicationCategory": project.category || "Software Engineering",
        "operatingSystem": "Cross-platform",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "author": {
            "@type": "Person",
            "name": "Maulido",
            "url": baseUrl
        },
        "url": `${baseUrl}/projects/${slug}`,
        "downloadUrl": project.githubUrl || undefined,
        "installUrl": project.liveUrl || undefined,
        "programmingLanguage": project.technologies || []
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
            />
            {children}
        </>
    );
}
