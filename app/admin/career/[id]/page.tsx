"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import Link from "next/link";

export default function EditCareerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [formData, setFormData] = useState({
        type: "work" as "work" | "education" | "achievement",
        title: "",
        organization: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
        skills: [] as string[],
        achievements: [] as string[],
        responsibilities: [] as string[],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Temporary input states for arrays
    const [skillInput, setSkillInput] = useState("");
    const [achievementInput, setAchievementInput] = useState("");
    const [responsibilityInput, setResponsibilityInput] = useState("");

    useEffect(() => {
        const fetchCareer = async () => {
            try {
                const res = await fetch(`/api/career/${id}`);
                const data = await res.json();
                if (data.success) {
                    // Format dates for input fields
                    const startDate = data.data.startDate ? new Date(data.data.startDate).toISOString().split('T')[0] : '';
                    const endDate = data.data.endDate ? new Date(data.data.endDate).toISOString().split('T')[0] : '';

                    setFormData({
                        type: data.data.type,
                        title: data.data.title,
                        organization: data.data.organization,
                        location: data.data.location || "",
                        startDate,
                        endDate,
                        current: data.data.current,
                        description: data.data.description,
                        skills: data.data.skills || [],
                        achievements: data.data.achievements || [],
                        responsibilities: data.data.responsibilities || [],
                    });
                }
            } catch (error) {
                console.error("Failed to fetch career entry", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCareer();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev) => ({ ...prev, [name]: checked }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const addToArray = (field: "skills" | "achievements" | "responsibilities", value: string) => {
        if (value.trim()) {
            setFormData((prev) => ({
                ...prev,
                [field]: [...prev[field], value.trim()],
            }));

            // Clear the input
            if (field === "skills") setSkillInput("");
            if (field === "achievements") setAchievementInput("");
            if (field === "responsibilities") setResponsibilityInput("");
        }
    };

    const removeFromArray = (field: "skills" | "achievements" | "responsibilities", index: number) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch(`/api/career/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push("/admin");
            } else {
                const data = await res.json();
                alert(`Failed to update career entry: ${data.error || "Unknown error"}`);
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
                        <button type="button" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Career Entry</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 rounded-xl border border-primary/10 bg-card/10 backdrop-blur-sm p-8">
                    {/* Type Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Type</label>
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
                                {formData.type === 'education' ? "Degree / Certificate" : formData.type === 'achievement' ? "Award / Achievement Name" : "Title / Position"}
                            </label>
                            <input
                                required
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder={formData.type === 'education' ? "Bachelor of Science in Computer Science" : formData.type === 'achievement' ? "Best Developer Award" : "Senior Software Engineer"}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">
                                {formData.type === 'education' ? "University / School" : formData.type === 'achievement' ? "Issuing Organization / Event" : "Organization / Company"}
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
                            <label className="text-sm font-medium leading-none">Start Date</label>
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
                            I currently work here
                        </label>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Description</label>
                        <textarea
                            required
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="flex w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="Brief description of your role and contributions..."
                        />
                    </div>

                    {/* Skills */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Skills</label>
                        <div className="flex gap-2">
                            <input
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addToArray("skills", skillInput);
                                    }
                                }}
                                className="flex h-10 flex-1 rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="Add a skill..."
                            />
                            <button
                                type="button"
                                onClick={() => addToArray("skills", skillInput)}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.skills.map((skill, index) => (
                                <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">
                                    {skill}
                                    <button type="button" onClick={() => removeFromArray("skills", index)} className="hover:text-primary/70">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Responsibilities */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">
                            {formData.type === 'education' ? "Key Courses / Research" : formData.type === 'achievement' ? "Key Details / Criteria" : "Key Responsibilities"}
                        </label>
                        <div className="flex gap-2">
                            <input
                                value={responsibilityInput}
                                onChange={(e) => setResponsibilityInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addToArray("responsibilities", responsibilityInput);
                                    }
                                }}
                                className="flex h-10 flex-1 rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder={formData.type === 'education' ? "Data Structures, Algorithms..." : formData.type === 'achievement' ? "judged by industry experts..." : "Add a responsibility..."}
                            />
                            <button
                                type="button"
                                onClick={() => addToArray("responsibilities", responsibilityInput)}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                        <ul className="list-disc list-inside space-y-1 mt-2">
                            {formData.responsibilities.map((resp, index) => (
                                <li key={index} className="text-sm flex items-start gap-2">
                                    <span className="flex-1">{resp}</span>
                                    <button type="button" onClick={() => removeFromArray("responsibilities", index)} className="text-red-500 hover:text-red-700">
                                        <X className="h-4 w-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Achievements */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">
                            {formData.type === 'education' ? "Honors / Awards" : formData.type === 'achievement' ? "Additional Highlights" : "Key Achievements"}
                        </label>
                        <div className="flex gap-2">
                            <input
                                value={achievementInput}
                                onChange={(e) => setAchievementInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addToArray("achievements", achievementInput);
                                    }
                                }}
                                className="flex h-10 flex-1 rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="Add an achievement..."
                            />
                            <button
                                type="button"
                                onClick={() => addToArray("achievements", achievementInput)}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                        <ul className="list-disc list-inside space-y-1 mt-2">
                            {formData.achievements.map((achievement, index) => (
                                <li key={index} className="text-sm flex items-start gap-2">
                                    <span className="flex-1">{achievement}</span>
                                    <button type="button" onClick={() => removeFromArray("achievements", index)} className="text-red-500 hover:text-red-700">
                                        <X className="h-4 w-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 min-w-[120px]"
                        >
                            {isSubmitting ? "Updating..." : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Update Entry
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
