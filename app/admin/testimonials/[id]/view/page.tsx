"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2, Star, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Testimonial {
    _id: string;
    name: string;
    role: string;
    company?: string;
    content?: string;
    testimonial?: string;
    rating?: number;
    image?: string;
    imageUrl?: string;
    featured?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function TestimonialDetailViewPage({ params }: PageProps) {
    const router = useRouter();
    const [id, setId] = useState<string>("");
    const [item, setItem] = useState<Testimonial | null>(null);
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
            const response = await fetch(`/api/testimonials/${itemId}`);
            const data = await response.json();
            if (data.success) {
                setItem(data.data);
            }
        } catch (error) {
            console.error("Error fetching testimonial:", error);
            alert("Failed to load testimonial");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/testimonials/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                alert("Testimonial deleted successfully!");
                router.push("/admin/testimonials");
            } else {
                alert("Failed to delete testimonial");
            }
        } catch (error) {
            console.error("Error deleting testimonial:", error);
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
                    <p className="text-xl font-bold mb-4">Testimonial not found</p>
                    <Link href="/admin/testimonials">
                        <button className="px-4 py-2 bg-primary text-white rounded-lg">
                            Back to Testimonials
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
                            Are you sure you want to delete this testimonial?
                            <br />
                            <span className="font-semibold text-foreground">From {item.name}</span>
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
                        <Link href="/admin/testimonials">
                            <button type="button" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">Testimonial Details</h1>
                    </div>
                </div>

                {/* Content */}
                <div className="rounded-xl border border-primary/10 bg-card/10 backdrop-blur-sm p-8 space-y-6">
                    {/* Person Info */}
                    <div className="flex items-start gap-4">
                        {(item.imageUrl || item.image) ? (
                            <div className="h-20 w-20 rounded-full overflow-hidden bg-muted flex-shrink-0">
                                <Image
                                    src={(item.imageUrl || item.image)!}
                                    alt={item.name}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                <User className="h-10 w-10" />
                            </div>
                        )}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-2xl font-bold">{item.name}</h2>
                                {item.featured && (
                                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">
                                        FEATURED
                                    </span>
                                )}
                            </div>
                            <p className="text-lg text-muted-foreground">
                                {item.role}{item.company && ` at ${item.company}`}
                            </p>
                            {item.rating && (
                                <div className="flex items-center gap-1 mt-2">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-5 w-5 ${i < item.rating! ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Testimonial */}
                    <div>
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">Testimonial</h3>
                        <blockquote className="text-foreground leading-relaxed text-lg italic border-l-4 border-primary/20 pl-4">
                            &quot;{item.content || item.testimonial}&quot;
                        </blockquote>
                    </div>

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
                    <Link href="/admin/testimonials">
                        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                            Back to Testimonials
                        </button>
                    </Link>
                    <div className="flex gap-3">
                        <Link href={`/admin/testimonials/${id}`}>
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
