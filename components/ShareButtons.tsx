"use client";

import { motion } from "framer-motion";
import { Linkedin, Twitter, Link as LinkIcon, Facebook } from "lucide-react";
import toast from "react-hot-toast";

interface ShareButtonsProps {
    title: string;
    url?: string; // Optional, defaults to current window.location.href
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
    // Helper to get URL client-side if not provided
    const getUrl = () => {
        if (typeof window !== "undefined") {
            return url || window.location.href;
        }
        return "";
    };

    const handleShare = (platform: string) => {
        const shareUrl = getUrl();
        const shareTitle = encodeURIComponent(title);
        const shareUrlEncoded = encodeURIComponent(shareUrl);

        let targetUrl = "";

        switch (platform) {
            case "linkedin":
                targetUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrlEncoded}`;
                break;
            case "twitter":
                targetUrl = `https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrlEncoded}`;
                break;
            case "facebook":
                targetUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrlEncoded}`;
                break;
            case "whatsapp":
                targetUrl = `https://wa.me/?text=${shareTitle}%20${shareUrlEncoded}`;
                break;
        }

        if (targetUrl) {
            window.open(targetUrl, "_blank", "width=600,height=400");
        }
    };

    const handleCopy = () => {
        const shareUrl = getUrl();
        navigator.clipboard.writeText(shareUrl).then(() => {
            toast.success("Link copied to clipboard!");
        });
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground mr-2">Share this:</span>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleShare("linkedin")}
                className="p-2 rounded-full bg-[#0077b5]/10 text-[#0077b5] hover:bg-[#0077b5] hover:text-white transition-colors"
                title="Share on LinkedIn"
            >
                <Linkedin className="h-4 w-4" />
            </motion.button>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleShare("twitter")}
                className="p-2 rounded-full bg-black/5 dark:bg-white/10 text-foreground hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                title="Share on X (Twitter)"
            >
                <Twitter className="h-4 w-4" />
            </motion.button>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleShare("facebook")}
                className="p-2 rounded-full bg-[#1877f2]/10 text-[#1877f2] hover:bg-[#1877f2] hover:text-white transition-colors"
                title="Share on Facebook"
            >
                <Facebook className="h-4 w-4" />
            </motion.button>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopy}
                className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                title="Copy Link"
            >
                <LinkIcon className="h-4 w-4" />
            </motion.button>
        </div>
    );
}
