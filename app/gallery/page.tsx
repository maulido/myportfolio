"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Breadcrumb } from "@/components/Breadcrumb";
import Image from "next/image";
import { 
    X, 
    ZoomIn, 
    Calendar, 
    Camera, 
    Search, 
    Layers, 
    ChevronLeft, 
    ChevronRight, 
    ExternalLink,
    Tag
} from "lucide-react";
import { GallerySkeleton } from "@/components/Skeleton";
import { SpotlightCard } from "@/components/SpotlightCard";
import { useSettings } from "@/lib/useSettings";

interface IGalleryItem {
    _id: string;
    title: string;
    description: string;
    imageUrl: string;
    category: string;
    date: string | Date;
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

export default function GalleryPage() {
    const [items, setItems] = useState<IGalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const { get } = useSettings();
    const heroBadge = get("galleryHeroBadge", "Visual Archive & Moments");
    const heroTitle = get("galleryHeroTitle", "Activity & Milestone Gallery");
    const heroSubtitle = get("galleryHeroSubtitle", "A curated visual chronicle of physical lab setups, hardware topologies, team hackathons, and key milestones.");

    useEffect(() => {
        async function fetchGallery() {
            try {
                const res = await fetch('/api/gallery');
                const data = await res.json();
                if (data.success && Array.isArray(data.data)) {
                    setItems(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch gallery", error);
            } finally {
                setLoading(false);
            }
        }
        fetchGallery();

        const timeout = setTimeout(() => {
            setLoading(false);
        }, 5000);

        return () => clearTimeout(timeout);
    }, []);

    // Get unique categories safely
    const categories = useMemo(() => {
        const set = new Set<string>();
        items.forEach(item => {
            if (item.category && item.category.trim() !== "") {
                set.add(item.category);
            }
        });
        return ["All", ...Array.from(set)];
    }, [items]);

    // Filter items
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = !searchQuery ||
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [items, searchQuery, selectedCategory]);

    const activeItem = useMemo(() => {
        if (selectedIndex === null || selectedIndex < 0 || selectedIndex >= filteredItems.length) {
            return null;
        }
        return filteredItems[selectedIndex];
    }, [selectedIndex, filteredItems]);

    const handlePrev = useCallback(() => {
        if (selectedIndex === null) return;
        setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1));
    }, [selectedIndex, filteredItems.length]);

