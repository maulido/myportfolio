"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X } from "lucide-react";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";
import { AdminLangTabs } from "@/components/AdminLangTabs";

export default function NewProjectPage() {
    const router = useRouter();
    const [langTab, setLangTab] = useState<"en" | "id">("en");
    const [formData, setFormData] = useState({
        title: "",
        title_id: "",
        slug: "",
        description: "",
        description_id: "",
        problemStatement: "",
        problemStatement_id: "",
        solutionApproach: "",
        solutionApproach_id: "",
        imageUrl: "",
        architectureDiagram: "",
        screenshots: [] as string[],
        technologies: "",
        githubUrl: "",
        liveUrl: "",
        demoUrl: "",
        caseStudyUrl: "",
        featured: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Auto-generate slug from title
    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData(prev => ({
            ...prev,
            title,
            slug: generateSlug(title)
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
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    technologies: formData.technologies.split(",").map((tech) => tech.trim()),
                }),
            });

            if (res.ok) {
                router.push("/admin");
            } else {
                alert("Failed to create project");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background/50 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin">
                        <button type="button" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Add New Project</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 rounded-xl border border-primary/10 bg-card/10 backdrop-blur-sm p-8">
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
                                <label className="text-sm font-medium leading-none">
                                    {langTab === "en" ? "Title (EN) *" : "Judul Proyek (ID)"}
                                </label>
                                {langTab === "en" ? (
                                    <input
                                        required
                                        name="title"
                                        value={formData.title}
                                        onChange={handleTitleChange}
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
                                <p className="text-xs text-muted-foreground">Auto-generated from title, can be edited</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">
                                {langTab === "en" ? "Description (EN) *" : "Deskripsi Proyek (ID)"}
                            </label>
                            {langTab === "en" ? (
                                <textarea
                                    required
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="flex w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Brief overview of the project"
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

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Technologies (comma separated) *</label>
                            <input
                                required
                                name="technologies"
                                value={formData.technologies}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="React, Next.js, MongoDB, TailwindCSS"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="featured"
                                checked={formData.featured}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-input"
                            />
                            <label className="text-sm font-medium leading-none">Featured Project</label>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Images</h2>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Cover Image</label>
                            <ImageUpload
                                value={formData.imageUrl}
                                onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
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
                                            className="p-2 rounded-md border border-input hover:bg-destructive hover:text-destructive-foreground transition-colors"
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
                            <label className="text-sm font-medium leading-none">
                                {langTab === "en" ? "Problem Statement (EN)" : "Deskripsi Masalah (ID)"}
                            </label>
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
                            <label className="text-sm font-medium leading-none">
                                {langTab === "en" ? "Solution Approach (EN)" : "Pendekatan Solusi (ID)"}
                            </label>
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
                        <h2 className="text-xl font-semibold">Links</h2>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">GitHub URL</label>
                                <input
                                    name="githubUrl"
                                    value={formData.githubUrl}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="https://github.com/..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Live URL</label>
                                <input
                                    name="liveUrl"
                                    value={formData.liveUrl}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="https://example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Demo URL</label>
                                <input
                                    name="demoUrl"
                                    value={formData.demoUrl}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="https://demo.example.com"
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
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 min-w-[120px]"
                        >
                            {isSubmitting ? "Saving..." : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Project
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
