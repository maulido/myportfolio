"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    FileText,
    Briefcase,
    Home,
    User,
    Award,
    Image as ImageIcon,
    Package,
    Mail,
    MessageSquare,
    Moon,
    Sun,
    Download,
    Bot,
    MessageCircle,
    CornerDownLeft,
    X,
    Globe
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface SearchItem {
    id: string;
    title: string;
    subtitle?: string;
    category: "Navigation" | "Projects" | "Blog" | "Actions";
    icon: React.ComponentType<{ className?: string }>;
    action: () => void;
}

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [projects, setProjects] = useState<{ title: string; slug: string; description?: string }[]>([]);
    const [posts, setPosts] = useState<{ title: string; slug: string; excerpt?: string }[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { t, locale, toggleLocale, dictionary } = useLanguage();
    const cp = dictionary.commandPalette;
    const nav = dictionary.nav;

    // Fetch projects and blog posts on mount for fast instant searching
    useEffect(() => {
        fetch("/api/projects")
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.data)) {
                    setProjects(data.data.map((p: { title: string; slug?: string; description?: string }) => ({
                        title: p.title,
                        slug: p.slug,
                        description: p.description
                    })));
                }
            })
            .catch(() => {});

        fetch("/api/blog")
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.data)) {
                    setPosts(data.data.map((p: { title: string; slug?: string; excerpt?: string }) => ({
                        title: p.title,
                        slug: p.slug,
                        excerpt: p.excerpt
                    })));
                }
            })
            .catch(() => {});
    }, []);

    // Global keyboard listener (Ctrl+K / Cmd+K / Esc)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setIsOpen(prev => !prev);
            } else if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        const handleCustomOpen = () => setIsOpen(true);

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("open-command-palette", handleCustomOpen);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("open-command-palette", handleCustomOpen);
        };
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                setQuery("");
                setSelectedIndex(0);
                inputRef.current?.focus();
            }, 10);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const navigateTo = useCallback((url: string) => {
        setIsOpen(false);
        router.push(url);
    }, [router]);

    // Build search items dynamically
    const allItems: SearchItem[] = [
        // Navigation
        { id: "nav-home", title: nav.home, subtitle: locale === "id" ? "Kembali ke halaman utama" : "Return to the main page", category: "Navigation", icon: Home, action: () => navigateTo("/") },
        { id: "nav-about", title: nav.about, subtitle: locale === "id" ? "Perjalanan karir & filosofi rekayasa" : "Full career journey & engineering principles", category: "Navigation", icon: User, action: () => navigateTo("/about") },
        { id: "nav-projects", title: nav.projects, subtitle: locale === "id" ? "Jelajahi karya perangkat lunak & jaringan" : "Browse all software & network builds", category: "Navigation", icon: Briefcase, action: () => navigateTo("/projects") },
        { id: "nav-blog", title: nav.blog, subtitle: locale === "id" ? "Tulisan rekayasa & tutorial teknis" : "Engineering writeups & tutorials", category: "Navigation", icon: FileText, action: () => navigateTo("/blog") },
        { id: "nav-cert", title: nav.certifications, subtitle: locale === "id" ? "Kredensial & lisensi terverifikasi" : "Verified industry credentials & licenses", category: "Navigation", icon: Award, action: () => navigateTo("/certifications") },
        { id: "nav-gallery", title: nav.gallery, subtitle: locale === "id" ? "Milestone visual & dokumentasi kegiatan" : "Visual milestones & tech events", category: "Navigation", icon: ImageIcon, action: () => navigateTo("/gallery") },
        { id: "nav-uses", title: nav.uses, subtitle: locale === "id" ? "Perangkat keras, tools, & alur kerja" : "Hardware, tools, and software stack", category: "Navigation", icon: Package, action: () => navigateTo("/uses") },
        { id: "nav-contact", title: nav.contact, subtitle: locale === "id" ? "Kirim pertanyaan atau proposal proyek" : "Send an inquiry or project proposal", category: "Navigation", icon: Mail, action: () => navigateTo("/contact") },
        { id: "nav-guestbook", title: nav.guestbook, subtitle: locale === "id" ? "Tinggalkan pesan di buku tamu publik" : "Leave a friendly note for the community", category: "Navigation", icon: MessageSquare, action: () => navigateTo("/guestbook") },

        // Quick Actions
        {
            id: "act-theme",
            title: theme === "dark" ? cp.switchThemeLight : cp.switchThemeDark,
            subtitle: locale === "id" ? "Beralih mode warna tampilan" : "Toggle visual color theme",
            category: "Actions",
            icon: theme === "dark" ? Sun : Moon,
            action: () => {
                setTheme(theme === "dark" ? "light" : "dark");
                setIsOpen(false);
            }
        },
        {
            id: "act-lang",
            title: cp.switchLanguage,
            subtitle: locale === "en" ? "Ubah bahasa antarmuka situs ke Bahasa Indonesia" : "Change site interface language to English",
            category: "Actions",
            icon: Globe,
            action: () => {
                toggleLocale();
                setIsOpen(false);
            }
        },
        {
            id: "act-cv",
            title: cp.downloadCV,
            subtitle: locale === "id" ? "Lihat dokumen resmi riwayat hidup" : "View credentials & resume document",
            category: "Actions",
            icon: Download,
            action: () => {
                setIsOpen(false);
                window.dispatchEvent(new Event("open-cv-modal"));
            }
        },
        {
            id: "act-ai",
            title: cp.askAI,
            subtitle: locale === "id" ? "Percakapan interaktif dengan asisten AI" : "Interactive chat with embedded AI",
            category: "Actions",
            icon: Bot,
            action: () => {
                setIsOpen(false);
                window.dispatchEvent(new Event("open-chat-widget"));
            }
        },
        {
            id: "act-wa",
            title: cp.whatsapp,
            subtitle: locale === "id" ? "Kirim pesan langsung via WhatsApp" : "Direct messaging with site owner",
            category: "Actions",
            icon: MessageCircle,
            action: () => {
                setIsOpen(false);
                window.open("https://wa.me/6281234567890", "_blank");
            }
        },

        // Dynamic Projects
        ...projects.map(p => ({
            id: `proj-${p.slug}`,
            title: p.title,
            subtitle: p.description || (locale === "id" ? "Proyek Portofolio" : "Portfolio Project"),
            category: "Projects" as const,
            icon: Briefcase,
            action: () => navigateTo(`/projects/${p.slug}`)
        })),

        // Dynamic Blog Posts
        ...posts.map(p => ({
            id: `post-${p.slug}`,
            title: p.title,
            subtitle: p.excerpt || (locale === "id" ? "Artikel Rekayasa" : "Engineering Article"),
            category: "Blog" as const,
            icon: FileText,
            action: () => navigateTo(`/blog/${p.slug}`)
        }))
    ];

    // Filter items based on query
    const filteredItems = allItems.filter(item => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
            item.title.toLowerCase().includes(q) ||
            (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
            item.category.toLowerCase().includes(q)
        );
    });

    // Arrow navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (filteredItems.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredItems.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (filteredItems[selectedIndex]) {
                filteredItems[selectedIndex].action();
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div 
                    className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/60 backdrop-blur-md"
                    onClick={() => setIsOpen(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="w-full max-w-xl bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Search Input Bar */}
                        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/80 bg-card">
                            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder={t("commandPalette.placeholder", "Search pages, projects, articles, or actions...")}
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setSelectedIndex(0);
                                }}
                                onKeyDown={handleKeyDown}
                                className="w-full bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery("")}
                                    className="p-1 rounded-md hover:bg-muted text-muted-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono bg-muted text-muted-foreground rounded border border-border/60">
                                ESC
                            </kbd>
                        </div>

                        {/* Results List */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {filteredItems.length === 0 ? (
                                <div className="text-center py-12 text-sm text-muted-foreground">
                                    {t("commandPalette.noResults", "No results found for")} &ldquo;<span className="text-foreground font-medium">{query}</span>&rdquo;
                                </div>
                            ) : (
                                filteredItems.map((item, idx) => {
                                    const isSelected = idx === selectedIndex;
                                    const IconComponent = item.icon;
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => item.action()}
                                            onMouseEnter={() => setSelectedIndex(idx)}
                                            className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                                                isSelected 
                                                    ? "bg-primary/10 text-primary font-semibold" 
                                                    : "hover:bg-muted/50 text-foreground"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`p-2 rounded-lg shrink-0 ${isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                                                    <IconComponent className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-xs sm:text-sm font-medium truncate">
                                                        {item.title}
                                                    </div>
                                                    {item.subtitle && (
                                                        <div className="text-[11px] text-muted-foreground truncate">
                                                            {item.subtitle}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                                                    {item.category === "Navigation"
                                                        ? cp.navigationCategory
                                                        : item.category === "Projects"
                                                        ? cp.projectsCategory
                                                        : item.category === "Blog"
                                                        ? cp.blogCategory
                                                        : cp.actionsCategory}
                                                </span>
                                                {isSelected && (
                                                    <CornerDownLeft className="h-3.5 w-3.5 text-primary shrink-0 hidden sm:block" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer Shortcuts */}
                        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/80 bg-muted/20 text-[11px] text-muted-foreground">
                            <div className="flex items-center gap-3">
                                <span><kbd className="px-1 py-0.5 rounded bg-muted font-mono">↑↓</kbd> {t("commandPalette.navigateHint", "Navigate")}</span>
                                <span><kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">↵</kbd> {t("commandPalette.selectHint", "Select")}</span>
                                <span><kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">ESC</kbd> {t("commandPalette.closeHint", "Close")}</span>
                            </div>
                            <span className="hidden sm:inline">{locale === "id" ? "Pencarian Cepat" : "Spotlight Search"}</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
