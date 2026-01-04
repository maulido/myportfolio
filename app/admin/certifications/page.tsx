"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, ArrowLeft, Award, Eye } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
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
}

export default function AdminCertificationsListPage() {
    const [items, setItems] = useState<Certification[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; title: string }>({
        show: false,
        id: "",
        title: ""
    });

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await fetch("/api/certifications");
            const data = await response.json();
            if (data.success) {
                setItems(data.data);
            }
        } catch (error) {
            console.error("Error fetching certifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        const { id } = deleteConfirm;
        setDeleteConfirm({ show: false, id: "", title: "" });

        try {
            const response = await fetch(`/api/certifications/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                alert("Certification deleted successfully!");
                fetchItems();
            } else {
                alert("Failed to delete certification");
            }
        } catch (error) {
            console.error("Error deleting certification:", error);
            alert("An error occurred while deleting");
        }
    };

    const categories = ["all", ...Array.from(new Set(items.map(item => item.category)))];

    const filteredItems = items.filter((item) => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.issuer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background/50 p-8">
            {/* Delete Confirmation Modal */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card border border-primary/20 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
                        <p className="text-muted-foreground mb-6">
                            Are you sure you want to delete this certification?
                            <br />
                            <span className="font-semibold text-foreground">"{deleteConfirm.title}"</span>
                            <br /><br />
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirm({ show: false, id: "", title: "" })}
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

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/admin">
                        <button type="button" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Certifications</h1>
                </div>

                {/* Search, Filter and Add */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search certifications..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 rounded-xl bg-card border border-primary/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
                            />
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-4 py-2 rounded-xl bg-card border border-primary/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat === "all" ? "All Categories" : cat}</option>
                            ))}
                        </select>
                    </div>
                    <Link href="/admin/certifications/new">
                        <button className="inline-flex items-center justify-center rounded-2xl text-sm font-bold bg-primary text-white hover:bg-primary/90 h-11 px-6 shadow-lg shadow-primary/25 transition-all active:scale-95">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Certification
                        </button>
                    </Link>
                </div>

                {/* Items List */}
                {filteredItems.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid gap-4"
                    >
                        {filteredItems.map((item) => (
                            <div
                                key={item._id}
                                className="bg-card/40 backdrop-blur-md border border-primary/10 rounded-2xl p-4 flex items-center justify-between hover:border-primary/30 transition-all"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    {item.imageUrl ? (
                                        <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.title}
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                            <Award className="h-8 w-8" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold truncate">{item.title}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {item.issuer} • {item.category}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Issued: {new Date(item.issueDate).toLocaleDateString()}
                                            {item.expiryDate && ` • Expires: ${new Date(item.expiryDate).toLocaleDateString()}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Link href={`/admin/certifications/${item._id}/view`}>
                                        <button
                                            type="button"
                                            className="p-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-1"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </Link>
                                    <Link href={`/admin/certifications/${item._id}`}>
                                        <button
                                            type="button"
                                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => setDeleteConfirm({ show: true, id: item._id, title: item.title })}
                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="rounded-3xl border-2 border-dashed border-primary/10 bg-card/20 backdrop-blur-sm px-8 py-20 text-center text-muted-foreground">
                        <Award className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p className="font-bold">No certifications found</p>
                        <p className="text-xs">
                            {searchTerm || categoryFilter !== "all" ? "Try a different search or filter" : "Add your first certification to see it here"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
