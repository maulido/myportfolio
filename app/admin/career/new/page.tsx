"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import Link from "next/link";
import { AdminLangTabs } from "@/components/AdminLangTabs";

export default function NewCareerPage() {
    const router = useRouter();
    const [langTab, setLangTab] = useState<"en" | "id">("en");
    const [formData, setFormData] = useState({
        type: "work" as "work" | "education" | "achievement",
        title: "",
        title_id: "",
        organization: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
        description_id: "",
        skills: [] as string[],
        achievements: [] as string[],
        achievements_id: [] as string[],
        responsibilities: [] as string[],
        responsibilities_id: [] as string[],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Temporary input states for arrays
    const [skillInput, setSkillInput] = useState("");
    const [achievementInput, setAchievementInput] = useState("");
    const [achievementIdInput, setAchievementIdInput] = useState("");
    const [responsibilityInput, setResponsibilityInput] = useState("");
    const [responsibilityIdInput, setResponsibilityIdInput] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev) => ({ ...prev, [name]: checked }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const addToArray = (
        field: "skills" | "achievements" | "achievements_id" | "responsibilities" | "responsibilities_id",
        value: string
    ) => {
        if (value.trim()) {
            setFormData((prev) => ({
                ...prev,
                [field]: [...prev[field], value.trim()],
            }));

            // Clear the input
            if (field === "skills") setSkillInput("");
            if (field === "achievements") setAchievementInput("");
            if (field === "achievements_id") setAchievementIdInput("");
            if (field === "responsibilities") setResponsibilityInput("");
            if (field === "responsibilities_id") setResponsibilityIdInput("");
        }
    };

    const removeFromArray = (
        field: "skills" | "achievements" | "achievements_id" | "responsibilities" | "responsibilities_id",
        index: number
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/career", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    title_id: formData.title_id || undefined,
                    description_id: formData.description_id || undefined,
                    achievements_id: formData.achievements_id.length > 0 ? formData.achievements_id : undefined,
                    responsibilities_id: formData.responsibilities_id.length > 0 ? formData.responsibilities_id : undefined,
                }),
            });

            if (res.ok) {
                router.push("/admin");
            } else {
                const data = await res.json();
                alert(`Failed to create career entry: ${data.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background/50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin">
                        <button type="button" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10 cursor-pointer">
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Add Career Entry</h1>
                        <p className="text-xs text-muted-foreground">Document roles, academic achievements, and bilingual responsibilities.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 rounded-xl border border-primary/10 bg-card/10 backdrop-blur-sm p-6 sm:p-8">
                    <AdminLangTabs
                        activeTab={langTab}
                        onChange={setLangTab}
                        label="Career Entry Localization"
                    />

                    {/* Type Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Entry Type</label>
                        <select
                            required
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="work">Work Experience</option>
                            <option value="education">Education</option>
                            <option value="achievement">Achievement</option>
                        </select>
                    </div>

                    {/* Title and Organization */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">
                                {langTab === "en"
                                    ? (formData.type === 'education' ? "Degree / Certificate (EN) *" : formData.type === 'achievement' ? "Award Name (EN) *" : "Title / Position (EN) *")
                                    : (formData.type === 'education' ? "Gelar / Sertifikat (ID)" : formData.type === 'achievement' ? "Nama Penghargaan (ID)" : "Posisi / Jabatan (ID)")
                                }
                            </label>
                            {langTab === "en" ? (
                                <input
                                    required
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder={formData.type === 'education' ? "Bachelor of Science in Computer Science" : formData.type === 'achievement' ? "Best Developer Award" : "Senior Software Engineer"}
                                />
                            ) : (
                                <input
                                    name="title_id"
                                    value={formData.title_id}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Posisi dalam Bahasa Indonesia (opsional)"
                                />
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">
                                {formData.type === 'education' ? "University / School *" : formData.type === 'achievement' ? "Issuing Organization *" : "Organization / Company *"}
                            </label>
                            <input
                                required
                                name="organization"
                                value={formData.organization}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder={formData.type === 'education' ? "University of Technology" : formData.type === 'achievement' ? "Tech Conference 2024" : "Tech Company Inc."}
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Location</label>
                        <input
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="Jakarta, Indonesia"
                        />
                    </div>

                    {/* Dates */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Start Date *</label>
                            <input
                                required
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">End Date</label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                disabled={formData.current}
                                className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                            />
                        </div>
                    </div>

                    {/* Current Position Checkbox */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="current"
                            name="current"
                            checked={formData.current}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-input/50"
                        />
                        <label htmlFor="current" className="text-sm font-medium leading-none cursor-pointer">
                            I currently work or study here (Active)
                        </label>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">
                            {langTab === "en" ? "Description (EN) *" : "Deskripsi (ID)"}
                        </label>
                        {langTab === "en" ? (
                            <textarea
                                required
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="flex w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="Brief description of your role, key responsibilities, and scope..."
                            />
                        ) : (
                            <textarea
                                name="description_id"
                                value={formData.description_id}
                                onChange={handleChange}
                                rows={4}
                                className="flex w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="Deskripsi peran dalam Bahasa Indonesia (opsional, fallback ke EN jika kosong)"
                            />
                        )}
                    </div>

                    {/* Shared Skills */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Skills &amp; Technologies</label>
                        <div className="flex gap-2">
                            <input
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addToArray("skills", skillInput);
                                    }
                                }}
                                className="flex h-10 flex-1 rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="e.g. Cisco BGP, Next.js, Kubernetes..."
                            />
                            <button
                                type="button"
                                onClick={() => addToArray("skills", skillInput)}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 cursor-pointer"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.skills.map((skill, index) => (
                                <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">
                                    {skill}
                                    <button type="button" onClick={() => removeFromArray("skills", index)} className="hover:text-primary/70 cursor-pointer">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Responsibilities */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">
                            {langTab === "en" ? "Key Responsibilities / Courses (EN)" : "Tanggung Jawab Utama (ID)"}
                        </label>
                        {langTab === "en" ? (
                            <>
                                <div className="flex gap-2">
                                    <input
                                        value={responsibilityInput}
                                        onChange={(e) => setResponsibilityInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addToArray("responsibilities", responsibilityInput);
                                            }
                                        }}
                                        className="flex h-10 flex-1 rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="Add an English responsibility..."
                                    />
                                    <button
                                        type="button"
                                        onClick={() => addToArray("responsibilities", responsibilityInput)}
                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 cursor-pointer"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                <ul className="list-disc list-inside space-y-1 mt-2">
                                    {formData.responsibilities.map((resp, index) => (
                                        <li key={index} className="text-sm flex items-start gap-2">
                                            <span className="flex-1">{resp}</span>
                                            <button type="button" onClick={() => removeFromArray("responsibilities", index)} className="text-red-500 hover:text-red-700 cursor-pointer">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <>
                                <div className="flex gap-2">
                                    <input
                                        value={responsibilityIdInput}
                                        onChange={(e) => setResponsibilityIdInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addToArray("responsibilities_id", responsibilityIdInput);
                                            }
                                        }}
                                        className="flex h-10 flex-1 rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="Tambahkan poin tanggung jawab dalam Bahasa Indonesia..."
                                    />
                                    <button
                                        type="button"
                                        onClick={() => addToArray("responsibilities_id", responsibilityIdInput)}
                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 cursor-pointer"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                <ul className="list-disc list-inside space-y-1 mt-2">
                                    {formData.responsibilities_id.map((resp, index) => (
                                        <li key={index} className="text-sm flex items-start gap-2">
                                            <span className="flex-1">{resp}</span>
                                            <button type="button" onClick={() => removeFromArray("responsibilities_id", index)} className="text-red-500 hover:text-red-700 cursor-pointer">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>

                    {/* Achievements */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">
                            {langTab === "en" ? "Key Achievements / Highlights (EN)" : "Pencapaian Utama (ID)"}
                        </label>
                        {langTab === "en" ? (
                            <>
                                <div className="flex gap-2">
                                    <input
                                        value={achievementInput}
                                        onChange={(e) => setAchievementInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addToArray("achievements", achievementInput);
                                            }
                                        }}
                                        className="flex h-10 flex-1 rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="Add an English achievement..."
                                    />
                                    <button
                                        type="button"
                                        onClick={() => addToArray("achievements", achievementInput)}
                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 cursor-pointer"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                <ul className="list-disc list-inside space-y-1 mt-2">
                                    {formData.achievements.map((achievement, index) => (
                                        <li key={index} className="text-sm flex items-start gap-2">
                                            <span className="flex-1">{achievement}</span>
                                            <button type="button" onClick={() => removeFromArray("achievements", index)} className="text-red-500 hover:text-red-700 cursor-pointer">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <>
                                <div className="flex gap-2">
                                    <input
                                        value={achievementIdInput}
                                        onChange={(e) => setAchievementIdInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addToArray("achievements_id", achievementIdInput);
                                            }
                                        }}
                                        className="flex h-10 flex-1 rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="Tambahkan pencapaian dalam Bahasa Indonesia..."
                                    />
                                    <button
                                        type="button"
                                        onClick={() => addToArray("achievements_id", achievementIdInput)}
                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 cursor-pointer"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                <ul className="list-disc list-inside space-y-1 mt-2">
                                    {formData.achievements_id.map((achievement, index) => (
                                        <li key={index} className="text-sm flex items-start gap-2">
                                            <span className="flex-1">{achievement}</span>
                                            <button type="button" onClick={() => removeFromArray("achievements_id", index)} className="text-red-500 hover:text-red-700 cursor-pointer">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 min-w-[120px] cursor-pointer"
                        >
                            {isSubmitting ? "Saving..." : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Entry
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
