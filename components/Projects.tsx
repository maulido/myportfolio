"use client";

import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ProjectSkeleton } from "./Skeleton";

interface IProject {
    _id: string;
    title: string;
    description: string;
    tags: string[];
    github: string;
    demo?: string;
    image?: string;
}

export function Projects() {
    const [projects, setProjects] = useState<IProject[]>([]);
    const [loading, setLoading] = useState(true);

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
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Featured <span className="text-gradient">Projects</span></h2>
                    <p className="mt-4 text-muted-foreground">
                        A selection of projects that demonstrate my skills and experience.
                    </p>
                </motion.div>


                {loading ? (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <ProjectSkeleton key={i} />
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project, index) => (
                            <motion.div
                                key={project._id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ scale: 1.02, rotateX: 2, rotateY: 2, z: 50 }}
                                className="group relative rounded-xl border border-primary/20 bg-card/40 backdrop-blur-sm overflow-hidden flex flex-col transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] transform-gpu perspective-1000"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                <div className="aspect-video relative bg-muted/20 flex items-center justify-center group-hover:bg-muted/30 transition-colors overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                                    {/* Placeholder for project image */}
                                    <div className="text-muted-foreground w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                                        {project.image ? (
                                            <div className="w-full h-full bg-muted/50 flex items-center justify-center text-primary/50">Image</div>
                                        ) : "Project Image"}
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1 relative z-20">
                                    <Link href={`/projects/${project._id}`} className="hover:text-primary transition-colors">
                                        <h3 className="text-2xl font-bold leading-none tracking-tight mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                                    </Link>
                                    <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3 group-hover:text-muted-foreground/80 transition-colors">{project.description}</p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {project.tags.map((tag) => (
                                            <span key={tag} className="inline-flex items-center rounded-md border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-semibold text-primary/80 transition-colors group-hover:border-primary/40 group-hover:bg-primary/10">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between pt-4 mt-auto border-t border-primary/10 group-hover:border-primary/30 transition-colors">
                                        <Link
                                            href={project.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-accent transition-colors"
                                        >
                                            <Github className="mr-2 h-4 w-4" />
                                            Code
                                        </Link>
                                        {project.demo && (
                                            <Link
                                                href={project.demo}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-accent transition-colors"
                                            >
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                Live Demo
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
