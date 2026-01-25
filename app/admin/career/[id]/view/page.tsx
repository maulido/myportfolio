"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2, Calendar, MapPin, Briefcase } from "lucide-react";
import Link from "next/link";

interface CareerJourney {
    _id: string;
    type: 'work' | 'education' | 'achievement';
    title: string;
    organization: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
    skills?: string[];
    achievements?: string[];
    responsibilities?: string[];
    createdAt?: string;
    updatedAt?: string;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function CareerDetailViewPage({ params }: PageProps) {
    const router = useRouter();
    const [id, setId] = useState<string>("");
    const [item, setItem] = useState<CareerJourney | null>(null);
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
            const response = await fetch(`/api/career/${itemId}`);
            const data = await response.json();
            if (data.success) {
                setItem(data.data);
            }
        } catch (error) {
            console.error("Error fetching career entry:", error);
            alert("Failed to load career entry");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/career/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                alert("Career entry deleted successfully!");
                router.push("/admin/career");
            } else {
                alert("Failed to delete career entry");
            }
        } catch (error) {
            console.error("Error deleting career entry:", error);
            alert("An error occurred while deleting");
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'work': return 'bg-blue-500/10 text-blue-500';
            case 'education': return 'bg-green-500/10 text-green-500';
            case 'achievement': return 'bg-purple-500/10 text-purple-500';
            default: return 'bg-primary/10 text-primary';
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
                    <p className="text-xl font-bold mb-4">Career entry not found</p>
                    <Link href="/admin/career">
                        <button className="px-4 py-2 bg-primary text-white rounded-lg">
                            Back to Career Journey
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
                            Are you sure you want to delete this career entry?
                            <br />
                            <span className="font-semibold text-foreground">&quot;{item.title}&quot;</span>
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
                        <Link href="/admin/career">
                            <button type="button" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">Career Journey Details</h1>
                    </div>
                </div>

                {/* Content */}
                <div className="rounded-xl border border-primary/10 bg-card/10 backdrop-blur-sm p-8 space-y-6">
                    {/* Title & Type */}
                    <div>
                        <div className="flex items-start justify-between mb-2">
                            <h2 className="text-2xl font-bold">{item.title}</h2>
                            <div className="flex gap-2">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${getTypeColor(item.type)}`}>
                                    {item.type.toUpperCase()}
                                </span>
                                {item.current && (
                                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-500/10 text-green-500">
                                        CURRENT
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <Briefcase className="h-4 w-4" />
                            <span className="text-lg">{item.organization}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            {item.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>{item.location}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {new Date(item.startDate).toLocaleDateString()} - {item.current ? 'Present' : item.endDate ? new Date(item.endDate).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Description</h3>
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap">{item.description}</p>
                    </div>

                    {/* Responsibilities */}
                    {item.responsibilities && item.responsibilities.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Responsibilities</h3>
                            <ul className="list-disc list-inside space-y-1 text-foreground">
                                {item.responsibilities.map((resp, index) => (
                                    <li key={index}>{resp}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Achievements */}
                    {item.achievements && item.achievements.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Achievements</h3>
                            <ul className="list-disc list-inside space-y-1 text-foreground">
                                {item.achievements.map((achievement, index) => (
                                    <li key={index}>{achievement}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Skills */}
                    {item.skills && item.skills.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {item.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                                    >
                                        {skill}
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
                    <Link href="/admin/career">
                        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                            Back to Career Journey
                        </button>
                    </Link>
                    <div className="flex gap-3">
                        <Link href={`/admin/career/${id}`}>
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
