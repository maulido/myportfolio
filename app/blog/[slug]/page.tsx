import { Navbar } from "@/components/Navbar";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag as TagIcon, Clock } from "lucide-react";
import { ShareButtons } from "@/components/ShareButtons";
import { EngagementButtons } from "@/components/EngagementButtons";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    try {
        const { slug } = await params;
        await dbConnect();
        const post = await Post.findOne({ slug });

        if (!post) {
            return { title: 'Post Not Found' };
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        return {
            title: `${post.title} | Maulido`,
            description: post.excerpt,
            openGraph: {
                title: post.title,
                description: post.excerpt,
                type: 'article',
                publishedTime: post.createdAt?.toISOString(),
                authors: ['Maulido'],
                url: `${baseUrl}/blog/${slug}`,
                images: [
                    {
                        url: `${baseUrl}/blog/${slug}/opengraph-image`,
                        width: 1200,
                        height: 630,
                        alt: post.title,
                    },
                ],
            },
            twitter: {
                card: 'summary_large_image',
                title: post.title,
                description: post.excerpt,
                images: [`${baseUrl}/blog/${slug}/opengraph-image`],
            },
        }
    } catch {
        return { title: 'Blog | Maulido' };
    }
}

// Generate static params for all blog posts (SSG)
export async function generateStaticParams() {
    try {
        await dbConnect();
        const posts = await Post.find({ published: true }).select('slug').lean();

        return posts.map((post) => ({
            slug: post.slug,
        }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

// Enable ISR - revalidate every hour
export const revalidate = 3600;

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params; // Await params here

    let post;
    try {
        await dbConnect();
        post = await Post.findOne({ slug });
    } catch (e) {
        console.error("Blog Post Error:", e);
        return notFound();
    }

    if (!post) {
        return notFound();
    }

    const words = post.content ? post.content.split(/\s+/).length : 0;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const blogJsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.excerpt,
        "image": post.coverImage || `${baseUrl}/og-image.png`,
        "datePublished": post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
        "dateModified": post.updatedAt ? new Date(post.updatedAt).toISOString() : (post.createdAt ? new Date(post.createdAt).toISOString() : undefined),
        "author": {
            "@type": "Person",
            "name": "Maulido",
            "url": baseUrl
        },
        "publisher": {
            "@type": "Person",
            "name": "Maulido",
            "url": baseUrl
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `${baseUrl}/blog/${slug}`
        },
        "keywords": post.tags?.join(', ')
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 pt-24 pb-16">
                <article className="container px-4 md:px-6 max-w-4xl mx-auto">
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
                    />
                    {/* Breadcrumbs with Schema.org JSON-LD */}
                    <div className="mb-6">
                        <Breadcrumb items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />
                    </div>

                    <Link href="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors group">
                        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Back to Blog
                    </Link>

                    <header className="mb-10 space-y-4">
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {readingTime} min read
                            </span>
                            {post.tags && post.tags.length > 0 && (
                                <span className="flex items-center gap-1">
                                    <TagIcon className="h-3.5 w-3.5" />
                                    {post.tags.join(', ')}
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight lg:text-5xl lg:leading-[1.1] text-gradient">{post.title}</h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">{post.excerpt}</p>
                        <div className="pt-4 flex flex-col gap-4">
                            <EngagementButtons slug={post.slug} />
                            <ShareButtons title={post.title} />
                        </div>
                    </header>

                    <div className="prose prose-invert prose-lg max-w-none border-t border-primary/10 pt-10">
                        {/* 
                In a real app, you would use a markdown parser here like 'react-markdown'.
                For now, we just display the content string.
            */}
                        <div className="whitespace-pre-wrap">{post.content}</div>
                    </div>

                </article>
            </main>
        </div>
    );
}
