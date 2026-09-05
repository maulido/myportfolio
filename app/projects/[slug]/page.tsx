"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    ExternalLink,
    Github,
    FileText,
    Code2,
    Image as ImageIcon,
    Star,
    CheckCircle2,
    AlertCircle,
    ChevronRight
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ShareButtons } from "@/components/ShareButtons";
import { SpotlightCard } from "@/components/SpotlightCard";

interface Project {
    _id: string;
    title: string;
    slug: string;
    description: string;
    category?: string;
    problemStatement?: string;
    solutionApproach?: string;
    imageUrl?: string;
    architectureDiagram?: string;
    screenshots?: string[];
    technologies: string[];
    githubUrl?: string;
    liveUrl?: string;
    demoUrl?: string;
    caseStudyUrl?: string;
    featured?: boolean;
    relatedProjects?: Project[];
}

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProject = useCallback(async (slug: string) => {
        try {
            const response = await fetch(`/api/projects/${slug}`);
            const data = await response.json();

            if (data.success) {
                setProject(data.data);
            } else {
                router.push('/projects');
            }
        } catch (error) {
            console.error('Error fetching project:', error);
            router.push('/projects');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        if (params.slug) {
            fetchProject(params.slug as string);
        }
    }, [params.slug, fetchProject]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Loading Architecture...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!project) {
        return null;
    }

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const projectJsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareSourceCode",
        "name": project.title,
        "description": project.description,
        "programmingLanguage": project.technologies,
        "author": {
            "@type": "Person",
            "name": "Maulido"
        },
        "codeRepository": project.githubUrl,
        "url": project.liveUrl || project.demoUrl || `${baseUrl}/projects/${project.slug}`
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 pt-20 pb-20">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
                />

                {/* Breadcrumbs & Navigation */}
                <div className="container mx-auto px-4 md:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Breadcrumb items={[{ label: "Projects", href: "/projects" }, { label: project.title }]} />
                        <Link
                            href="/projects"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>All Projects</span>
                        </Link>
                    </div>
                </div>

                {/* Hero Header */}
                <section className="container mx-auto px-4 md:px-6 pt-4 pb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-4"
                    >
                        <div className="flex flex-wrap items-center gap-2">
                            {project.category && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                    {project.category}
                                </span>
                            )}
                            {project.featured && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                    <Star className="h-3.5 w-3.5 fill-amber-500" /> Featured Solution
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                            {project.title}
                        </h1>

                        <p className="text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed">
                            {project.description}
                        </p>

                        {/* Top Action CTAs */}
                        <div className="pt-2 flex flex-wrap items-center gap-3">
                            {project.githubUrl && (
                                <a
                                    href={project.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-[1.02]"
                                >
                                    <Github className="h-4 w-4" /> View Source Code
                                </a>
                            )}
                            {(project.liveUrl || project.demoUrl) && (
                                <a
                                    href={project.liveUrl || project.demoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-border/80 bg-card text-foreground text-xs font-semibold rounded-xl hover:border-primary/40 hover:bg-muted/50 transition-all"
                                >
                                    <ExternalLink className="h-4 w-4 text-primary" /> Live Demonstration
                                </a>
                            )}
                            {project.caseStudyUrl && (
                                <a
                                    href={project.caseStudyUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-border/80 bg-card text-foreground text-xs font-semibold rounded-xl hover:border-primary/40 hover:bg-muted/50 transition-all"
                                >
                                    <FileText className="h-4 w-4 text-accent" /> In-Depth Case Study
                                </a>
                            )}
                        </div>
                    </motion.div>
                </section>

                {/* Main Showcase Grid */}
                <section className="container mx-auto px-4 md:px-6">
                    <div className="grid gap-10 lg:grid-cols-12">
                        {/* Left: Main Content & Visuals */}
                        <div className="lg:col-span-8 space-y-10">
                            {/* Cover Image */}
                            {project.imageUrl && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border/80 dark:border-white/10 shadow-xl bg-card"
                                >
                                    <Image
                                        src={project.imageUrl}
                                        alt={project.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 1024px) 100vw, 800px"
                                        priority
                                        unoptimized
                                    />
                                </motion.div>
                            )}

                            {/* Problem & Solution Cards */}
                            {(project.problemStatement || project.solutionApproach) && (
                                <div className="grid gap-6 md:grid-cols-2">
                                    {project.problemStatement && (
                                        <SpotlightCard className="p-6 h-full flex flex-col" spotlightColor="rgba(239, 68, 68, 0.12)">
                                            <div className="flex items-center gap-2.5 mb-3 text-red-500">
                                                <AlertCircle className="h-5 w-5" />
                                                <h3 className="font-bold text-base text-foreground">The Challenge & Problem</h3>
                                            </div>
                                            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap flex-1">
                                                {project.problemStatement}
                                            </p>
                                        </SpotlightCard>
                                    )}

                                    {project.solutionApproach && (
                                        <SpotlightCard className="p-6 h-full flex flex-col" spotlightColor="rgba(16, 185, 129, 0.12)">
                                            <div className="flex items-center gap-2.5 mb-3 text-emerald-500">
                                                <CheckCircle2 className="h-5 w-5" />
                                                <h3 className="font-bold text-base text-foreground">Engineered Solution</h3>
                                            </div>
                                            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap flex-1">
                                                {project.solutionApproach}
                                            </p>
                                        </SpotlightCard>
                                    )}
                                </div>
                            )}

                            {/* Architecture Diagram */}
                            {project.architectureDiagram && (
                                <SpotlightCard className="p-6 md:p-8" spotlightColor="rgba(59, 130, 246, 0.12)">
                                    <div className="flex items-center gap-2.5 mb-6 text-primary">
                                        <Code2 className="h-6 w-6" />
                                        <h3 className="font-bold text-lg text-foreground">System Architecture & Topology</h3>
                                    </div>
                                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border/80 bg-background/80 flex items-center justify-center">
                                        <Image
                                            src={project.architectureDiagram}
                                            alt="Architecture Diagram"
                                            fill
                                            className="object-contain p-4"
                                            unoptimized
                                        />
                                    </div>
                                </SpotlightCard>
                            )}

                            {/* Screenshots Gallery */}
                            {project.screenshots && project.screenshots.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <ImageIcon className="h-5 w-5 text-primary" />
                                        <h3 className="text-xl font-bold text-foreground">System Interface & Implementation</h3>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {project.screenshots.map((shot, idx) => (
                                            <div
                                                key={idx}
                                                className="group relative aspect-video rounded-xl overflow-hidden border border-border/80 bg-card hover:border-primary/40 transition-all shadow-xs"
                                            >
                                                <Image
                                                    src={shot}
                                                    alt={`Screenshot ${idx + 1}`}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    unoptimized
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right: Technical Specifications Sidebar */}
                        <div className="lg:col-span-4 space-y-6">
                            <SpotlightCard className="p-6 space-y-6 sticky top-24">
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                                        Technical Specifications
                                    </h3>
                                    <div className="space-y-3.5 text-xs">
                                        {project.category && (
                                            <div className="flex items-center justify-between py-2 border-b border-border/60 dark:border-white/5">
                                                <span className="text-muted-foreground">Domain / Track</span>
                                                <span className="font-semibold text-foreground">{project.category}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between py-2 border-b border-border/60 dark:border-white/5">
                                            <span className="text-muted-foreground">Status</span>
                                            <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                Active & Maintained
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Technologies Used */}
                                {project.technologies && project.technologies.length > 0 && (
                                    <div className="space-y-3">
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            Technologies & Tools
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {project.technologies.map((tech, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-muted/60 dark:bg-muted/40 text-foreground border border-border/60"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Share Project */}
                                <div className="pt-4 border-t border-border/60 dark:border-white/5 space-y-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Share Architecture
                                    </span>
                                    <ShareButtons title={project.title} />
                                </div>
                            </SpotlightCard>
                        </div>
                    </div>
                </section>

                {/* Related Projects */}
                {project.relatedProjects && project.relatedProjects.length > 0 && (
                    <section className="container mx-auto px-4 md:px-6 pt-16">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Related Projects</h2>
                                <p className="text-xs md:text-sm text-muted-foreground mt-1">Explore similar engineering solutions and implementations.</p>
                            </div>
                            <Link href="/projects" className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1">
                                <span>View all</span>
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {project.relatedProjects.map((rel) => (
                                <SpotlightCard key={rel._id} className="p-5 flex flex-col justify-between group hover:scale-[1.02] transition-all">
                                    {rel.imageUrl && (
                                        <div className="relative w-full aspect-video mb-4 rounded-xl overflow-hidden bg-muted/20 border border-border/60">
                                            <Image
                                                src={rel.imageUrl}
                                                alt={rel.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform"
                                                unoptimized
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <Link href={`/projects/${rel.slug}`} className="hover:text-primary transition-colors">
                                            <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
                                                {rel.title}
                                            </h3>
                                        </Link>
                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                                            {rel.description}
                                        </p>
                                    </div>
                                    <Link
                                        href={`/projects/${rel.slug}`}
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline mt-auto"
                                    >
                                        <span>View Specification</span>
                                        <ChevronRight className="h-3 w-3" />
                                    </Link>
                                </SpotlightCard>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
