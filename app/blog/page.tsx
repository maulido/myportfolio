"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Calendar, Clock, ArrowRight } from "lucide-react";

import { Skeleton } from "@/components/Skeleton";
import { Search } from "lucide-react";

interface IPost {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    tags: string[];
    createdAt: Date;
    coverImage?: string;
}

export default function BlogPage() {
    const [posts, setPosts] = useState<IPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

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

    const allTags = Array.from(new Set(posts.flatMap(post => post.tags)));

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTag = selectedTag ? post.tags.includes(selectedTag) : true;
        return matchesSearch && matchesTag;
    });

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 pt-24 pb-16">
                <div className="container mx-auto px-4 md:px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl font-bold tracking-tighter md:text-5xl lg:text-6xl mb-4">
                            Latest <span className="text-gradient">Insights</span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-[700px] mx-auto">
                            Thoughts on technology, network engineering, and software development.
                        </p>
                    </motion.div>

                    {/* Search and Filter UI */}
                    <div className="max-w-4xl mx-auto mb-12 space-y-6">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-card/40 backdrop-blur-md border border-primary/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-lg shadow-xl"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center">
                            <button
                                onClick={() => setSelectedTag(null)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedTag === null
                                        ? "bg-primary text-white shadow-lg shadow-primary/25"
                                        : "bg-card/50 text-muted-foreground hover:bg-card hover:text-primary border border-primary/10"
                                    }`}
                            >
                                All Topics
                            </button>
                            {allTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedTag(tag)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedTag === tag
                                            ? "bg-primary text-white shadow-lg shadow-primary/25"
                                            : "bg-card/50 text-muted-foreground hover:bg-card hover:text-primary border border-primary/10"
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-2 max-w-5xl mx-auto">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="rounded-2xl border border-primary/10 bg-card/30 p-8 space-y-4">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-8 w-full" />
                                    <Skeleton className="h-20 w-full" />
                                    <div className="flex gap-2">
                                        <Skeleton className="h-6 w-16 rounded-full" />
                                        <Skeleton className="h-6 w-16 rounded-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredPosts.length > 0 ? (
                        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-2 max-w-5xl mx-auto">
                            {filteredPosts.map((post, index) => (
                                <motion.article
                                    key={post._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="group relative flex flex-col justify-between rounded-2xl border border-primary/10 bg-card/30 backdrop-blur-sm p-8 hover:border-primary/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                5 min read
                                            </span>
                                        </div>
                                        <Link href={`/blog/${post.slug}`} className="block">
                                            <h2 className="text-2xl font-bold group-hover:text-primary transition-colors leading-tight">{post.title}</h2>
                                        </Link>
                                        <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                                            {post.excerpt}
                                        </p>
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {post.tags.map(tag => (
                                                <span key={tag} className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-semibold text-primary/80">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="pt-8">
                                        <Link
                                            href={`/blog/${post.slug}`}
                                            className="inline-flex items-center text-sm font-medium text-primary hover:text-accent transition-colors group/link"
                                        >
                                            Read Article
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                                        </Link>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 grayscale opacity-50">
                            <p className="text-xl text-muted-foreground">No articles found matching your criteria.</p>
                            <button
                                onClick={() => { setSearchQuery(""); setSelectedTag(null); }}
                                className="mt-4 text-primary font-medium hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
