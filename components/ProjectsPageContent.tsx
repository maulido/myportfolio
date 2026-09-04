"use client";

import { motion } from "framer-motion";
import { ExternalLink, Github, Search, Grid3x3, List, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProjectSkeleton } from "./Skeleton";

interface IProject {
    _id: string;
    title: string;
    slug?: string;
    description: string;
    technologies?: string[];
    tags?: string[];
    githubUrl?: string;
    github?: string;
    demoUrl?: string;
    demo?: string;
    imageUrl?: string;
    image?: string;
}

export function ProjectsPageContent() {
    const [projects, setProjects] = useState<IProject[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<IProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTech, setSelectedTech] = useState<string>("All");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    useEffect(() => {
        async function fetchProjects() {
            try {
                const res = await fetch('/api/projects');
                if (!res.ok) return;
                const data = await res.json();
                if (data.success) {
                    setProjects(data.data);
                    setFilteredProjects(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch projects", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProjects();
    }, []);

    // Get unique technologies safely
    const allTechnologies = ["All", ...new Set(projects.flatMap(p => p.technologies || p.tags || []))];

    // Filter projects
    useEffect(() => {
        let filtered = projects;

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by technology safely
        if (selectedTech !== "All") {
            filtered = filtered.filter(p => {
                const tags = p.technologies || p.tags || [];
                return tags.includes(selectedTech);
            });
        }

        setFilteredProjects(filtered);
    }, [searchQuery, selectedTech, projects]);

    return (
        <section className="py-8 md:py-12 relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        My <span className="text-gradient">Projects</span>
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Explore my portfolio of {projects.length} projects showcasing various technologies and skills.
                    </p>
                </motion.div>

                {/* Search and Filters */}
                <div className="mb-8 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-primary/20 bg-card/40 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    {/* Technology Filter and View Toggle */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                            {allTechnologies.map((tech) => (
                                <button
                                    key={tech}
                                    onClick={() => setSelectedTech(tech)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedTech === tech
                                            ? "bg-primary text-white shadow-lg shadow-primary/25"
                                            : "bg-card/40 border border-primary/20 hover:border-primary/40"
                                        }`}
                                >
                                    {tech}
                                </button>
                            ))}
                        </div>

                        {/* View Toggle */}
                        <div className="flex gap-2 bg-card/40 border border-primary/20 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-primary text-white" : "hover:bg-primary/10"
                                    }`}
                            >
                                <Grid3x3 className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-primary text-white" : "hover:bg-primary/10"
                                    }`}
                            >
                                <List className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <p className="text-sm text-muted-foreground mb-6">
                    Showing {filteredProjects.length} of {projects.length} projects
                </p>

                {/* Projects Grid/List */}
                {loading ? (
                    <div className={viewMode === "grid" ? "grid gap-8 md:grid-cols-2 lg:grid-cols-3" : "space-y-6"}>
                        {[1, 2, 3].map((i) => <ProjectSkeleton key={i} />)}
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <div className="mb-6 p-4 rounded-full bg-muted/30 text-muted-foreground">
                            <Github className="h-12 w-12" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No Projects Found</h3>
                        <p className="text-muted-foreground max-w-md mb-6">
                            Try adjusting your search or filter criteria.
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedTech("All");
                            }}
                            className="px-6 py-3 bg-primary text-white rounded-xl font-bold"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className={viewMode === "grid" ? "grid gap-8 md:grid-cols-2 lg:grid-cols-3" : "space-y-6"}>
                        {filteredProjects.map((project, index) => (
                            <ProjectCard key={project._id} project={project} index={index} viewMode={viewMode} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

function ProjectCard({ project, index, viewMode }: { project: IProject; index: number; viewMode: "grid" | "list" }) {
    const imgSrc = project.imageUrl || project.image;
    const projectSlug = project.slug || project._id;
    const tags = project.technologies || project.tags || [];
    const githubLink = project.githubUrl || project.github;
    const demoLink = project.demoUrl || project.demo;

    if (viewMode === "list") {
        return (
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group flex flex-col md:flex-row gap-6 p-6 rounded-xl border border-border/80 dark:border-primary/20 bg-card/90 dark:bg-card/40 backdrop-blur-sm hover:border-primary/50 shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all"
            >
                <div className="md:w-64 aspect-video bg-muted/20 rounded-lg relative overflow-hidden flex items-center justify-center">
                    {imgSrc ? (
                        <Image
                            src={imgSrc}
                            alt={project.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, 256px"
                        />
                    ) : (
                        <span className="text-muted-foreground text-sm font-medium">{project.title}</span>
                    )}
                </div>
                <div className="flex-1 flex flex-col">
                    <Link href={`/projects/${projectSlug}`} className="hover:text-primary transition-colors">
                        <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                    </Link>
                    <p className="text-muted-foreground mb-4 flex-1">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {tags.map((tag) => (
                            <span key={tag} className="px-2.5 py-0.5 text-xs font-semibold rounded-md border border-primary/20 bg-primary/5 text-primary/80">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        {githubLink && (
                            <Link href={githubLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium hover:text-accent transition-colors">
                                <Github className="mr-2 h-4 w-4" />
                                Code
                            </Link>
                        )}
                        {demoLink && (
                            <Link href={demoLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium hover:text-accent transition-colors">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Live Demo
                            </Link>
                        )}
                        <Link href={`/projects/${projectSlug}`} className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors ml-auto">
                            View Details
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            className="group relative rounded-xl border border-border/80 dark:border-primary/20 bg-card/90 dark:bg-card/40 backdrop-blur-sm overflow-hidden flex flex-col hover:border-primary/50 shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-colors duration-300"
        >
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30 pointer-events-none" />
            <div className="aspect-video relative bg-muted/20 flex items-center justify-center overflow-hidden">
                {imgSrc ? (
                    <Image
                        src={imgSrc}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <span className="text-muted-foreground text-sm font-medium">{project.title}</span>
                )}
            </div>
            <div className="p-6 flex flex-col flex-1">
                <Link href={`/projects/${projectSlug}`} className="hover:text-primary transition-colors">
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                </Link>
                <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((tag) => (
                        <span key={tag} className="px-2.5 py-0.5 text-xs font-semibold rounded-md border border-primary/20 bg-primary/5 text-primary/80">
                            {tag}
                        </span>
                    ))}
                </div>
                <div className="flex items-center justify-between pt-4 mt-auto border-t border-primary/10">
                    {githubLink && (
                        <Link href={githubLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium hover:text-accent transition-colors">
                            <Github className="mr-2 h-4 w-4" />
                            Code
                        </Link>
                    )}
                    {demoLink && (
                        <Link href={demoLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium hover:text-accent transition-colors ml-auto">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Live Demo
                        </Link>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
