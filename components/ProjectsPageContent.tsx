"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
    ExternalLink, 
    Github, 
    Search, 
    Grid3x3, 
    List, 
    ChevronRight, 
    X,
    Star,
    Layers,
    Code2,
    FolderGit2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { ProjectSkeleton } from "./Skeleton";
import { SpotlightCard } from "./SpotlightCard";
import { useSettings } from "@/lib/useSettings";
import { useLanguage } from "@/context/LanguageContext";
import { getLocalizedField } from "@/lib/localization";

interface IProject {
    _id: string;
    title: string;
    title_id?: string;
    slug?: string;
    description: string;
    description_id?: string;
    category?: string;
    technologies?: string[];
    tags?: string[];
    githubUrl?: string;
    github?: string;
    demoUrl?: string;
    demo?: string;
    imageUrl?: string;
    image?: string;
    featured?: boolean;
}

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#1e293b" offset="20%" />
      <stop stop-color="#334155" offset="50%" />
      <stop stop-color="#1e293b" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#1e293b" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
    typeof window === 'undefined'
        ? Buffer.from(str).toString('base64')
        : window.btoa(str);

const getShimmerDataUrl = (w: number, h: number) =>
    `data:image/svg+xml;base64,${toBase64(shimmer(w, h))}`;

export function ProjectsPageContent() {
    const [projects, setProjects] = useState<IProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [selectedTech, setSelectedTech] = useState<string>("All");
    const [featuredOnly, setFeaturedOnly] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const { get } = useSettings();
    const { dictionary, locale } = useLanguage();

    const heroBadge = locale === 'id' 
        ? get("projectsHeroBadge_id", dictionary.projects.badge) 
        : get("projectsHeroBadge", dictionary.projects.badge);
    const heroTitle = locale === 'id' 
        ? get("projectsHeroTitle_id", dictionary.projects.title) 
        : get("projectsHeroTitle", dictionary.projects.title);
    const heroSubtitle = locale === 'id' 
        ? get("projectsHeroSubtitle_id", dictionary.projects.subtitle) 
        : get("projectsHeroSubtitle", dictionary.projects.subtitle);
    const ctaTitle = locale === 'id' 
        ? get("projectsCtaTitle_id", dictionary.projects.ctaTitle) 
        : get("projectsCtaTitle", dictionary.projects.ctaTitle);
    const ctaSubtitle = locale === 'id' 
        ? get("projectsCtaSubtitle_id", dictionary.projects.ctaSubtitle) 
        : get("projectsCtaSubtitle", dictionary.projects.ctaSubtitle);

    useEffect(() => {
        async function fetchProjects() {
            try {
                const res = await fetch('/api/projects');
                if (!res.ok) return;
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

    // Get unique categories safely
    const categories = useMemo(() => {
        const cats = new Set<string>();
        projects.forEach(p => {
            if (p.category && p.category.trim() !== "") {
                cats.add(p.category);
            }
        });
        return ["All", ...Array.from(cats)];
    }, [projects]);

    // Get top technologies
    const topTechnologies = useMemo(() => {
        const counts: Record<string, number> = {};
        projects.forEach(p => {
            const tags = p.technologies || p.tags || [];
            tags.forEach(t => {
                counts[t] = (counts[t] || 0) + 1;
            });
        });
        // Sort by frequency and pick top 10
        const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
        return ["All", ...sorted.slice(0, 10)];
    }, [projects]);

    // Filter projects
    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            const title = getLocalizedField(project, 'title', locale, project.title);
            const description = getLocalizedField(project, 'description', locale, project.description);

            // Search query
            const matchesSearch = !searchQuery || 
                title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (project.technologies || project.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

            // Category filter
            const matchesCategory = selectedCategory === "All" || project.category === selectedCategory;

            // Tech filter
            const tags = project.technologies || project.tags || [];
            const matchesTech = selectedTech === "All" || tags.includes(selectedTech);

            // Featured filter
            const matchesFeatured = !featuredOnly || Boolean(project.featured);

            return matchesSearch && matchesCategory && matchesTech && matchesFeatured;
        });
    }, [projects, searchQuery, selectedCategory, selectedTech, featuredOnly, locale]);

    const featuredCount = useMemo(() => {
        return projects.filter(p => p.featured).length;
    }, [projects]);

    return (
        <section className="py-8 md:py-16 relative overflow-hidden">
            {/* Background Ambient Glows */}
            <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="absolute bottom-1/4 right-10 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none -z-10" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {/* Header & Stats Banner */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-2xl"
                    >
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-3">
                            <FolderGit2 className="h-3.5 w-3.5" />
                            <span>{heroBadge}</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                            {heroTitle.includes("&") ? (
                                <>
                                    {heroTitle.split("&")[0]} & <span className="text-gradient">{heroTitle.split("&")[1]}</span>
                                </>
                            ) : (
                                <span>{heroTitle}</span>
                            )}
                        </h1>
                        <p className="mt-3 text-base md:text-lg text-muted-foreground leading-relaxed">
                            {heroSubtitle}
                        </p>
                    </motion.div>

                    {/* Quick Metric Pills */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="flex items-center gap-3 self-start lg:self-end flex-wrap"
                    >
                        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm shadow-xs text-xs font-medium">
                            <Layers className="h-4 w-4 text-primary" />
                            <div>
                                <span className="font-bold text-foreground">{projects.length}</span>
                                <span className="text-muted-foreground ml-1">{dictionary.projects.totalWorks}</span>
                            </div>
                        </div>
                        {featuredCount > 0 && (
                            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm shadow-xs text-xs font-medium">
                                <Star className="h-4 w-4 text-amber-500 fill-amber-500/20" />
                                <div>
                                    <span className="font-bold text-foreground">{featuredCount}</span>
                                    <span className="text-muted-foreground ml-1">{dictionary.projects.featuredCount}</span>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm shadow-xs text-xs font-medium">
                            <Code2 className="h-4 w-4 text-emerald-500" />
                            <div>
                                <span className="font-bold text-foreground">{topTechnologies.length - 1}</span>
                                <span className="text-muted-foreground ml-1">{dictionary.projects.techStacks}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Filter & Control Bar */}
                <div className="p-4 md:p-6 rounded-2xl border border-border/80 dark:border-white/10 bg-card/70 backdrop-blur-md shadow-sm mb-10 space-y-5">
                    {/* Search & Mode Toggles */}
                    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder={dictionary.projects.searchPlaceholder}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border border-border/80 dark:border-white/10 bg-background/60 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/60"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted text-muted-foreground"
                                    title="Clear search"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Controls Group */}
                        <div className="flex items-center gap-2.5 self-end md:self-auto flex-wrap">
                            {/* Featured Toggle */}
                            <button
                                onClick={() => setFeaturedOnly(!featuredOnly)}
                                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                                    featuredOnly
                                        ? "bg-amber-500/15 border-amber-500/40 text-amber-500 shadow-xs"
                                        : "border-border/80 bg-background/50 text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <Star className={`h-3.5 w-3.5 ${featuredOnly ? "fill-amber-500" : ""}`} />
                                <span>{dictionary.projects.featuredOnly}</span>
                            </button>

                            {/* View Toggle */}
                            <div className="flex items-center p-1 rounded-xl border border-border/80 dark:border-white/10 bg-background/50">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                        viewMode === "grid" ? "bg-primary text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                                    }`}
                                    title="Grid view"
                                >
                                    <Grid3x3 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                        viewMode === "list" ? "bg-primary text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                                    }`}
                                    title="List view"
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Category Tabs */}
                    {categories.length > 2 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1 shrink-0">
                                {dictionary.projects.categoryLabel}
                            </span>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                                        selectedCategory === cat
                                            ? "bg-primary text-white shadow-sm shadow-primary/25"
                                            : "bg-background/60 border border-border/60 hover:border-primary/40 text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {cat === "All" ? dictionary.projects.filterAll : cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Top Technologies Pill Filter */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-border/60 dark:border-white/5">
                        <span className="text-xs font-semibold text-muted-foreground mr-2 shrink-0">
                            {dictionary.projects.techFilterLabel}
                        </span>
                        {topTechnologies.map((tech) => (
                            <button
                                key={tech}
                                onClick={() => setSelectedTech(tech)}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                                    selectedTech === tech
                                        ? "bg-primary/20 text-primary border border-primary/40 font-semibold"
                                        : "bg-background/40 hover:bg-muted text-muted-foreground border border-border/40 hover:border-primary/20"
                                }`}
                            >
                                {tech === "All" ? dictionary.projects.filterAll : tech}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results Count & Active Filters Indicator */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <p className="text-xs md:text-sm text-muted-foreground font-medium">
                        {dictionary.projects.showing} <span className="font-bold text-foreground">{filteredProjects.length}</span> {dictionary.projects.of} {projects.length} {dictionary.projects.engineeringProjects}
                    </p>
                    {(searchQuery || selectedCategory !== "All" || selectedTech !== "All" || featuredOnly) && (
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedCategory("All");
                                setSelectedTech("All");
                                setFeaturedOnly(false);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                            <X className="h-3.5 w-3.5" />
                            <span>{dictionary.projects.resetFilters}</span>
                        </button>
                    )}
                </div>

                {/* Projects Content: Grid or List */}
                {loading ? (
                    <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
                        {[1, 2, 3, 4, 5, 6].map((i) => <ProjectSkeleton key={i} />)}
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <SpotlightCard className="p-12 md:p-16 text-center max-w-lg mx-auto">
                        <div className="h-14 w-14 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto mb-4">
                            <FolderGit2 className="h-7 w-7" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">{dictionary.projects.noProjectsFound}</h3>
                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                            {dictionary.projects.noProjectsFoundDesc}
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedCategory("All");
                                setSelectedTech("All");
                                setFeaturedOnly(false);
                            }}
                            className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
                        >
                            {dictionary.projects.clearFilters}
                        </button>
                    </SpotlightCard>
                ) : (
                    <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
                        <AnimatePresence mode="popLayout">
                            {filteredProjects.map((project, index) => (
                                <ProjectCard
                                    key={project._id}
                                    project={project}
                                    index={index}
                                    viewMode={viewMode}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Bottom CTA Banner */}
                <div className="mt-16 sm:mt-20">
                    <SpotlightCard className="p-8 sm:p-12 text-center rounded-3xl border border-primary/20 bg-card/60 backdrop-blur-md relative overflow-hidden">
                        <div className="max-w-2xl mx-auto space-y-4">
                            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                                {ctaTitle}
                            </h3>
                            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                {ctaSubtitle}
                            </p>
                            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    <span>{dictionary.projects.connectCta}</span>
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </SpotlightCard>
                </div>
            </div>
        </section>
    );
}

function ProjectCard({ 
    project, 
    index, 
    viewMode 
}: { 
    project: IProject; 
    index: number; 
    viewMode: "grid" | "list" 
}) {
    const { dictionary, locale } = useLanguage();
    const imgSrc = project.imageUrl || project.image;
    const projectSlug = project.slug || project._id;
    const tags = project.technologies || project.tags || [];
    const githubLink = project.githubUrl || project.github;
    const demoLink = project.demoUrl || project.demo;

    const title = getLocalizedField(project, 'title', locale, project.title);
    const description = getLocalizedField(project, 'description', locale, project.description);

    if (viewMode === "list") {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
            >
                <SpotlightCard className="p-5 md:p-6 group hover:scale-[1.01] transition-all duration-300">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                        {/* Thumbnail */}
                        <div className="w-full md:w-56 aspect-video bg-muted/20 rounded-xl relative overflow-hidden shrink-0 flex items-center justify-center border border-border/60">
                            {imgSrc ? (
                                <Image
                                    src={imgSrc}
                                    alt={title}
                                    fill
                                    placeholder="blur"
                                    blurDataURL={getShimmerDataUrl(400, 240)}
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="(max-width: 768px) 100vw, 224px"
                                    unoptimized
                                />
                            ) : (
                                <div className="text-xs font-semibold text-muted-foreground p-3 text-center">
                                    {title}
                                </div>
                            )}
                            {project.category && (
                                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-background/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-foreground border border-border/50">
                                    {project.category}
                                </span>
                            )}
                        </div>

                        {/* Info & Description */}
                        <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Link href={`/projects/${projectSlug}`} className="hover:text-primary transition-colors">
                                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                        {title}
                                    </h3>
                                </Link>
                                {project.featured && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[10px] font-bold border border-amber-500/20">
                                        <Star className="h-3 w-3 fill-amber-500" /> {dictionary.projects.featured}
                                    </span>
                                )}
                            </div>

                            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                {description}
                            </p>

                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {tags.slice(0, 5).map((tag) => (
                                    <span key={tag} className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-muted/60 dark:bg-muted/40 text-muted-foreground border border-border/50">
                                        {tag}
                                    </span>
                                ))}
                                {tags.length > 5 && (
                                    <span className="text-[10px] text-muted-foreground/60 self-center">
                                        +{tags.length - 5} more
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex md:flex-col items-center gap-2.5 shrink-0 self-stretch md:self-center justify-between md:justify-center border-t md:border-t-0 md:border-l border-border/60 dark:border-white/5 pt-3 md:pt-0 md:pl-6">
                            <div className="flex items-center gap-3">
                                {githubLink && (
                                    <a
                                        href={githubLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                        title={dictionary.projects.sourceCode}
                                    >
                                        <Github className="h-4 w-4" />
                                    </a>
                                )}
                                {demoLink && (
                                    <a
                                        href={demoLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                                        title={dictionary.projects.liveDemo}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                )}
                            </div>
                            <Link
                                href={`/projects/${projectSlug}`}
                                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-all group-hover:gap-1.5"
                            >
                                <span>{dictionary.projects.details}</span>
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>
                </SpotlightCard>
            </motion.div>
        );
    }

    // Grid View
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
            className="h-full"
        >
            <SpotlightCard className="h-full flex flex-col group hover:scale-[1.02] transition-all duration-300">
                {/* Image Container */}
                <div className="aspect-video relative bg-muted/20 flex items-center justify-center overflow-hidden border-b border-border/60 dark:border-white/5">
                    {imgSrc ? (
                        <Image
                            src={imgSrc}
                            alt={title}
                            fill
                            placeholder="blur"
                            blurDataURL={getShimmerDataUrl(600, 340)}
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            unoptimized
                        />
                    ) : (
                        <div className="text-muted-foreground w-full h-full flex items-center justify-center font-medium text-sm p-4 text-center">
                            {title}
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

                    {/* Badges on Top */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20 pointer-events-none">
                        {project.category ? (
                            <span className="px-2.5 py-1 rounded-md bg-background/85 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-foreground border border-border/50 shadow-xs">
                                {project.category}
                            </span>
                        ) : <span />}

                        {project.featured && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/90 backdrop-blur-md text-slate-950 text-[10px] font-extrabold shadow-sm">
                                <Star className="h-3 w-3 fill-slate-950" /> {dictionary.projects.featured}
                            </span>
                        )}
                    </div>
                </div>

                {/* Content Container */}
                <div className="p-6 flex flex-col flex-1">
                    <Link href={`/projects/${projectSlug}`} className="hover:text-primary transition-colors mb-2">
                        <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {title}
                        </h3>
                    </Link>

                    <p className="text-xs md:text-sm text-muted-foreground mb-4 flex-1 line-clamp-3 leading-relaxed">
                        {description}
                    </p>

                    {/* Tech Pills */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                        {tags.slice(0, 4).map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-muted/60 dark:bg-muted/40 text-muted-foreground border border-border/50 group-hover:border-primary/30 transition-colors"
                            >
                                {tag}
                            </span>
                        ))}
                        {tags.length > 4 && (
                            <span className="text-[10px] text-muted-foreground/60 self-center">
                                +{tags.length - 4} more
                            </span>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-4 mt-auto border-t border-border/60 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            {githubLink && (
                                <a
                                    href={githubLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Github className="h-4 w-4" />
                                    <span>{dictionary.projects.code}</span>
                                </a>
                            )}
                            {demoLink && (
                                <a
                                    href={demoLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    <span>{dictionary.projects.live}</span>
                                </a>
                            )}
                        </div>

                        <Link
                            href={`/projects/${projectSlug}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-all group-hover:gap-1.5"
                        >
                            <span>{dictionary.projects.details}</span>
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </SpotlightCard>
        </motion.div>
    );
}
