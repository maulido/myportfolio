"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Award,
    Calendar,
    Code2,
    Database,
    Network,
    Layers,
    Cpu,
    Sparkles,
    Search,
    X,
    ThumbsUp,
    CheckCircle2,
    ArrowUpRight,
    TerminalSquare,
    LayoutGrid,
    SlidersHorizontal,
    ChevronRight
} from "lucide-react";
import { getIcon } from "@/lib/iconMap";
import { useState, useEffect, useMemo } from "react";
import { SpotlightCard } from "./SpotlightCard";
import { SkillEndorsement } from "./SkillEndorsement";
import Link from "next/link";

type SkillLevel = "Expert" | "Advanced" | "Intermediate" | "Beginner";
type ViewMode = "compact" | "detailed";

type Skill = {
    _id: string;
    name: string;
    level: SkillLevel;
    years: number;
    icon: string;
    color?: string;
    category: string;
    order?: number;
};

type SkillCategory = {
    category: string;
    icon: React.ReactNode;
    skills: Skill[];
};

// Sub-competencies and role descriptions for detailed mode
const SKILL_DETAILS: Record<string, { role: string; tags: string[] }> = {
    "Next.js": {
        role: "Full-Stack React Framework",
        tags: ["App Router", "SSR / SSG", "Server Actions", "Turbopack"]
    },
    "React": {
        role: "Component UI Architecture",
        tags: ["Hooks", "Context API", "State Management", "Virtual DOM"]
    },
    "TypeScript": {
        role: "Typed JavaScript at Scale",
        tags: ["Type Safety", "Generics", "Interfaces", "Strict Config"]
    },
    "JavaScript": {
        role: "Core Web Language",
        tags: ["ES6+", "Async / Await", "DOM API", "Event Loop"]
    },
    "Tailwind CSS": {
        role: "Utility-First CSS Engine",
        tags: ["Responsive Design", "Dark Mode", "Design Tokens", "JIT Engine"]
    },
    "Node.js": {
        role: "Event-Driven JS Runtime",
        tags: ["RESTful APIs", "Express.js", "Async I/O", "Microservices"]
    },
    "MongoDB": {
        role: "Document-Oriented NoSQL",
        tags: ["Mongoose ODM", "Aggregation Pipelines", "Atlas Cloud", "Indexing"]
    },
    "MySQL": {
        role: "Relational Database Management",
        tags: ["Complex Queries", "Foreign Keys", "Schema Design", "Transactions"]
    },
    "PostgreSQL": {
        role: "Advanced Relational Database",
        tags: ["ACID Compliance", "JSONB", "Indexing", "Connection Pooling"]
    },
    "Python": {
        role: "Automation & Scripting",
        tags: ["Automation Scripts", "REST Endpoints", "Data Processing", "Virtualenv"]
    },
    "Cisco Networking": {
        role: "Enterprise Network Infrastructure",
        tags: ["VLAN Segmentation", "OSPF / BGP", "Switching & Routing", "Subnetting"]
    },
    "Docker": {
        role: "Containerization Platform",
        tags: ["Dockerfile", "Docker Compose", "Multi-stage Builds", "Registries"]
    },
    "Linux": {
        role: "Operating System & Administration",
        tags: ["Ubuntu / Debian", "Bash Scripting", "Systemd Services", "SSH Hardening"]
    },
    "AWS": {
        role: "Cloud Services & Hosting",
        tags: ["EC2 Computing", "S3 Storage", "IAM Policies", "CloudFront CDN"]
    },
    "Git": {
        role: "Distributed Version Control",
        tags: ["Git Flow", "Branching", "Merge / Rebase", "GitHub Workflows"]
    }
};

