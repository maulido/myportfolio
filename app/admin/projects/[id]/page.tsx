"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, X } from "lucide-react";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";
import { AdminLangTabs } from "@/components/AdminLangTabs";
import AiTriggerButton from "@/components/admin/AiTriggerButton";

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [langTab, setLangTab] = useState<"en" | "id">("en");
    const [formData, setFormData] = useState({
        title: "",
        title_id: "",
        slug: "",
        description: "",
        description_id: "",
        category: "Full-Stack",
        problemStatement: "",
        problemStatement_id: "",
        solutionApproach: "",
        solutionApproach_id: "",
        tags: "",
        image: "",
        architectureDiagram: "",
        screenshots: [] as string[],
        github: "",
        demo: "",
        liveUrl: "",
        caseStudyUrl: "",
        featured: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await fetch(`/api/projects/${id}`);
                const data = await res.json();
                if (data.success && data.data) {
                    const item = data.data;
                    const tagsArr = item.technologies || item.tags || [];
                    setFormData({
                        title: item.title || "",
                        title_id: item.title_id || "",
                        slug: item.slug || "",
                        description: item.description || "",
                        description_id: item.description_id || "",
                        category: item.category || "Full-Stack",
                        problemStatement: item.problemStatement || "",
                        problemStatement_id: item.problemStatement_id || "",
                        solutionApproach: item.solutionApproach || "",
                        solutionApproach_id: item.solutionApproach_id || "",
                        tags: Array.isArray(tagsArr) ? tagsArr.join(", ") : "",
                        image: item.imageUrl || item.image || "",
                        architectureDiagram: item.architectureDiagram || "",
                        screenshots: item.screenshots || [],
                        github: item.githubUrl || item.github || "",
                        demo: item.demoUrl || item.demo || "",
                        liveUrl: item.liveUrl || "",
                        caseStudyUrl: item.caseStudyUrl || "",
                        featured: !!item.featured,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch project", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProject();
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
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const addScreenshot = (url: string) => {
        setFormData(prev => ({
            ...prev,
            screenshots: [...prev.screenshots, url]
        }));
    };

    const removeScreenshot = (index: number) => {
        setFormData(prev => ({
            ...prev,
            screenshots: prev.screenshots.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const tagsArray = (formData.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean);
            const res = await fetch(`/api/projects/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formData.title,
                    title_id: formData.title_id || undefined,
                    slug: formData.slug,
                    description: formData.description,
                    description_id: formData.description_id || undefined,
                    category: formData.category,
                    problemStatement: formData.problemStatement,
                    problemStatement_id: formData.problemStatement_id || undefined,
                    solutionApproach: formData.solutionApproach,
                    solutionApproach_id: formData.solutionApproach_id || undefined,
                    technologies: tagsArray,
                    tags: tagsArray,
                    imageUrl: formData.image,
                    architectureDiagram: formData.architectureDiagram,
                    screenshots: formData.screenshots,
                    githubUrl: formData.github,
                    demoUrl: formData.demo,
                    liveUrl: formData.liveUrl,
                    caseStudyUrl: formData.caseStudyUrl,
                    featured: formData.featured,
                }),
            });

            if (res.ok) {
                router.push("/admin/projects");
            } else {
                alert("Failed to update project");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>Loading project details...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background/50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/projects">
                        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10 cursor-pointer">
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Edit Project</h1>
                        <p className="text-xs text-muted-foreground">Update project technical specs, screenshots, and bilingual translations.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 rounded-xl border border-primary/10 bg-card/10 backdrop-blur-sm p-6 sm:p-8">
                    <AdminLangTabs
                        activeTab={langTab}
                        onChange={setLangTab}
                        label="Project Localization"
                    />

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Basic Information</h2>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium leading-none">
                                        {langTab === "en" ? "Title (EN) *" : "Judul Proyek (ID)"}
                                    </label>
                                    {langTab === "id" && (
                                        <AiTriggerButton
                                            tab="translate"
                                            text={formData.title}
                                            targetField="title_id"
                                            label="Terjemahkan Judul (AI)"
                                        />
                                    )}
                                </div>
                                {langTab === "en" ? (
                                    <input
                                        required
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="Project Name (English)"
                                    />
                                ) : (
                                    <input
                                        name="title_id"
                                        value={formData.title_id}
                                        onChange={handleChange}
                                        className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="Nama Proyek (Bahasa Indonesia - Opsional)"
                                    />
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Slug *</label>
                                <input
                                    required
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="project-slug"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium leading-none">
                                    {langTab === "en" ? "Description (EN) *" : "Deskripsi Proyek (ID)"}
                                </label>
                                {langTab === "en" ? (
                                    <AiTriggerButton
                                        tab="excerpt"
                                        title={formData.title}
                                        text={formData.problemStatement ? `${formData.problemStatement}\n${formData.solutionApproach}` : formData.title}
                                        targetField="description"
                                        label="Generate Description (AI)"
                                    />
                                ) : (
                                    <AiTriggerButton
                                        tab="translate"
                                        text={formData.description}
                                        targetField="description_id"
                                        label="Terjemahkan Deskripsi (AI)"
                                    />
                                )}
                            </div>
                            {langTab === "en" ? (
                                <textarea
                                    required
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="flex w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="What did you build?"
                                />
                            ) : (
                                <textarea
                                    name="description_id"
                                    value={formData.description_id}
                                    onChange={handleChange}
                                    rows={4}
                                    className="flex w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Ringkasan proyek dalam Bahasa Indonesia (opsional, fallback ke EN jika kosong)"
                                />
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Category *</label>
                                <select
                                    required
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <option value="Full-Stack">Full-Stack</option>
                                    <option value="Networking">Networking</option>
                                    <option value="DevOps">DevOps</option>
                                    <option value="Cloud">Cloud</option>
                                    <option value="Mobile">Mobile</option>
                                    <option value="Security">Security</option>
                                    <option value="Frontend">Frontend</option>
                                    <option value="Backend">Backend</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium leading-none">Tags / Technologies (comma separated)</label>
                                    <AiTriggerButton
                                        tab="tags"
                                        title={formData.title}
                                        text={`${formData.title} ${formData.description}`}
                                        targetField="tags"
                                        label="Suggest Tech (AI)"
                                    />
                                </div>
                                <input
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="React, Next.js, MongoDB, Docker"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-1">
                            <input
                                type="checkbox"
                                name="featured"
                                checked={formData.featured}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-input"
                            />
                            <label className="text-sm font-medium leading-none">Featured Project on Showcase</label>
                        </div>
                    </div>

                    {/* Media */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Images &amp; Architecture</h2>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Project Cover Image</label>
                                <ImageUpload
                                    value={formData.image}
                                    onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                                    endpoint="imageUploader"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Architecture Diagram</label>
                                <ImageUpload
                                    value={formData.architectureDiagram}
                                    onChange={(url) => setFormData(prev => ({ ...prev, architectureDiagram: url }))}
                                    endpoint="imageUploader"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Screenshots</label>
                            <div className="space-y-2">
                                {formData.screenshots.map((screenshot, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input
                                            value={screenshot}
                                            readOnly
                                            className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeScreenshot(index)}
                                            className="p-2 rounded-md border border-input hover:bg-destructive hover:text-destructive-foreground transition-colors cursor-pointer"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                <ImageUpload
                                    value=""
                                    onChange={addScreenshot}
                                    endpoint="imageUploader"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Case Study */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">
                            {langTab === "en" ? "Case Study (Optional - EN)" : "Studi Kasus (Opsional - ID)"}
                        </h2>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium leading-none">
                                    {langTab === "en" ? "Problem Statement (EN)" : "Deskripsi Masalah (ID)"}
                                </label>
                                {langTab === "id" && (
                                    <AiTriggerButton
                                        tab="translate"
                                        text={formData.problemStatement}
                                        targetField="problemStatement_id"
                                        label="Terjemahkan Masalah (AI)"
                                    />
                                )}
                            </div>
                            {langTab === "en" ? (
                                <textarea
                                    name="problemStatement"
                                    value={formData.problemStatement}
                                    onChange={handleChange}
                                    rows={4}
                                    className="flex w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="What problem does this project solve?"
                                />
                            ) : (
                                <textarea
                                    name="problemStatement_id"
                                    value={formData.problemStatement_id}
                                    onChange={handleChange}
                                    rows={4}
                                    className="flex w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Masalah apa yang diselesaikan oleh proyek ini? (opsional)"
                                />
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium leading-none">
                                    {langTab === "en" ? "Solution Approach (EN)" : "Pendekatan Solusi (ID)"}
                                </label>
                                {langTab === "id" && (
                                    <AiTriggerButton
                                        tab="translate"
                                        text={formData.solutionApproach}
                                        targetField="solutionApproach_id"
                                        label="Terjemahkan Solusi (AI)"
                                    />
                                )}
                            </div>
                            {langTab === "en" ? (
                                <textarea
                                    name="solutionApproach"
                                    value={formData.solutionApproach}
                                    onChange={handleChange}
                                    rows={4}
                                    className="flex w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="How did you solve it?"
                                />
                            ) : (
                                <textarea
                                    name="solutionApproach_id"
                                    value={formData.solutionApproach_id}
                                    onChange={handleChange}
                                    rows={4}
                                    className="flex w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Bagaimana arsitektur atau solusi tersebut diterapkan? (opsional)"
                                />
                            )}
                        </div>
                    </div>

                    {/* Links */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Links &amp; Deployments</h2>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">GitHub URL</label>
                                <input
                                    name="github"
                                    value={formData.github}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="https://github.com/..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Demo/Live URL</label>
                                <input
                                    name="demo"
                                    value={formData.demo}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="https://example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Production Live URL</label>
                                <input
                                    name="liveUrl"
                                    value={formData.liveUrl}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="https://production-system.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Case Study URL</label>
                                <input
                                    name="caseStudyUrl"
                                    value={formData.caseStudyUrl}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="https://casestudy.example.com"
                                />
                            </div>
                        </div>
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
                                    Update Project
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
