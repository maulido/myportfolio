import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag as TagIcon } from "lucide-react";
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    try {
        const { slug } = await params;
        await dbConnect();
        const post = await Post.findOne({ slug });

        if (!post) {
            return { title: 'Post Not Found' };
        }

        return {
            title: `${post.title} | John Doe`,
            description: post.excerpt,
        }
    } catch (e) {
        return { title: 'Blog | John Doe' };
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

    return (
        <div className="flex min-h-screen flex-col">
            <ReadingProgressBar />
            <Navbar />
            <main className="flex-1 pt-24 pb-16">
                <article className="container px-4 md:px-6 max-w-4xl mx-auto">
                    <Link href="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors group">
                        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Back to Blog
                    </Link>

                    <header className="mb-10 space-y-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                                <TagIcon className="h-3 w-3" />
                                {post.tags.join(', ')}
                            </span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight lg:text-5xl lg:leading-[1.1] text-gradient">{post.title}</h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">{post.excerpt}</p>
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
            <Footer />
        </div>
    );
}
