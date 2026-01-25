"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
// import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Search, ArrowLeft, Package } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface UsesItem {
    _id: string;
    name: string;
    category: string;
    description: string;
    url?: string;
    imageUrl?: string;
    featured: boolean;
    order: number;
}

export default function AdminUsesListPage() {
    // const router = useRouter();
    const [items, setItems] = useState<UsesItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; name: string }>({
        show: false,
        id: "",
        name: ""
    });

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await fetch("/api/uses");
            const data = await response.json();
            if (data.success) {
                // Flatten grouped items into single array
                const allItems: UsesItem[] = [];
                Object.values(data.data).forEach((categoryItems: unknown) => {
                    allItems.push(...(categoryItems as UsesItem[]));
                });
                // Sort by order
                allItems.sort((a, b) => a.order - b.order);
                setItems(allItems);
            }
        } catch (error) {
            console.error("Error fetching uses items:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        const { id } = deleteConfirm;
        setDeleteConfirm({ show: false, id: "", name: "" });

        try {
            const response = await fetch(`/api/uses/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                alert("Item deleted successfully!");
                fetchItems();
            } else {
                alert("Failed to delete item");
            }
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("An error occurred while deleting");
        }
    };

    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                            Are you sure you want to delete this item?
                            <br />
                            <span className="font-semibold text-foreground">&quot;{deleteConfirm.name}&quot;</span>
                            <br /><br />
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirm({ show: false, id: "", name: "" })}
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

            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/admin">
                        <button type="button" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Uses</h1>
                </div>

                {/* Search and Add */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-xl bg-card border border-primary/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
                        />
                    </div>
                    <Link href="/admin/uses/new">
                        <button className="inline-flex items-center justify-center rounded-2xl text-sm font-bold bg-primary text-white hover:bg-primary/90 h-11 px-6 shadow-lg shadow-primary/25 transition-all active:scale-95">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Item
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
                                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                                            {item.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold truncate">{item.name}</h4>
                                            {item.featured && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                                    FEATURED
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {item.category} • Order: {item.order}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Link href={`/admin/uses/${item._id}`}>
                                        <button
                                            type="button"
                                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => setDeleteConfirm({ show: true, id: item._id, name: item.name })}
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
                        <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p className="font-bold">No items found</p>
                        <p className="text-xs">
                            {searchTerm ? "Try a different search term" : "Add your first item to see it here"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
