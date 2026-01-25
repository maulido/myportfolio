"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { getIcon, getIconsByCategory } from "@/lib/iconMap";

export default function EditSkillPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id: skillId } = use(params);
    const [formData, setFormData] = useState({
        name: "",
        level: "Intermediate" as "Expert" | "Advanced" | "Intermediate" | "Beginner",
        years: 1,
        category: "",
        icon: "Code2",
        color: "",
        order: 0,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const iconsByCategory = getIconsByCategory();

    useEffect(() => {
        const fetchSkill = async (id: string) => {
            try {
                const res = await fetch(`/api/skills/${id}`);
                const result = await res.json();

                if (result.success) {
                    setFormData({
                        name: result.data.name,
                        level: result.data.level,
                        years: result.data.years,
                        category: result.data.category,
                        icon: result.data.icon,
                        color: result.data.color || "",
                        order: result.data.order || 0,
                    });
                } else {
                    alert("Failed to load skill");
                    router.push("/admin");
                }
            } catch (error) {
                console.error(error);
                alert("An error occurred");
                router.push("/admin");
            } finally {
                setIsLoading(false);
            }
        };

        if (skillId) {
            fetchSkill(skillId);
        }
    }, [skillId, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "years" || name === "order" ? parseInt(value) || 0 : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch(`/api/skills/${skillId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await res.json();

            if (res.ok && result.success) {
                router.push("/admin");
            } else {
                alert(result.error || "Failed to update skill");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this skill?")) return;

        setIsDeleting(true);

        try {
            const res = await fetch(`/api/skills/${skillId}`, {
                method: "DELETE",
            });

            const result = await res.json();

            if (res.ok && result.success) {
                router.push("/admin");
            } else {
                alert(result.error || "Failed to delete skill");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background/50 p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading skill...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background/50 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin">
                            <button type="button" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Skill</h1>
                    </div>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground h-10 px-4 py-2"
                    >
                        {isDeleting ? "Deleting..." : (
                            <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </>
                        )}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 rounded-xl border border-primary/10 bg-card/10 backdrop-blur-sm p-8">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Skill Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Skill Name *</label>
                            <input
                                required
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="e.g., React, Python, Docker"
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Category *</label>
                            <input
                                required
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="e.g., Frontend Development"
                                list="categories"
                            />
                            <datalist id="categories">
                                <option value="Frontend Development" />
                                <option value="Backend & Database" />
                                <option value="Network & DevOps" />
                                <option value="Mobile Development" />
                                <option value="Design & UI/UX" />
                            </datalist>
                        </div>

                        {/* Level */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Proficiency Level *</label>
                            <select
                                required
                                name="level"
                                value={formData.level}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="Expert">Expert</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Beginner">Beginner</option>
                            </select>
                        </div>

                        {/* Years */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Years of Experience *</label>
                            <input
                                required
                                type="number"
                                name="years"
                                min="0"
                                max="50"
                                value={formData.years}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>

                        {/* Icon Selector */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium leading-none">Icon *</label>
                            <select
                                required
                                name="icon"
                                value={formData.icon}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                {Object.entries(iconsByCategory).map(([category, icons]) => (
                                    <optgroup key={category} label={category}>
                                        {icons.map((iconName) => (
                                            <option key={iconName} value={iconName}>
                                                {iconName.replace(/^Si/, "")}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                            <div className="flex items-center gap-2 mt-2 p-3 rounded-md bg-muted/50">
                                <span className="text-xs text-muted-foreground">Preview:</span>
                                {getIcon(formData.icon, "h-6 w-6")}
                                <span className="text-sm font-medium">{formData.icon.replace(/^Si/, "")}</span>
                            </div>
                        </div>

                        {/* Color (Optional) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Color Class (Optional)</label>
                            <input
                                name="color"
                                value={formData.color}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="e.g., text-blue-400"
                            />
                            <p className="text-xs text-muted-foreground">Tailwind color class for the icon</p>
                        </div>

                        {/* Order */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Display Order</label>
                            <input
                                type="number"
                                name="order"
                                min="0"
                                value={formData.order}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                            <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
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
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
