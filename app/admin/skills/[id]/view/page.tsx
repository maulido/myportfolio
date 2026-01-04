"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2, Award, Calendar } from "lucide-react";
import Link from "next/link";

interface Skill {
    _id: string;
    name: string;
    level: 'Expert' | 'Advanced' | 'Intermediate' | 'Beginner';
    years: number;
    category: string;
    icon: string;
    color?: string;
    order: number;
    createdAt?: string;
    updatedAt?: string;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function SkillDetailViewPage({ params }: PageProps) {
    const router = useRouter();
    const [id, setId] = useState<string>("");
    const [item, setItem] = useState<Skill | null>(null);
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
            const response = await fetch(`/api/skills/${itemId}`);
            const data = await response.json();
            if (data.success) {
                setItem(data.data);
            }
        } catch (error) {
            console.error("Error fetching skill:", error);
            alert("Failed to load skill");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/skills/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                alert("Skill deleted successfully!");
                router.push("/admin/skills");
            } else {
                alert("Failed to delete skill");
            }
        } catch (error) {
            console.error("Error deleting skill:", error);
            alert("An error occurred while deleting");
        }
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'Expert': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'Advanced': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'Intermediate': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'Beginner': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            default: return 'bg-primary/10 text-primary border-primary/20';
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
                    <p className="text-xl font-bold mb-4">Skill not found</p>
                    <Link href="/admin/skills">
                        <button className="px-4 py-2 bg-primary text-white rounded-lg">
                            Back to Skills
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
                            Are you sure you want to delete this skill?
                            <br />
                            <span className="font-semibold text-foreground">"{item.name}"</span>
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
                        <Link href="/admin/skills">
                            <button type="button" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">Skill Details</h1>
                    </div>
                </div>

                {/* Content */}
                <div className="rounded-xl border border-primary/10 bg-card/10 backdrop-blur-sm p-8 space-y-6">
                    {/* Skill Header */}
                    <div className="flex items-start gap-6">
                        <div
                            className="h-24 w-24 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: item.color ? `${item.color}20` : 'rgba(var(--primary), 0.1)' }}
                        >
                            <Award className="h-12 w-12" style={{ color: item.color || 'var(--primary)' }} />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold mb-2">{item.name}</h2>
                            <p className="text-lg text-muted-foreground mb-3">{item.category}</p>
                            <div className={`inline-flex items-center px-4 py-2 rounded-full border-2 font-bold ${getLevelColor(item.level)}`}>
                                {item.level}
                            </div>
                        </div>
                    </div>

                    {/* Experience */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-background/50 rounded-xl p-4 border border-primary/10">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm font-medium">Experience</span>
                            </div>
                            <p className="text-2xl font-bold">
                                {item.years} {item.years === 1 ? 'Year' : 'Years'}
                            </p>
                        </div>
                        <div className="bg-background/50 rounded-xl p-4 border border-primary/10">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Award className="h-4 w-4" />
                                <span className="text-sm font-medium">Display Order</span>
                            </div>
                            <p className="text-2xl font-bold">{item.order}</p>
                        </div>
                    </div>

                    {/* Icon Info */}
                    <div>
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Icon Reference</h3>
                        <p className="text-sm font-mono bg-background/50 px-3 py-2 rounded-lg border border-primary/10">
                            {item.icon}
                        </p>
                    </div>

                    {/* Color */}
                    {item.color && (
                        <div>
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Color</h3>
                            <div className="flex items-center gap-3">
                                <div
                                    className="h-10 w-10 rounded-lg border-2 border-primary/20"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm font-mono bg-background/50 px-3 py-2 rounded-lg border border-primary/10">
                                    {item.color}
                                </span>
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
                    <Link href="/admin/skills">
                        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                            Back to Skills
                        </button>
                    </Link>
                    <div className="flex gap-3">
                        <Link href={`/admin/skills/${id}`}>
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
