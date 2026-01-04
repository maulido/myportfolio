"use client";

import { useEffect, useState } from "react";
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
    Image as ImageIcon
} from "lucide-react";

interface Project {
    _id: string;
    title: string;
    slug: string;
    description: string;
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

    useEffect(() => {
        if (params.slug) {
            fetchProject(params.slug as string);
        }
    }, [params.slug]);

    const fetchProject = async (slug: string) => {
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
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!project) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Breadcrumbs */}
            <div className="container mx-auto px-4 py-6">
                <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-foreground transition-colors">
                        Home
                    </Link>
                    <span>/</span>
                    <Link href="/projects" className="hover:text-foreground transition-colors">
                        Projects
                    </Link>
                    <span>/</span>
                    <span className="text-foreground">{project.title}</span>
                </nav>
            </div>

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-12">
                <Link
                    href="/projects"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Projects
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">{project.title}</h1>

                    {/* Technologies */}
                    {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-8">
                            {project.technologies.map((tech, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Cover Image */}
                    {project.imageUrl && (
                        <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden mb-12">
                            <Image
                                src={project.imageUrl}
                                alt={project.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}
                </motion.div>
            </section>

            {/* Links Section */}
            <section className="container mx-auto px-4 py-8">
                <div className="flex flex-wrap gap-4">
                    {project.githubUrl && (
                        <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <Github className="h-5 w-5" />
                            View Code
                        </a>
                    )}
                    {project.liveUrl && (
                        <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
                        >
                            <ExternalLink className="h-5 w-5" />
                            Live Demo
                        </a>
                    )}
                    {project.caseStudyUrl && (
                        <a
                            href={project.caseStudyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
                        >
                            <FileText className="h-5 w-5" />
                            Case Study
                        </a>
                    )}
                </div>
            </section>

            {/* Overview */}
            <section className="container mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-3xl font-bold mb-6">Overview</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        {project.description}
                    </p>
                </motion.div>
            </section>

            {/* Problem Statement */}
            {project.problemStatement && (
                <section className="container mx-auto px-4 py-12 bg-muted/30 rounded-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl font-bold mb-6">The Problem</h2>
                        <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {project.problemStatement}
                        </p>
                    </motion.div>
                </section>
            )}

            {/* Solution */}
            {project.solutionApproach && (
                <section className="container mx-auto px-4 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl font-bold mb-6">The Solution</h2>
                        <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {project.solutionApproach}
                        </p>
                    </motion.div>
                </section>
            )}

            {/* Architecture */}
            {project.architectureDiagram && (
                <section className="container mx-auto px-4 py-12 bg-muted/30 rounded-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                            <Code2 className="h-8 w-8" />
                            Architecture
                        </h2>
                        <div className="relative w-full h-[400px] md:h-[600px] rounded-lg overflow-hidden">
                            <Image
                                src={project.architectureDiagram}
                                alt="Architecture Diagram"
                                fill
                                className="object-contain bg-background"
                            />
                        </div>
                    </motion.div>
                </section>
            )}

            {/* Screenshots */}
            {project.screenshots && project.screenshots.length > 0 && (
                <section className="container mx-auto px-4 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                            <ImageIcon className="h-8 w-8" />
                            Screenshots
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {project.screenshots.map((screenshot, index) => (
                                <div
                                    key={index}
                                    className="relative w-full h-[300px] rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                                >
                                    <Image
                                        src={screenshot}
                                        alt={`Screenshot ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </section>
            )}

            {/* Related Projects */}
            {project.relatedProjects && project.relatedProjects.length > 0 && (
                <section className="container mx-auto px-4 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl font-bold mb-6">Related Projects</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {project.relatedProjects.map((relatedProject) => (
                                <Link
                                    key={relatedProject._id}
                                    href={`/projects/${relatedProject.slug}`}
                                    className="group border border-border rounded-lg p-6 hover:border-primary transition-colors"
                                >
                                    {relatedProject.imageUrl && (
                                        <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden">
                                            <Image
                                                src={relatedProject.imageUrl}
                                                alt={relatedProject.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform"
                                            />
                                        </div>
                                    )}
                                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                                        {relatedProject.title}
                                    </h3>
                                    <p className="text-muted-foreground line-clamp-2">
                                        {relatedProject.description}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                </section>
            )}
        </div>
    );
}
