"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import RichTextEditor from "@/components/RichTextEditor";
import ImageUpload from "@/components/ImageUpload";
import { AdminLangTabs } from "@/components/AdminLangTabs";
import AiTriggerButton from "@/components/admin/AiTriggerButton";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [langTab, setLangTab] = useState<"en" | "id">("en");
    const [formData, setFormData] = useState({
        title: "",
        title_id: "",
        slug: "",
        excerpt: "",
        excerpt_id: "",
        content: "",
        content_id: "",
        category: "General",
        tags: "",
        coverImage: "",
        published: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await fetch(`/api/blog/${id}`);
                const data = await res.json();
                if (data.success) {
                    setFormData({
                        title: data.data.title || "",
                        title_id: data.data.title_id || "",
                        slug: data.data.slug || "",
                        excerpt: data.data.excerpt || "",
                        excerpt_id: data.data.excerpt_id || "",
                        content: data.data.content || "",
                        content_id: data.data.content_id || "",
                        category: data.data.category || "General",
                        tags: Array.isArray(data.data.tags) ? data.data.tags.join(", ") : "",
                        coverImage: data.data.coverImage || "",
                        published: data.data.published !== false,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch post", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    useEffect(() => {
        const handleApplyContent = (e: Event) => {
            const customEvent = e as CustomEvent<{ field: string; content: string }>;
            if (customEvent.detail) {
                const { field, content } = customEvent.detail;
                setFormData((prev) => ({
                    ...prev,
                    [field]: content,
                }));
            }
        };
        window.addEventListener("apply-ai-content", handleApplyContent);
        return () => window.removeEventListener("apply-ai-content", handleApplyContent);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch(`/api/blog/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    tags: formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
                    published: Boolean(formData.published),
                }),
            });

            if (res.ok) {
                router.push("/admin/posts");
            } else {
                alert("Failed to update post");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-background/50 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin">
                        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Post</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 rounded-xl border border-primary/10 bg-card/10 backdrop-blur-sm p-8">
                    {/* Multilingual Tabs */}
                    <AdminLangTabs
                        activeTab={langTab}
                        onChange={setLangTab}
                        label="Article Content Localization"
                    />

                    {langTab === "en" ? (
                        <>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Title (English - Primary)</label>
                                    <input
                                        required
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="Post Title in English"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Slug (URL)</label>
                                    <input
                                        required
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="post-url-slug"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium leading-none">Excerpt (English)</label>
                                    <AiTriggerButton
                                        tab="excerpt"
                                        targetField="excerpt"
                                        title={formData.title}
                                        text={formData.content}
                                        label="Auto-generate Excerpt (AI)"
                                    />
                                </div>
                                <textarea
                                    required
                                    name="excerpt"
                                    value={formData.excerpt}
                                    onChange={handleChange}
                                    rows={3}
                                    className="flex w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Brief summary of the article in English..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Content (English)</label>
                                <RichTextEditor
                                    content={formData.content}
                                    onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                                    placeholder="Edit your blog post in English..."
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium leading-none">Judul Artikel (Bahasa Indonesia)</label>
                                    <AiTriggerButton
                                        tab="translate"
                                        targetField="title_id"
                                        text={formData.title}
                                        label="Terjemahkan Judul (AI)"
                                    />
                                </div>
                                <input
                                    name="title_id"
                                    value={formData.title_id}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Judul artikel dalam Bahasa Indonesia (opsional, fallback ke Inggris)"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium leading-none">Ringkasan / Excerpt (Bahasa Indonesia)</label>
                                    <AiTriggerButton
                                        tab="translate"
                                        targetField="excerpt_id"
                                        text={formData.excerpt}
                                        label="Terjemahkan Excerpt (AI)"
                                    />
                                </div>
                                <textarea
                                    name="excerpt_id"
                                    value={formData.excerpt_id}
                                    onChange={handleChange}
                                    rows={3}
                                    className="flex w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Ringkasan artikel dalam Bahasa Indonesia..."
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium leading-none">Konten Artikel (Bahasa Indonesia)</label>
                                    <AiTriggerButton
                                        tab="translate"
                                        targetField="content_id"
                                        text={formData.content}
                                        label="Terjemahkan Konten (AI)"
                                    />
                                </div>
                                <RichTextEditor
                                    content={formData.content_id}
                                    onChange={(content_id) => setFormData(prev => ({ ...prev, content_id }))}
                                    placeholder="Tulis artikel dalam Bahasa Indonesia..."
                                />
                            </div>
                        </>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="General">General</option>
                                <option value="Architecture">Architecture</option>
                                <option value="Networking">Networking</option>
                                <option value="Development">Development</option>
                                <option value="DevOps">DevOps</option>
                                <option value="Cloud">Cloud</option>
                                <option value="Security">Security</option>
                                <option value="Tutorial">Tutorial</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium leading-none">Tags (comma separated)</label>
                                <AiTriggerButton
                                    tab="tags"
                                    targetField="tags"
                                    title={formData.title}
                                    text={formData.content || formData.excerpt}
                                    label="Suggest Tags (AI)"
                                />
                            </div>
                            <input
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="Tech, Code, Tutorial"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Cover Image</label>
                        <ImageUpload
                            value={formData.coverImage}
                            onChange={(url) => setFormData(prev => ({ ...prev, coverImage: url }))}
                            endpoint="imageUploader"
                        />
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                        <input
                            type="checkbox"
                            id="published"
                            name="published"
                            checked={formData.published}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-input"
                        />
                        <label htmlFor="published" className="text-sm font-medium leading-none cursor-pointer">
                            Published (visible to visitors on the blog)
                        </label>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 min-w-[120px] cursor-pointer"
                        >
                            {isSubmitting ? "Updating..." : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Update Post
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