// Associated Ecosystem & Complementary Tooling for detailed mode
const CATEGORY_ECOSYSTEM: Record<string, { label: string; tools: string[] }> = {
    "Frontend Development": {
        label: "Complementary Tools & Ecosystem",
        tools: ["Framer Motion", "Vite", "Zod", "PostCSS", "Lucide Icons", "Radix UI", "PWA"]
    },
    "Backend & Database": {
        label: "Complementary Backend Tooling",
        tools: ["Prisma ORM", "Redis Cache", "JWT Auth", "Postman", "WebSockets", "Swagger / OpenAPI"]
    },
    "Network & DevOps": {
        label: "Complementary Infrastructure Tools",
        tools: ["MikroTik RouterOS", "Wireshark", "Nginx Reverse Proxy", "WireGuard VPN", "GitHub Actions", "Cloudflare"]
    }
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
    "Frontend Development": "Architecting modern, responsive user interfaces with fluid animations, strict type safety, and optimized core web vitals.",
    "Backend & Database": "Engineering robust RESTful APIs, asynchronous services, and secure relational and document-based data layers.",
    "Network & DevOps": "Designing high-availability network topologies, containerized microservices, automated pipelines, and hardened Linux servers."
};

const getLevelColor = (level: SkillLevel): string => {
    switch (level) {
        case "Expert": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
        case "Advanced": return "bg-blue-500/10 text-blue-500 border-blue-500/30";
        case "Intermediate": return "bg-amber-500/10 text-amber-500 border-amber-500/30";
        case "Beginner": return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
};

const getLevelDot = (level: SkillLevel): string => {
    switch (level) {
        case "Expert": return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]";
        case "Advanced": return "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]";
        case "Intermediate": return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]";
        case "Beginner": return "bg-slate-400";
    }
};

const getCategoryIcon = (category: string): React.ReactNode => {
    if (category.toLowerCase().includes("frontend")) return <Code2 className="h-5 w-5" />;
    if (category.toLowerCase().includes("backend") || category.toLowerCase().includes("database")) return <Database className="h-5 w-5" />;
    if (category.toLowerCase().includes("network") || category.toLowerCase().includes("devops")) return <Network className="h-5 w-5" />;
    return <Cpu className="h-5 w-5" />;
};

