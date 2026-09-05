"use client";

import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProjectSkeleton } from "./Skeleton";
import { getShimmerDataUrl } from "@/lib/image-utils";
import { SpotlightCard } from "./SpotlightCard";
import { useLanguage } from "@/context/LanguageContext";
import { getLocalizedField } from "@/lib/localization";

interface IProject {
    _id: string;
    title: string;
    title_id?: string;
    slug?: string;
    description: string;
    description_id?: string;
    technologies?: string[];
    tags?: string[];
    githubUrl?: string;
    github?: string;
    demoUrl?: string;
    demo?: string;
    imageUrl?: string;
    image?: string;
}

export function Projects() {
    const [projects, setProjects] = useState<IProject[]>([]);
    const [loading, setLoading] = useState(true);
    const { dictionary, locale } = useLanguage();

    useEffect(() => {
        async function fetchProjects() {
            try {
                const res = await fetch('/api/projects');
                if (!res.ok) {
                    const text = await res.text();
                    console.error("API error response:", text);
                    return;
                }
                const data = await res.json();
                if (data.success) {
                    setProjects(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch projects", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProjects();
    }, []);

    return (
        <section id="projects" className="py-16 md:py-24 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-1/2 left-1/4 h-[300px] w-[300px] rounded-full bg-primary/10 blur-[80px] pointer-events-none" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                        {locale === 'id' ? (
                            <>Koleksi <span className="text-gradient">Proyek Rekayasa</span></>
                        ) : (
                            <>Featured <span className="text-gradient">Projects</span></>
                        )}
                    </h2>
                    <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                        {dictionary.projects.subtitle}
                    </p>
                </motion.div>


                {loading ? (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <ProjectSkeleton key={i} />
                        ))}
                    </div>
                ) : projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <div className="mb-6 p-4 rounded-full bg-muted/30 text-muted-foreground">
                            <Github className="h-12 w-12" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{dictionary.projects.noProjectsYet}</h3>
                        <p className="text-muted-foreground max-w-md mb-6">
                            {dictionary.projects.noProjectsYetDesc}
                        </p>
                        <a
                            href="https://github.com/maulido"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                        >
                            <Github className="h-5 w-5" />
                            {dictionary.projects.viewGithub}
                        </a>
                    </div>
                ) : (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project, index) => {
                            const imgSrc = project.imageUrl || project.image;
                            const projectSlug = project.slug || project._id;
                            const tags = project.technologies || project.tags || [];
                            const githubLink = project.githubUrl || project.github;
                            const demoLink = project.demoUrl || project.demo;
                            const title = getLocalizedField(project, 'title', locale, project.title);
                            const description = getLocalizedField(project, 'description', locale, project.description);

                            return (
                                <motion.div
                                    key={project._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    className="h-full"
                                >
                                    <SpotlightCard className="h-full flex flex-col">
                                        <div className="aspect-video relative bg-muted/20 flex items-center justify-center group-hover:bg-muted/30 transition-colors overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                                            {imgSrc ? (
                                                <Image
                                                    src={imgSrc}
                                                    alt={title}
                                                    fill
                                                    placeholder="blur"
                                                    blurDataURL={getShimmerDataUrl(600, 340)}
                                                    className="object-cover group-hover:scale-108 transition-transform duration-700"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="text-muted-foreground w-full h-full flex items-center justify-center group-hover:scale-108 transition-transform duration-700 font-medium text-sm">
                                                    {title}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6 flex flex-col flex-1 relative z-20">
                                            <Link href={`/projects/${projectSlug}`} className="hover:text-primary transition-colors">
                                                <h3 className="text-2xl font-bold leading-none tracking-tight mb-2 group-hover:text-primary transition-colors">{title}</h3>
                                            </Link>
                                            <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3 group-hover:text-muted-foreground/90 transition-colors">{description}</p>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {tags.map((tag) => (
                                                    <span key={tag} className="inline-flex items-center rounded-md border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-semibold text-primary/80 transition-all hover:scale-105 hover:bg-primary/15 hover:border-primary/40 cursor-default select-none">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between pt-4 mt-auto border-t border-primary/10 group-hover:border-primary/25 transition-colors">
                                                {githubLink && (
                                                    <Link
                                                        href={githubLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors group/link"
                                                    >
                                                        <Github className="mr-2 h-4 w-4" />
                                                        <span>{dictionary.projects.code}</span>
                                                    </Link>
                                                )}
                                                {demoLink && (
                                                    <Link
                                                        href={demoLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors ml-auto group/link"
                                                    >
                                                        <span>{dictionary.projects.liveDemo}</span>
                                                        <ExternalLink className="ml-1.5 h-3.5 w-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </SpotlightCard>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
