"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
    Laptop,
    Code,
    Server,
    Armchair,
    Package,
    Terminal,
    ExternalLink,
    Sparkles,
    Search,
    X,
    Cpu,
    Monitor,
    Wifi,
    SlidersHorizontal,
    ArrowUpRight,
    Lock
} from "lucide-react";
import { useSettings } from "@/lib/useSettings";

interface UsesItem {
    _id: string;
    name: string;
    category: string;
    description: string;
    url?: string;
    imageUrl?: string;
    featured: boolean;
    order: number;
}

const categoryIcons: Record<string, React.ElementType> = {
    Hardware: Laptop,
    Software: Code,
    Services: Server,
    "Desk Setup": Armchair,
    Other: Package
};

export default function UsesPage() {
    const [items, setItems] = useState<UsesItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [featuredOnly, setFeaturedOnly] = useState(false);

    const { get } = useSettings();
    const heroBadge = get("usesHeroBadge", "Workspace, Lab & Daily Drivers");
    const heroTitle = get("usesHeroTitle", "Tech Stack, Gear & Lab Equipment");
    const heroSubtitle = get("usesHeroSubtitle", "A comprehensive, living catalog of the hardware, developer tooling, networking lab routers, cloud services, and ergonomics that power my engineering workflow.");

    useEffect(() => {
        fetchUsesItems();
    }, []);

    const fetchUsesItems = async () => {
        try {
            const response = await fetch('/api/uses');
            const data = await response.json();
            if (data.success) {
                if (Array.isArray(data.items)) {
                    setItems(data.items);
                } else if (data.data && typeof data.data === 'object') {
                    const flattened: UsesItem[] = [];
                    Object.values(data.data).forEach((group) => {
                        if (Array.isArray(group)) flattened.push(...group);
                    });
                    flattened.sort((a, b) => a.order - b.order);
                    setItems(flattened);
                }
            }
        } catch (error) {
            console.error('Error fetching uses items:', error);
        } finally {
            setLoading(false);
        }
    };

    // Categories list with counts
    const categories = useMemo(() => {
        const counts: Record<string, number> = {
            Hardware: 0,
            Software: 0,
            Services: 0,
            "Desk Setup": 0,
        };
        items.forEach((item) => {
            if (counts[item.category] !== undefined) {
                counts[item.category]++;
            } else {
                counts[item.category] = (counts[item.category] || 0) + 1;
            }
        });
        return [
            { key: "All", label: "All Equipment", count: items.length, icon: SlidersHorizontal },
            { key: "Hardware", label: "Hardware & Rig", count: counts.Hardware || 0, icon: Laptop },
            { key: "Software", label: "Dev Software & IDEs", count: counts.Software || 0, icon: Code },
            { key: "Services", label: "Cloud & Services", count: counts.Services || 0, icon: Server },
            { key: "Desk Setup", label: "Desk & Ergonomics", count: counts["Desk Setup"] || 0, icon: Armchair },
        ];
    }, [items]);

    // Filtered Items based on Search, Category, and Featured Toggle
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
            const matchesFeatured = !featuredOnly || item.featured;
            const matchesSearch =
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesFeatured && matchesSearch;
        });
    }, [items, selectedCategory, featuredOnly, searchQuery]);

    // Group items by category when viewing "All" with empty search
    const isGroupedView = selectedCategory === "All" && !searchQuery.trim() && !featuredOnly;

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />
            <main className="flex-1 pt-20 pb-24">
                {/* Breadcrumbs */}
                <div className="container mx-auto px-4 md:px-6 py-4 max-w-6xl">
                    <Breadcrumb items={[{ label: "Uses & Setup" }]} />
                </div>

                {/* Hero Header */}
                <section className="container mx-auto px-4 md:px-6 pt-4 pb-12 max-w-6xl relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[250px] bg-primary/5 blur-[120px] pointer-events-none -z-10" />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center max-w-3xl mx-auto space-y-4"
                    >
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>{heroBadge}</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                            {heroTitle.includes(" ") ? (
                                <>
                                    {heroTitle.substring(0, heroTitle.lastIndexOf(" "))}{" "}
                                    <span className="text-gradient">
                                        {heroTitle.substring(heroTitle.lastIndexOf(" ") + 1)}
                                    </span>
                                </>
                            ) : (
                                <span className="text-gradient">{heroTitle}</span>
                            )}
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                            {heroSubtitle}
                        </p>
                    </motion.div>

                    {/* Workstation & Lab Core Specs Matrix */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12"
                    >
                        {[
                            {
                                icon: Cpu,
                                title: "Compute & Rig",
                                subtitle: "Primary Workstation",
                                spec: 'Apple M3 Max · 64GB RAM · NVMe',
                                tag: "ARM64 Unix"
                            },
                            {
                                icon: Monitor,
                                title: "Visual Workspace",
                                subtitle: "Displays & KVM",
                                spec: 'Dell UltraSharp 32" 4K + KVM',
                                tag: "IPS Color Calibrated"
                            },
                            {
                                icon: Wifi,
                                title: "Network Core & Lab",
                                subtitle: "Enterprise Routing",
                                spec: "MikroTik RB5009 + Cisco 2960-X",
                                tag: "BGP / VLANs / 10G"
                            },
                            {
                                icon: Terminal,
                                title: "Environment & CLI",
                                subtitle: "IDE & Terminal",
                                spec: "VS Code + Neovim · Warp · Starship",
                                tag: "Tokyo Night / Vim"
                            }
                        ].map((spec, idx) => {
                            const Icon = spec.icon;
                            return (
                                <div
                                    key={idx}
                                    className="p-4 sm:p-5 rounded-2xl bg-card/60 backdrop-blur-md border border-border/80 hover:border-primary/40 transition-all duration-300 shadow-sm space-y-2 group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/5 text-primary/80 border border-primary/10">
                                            {spec.tag}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{spec.subtitle}</p>
                                        <h3 className="font-bold text-foreground text-sm mt-0.5">{spec.title}</h3>
                                        <p className="text-xs text-foreground/80 font-mono mt-1 truncate">{spec.spec}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                </section>

                {/* Filter & Search Control Bar */}
                <section className="container mx-auto px-4 md:px-6 max-w-6xl mb-10">
                    <div className="p-4 rounded-3xl bg-card/70 backdrop-blur-md border border-border space-y-4 shadow-sm">
                        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                            {/* Search Input */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search gear, tools, routers, frameworks, monitors..."
                                    className="w-full h-11 pl-10 pr-10 rounded-2xl bg-background/80 border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all outline-none"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                        aria-label="Clear Search"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Featured Toggle */}
                            <button
                                type="button"
                                onClick={() => setFeaturedOnly(!featuredOnly)}
                                className={'inline-flex items-center justify-center gap-2 px-4 h-11 rounded-2xl text-xs font-semibold border transition-all shrink-0 ' + (
                                    featuredOnly
                                        ? "bg-primary text-white border-primary shadow-sm shadow-primary/25"
                                        : "bg-background/80 text-muted-foreground border-input hover:border-primary/40 hover:text-foreground"
                                )}
                            >
                                <Sparkles className={'h-3.5 w-3.5 ' + (featuredOnly ? "text-amber-300" : "")} />
                                <span>Daily Drivers Only</span>
                            </button>
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
                            {categories.map((cat) => {
                                const Icon = cat.icon;
                                const isSelected = selectedCategory === cat.key;
                                return (
                                    <button
                                        key={cat.key}
                                        type="button"
                                        onClick={() => setSelectedCategory(cat.key)}
                                        className={'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ' + (
                                            isSelected
                                                ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                                                : "bg-background/60 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                                        )}
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                        <span>{cat.label}</span>
                                        <span className={'text-[10px] px-1.5 py-0.5 rounded-full ' + (
                                            isSelected ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                                        )}>
                                            {cat.count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Items Presentation */}
                <section className="container mx-auto px-4 md:px-6 max-w-6xl">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="rounded-3xl border border-border/80 bg-card/60 p-6 space-y-4">
                                    <div className="h-44 w-full rounded-2xl bg-muted/60 animate-pulse" />
                                    <div className="h-6 w-2/3 rounded-xl bg-muted animate-pulse" />
                                    <div className="h-4 w-full rounded-lg bg-muted/40 animate-pulse" />
                                    <div className="h-4 w-4/5 rounded-lg bg-muted/30 animate-pulse" />
                                </div>
                            ))}
                        </div>
                    ) : filteredItems.length === 0 ? (
                        /* Empty State */
                        <div className="text-center py-20 bg-card/40 border border-border/80 rounded-3xl p-8 max-w-md mx-auto space-y-4">
                            <div className="h-14 w-14 mx-auto rounded-2xl bg-muted/80 flex items-center justify-center text-muted-foreground">
                                <Package className="h-7 w-7 opacity-60" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-foreground">No equipment matched</h3>
                                <p className="text-xs text-muted-foreground">
                                    Try clearing your search query or selecting another category filter.
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setSelectedCategory("All");
                                    setFeaturedOnly(false);
                                }}
                                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
                            >
                                Reset Filters
                            </button>
                        </div>
                    ) : isGroupedView ? (
                        /* Grouped By Category View */
                        <div className="space-y-16">
                            {["Hardware", "Software", "Services", "Desk Setup"].map((categoryName) => {
                                const groupItems = filteredItems.filter((i) => i.category === categoryName);
                                if (groupItems.length === 0) return null;
                                const CategoryIcon = categoryIcons[categoryName] || Package;

                                return (
                                    <div key={categoryName} className="space-y-6">
                                        <div className="flex items-center gap-3 pb-3 border-b border-border/70">
                                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                                <CategoryIcon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-foreground">{categoryName}</h2>
                                                <p className="text-xs text-muted-foreground">
                                                    {groupItems.length} {groupItems.length === 1 ? "item" : "items"} configured
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {groupItems.map((item, index) => (
                                                <UsesItemCard key={item._id} item={item} index={index} />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Filtered / Searched Flat Grid */
                        <div className="space-y-4">
                            <p className="text-xs font-semibold text-muted-foreground">
                                Showing {filteredItems.length} {filteredItems.length === 1 ? "result" : "results"}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredItems.map((item, index) => (
                                    <UsesItemCard key={item._id} item={item} index={index} />
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                {/* Bottom Philosophy & Action Callout */}
                <section className="container mx-auto px-4 md:px-6 max-w-6xl mt-20">
                    <div className="p-8 rounded-3xl bg-card/60 backdrop-blur-md border border-border relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
                        <div className="space-y-2 max-w-xl text-center sm:text-left">
                            <h3 className="text-lg font-bold text-foreground">
                                Tooling & Equipment Philosophy
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                I invest in dependable, enterprise-grade hardware and ergonomic gear to minimize cognitive friction, optimize system latency, and guarantee resilient software delivery. Have questions regarding network setups or dev tools?
                            </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/25"
                            >
                                <span>Inquire About Gear</span>
                                <ArrowUpRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/admin/uses"
                                className="inline-flex items-center justify-center p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                title="Manage in Admin"
                                aria-label="Manage in Admin"
                            >
                                <Lock className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

function UsesItemCard({ item, index }: { item: UsesItem; index: number }) {
    const CategoryIcon = categoryIcons[item.category] || Package;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.04, duration: 0.4 }}
            className={'group relative flex flex-col justify-between rounded-3xl border bg-card/80 backdrop-blur-md p-5 transition-all duration-300 hover:shadow-xl ' + (
                item.featured
                    ? "border-primary/40 hover:border-primary shadow-sm hover:shadow-primary/5"
                    : "border-border/80 hover:border-border hover:bg-card"
            )}
        >
            <div className="space-y-4">
                {/* Image Container with Fallback */}
                {item.imageUrl ? (
                    <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-muted border border-border/40">
                        <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                ) : (
                    <div className="w-full h-32 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary/40 group-hover:text-primary transition-colors">
                        <CategoryIcon className="h-10 w-10" />
                    </div>
                )}

                {/* Badges & Meta */}
                <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground border border-border/60">
                        <CategoryIcon className="h-3 w-3 text-primary" />
                        <span>{item.category}</span>
                    </span>

                    {item.featured && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Sparkles className="h-3 w-3" />
                            <span>Daily Driver</span>
                        </span>
                    )}
                </div>

                {/* Item Details */}
                <div className="space-y-1.5">
                    <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {item.name}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {item.description}
                    </p>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between">
                {item.url ? (
                    <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline group-hover:translate-x-0.5 transition-transform"
                    >
                        <span>Official Website</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                ) : (
                    <span className="text-[11px] text-muted-foreground/60 font-mono">
                        Workflow Verified
                    </span>
                )}
                <span className="text-[10px] font-mono text-muted-foreground/60">
                    #{item.order || index + 1}
                </span>
            </div>
        </motion.div>
    );
}
