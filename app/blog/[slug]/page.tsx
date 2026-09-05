import { Navbar } from "@/components/Navbar";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import { notFound } from "next/navigation";
import { Metadata } from 'next';
import { BlogPostContent } from "@/components/blog/BlogPostContent";

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

    const serializedPost = {
        _id: String(post._id),
        title: post.title || "",
        title_id: post.title_id || "",
        slug: post.slug || "",
        excerpt: post.excerpt || "",
        excerpt_id: post.excerpt_id || "",
        content: post.content || "",
        content_id: post.content_id || "",
        tags: Array.isArray(post.tags) ? post.tags : [],
        createdAt: post.createdAt ? new Date(post.createdAt).toISOString() : new Date().toISOString(),
        coverImage: post.coverImage || "",
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 pt-24 pb-16">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
                />
                <BlogPostContent post={serializedPost} />
            </main>
        </div>
    );
}
