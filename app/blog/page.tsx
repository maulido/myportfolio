"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Breadcrumb } from "@/components/Breadcrumb";
import { 
    Calendar, 
    Clock, 
    ArrowRight, 
    Search, 
    X, 
    BookOpen, 
    TrendingUp, 
    Tag, 
    Sparkles, 
    Mail, 
    CheckCircle2, 
    AlertCircle 
} from "lucide-react";
import { Skeleton } from "@/components/Skeleton";
import { SpotlightCard } from "@/components/SpotlightCard";
import { useSettings } from "@/lib/useSettings";
import { useLanguage } from "@/context/LanguageContext";
import { getLocalizedField } from "@/lib/localization";

interface IPost {
    _id: string;
    title: string;
    title_id?: string;
    slug: string;
    excerpt: string;
    excerpt_id?: string;
    content?: string;
    content_id?: string;
    category?: string;
    tags: string[];
    createdAt: string | Date;
    coverImage?: string;
    views?: number;
    likes?: number;
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

export default function BlogPage() {
    const { locale } = useLanguage();
    const [posts, setPosts] = useState<IPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    const { get } = useSettings();
    const heroBadge = get("blogHeroBadge", "Technical Publications & Notes");
    const heroTitle = get("blogHeroTitle", "Engineering Insights & Dispatches");
    const heroSubtitle = get("blogHeroSubtitle", "Architectural blueprints, network routing analyses, full-stack optimizations, and lessons learned from production.");
    const newsletterTitle = get("blogNewsletterTitle", "Stay Updated with Technical Analyses");
    const newsletterDesc = get("blogNewsletterDesc", "Receive occasional in-depth articles on network security, distributed systems, and modern full-stack development. No spam, ever.");

    // Newsletter state
    const [subscriberEmail, setSubscriberEmail] = useState("");
    const [submittingEmail, setSubmittingEmail] = useState(false);
    const [subscriptionMessage, setSubscriptionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        async function fetchPosts() {
            try {
                const res = await fetch('/api/blog');
                const data = await res.json();
                if (data.success) {
                    setPosts(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch posts", error);
            } finally {
                setLoading(false);
            }
        }
        fetchPosts();
    }, []);

    const allTags = useMemo(() => {
        const set = new Set<string>();
        posts.forEach(p => {
            if (Array.isArray(p.tags)) {
                p.tags.forEach(t => set.add(t));
            }
        });
        return Array.from(set);
    }, [posts]);

    const filteredPosts = useMemo(() => {
        return posts.filter(post => {
            const matchesSearch = !searchQuery || 
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (post.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesTag = !selectedTag || (post.tags || []).includes(selectedTag);

            return matchesSearch && matchesTag;
        });
    }, [posts, searchQuery, selectedTag]);

    const featuredPost = useMemo(() => {
        if (posts.length === 0) return null;
        // Take the latest post with a cover image or the very first post
        return posts.find(p => p.coverImage) || posts[0];
    }, [posts]);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subscriberEmail || !subscriberEmail.includes("@")) return;

        setSubmittingEmail(true);
        setSubscriptionMessage(null);

        try {
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: subscriberEmail })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setSubscriptionMessage({ text: "Subscribed! You will receive future engineering dispatches.", type: "success" });
                setSubscriberEmail("");
            } else {
                setSubscriptionMessage({ text: data.error || "Subscription failed. Please try again.", type: "error" });
            }
        } catch {
            setSubscriptionMessage({ text: "Network error. Please try again later.", type: "error" });
        } finally {
            setSubmittingEmail(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />
            <main className="flex-1 pt-20 pb-20">
                {/* Ambient Lighting */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />

                {/* Breadcrumbs */}
                <div className="container mx-auto px-4 md:px-6 py-4">
                    <Breadcrumb items={[{ label: "Blog" }]} />
                </div>

                {/* Hero Header */}
                <section className="container mx-auto px-4 md:px-6 pt-4 pb-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="max-w-2xl"
                        >
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-3">
                                <BookOpen className="h-3.5 w-3.5" />
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
                                <TrendingUp className="h-4 w-4 text-primary" />
                                <div>
                                    <span className="font-bold text-foreground">{posts.length}</span>
                                    <span className="text-muted-foreground ml-1">Published Articles</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm text-xs font-medium shadow-xs">
                                <Tag className="h-4 w-4 text-accent" />
                                <div>
                                    <span className="font-bold text-foreground">{allTags.length}</span>
                                    <span className="text-muted-foreground ml-1">Topics</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Featured Story Showcase (if available and no active search) */}
                {!loading && featuredPost && !searchQuery && !selectedTag && (
                    <section className="container mx-auto px-4 md:px-6 mb-12">
                        <SpotlightCard className="p-6 md:p-8 group hover:scale-[1.01] transition-all duration-300" spotlightColor="rgba(56, 189, 248, 0.12)">
                            <div className="grid gap-8 lg:grid-cols-12 items-center">
                                {featuredPost.coverImage && (
                                    <div className="lg:col-span-6 aspect-video relative rounded-xl overflow-hidden bg-muted/20 border border-border/60">
                                        <Image
                                            src={featuredPost.coverImage}
                                            alt={featuredPost.title}
                                            fill
                                            placeholder="blur"
                                            blurDataURL={getShimmerDataUrl(600, 340)}
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            sizes="(max-width: 1024px) 100vw, 550px"
                                            unoptimized
                                        />
                                    </div>
                                )}
                                <div className={featuredPost.coverImage ? "lg:col-span-6 space-y-4" : "lg:col-span-12 space-y-4"}>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-primary/15 text-primary border border-primary/25">
                                            <Sparkles className="h-3 w-3" /> Featured Article
                                        </span>
                                        {featuredPost.category && (
                                            <span className="text-xs text-muted-foreground">· {featuredPost.category}</span>
                                        )}
                                    </div>

                                    <Link href={`/blog/${featuredPost.slug}`} className="block group-hover:text-primary transition-colors">
                                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-snug">
                                            {getLocalizedField(featuredPost, 'title', locale, featuredPost.title)}
                                        </h2>
                                    </Link>

                                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-3">
                                        {getLocalizedField(featuredPost, 'excerpt', locale, featuredPost.excerpt)}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5 text-primary" />
                                            {new Date(featuredPost.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5 text-accent" />
                                            {Math.max(1, Math.ceil((featuredPost.content ? featuredPost.content.split(/\s+/).length : 500) / 200))} min read
                                        </span>
                                    </div>

                                    <div className="pt-2">
                                        <Link
                                            href={`/blog/${featuredPost.slug}`}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-[1.02]"
                                        >
                                            <span>Read Deep Dive</span>
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </SpotlightCard>
                    </section>
                )}

                {/* Search & Topic Filters */}
                <section className="container mx-auto px-4 md:px-6 mb-10">
                    <div className="p-4 md:p-6 rounded-2xl border border-border/80 dark:border-white/10 bg-card/70 backdrop-blur-md shadow-sm space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search articles by title, topic, or keyword..."
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

                        {/* Topics Filter Pills */}
                        <div className="flex flex-wrap gap-2 items-center pt-1">
                            <span className="text-xs font-semibold text-muted-foreground mr-1 shrink-0">
                                Topics:
                            </span>
                            <button
                                onClick={() => setSelectedTag(null)}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                    selectedTag === null
                                        ? "bg-primary text-white shadow-xs"
                                        : "bg-background/60 border border-border/60 hover:border-primary/40 text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                All Articles
                            </button>
                            {allTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                        selectedTag === tag
                                            ? "bg-primary text-white shadow-xs"
                                            : "bg-background/60 border border-border/60 hover:border-primary/40 text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results Indicator */}
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <p className="text-xs md:text-sm text-muted-foreground font-medium">
                            Showing <span className="font-bold text-foreground">{filteredPosts.length}</span> of {posts.length} articles
                        </p>
                        {(searchQuery || selectedTag) && (
                            <button
                                onClick={() => { setSearchQuery(""); setSelectedTag(null); }}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            >
                                <X className="h-3.5 w-3.5" />
                                <span>Clear Filters</span>
                            </button>
                        )}
                    </div>
                </section>

                {/* Articles Grid */}
                <section className="container mx-auto px-4 md:px-6">
                    {loading ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="rounded-2xl border border-border/80 bg-card/50 p-6 space-y-4">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-6 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                    <div className="flex gap-2">
                                        <Skeleton className="h-5 w-16 rounded-md" />
                                        <Skeleton className="h-5 w-16 rounded-md" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredPosts.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <AnimatePresence mode="popLayout">
                                {filteredPosts.map((post, index) => (
                                    <motion.article
                                        key={post._id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={{ duration: 0.3, delay: index * 0.04 }}
                                        className="h-full"
                                    >
                                        <SpotlightCard className="h-full flex flex-col justify-between group hover:scale-[1.02] transition-all duration-300">
                                            <div>
                                                {/* Cover Image */}
                                                {post.coverImage && (
                                                    <div className="aspect-video relative rounded-t-xl overflow-hidden bg-muted/20 border-b border-border/60">
                                                        <Image
                                                            src={post.coverImage}
                                                            alt={post.title}
                                                            fill
                                                            placeholder="blur"
                                                            blurDataURL={getShimmerDataUrl(400, 240)}
                                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                            sizes="(max-width: 768px) 100vw, 360px"
                                                            unoptimized
                                                        />
                                                    </div>
                                                )}

                                                <div className="p-6 space-y-3">
                                                    {/* Meta Dates */}
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3 text-primary" />
                                                            {new Date(post.createdAt).toLocaleDateString()}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3 text-accent" />
                                                            {Math.max(1, Math.ceil((post.content ? post.content.split(/\s+/).length : 500) / 200))} min
                                                        </span>
                                                    </div>

                                                    <Link href={`/blog/${post.slug}`} className="block group-hover:text-primary transition-colors">
                                                        <h2 className="text-xl font-bold tracking-tight text-foreground line-clamp-2 leading-snug">
                                                            {getLocalizedField(post, 'title', locale, post.title)}
                                                        </h2>
                                                    </Link>

                                                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                                        {getLocalizedField(post, 'excerpt', locale, post.excerpt)}
                                                    </p>

                                                    {/* Tags */}
                                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                                        {post.tags.slice(0, 3).map(tag => (
                                                            <span
                                                                key={tag}
                                                                className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-muted/60 dark:bg-muted/40 text-muted-foreground border border-border/50"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                        {post.tags.length > 3 && (
                                                            <span className="text-[10px] text-muted-foreground/60 self-center">
                                                                +{post.tags.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card Footer */}
                                            <div className="px-6 pb-6 pt-2">
                                                <Link
                                                    href={`/blog/${post.slug}`}
                                                    className="inline-flex items-center text-xs font-bold text-primary group-hover:text-accent transition-all group-hover:gap-1.5"
                                                >
                                                    <span>Read Full Article</span>
                                                    <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                                                </Link>
                                            </div>
                                        </SpotlightCard>
                                    </motion.article>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <SpotlightCard className="p-12 md:p-16 text-center max-w-lg mx-auto">
                            <div className="h-14 w-14 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="h-7 w-7" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">No Articles Found</h3>
                            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                                We couldn&apos;t find any articles matching your search criteria.
                            </p>
                            <button
                                onClick={() => { setSearchQuery(""); setSelectedTag(null); }}
                                className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
                            >
                                Clear Filters
                            </button>
                        </SpotlightCard>
                    )}
                </section>

                {/* Newsletter Subscription CTA */}
                <section className="container mx-auto px-4 md:px-6 pt-16">
                    <SpotlightCard className="p-8 md:p-12 text-center relative overflow-hidden" spotlightColor="rgba(56, 189, 248, 0.15)">
                        <div className="max-w-xl mx-auto space-y-4 relative z-10">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                                <Mail className="h-3.5 w-3.5" />
                                <span>Engineering Dispatch</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                                {newsletterTitle}
                            </h2>
                            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                                {newsletterDesc}
                            </p>

                            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 pt-2 max-w-md mx-auto">
                                <input
                                    type="email"
                                    placeholder="Enter your email address..."
                                    value={subscriberEmail}
                                    onChange={(e) => setSubscriberEmail(e.target.value)}
                                    required
                                    className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-border/80 dark:border-white/10 bg-background/60 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/60"
                                />
                                <button
                                    type="submit"
                                    disabled={submittingEmail}
                                    className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-50 shrink-0 cursor-pointer"
                                >
                                    {submittingEmail ? "Subscribing..." : "Subscribe"}
                                </button>
                            </form>

                            {subscriptionMessage && (
                                <div className={`inline-flex items-center gap-1.5 text-xs font-medium pt-1 ${
                                    subscriptionMessage.type === "success" ? "text-emerald-500" : "text-red-500"
                                }`}>
                                    {subscriptionMessage.type === "success" ? (
                                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                                    ) : (
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                    )}
                                    <span>{subscriptionMessage.text}</span>
                                </div>
                            )}
                        </div>
                    </SpotlightCard>
                </section>
            </main>
        </div>
    );
}
