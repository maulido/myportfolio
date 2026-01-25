"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Heart } from "lucide-react";
import toast from "react-hot-toast";

interface EngagementButtonsProps {
    slug: string;
}

export function EngagementButtons({ slug }: EngagementButtonsProps) {
    const [views, setViews] = useState(0);
    const [likes, setLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEngagement = async () => {
            try {
                // Fetch initial data
                const res = await fetch(`/api/blog/${slug}/engagement`);
                const data = await res.json();

                if (data.success) {
                    setViews(data.data.views);
                    setLikes(data.data.likes);
                }

                // Register view
                // Use session storage to prevent duplicate view counts in single session if desired
                const viewedKey = `viewed_${slug}`;
                if (!sessionStorage.getItem(viewedKey)) {
                    await fetch(`/api/blog/${slug}/engagement`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "view" }),
                    });
                    sessionStorage.setItem(viewedKey, "true");
                    // Update view count locally instantly for better UX
                    setViews(prev => prev + 1);
                }
            } catch (error) {
                console.error("Failed to fetch engagement stats", error);
            } finally {
                setLoading(false);
            }
        };

        const likedKey = `liked_${slug}`;
        if (localStorage.getItem(likedKey)) {
            setHasLiked(true);
        }

        fetchEngagement();
    }, [slug]);

    const handleLike = async () => {
        if (hasLiked) {
            toast.error("You've already liked this post!");
            return;
        }

        try {
            // Optimistic update
            setLikes(prev => prev + 1);
            setHasLiked(true);

            const res = await fetch(`/api/blog/${slug}/engagement`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "like" }),
            });

            if (res.ok) {
                localStorage.setItem(`liked_${slug}`, "true");
                toast.success("Thanks for the love!");
            } else {
                // Revert if failed
                setLikes(prev => prev - 1);
                setHasLiked(false);
            }
        } catch (error) {
            console.error("Failed to like post", error);
            setLikes(prev => prev - 1);
            setHasLiked(false);
        }
    };

    if (loading) {
        return <div className="h-10 w-32 bg-muted/20 animate-pulse rounded-full" />;
    }

    return (
        <div className="flex items-center gap-6 py-4">
            <div className="flex items-center gap-2 text-muted-foreground" title="Views">
                <Eye className="h-5 w-5" />
                <span className="text-sm font-medium">{views.toLocaleString()}</span>
            </div>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleLike}
                disabled={hasLiked}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${hasLiked
                    ? "bg-red-500/10 text-red-500 border border-red-500/20"
                    : "hover:bg-red-500/5 hover:text-red-500 border border-transparent"
                    }`}
                title="Like this post"
            >
                <Heart className={`h-5 w-5 ${hasLiked ? "fill-current" : ""}`} />
                <span className="text-sm font-medium">{likes.toLocaleString()}</span>
            </motion.button>
        </div>
    );
}
