"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2, Calendar, Award, ExternalLink, Tag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Certification {
    _id: string;
    title: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;
    category: string;
    imageUrl?: string;
    skills?: string[];
    createdAt?: string;
    updatedAt?: string;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function CertificationDetailViewPage({ params }: PageProps) {
    const router = useRouter();
    const [id, setId] = useState<string>("");
    const [item, setItem] = useState<Certification | null>(null);
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
            const response = await fetch(`/api/certifications/${itemId}`);
            const data = await response.json();
            if (data.success) {
                setItem(data.data);
            }
        } catch (error) {
            console.error("Error fetching certification:", error);
            alert("Failed to load certification");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/certifications/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                alert("Certification deleted successfully!");
                router.push("/admin/certifications");
            } else {
                alert("Failed to delete certification");
            }
        } catch (error) {
            console.error("Error deleting certification:", error);
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
                    <p className="text-xl font-bold mb-4">Certification not found</p>
                    <Link href="/admin/certifications">
                        <button className="px-4 py-2 bg-primary text-white rounded-lg">
                            Back to Certifications
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
                            Are you sure you want to delete this certification?
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
                        <Link href="/admin/certifications">
                            <button type="button" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">Certification Details</h1>
                    </div>
                </div>

                {/* Content */}
                <div className="rounded-xl border border-primary/10 bg-card/10 backdrop-blur-sm overflow-hidden">
                    {/* Image */}
                    {item.imageUrl && (
                        <div className="relative h-64 bg-muted">
                            <Image
                                src={item.imageUrl}
                                alt={item.title}
                                fill
                                className="object-contain p-4"
                            />
                        </div>
                    )}

                    {/* Details */}
                    <div className="p-8 space-y-6">
                        <div>
                            <div className="flex items-start justify-between mb-2">
                                <h2 className="text-2xl font-bold">{item.title}</h2>
                                <Award className="h-6 w-6 text-primary" />
                            </div>
                            <p className="text-lg text-muted-foreground mb-4">{item.issuer}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Tag className="h-4 w-4" />
                                    <span>{item.category}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Issued: {new Date(item.issueDate).toLocaleDateString()}</span>
                                </div>
                                {item.expiryDate && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>Expires: {new Date(item.expiryDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {item.credentialId && (
                            <div>
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Credential ID</h3>
                                <p className="text-foreground font-mono text-sm">{item.credentialId}</p>
                            </div>
                        )}

                        {item.credentialUrl && (
                            <div>
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Credential URL</h3>
                                <a
                                    href={item.credentialUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline flex items-center gap-2"
                                >
                                    {item.credentialUrl}
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </div>
                        )}

                        {item.skills && item.skills.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Skills Covered</h3>
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
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center">
                    <Link href="/admin/certifications">
                        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                            Back to Certifications
                        </button>
                    </Link>
                    <div className="flex gap-3">
                        <Link href={`/admin/certifications/${id}`}>
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
