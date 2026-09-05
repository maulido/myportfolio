"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
    Plus, 
    Pencil, 
    Trash2, 
    Search, 
    ArrowLeft, 
    HelpCircle, 
    CheckCircle2, 
    XCircle,
    Globe2,
    Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FaqItem {
    _id: string;
    question: string;
    question_id?: string;
    answer: string;
    answer_id?: string;
    category?: string;
    order: number;
    published: boolean;
    createdAt: string;
}

export default function AdminFaqListPage() {
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; question: string }>({
        show: false,
        id: "",
        question: ""
    });
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        try {
            const response = await fetch("/api/faqs?all=true");
            const data = await response.json();
            if (data.success) {
                setFaqs(data.data || []);
            }
        } catch (error) {
            console.error("Error fetching FAQs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        const { id } = deleteConfirm;
        setIsDeleting(true);

        try {
            const response = await fetch(`/api/faqs/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setDeleteConfirm({ show: false, id: "", question: "" });
                await fetchFaqs();
            } else {
                alert("Failed to delete FAQ");
            }
        } catch (error) {
            console.error("Error deleting FAQ:", error);
            alert("An error occurred while deleting the FAQ");
        } finally {
            setIsDeleting(false);
        }
    };

    const togglePublish = async (faq: FaqItem) => {
        try {
            const updatedPublished = !faq.published;
            // Optimistic update
            setFaqs((prev) =>
                prev.map((f) => (f._id === faq._id ? { ...f, published: updatedPublished } : f))
            );

            const response = await fetch(`/api/faqs/${faq._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ published: updatedPublished }),
            });

            if (!response.ok) {
                // Rollback on failure
                setFaqs((prev) =>
                    prev.map((f) => (f._id === faq._id ? { ...f, published: faq.published } : f))
                );
                alert("Failed to update status");
            }
        } catch (error) {
            console.error("Error updating published status:", error);
            fetchFaqs();
        }
    };

    const categories = ["all", ...Array.from(new Set(faqs.map((f) => f.category || "General").filter(Boolean)))];

    const filteredFaqs = faqs.filter((item) => {
        const matchesSearch =
            item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.question_id && item.question_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
            item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.answer_id && item.answer_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory =
            selectedCategory === "all" || (item.category || "General") === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const bilingualCount = faqs.filter((f) => f.question_id && f.answer_id).length;
    const publishedCount = faqs.filter((f) => f.published).length;

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 sm:p-8">
            {/* Delete Confirmation Modal */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-card border border-primary/20 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
                    >
                        <h3 className="text-xl font-bold text-foreground">Confirm Delete</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Are you sure you want to permanently delete this FAQ item?
                        </p>
                        <div className="p-3 rounded-xl bg-muted/30 border border-border text-xs font-semibold text-foreground">
                            &ldquo;{deleteConfirm.question}&rdquo;
                        </div>
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeleteConfirm({ show: false, id: "", question: "" })}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-xl text-xs font-bold border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>{isDeleting ? "Deleting..." : "Delete FAQ"}</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href="/admin">
                            <button
                                type="button"
                                className="p-2.5 rounded-xl border border-border bg-card/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                                title="Back to Dashboard"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <HelpCircle className="h-6 w-6 text-primary" />
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                    Frequently Asked Questions
                                </h1>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                                Manage bilingual FAQ items displayed on your public contact and advisory hub.
                            </p>
                        </div>
                    </div>

                    <Link href="/admin/faqs/new">
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all cursor-pointer"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add New FAQ</span>
                        </button>
                    </Link>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl border border-border bg-card/60 backdrop-blur-md flex items-center justify-between">
                        <div>
                            <div className="text-xs text-muted-foreground font-semibold">Total Questions</div>
                            <div className="text-2xl font-bold text-foreground mt-1">{faqs.length}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
                            <Layers className="h-5 w-5" />
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-border bg-card/60 backdrop-blur-md flex items-center justify-between">
                        <div>
                            <div className="text-xs text-muted-foreground font-semibold">Published Active</div>
                            <div className="text-2xl font-bold text-foreground mt-1">{publishedCount}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-border bg-card/60 backdrop-blur-md flex items-center justify-between">
                        <div>
                            <div className="text-xs text-muted-foreground font-semibold">Bilingual (EN + ID)</div>
                            <div className="text-2xl font-bold text-foreground mt-1">
                                {bilingualCount} / {faqs.length}
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                            <Globe2 className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search questions or answers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                        />
                    </div>

                    {categories.length > 2 && (
                        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                        selectedCategory === cat
                                            ? "bg-primary text-white shadow-xs"
                                            : "bg-card border border-border text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {cat === "all" ? "All Categories" : cat}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                    {filteredFaqs.length === 0 ? (
                        <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-card/30">
                            <HelpCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                            <h3 className="text-base font-bold text-foreground">No FAQs Found</h3>
                            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                                {searchTerm
                                    ? "No questions match your current search query."
                                    : "Start by creating your first frequently asked question."}
                            </p>
                            {!searchTerm && (
                                <Link href="/admin/faqs/new">
                                    <button
                                        type="button"
                                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary/90 transition-all cursor-pointer"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        <span>Add New FAQ</span>
                                    </button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        filteredFaqs.map((faq) => (
                            <motion.div
                                key={faq._id}
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="p-5 rounded-2xl border border-border bg-card/60 backdrop-blur-md hover:border-primary/30 transition-all shadow-xs space-y-4"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-muted text-muted-foreground border border-border font-mono">
                                                Order #{faq.order}
                                            </span>
                                            {faq.category && (
                                                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                                                    {faq.category}
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => togglePublish(faq)}
                                                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                                    faq.published
                                                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20"
                                                        : "bg-muted text-muted-foreground border border-border hover:bg-muted/80"
                                                }`}
                                                title="Click to toggle published status"
                                            >
                                                {faq.published ? (
                                                    <>
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        <span>Published</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-3 w-3" />
                                                        <span>Draft</span>
                                                    </>
                                                )}
                                            </button>
                                            {faq.question_id && faq.answer_id ? (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                    EN + ID
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                    EN Only
                                                </span>
                                            )}
                                        </div>

                                        {/* Questions & Answers */}
                                        <div className="space-y-2 pt-1">
                                            <div>
                                                <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-0.5">
                                                    <span className="px-1 py-0.2 rounded bg-primary/10 text-primary text-[9px] font-mono">EN</span>
                                                    <span>Question</span>
                                                </div>
                                                <h3 className="text-base font-bold text-foreground">
                                                    {faq.question}
                                                </h3>
                                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-1 line-clamp-2">
                                                    {faq.answer}
                                                </p>
                                            </div>

                                            {faq.question_id && (
                                                <div className="pt-2 border-t border-border/40">
                                                    <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-0.5">
                                                        <span className="px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-500 text-[9px] font-mono">ID</span>
                                                        <span>Pertanyaan (Indonesian)</span>
                                                    </div>
                                                    <p className="text-sm font-semibold text-foreground/90">
                                                        {faq.question_id}
                                                    </p>
                                                    {faq.answer_id && (
                                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">
                                                            {faq.answer_id}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                                        <Link href={`/admin/faqs/${faq._id}`}>
                                            <button
                                                type="button"
                                                className="p-2 rounded-xl border border-border hover:border-primary/40 bg-card hover:bg-muted text-foreground transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                                                title="Edit FAQ"
                                            >
                                                <Pencil className="h-3.5 w-3.5 text-primary" />
                                                <span className="hidden sm:inline">Edit</span>
                                            </button>
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setDeleteConfirm({
                                                    show: true,
                                                    id: faq._id,
                                                    question: faq.question,
                                                })
                                            }
                                            className="p-2 rounded-xl border border-border hover:border-destructive/40 bg-card hover:bg-destructive/10 text-destructive transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                                            title="Delete FAQ"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            <span className="hidden sm:inline">Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
