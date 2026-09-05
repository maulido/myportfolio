"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Edit, Save, X, User, Briefcase, MapPin, Mail, Phone, Github, Linkedin, Twitter, Globe, Instagram, FileText, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { UploadButton } from "@/lib/uploadthing";
import { AdminLangTabs } from "@/components/AdminLangTabs";

export interface AboutMeData {
    paragraph1: string;
    paragraph1_id?: string;
    paragraph2: string;
    paragraph2_id?: string;
    profilePhotoUrl?: string;
    name?: string;
    title?: string;
    location?: string;
    email?: string;
    phone?: string;
    socialLinks?: {
        github?: string;
        linkedin?: string;
        twitter?: string;
        website?: string;
        instagram?: string;
    };
    stats?: {
        yearsExperience?: number;
        projectsCompleted?: number;
        technologiesMastered?: number;
        certificationsEarned?: number;
    };
}

interface AboutMeEditorProps {
    initialData: AboutMeData;
    onSave: (data: AboutMeData) => Promise<void>;
}

export default function AboutMeEditor({ initialData, onSave }: AboutMeEditorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [langTab, setLangTab] = useState<"en" | "id">("en");
    const [editData, setEditData] = useState<AboutMeData>(initialData || {
        paragraph1: '',
        paragraph1_id: '',
        paragraph2: '',
        paragraph2_id: '',
        profilePhotoUrl: '',
        name: '',
        title: '',
        location: '',
        email: '',
        phone: '',
        socialLinks: {
            github: '',
            linkedin: '',
            twitter: '',
            website: '',
            instagram: ''
        },
        stats: {
            yearsExperience: 0,
            projectsCompleted: 0,
            technologiesMastered: 0,
            certificationsEarned: 0
        }
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData) {
            setEditData({
                ...initialData,
                socialLinks: initialData.socialLinks || {},
                stats: initialData.stats || {}
            });
        }
    }, [initialData]);

    const handleSave = async () => {
        if (!editData.paragraph1?.trim() || !editData.paragraph2?.trim()) {
            setError('Both paragraphs are required');
            return;
        }

        setError('');
        setIsSaving(true);
        try {
            await onSave(editData);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to save:", error);
            setError('Failed to save About Me content. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditData(initialData);
        setIsEditing(false);
        setError('');
    };

    const updateSocialLink = (platform: string, value: string) => {
        setEditData({
            ...editData,
            socialLinks: {
                ...editData.socialLinks,
                [platform]: value
            }
        });
    };

    const updateStat = (key: string, value: number) => {
        setEditData({
            ...editData,
            stats: {
                ...editData.stats,
                [key]: value
            }
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/40 backdrop-blur-md border border-primary/10 rounded-2xl p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">About Me - Full Profile</h3>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                        <Edit className="h-4 w-4" />
                        Edit Profile
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-6">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Profile Photo */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Profile Photo
                        </label>
                        {editData.profilePhotoUrl ? (
                            <div className="flex items-center gap-4">
                                <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20 relative">
                                    <Image
                                        src={editData.profilePhotoUrl}
                                        alt="Profile"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <a
                                        href={editData.profilePhotoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-primary hover:underline"
                                    >
                                        View Full Size
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => setEditData({ ...editData, profilePhotoUrl: '' })}
                                        className="text-xs text-red-500 hover:underline"
                                    >
                                        Remove Photo
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center p-6 border-2 border-dashed border-primary/20 rounded-lg">
                                <UploadButton
                                    endpoint="imageUploader"
                                    onClientUploadComplete={(res) => {
                                        const uploadRes = res as { url: string }[];
                                        if (uploadRes && uploadRes[0]) {
                                            setEditData({ ...editData, profilePhotoUrl: uploadRes[0].url });
                                        }
                                    }}
                                    onUploadError={(error: Error) => {
                                        alert(`Upload failed: ${error.message}`);
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                <User className="h-4 w-4" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={editData.name || ''}
                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                className="w-full rounded-lg border border-input/50 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                <Briefcase className="h-4 w-4" />
                                Title/Role
                            </label>
                            <input
                                type="text"
                                value={editData.title || ''}
                                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                className="w-full rounded-lg border border-input/50 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Full Stack Developer"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                <MapPin className="h-4 w-4" />
                                Location
                            </label>
                            <input
                                type="text"
                                value={editData.location || ''}
                                onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                                className="w-full rounded-lg border border-input/50 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Jakarta, Indonesia"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                <Mail className="h-4 w-4" />
                                Email
                            </label>
                            <input
                                type="email"
                                value={editData.email || ''}
                                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                className="w-full rounded-lg border border-input/50 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="john@example.com"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                <Phone className="h-4 w-4" />
                                Phone (Optional)
                            </label>
                            <input
                                type="tel"
                                value={editData.phone || ''}
                                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                className="w-full rounded-lg border border-input/50 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="+62 812 3456 7890"
                            />
                        </div>
                    </div>

                    {/* About Me Paragraphs */}
                    <div className="space-y-4">
                        <AdminLangTabs
                            activeTab={langTab}
                            onChange={setLangTab}
                            label="About Me Biographies"
                        />

                        {langTab === "en" ? (
                            <>
                                <div>
                                    <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                        <FileText className="h-4 w-4 text-primary" />
                                        About Me - Paragraph 1 (English) *
                                    </label>
                                    <textarea
                                        value={editData.paragraph1}
                                        onChange={(e) => setEditData({ ...editData, paragraph1: e.target.value })}
                                        rows={4}
                                        className="w-full rounded-lg border border-input/50 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="First paragraph in English..."
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                        <FileText className="h-4 w-4 text-primary" />
                                        About Me - Paragraph 2 (English) *
                                    </label>
                                    <textarea
                                        value={editData.paragraph2}
                                        onChange={(e) => setEditData({ ...editData, paragraph2: e.target.value })}
                                        rows={4}
                                        className="w-full rounded-lg border border-input/50 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="Second paragraph in English..."
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                        <FileText className="h-4 w-4 text-primary" />
                                        About Me - Paragraf 1 (Bahasa Indonesia - Opsional)
                                    </label>
                                    <textarea
                                        value={editData.paragraph1_id || ""}
                                        onChange={(e) => setEditData({ ...editData, paragraph1_id: e.target.value })}
                                        rows={4}
                                        className="w-full rounded-lg border border-input/50 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="Paragraf pertama dalam Bahasa Indonesia (fallback ke versi English jika kosong)..."
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                        <FileText className="h-4 w-4 text-primary" />
                                        About Me - Paragraf 2 (Bahasa Indonesia - Opsional)
                                    </label>
                                    <textarea
                                        value={editData.paragraph2_id || ""}
                                        onChange={(e) => setEditData({ ...editData, paragraph2_id: e.target.value })}
                                        rows={4}
                                        className="w-full rounded-lg border border-input/50 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="Paragraf kedua dalam Bahasa Indonesia (fallback ke versi English jika kosong)..."
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Social Links */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-primary">Social Media Links</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                    <Github className="h-4 w-4" />
                                    GitHub
                                </label>
                                <input
                                    type="url"
                                    value={editData.socialLinks?.github || ''}
                                    onChange={(e) => updateSocialLink('github', e.target.value)}
                                    className="w-full rounded-lg border border-input/50 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="https://github.com/username"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                    <Linkedin className="h-4 w-4" />
                                    LinkedIn
                                </label>
                                <input
                                    type="url"
                                    value={editData.socialLinks?.linkedin || ''}
                                    onChange={(e) => updateSocialLink('linkedin', e.target.value)}
                                    className="w-full rounded-lg border border-input/50 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="https://linkedin.com/in/username"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                    <Twitter className="h-4 w-4" />
                                    Twitter/X
                                </label>
                                <input
                                    type="url"
                                    value={editData.socialLinks?.twitter || ''}
                                    onChange={(e) => updateSocialLink('twitter', e.target.value)}
                                    className="w-full rounded-lg border border-input/50 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="https://twitter.com/username"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                    <Globe className="h-4 w-4" />
                                    Website
                                </label>
                                <input
                                    type="url"
                                    value={editData.socialLinks?.website || ''}
                                    onChange={(e) => updateSocialLink('website', e.target.value)}
                                    className="w-full rounded-lg border border-input/50 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="https://yourwebsite.com"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                    <Instagram className="h-4 w-4" />
                                    Instagram
                                </label>
                                <input
                                    type="url"
                                    value={editData.socialLinks?.instagram || ''}
                                    onChange={(e) => updateSocialLink('instagram', e.target.value)}
                                    className="w-full rounded-lg border border-input/50 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="https://instagram.com/username"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Quick Stats
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                                    Years Experience
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={editData.stats?.yearsExperience || 0}
                                    onChange={(e) => updateStat('yearsExperience', parseInt(e.target.value) || 0)}
                                    className="w-full rounded-lg border border-input/50 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                                    Projects Completed
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={editData.stats?.projectsCompleted || 0}
                                    onChange={(e) => updateStat('projectsCompleted', parseInt(e.target.value) || 0)}
                                    className="w-full rounded-lg border border-input/50 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                                    Technologies Mastered
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={editData.stats?.technologiesMastered || 0}
                                    onChange={(e) => updateStat('technologiesMastered', parseInt(e.target.value) || 0)}
                                    className="w-full rounded-lg border border-input/50 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                                    Certifications Earned
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={editData.stats?.certificationsEarned || 0}
                                    onChange={(e) => updateStat('certificationsEarned', parseInt(e.target.value) || 0)}
                                    className="w-full rounded-lg border border-input/50 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-4 border-t border-primary/10">
                        <button
                            onClick={handleCancel}
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-input hover:bg-accent transition-colors disabled:opacity-50"
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            {isSaving ? "Saving..." : "Save All Changes"}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Display Mode */}
                    {editData.profilePhotoUrl && (
                        <div className="flex justify-center">
                            <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-primary/20 relative">
                                <Image
                                    src={editData.profilePhotoUrl}
                                    alt="Profile"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        </div>
                    )}

                    <div className="text-center">
                        {editData.name && <h4 className="text-xl font-bold">{editData.name}</h4>}
                        {editData.title && <p className="text-primary font-medium">{editData.title}</p>}
                        {editData.location && <p className="text-sm text-muted-foreground">{editData.location}</p>}
                    </div>

                    <div className="space-y-4 text-sm text-muted-foreground">
                        <p className="leading-relaxed">{initialData?.paragraph1 || 'No content yet'}</p>
                        <p className="leading-relaxed">{initialData?.paragraph2 || ''}</p>
                        {initialData?.paragraph1_id && (
                            <div className="pt-3 border-t border-border/40 text-xs italic text-muted-foreground/80 space-y-1.5">
                                <span className="font-semibold text-primary block not-italic">[Versi Indonesia]</span>
                                <p>{initialData.paragraph1_id}</p>
                                {initialData.paragraph2_id && <p>{initialData.paragraph2_id}</p>}
                            </div>
                        )}
                    </div>

                    {(editData.socialLinks?.github || editData.socialLinks?.linkedin || editData.socialLinks?.twitter) && (
                        <div className="flex justify-center gap-3">
                            {editData.socialLinks?.github && (
                                <a href={editData.socialLinks.github} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20">
                                    <Github className="h-4 w-4" />
                                </a>
                            )}
                            {editData.socialLinks?.linkedin && (
                                <a href={editData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20">
                                    <Linkedin className="h-4 w-4" />
                                </a>
                            )}
                            {editData.socialLinks?.twitter && (
                                <a href={editData.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20">
                                    <Twitter className="h-4 w-4" />
                                </a>
                            )}
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
}