    const handleNext = useCallback(() => {
        if (selectedIndex === null) return;
        setSelectedIndex((prev) => (prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0));
    }, [selectedIndex, filteredItems.length]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedIndex === null) return;
            if (e.key === "Escape") setSelectedIndex(null);
            if (e.key === "ArrowLeft") handlePrev();
            if (e.key === "ArrowRight") handleNext();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedIndex, handlePrev, handleNext]);

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />
            <main className="flex-1 pt-20 pb-20">
                {/* Ambient Lighting */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />

                {/* Breadcrumbs */}
                <div className="container mx-auto px-4 md:px-6 py-4">
                    <Breadcrumb items={[{ label: "Gallery" }]} />
                </div>

                {/* Hero Header */}
                <section className="container mx-auto px-4 md:px-6 pt-4 pb-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="max-w-2xl"
                        >
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-3">
                                <Camera className="h-3.5 w-3.5" />
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
                                    <span>{heroTitle}</span>
                                )}
                            </h1>
                            <p className="mt-3 text-base md:text-lg text-muted-foreground leading-relaxed">
                                {heroSubtitle}
                            </p>
                        </motion.div>

                        {/* Quick Stats Pill */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="flex items-center gap-3 self-start md:self-end flex-wrap"
                        >
                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm text-xs font-medium shadow-xs">
                                <Layers className="h-4 w-4 text-primary" />
                                <div>
                                    <span className="font-bold text-foreground">{items.length}</span>
                                    <span className="text-muted-foreground ml-1">Photographs</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm text-xs font-medium shadow-xs">
                                <Tag className="h-4 w-4 text-emerald-500" />
                                <div>
                                    <span className="font-bold text-foreground">{categories.length - 1}</span>
                                    <span className="text-muted-foreground ml-1">Categories</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Filter and Search Bar */}
                <section className="container mx-auto px-4 md:px-6 mb-8">
                    <div className="p-4 md:p-6 rounded-2xl border border-border/80 dark:border-white/10 bg-card/70 backdrop-blur-md shadow-sm space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search gallery by title or activity description..."
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

                        {/* Categories Filter Tabs */}
                        <div className="flex flex-wrap gap-2 items-center pt-1 border-t border-border/60 dark:border-white/5">
                            <span className="text-xs font-semibold text-muted-foreground mr-1 shrink-0">
                                Filter:
                            </span>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        selectedCategory === cat
                                            ? "bg-primary text-white shadow-xs"
                                            : "bg-background/60 border border-border/60 hover:border-primary/40 text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results Count & Reset Indicator */}
                    <div className="flex items-center justify-between gap-4 mt-6">
                        <p className="text-xs md:text-sm text-muted-foreground font-medium">
                            Showing <span className="font-bold text-foreground">{filteredItems.length}</span> of {items.length} photographs
                        </p>
                        {(searchQuery || selectedCategory !== "All") && (
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setSelectedCategory("All");
                                }}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            >
                                <X className="h-3.5 w-3.5" />
                                <span>Reset Filters</span>
                            </button>
                        )}
                    </div>
                </section>

                {/* Gallery Grid */}
                <section className="container mx-auto px-4 md:px-6">
                    {loading ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <GallerySkeleton key={i} />
                            ))}
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <SpotlightCard className="p-12 md:p-16 text-center max-w-lg mx-auto">
                            <div className="h-14 w-14 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto mb-4">
                                <Camera className="h-7 w-7" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">No Photographs Found</h3>
                            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                                No activity photos matched your active search or category criteria.
                            </p>
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setSelectedCategory("All");
                                }}
                                className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
                            >
                                Clear All Filters
                            </button>
                        </SpotlightCard>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <AnimatePresence mode="popLayout">
                                {filteredItems.map((item, index) => (
                                    <motion.div
                                        key={item._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3, delay: index * 0.04 }}
                                        className="h-full"
                                    >
                                        <SpotlightCard
                                            onClick={() => setSelectedIndex(index)}
                                            className="p-3 h-full flex flex-col justify-between cursor-pointer group hover:scale-[1.02] transition-all duration-300"
                                            spotlightColor="rgba(56, 189, 248, 0.12)"
                                        >
                                            <div className="aspect-[4/3] w-full bg-muted/30 rounded-xl relative overflow-hidden border border-border/60">
                                                {item.imageUrl ? (
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt={item.title}
                                                        fill
                                                        placeholder="blur"
                                                        blurDataURL={getShimmerDataUrl(400, 300)}
                                                        className="object-cover group-hover:scale-108 transition-transform duration-700"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                                        No Image Preview
                                                    </div>
                                                )}

                                                {/* Gradient Overlay & Zoom Icon */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                                                    <div className="p-3 rounded-full bg-black/50 text-white backdrop-blur-sm transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                                        <ZoomIn className="h-5 w-5" />
                                                    </div>
                                                </div>

                                                {/* Category Tag on Top */}
                                                {item.category && (
                                                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-background/85 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-foreground border border-border/50 shadow-xs z-20">
                                                        {item.category}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Details info */}
                                            <div className="p-3 pt-4 flex-1 flex flex-col justify-between space-y-2">
                                                <div>
                                                    <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                                        {item.title}
                                                    </h3>
                                                    {item.description && (
                                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="pt-2 border-t border-border/60 dark:border-white/5 flex items-center justify-between text-[11px] text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3 text-primary" />
                                                        {new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                                                    </span>
                                                    <span className="font-semibold text-primary group-hover:underline">
                                                        Inspect Photo
                                                    </span>
                                                </div>
                                            </div>
                                        </SpotlightCard>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </section>
            </main>

            {/* Immersive Lightbox Modal */}
            <AnimatePresence>
                {activeItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-8 backdrop-blur-md"
                        onClick={() => setSelectedIndex(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 15 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 15 }}
                            className="relative max-w-6xl w-full max-h-[92vh] overflow-hidden rounded-3xl bg-card/90 border border-border/80 dark:border-white/10 shadow-2xl backdrop-blur-2xl flex flex-col md:flex-row"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedIndex(null)}
                                className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 hover:scale-110 transition-all cursor-pointer"
                                title="Close viewer (Esc)"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            {/* Image Showcase with Navigation Buttons */}
                            <div className="w-full md:w-2/3 aspect-video md:aspect-auto md:min-h-[500px] bg-black flex items-center justify-center relative overflow-hidden">
                                {activeItem.imageUrl ? (
                                    <Image
                                        src={activeItem.imageUrl}
                                        alt={activeItem.title}
                                        width={1400}
                                        height={900}
                                        className="w-full h-full object-contain relative z-10 max-h-[75vh]"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                        No Image Available
                                    </div>
                                )}

                                {/* Prev & Next Buttons */}
                                {filteredItems.length > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/90 hover:scale-110 transition-all cursor-pointer"
                                            title="Previous photo (Left arrow)"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/90 hover:scale-110 transition-all cursor-pointer"
                                            title="Next photo (Right arrow)"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Info Sidebar */}
                            <div className="flex-1 p-6 md:p-10 flex flex-col justify-between bg-card">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between gap-2">
                                        {activeItem.category && (
                                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase border border-primary/20">
                                                {activeItem.category}
                                            </span>
                                        )}
                                        {selectedIndex !== null && (
                                            <span className="text-xs font-semibold text-muted-foreground">
                                                {selectedIndex + 1} of {filteredItems.length}
                                            </span>
                                        )}
                                    </div>

                                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground leading-snug">
                                        {activeItem.title}
                                    </h2>

                                    {activeItem.description && (
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {activeItem.description}
                                        </p>
                                    )}
                                </div>

                                <div className="pt-6 border-t border-border/60 dark:border-white/5 space-y-4 mt-6">
                                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Capture Date</p>
                                            <p className="font-semibold text-foreground">
                                                {new Date(activeItem.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    {activeItem.imageUrl && (
                                        <a
                                            href={activeItem.imageUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-1"
                                        >
                                            <span>Open Original File</span>
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
