"use client";

import { useState, useEffect } from "react";
import { Save, Globe, Share2, Mail, FileText, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Settings State
    const [settings, setSettings] = useState({
        siteTitle: "",
        siteDescription: "",
        resumeUrl: "",
        contactEmail: "",
        socialGithub: "",
        socialLinkedin: "",
        socialTwitter: "",
        socialInstagram: ""
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/settings");
            const data = await res.json();

            if (data.success && Array.isArray(data.data)) {
                // Convert array of {key, value} to object
                const settingsObj: any = { ...settings };
                data.data.forEach((item: any) => {
                    settingsObj[item.key] = item.value;
                });
                setSettings(settingsObj);
            }
        } catch (error) {
            console.error("Failed to load settings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save each setting individually (or could update API to accept bulk)
            // For now, we loop through keys
            const promises = Object.entries(settings).map(([key, value]) =>
                fetch("/api/settings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ key, value })
                })
            );

            await Promise.all(promises);
            alert("Settings saved successfully!");
        } catch (error) {
            console.error("Failed to save", error);
            alert("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background/50 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin">
                            <button type="button" className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
                            <p className="text-muted-foreground">Manage global configuration and social links</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center justify-center rounded-2xl text-sm font-bold bg-primary text-white hover:bg-primary/90 h-11 px-6 shadow-lg shadow-primary/25 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                    >
                        {saving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid gap-6"
                >
                    {/* General Settings */}
                    <div className="bg-card/40 backdrop-blur-md border border-primary/10 rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Globe className="h-5 w-5 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold">General Information</h2>
                        </div>
                        <div className="grid gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Site Title</label>
                                <input
                                    name="siteTitle"
                                    value={settings.siteTitle}
                                    onChange={handleChange}
                                    placeholder="e.g. John Doe - Full Stack Developer"
                                    className="w-full px-4 py-2 rounded-xl bg-background/50 border border-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Site Description (SEO)</label>
                                <textarea
                                    name="siteDescription"
                                    value={settings.siteDescription}
                                    onChange={handleChange}
                                    placeholder="Brief description for search engines..."
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-xl bg-background/50 border border-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="bg-card/40 backdrop-blur-md border border-primary/10 rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Share2 className="h-5 w-5 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold">Social Media</h2>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">GitHub URL</label>
                                <input
                                    name="socialGithub"
                                    value={settings.socialGithub}
                                    onChange={handleChange}
                                    placeholder="https://github.com/username"
                                    className="w-full px-4 py-2 rounded-xl bg-background/50 border border-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">LinkedIn URL</label>
                                <input
                                    name="socialLinkedin"
                                    value={settings.socialLinkedin}
                                    onChange={handleChange}
                                    placeholder="https://linkedin.com/in/username"
                                    className="w-full px-4 py-2 rounded-xl bg-background/50 border border-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Twitter / X URL</label>
                                <input
                                    name="socialTwitter"
                                    value={settings.socialTwitter}
                                    onChange={handleChange}
                                    placeholder="https://twitter.com/username"
                                    className="w-full px-4 py-2 rounded-xl bg-background/50 border border-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Instagram URL</label>
                                <input
                                    name="socialInstagram"
                                    value={settings.socialInstagram}
                                    onChange={handleChange}
                                    placeholder="https://instagram.com/username"
                                    className="w-full px-4 py-2 rounded-xl bg-background/50 border border-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact & Resume */}
                    <div className="bg-card/40 backdrop-blur-md border border-primary/10 rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold">Files & Contact</h2>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Resume / CV URL</label>
                                <div className="flex gap-2">
                                    <input
                                        name="resumeUrl"
                                        value={settings.resumeUrl}
                                        onChange={handleChange}
                                        placeholder="Link to PDF or Google Doc"
                                        className="w-full px-4 py-2 rounded-xl bg-background/50 border border-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                    {/* Future: Add file upload button here */}
                                </div>
                                <p className="text-xs text-muted-foreground">Extensions matching .pdf will show download icon.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Contact Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        name="contactEmail"
                                        value={settings.contactEmail}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-background/50 border border-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
