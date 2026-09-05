"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Footer } from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquare,
    Send,
    Pin,
    Heart,
    Sparkles,
    Clock,
    Search,
    X,
    Globe,
    ExternalLink,
    CheckCircle2,
    CornerDownRight,
    User,
    Calendar,
    Flame,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    PenTool
} from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

interface GuestbookEntry {
    _id: string;
    name: string;
    website?: string;
    message: string;
    pinned?: boolean;
    likes?: number;
    adminReply?: string;
    adminRepliedAt?: string;
    createdAt: string;
}

interface Stats {
    totalSignatures: number;
    totalPinned: number;
    totalLikes: number;
}

const QUICK_GREETINGS_EN = [
    "Inspiring portfolio & engineering projects!",
    "Loved the network lab and gear setup.",
    "Great blog articles and deep dives.",
    "Clean, ultra-smooth and responsive UI.",
    "Greetings from the tech community!"
];

const QUICK_GREETINGS_ID = [
    "Portofolio dan proyek rekayasa yang sangat menginspirasi!",
    "Suka sekali dengan setup lab jaringan dan perangkatnya.",
    "Artikel blog dan ulasan teknisnya sangat mendalam.",
    "UI sangat bersih, mulus, dan responsif.",
    "Salam hangat dari komunitas teknologi!"
];

const AVATAR_GRADIENTS = [
    "from-indigo-500 to-purple-600",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600",
    "from-violet-500 to-fuchsia-600",
];

function getAvatarGradient(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
    return AVATAR_GRADIENTS[index];
}

function getInitials(name: string) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

