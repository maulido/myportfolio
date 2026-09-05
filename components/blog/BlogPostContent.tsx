"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Tag as TagIcon, Clock } from "lucide-react";
import { ShareButtons } from "@/components/ShareButtons";
import { EngagementButtons } from "@/components/EngagementButtons";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLanguage } from "@/context/LanguageContext";
import { getLocalizedField } from "@/lib/localization";

export interface SerializedPost {
    _id: string;
    title: string;
    title_id?: string;
    slug: string;
    excerpt: string;
    excerpt_id?: string;
    content: string;
    content_id?: string;
    tags?: string[];
    createdAt: string;
    coverImage?: string;
}

export function BlogPostContent({ post }: { post: SerializedPost }) {
    const { locale } = useLanguage();

    const title = getLocalizedField(post, 'title', locale, post.title);
    const excerpt = getLocalizedField(post, 'excerpt', locale, post.excerpt);
    const content = getLocalizedField(post, 'content', locale, post.content);

    const words = content ? content.split(/\s+/).length : 0;
    const readingTime = Math.max(1, Math.ceil(words / 200));

    return (
        <article className="container px-4 md:px-6 max-w-4xl mx-auto">
            {/* Breadcrumbs */}
            <div className="mb-6">
                <Breadcrumb items={[{ label: "Blog", href: "/blog" }, { label: title }]} />
            </div>

            <Link href="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors group">
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Blog
            </Link>

            <header className="mb-10 space-y-4">
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-accent" />
                        {readingTime} min read
                    </span>
                    {post.tags && post.tags.length > 0 && (
                        <span className="flex items-center gap-1">
                            <TagIcon className="h-3.5 w-3.5" />
                            {post.tags.join(', ')}
                        </span>
                    )}
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight lg:text-5xl lg:leading-[1.1] text-gradient">{title}</h1>
                <p className="text-xl text-muted-foreground leading-relaxed">{excerpt}</p>
                <div className="pt-4 flex flex-col gap-4">
                    <EngagementButtons slug={post.slug} />
                    <ShareButtons title={title} />
                </div>
            </header>

            {post.coverImage && (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-10 border border-border/80 dark:border-white/10 shadow-xl bg-card">
                    <Image
                        src={post.coverImage}
                        alt={title}
                        fill
                        className="object-cover"
                        priority
                        unoptimized
                    />
                </div>
            )}

            <div className="prose prose-invert prose-lg max-w-none border-t border-primary/10 pt-10">
                <div className="whitespace-pre-wrap">{content}</div>
            </div>
        </article>
    );
}
