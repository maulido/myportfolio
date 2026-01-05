"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2, Calendar, Tag, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface BlogPost {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    tags: string[];
    published: boolean;
    featured: boolean;
    coverImage?: string;
    author: string;
    publishedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function BlogPostDetailViewPage({ params }: PageProps) {
    const router = useRouter();
    const [id, setId] = useState<string>("");
    const [item, setItem] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    useEffect(() => {
        params.then((resolvedParams) => {
            setId(resolvedParams.id);
            fetchItem(resolvedParams.id);
        });
    }, [params]);

    const fetchItem = async (itemId: string) => {
        try {
            const response = await fetch(`/api/blog/${itemId}`);
            const data = await response.json();
            if (data.success) {
                setItem(data.data);
            }
        } catch (error) {
            console.error("Error fetching blog post:", error);
            alert("Failed to load blog post");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/blog/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                alert("Blog post deleted successfully!");
                router.push("/admin/posts");
            } else {
                alert("Failed to delete blog post");
            }
        } catch (error) {
            console.error("Error deleting blog post:", error);
            alert("An error occurred while deleting");
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <p className="text-xl font-bold mb-4">Blog post not found</p>
                    <Link href="/admin/posts">
                        <button className="px-4 py-2 bg-primary text-white rounded-lg">
                            Back to Blog Posts
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background/50 p-8">
            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card border border-primary/20 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
                        <p className="text-muted-foreground mb-6">
                            Are you sure you want to delete this blog post?
                            <br />
                            <span className="font-semibold text-foreground">"{item.title}"</span>
                            <br /><br />
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirm(false)}
                                className="px-4 py-2 rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/posts">
                            <button type="button" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">Blog Post Details</h1>
                    </div>
                </div>

                {/* Content */}
                <div className="rounded-xl border border-primary/10 bg-card/10 backdrop-blur-sm p-8 space-y-6">
                    {/* Cover Image */}
                    {item.coverImage && (
                        <div className="relative h-64 rounded-xl overflow-hidden bg-muted">
                            <Image
                                src={item.coverImage}
                                alt={item.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}

                    {/* Title & Status */}
                    <div>
                        <div className="flex items-start justify-between mb-2">
                            <h2 className="text-3xl font-bold">{item.title}</h2>
                            <div className="flex gap-2 flex-shrink-0 ml-4">
                                {item.published ? (
                                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-500/10 text-green-500">
                                        PUBLISHED
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500">
                                        DRAFT
                                    </span>
                                )}
                                {item.featured && (
                                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/10 text-purple-500">
                                        FEATURED
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>{item.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                <span>{item.category}</span>
                            </div>
                            {item.publishedAt && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Excerpt</h3>
                        <p className="text-foreground leading-relaxed">{item.excerpt}</p>
                    </div>

                    {/* Content */}
                    <div>
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Content</h3>
                        <div
                            className="prose prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: item.content }}
                        />
                    </div>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {item.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Metadata */}
                    {(item.createdAt || item.updatedAt) && (
                        <div className="pt-6 border-t border-primary/10">
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">Metadata</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                {item.createdAt && (
                                    <div>
                                        <span className="text-muted-foreground">Created:</span>
                                        <p className="font-medium">{new Date(item.createdAt).toLocaleString()}</p>
                                    </div>
                                )}
                                {item.updatedAt && (
                                    <div>
                                        <span className="text-muted-foreground">Updated:</span>
                                        <p className="font-medium">{new Date(item.updatedAt).toLocaleString()}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center">
                    <Link href="/admin/posts">
                        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                            Back to Blog Posts
                        </button>
                    </Link>
                    <div className="flex gap-3">
                        <Link href={`/admin/blog/${id}`}>
                            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </button>
                        </Link>
                        <button
                            onClick={() => setDeleteConfirm(true)}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-red-500 text-white hover:bg-red-600 h-10 px-4 py-2"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