export function Skills() {
    const [skills, setSkills] = useState<SkillCategory[]>([]);
    const [endorsements, setEndorsements] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState<string>("");
    
    // View mode: default is "compact" (Mode Ringkas)
    const [viewMode, setViewMode] = useState<ViewMode>("compact");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [skillsRes, endorsementsRes] = await Promise.allSettled([
                fetch('/api/skills').then(r => r.json()),
                fetch('/api/endorsements').then(r => r.json())
            ]);

            if (skillsRes.status === 'fulfilled' && skillsRes.value.success) {
                const mappedSkills: SkillCategory[] = skillsRes.value.data.map(
                    (group: { category: string; skills: Skill[] }) => ({
                        category: group.category,
                        icon: getCategoryIcon(group.category),
                        skills: group.skills
                    })
                );
                setSkills(mappedSkills);
            } else {
                setError('Failed to load skills');
            }

            if (endorsementsRes.status === 'fulfilled' && endorsementsRes.value.success) {
                setEndorsements(endorsementsRes.value.data || {});
            }
        } catch (err) {
            console.error('Error fetching skills data:', err);
            setError('Failed to load skills');
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate aggregate metrics
    const { totalSkillsCount, totalYearsExperience, totalEndorsementsCount, allCategories } = useMemo(() => {
        let count = 0;
        let maxYears = 5;
        const categories: string[] = [];

        skills.forEach(group => {
            categories.push(group.category);
            group.skills.forEach(s => {
                count++;
                if (s.years > maxYears) maxYears = s.years;
            });
        });

        const totalEndorsements = Object.values(endorsements).reduce((acc, val) => acc + val, 0);

        return {
            totalSkillsCount: count,
            totalYearsExperience: maxYears,
            totalEndorsementsCount: totalEndorsements,
            allCategories: categories
        };
    }, [skills, endorsements]);

    // Filter categories and skills based on activeTab and searchQuery
    const filteredCategories = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return skills
            .filter(category => activeTab === "all" || category.category === activeTab)
            .map(category => {
                if (!query) return category;

                const matchingSkills = category.skills.filter(s => {
                    const matchesName = s.name.toLowerCase().includes(query);
                    const details = SKILL_DETAILS[s.name];
                    const matchesRole = details?.role.toLowerCase().includes(query);
                    const matchesTags = details?.tags.some(t => t.toLowerCase().includes(query));
                    const matchesLevel = s.level.toLowerCase().includes(query);
                    return matchesName || matchesRole || matchesTags || matchesLevel;
                });

                return {
                    ...category,
                    skills: matchingSkills
                };
            })
            .filter(category => category.skills.length > 0);
    }, [skills, activeTab, searchQuery]);

    return (
        <section id="skills" className="py-20 md:py-28 bg-gradient-to-b from-background via-card/20 to-background transition-colors duration-500 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 dark:opacity-30" />
            <div className="pointer-events-none absolute top-1/2 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-50 dark:opacity-30" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center max-w-3xl mx-auto mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-4 shadow-sm">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Engineering Stack & Technical Expertise</span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-accent">
                        Technical Skills & Architecture
                    </h2>
                    <p className="mt-4 text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed">
                        A battle-tested repertoire of full-stack frameworks, asynchronous runtimes, databases, and network infrastructures built for performance, security, and scalability.
                    </p>
                </motion.div>

                {/* Top Stat Highlights Ribbon */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10 max-w-5xl mx-auto"
                >
                    {/* Stat 1: Total Technologies */}
                    <div className="p-4 rounded-2xl bg-card/70 dark:bg-card/40 border border-border/80 dark:border-primary/15 backdrop-blur-md shadow-sm flex items-center gap-3.5 hover:border-primary/40 transition-colors">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                            <Layers className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                {totalSkillsCount > 0 ? `${totalSkillsCount}+` : "14+"}
                            </div>
                            <div className="text-xs text-muted-foreground font-medium">Core Technologies</div>
                        </div>
                    </div>

                    {/* Stat 2: Experience */}
                    <div className="p-4 rounded-2xl bg-card/70 dark:bg-card/40 border border-border/80 dark:border-primary/15 backdrop-blur-md shadow-sm flex items-center gap-3.5 hover:border-primary/40 transition-colors">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                {`${totalYearsExperience}+ Years`}
                            </div>
                            <div className="text-xs text-muted-foreground font-medium">Production Experience</div>
                        </div>
                    </div>

                    {/* Stat 3: Domains */}
                    <div className="p-4 rounded-2xl bg-card/70 dark:bg-card/40 border border-border/80 dark:border-primary/15 backdrop-blur-md shadow-sm flex items-center gap-3.5 hover:border-primary/40 transition-colors">
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                            <Cpu className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                {allCategories.length || 3} Domains
                            </div>
                            <div className="text-xs text-muted-foreground font-medium">Full-Stack & Infra</div>
                        </div>
                    </div>

                    {/* Stat 4: Community Endorsements */}
                    <div className="p-4 rounded-2xl bg-card/70 dark:bg-card/40 border border-border/80 dark:border-primary/15 backdrop-blur-md shadow-sm flex items-center gap-3.5 hover:border-primary/40 transition-colors">
                        <div className="p-2.5 rounded-xl bg-accent/10 text-accent shrink-0">
                            <ThumbsUp className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                {totalEndorsementsCount > 0 ? `${totalEndorsementsCount}` : "Active"}
                            </div>
                            <div className="text-xs text-muted-foreground font-medium">Peer Endorsements</div>
                        </div>
                    </div>
                </motion.div>

                {/* Controls Bar: Category Pills + View Mode Switch (Ringkas / Detail) + Search */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8 max-w-6xl mx-auto"
                >
                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-card/80 dark:bg-card/40 border border-border/80 dark:border-primary/15 backdrop-blur-md shadow-sm w-full lg:w-auto">
                        <button
                            onClick={() => setActiveTab("all")}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === "all"
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                }`}
                        >
                            <span>All Categories</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === "all" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                {totalSkillsCount}
                            </span>
                        </button>

                        {allCategories.map((cat) => {
                            const count = skills.find(s => s.category === cat)?.skills.length || 0;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setActiveTab(cat)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === cat
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                        }`}
                                >
                                    <span>{cat}</span>
                                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === cat ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Toolbar: View Mode Toggle & Search */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                        {/* Mode Ringkas / Detail Toggle (Segmented Switch) */}
                        <div className="flex items-center p-1 rounded-xl bg-card/80 dark:bg-card/40 border border-border/80 dark:border-primary/15 backdrop-blur-md shadow-sm shrink-0 w-full sm:w-auto justify-center">
                            <button
                                onClick={() => setViewMode("compact")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${viewMode === "compact"
                                    ? "bg-primary text-primary-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                                    }`}
                                title="Mode Ringkas (Tampilan Ringkas & Cepat)"
                            >
                                <LayoutGrid className="h-3.5 w-3.5" />
                                <span>Mode Ringkas</span>
                            </button>
                            <button
                                onClick={() => setViewMode("detailed")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${viewMode === "detailed"
                                    ? "bg-primary text-primary-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                                    }`}
                                title="Mode Detail (Spesialisasi & Tag Kompetensi)"
                            >
                                <SlidersHorizontal className="h-3.5 w-3.5" />
                                <span>Mode Detail</span>
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Filter skills, e.g. React..."
                                className="w-full pl-9.5 pr-8 py-2 text-xs rounded-xl bg-card/80 dark:bg-card/40 border border-border/80 dark:border-primary/15 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Loading Skeleton */}
                {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-card/40 rounded-2xl border border-border/60 p-6 space-y-4">
                                <div className="h-7 w-2/3 bg-muted/60 animate-pulse rounded-lg" />
                                <div className="space-y-3 pt-2">
                                    {[1, 2, 3, 4].map(j => (
                                        <div key={j} className="h-10 rounded-xl bg-muted/30 border border-muted/40 animate-pulse" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-16 bg-card/40 rounded-2xl border border-border/80 max-w-md mx-auto">
                        <p className="text-muted-foreground text-sm">{error}</p>
                        <button
                            onClick={loadData}
                            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90"
                        >
                            Retry Loading
                        </button>
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="text-center py-16 bg-card/40 rounded-2xl border border-border/80 max-w-md mx-auto">
                        <p className="text-muted-foreground text-sm font-medium">No technologies match your search query.</p>
                        <button
                            onClick={() => { setSearchQuery(""); setActiveTab("all"); }}
                            className="mt-3 text-xs text-primary underline underline-offset-4"
                        >
                            Reset filters
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Skills Grid */}
                        <div className={`grid gap-5 max-w-6xl mx-auto ${filteredCategories.length === 1
                            ? "grid-cols-1 max-w-3xl"
                            : filteredCategories.length === 2
                                ? "grid-cols-1 md:grid-cols-2"
                                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                            }`}>
                            <AnimatePresence mode="popLayout">
                                {filteredCategories.map((category, categoryIndex) => {
                                    const eco = CATEGORY_ECOSYSTEM[category.category];
                                    const desc = CATEGORY_DESCRIPTIONS[category.category];

                                    return (
                                        <motion.div
                                            key={category.category}
                                            layout
                                            initial={{ opacity: 0, scale: 0.96, y: 15 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.96 }}
                                            transition={{ duration: 0.35, delay: categoryIndex * 0.06 }}
                                            className="h-full flex flex-col"
                                        >
                                            <SpotlightCard className="p-5 sm:p-6 h-full flex flex-col justify-between bg-card/90 dark:bg-card/40 border border-border/80 dark:border-primary/20 hover:border-primary/50 shadow-sm transition-all duration-300">
                                                <div>
                                                    {/* Category Header */}
                                                    <div className={`flex items-center justify-between pb-3.5 border-b border-border/70 dark:border-primary/10 ${viewMode === "detailed" ? "mb-4" : "mb-3"}`}>
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
                                                                {category.icon}
                                                            </div>
                                                            <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight">
                                                                {category.category}
                                                            </h3>
                                                        </div>
                                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-muted/70 text-muted-foreground border border-border/50">
                                                            {category.skills.length} skills
                                                        </span>
                                                    </div>

                                                    {/* Category Description in Detailed Mode */}
                                                    {viewMode === "detailed" && desc && (
                                                        <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                                                            {desc}
                                                        </p>
                                                    )}

                                                    {/* Skills List: MODE RINGKAS (COMPACT - DEFAULT) */}
                                                    {viewMode === "compact" ? (
                                                        <div className="space-y-2">
                                                            {category.skills.map((skill: Skill) => (
                                                                <div
                                                                    key={skill._id || skill.name}
                                                                    className="group/skill flex items-center justify-between p-2.5 rounded-xl bg-muted/20 hover:bg-muted/40 dark:bg-background/40 dark:hover:bg-background/80 border border-border/40 hover:border-primary/30 transition-all duration-200"
                                                                >
                                                                    {/* Left: Icon & Name */}
                                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                                        <div className="p-1.5 rounded-lg bg-card border border-border/60 shadow-2xs shrink-0">
                                                                            <div className={skill.color || 'text-foreground'}>
                                                                                {getIcon(skill.icon, "h-4 w-4")}
                                                                            </div>
                                                                        </div>
                                                                        <span className="text-xs font-semibold text-foreground tracking-tight truncate">
                                                                            {skill.name}
                                                                        </span>
                                                                    </div>

                                                                    {/* Right: Level Pill & Endorsement Button */}
                                                                    <div className="flex items-center gap-2 shrink-0">
                                                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getLevelColor(skill.level)}`}>
                                                                            <span className={`w-1.5 h-1.5 rounded-full ${getLevelDot(skill.level)}`} />
                                                                            {skill.level}
                                                                        </span>
                                                                        <SkillEndorsement
                                                                            skill={skill.name}
                                                                            initialCount={endorsements[skill.name] || 0}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        /* Skills List: MODE DETAIL (COMPREHENSIVE) */
                                                        <div className="space-y-3">
                                                            {category.skills.map((skill: Skill, skillIndex: number) => {
                                                                const details = SKILL_DETAILS[skill.name];

                                                                return (
                                                                    <motion.div
                                                                        key={skill._id || skill.name}
                                                                        initial={{ opacity: 0, x: -8 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ delay: 0.03 * skillIndex }}
                                                                        className="group/skill rounded-xl p-3 bg-muted/20 hover:bg-muted/40 dark:bg-background/40 dark:hover:bg-background/70 border border-border/50 hover:border-primary/30 transition-all duration-200"
                                                                    >
                                                                        {/* Top row: Icon, Name, Subtitle & Endorse Button */}
                                                                        <div className="flex items-start justify-between gap-2 mb-2">
                                                                            <div className="flex items-start gap-2.5 min-w-0">
                                                                                <div className="p-2 rounded-xl bg-card border border-border/60 shadow-sm shrink-0 mt-0.5">
                                                                                    <div className={skill.color || 'text-foreground'}>
                                                                                        {getIcon(skill.icon, "h-4 w-4")}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="min-w-0">
                                                                                    <div className="text-sm font-semibold text-foreground tracking-tight truncate">
                                                                                        {skill.name}
                                                                                    </div>
                                                                                    {details?.role && (
                                                                                        <div className="text-[11px] text-muted-foreground truncate">
                                                                                            {details.role}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            {/* Live Endorsement Button */}
                                                                            <div className="shrink-0">
                                                                                <SkillEndorsement
                                                                                    skill={skill.name}
                                                                                    initialCount={endorsements[skill.name] || 0}
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        {/* Middle row: Badges for Level & Experience */}
                                                                        <div className="flex items-center gap-2 mb-2.5">
                                                                            {/* Level Badge */}
                                                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getLevelColor(skill.level)}`}>
                                                                                <span className={`w-1.5 h-1.5 rounded-full ${getLevelDot(skill.level)}`} />
                                                                                {skill.level}
                                                                            </span>

                                                                            {/* Years Badge */}
                                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-muted/60 text-muted-foreground border border-border/40">
                                                                                <Calendar className="h-2.5 w-2.5" />
                                                                                {skill.years}y experience
                                                                            </span>
                                                                        </div>

                                                                        {/* Sub-competencies Pills */}
                                                                        {details?.tags && details.tags.length > 0 && (
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {details.tags.map((tag) => (
                                                                                    <span
                                                                                        key={tag}
                                                                                        className="px-1.5 py-0.5 rounded text-[9.5px] font-medium bg-background/80 text-muted-foreground/90 border border-border/40"
                                                                                    >
                                                                                        {tag}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </motion.div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Category Footer: MODE RINGKAS (Minimal Quick Action) vs MODE DETAIL (Ecosystem Tools) */}
                                                {viewMode === "compact" ? (
                                                    <div className="mt-4 pt-3 border-t border-border/50 dark:border-primary/10 flex items-center justify-between text-[11px] text-muted-foreground">
                                                        <span className="font-medium">
                                                            {category.skills.length} tools verified
                                                        </span>
                                                        <button
                                                            onClick={() => setViewMode("detailed")}
                                                            className="inline-flex items-center gap-1 text-primary hover:underline underline-offset-2 font-medium"
                                                        >
                                                            <span>Detail</span>
                                                            <ChevronRight className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    eco && (
                                                        <div className="mt-5 pt-4 border-t border-border/60 dark:border-primary/10">
                                                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground mb-2.5">
                                                                <TerminalSquare className="h-3.5 w-3.5 text-primary" />
                                                                <span>{eco.label}</span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {eco.tools.map((tool) => (
                                                                    <span
                                                                        key={tool}
                                                                        className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-primary/5 hover:bg-primary/10 text-foreground border border-primary/15 transition-colors"
                                                                    >
                                                                        {tool}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </SpotlightCard>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* Bottom Action / View Switcher in Mode Ringkas */}
                        {viewMode === "compact" && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                viewport={{ once: true }}
                                className="mt-8 text-center"
                            >
                                <button
                                    onClick={() => setViewMode("detailed")}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-muted/60 hover:bg-muted text-foreground border border-border/70 shadow-2xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                                    <span>Lihat Spesialisasi & Tag Arsitektur Lengkap (Mode Detail)</span>
                                </button>
                            </motion.div>
                        )}

                        {/* Bottom Feature Callout: Architecture & Collaboration (Only shown in Detailed Mode or when desired) */}
                        {viewMode === "detailed" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="mt-12 max-w-6xl mx-auto"
                            >
                                <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-card/90 via-card/50 to-primary/5 border border-border/80 dark:border-primary/20 backdrop-blur-md shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                    <div className="space-y-2 max-w-2xl">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                            <CheckCircle2 className="h-3 w-3" />
                                            <span>Production Ready Architecture</span>
                                        </div>
                                        <h3 className="text-lg md:text-xl font-bold tracking-tight text-foreground">
                                            Looking for a specialized tech stack or network deployment?
                                        </h3>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            Whether designing secure enterprise VLANs, zero-downtime microservices with Docker, or high-performance Next.js web applications, I can engineer and deploy the solution.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                                        <Link
                                            href="#contact"
                                            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            <span>Start Collaboration</span>
                                            <ArrowUpRight className="h-3.5 w-3.5" />
                                        </Link>
                                        <Link
                                            href="#projects"
                                            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-muted/60 hover:bg-muted text-foreground border border-border/60 transition-colors"
                                        >
                                            <span>View Projects</span>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Proficiency Legend Bar */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            viewport={{ once: true }}
                            className="mt-8 flex justify-center"
                        >
                            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 px-4 sm:px-6 py-2 rounded-2xl bg-card/80 dark:bg-card/40 backdrop-blur-md border border-border/80 dark:border-primary/10 shadow-sm text-xs">
                                <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                                    <Award className="h-3.5 w-3.5 text-primary" />
                                    <span>Proficiency Levels:</span>
                                </div>
                                {(["Expert", "Advanced", "Intermediate", "Beginner"] as SkillLevel[]).map((level) => (
                                    <div key={level} className="flex items-center gap-1.5">
                                        <span className={`w-2 h-2 rounded-full ${getLevelDot(level)}`} />
                                        <span className="text-muted-foreground font-medium">{level}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </div>
        </section>
    );
}
