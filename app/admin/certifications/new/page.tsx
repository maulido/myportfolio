"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, FileText } from "lucide-react";
import Link from "next/link";
import { UploadButton } from "@/lib/uploadthing";
import { AdminLangTabs } from "@/components/AdminLangTabs";

export default function NewCertificationPage() {
    const router = useRouter();
    const [langTab, setLangTab] = useState<"en" | "id">("en");
    const [formData, setFormData] = useState({
        title: "",
        title_id: "",
        issuer: "",
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: "",
        credentialId: "",
        credentialUrl: "",
        imageUrl: "",
        certificateFileUrl: "",
        category: "",
        description: "",
        description_id: "",
        skills: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [existingSkills, setExistingSkills] = useState<string[]>([]);
    const [existingCategories, setExistingCategories] = useState<string[]>([]);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [newSkill, setNewSkill] = useState("");

    useEffect(() => {
        fetchExistingSkills();
        fetchExistingCategories();
    }, []);

    const fetchExistingSkills = async () => {
        try {
            const res = await fetch('/api/certifications');
            const data = await res.json();
            if (data.success) {
                // Extract all unique skills from all certifications
                const allSkills = data.data.flatMap((cert: { skills: string[] }) => cert.skills || []);
                const uniqueSkills = [...new Set(allSkills)].filter(Boolean).sort();
                setExistingSkills(uniqueSkills as string[]);
            }
        } catch (error) {
            console.error("Failed to fetch skills:", error);
        }
    };

    const fetchExistingCategories = async () => {
        try {
            const res = await fetch('/api/certifications');
            const data = await res.json();
            if (data.success) {
                // Extract unique categories
                const categories = [...new Set(data.data.map((cert: { category: string }) => cert.category).filter(Boolean))].sort();
                setExistingCategories(categories as string[]);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
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

            // Debug: log data being submitted
            console.log('Submitting certification data:', dataToSubmit);
            console.log('Certificate File URL:', dataToSubmit.certificateFileUrl);

            const res = await fetch("/api/certifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToSubmit),
            });

            if (res.ok) {
                const result = await res.json();
                console.log('Certification created:', result);
                router.push("/admin/certifications");
            } else {
                const error = await res.json();
                console.error('Failed to create certification:', error);
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
                    <Link href="/admin/certifications">
                        <button type="button" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Add Certification</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 rounded-xl border border-primary/10 bg-card/10 backdrop-blur-sm p-8">
                    <AdminLangTabs
                        activeTab={langTab}
                        onChange={setLangTab}
                        label="Certification Localization"
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">
                                {langTab === "en" ? "Title (EN) *" : "Judul Sertifikasi (ID)"}
                            </label>
                            {langTab === "en" ? (
                                <input
                                    required
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Certificate Name (English)"
                                />
                            ) : (
                                <input
                                    name="title_id"
                                    value={formData.title_id}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Nama Sertifikasi (Bahasa Indonesia - Opsional)"
                                />
                            )}
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
                            <div className="relative">
                                <input
                                    required
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Type category (e.g., AWS, Cisco)..."
                                />

                                {/* Autocomplete Suggestions Dropdown */}
                                {formData.category && existingCategories.filter(cat =>
                                    cat.toLowerCase().includes(formData.category.toLowerCase()) &&
                                    cat.toLowerCase() !== formData.category.toLowerCase()
                                ).length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-card border border-primary/20 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                            {existingCategories
                                                .filter(cat =>
                                                    cat.toLowerCase().includes(formData.category.toLowerCase()) &&
                                                    cat.toLowerCase() !== formData.category.toLowerCase()
                                                )
                                                .slice(0, 5)
                                                .map((cat) => (
                                                    <button
                                                        key={cat}
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData(prev => ({ ...prev, category: cat }));
                                                        }}
                                                        className="w-full text-left px-3 py-2 hover:bg-primary/10 text-sm transition-colors"
                                                    >
                                                        {cat}
                                                    </button>
                                                ))
                                            }
                                        </div>
                                    )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Type to see suggestions or enter a new category
                            </p>
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
                        <label className="text-sm font-medium leading-none">Certificate File (PDF)</label>
                        <div className="space-y-3">
                            {formData.certificateFileUrl ? (
                                <div className="flex items-center justify-between p-4 rounded-lg border border-primary/20 bg-primary/5">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="text-sm font-medium">Certificate uploaded</p>
                                            <p className="text-xs text-muted-foreground">Click to view or replace</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={formData.certificateFileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-primary hover:underline"
                                        >
                                            View
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, certificateFileUrl: "" }))}
                                            className="p-1 hover:bg-red-500/10 rounded"
                                        >
                                            <X className="h-4 w-4 text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center p-6 border-2 border-dashed border-primary/20 rounded-lg hover:border-primary/40 transition-colors">
                                    <UploadButton
                                        endpoint="certificateUploader"
                                        onClientUploadComplete={(res: { url: string }[]) => {
                                            if (res && res[0]) {
                                                setFormData(prev => ({ ...prev, certificateFileUrl: res[0].url }));
                                            }
                                        }}
                                        onUploadError={(error: Error) => {
                                            alert(`Upload failed: ${error.message}`);
                                        }}
                                        appearance={{
                                            button: "bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium",
                                            allowedContent: "text-xs text-muted-foreground"
                                        }}
                                    />
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Upload the certificate PDF file (max 8MB)
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">
                            {langTab === "en" ? "Description & Summary (EN)" : "Deskripsi Sertifikasi (ID)"}
                        </label>
                        {langTab === "en" ? (
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="flex w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="Brief overview of credential, syllabus, or verified competencies..."
                            />
                        ) : (
                            <textarea
                                name="description_id"
                                value={formData.description_id}
                                onChange={handleChange}
                                rows={3}
                                className="flex w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="Rangkuman kompetensi yang diverifikasi dalam Bahasa Indonesia (opsional)..."
                            />
                        )}
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
                                    s.toLowerCase() !== newSkill.toLowerCase() &&
                                    !selectedSkills.includes(s)
                                ).length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-card border border-primary/20 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                            {existingSkills
                                                .filter(s =>
                                                    s.toLowerCase().includes(newSkill.toLowerCase()) &&
                                                    s.toLowerCase() !== newSkill.toLowerCase() &&
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
                                Type to see suggestions or enter a new skill. Press Enter to add.
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