export default function GuestbookPage() {
    const { dictionary, locale } = useLanguage();
    const quickGreetings = locale === 'id' ? QUICK_GREETINGS_ID : QUICK_GREETINGS_EN;

    const [entries, setEntries] = useState<GuestbookEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState<Stats>({
        totalSignatures: 0,
        totalPinned: 0,
        totalLikes: 0,
    });

    // Filtering & Sorting
    const [searchQuery, setSearchQuery] = useState("");
    const [activeSort, setActiveSort] = useState<"newest" | "popular" | "oldest">("newest");
    const [submittedSuccess, setSubmittedSuccess] = useState(false);

    // Form inputs
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        website: "",
        message: ""
    });
    const [charCount, setCharCount] = useState(0);
    const maxChars = 500;

    // Liked IDs tracking in localStorage
    const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        try {
            const saved = localStorage.getItem("portfolio_guestbook_likes");
            if (saved) {
                setLikedIds(new Set(JSON.parse(saved)));
            }
        } catch {}
    }, []);

    const fetchEntries = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: "10",
                sort: activeSort,
            });
            if (searchQuery.trim()) {
                params.set("search", searchQuery.trim());
            }

            const response = await fetch(`/api/guestbook?${params.toString()}`);
            const data = await response.json();
            if (data.success) {
                setEntries(data.data || []);
                setTotalPages(data.pagination?.pages || 1);
                if (data.stats) {
                    setStats(data.stats);
                }
            } else {
                toast.error(data.error || "Failed to load signatures");
            }
        } catch (error) {
            console.error("Error fetching guestbook entries:", error);
            toast.error("Failed to connect to guestbook service");
        } finally {
            setLoading(false);
        }
    }, [page, activeSort, searchQuery]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchEntries();
        }, 250);
        return () => clearTimeout(timer);
    }, [fetchEntries]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === "message") {
            if (value.length <= maxChars) {
                setFormData(prev => ({ ...prev, [name]: value }));
                setCharCount(value.length);
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleQuickGreeting = (text: string) => {
        setFormData(prev => {
            const current = prev.message.trim();
            const newMessage = current ? `${current} ${text}` : text;
            if (newMessage.length <= maxChars) {
                setCharCount(newMessage.length);
                return { ...prev, message: newMessage };
            }
            return prev;
        });
        toast.success("Greeting appended to your message", { duration: 1500 });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.message.trim()) {
            toast.error("Please provide both your name and message.");
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch("/api/guestbook", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || "Thank you! Your signature will appear after quick approval.", {
                    duration: 5000,
                });
                setFormData({ name: "", email: "", website: "", message: "" });
                setCharCount(0);
                setSubmittedSuccess(true);
            } else {
                if (response.status === 429) {
                    toast.error(data.error || "Too many submissions. Please wait before trying again.");
                } else {
                    toast.error(data.error || "Failed to submit signature.");
                }
            }
        } catch (error) {
            console.error("Error submitting signature:", error);
            toast.error("Network error. Please try again later.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleLike = async (id: string) => {
        if (likedIds.has(id)) {
            toast("You already reacted to this signature!", { icon: "❤️" });
            return;
        }

        // Optimistic UI update
        setEntries(prev => prev.map(entry => {
            if (entry._id === id) {
                return { ...entry, likes: (entry.likes || 0) + 1 };
            }
            return entry;
        }));

        const newLiked = new Set(likedIds).add(id);
        setLikedIds(newLiked);
        try {
            localStorage.setItem("portfolio_guestbook_likes", JSON.stringify(Array.from(newLiked)));
        } catch {}

        try {
            const res = await fetch(`/api/guestbook/${id}/like`, { method: "POST" });
            const data = await res.json();
            if (data.success) {
                toast.success("Reaction added!", { duration: 1500 });
            }
        } catch (error) {
            console.error("Failed to register like:", error);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
            <Navbar />

            <main className="flex-1 pt-24 sm:pt-28 pb-20">
                {/* Ambient Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-primary/5 rounded-full blur-[140px] pointer-events-none -z-10" />

                <div className="container mx-auto px-4 md:px-6 max-w-5xl space-y-12">
                    {/* Breadcrumbs */}
                    <div className="pb-2">
                        <Breadcrumb items={[{ label: "Guestbook" }]} />
                    </div>

                    {/* Hero Header */}
                    <section className="text-center space-y-4 max-w-3xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-xs"
                        >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>{dictionary.guestbook.badge}</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-primary"
                        >
                            {dictionary.guestbook.title}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.15 }}
                            className="text-base sm:text-lg text-muted-foreground leading-relaxed"
                        >
                            {dictionary.guestbook.subtitle}
                        </motion.p>

                        {/* Live Community Counters */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="grid grid-cols-3 gap-3 pt-4 max-w-lg mx-auto"
                        >
                            <div className="p-3 rounded-2xl bg-card/80 dark:bg-white/[0.03] border border-border/80 dark:border-white/10 shadow-xs">
                                <div className="text-xl sm:text-2xl font-bold text-primary">
                                    {stats.totalSignatures}
                                </div>
                                <div className="text-[11px] text-muted-foreground font-medium flex items-center justify-center gap-1 mt-0.5">
                                    <MessageSquare className="h-3 w-3" />
                                    <span>{dictionary.guestbook.signatures}</span>
                                </div>
                            </div>
                            <div className="p-3 rounded-2xl bg-card/80 dark:bg-white/[0.03] border border-border/80 dark:border-white/10 shadow-xs">
                                <div className="text-xl sm:text-2xl font-bold text-amber-500">
                                    {stats.totalPinned}
                                </div>
                                <div className="text-[11px] text-muted-foreground font-medium flex items-center justify-center gap-1 mt-0.5">
                                    <Pin className="h-3 w-3" />
                                    <span>{dictionary.guestbook.pinnedEntries}</span>
                                </div>
                            </div>
                            <div className="p-3 rounded-2xl bg-card/80 dark:bg-white/[0.03] border border-border/80 dark:border-white/10 shadow-xs">
                                <div className="text-xl sm:text-2xl font-bold text-rose-500">
                                    {stats.totalLikes}
                                </div>
                                <div className="text-[11px] text-muted-foreground font-medium flex items-center justify-center gap-1 mt-0.5">
                                    <Heart className="h-3 w-3" />
                                    <span>{dictionary.guestbook.totalEndorsements}</span>
                                </div>
                            </div>
                        </motion.div>
                    </section>

                    {/* Interactive Signature Box */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="rounded-3xl border border-border/80 dark:border-white/10 bg-card/80 dark:bg-white/[0.02] backdrop-blur-xl p-6 sm:p-8 shadow-lg relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                                    <PenTool className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight">{dictionary.guestbook.signGuestbook}</h2>
                                    <p className="text-xs text-muted-foreground">{dictionary.guestbook.signGuestbookDesc}</p>
                                </div>
                            </div>
                        </div>

                        {submittedSuccess ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-6 rounded-2xl bg-primary/10 border border-primary/20 text-center space-y-3"
                            >
                                <div className="h-12 w-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">{locale === 'id' ? "Tanda Tangan Diterima!" : "Signature Received!"}</h3>
                                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                    {dictionary.guestbook.moderationNote}
                                </p>
                                <button
                                    onClick={() => setSubmittedSuccess(false)}
                                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs"
                                >
                                    {locale === 'id' ? "Kirim Catatan Lain" : "Sign Another Message"}
                                </button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <User className="h-3.5 w-3.5 text-primary" />
                                            {dictionary.guestbook.nameLabel} <span className="text-primary">*</span>
                                        </label>
                                        <input
                                            required
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            maxLength={100}
                                            className="w-full h-11 px-3.5 rounded-xl border border-input/80 bg-background/80 dark:bg-white/[0.04] text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                            placeholder={dictionary.guestbook.namePlaceholder}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                                            {dictionary.guestbook.websiteLabel}
                                        </label>
                                        <input
                                            name="website"
                                            type="url"
                                            value={formData.website}
                                            onChange={handleChange}
                                            className="w-full h-11 px-3.5 rounded-xl border border-input/80 bg-background/80 dark:bg-white/[0.04] text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                            placeholder={dictionary.guestbook.websitePlaceholder}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                        <span>Email</span>
                                        <span className="text-muted-foreground text-[10px] font-normal">{locale === 'id' ? "(opsional, tetap privat)" : "(optional, stays private, never published)"}</span>
                                    </label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full h-11 px-3.5 rounded-xl border border-input/80 bg-background/80 dark:bg-white/[0.04] text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                        placeholder="your.email@company.com"
                                    />
                                </div>

                                {/* Quick Greeting Pills */}
                                <div className="pt-1">
                                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                                        {dictionary.guestbook.quickPrompts}
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {quickGreetings.map((pill, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => handleQuickGreeting(pill)}
                                                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-muted/60 dark:bg-white/[0.04] hover:bg-primary/10 hover:text-primary hover:border-primary/30 border border-border/70 dark:border-white/5 transition-all text-muted-foreground"
                                            >
                                                + {pill}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <MessageSquare className="h-3.5 w-3.5 text-primary" />
                                            {dictionary.guestbook.messageLabel} <span className="text-primary">*</span>
                                        </label>
                                        <span className={`text-[11px] font-mono ${charCount > maxChars * 0.9 ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                                            {charCount} / {maxChars}
                                        </span>
                                    </div>
                                    <textarea
                                        required
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full p-3.5 rounded-xl border border-input/80 bg-background/80 dark:bg-white/[0.04] text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-y min-h-[110px]"
                                        placeholder={dictionary.guestbook.messagePlaceholder}
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-[11px] text-muted-foreground hidden sm:inline">
                                        {dictionary.guestbook.moderationNote}
                                    </span>
                                    <button
                                        type="submit"
                                        disabled={submitting || !formData.name.trim() || !formData.message.trim()}
                                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-md hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                                    >
                                        {submitting ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                <span>{dictionary.guestbook.submitting}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4" />
                                                <span>{dictionary.guestbook.postSignature}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </motion.section>

                    {/* Feed Controls: Search & Sort */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/70 dark:border-white/10">
                        {/* Search Input */}
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setPage(1);
                                }}
                                placeholder={dictionary.guestbook.searchPlaceholder}
                                className="w-full h-10 pl-9 pr-8 rounded-full border border-border/80 dark:border-white/10 bg-card/60 dark:bg-white/[0.03] text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setPage(1);
                                    }}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>

                        {/* Sort Tabs */}
                        <div className="flex items-center gap-1.5 p-1 rounded-full bg-muted/50 dark:bg-white/[0.03] border border-border/60 dark:border-white/10">
                            <button
                                onClick={() => {
                                    setActiveSort("newest");
                                    setPage(1);
                                }}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                    activeSort === "newest"
                                        ? "bg-primary text-primary-foreground shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <Clock className="h-3.5 w-3.5" />
                                <span>{locale === 'id' ? "Terbaru" : "Newest"}</span>
                            </button>
                            <button
                                onClick={() => {
                                    setActiveSort("popular");
                                    setPage(1);
                                }}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                    activeSort === "popular"
                                        ? "bg-primary text-primary-foreground shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <Flame className="h-3.5 w-3.5 text-amber-300" />
                                <span>{locale === 'id' ? "Paling Disukai" : "Most Liked"}</span>
                            </button>
                            <button
                                onClick={() => {
                                    setActiveSort("oldest");
                                    setPage(1);
                                }}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                    activeSort === "oldest"
                                        ? "bg-primary text-primary-foreground shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <span>{locale === 'id' ? "Terlama" : "Oldest"}</span>
                            </button>
                        </div>
                    </div>

                    {/* Messages Feed */}
                    <section className="space-y-4">
                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                <span className="text-xs font-medium">{locale === 'id' ? "Memuat tanda tangan..." : "Loading signatures..."}</span>
                            </div>
                        ) : entries.length > 0 ? (
                            <div className="grid gap-4">
                                <AnimatePresence>
                                    {entries.map((entry, index) => {
                                        const isLiked = likedIds.has(entry._id);
                                        return (
                                            <motion.article
                                                key={entry._id}
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.3, delay: index * 0.04 }}
                                                className={`rounded-2xl p-5 sm:p-6 transition-all duration-300 border backdrop-blur-sm relative ${
                                                    entry.pinned
                                                        ? "bg-amber-500/[0.03] dark:bg-amber-500/[0.04] border-amber-500/30 dark:border-amber-500/40 shadow-sm"
                                                        : "bg-card/80 dark:bg-white/[0.02] border-border/80 dark:border-white/10 hover:border-primary/40 shadow-xs"
                                                }`}
                                            >
                                                {/* Pinned Badge */}
                                                {entry.pinned && (
                                                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 mb-3 shadow-2xs">
                                                        <Pin className="h-3 w-3" />
                                                        <span>{dictionary.guestbook.pinnedBadge}</span>
                                                    </div>
                                                )}

                                                <div className="flex items-start justify-between gap-3">
                                                    {/* Author & Avatar */}
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${getAvatarGradient(entry.name)} flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0`}>
                                                            {getInitials(entry.name)}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                {entry.website ? (
                                                                    <a
                                                                        href={entry.website}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="font-bold text-sm text-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                                                                    >
                                                                        <span>{entry.name}</span>
                                                                        <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                                                                    </a>
                                                                ) : (
                                                                    <span className="font-bold text-sm text-foreground">{entry.name}</span>
                                                                )}
                                                            </div>
                                                            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                                                <Calendar className="h-3 w-3" />
                                                                <span>
                                                                    {new Date(entry.createdAt).toLocaleDateString(locale === 'id' ? "id-ID" : "en-US", {
                                                                        month: "short",
                                                                        day: "numeric",
                                                                        year: "numeric"
                                                                    })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Like Button */}
                                                    <button
                                                        onClick={() => handleLike(entry._id)}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border shrink-0 ${
                                                            isLiked
                                                                ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                                                                : "bg-muted/50 dark:bg-white/[0.04] text-muted-foreground hover:text-rose-500 hover:border-rose-500/30 border-border/60 dark:border-white/10"
                                                        }`}
                                                        title={isLiked ? (locale === 'id' ? "Anda menyukai catatan ini" : "You loved this note") : (locale === 'id' ? "Kirim apresiasi" : "Send love")}
                                                    >
                                                        <Heart className={`h-3.5 w-3.5 transition-transform ${isLiked ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
                                                        <span>{entry.likes || 0}</span>
                                                    </button>
                                                </div>

                                                {/* Message Content */}
                                                <p className="text-sm text-foreground/90 leading-relaxed mt-3.5 whitespace-pre-wrap">
                                                    {entry.message}
                                                </p>

                                                {/* Verified Owner Reply */}
                                                {entry.adminReply && (
                                                    <div className="mt-4 pt-3.5 border-t border-border/60 dark:border-white/10 flex items-start gap-3 bg-muted/30 dark:bg-white/[0.02] p-3.5 rounded-xl">
                                                        <div className="p-1.5 rounded-lg bg-primary/20 text-primary shrink-0 mt-0.5">
                                                            <CornerDownRight className="h-4 w-4" />
                                                        </div>
                                                        <div className="space-y-1 text-xs">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-foreground">Maulana ({locale === 'id' ? "Penulis" : "Author"})</span>
                                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/15 text-primary border border-primary/20">
                                                                    {dictionary.guestbook.adminReplyBadge}
                                                                </span>
                                                            </div>
                                                            <p className="text-muted-foreground leading-relaxed">
                                                                {entry.adminReply}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.article>
                                        );
                                    })}
                                </AnimatePresence>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between pt-6 border-t border-border/60 dark:border-white/10">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-border/80 dark:border-white/10 bg-card/60 hover:bg-muted/70 text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            <span>{locale === 'id' ? "Sebelumnya" : "Previous"}</span>
                                        </button>

                                        <span className="text-xs text-muted-foreground font-medium">
                                            {locale === 'id' ? "Halaman" : "Page"} <strong className="text-foreground">{page}</strong> {locale === 'id' ? "dari" : "of"} {totalPages}
                                        </span>

                                        <button
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-border/80 dark:border-white/10 bg-card/60 hover:bg-muted/70 text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                        >
                                            <span>{locale === 'id' ? "Selanjutnya" : "Next"}</span>
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-20 rounded-3xl border border-dashed border-border/80 dark:border-white/10 p-8">
                                <div className="h-12 w-12 rounded-2xl bg-muted/60 dark:bg-white/5 flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                                    <MessageSquare className="h-6 w-6" />
                                </div>
                                <h3 className="text-base font-bold text-foreground">{dictionary.guestbook.emptyStateTitle}</h3>
                                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                                    {searchQuery ? (locale === 'id' ? "Tidak ada catatan yang cocok dengan kata kunci pencarian." : "No entries match your search keyword. Try clearing your search.") : dictionary.guestbook.emptyStateDesc}
                                </p>
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="mt-4 px-4 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                    >
                                        {locale === 'id' ? "Hapus Filter Pencarian" : "Clear Search Filter"}
                                    </button>
                                )}
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
