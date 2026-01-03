"use client";

import { Twitter, Linkedin, Facebook, Link2, Share2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ShareButtonsProps {
    title: string;
    url?: string;
    description?: string;
}

export function ShareButtons({ title, url, description }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);

    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const shareText = description || title;

    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + shareUrl)}`,
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success('Link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error('Failed to copy link');
        }
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text: shareText,
                    url: shareUrl,
                });
            } catch (error) {
                // User cancelled or error occurred
            }
        }
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-2">Share:</span>

            <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-muted/30 hover:bg-[#1DA1F2] hover:text-white transition-all group"
                aria-label="Share on Twitter"
            >
                <Twitter className="h-4 w-4" />
            </a>

            <a
                href={shareLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-muted/30 hover:bg-[#0A66C2] hover:text-white transition-all"
                aria-label="Share on LinkedIn"
            >
                <Linkedin className="h-4 w-4" />
            </a>

            <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-muted/30 hover:bg-[#1877F2] hover:text-white transition-all"
                aria-label="Share on Facebook"
            >
                <Facebook className="h-4 w-4" />
            </a>

            <button
                onClick={copyToClipboard}
                className={`p-2 rounded-lg transition-all ${copied
                        ? 'bg-green-500 text-white'
                        : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                aria-label="Copy link"
            >
                <Link2 className="h-4 w-4" />
            </button>

            {typeof navigator !== 'undefined' && navigator.share && (
                <button
                    onClick={handleNativeShare}
                    className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all"
                    aria-label="Share"
                >
                    <Share2 className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
