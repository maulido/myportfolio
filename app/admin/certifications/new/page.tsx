"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X } from "lucide-react";
import Link from "next/link";

export default function NewCertificationPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        issuer: "",
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: "",
        credentialId: "",
        credentialUrl: "",
        imageUrl: "",
        category: "Other",
        skills: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [existingSkills, setExistingSkills] = useState<string[]>([]);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [newSkill, setNewSkill] = useState("");

    useEffect(() => {
        fetchExistingSkills();
    }, []);

    const fetchExistingSkills = async () => {
        try {
            const res = await fetch('/api/certifications');
            const data = await res.json();
            if (data.success) {
                // Extract all unique skills from all certifications
                const allSkills = data.data.flatMap((cert: any) => cert.skills || []);
                const uniqueSkills = [...new Set(allSkills)].filter(Boolean).sort();
                setExistingSkills(uniqueSkills as string[]);
            }
        } catch (error) {
            console.error("Failed to fetch skills:", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const addSkill = (skill: string) => {
        const trimmedSkill = skill.trim();
        if (trimmedSkill && !selectedSkills.includes(trimmedSkill)) {
            setSelectedSkills([...selectedSkills, trimmedSkill]);
        }
        setNewSkill("");
    };

    const removeSkill = (skillToRemove: string) => {
        setSelectedSkills(selectedSkills.filter(s => s !== skillToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const dataToSubmit = {
                ...formData,
                skills: selectedSkills
            };

            const res = await fetch("/api/certifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToSubmit),
            });

            if (res.ok) {
                router.push("/admin");
            } else {
                alert("Failed to add certification");
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
                        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Add Certification</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 rounded-xl border border-primary/10 bg-card/10 backdrop-blur-sm p-8">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Title</label>
                            <input
                                required
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="Certificate Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Issuer</label>
                            <input
                                required
                                name="issuer"
                                value={formData.issuer}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="Issuing Organization"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Issue Date</label>
                            <input
                                type="date"
                                required
                                name="issueDate"
                                value={formData.issueDate}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Expiry Date</label>
                            <input
                                type="date"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                // @ts-ignore
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="AWS">AWS</option>
                                <option value="Cisco">Cisco</option>
                                <option value="Microsoft">Microsoft</option>
                                <option value="Google">Google</option>
                                <option value="Security">Security</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Credential ID</label>
                            <input
                                name="credentialId"
                                value={formData.credentialId}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="ID-12345"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Credential URL</label>
                        <input
                            name="credentialUrl"
                            value={formData.credentialUrl}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="https://credly.com/..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Badge Image URL</label>
                        <input
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="https://example.com/badge.png"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Skills</label>
                        <div className="space-y-3">
                            {/* Selected Skills Display */}
                            {selectedSkills.length > 0 && (
                                <div className="flex flex-wrap gap-2 p-3 rounded-md border border-input/50 bg-background/30">
                                    {selectedSkills.map((skill) => (
                                        <span
                                            key={skill}
                                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20"
                                        >
                                            {skill}
                                            <button
                                                type="button"
                                                onClick={() => removeSkill(skill)}
                                                className="hover:bg-primary/20 rounded-full p-0.5"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Single Input with Autocomplete */}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addSkill(newSkill);
                                        }
                                    }}
                                    className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Type a skill (e.g., Cloud, Networking) and press Enter..."
                                />

                                {/* Autocomplete Suggestions Dropdown */}
                                {newSkill && existingSkills.filter(s =>
                                    s.toLowerCase().includes(newSkill.toLowerCase()) &&
                                    !selectedSkills.includes(s)
                                ).length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-card border border-primary/20 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                            {existingSkills
                                                .filter(s =>
                                                    s.toLowerCase().includes(newSkill.toLowerCase()) &&
                                                    !selectedSkills.includes(s)
                                                )
                                                .slice(0, 5)
                                                .map((skill) => (
                                                    <button
                                                        key={skill}
                                                        type="button"
                                                        onClick={() => {
                                                            addSkill(skill);
                                                        }}
                                                        className="w-full text-left px-3 py-2 hover:bg-primary/10 text-sm transition-colors"
                                                    >
                                                        {skill}
                                                    </button>
                                                ))
                                            }
                                        </div>
                                    )}
                            </div>

                            <p className="text-xs text-muted-foreground">
                                💡 Type to see suggestions or enter a new skill. Press Enter to add.
                            </p>
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
                                    Save Certificate
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
