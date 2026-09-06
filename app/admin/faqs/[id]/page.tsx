"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, HelpCircle } from "lucide-react";
import Link from "next/link";
import { AdminLangTabs } from "@/components/AdminLangTabs";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditFaqPage({ params }: PageProps) {
    const router = useRouter();
    const [id, setId] = useState<string>("");
    const [langTab, setLangTab] = useState<"en" | "id">("en");
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        question: "",
        question_id: "",
        answer: "",
        answer_id: "",
        category: "Inquiry Clarifications",
        order: 0,
        published: true,
    });

    const fetchFaq = useCallback(async (faqId: string) => {
        try {
            const response = await fetch(`/api/faqs/${faqId}`);
            const data = await response.json();
            if (data.success && data.data) {
                setFormData({
                    question: data.data.question || "",
                    question_id: data.data.question_id || "",
                    answer: data.data.answer || "",
                    answer_id: data.data.answer_id || "",
                    category: data.data.category || "Inquiry Clarifications",
                    order: typeof data.data.order === "number" ? data.data.order : 0,
                    published: data.data.published !== false,
                });
            } else {
                alert("FAQ not found");
                router.push("/admin/faqs");
            }
        } catch (error) {
            console.error("Error fetching FAQ:", error);
            alert("Failed to load FAQ details");
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        params.then((resolved) => {
            setId(resolved.id);
            fetchFaq(resolved.id);
        });
    }, [params, fetchFaq]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.question.trim() || !formData.answer.trim()) {
            alert("Please provide at least the English question and answer.");
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch(`/api/faqs/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push("/admin/faqs");
            } else {
                const data = await res.json();
                alert(data.error || "Failed to update FAQ");
            }
        } catch (error) {
            console.error("Error updating FAQ:", error);
            alert("An error occurred while updating the FAQ");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 sm:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/admin/faqs">
                        <button
                            type="button"
                            className="p-2.5 rounded-xl border border-border bg-card/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <HelpCircle className="h-6 w-6 text-primary" />
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                Edit FAQ
                            </h1>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            Update bilingual content, display order, or visibility status.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Bilingual Switcher */}
                    <AdminLangTabs
                        activeTab={langTab}
                        onChange={setLangTab}
                        label="FAQ Multilingual Content"
                    />

                    {/* Localized Inputs */}
                    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-md p-6 space-y-5">
                        {langTab === "en" ? (
                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px]">EN</span>
                                        <span>Question (English) *</span>
                                    </label>
                                    <input
                                        required
                                        name="question"
                                        value={formData.question}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                        placeholder="e.g. What is your typical turnaround time for new project inquiries?"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px]">EN</span>
                                        <span>Answer (English) *</span>
                                    </label>
                                    <textarea
                                        required
                                        rows={4}
                                        name="answer"
                                        value={formData.answer}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all leading-relaxed"
                                        placeholder="e.g. I review and reply to all professional inquiries within 2 to 4 business hours..."
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px]">ID</span>
                                        <span>Pertanyaan (Bahasa Indonesia)</span>
                                    </label>
                                    <input
                                        name="question_id"
                                        value={formData.question_id}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                                        placeholder="cth. Berapa lama estimasi respon untuk pertanyaan proyek baru?"
                                    />
                                    <p className="text-[11px] text-muted-foreground">
                                        Optional. Falls back to English question if left blank.
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px]">ID</span>
                                        <span>Jawaban (Bahasa Indonesia)</span>
                                    </label>
                                    <textarea
                                        rows={4}
                                        name="answer_id"
                                        value={formData.answer_id}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all leading-relaxed"
                                        placeholder="cth. Saya meninjau dan merespon semua pesan profesional dalam kurun 2 hingga 4 jam kerja..."
                                    />
                                    <p className="text-[11px] text-muted-foreground">
                                        Optional. Falls back to English answer if left blank.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Shared Settings */}
                    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-md p-6 space-y-4">
                        <h3 className="text-sm font-bold text-foreground">FAQ Settings & Ordering</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-foreground">Category</label>
                                <input
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                    placeholder="Inquiry Clarifications"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-foreground">
                                    Display Order (Lower numbers appear first)
                                </label>
                                <input
                                    type="number"
                                    name="order"
                                    value={formData.order}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    name="published"
                                    checked={formData.published}
                                    onChange={handleChange}
                                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary/40"
                                />
                                <span className="text-sm font-semibold text-foreground">
                                    Publish immediately to public contact page
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex items-center justify-end gap-3">
                        <Link href="/admin/faqs">
                            <button
                                type="button"
                                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
