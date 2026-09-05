"use client";

import { useState, useEffect } from "react";
import { 
    Save, 
    Globe, 
    Share2, 
    Mail, 
    ArrowLeft, 
    Loader2, 
    Sparkles, 
    Home, 
    BookOpen, 
    Briefcase, 
    Award, 
    FileCode, 
    Camera, 
    Laptop, 
    ExternalLink, 
    Shield, 
    Layers, 
    Terminal,
    MessageSquare,
    Building2,
    MapPin,
    Clock,
    Wrench
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { mutateSettingsCache } from "@/lib/useSettings";

type TabKey = "global" | "home" | "about" | "projects" | "certifications" | "blog" | "gallery_uses" | "contact" | "footer";

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<TabKey>("global");

    // Comprehensive Settings State
    const [settings, setSettings] = useState<Record<string, string>>({
        // Global & Branding
        brandName: "Portfolio",
        siteTitle: "Maulido | Network Engineer & Software Engineer",
        siteDescription: "Professional portfolio showcasing projects in network engineering and software development.",
        contactEmail: "email@example.com",
        contactPhone: "+62 812-3456-7890",
        whatsappNumber: "6281234567890",
        contactLocation: "Jakarta, Indonesia",
        resumeUrl: "",
        socialGithub: "https://github.com/maulido",
        socialLinkedin: "https://linkedin.com",
        socialTwitter: "https://twitter.com",
        socialInstagram: "https://instagram.com",
        isMaintenanceMode: "false",
        maintenanceTitle: "Scheduled Infrastructure Maintenance",
        maintenanceTitle_id: "Situs Sedang Dalam Pemeliharaan Berkala",
        maintenanceMessage: "We are currently conducting routine performance tuning, server optimization, and security updates. All services will be restored shortly.",
        maintenanceMessage_id: "Kami sedang melakukan optimalisasi infrastruktur, peningkatan server, dan pembaruan keamanan. Seluruh layanan akan segera kembali normal.",
        maintenanceExpectedEnd: "Within 2 hours",
        maintenanceExpectedEnd_id: "Dalam 2 jam",

        // Home Page
        heroTitle: "Digital Architect",
        heroRoles: "Network Specialist, Software Engineer, Cloud Architect, DevOps Engineer",
        heroSubtitle: "Building robust network infrastructures and scalable web applications with a focus on comprehensive digital solutions.",
        heroGreetingPrefix: "I'm a...",
        heroAvailableText: "Available for New Projects",
        isWorking: "true",
        heroPrimaryCtaText: "View Work",
        heroPrimaryCtaLink: "/projects",
        heroSecondaryCtaText: "Download CV",
        heroTechTags: "Next.js 16, React 19, TypeScript, Tailwind CSS, Docker, Cloud Networks, Python, MongoDB",
        homeAboutHeadline: "Architecting Scalable Code & High-Performance Networks",
        githubUsername: "maulido",
        showGithubActivity: "true",
        contactSectionTitle: "Let's Build Something Exceptional Together",
        contactSectionSubtitle: "Have an ambitious project in mind, need high-availability network design, or looking to collaborate? Reach out and let's turn your vision into reality.",

        // Contact Page (/contact)
        contactHeroBadge: "Direct Channel & Technical Advisory",
        contactHeroBadge_id: "Saluran Langsung & Konsultasi Teknis",
        contactHeroTitle: "Let's Build Something Exceptional Together",
        contactHeroTitle_id: "Mari Bangun Solusi Luar Biasa Bersama",
        contactHeroSubtitle: "Have an engineering challenge, architectural consultation, or a collaborative project in mind? Reach out directly via the form or my primary communication channels.",
        contactHeroSubtitle_id: "Memiliki tantangan rekayasa, konsultasi arsitektur, atau proyek kolaborasi? Hubungi langsung melalui formulir atau saluran komunikasi utama.",
        contactProtocolTitle: "Operational Protocol",
        contactProtocolTitle_id: "Protokol Operasional",
        contactProtocolSubtitle: "Engineering standards & client commitments",
        contactProtocolSubtitle_id: "Standar rekayasa & komitmen klien",
        contactResponseTime: "Within 2 to 4 hours",
        contactResponseTime_id: "Dalam 2 hingga 4 jam",
        contactSlaSuffix: "during regular working days.",
        contactSlaSuffix_id: "pada hari kerja reguler.",
        contactWorkingHours: "Mon - Fri, 09:00 - 18:00 WIB (UTC+7)",
        contactWorkingHours_id: "Sen - Jum, 09:00 - 18:00 WIB (UTC+7)",
        contactNdaTitle: "Confidentiality & Non-Disclosure",
        contactNdaTitle_id: "Kerahasiaan & Non-Disclosure",
        contactNdaDesc: "Mutual NDA execution ready for enterprise codebases and proprietary specs.",
        contactNdaDesc_id: "Siap menandatangani Mutual NDA untuk perlindungan codebase dan spesifikasi proprietary enterprise.",
        contactAdvisoryTitle: "Core Advisory Focus",
        contactAdvisoryTitle_id: "Fokus Konsultasi Utama",
        contactAdvisorySkills: "Enterprise Networking, Full-Stack Next.js 16, BGP & OSPF Routing, Microservices & APIs, Cloud Architecture, Security & Hardening",
        contactAdvisorySkills_id: "Infrastruktur Jaringan Enterprise, Rekayasa Full-Stack Next.js 16, Routing BGP & OSPF, Microservices & APIs, Arsitektur Cloud, Keamanan & Hardening",
        contactBaseTitle: "Base of Operations",
        contactBaseTitle_id: "Pusat Operasional",
        contactBaseDesc: "Operating from Jakarta, Indonesia (UTC+7). Open to full-time remote contracts, hybrid technical leadership, and global on-site consultations.",
        contactBaseDesc_id: "Beroperasi dari Jakarta, Indonesia (UTC+7). Terbuka untuk kontrak kerja remote penuh waktu, kepemimpinan teknis hybrid, dan konsultasi on-site global.",
        contactMeetingUrl: "",

        // About Page
        aboutHeroBadge: "Professional Profile & Engineering Philosophy",
        aboutHeroTitle: "Bridging the Gap Between Software Engineering & Resilient Network Infrastructure",
        aboutHeroSubtitle: "Combining deep protocol-level networking mastery with high-performance modern web software engineering.",
        aboutPrinciple1Title: "Security & Zero-Trust by Default",
        aboutPrinciple1Desc: "Security is never an afterthought. From strict network firewall rules and encrypted tunnels to secure authentication tokens and sanitized payloads, every layer must be hardened.",
        aboutPrinciple2Title: "Reliability & High Availability",
        aboutPrinciple2Desc: "Trained in real-world networking topologies, I design software architectures that gracefully handle connection drops, packet jitter, and server failovers without losing data integrity.",
        aboutPrinciple3Title: "Clean Code & Automated DevOps",
        aboutPrinciple3Desc: "If a workflow is executed repeatedly, it should be automated. I champion clean, self-documenting code, containerized builds, and automated CI/CD deployment pipelines.",
        aboutPrinciple4Title: "Pragmatic Architecture",
        aboutPrinciple4Desc: "Choosing the optimal tool for the problem. Avoiding unnecessary architectural bloat while prioritizing latency, maintainability, and exceptional developer experience.",
        aboutMethod1Title: "Discovery & Topology Audit",
        aboutMethod1Desc: "Analyzing requirement matrices, examining packet flows, bandwidth overhead, user journeys, and bottleneck vulnerability points before writing any code.",
        aboutMethod2Title: "Modular Architecture",
        aboutMethod2Desc: "Architecting loosely coupled components, strict schema validations, hardened firewall rules, and scalable database data structures.",
        aboutMethod3Title: "Hardening & Test Automation",
        aboutMethod3Desc: "Executing rigorous type verification, zero-trust token authentication, end-to-end stress testing, and edge case resilience handling.",
        aboutMethod4Title: "CI/CD & Continuous Telemetry",
        aboutMethod4Desc: "Deploying via automated pipelines with real-time error telemetry, uptime health checks, and zero-downtime rolling updates.",

        // Projects Page
        projectsHeroBadge: "Engineering Portfolio",
        projectsHeroTitle: "Engineered Solutions & Projects",
        projectsHeroSubtitle: "A showcase of production network architectures, full-stack web applications, and open-source systems.",
        projectsCtaTitle: "Have an ambitious project in mind?",
        projectsCtaSubtitle: "Whether you need high-availability network infrastructure or modern full-stack web engineering, let's connect.",

        // Certifications Page
        certificationsHeroBadge: "Verified Credentials & Accreditations",
        certificationsHeroTitle: "Industry Certifications & Accreditations",
        certificationsHeroSubtitle: "Validated technical competencies across network administration, software engineering, and cloud platforms.",
        certificationsTrustTitle: "Authenticity & Verification Guaranteed",
        certificationsTrustDesc: "All certifications listed here are backed by verifiable license numbers and official digital badge URLs.",

        // Blog Page
        blogHeroBadge: "Technical Publications & Notes",
        blogHeroTitle: "Engineering Insights & Deep Dives",
        blogHeroSubtitle: "Architectural post-mortems, hands-on tutorials, and engineering principles.",
        blogNewsletterTitle: "Stay Updated with Technical Insights",
        blogNewsletterDesc: "Subscribe to receive notifications when new deep dives and post-mortems are published.",

        // Gallery & Uses
        galleryHeroBadge: "Visual Archive & Moments",
        galleryHeroTitle: "Visual Documentation & Journey",
        galleryHeroSubtitle: "A photographic journey through tech conferences, server deployments, hackathons, and community milestones.",
        usesHeroBadge: "Workspace & Equipment",
        usesHeroTitle: "Tech Stack, Gear & Workspace",
        usesHeroSubtitle: "A comprehensive catalog of hardware, developer software, and desk gear that power my daily engineering workflow.",

        // Footer & Legal
        footerTagline: "Digital Architect specializing in resilient networks and scalable modern web applications.",
        copyrightText: "All rights reserved.",
        footerNewsletterTitle: "Subscribe to Newsletter",
        footerNewsletterSubtitle: "Get notified about new projects, tutorials, and engineering articles."
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/settings");
                const data = await res.json();

                if (data.success && Array.isArray(data.data)) {
                    const settingsObj: Record<string, string> = {};
                    data.data.forEach((item: { key: string; value: unknown }) => {
                        if (item && item.key) {
                            settingsObj[item.key] = typeof item.value === 'string'
                                ? item.value
                                : String(item.value ?? '');
                        }
                    });
                    setSettings(prev => ({ ...prev, ...settingsObj }));
                }
            } catch (error) {
                console.error("Failed to load settings", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings })
            });

            const data = await res.json();
            if (data.success) {
                mutateSettingsCache(settings);
                toast.success("All settings saved successfully!");
            } else {
                toast.error(data.error || "Failed to save settings");
            }
        } catch (error) {
            console.error("Failed to save", error);
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
        { key: "global", label: "Global & Branding", icon: Globe },
        { key: "home", label: "Home Page", icon: Home },
        { key: "about", label: "About Page", icon: BookOpen },
        { key: "projects", label: "Projects Page", icon: Briefcase },
        { key: "certifications", label: "Certifications Page", icon: Award },
        { key: "blog", label: "Blog Page", icon: FileCode },
        { key: "gallery_uses", label: "Gallery & Uses", icon: Camera },
        { key: "contact", label: "Contact Page", icon: MessageSquare },
        { key: "footer", label: "Footer & Legal", icon: Layers }
    ];

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background/50 p-4 sm:p-6 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
                {/* Sticky Header */}
                <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md py-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href="/admin">
                            <button type="button" className="inline-flex items-center justify-center rounded-xl text-sm font-medium border border-border bg-card hover:bg-muted h-10 w-10 transition-colors">
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                Site & Content Management
                            </h1>
                            <p className="text-xs text-muted-foreground">Kelola konfigurasi global dan konten tiap halaman publik</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 h-10 px-6 shadow-md shadow-primary/25 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {saving ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            {saving ? "Saving..." : "Save All Changes"}
                        </button>
                    </div>
                </div>

                {/* Quick Navigation / Preview Links Bar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
                    <span className="text-muted-foreground font-semibold shrink-0">Live Preview:</span>
                    {[
                        { label: "Home", href: "/" },
                        { label: "About", href: "/about" },
                        { label: "Projects", href: "/projects" },
                        { label: "Certifications", href: "/certifications" },
                        { label: "Blog", href: "/blog" },
                        { label: "Gallery", href: "/gallery" },
                        { label: "Uses", href: "/uses" },
                        { label: "Contact", href: "/contact" },
                    ].map((p) => (
                        <a
                            key={p.href}
                            href={p.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card border border-border text-foreground/80 hover:text-primary hover:border-primary/50 transition-colors shrink-0"
                        >
                            <span>{p.label}</span>
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    ))}
                </div>

                {/* Tabs Navigation */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border scrollbar-none">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                    active
                                        ? "bg-primary text-white shadow-md shadow-primary/25"
                                        : "bg-card/70 border border-border/70 text-muted-foreground hover:text-foreground hover:bg-card"
                                }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content Panels */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                >
                    {/* TAB 1: GLOBAL & BRANDING */}
                    {activeTab === "global" && (
                        <div className="grid gap-6">
                            {/* Maintenance Mode Configuration Card */}
                            <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/60">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
                                            <Wrench className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-lg font-bold">Maintenance Mode (Pemeliharaan Situs)</h2>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    settings.isMaintenanceMode === "true"
                                                        ? "bg-rose-500 text-white animate-pulse"
                                                        : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                                }`}>
                                                    {settings.isMaintenanceMode === "true" ? "ACTIVE / AKTIF" : "OFF (LIVE)"}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Kunci akses publik sementara dengan menampilkan halaman pemeliharaan berkala
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Link
                                            href="/maintenance"
                                            target="_blank"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors border border-border"
                                        >
                                            <span>Lihat Halaman Maintenance</span>
                                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() => setSettings(prev => ({
                                                ...prev,
                                                isMaintenanceMode: prev.isMaintenanceMode === "true" ? "false" : "true"
                                            }))}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                                                settings.isMaintenanceMode === "true"
                                                    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25"
                                                    : "bg-muted hover:bg-muted/80 text-foreground border border-border"
                                            }`}
                                        >
                                            <Wrench className="h-3.5 w-3.5" />
                                            <span>{settings.isMaintenanceMode === "true" ? "Mode: AKTIF" : "Mode: NONAKTIF"}</span>
                                        </button>
                                    </div>
                                </div>

                                {settings.isMaintenanceMode === "true" && (
                                    <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-800 dark:text-rose-200 text-xs">
                                        <strong>Pemberitahuan:</strong> Website saat ini diblokir untuk pengunjung umum dan dialihkan ke halaman pemeliharaan. Administrator yang sedang login tetap dapat melihat pratinjau situs publik secara normal.
                                    </div>
                                )}

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Maintenance Title [EN]</label>
                                        <input
                                            name="maintenanceTitle"
                                            value={settings.maintenanceTitle || ""}
                                            onChange={handleChange}
                                            placeholder="Scheduled Infrastructure Maintenance"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Judul Pemeliharaan [ID]</label>
                                        <input
                                            name="maintenanceTitle_id"
                                            value={settings.maintenanceTitle_id || ""}
                                            onChange={handleChange}
                                            placeholder="Situs Sedang Dalam Pemeliharaan Berkala"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Maintenance Explanation Message [EN]</label>
                                        <textarea
                                            name="maintenanceMessage"
                                            value={settings.maintenanceMessage || ""}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="We are currently conducting routine performance tuning, server optimization, and security updates..."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Pesan Penjelasan Pemeliharaan [ID]</label>
                                        <textarea
                                            name="maintenanceMessage_id"
                                            value={settings.maintenanceMessage_id || ""}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="Kami sedang melakukan optimalisasi infrastruktur, peningkatan server, dan pembaruan keamanan..."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Estimated Return Time [EN]</label>
                                        <input
                                            name="maintenanceExpectedEnd"
                                            value={settings.maintenanceExpectedEnd || ""}
                                            onChange={handleChange}
                                            placeholder="e.g. Within 2 hours or Today at 18:00 WIB"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Estimasi Waktu Selesai [ID]</label>
                                        <input
                                            name="maintenanceExpectedEnd_id"
                                            value={settings.maintenanceExpectedEnd_id || ""}
                                            onChange={handleChange}
                                            placeholder="mis. Dalam 2 jam atau Hari ini pukul 18:00 WIB"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Globe className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">Brand & SEO Identity</h2>
                                        <p className="text-xs text-muted-foreground">Konfigurasi nama brand navbar dan meta tag mesin pencari</p>
                                    </div>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Navbar Brand / Logo Text</label>
                                        <input
                                            name="brandName"
                                            value={settings.brandName || ""}
                                            onChange={handleChange}
                                            placeholder="e.g. Portfolio or Maulido"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Site Title (Browser Tab)</label>
                                        <input
                                            name="siteTitle"
                                            value={settings.siteTitle || ""}
                                            onChange={handleChange}
                                            placeholder="e.g. Maulido | Network & Software Engineer"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-xs font-semibold text-foreground">Site Meta Description (SEO)</label>
                                        <textarea
                                            name="siteDescription"
                                            value={settings.siteDescription || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Deskripsi singkat website untuk mesin pencari..."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Mail className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">Contact Details & Resume</h2>
                                        <p className="text-xs text-muted-foreground">Informasi kontak yang tampil di seluruh tombol aksi dan footer</p>
                                    </div>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Contact Email</label>
                                        <input
                                            name="contactEmail"
                                            value={settings.contactEmail || ""}
                                            onChange={handleChange}
                                            placeholder="you@example.com"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Contact Phone / Call</label>
                                        <input
                                            name="contactPhone"
                                            value={settings.contactPhone || ""}
                                            onChange={handleChange}
                                            placeholder="+62 812-3456-7890"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">WhatsApp Number (Direct Chat FAB)</label>
                                        <input
                                            name="whatsappNumber"
                                            value={settings.whatsappNumber || ""}
                                            onChange={handleChange}
                                            placeholder="6281234567890 (tanpa tanda + atau spasi)"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Location / Base</label>
                                        <input
                                            name="contactLocation"
                                            value={settings.contactLocation || ""}
                                            onChange={handleChange}
                                            placeholder="Jakarta, Indonesia"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-xs font-semibold text-foreground">Resume / CV Download URL</label>
                                        <input
                                            name="resumeUrl"
                                            value={settings.resumeUrl || ""}
                                            onChange={handleChange}
                                            placeholder="Tautan URL file PDF resume atau dokumen Google Drive"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Page Settings Callout */}
                            <div className="bg-card/40 backdrop-blur-md border border-primary/20 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
                                        <MessageSquare className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground">Contact Page & Operational Protocol</h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Kelola teks Operational Protocol, Response SLA, Working Hours, NDA, Core Advisory Focus, dan Base of Operations pada tab khusus.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("contact")}
                                    className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer whitespace-nowrap shrink-0"
                                >
                                    Buka Pengaturan Contact
                                </button>
                            </div>

                            <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Share2 className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">Social Media Profiles</h2>
                                        <p className="text-xs text-muted-foreground">Tautan akun media sosial publik di navbar dan footer</p>
                                    </div>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">GitHub URL</label>
                                        <input
                                            name="socialGithub"
                                            value={settings.socialGithub || ""}
                                            onChange={handleChange}
                                            placeholder="https://github.com/username"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">LinkedIn URL</label>
                                        <input
                                            name="socialLinkedin"
                                            value={settings.socialLinkedin || ""}
                                            onChange={handleChange}
                                            placeholder="https://linkedin.com/in/username"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Twitter / X URL</label>
                                        <input
                                            name="socialTwitter"
                                            value={settings.socialTwitter || ""}
                                            onChange={handleChange}
                                            placeholder="https://twitter.com/username"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Instagram URL</label>
                                        <input
                                            name="socialInstagram"
                                            value={settings.socialInstagram || ""}
                                            onChange={handleChange}
                                            placeholder="https://instagram.com/username"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: HOME PAGE */}
                    {activeTab === "home" && (
                        <div className="grid gap-6">
                            {/* Hero Section */}
                            <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">Hero Section (Beranda)</h2>
                                        <p className="text-xs text-muted-foreground">Teks headline utama, efek pengetikan profesi, dan tombol CTA hero</p>
                                    </div>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Main Headline Title</label>
                                        <input
                                            name="heroTitle"
                                            value={settings.heroTitle || ""}
                                            onChange={handleChange}
                                            placeholder="e.g. Digital Architect"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Greeting Prefix Badge</label>
                                        <input
                                            name="heroGreetingPrefix"
                                            value={settings.heroGreetingPrefix || ""}
                                            onChange={handleChange}
                                            placeholder="e.g. I'm a..."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-xs font-semibold text-foreground">Rotating Job Roles (Typing Effect)</label>
                                        <input
                                            name="heroRoles"
                                            value={settings.heroRoles || ""}
                                            onChange={handleChange}
                                            placeholder="Pisahkan dengan koma: Network Specialist, Software Engineer, Cloud Architect"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                        <p className="text-[11px] text-muted-foreground">Pisahkan setiap peran dengan tanda koma (,)</p>
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-xs font-semibold text-foreground">Hero Subtitle Paragraph</label>
                                        <textarea
                                            name="heroSubtitle"
                                            value={settings.heroSubtitle || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Deskripsi singkat di bawah judul headline..."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Availability Status Badge</label>
                                        <select
                                            name="isWorking"
                                            value={settings.isWorking || "true"}
                                            onChange={handleChange}
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        >
                                            <option value="true">Tampilkan Badge (Tersedia untuk Proyek)</option>
                                            <option value="false">Sembunyikan Badge</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Availability Text</label>
                                        <input
                                            name="heroAvailableText"
                                            value={settings.heroAvailableText || ""}
                                            onChange={handleChange}
                                            placeholder="e.g. Available for New Projects"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Primary CTA Label</label>
                                        <input
                                            name="heroPrimaryCtaText"
                                            value={settings.heroPrimaryCtaText || ""}
                                            onChange={handleChange}
                                            placeholder="e.g. View Work"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Primary CTA Target Link</label>
                                        <input
                                            name="heroPrimaryCtaLink"
                                            value={settings.heroPrimaryCtaLink || ""}
                                            onChange={handleChange}
                                            placeholder="e.g. /projects"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Secondary CTA Label</label>
                                        <input
                                            name="heroSecondaryCtaText"
                                            value={settings.heroSecondaryCtaText || ""}
                                            onChange={handleChange}
                                            placeholder="e.g. Download CV"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-xs font-semibold text-foreground">Core Tech Stack Strip (Pills di bawah CTA)</label>
                                        <input
                                            name="heroTechTags"
                                            value={settings.heroTechTags || ""}
                                            onChange={handleChange}
                                            placeholder="e.g. Next.js 16, React 19, TypeScript, Tailwind CSS, Docker, Cloud Networks, Python, MongoDB"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                        <p className="text-[11px] text-muted-foreground">Pisahkan setiap teknologi dengan tanda koma (,)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Home About Preview & GitHub Feed */}
                            <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <BookOpen className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">Home Sections (About, GitHub & Contact)</h2>
                                        <p className="text-xs text-muted-foreground">Konfigurasi seksi pendukung yang tampil di halaman Beranda</p>
                                    </div>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-xs font-semibold text-foreground">About Section Headline Title</label>
                                        <input
                                            name="homeAboutHeadline"
                                            value={settings.homeAboutHeadline || ""}
                                            onChange={handleChange}
                                            placeholder="e.g. Architecting Scalable Code & High-Performance Networks"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">GitHub Username (Live Activity Feed)</label>
                                        <input
                                            name="githubUsername"
                                            value={settings.githubUsername || ""}
                                            onChange={handleChange}
                                            placeholder="e.g. maulido"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">GitHub Activity Display</label>
                                        <select
                                            name="showGithubActivity"
                                            value={settings.showGithubActivity || "true"}
                                            onChange={handleChange}
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        >
                                            <option value="true">Tampilkan Seksi GitHub di Beranda</option>
                                            <option value="false">Sembunyikan Seksi GitHub</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-xs font-semibold text-foreground">Contact Section Title (Beranda & Kontak)</label>
                                        <input
                                            name="contactSectionTitle"
                                            value={settings.contactSectionTitle || ""}
                                            onChange={handleChange}
                                            placeholder="e.g. Let's Build Something Exceptional Together"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-xs font-semibold text-foreground">Contact Section Subtitle</label>
                                        <textarea
                                            name="contactSectionSubtitle"
                                            value={settings.contactSectionSubtitle || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Subjudul ajakan kontak..."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: ABOUT PAGE */}
                    {activeTab === "about" && (
                        <div className="grid gap-6">
                            {/* About Hero */}
                            <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <BookOpen className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">About Page Header (/about)</h2>
                                        <p className="text-xs text-muted-foreground">Judul dan pengantar utama pada halaman detail About</p>
                                    </div>
                                </div>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">About Hero Badge</label>
                                        <input
                                            name="aboutHeroBadge"
                                            value={settings.aboutHeroBadge || ""}
                                            onChange={handleChange}
                                            placeholder="e.g. Professional Profile & Engineering Philosophy"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">About Hero Title</label>
                                        <input
                                            name="aboutHeroTitle"
                                            value={settings.aboutHeroTitle || ""}
                                            onChange={handleChange}
                                            placeholder="e.g. Bridging the Gap Between Software Engineering & Resilient Network Infrastructure"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">About Hero Subtitle</label>
                                        <textarea
                                            name="aboutHeroSubtitle"
                                            value={settings.aboutHeroSubtitle || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Ringkasan filosofi arsitektur..."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 4 Architectural Principles */}
                            <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Shield className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">4 Architectural Principles</h2>
                                        <p className="text-xs text-muted-foreground">Empat pilar filosofi arsitektur sistem pada halaman About</p>
                                    </div>
                                </div>
                                <div className="grid gap-6 sm:grid-cols-2">
                                    {/* Principle 1 */}
                                    <div className="space-y-2 p-4 rounded-xl border border-border bg-background/50">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Prinsip 1 (Security)</span>
                                        <input
                                            name="aboutPrinciple1Title"
                                            value={settings.aboutPrinciple1Title || ""}
                                            onChange={handleChange}
                                            placeholder="Judul Prinsip 1"
                                            className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                        <textarea
                                            name="aboutPrinciple1Desc"
                                            value={settings.aboutPrinciple1Desc || ""}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="Deskripsi prinsip keamanan..."
                                            className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>

                                    {/* Principle 2 */}
                                    <div className="space-y-2 p-4 rounded-xl border border-border bg-background/50">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Prinsip 2 (Reliability)</span>
                                        <input
                                            name="aboutPrinciple2Title"
                                            value={settings.aboutPrinciple2Title || ""}
                                            onChange={handleChange}
                                            placeholder="Judul Prinsip 2"
                                            className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                        <textarea
                                            name="aboutPrinciple2Desc"
                                            value={settings.aboutPrinciple2Desc || ""}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="Deskripsi prinsip keandalan..."
                                            className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>

                                    {/* Principle 3 */}
                                    <div className="space-y-2 p-4 rounded-xl border border-border bg-background/50">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Prinsip 3 (Clean Code & DevOps)</span>
                                        <input
                                            name="aboutPrinciple3Title"
                                            value={settings.aboutPrinciple3Title || ""}
                                            onChange={handleChange}
                                            placeholder="Judul Prinsip 3"
                                            className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                        <textarea
                                            name="aboutPrinciple3Desc"
                                            value={settings.aboutPrinciple3Desc || ""}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="Deskripsi prinsip otomatisasi kode..."
                                            className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>

                                    {/* Principle 4 */}
                                    <div className="space-y-2 p-4 rounded-xl border border-border bg-background/50">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Prinsip 4 (Pragmatic Architecture)</span>
                                        <input
                                            name="aboutPrinciple4Title"
                                            value={settings.aboutPrinciple4Title || ""}
                                            onChange={handleChange}
                                            placeholder="Judul Prinsip 4"
                                            className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                        <textarea
                                            name="aboutPrinciple4Desc"
                                            value={settings.aboutPrinciple4Desc || ""}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="Deskripsi arsitektur pragmatis..."
                                            className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 4 Execution Methodology Steps */}
                            <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Terminal className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">4 Execution Blueprint Steps</h2>
                                        <p className="text-xs text-muted-foreground">Alur metodologi kerja terstandar dari penemuan hingga deployment</p>
                                    </div>
                                </div>
                                <div className="grid gap-6 sm:grid-cols-2">
                                    {/* Step 1 */}
                                    <div className="space-y-2 p-4 rounded-xl border border-border bg-background/50">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Tahap 01</span>
                                        <input
                                            name="aboutMethod1Title"
                                            value={settings.aboutMethod1Title || ""}
                                            onChange={handleChange}
                                            placeholder="Tahap 01 Judul"
                                            className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                        <textarea
                                            name="aboutMethod1Desc"
                                            value={settings.aboutMethod1Desc || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Deskripsi tahap 01..."
                                            className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>

                                    {/* Step 2 */}
                                    <div className="space-y-2 p-4 rounded-xl border border-border bg-background/50">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Tahap 02</span>
                                        <input
                                            name="aboutMethod2Title"
                                            value={settings.aboutMethod2Title || ""}
                                            onChange={handleChange}
                                            placeholder="Tahap 02 Judul"
                                            className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                        <textarea
                                            name="aboutMethod2Desc"
                                            value={settings.aboutMethod2Desc || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Deskripsi tahap 02..."
                                            className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>

                                    {/* Step 3 */}
                                    <div className="space-y-2 p-4 rounded-xl border border-border bg-background/50">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Tahap 03</span>
                                        <input
                                            name="aboutMethod3Title"
                                            value={settings.aboutMethod3Title || ""}
                                            onChange={handleChange}
                                            placeholder="Tahap 03 Judul"
                                            className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                        <textarea
                                            name="aboutMethod3Desc"
                                            value={settings.aboutMethod3Desc || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Deskripsi tahap 03..."
                                            className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>

                                    {/* Step 4 */}
                                    <div className="space-y-2 p-4 rounded-xl border border-border bg-background/50">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Tahap 04</span>
                                        <input
                                            name="aboutMethod4Title"
                                            value={settings.aboutMethod4Title || ""}
                                            onChange={handleChange}
                                            placeholder="Tahap 04 Judul"
                                            className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                        <textarea
                                            name="aboutMethod4Desc"
                                            value={settings.aboutMethod4Desc || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Deskripsi tahap 04..."
                                            className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: PROJECTS PAGE */}
                    {activeTab === "projects" && (
                        <div className="grid gap-6">
                            <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Briefcase className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">Projects Page (/projects)</h2>
                                        <p className="text-xs text-muted-foreground">Teks header portofolio karya dan banner kontak di bagian bawah</p>
                                    </div>
                                </div>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Projects Hero Badge</label>
                                        <input
                                            name="projectsHeroBadge"
                                            value={settings.projectsHeroBadge || ""}
                                            onChange={handleChange}
                                            placeholder="e.g. Engineering Portfolio"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Projects Hero Title</label>
                                        <input
                                            name="projectsHeroTitle"
                                            value={settings.projectsHeroTitle || ""}
                                            onChange={handleChange}
                                            placeholder="e.g. Engineered Solutions & Projects"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Projects Hero Subtitle</label>
                                        <textarea
                                            name="projectsHeroSubtitle"
                                            value={settings.projectsHeroSubtitle || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Deskripsi kurasi karya produksi..."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Bottom CTA Banner Title</label>
                                        <input
                                            name="projectsCtaTitle"
                                            value={settings.projectsCtaTitle || ""}
                                            onChange={handleChange}
                                            placeholder="e.g. Have an ambitious project in mind?"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Bottom CTA Banner Subtitle</label>
                                        <textarea
                                            name="projectsCtaSubtitle"
                                            value={settings.projectsCtaSubtitle || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Teks ajakan kolaborasi di bawah daftar proyek..."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 5: CERTIFICATIONS PAGE */}
                    {activeTab === "certifications" && (
                        <div className="grid gap-6">
                            <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Award className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">Certifications Page (/certifications)</h2>
                                        <p className="text-xs text-muted-foreground">Teks header halaman sertifikasi dan banner jaminan validitas kredensial</p>
                                    </div>
                                </div>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Certifications Hero Badge</label>
                                        <input
                                            name="certificationsHeroBadge"
                                            value={settings.certificationsHeroBadge || ""}
                                            onChange={handleChange}
                                            placeholder="e.g. Verified Credentials & Accreditations"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Certifications Hero Title</label>
                                        <input
                                            name="certificationsHeroTitle"
                                            value={settings.certificationsHeroTitle || ""}
                                            onChange={handleChange}
                                            placeholder="e.g. Industry Certifications & Accreditations"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Certifications Hero Subtitle</label>
                                        <textarea
                                            name="certificationsHeroSubtitle"
                                            value={settings.certificationsHeroSubtitle || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Deskripsi pengantar sertifikasi..."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Trust Guarantee Banner Title</label>
                                        <input
                                            name="certificationsTrustTitle"
                                            value={settings.certificationsTrustTitle || ""}
                                            onChange={handleChange}
                                            placeholder="e.g. Authenticity & Verification Guaranteed"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Trust Guarantee Banner Description</label>
                                        <textarea
                                            name="certificationsTrustDesc"
                                            value={settings.certificationsTrustDesc || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Pernyataan jaminan bahwa sertifikat didukung tautan verifikasi resmi..."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 6: BLOG PAGE */}
                    {activeTab === "blog" && (
                        <div className="grid gap-6">
                            <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <FileCode className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">Blog Page (/blog)</h2>
                                        <p className="text-xs text-muted-foreground">Teks header publikasi artikel teknik dan ajakan langganan newsletter</p>
                                    </div>
                                </div>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Blog Hero Badge</label>
                                        <input
                                            name="blogHeroBadge"
                                            value={settings.blogHeroBadge || ""}
                                            onChange={handleChange}
                                            placeholder="e.g. Technical Publications & Notes"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Blog Hero Title</label>
                                        <input
                                            name="blogHeroTitle"
                                            value={settings.blogHeroTitle || ""}
                                            onChange={handleChange}
                                            placeholder="e.g. Engineering Insights & Deep Dives"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Blog Hero Subtitle</label>
                                        <textarea
                                            name="blogHeroSubtitle"
                                            value={settings.blogHeroSubtitle || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Deskripsi kurasi tulisan teknik..."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Blog Newsletter Card Title</label>
                                        <input
                                            name="blogNewsletterTitle"
                                            value={settings.blogNewsletterTitle || ""}
                                            onChange={handleChange}
                                            placeholder="e.g. Stay Updated with Technical Insights"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Blog Newsletter Card Description</label>
                                        <textarea
                                            name="blogNewsletterDesc"
                                            value={settings.blogNewsletterDesc || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Deskripsi manfaat berlangganan tulisan..."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 7: GALLERY & USES */}
                    {activeTab === "gallery_uses" && (
                        <div className="grid gap-6">
                            {/* Gallery */}
                            <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Camera className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">Gallery Page (/gallery)</h2>
                                        <p className="text-xs text-muted-foreground">Teks header arsip visual dan dokumentasi momen</p>
                                    </div>
                                </div>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Gallery Hero Badge</label>
                                        <input
                                            name="galleryHeroBadge"
                                            value={settings.galleryHeroBadge || ""}
                                            onChange={handleChange}
                                            placeholder="e.g. Visual Archive & Moments"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Gallery Hero Title</label>
                                        <input
                                            name="galleryHeroTitle"
                                            value={settings.galleryHeroTitle || ""}
                                            onChange={handleChange}
                                            placeholder="e.g. Visual Documentation & Journey"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Gallery Hero Subtitle</label>
                                        <textarea
                                            name="galleryHeroSubtitle"
                                            value={settings.galleryHeroSubtitle || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Deskripsi arsip fotografi kegiatan..."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Uses */}
                            <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Laptop className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">Uses Page (/uses)</h2>
                                        <p className="text-xs text-muted-foreground">Teks header perangkat keras, piranti lunak, dan setup meja kerja</p>
                                    </div>
                                </div>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Uses Hero Badge</label>
                                        <input
                                            name="usesHeroBadge"
                                            value={settings.usesHeroBadge || ""}
                                            onChange={handleChange}
                                            placeholder="e.g. Workspace & Equipment"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Uses Hero Title</label>
                                        <input
                                            name="usesHeroTitle"
                                            value={settings.usesHeroTitle || ""}
                                            onChange={handleChange}
                                            placeholder="e.g. Tech Stack, Gear & Workspace"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Uses Hero Subtitle</label>
                                        <textarea
                                            name="usesHeroSubtitle"
                                            value={settings.usesHeroSubtitle || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Deskripsi katalog perangkat kerja..."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: CONTACT PAGE & OPERATIONAL PROTOCOL */}
                    {activeTab === "contact" && (
                        <div className="grid gap-6">
                            {/* Card 1: Operational Protocol */}
                            <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">Operational Protocol</h2>
                                        <p className="text-xs text-muted-foreground">Kustomisasi judul protokol, standar rekayasa, SLA respon, jam kerja, dan NDA</p>
                                    </div>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[10px] font-mono font-bold">EN</span>
                                            <span>Protocol Title</span>
                                        </label>
                                        <input
                                            name="contactProtocolTitle"
                                            value={settings.contactProtocolTitle || ""}
                                            onChange={handleChange}
                                            placeholder="Operational Protocol"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-mono font-bold">ID</span>
                                            <span>Judul Protokol (Indonesia)</span>
                                        </label>
                                        <input
                                            name="contactProtocolTitle_id"
                                            value={settings.contactProtocolTitle_id || ""}
                                            onChange={handleChange}
                                            placeholder="Protokol Operasional"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[10px] font-mono font-bold">EN</span>
                                            <span>Protocol Subtitle</span>
                                        </label>
                                        <input
                                            name="contactProtocolSubtitle"
                                            value={settings.contactProtocolSubtitle || ""}
                                            onChange={handleChange}
                                            placeholder="Engineering standards & client commitments"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-mono font-bold">ID</span>
                                            <span>Subjudul Protokol (Indonesia)</span>
                                        </label>
                                        <input
                                            name="contactProtocolSubtitle_id"
                                            value={settings.contactProtocolSubtitle_id || ""}
                                            onChange={handleChange}
                                            placeholder="Standar rekayasa & komitmen klien"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                        />
                                    </div>

                                    {/* Response SLA */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[10px] font-mono font-bold">EN</span>
                                            <span>Response SLA Time</span>
                                        </label>
                                        <input
                                            name="contactResponseTime"
                                            value={settings.contactResponseTime || ""}
                                            onChange={handleChange}
                                            placeholder="Within 2 to 4 hours"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-mono font-bold">ID</span>
                                            <span>Waktu Respon SLA (Indonesia)</span>
                                        </label>
                                        <input
                                            name="contactResponseTime_id"
                                            value={settings.contactResponseTime_id || ""}
                                            onChange={handleChange}
                                            placeholder="Dalam 2 hingga 4 jam"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[10px] font-mono font-bold">EN</span>
                                            <span>SLA Days Note / Suffix</span>
                                        </label>
                                        <input
                                            name="contactSlaSuffix"
                                            value={settings.contactSlaSuffix || ""}
                                            onChange={handleChange}
                                            placeholder="during regular working days."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-mono font-bold">ID</span>
                                            <span>Catatan Hari SLA (Indonesia)</span>
                                        </label>
                                        <input
                                            name="contactSlaSuffix_id"
                                            value={settings.contactSlaSuffix_id || ""}
                                            onChange={handleChange}
                                            placeholder="pada hari kerja reguler."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                        />
                                    </div>

                                    {/* Working Hours & Timezone */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[10px] font-mono font-bold">EN</span>
                                            <span>Working Hours & Timezone</span>
                                        </label>
                                        <input
                                            name="contactWorkingHours"
                                            value={settings.contactWorkingHours || ""}
                                            onChange={handleChange}
                                            placeholder="Mon - Fri, 09:00 - 18:00 WIB (UTC+7)"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-mono font-bold">ID</span>
                                            <span>Jam Kerja & Zona Waktu (Indonesia)</span>
                                        </label>
                                        <input
                                            name="contactWorkingHours_id"
                                            value={settings.contactWorkingHours_id || ""}
                                            onChange={handleChange}
                                            placeholder="Sen - Jum, 09:00 - 18:00 WIB (UTC+7)"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                        />
                                    </div>

                                    {/* Confidentiality & Non-Disclosure */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[10px] font-mono font-bold">EN</span>
                                            <span>Confidentiality & NDA Title</span>
                                        </label>
                                        <input
                                            name="contactNdaTitle"
                                            value={settings.contactNdaTitle || ""}
                                            onChange={handleChange}
                                            placeholder="Confidentiality & Non-Disclosure"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-mono font-bold">ID</span>
                                            <span>Judul Kerahasiaan & NDA (Indonesia)</span>
                                        </label>
                                        <input
                                            name="contactNdaTitle_id"
                                            value={settings.contactNdaTitle_id || ""}
                                            onChange={handleChange}
                                            placeholder="Kerahasiaan & Non-Disclosure"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[10px] font-mono font-bold">EN</span>
                                            <span>NDA Commitment Description</span>
                                        </label>
                                        <textarea
                                            name="contactNdaDesc"
                                            value={settings.contactNdaDesc || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Mutual NDA execution ready for enterprise codebases and proprietary specs."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-mono font-bold">ID</span>
                                            <span>Deskripsi Komitmen NDA (Indonesia)</span>
                                        </label>
                                        <textarea
                                            name="contactNdaDesc_id"
                                            value={settings.contactNdaDesc_id || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Siap menandatangani Mutual NDA untuk perlindungan codebase dan spesifikasi proprietary enterprise."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Core Advisory Focus */}
                            <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <Terminal className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">Core Advisory Focus</h2>
                                        <p className="text-xs text-muted-foreground">Tagline keahlian dan lencana domain teknologi di bawah kartu protokol</p>
                                    </div>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[10px] font-mono font-bold">EN</span>
                                            <span>Section Title</span>
                                        </label>
                                        <input
                                            name="contactAdvisoryTitle"
                                            value={settings.contactAdvisoryTitle || ""}
                                            onChange={handleChange}
                                            placeholder="Core Advisory Focus"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-mono font-bold">ID</span>
                                            <span>Judul Bagian (Indonesia)</span>
                                        </label>
                                        <input
                                            name="contactAdvisoryTitle_id"
                                            value={settings.contactAdvisoryTitle_id || ""}
                                            onChange={handleChange}
                                            placeholder="Fokus Konsultasi Utama"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[10px] font-mono font-bold">EN</span>
                                            <span>Core Advisory Skill Badges (Pisahkan dengan koma)</span>
                                        </label>
                                        <input
                                            name="contactAdvisorySkills"
                                            value={settings.contactAdvisorySkills || ""}
                                            onChange={handleChange}
                                            placeholder="Enterprise Networking, Full-Stack Next.js 16, BGP & OSPF Routing, Microservices & APIs, Cloud Architecture, Security & Hardening"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                        <p className="text-[11px] text-muted-foreground">Pisahkan setiap keahlian dengan tanda koma (,)</p>
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-mono font-bold">ID</span>
                                            <span>Lencana Keahlian (Indonesia - Opsional)</span>
                                        </label>
                                        <input
                                            name="contactAdvisorySkills_id"
                                            value={settings.contactAdvisorySkills_id || ""}
                                            onChange={handleChange}
                                            placeholder="Infrastruktur Jaringan Enterprise, Rekayasa Full-Stack Next.js 16, Routing BGP & OSPF, Microservices & APIs, Arsitektur Cloud, Keamanan & Hardening"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Card 3: Base of Operations */}
                            <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">Base of Operations</h2>
                                        <p className="text-xs text-muted-foreground">Lokasi pusat operasional dan deskripsi lingkup keterlibatan kerja</p>
                                    </div>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[10px] font-mono font-bold">EN</span>
                                            <span>Base Title</span>
                                        </label>
                                        <input
                                            name="contactBaseTitle"
                                            value={settings.contactBaseTitle || ""}
                                            onChange={handleChange}
                                            placeholder="Base of Operations"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-mono font-bold">ID</span>
                                            <span>Judul Pusat Operasional (Indonesia)</span>
                                        </label>
                                        <input
                                            name="contactBaseTitle_id"
                                            value={settings.contactBaseTitle_id || ""}
                                            onChange={handleChange}
                                            placeholder="Pusat Operasional"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-xs font-semibold text-foreground">Location Name (City, Country)</label>
                                        <input
                                            name="contactLocation"
                                            value={settings.contactLocation || ""}
                                            onChange={handleChange}
                                            placeholder="Jakarta, Indonesia"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[10px] font-mono font-bold">EN</span>
                                            <span>Engagement Scope Description</span>
                                        </label>
                                        <textarea
                                            name="contactBaseDesc"
                                            value={settings.contactBaseDesc || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Operating from Jakarta, Indonesia (UTC+7). Open to full-time remote contracts, hybrid technical leadership, and global on-site consultations."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-mono font-bold">ID</span>
                                            <span>Deskripsi Lingkup Keterlibatan (Indonesia)</span>
                                        </label>
                                        <textarea
                                            name="contactBaseDesc_id"
                                            value={settings.contactBaseDesc_id || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Beroperasi dari Jakarta, Indonesia (UTC+7). Terbuka untuk kontrak kerja remote penuh waktu, kepemimpinan teknis hybrid, dan konsultasi on-site global."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Card 4: Contact Hero & Direct Channels */}
                            <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <MessageSquare className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">Contact Page Hero & Consultation Channels</h2>
                                        <p className="text-xs text-muted-foreground">Kustomisasi judul hero, subjudul, dan tautan booking konsultasi pada halaman /contact</p>
                                    </div>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[10px] font-mono font-bold">EN</span>
                                            <span>Contact Hero Badge</span>
                                        </label>
                                        <input
                                            name="contactHeroBadge"
                                            value={settings.contactHeroBadge || ""}
                                            onChange={handleChange}
                                            placeholder="Direct Channel & Technical Advisory"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-mono font-bold">ID</span>
                                            <span>Badge Hero (Indonesia)</span>
                                        </label>
                                        <input
                                            name="contactHeroBadge_id"
                                            value={settings.contactHeroBadge_id || ""}
                                            onChange={handleChange}
                                            placeholder="Saluran Langsung & Konsultasi Teknis"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[10px] font-mono font-bold">EN</span>
                                            <span>Contact Page Headline Title</span>
                                        </label>
                                        <input
                                            name="contactHeroTitle"
                                            value={settings.contactHeroTitle || ""}
                                            onChange={handleChange}
                                            placeholder="Let's Build Something Exceptional Together"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-mono font-bold">ID</span>
                                            <span>Judul Headline (Indonesia)</span>
                                        </label>
                                        <input
                                            name="contactHeroTitle_id"
                                            value={settings.contactHeroTitle_id || ""}
                                            onChange={handleChange}
                                            placeholder="Mari Bangun Solusi Luar Biasa Bersama"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[10px] font-mono font-bold">EN</span>
                                            <span>Contact Page Subtitle / Invitation</span>
                                        </label>
                                        <textarea
                                            name="contactHeroSubtitle"
                                            value={settings.contactHeroSubtitle || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Subjudul ajakan kontak pada halaman /contact..."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-mono font-bold">ID</span>
                                            <span>Subjudul Ajakan Kontak (Indonesia)</span>
                                        </label>
                                        <textarea
                                            name="contactHeroSubtitle_id"
                                            value={settings.contactHeroSubtitle_id || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Deskripsi ajakan kontak dalam Bahasa Indonesia..."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-xs font-semibold text-foreground">Meeting / Cal.com Booking URL</label>
                                        <input
                                            name="contactMeetingUrl"
                                            value={settings.contactMeetingUrl || ""}
                                            onChange={handleChange}
                                            placeholder="https://cal.com/yourname (opsional)"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 8: FOOTER & LEGAL */}
                    {activeTab === "footer" && (
                        <div className="grid gap-6">
                            <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Layers className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">Footer & Copyright Settings</h2>
                                        <p className="text-xs text-muted-foreground">Teks keterangan bawah, hak cipta, dan sapaan newsletter footer</p>
                                    </div>
                                </div>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Footer Bio / Tagline</label>
                                        <textarea
                                            name="footerTagline"
                                            value={settings.footerTagline || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="e.g. Digital Architect specializing in resilient networks and scalable modern web applications."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Copyright Notice Suffix</label>
                                        <input
                                            name="copyrightText"
                                            value={settings.copyrightText || ""}
                                            onChange={handleChange}
                                            placeholder="e.g. All rights reserved."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Footer Newsletter Title</label>
                                        <input
                                            name="footerNewsletterTitle"
                                            value={settings.footerNewsletterTitle || ""}
                                            onChange={handleChange}
                                            placeholder="e.g. Subscribe to Newsletter"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Footer Newsletter Subtitle</label>
                                        <textarea
                                            name="footerNewsletterSubtitle"
                                            value={settings.footerNewsletterSubtitle || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="e.g. Get notified about new projects, tutorials, and engineering articles."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
