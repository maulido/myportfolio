"use client";

import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const projects = [
    {
        title: "Project Alpha",
        description: "A comprehensive network monitoring dashboard built with Next.js and real-time data visualization.",
        tags: ["Next.js", "TypeScript", "WebSocket", "TailwindCSS"],
        github: "https://github.com",
        demo: "https://example.com",
        image: "/placeholder-project.jpg" // You'll need to add images to public/ later
    },
    {
        title: "Project Beta",
        description: "Automated network configuration script generator using Python and Flask.",
        tags: ["Python", "Flask", "Network Automation", "Docker"],
        github: "https://github.com",
        demo: null,
        image: "/placeholder-project.jpg"
    },
    {
        title: "Portfolio Website",
        description: "This personal portfolio website featuring SEO best practices and smooth animations.",
        tags: ["Next.js", "React", "Framer Motion", "TailwindCSS"],
        github: "https://github.com",
        demo: "https://example.com",
        image: "/placeholder-project.jpg"
    }
];

export function Projects() {
    return (
        <section id="projects" className="py-16 md:py-24 bg-muted/50">
            <div className="container px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Featured Projects</h2>
                    <p className="mt-4 text-muted-foreground">
                        A selection of projects that demonstrate my skills and experience.
                    </p>
                </motion.div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col"
                        >
                            <div className="aspect-video relative bg-muted flex items-center justify-center">
                                {/* Placeholder for project image */}
                                <span className="text-muted-foreground">Project Image</span>
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                                <h3 className="text-2xl font-semibold leading-none tracking-tight mb-2">{project.title}</h3>
                                <p className="text-sm text-muted-foreground mb-4 flex-1">{project.description}</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {project.tags.map((tag) => (
                                        <span key={tag} className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between pt-4 mt-auto border-t">
                                    <Link
                                        href={project.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <Github className="mr-2 h-4 w-4" />
                                        Code
                                    </Link>
                                    {project.demo && (
                                        <Link
                                            href={project.demo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
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
            </div>
        </section>
    );
}
