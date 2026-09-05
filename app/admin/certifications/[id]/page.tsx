"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, FileText, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { UploadButton } from "@/lib/uploadthing";
import { AdminLangTabs } from "@/components/AdminLangTabs";

export default function EditCertificationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
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
        category: "Cloud",
        description: "",
        description_id: "",
    });
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [newSkill, setNewSkill] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCert = async () => {
            try {
                const res = await fetch(`/api/certifications/${id}`);
                const data = await res.json();
                if (data.success && data.data) {
                    const cert = data.data;
                    const rawIssueDate = cert.issueDate || cert.date;
                    const issueDate = rawIssueDate ? new Date(rawIssueDate).toISOString().split('T')[0] : '';
                    const expiryDate = cert.expiryDate ? new Date(cert.expiryDate).toISOString().split('T')[0] : '';

                    setFormData({
                        title: cert.title || "",
                        title_id: cert.title_id || "",
                        issuer: cert.issuer || "",
                        issueDate,
                        expiryDate,
                        credentialId: cert.credentialId || "",
                        credentialUrl: cert.credentialUrl || "",
                        imageUrl: cert.imageUrl || "",
                        certificateFileUrl: cert.certificateFileUrl || "",
                        category: cert.category || "Cloud",
                        description: cert.description || "",
                        description_id: cert.description_id || "",
                    });
                    setSelectedSkills(cert.skills || []);
                }
            } catch (error) {
                console.error("Failed to fetch certification", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCert();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const addSkill = (skill: string) => {
        const trimmed = skill.trim();
        if (trimmed && !selectedSkills.includes(trimmed)) {
            setSelectedSkills([...selectedSkills, trimmed]);
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
                title_id: formData.title_id || undefined,
                description_id: formData.description_id || undefined,
                expiryDate: formData.expiryDate || undefined,
                skills: selectedSkills,
            };

            const res = await fetch(`/api/certifications/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToSubmit),
            });

            if (res.ok) {
                router.push("/admin/certifications");
            } else {
                const err = await res.json();
                alert(`Failed to update certification: ${err.error || "Unknown error"}`);
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
                <span>Loading certification details...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background/50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/certifications">
                        <button type="button" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10 cursor-pointer">
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Edit Certification</h1>
                        <p className="text-xs text-muted-foreground">Manage vendor credentials, verification URLs, and bilingual titles.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 rounded-xl border border-primary/10 bg-card/10 backdrop-blur-sm p-6 sm:p-8">
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
                            <label className="text-sm font-medium leading-none">Issuer *</label>
                            <input
                                required
                                name="issuer"
                                value={formData.issuer}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="Cisco, AWS, Red Hat..."
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Category *</label>
                            <input
                                required
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="Network, Cloud, Security..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Issue Date *</label>
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
                            <label className="text-sm font-medium leading-none">Expiry Date (Optional)</label>
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
                            <label className="text-sm font-medium leading-none">Credential ID</label>
                            <input
                                name="credentialId"
                                value={formData.credentialId}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="CSCO-1234567"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Verification URL</label>
                            <input
                                name="credentialUrl"
                                value={formData.credentialUrl}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="https://credly.com/..."
                            />
                        </div>
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

                    {/* Certificate PDF */}
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
                                            className="p-1 hover:bg-red-500/10 rounded cursor-pointer"
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
                        </div>
                    </div>

                    {/* Bilingual Description */}
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

                    {/* Skills Covered */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Skills Covered</label>
                        <div className="flex gap-2">
                            <input
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addSkill(newSkill);
                                    }
                                }}
                                className="flex h-10 flex-1 rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="Add skill (e.g. OSPF, BGP, Docker)..."
                            />
                            <button
                                type="button"
                                onClick={() => addSkill(newSkill)}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 cursor-pointer"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {selectedSkills.map((skill) => (
                                <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">
                                    {skill}
                                    <button type="button" onClick={() => removeSkill(skill)} className="hover:text-primary/70 cursor-pointer">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
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
                                    Update Certificate
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
