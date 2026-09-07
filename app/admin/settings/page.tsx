"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
    Wrench,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Bell,
    Send,
    Eye,
    EyeOff,
    CheckCircle2,
    HelpCircle,
    FileText,
    Upload,
    FolderOpen,
    Copy,
    Check,
    Trash2,
    X,
    Search,
    Link2,
    Database,
    Download,
    Server,
    Cpu,
    RefreshCw,
    AlertTriangle,
    Zap,
    Bot,
    Boxes,
    Key,
    ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { mutateSettingsCache } from "@/lib/useSettings";
import { UploadDropzone } from "@/lib/uploadthing";
import { AI_PROVIDERS, AIModelItem } from "@/lib/ai";

interface MediaFile {
    _id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    tags?: string[];
    createdAt: string;
}

type TabKey = "global" | "integrations" | "home" | "about" | "projects" | "certifications" | "blog" | "gallery_uses" | "contact" | "footer";

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<TabKey>("global");
    const [testingTelegram, setTestingTelegram] = useState(false);
    const [showBotToken, setShowBotToken] = useState(false);
    const [showTelegramGuide, setShowTelegramGuide] = useState(false);

    // Database & AI Services State
    const [showKeyMap, setShowKeyMap] = useState<Record<string, boolean>>({});
    const [showMongoUri, setShowMongoUri] = useState(false);
    const [testingAi, setTestingAi] = useState(false);
    const [testingProvider, setTestingProvider] = useState<string | null>(null);
    const [fetchedModels, setFetchedModels] = useState<Record<string, AIModelItem[]>>({});
    const [fetchingModels, setFetchingModels] = useState(false);
    const [customModelMode, setCustomModelMode] = useState(false);
    const [aiTestResult, setAiTestResult] = useState<{
        success: boolean;
        message: string;
        latencyMs?: number;
        model?: string;
        reply?: string;
    } | null>(null);
    const [providerTestResults, setProviderTestResults] = useState<Record<string, {
        success: boolean;
        message: string;
        latencyMs?: number;
        model?: string;
        reply?: string;
    }>>({});
    const [testingDb, setTestingDb] = useState(false);
    const [dbTestResult, setDbTestResult] = useState<{
        success: boolean;
        message: string;
        latencyMs?: number;
        host?: string;
        databaseName?: string;
        isCustomUri?: boolean;
        collectionsCount?: number;
    } | null>(null);

    // CV & Media Library State
    const [cvUploadMode, setCvUploadMode] = useState<"upload" | "media" | "url">("upload");
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [loadingMedia, setLoadingMedia] = useState(false);
    const [mediaSearch, setMediaSearch] = useState("");
    const [mediaFilter, setMediaFilter] = useState<"all" | "pdf">("pdf");
    const [copiedCvUrl, setCopiedCvUrl] = useState(false);

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
        telegramEnabled: "false",
        telegramBotToken: "",
        telegramChatId: "",
        telegramNotifyContact: "true",
        telegramNotifyGuestbook: "true",

        // Database & Universal AI Services
        aiProvider: "gemini",
        aiApiKey: "",
        aiBaseUrl: "",
        aiModel: "gemini-flash-lite-latest",
        aiEnabled: "true",
        aiCustomPrompt: "",
        assistantAiProvider: "",
        assistantAiModel: "",
        assistantAiCustomPrompt: "",
        geminiApiKey: "",
        geminiModel: "gemini-flash-lite-latest",
        geminiEnabled: "true",
        geminiCustomPrompt: "",
        openaiApiKey: "",
        groqApiKey: "",
        deepseekApiKey: "",
        openrouterApiKey: "",
        customApiKey: "",
        aiAutoFailover: "true",
        mongoDbUri: "",
        mongoDbName: "",

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
        projectsHeroBadge_id: "Portofolio Rekayasa",
        projectsHeroTitle: "Engineered Solutions & Projects",
        projectsHeroTitle_id: "Solusi & Proyek Terekayasa",
        projectsHeroSubtitle: "A showcase of production network architectures, full-stack web applications, and open-source systems.",
        projectsHeroSubtitle_id: "Koleksi arsitektur jaringan produksi, aplikasi web full-stack, dan sistem sumber terbuka.",
        projectsCtaTitle: "Have an ambitious project in mind?",
        projectsCtaTitle_id: "Punya proyek ambisius yang ingin dibangun?",
        projectsCtaSubtitle: "Whether you need high-availability network infrastructure or modern full-stack web engineering, let's connect.",
        projectsCtaSubtitle_id: "Baik Anda membutuhkan infrastruktur jaringan berkeandalan tinggi atau rekayasa web full-stack modern, mari terhubung.",

        // Certifications Page
        certificationsHeroBadge: "Verified Credentials & Accreditations",
        certificationsHeroTitle: "Industry Certifications & Accreditations",
        certificationsHeroSubtitle: "Validated technical competencies across network administration, software engineering, and cloud platforms.",
        certificationsTrustTitle: "Authenticity & Verification Guaranteed",
        certificationsTrustDesc: "All certifications listed here are backed by verifiable license numbers and official digital badge URLs.",

        // Blog Page
        blogHeroBadge: "Technical Publications & Notes",
        blogHeroBadge_id: "Publikasi Teknis & Catatan",
        blogHeroTitle: "Engineering Insights & Deep Dives",
        blogHeroTitle_id: "Wawasan Rekayasa & Ulasan Mendalam",
        blogHeroSubtitle: "Architectural post-mortems, hands-on tutorials, and engineering principles.",
        blogHeroSubtitle_id: "Cetak biru arsitektur, tutorial praktis, dan prinsip-prinsip rekayasa.",
        blogNewsletterTitle: "Stay Updated with Technical Insights",
        blogNewsletterTitle_id: "Tetap Terinformasi dengan Wawasan Teknis",
        blogNewsletterDesc: "Subscribe to receive notifications when new deep dives and post-mortems are published.",
        blogNewsletterDesc_id: "Berlangganan untuk menerima pemberitahuan saat ulasan mendalam baru diterbitkan.",

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

    const fetchMediaLibrary = useCallback(async () => {
        setLoadingMedia(true);
        try {
            const response = await fetch("/api/media?limit=100");
            const data = await response.json();
            if (data.success && Array.isArray(data.data)) {
                setMediaFiles(data.data);
            }
        } catch {
            console.error("Failed to load media library");
        } finally {
            setLoadingMedia(false);
        }
    }, []);

    useEffect(() => {
        fetchMediaLibrary();
    }, [fetchMediaLibrary]);

    const handleOpenMediaModal = () => {
        setIsMediaModalOpen(true);
        fetchMediaLibrary();
    };

    const handleSelectMediaCv = (url: string) => {
        setSettings(prev => ({ ...prev, resumeUrl: url }));
        setIsMediaModalOpen(false);
        toast.success("CV berhasil dipilih dari Media Library!");
    };

    const handleCopyCvUrl = (url: string) => {
        if (!url) return;
        navigator.clipboard.writeText(url);
        setCopiedCvUrl(true);
        toast.success("Tautan CV disalin ke clipboard!");
        setTimeout(() => setCopiedCvUrl(false), 2000);
    };

    const formatCvFileSize = (bytes: number) => {
        if (!bytes || bytes === 0) return "0 B";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    };

    const filteredCvMedia = useMemo(() => {
        return mediaFiles.filter(file => {
            const matchesSearch = file.fileName.toLowerCase().includes(mediaSearch.toLowerCase());
            const isPdf = file.fileType === "pdf" || file.fileUrl?.toLowerCase().endsWith(".pdf");
            const matchesType = mediaFilter === "all" ? true : isPdf;
            return matchesSearch && matchesType;
        });
    }, [mediaFiles, mediaSearch, mediaFilter]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSettings(prev => {
            const next = { ...prev, [name]: value };
            if ((name === "telegramBotToken" || name === "telegramChatId") && value.trim()) {
                if (prev.telegramEnabled === "false") {
                    next.telegramEnabled = "true";
                }
            }
            return next;
        });
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

    const handleTestTelegram = async () => {
        const token = settings.telegramBotToken?.trim();
        const rawChatId = settings.telegramChatId?.trim();
        const chatId = rawChatId?.replace(/["'\s]/g, "");

        if (!token || !chatId) {
            toast.error("Harap isi Telegram Bot Token dan Chat ID terlebih dahulu!");
            return;
        }

        if (chatId.startsWith("@")) {
            toast.error("Chat ID tidak boleh diawali @. Gunakan angka ID (misal: 123456789) dari @userinfobot.", { duration: 6000 });
            return;
        }

        setTestingTelegram(true);
        try {
            const res = await fetch("/api/telegram/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    botToken: token,
                    chatId: chatId
                })
            });

            const data = await res.json();
            if (data.success) {
                setSettings(prev => ({ ...prev, telegramEnabled: "true" }));
                toast.success(data.message || "Pesan uji coba berhasil dikirim ke Telegram!");
            } else {
                toast.error(data.error || "Gagal mengirim pesan uji coba ke Telegram", { duration: 7000 });
            }
        } catch (error) {
            console.error("Failed to test Telegram", error);
            toast.error("Terjadi kesalahan jaringan saat menguji Telegram");
        } finally {
            setTestingTelegram(false);
        }
    };

    const handleSelectAIProvider = (providerId: string) => {
        const preset = AI_PROVIDERS[providerId];
        if (!preset) return;
        setCustomModelMode(false);
        setSettings(prev => ({
            ...prev,
            aiProvider: providerId,
            aiModel: preset.defaultModel,
            aiBaseUrl: providerId === "custom" || providerId === "ollama" ? (prev.aiBaseUrl || preset.defaultBaseUrl) : "",
            ...(providerId === "gemini" ? { geminiModel: preset.defaultModel } : {})
        }));
        if (!fetchedModels[providerId]) {
            handleFetchModels({ provider: providerId, silent: true });
        }
    };

    const handleFetchModels = useCallback(async (options?: { provider?: string; apiKey?: string; baseUrl?: string; silent?: boolean }) => {
        const provider = options?.provider || settings.aiProvider || "gemini";
        const preset = AI_PROVIDERS[provider] || AI_PROVIDERS.gemini;
        let apiKey = options?.apiKey;
        if (apiKey === undefined) {
            if (provider === "gemini") apiKey = settings.geminiApiKey?.trim() || settings.aiApiKey?.trim() || undefined;
            else if (provider === "openai") apiKey = settings.openaiApiKey?.trim() || settings.aiApiKey?.trim() || undefined;
            else if (provider === "groq") apiKey = settings.groqApiKey?.trim() || settings.aiApiKey?.trim() || undefined;
            else if (provider === "deepseek") apiKey = settings.deepseekApiKey?.trim() || settings.aiApiKey?.trim() || undefined;
            else if (provider === "openrouter") apiKey = settings.openrouterApiKey?.trim() || settings.aiApiKey?.trim() || undefined;
            else if (provider === "custom") apiKey = settings.customApiKey?.trim() || settings.aiApiKey?.trim() || undefined;
            else apiKey = settings.aiApiKey?.trim() || undefined;
        }

        const baseUrl = options?.baseUrl !== undefined
            ? options.baseUrl
            : (settings.aiBaseUrl?.trim() || undefined);
        const silent = options?.silent ?? false;

        setFetchingModels(true);
        try {
            const res = await fetch("/api/admin/ai/models", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider,
                    apiKey,
                    baseUrl
                })
            });

            const data = await res.json();
            if (data.success && Array.isArray(data.models) && data.models.length > 0) {
                setFetchedModels(prev => ({
                    ...prev,
                    [provider]: data.models
                }));

                if (!silent) {
                    if (data.source === "api") {
                        toast.success(data.message || `Berhasil memuat ${data.models.length} model langsung dari API ${preset.name}!`);
                    } else {
                        toast(data.message || `Memuat ${data.models.length} model dari katalog ${preset.name}.`, { icon: "ℹ️" });
                    }
                }
            } else if (!silent) {
                toast.error(data.error || `Gagal mengambil daftar model dari API ${preset.name}`);
            }
        } catch (err) {
            console.error("Failed to fetch AI models:", err);
            if (!silent) toast.error("Terjadi kesalahan koneksi saat memuat model AI");
        } finally {
            setFetchingModels(false);
        }
    }, [settings.aiProvider, settings.aiApiKey, settings.geminiApiKey, settings.openaiApiKey, settings.groqApiKey, settings.deepseekApiKey, settings.openrouterApiKey, settings.customApiKey, settings.aiBaseUrl]);

    // Auto-fetch models from API when opening Integrations tab if not yet loaded
    useEffect(() => {
        if (!loading && activeTab === "integrations") {
            const provider = settings.aiProvider || "gemini";
            if (!fetchedModels[provider] && !fetchingModels) {
                handleFetchModels({ provider, silent: true });
            }
        }
    }, [activeTab, loading, settings.aiProvider, fetchedModels, fetchingModels, handleFetchModels]);

    const handleTestAi = async (targetProvider?: string | React.MouseEvent) => {
        const provider = (typeof targetProvider === "string" && targetProvider.trim()) ? targetProvider.trim() : (settings.aiProvider || "gemini");
        const isTargeted = typeof targetProvider === "string" && Boolean(targetProvider.trim());
        if (isTargeted) {
            setTestingProvider(provider);
        } else {
            setTestingAi(true);
            setAiTestResult(null);
        }

        try {
            let apiKey: string | undefined = undefined;
            if (provider === "gemini") apiKey = settings.geminiApiKey?.trim() || settings.aiApiKey?.trim() || undefined;
            else if (provider === "openai") apiKey = settings.openaiApiKey?.trim() || settings.aiApiKey?.trim() || undefined;
            else if (provider === "groq") apiKey = settings.groqApiKey?.trim() || settings.aiApiKey?.trim() || undefined;
            else if (provider === "deepseek") apiKey = settings.deepseekApiKey?.trim() || settings.aiApiKey?.trim() || undefined;
            else if (provider === "openrouter") apiKey = settings.openrouterApiKey?.trim() || settings.aiApiKey?.trim() || undefined;
            else if (provider === "custom") apiKey = settings.customApiKey?.trim() || settings.aiApiKey?.trim() || undefined;
            else apiKey = settings.aiApiKey?.trim() || undefined;

            const baseUrl = (provider === settings.aiProvider && settings.aiBaseUrl?.trim()) ? settings.aiBaseUrl.trim() : undefined;
            const model = (provider === settings.aiProvider ? settings.aiModel?.trim() : undefined) || (provider === "gemini" ? settings.geminiModel?.trim() : undefined);

            const res = await fetch("/api/admin/ai/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider,
                    apiKey,
                    baseUrl,
                    model
                })
            });
            const data = await res.json();
            const resultObj = {
                success: Boolean(data.success),
                message: data.message || data.error || (data.success ? "Koneksi berhasil!" : "Koneksi gagal."),
                latencyMs: data.latencyMs,
                model: data.model,
                reply: data.reply
            };

            setProviderTestResults(prev => ({
                ...prev,
                [provider]: resultObj
            }));

            if (!isTargeted) {
                setAiTestResult(resultObj);
            }

            if (data.success) {
                toast.success(`${data.providerName || provider} (${data.model}) aktif! Latency: ${data.latencyMs}ms`);
            } else {
                toast.error(data.error || `Uji coba ${provider} gagal`, { duration: 6000 });
            }
        } catch (error) {
            console.error("AI test failed", error);
            const errObj = {
                success: false,
                message: "Terjadi kesalahan jaringan saat menguji koneksi AI."
            };
            setProviderTestResults(prev => ({
                ...prev,
                [provider]: errObj
            }));
            if (!isTargeted) {
                setAiTestResult(errObj);
            }
            toast.error("Kesalahan jaringan saat menguji AI");
        } finally {
            if (isTargeted) {
                setTestingProvider(null);
            } else {
                setTestingAi(false);
            }
        }
    };

    const handleTestDatabase = async (useCustomUri: boolean = false) => {
        setTestingDb(true);
        setDbTestResult(null);
        try {
            const customUri = useCustomUri ? settings.mongoDbUri?.trim() : undefined;
            if (useCustomUri && !customUri) {
                toast.error("Harap masukkan URI MongoDB kustom terlebih dahulu untuk diuji.");
                setTestingDb(false);
                return;
            }

            const res = await fetch("/api/admin/database/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uri: customUri })
            });
            const data = await res.json();
            if (data.success) {
                setDbTestResult({
                    success: true,
                    message: data.message || "Koneksi database MongoDB sukses!",
                    latencyMs: data.latencyMs,
                    host: data.host,
                    databaseName: data.databaseName,
                    isCustomUri: data.isCustomUri,
                    collectionsCount: data.collectionsCount
                });
                toast.success(`Database '${data.databaseName}' terhubung! Latency: ${data.latencyMs}ms`);
            } else {
                setDbTestResult({
                    success: false,
                    message: data.error || "Gagal menghubungi database MongoDB.",
                    isCustomUri: data.isCustomUri
                });
                toast.error(data.error || "Koneksi database gagal", { duration: 6000 });
            }
        } catch (error) {
            console.error("Database test failed", error);
            setDbTestResult({
                success: false,
                message: "Terjadi kesalahan jaringan saat menguji database."
            });
            toast.error("Kesalahan jaringan saat menguji database");
        } finally {
            setTestingDb(false);
        }
    };

    const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
        { key: "global", label: "Global & Branding", icon: Globe },
        { key: "integrations", label: "Database & AI Services", icon: Server },
        { key: "home", label: "Home Page", icon: Home },
        { key: "about", label: "About Page", icon: BookOpen },
        { key: "projects", label: "Projects Page", icon: Briefcase },
        { key: "certifications", label: "Certifications Page", icon: Award },
        { key: "blog", label: "Blog Page", icon: FileCode },
        { key: "gallery_uses", label: "Gallery & Uses", icon: Camera },
        { key: "contact", label: "Contact Page", icon: MessageSquare },
        { key: "footer", label: "Footer & Legal", icon: Layers }
    ];

    const tabsRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkTabsScroll = useCallback(() => {
        if (tabsRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
            setCanScrollLeft(scrollLeft > 4);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
        }
    }, []);

    useEffect(() => {
        checkTabsScroll();
        const t1 = setTimeout(checkTabsScroll, 100);
        const t2 = setTimeout(checkTabsScroll, 400);
        const handleResize = () => checkTabsScroll();
        window.addEventListener("resize", handleResize);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            window.removeEventListener("resize", handleResize);
        };
    }, [checkTabsScroll, activeTab]);

    const scrollTabs = (direction: "left" | "right") => {
        if (tabsRef.current) {
            const scrollAmount = direction === "left" ? -240 : 240;
            tabsRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
            setTimeout(checkTabsScroll, 300);
        }
    };

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
                <div 
                    onWheel={(e) => {
                        if (e.deltaY !== 0) {
                            e.currentTarget.scrollLeft += e.deltaY;
                        }
                    }}
                    className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-xs"
                >
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
                        { label: "Maintenance", href: "/maintenance?preview=true" },
                    ].map((p) => (
                        <a
                            key={p.href}
                            href={p.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card border border-border text-foreground/80 hover:text-primary hover:border-primary/50 transition-colors shrink-0 shadow-2xs"
                        >
                            <span>{p.label}</span>
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    ))}
                </div>

                {/* Tabs Navigation with Dedicated Arrow Controls */}
                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-card/60 backdrop-blur-md border border-border/80 shadow-xs">
                    {/* Left Arrow Button */}
                    <button
                        type="button"
                        onClick={() => scrollTabs("left")}
                        disabled={!canScrollLeft}
                        className={`shrink-0 h-9 w-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                            canScrollLeft
                                ? "bg-background hover:bg-primary hover:text-white hover:border-primary border-border text-foreground shadow-xs active:scale-95"
                                : "bg-muted/30 border-border/40 text-muted-foreground/30 cursor-not-allowed opacity-40"
                        }`}
                        title="Geser tab ke kiri"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    {/* Scrollable Tabs Track */}
                    <div
                        ref={tabsRef}
                        onScroll={checkTabsScroll}
                        onWheel={(e) => {
                            if (e.deltaY !== 0 && tabsRef.current) {
                                tabsRef.current.scrollLeft += e.deltaY;
                                checkTabsScroll();
                            }
                        }}
                        className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth py-0.5 px-1"
                    >
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const active = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                                        active
                                            ? "bg-primary text-white shadow-md shadow-primary/25 scale-[1.02]"
                                            : "bg-background/80 border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted"
                                    }`}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Arrow Button */}
                    <button
                        type="button"
                        onClick={() => scrollTabs("right")}
                        disabled={!canScrollRight}
                        className={`shrink-0 h-9 w-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                            canScrollRight
                                ? "bg-background hover:bg-primary hover:text-white hover:border-primary border-primary/40 text-primary shadow-xs active:scale-95"
                                : "bg-muted/30 border-border/40 text-muted-foreground/30 cursor-not-allowed opacity-40"
                        }`}
                        title="Geser tab ke kanan"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
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
                                            href="/maintenance?preview=true"
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

                            {/* Telegram Bot Notification Configuration Card */}
                            <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/60">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-sky-500/10 rounded-lg text-sky-500">
                                            <Send className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-lg font-bold">Telegram Instant Notifications</h2>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    settings.telegramEnabled === "true"
                                                        ? "bg-sky-500 text-white shadow-xs"
                                                        : "bg-muted text-muted-foreground border border-border/60"
                                                }`}>
                                                    {settings.telegramEnabled === "true" ? "AKTIF / ENABLED" : "NONAKTIF / DISABLED"}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Dapatkan notifikasi instan di Telegram saat ada pesan formulir kontak atau tanda tangan buku tamu baru
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowTelegramGuide(prev => !prev)}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors border border-border cursor-pointer"
                                        >
                                            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span>{showTelegramGuide ? "Tutup Panduan" : "Panduan Setup (3 Langkah)"}</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setSettings(prev => ({
                                                ...prev,
                                                telegramEnabled: prev.telegramEnabled === "true" ? "false" : "true"
                                            }))}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                                                settings.telegramEnabled === "true"
                                                    ? "bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/25"
                                                    : "bg-muted hover:bg-muted/80 text-foreground border border-border"
                                            }`}
                                        >
                                            <Bell className="h-3.5 w-3.5" />
                                            <span>{settings.telegramEnabled === "true" ? "Notifikasi: AKTIF" : "Notifikasi: NONAKTIF"}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Collapsible Setup Guide */}
                                {showTelegramGuide && (
                                    <div className="mb-6 p-4 rounded-xl bg-sky-500/10 border border-sky-500/25 text-foreground space-y-2 text-xs">
                                        <h4 className="font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                                            <Sparkles className="h-4 w-4" /> Cara Menghubungkan Bot Telegram ke Website:
                                        </h4>
                                        <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                                            <li>
                                                <strong className="text-foreground">Buat Bot di Telegram:</strong> Buka aplikasi Telegram, cari <code className="px-1.5 py-0.5 rounded bg-background font-mono text-sky-500">@BotFather</code>, kirim <code className="px-1.5 py-0.5 rounded bg-background font-mono">/newbot</code>, lalu ikuti instruksinya hingga mendapatkan <strong>HTTP API Token</strong> (salin ke kolom <em>Bot Token</em> di bawah).
                                            </li>
                                            <li>
                                                <strong className="text-foreground">Mulai Chat dengan Bot:</strong> Klik tautan bot yang baru dibuat (misal <code>t.me/NamaBotAnda_bot</code>) lalu tekan tombol <strong>Start</strong> (<code className="px-1.5 py-0.5 rounded bg-background font-mono">/start</code>) agar bot memiliki izin mengirim pesan ke Anda.
                                            </li>
                                            <li>
                                                <strong className="text-foreground">Dapatkan Chat ID Anda:</strong> Cari akun <code className="px-1.5 py-0.5 rounded bg-background font-mono text-sky-500">@userinfobot</code> di Telegram dan tekan Start. Bot tersebut akan membalas dengan nomor <strong>Id</strong> Anda (misal: <code>123456789</code>). Salin angka tersebut ke kolom <em>Chat ID</em> di bawah. (Jika ingin kirim ke grup, undang bot ke grup tersebut lalu gunakan Chat ID grup yang berawalan minus, mis. <code>-100xxxxxxx</code>).
                                            </li>
                                        </ol>
                                    </div>
                                )}

                                {/* Status Inactive Warning Banner if user has entered credentials but toggle is OFF */}
                                {settings.telegramEnabled !== "true" && (settings.telegramBotToken?.trim() || settings.telegramChatId?.trim()) && (
                                    <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <span>⚠️ Token & Chat ID terisi tetapi status notifikasi masih <strong>NONAKTIF</strong>. Klik tombol di samping untuk mengaktifkan agar notifikasi otomatis terkirim.</span>
                                        <button
                                            type="button"
                                            onClick={() => setSettings(prev => ({ ...prev, telegramEnabled: "true" }))}
                                            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs"
                                        >
                                            Aktifkan Sekarang
                                        </button>
                                    </div>
                                )}

                                {/* Channel Events Toggles */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 p-3.5 rounded-xl bg-background/60 border border-border/70">
                                    <label className="flex items-center gap-3 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            name="telegramNotifyContact"
                                            checked={settings.telegramNotifyContact !== "false"}
                                            onChange={(e) => setSettings(prev => ({
                                                ...prev,
                                                telegramNotifyContact: e.target.checked ? "true" : "false"
                                            }))}
                                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary"
                                        />
                                        <div>
                                            <p className="text-xs font-bold text-foreground">Notifikasi Formulir Kontak (/contact)</p>
                                            <p className="text-[11px] text-muted-foreground">Kirim notifikasi setiap pengunjung mengirim pesan kontak</p>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            name="telegramNotifyGuestbook"
                                            checked={settings.telegramNotifyGuestbook !== "false"}
                                            onChange={(e) => setSettings(prev => ({
                                                ...prev,
                                                telegramNotifyGuestbook: e.target.checked ? "true" : "false"
                                            }))}
                                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary"
                                        />
                                        <div>
                                            <p className="text-xs font-bold text-foreground">Notifikasi Buku Tamu (/guestbook)</p>
                                            <p className="text-[11px] text-muted-foreground">Kirim notifikasi setiap tanda tangan buku tamu baru masuk untuk dimoderasi</p>
                                        </div>
                                    </label>
                                </div>

                                {/* Form Inputs */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-semibold text-foreground">Telegram Bot Token</label>
                                            <button
                                                type="button"
                                                onClick={() => setShowBotToken(prev => !prev)}
                                                className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                                            >
                                                {showBotToken ? (
                                                    <>
                                                        <EyeOff className="h-3 w-3" />
                                                        <span>Sembunyikan</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye className="h-3 w-3" />
                                                        <span>Lihat Token</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type={showBotToken ? "text" : "password"}
                                                name="telegramBotToken"
                                                value={settings.telegramBotToken || ""}
                                                onChange={handleChange}
                                                placeholder="Contoh: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                                                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
                                            />
                                        </div>
                                        <p className="text-[11px] text-muted-foreground">
                                            Token rahasia dari @BotFather. Bisa juga dikonfigurasi via <code>TELEGRAM_BOT_TOKEN</code> di <code>.env.local</code>.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Target Chat ID</label>
                                        <input
                                            type="text"
                                            name="telegramChatId"
                                            value={settings.telegramChatId || ""}
                                            onChange={handleChange}
                                            placeholder="Contoh: 123456789 atau -100123456789"
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
                                        />
                                        {settings.telegramChatId?.trim().startsWith("@") ? (
                                            <p className="text-[11px] text-rose-500 font-semibold">
                                                ⚠️ Chat ID tidak boleh diawali @. Untuk akun pribadi Telegram, gunakan angka ID numerik (misal: 123456789) dari @userinfobot.
                                            </p>
                                        ) : (
                                            <p className="text-[11px] text-muted-foreground">
                                                Chat ID akun Anda (angka dari @userinfobot) atau ID grup Telegram target notifikasi.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Test Action Button Footer */}
                                <div className="mt-6 pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <CheckCircle2 className="h-4 w-4 text-sky-500 shrink-0" />
                                        <span>Pesan notifikasi dilengkapi tombol aksi cepat untuk membalas email atau moderasi buku tamu.</span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleTestTelegram}
                                        disabled={testingTelegram || !settings.telegramBotToken?.trim() || !settings.telegramChatId?.trim()}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white transition-all shadow-xs disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                                    >
                                        {testingTelegram ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <Send className="h-3.5 w-3.5" />
                                        )}
                                        <span>{testingTelegram ? "Mengirim Tes..." : "Kirim Pesan Uji Coba ke Telegram"}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Database Disaster Recovery & 1-Click Backup Card */}
                            <div className="bg-card/40 backdrop-blur-md border border-border/80 rounded-2xl p-6 shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/20">
                                            <Database className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-lg font-bold text-foreground">Database Disaster Recovery</h2>
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                                    1-Click JSON
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Cadangkan 15 koleksi MongoDB ke file JSON terstruktur atau pulihkan kapan saja tanpa kehilangan relasi.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => window.dispatchEvent(new CustomEvent("open-backup-modal"))}
                                            className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                                        >
                                            <Download className="h-3.5 w-3.5" />
                                            <span>Buka Alat Backup & Restore</span>
                                        </button>
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
                                    {/* Resume / CV Section */}
                                    <div className="space-y-3 sm:col-span-2 pt-4 border-t border-border/60">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                            <div>
                                                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                    <FileText className="h-4 w-4 text-primary" />
                                                    <span>Resume / Curriculum Vitae (CV)</span>
                                                </label>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                                    Upload langsung file PDF, pilih dari Media Library, atau gunakan URL eksternal (Google Drive / CDN).
                                                </p>
                                            </div>

                                            {/* Mode Switcher Buttons */}
                                            <div className="inline-flex p-1 rounded-xl bg-muted/70 border border-border/70 text-xs self-start sm:self-auto shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => setCvUploadMode("upload")}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                                                        cvUploadMode === "upload"
                                                            ? "bg-background text-primary shadow-xs font-semibold"
                                                            : "text-muted-foreground hover:text-foreground"
                                                    }`}
                                                >
                                                    <Upload className="h-3.5 w-3.5" />
                                                    <span>Upload PDF</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setCvUploadMode("media");
                                                        handleOpenMediaModal();
                                                    }}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                                                        cvUploadMode === "media"
                                                            ? "bg-background text-primary shadow-xs font-semibold"
                                                            : "text-muted-foreground hover:text-foreground"
                                                    }`}
                                                >
                                                    <FolderOpen className="h-3.5 w-3.5" />
                                                    <span>Pilih Media</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setCvUploadMode("url")}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                                                        cvUploadMode === "url"
                                                            ? "bg-background text-primary shadow-xs font-semibold"
                                                            : "text-muted-foreground hover:text-foreground"
                                                    }`}
                                                >
                                                    <Link2 className="h-3.5 w-3.5" />
                                                    <span>URL Manual</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Current Active CV Status Card */}
                                        {settings.resumeUrl ? (
                                            <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-foreground truncate">
                                                                {decodeURIComponent(settings.resumeUrl.split("/").pop() || "Resume-CV.pdf")}
                                                            </span>
                                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/20 text-primary uppercase shrink-0">
                                                                Aktif
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-muted-foreground font-mono truncate mt-0.5">
                                                            {settings.resumeUrl}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                                                    <a
                                                        href={settings.resumeUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background border border-border text-xs font-semibold hover:bg-muted text-foreground transition-colors"
                                                    >
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                        <span>Lihat CV</span>
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopyCvUrl(settings.resumeUrl)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background border border-border text-xs font-semibold hover:bg-muted text-foreground transition-colors cursor-pointer"
                                                        title="Salin Tautan"
                                                    >
                                                        {copiedCvUrl ? (
                                                            <>
                                                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                                                                <span className="text-emerald-500">Tersalin</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="h-3.5 w-3.5" />
                                                                <span>Salin</span>
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSettings(prev => ({ ...prev, resumeUrl: "" }));
                                                            toast.success("CV dinonaktifkan (URL dikosongkan)");
                                                        }}
                                                        className="p-2 rounded-xl text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                                        title="Hapus / Lepas CV"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2.5">
                                                <HelpCircle className="h-4 w-4 shrink-0 text-amber-500" />
                                                <span>Belum ada file CV yang aktif. Pengunjung tidak dapat mengunduh CV sampai Anda mengupload file atau memasukkan URL.</span>
                                            </div>
                                        )}

                                        {/* Pane 1: Upload PDF */}
                                        {cvUploadMode === "upload" && (
                                            <div className="space-y-2 pt-1">
                                                <UploadDropzone
                                                    endpoint="resumeUploader"
                                                    onClientUploadComplete={async (res) => {
                                                        if (res && res[0]) {
                                                            const uploaded = res[0];
                                                            const uploadedUrl = uploaded.url;
                                                            const originalName = uploaded.serverData?.fileName || uploaded.name || "Resume-CV.pdf";
                                                            const fileSize = uploaded.serverData?.fileSize || uploaded.size || 1024 * 500;

                                                            setSettings(prev => ({ ...prev, resumeUrl: uploadedUrl }));

                                                            // Register automatically to Media Library
                                                            try {
                                                                await fetch("/api/media", {
                                                                    method: "POST",
                                                                    headers: { "Content-Type": "application/json" },
                                                                    body: JSON.stringify({
                                                                        fileName: originalName,
                                                                        fileUrl: uploadedUrl,
                                                                        fileSize,
                                                                        fileType: "pdf",
                                                                        tags: ["cv", "resume", "uploadthing"]
                                                                    })
                                                                });
                                                                fetchMediaLibrary();
                                                            } catch (err) {
                                                                console.error("Error registering CV to media:", err);
                                                            }

                                                            toast.success("File CV berhasil di-upload dan tersimpan di Media Library!");
                                                        }
                                                    }}
                                                    onUploadError={(error: Error) => {
                                                        toast.error(`Gagal upload CV: ${error.message}`);
                                                    }}
                                                    appearance={{
                                                        container: "border-2 border-dashed border-border/80 hover:border-primary/50 bg-background/50 rounded-2xl p-6 transition-colors",
                                                        label: "text-xs font-semibold text-primary hover:underline",
                                                        button: "bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-primary/20 cursor-pointer",
                                                        allowedContent: "text-[11px] text-muted-foreground"
                                                    }}
                                                />
                                                <p className="text-[11px] text-muted-foreground text-center">
                                                    Ukuran maksimal file 16MB dalam format PDF. File akan otomatis tersimpan di CDN & Media Library.
                                                </p>
                                            </div>
                                        )}

                                        {/* Pane 2: Media Library */}
                                        {cvUploadMode === "media" && (
                                            <div className="p-4 rounded-2xl border border-border/80 bg-background/50 space-y-3">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-xs font-bold text-foreground">Media Library Dokumen</p>
                                                        <p className="text-[11px] text-muted-foreground">Pilih file PDF atau dokumen yang sudah tersimpan di Media Library.</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleOpenMediaModal}
                                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
                                                    >
                                                        <FolderOpen className="h-4 w-4" />
                                                        <span>Buka Pustaka Media</span>
                                                    </button>
                                                </div>

                                                {/* Quick recent PDF files */}
                                                {mediaFiles.filter(f => f.fileType === "pdf" || f.fileUrl?.toLowerCase().endsWith(".pdf")).length > 0 ? (
                                                    <div className="space-y-2 pt-2 border-t border-border/50">
                                                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">File PDF Tersedia:</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {mediaFiles
                                                                .filter(f => f.fileType === "pdf" || f.fileUrl?.toLowerCase().endsWith(".pdf"))
                                                                .slice(0, 4)
                                                                .map((file) => {
                                                                    const isSelected = settings.resumeUrl === file.fileUrl;
                                                                    return (
                                                                        <div
                                                                            key={file._id}
                                                                            onClick={() => handleSelectMediaCv(file.fileUrl)}
                                                                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 text-xs ${
                                                                                isSelected
                                                                                    ? "border-primary bg-primary/10 text-primary font-semibold shadow-2xs"
                                                                                    : "border-border/60 bg-card hover:border-primary/50 text-foreground"
                                                                            }`}
                                                                        >
                                                                            <div className="flex items-center gap-2 min-w-0">
                                                                                <FileText className="h-4 w-4 shrink-0 text-primary" />
                                                                                <div className="min-w-0">
                                                                                    <p className="truncate font-medium">{file.fileName}</p>
                                                                                    <p className="text-[10px] text-muted-foreground">{formatCvFileSize(file.fileSize)}</p>
                                                                                </div>
                                                                            </div>
                                                                            <span className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold shrink-0 ${
                                                                                isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary"
                                                                            }`}>
                                                                                {isSelected ? "Aktif" : "Pilih"}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4 text-xs text-muted-foreground">
                                                        Belum ada file PDF di Media Library. Silakan gunakan tab &quot;Upload PDF&quot; untuk mengunggah file CV pertama Anda.
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Pane 3: Manual URL */}
                                        {cvUploadMode === "url" && (
                                            <div className="space-y-2 pt-1">
                                                <input
                                                    name="resumeUrl"
                                                    value={settings.resumeUrl || ""}
                                                    onChange={handleChange}
                                                    placeholder="https://drive.google.com/file/d/... atau https://cdn.../cv.pdf"
                                                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-xs sm:text-sm font-mono"
                                                />
                                                <p className="text-[11px] text-muted-foreground">
                                                    Gunakan URL manual jika Anda menyimpan CV di Google Drive, Dropbox, atau hosting pihak ketiga. Pastikan hak akses publik (&quot;Anyone with the link can view&quot;) sudah aktif.
                                                </p>
                                            </div>
                                        )}
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

                    {/* TAB: CLOUD & INTEGRATIONS (DATABASE & AI) */}
                    {activeTab === "integrations" && (
                        <div className="grid gap-6">
                            {/* Header Hub Banner */}
                            <div className="bg-gradient-to-r from-primary/10 via-card to-card border border-primary/20 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-primary/10 text-primary rounded-2xl border border-primary/20 shrink-0">
                                            <Server className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2.5 flex-wrap">
                                                <h2 className="text-xl font-bold tracking-tight text-foreground">
                                                    Database & AI Services Integration Hub
                                                </h2>
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                                                    Infrastructure
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
                                                Kelola koneksi basis data MongoDB cluster dan API Universal AI Engine (Gemini, OpenAI, Groq, DeepSeek, Ollama, OpenRouter) secara langsung dari antarmuka Admin dengan pengujian latensi real-time.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => handleTestDatabase(false)}
                                            disabled={testingDb}
                                            className="px-3 py-2 rounded-xl text-xs font-semibold border border-border bg-card hover:bg-muted text-foreground transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                            title="Uji koneksi database server aktif"
                                        >
                                            {testingDb ? <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> : <Database className="h-3.5 w-3.5 text-primary" />}
                                            <span>Ping Database</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleTestAi()}
                                            disabled={testingAi}
                                            className="px-3 py-2 rounded-xl text-xs font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                            title={`Uji koneksi ${AI_PROVIDERS[settings.aiProvider || "gemini"]?.name || "AI"}`}
                                        >
                                            {testingAi ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                                            <span>Ping {AI_PROVIDERS[settings.aiProvider || "gemini"]?.name.split(" ")[0] || "AI"}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Section 1: Universal AI Engine Configuration */}
                            <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/20">
                                            <Bot className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-bold text-foreground">Universal AI Engine (Any Provider)</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    (settings.aiEnabled !== undefined ? settings.aiEnabled !== "false" : settings.geminiEnabled !== "false")
                                                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                                        : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                                }`}>
                                                    {(settings.aiEnabled !== undefined ? settings.aiEnabled !== "false" : settings.geminiEnabled !== "false") ? "Aktif" : "Nonaktif"}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Gunakan Google Gemini, OpenAI, Groq, DeepSeek, OpenRouter, Ollama (Local), atau Provider Kustom apapun
                                            </p>
                                        </div>
                                    </div>

                                    {/* Enable / Disable Switch */}
                                    <div className="flex items-center gap-3 bg-muted/40 p-1.5 rounded-2xl border border-border/60 self-start sm:self-auto">
                                        <button
                                            type="button"
                                            onClick={() => setSettings(prev => ({ ...prev, aiEnabled: "true", geminiEnabled: "true" }))}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                (settings.aiEnabled !== undefined ? settings.aiEnabled !== "false" : settings.geminiEnabled !== "false")
                                                    ? "bg-primary text-white shadow-xs"
                                                    : "text-muted-foreground hover:text-foreground"
                                            }`}
                                        >
                                            Aktifkan AI
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSettings(prev => ({ ...prev, aiEnabled: "false", geminiEnabled: "false" }))}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                (settings.aiEnabled === "false" || settings.geminiEnabled === "false")
                                                    ? "bg-rose-500 text-white shadow-xs"
                                                    : "text-muted-foreground hover:text-foreground"
                                            }`}
                                        >
                                            Nonaktifkan
                                        </button>
                                    </div>
                                </div>

                                <div className="grid gap-6">
                                    {/* Provider Selection Grid */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                                            <span className="flex items-center gap-1.5">
                                                <Boxes className="h-4 w-4 text-primary" />
                                                <span>Pilih AI Provider:</span>
                                            </span>
                                            <span className="text-[11px] text-muted-foreground">
                                                Aktif: <strong className="text-foreground">{AI_PROVIDERS[settings.aiProvider || "gemini"]?.name || settings.aiProvider || "Google Gemini"}</strong>
                                            </span>
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                                            {Object.values(AI_PROVIDERS).map((prov) => {
                                                const currentProvider = settings.aiProvider || "gemini";
                                                const isSelected = currentProvider === prov.id;
                                                return (
                                                    <button
                                                        key={prov.id}
                                                        type="button"
                                                        onClick={() => handleSelectAIProvider(prov.id)}
                                                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                                                            isSelected
                                                                ? "bg-primary/10 border-primary text-primary shadow-xs ring-1 ring-primary"
                                                                : "bg-background border-border/70 hover:border-primary/50 text-foreground"
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between w-full">
                                                            <span className="text-xs font-bold truncate">{prov.name.split(" ")[0]}</span>
                                                            {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground line-clamp-1">
                                                            {prov.id === "gemini" && "Google Free"}
                                                            {prov.id === "openai" && "ChatGPT"}
                                                            {prov.id === "groq" && "Ultra-Cepat"}
                                                            {prov.id === "deepseek" && "DeepSeek V3/R1"}
                                                            {prov.id === "openrouter" && "All-in-One"}
                                                            {prov.id === "ollama" && "Offline/Lokal"}
                                                            {prov.id === "custom" && "OpenAI Spec"}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Provider Description & External Link Callout */}
                                        {(() => {
                                            const currentProv = AI_PROVIDERS[settings.aiProvider || "gemini"] || AI_PROVIDERS.gemini;
                                            return (
                                                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                                        <strong className="text-foreground">{currentProv.name}:</strong> {currentProv.description}
                                                    </p>
                                                    {currentProv.apiKeyHelpUrl && (
                                                        <a
                                                            href={currentProv.apiKeyHelpUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 shrink-0 whitespace-nowrap self-start sm:self-auto"
                                                        >
                                                            <span>Dapatkan API Key</span>
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* API Key & Base URL Inputs */}
                                    {/* Multi-Provider Key Vault (Gudang Kunci Multi-Provider) */}
                                    <div className="space-y-4 pt-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Key className="h-4 w-4 text-primary" />
                                                    <h4 className="text-xs font-bold text-foreground">Gudang Kunci API Multi-Provider (Multi-Key Vault)</h4>
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                                                        Bisa Pasang Semua Provider
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                                    Simpan API Key dari berbagai penyedia sekaligus. Sistem dapat membagi beban kerja secara cerdas dan mengaktifkan failover otomatis.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                            {/* 1. Google Gemini Key Card */}
                                            {(() => {
                                                const hasKey = Boolean(settings.geminiApiKey?.trim() || (settings.aiProvider === "gemini" && settings.aiApiKey?.trim()));
                                                const testRes = providerTestResults["gemini"];
                                                const isPinging = testingProvider === "gemini";
                                                return (
                                                    <div className={`p-4 rounded-xl border transition-all space-y-2.5 ${hasKey ? "bg-card/70 border-border" : "bg-muted/20 border-border/60"}`}>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-foreground">Google Gemini</span>
                                                                <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                                                    Gratis & Stabil
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                {hasKey ? (
                                                                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold flex items-center gap-1">
                                                                        <Check className="h-3 w-3" /> Tersimpan
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border text-[10px]">
                                                                        Belum Diisi
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="relative">
                                                            <input
                                                                type={showKeyMap["gemini"] ? "text" : "password"}
                                                                name="geminiApiKey"
                                                                value={settings.geminiApiKey || (settings.aiProvider === "gemini" ? settings.aiApiKey : "") || ""}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    setSettings(prev => ({
                                                                        ...prev,
                                                                        geminiApiKey: val,
                                                                        ...(prev.aiProvider === "gemini" ? { aiApiKey: val } : {})
                                                                    }));
                                                                }}
                                                                placeholder="AIzaSy..."
                                                                className="w-full pl-3 pr-9 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary text-xs font-mono"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowKeyMap(prev => ({ ...prev, gemini: !prev.gemini }))}
                                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                                                            >
                                                                {showKeyMap["gemini"] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center justify-between pt-1 text-[10px]">
                                                            <a
                                                                href="https://aistudio.google.com/app/apikey"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-primary hover:underline flex items-center gap-1 font-medium"
                                                            >
                                                                <span>Dapatkan Key di Google AI Studio</span>
                                                                <ExternalLink className="h-2.5 w-2.5" />
                                                            </a>

                                                            <div className="flex items-center gap-1.5">
                                                                {testRes && (
                                                                    <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold ${testRes.success ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"}`} title={testRes.message}>
                                                                        {testRes.success ? `✓ ${testRes.latencyMs}ms` : "✕ Gagal"}
                                                                    </span>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleTestAi("gemini")}
                                                                    disabled={isPinging}
                                                                    className="px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 text-foreground border border-border flex items-center gap-1 cursor-pointer disabled:opacity-50 font-medium"
                                                                >
                                                                    {isPinging ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Zap className="h-2.5 w-2.5 text-amber-500" />}
                                                                    <span>Ping Test</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {/* 2. Groq (LPU) Key Card */}
                                            {(() => {
                                                const hasKey = Boolean(settings.groqApiKey?.trim() || (settings.aiProvider === "groq" && settings.aiApiKey?.trim()));
                                                const testRes = providerTestResults["groq"];
                                                const isPinging = testingProvider === "groq";
                                                return (
                                                    <div className={`p-4 rounded-xl border transition-all space-y-2.5 ${hasKey ? "bg-card/70 border-border" : "bg-muted/20 border-border/60"}`}>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-foreground">Groq (LPU Ultra-Fast)</span>
                                                                <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                                    ⚡ 300+ token/s
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                {hasKey ? (
                                                                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold flex items-center gap-1">
                                                                        <Check className="h-3 w-3" /> Tersimpan
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border text-[10px]">
                                                                        Belum Diisi
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="relative">
                                                            <input
                                                                type={showKeyMap["groq"] ? "text" : "password"}
                                                                name="groqApiKey"
                                                                value={settings.groqApiKey || (settings.aiProvider === "groq" ? settings.aiApiKey : "") || ""}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    setSettings(prev => ({
                                                                        ...prev,
                                                                        groqApiKey: val,
                                                                        ...(prev.aiProvider === "groq" ? { aiApiKey: val } : {})
                                                                    }));
                                                                }}
                                                                placeholder="gsk_..."
                                                                className="w-full pl-3 pr-9 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary text-xs font-mono"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowKeyMap(prev => ({ ...prev, groq: !prev.groq }))}
                                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                                                            >
                                                                {showKeyMap["groq"] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center justify-between pt-1 text-[10px]">
                                                            <a
                                                                href="https://console.groq.com/keys"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-primary hover:underline flex items-center gap-1 font-medium"
                                                            >
                                                                <span>Dapatkan Key di Groq Console (Gratis)</span>
                                                                <ExternalLink className="h-2.5 w-2.5" />
                                                            </a>

                                                            <div className="flex items-center gap-1.5">
                                                                {testRes && (
                                                                    <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold ${testRes.success ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"}`} title={testRes.message}>
                                                                        {testRes.success ? `✓ ${testRes.latencyMs}ms` : "✕ Gagal"}
                                                                    </span>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleTestAi("groq")}
                                                                    disabled={isPinging}
                                                                    className="px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 text-foreground border border-border flex items-center gap-1 cursor-pointer disabled:opacity-50 font-medium"
                                                                >
                                                                    {isPinging ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Zap className="h-2.5 w-2.5 text-amber-500" />}
                                                                    <span>Ping Test</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {/* 3. OpenAI (ChatGPT) Key Card */}
                                            {(() => {
                                                const hasKey = Boolean(settings.openaiApiKey?.trim() || (settings.aiProvider === "openai" && settings.aiApiKey?.trim()));
                                                const testRes = providerTestResults["openai"];
                                                const isPinging = testingProvider === "openai";
                                                return (
                                                    <div className={`p-4 rounded-xl border transition-all space-y-2.5 ${hasKey ? "bg-card/70 border-border" : "bg-muted/20 border-border/60"}`}>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-foreground">OpenAI (ChatGPT)</span>
                                                                <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                                    GPT-4o / o3-mini
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                {hasKey ? (
                                                                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold flex items-center gap-1">
                                                                        <Check className="h-3 w-3" /> Tersimpan
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border text-[10px]">
                                                                        Belum Diisi
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="relative">
                                                            <input
                                                                type={showKeyMap["openai"] ? "text" : "password"}
                                                                name="openaiApiKey"
                                                                value={settings.openaiApiKey || (settings.aiProvider === "openai" ? settings.aiApiKey : "") || ""}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    setSettings(prev => ({
                                                                        ...prev,
                                                                        openaiApiKey: val,
                                                                        ...(prev.aiProvider === "openai" ? { aiApiKey: val } : {})
                                                                    }));
                                                                }}
                                                                placeholder="sk-proj-..."
                                                                className="w-full pl-3 pr-9 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary text-xs font-mono"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowKeyMap(prev => ({ ...prev, openai: !prev.openai }))}
                                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                                                            >
                                                                {showKeyMap["openai"] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center justify-between pt-1 text-[10px]">
                                                            <a
                                                                href="https://platform.openai.com/api-keys"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-primary hover:underline flex items-center gap-1 font-medium"
                                                            >
                                                                <span>Dapatkan Key di OpenAI Platform</span>
                                                                <ExternalLink className="h-2.5 w-2.5" />
                                                            </a>

                                                            <div className="flex items-center gap-1.5">
                                                                {testRes && (
                                                                    <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold ${testRes.success ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"}`} title={testRes.message}>
                                                                        {testRes.success ? `✓ ${testRes.latencyMs}ms` : "✕ Gagal"}
                                                                    </span>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleTestAi("openai")}
                                                                    disabled={isPinging}
                                                                    className="px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 text-foreground border border-border flex items-center gap-1 cursor-pointer disabled:opacity-50 font-medium"
                                                                >
                                                                    {isPinging ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Zap className="h-2.5 w-2.5 text-amber-500" />}
                                                                    <span>Ping Test</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {/* 4. DeepSeek Key Card */}
                                            {(() => {
                                                const hasKey = Boolean(settings.deepseekApiKey?.trim() || (settings.aiProvider === "deepseek" && settings.aiApiKey?.trim()));
                                                const testRes = providerTestResults["deepseek"];
                                                const isPinging = testingProvider === "deepseek";
                                                return (
                                                    <div className={`p-4 rounded-xl border transition-all space-y-2.5 ${hasKey ? "bg-card/70 border-border" : "bg-muted/20 border-border/60"}`}>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-foreground">DeepSeek</span>
                                                                <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-purple-500/10 text-purple-500 border border-purple-500/20">
                                                                    V3 & R1 Reasoner
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                {hasKey ? (
                                                                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold flex items-center gap-1">
                                                                        <Check className="h-3 w-3" /> Tersimpan
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border text-[10px]">
                                                                        Belum Diisi
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="relative">
                                                            <input
                                                                type={showKeyMap["deepseek"] ? "text" : "password"}
                                                                name="deepseekApiKey"
                                                                value={settings.deepseekApiKey || (settings.aiProvider === "deepseek" ? settings.aiApiKey : "") || ""}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    setSettings(prev => ({
                                                                        ...prev,
                                                                        deepseekApiKey: val,
                                                                        ...(prev.aiProvider === "deepseek" ? { aiApiKey: val } : {})
                                                                    }));
                                                                }}
                                                                placeholder="sk-..."
                                                                className="w-full pl-3 pr-9 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary text-xs font-mono"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowKeyMap(prev => ({ ...prev, deepseek: !prev.deepseek }))}
                                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                                                            >
                                                                {showKeyMap["deepseek"] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center justify-between pt-1 text-[10px]">
                                                            <a
                                                                href="https://platform.deepseek.com/api_keys"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-primary hover:underline flex items-center gap-1 font-medium"
                                                            >
                                                                <span>Dapatkan Key di DeepSeek Platform</span>
                                                                <ExternalLink className="h-2.5 w-2.5" />
                                                            </a>

                                                            <div className="flex items-center gap-1.5">
                                                                {testRes && (
                                                                    <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold ${testRes.success ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"}`} title={testRes.message}>
                                                                        {testRes.success ? `✓ ${testRes.latencyMs}ms` : "✕ Gagal"}
                                                                    </span>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleTestAi("deepseek")}
                                                                    disabled={isPinging}
                                                                    className="px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 text-foreground border border-border flex items-center gap-1 cursor-pointer disabled:opacity-50 font-medium"
                                                                >
                                                                    {isPinging ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Zap className="h-2.5 w-2.5 text-amber-500" />}
                                                                    <span>Ping Test</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {/* 5. OpenRouter (All-in-One) Key Card */}
                                            {(() => {
                                                const hasKey = Boolean(settings.openrouterApiKey?.trim() || (settings.aiProvider === "openrouter" && settings.aiApiKey?.trim()));
                                                const testRes = providerTestResults["openrouter"];
                                                const isPinging = testingProvider === "openrouter";
                                                return (
                                                    <div className={`p-4 rounded-xl border transition-all space-y-2.5 ${hasKey ? "bg-card/70 border-border" : "bg-muted/20 border-border/60"}`}>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-foreground">OpenRouter</span>
                                                                <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                                                                    Claude, Llama, 100+ Model
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                {hasKey ? (
                                                                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold flex items-center gap-1">
                                                                        <Check className="h-3 w-3" /> Tersimpan
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border text-[10px]">
                                                                        Belum Diisi
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="relative">
                                                            <input
                                                                type={showKeyMap["openrouter"] ? "text" : "password"}
                                                                name="openrouterApiKey"
                                                                value={settings.openrouterApiKey || (settings.aiProvider === "openrouter" ? settings.aiApiKey : "") || ""}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    setSettings(prev => ({
                                                                        ...prev,
                                                                        openrouterApiKey: val,
                                                                        ...(prev.aiProvider === "openrouter" ? { aiApiKey: val } : {})
                                                                    }));
                                                                }}
                                                                placeholder="sk-or-v1-..."
                                                                className="w-full pl-3 pr-9 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary text-xs font-mono"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowKeyMap(prev => ({ ...prev, openrouter: !prev.openrouter }))}
                                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                                                            >
                                                                {showKeyMap["openrouter"] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center justify-between pt-1 text-[10px]">
                                                            <a
                                                                href="https://openrouter.ai/keys"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-primary hover:underline flex items-center gap-1 font-medium"
                                                            >
                                                                <span>Dapatkan Key di OpenRouter</span>
                                                                <ExternalLink className="h-2.5 w-2.5" />
                                                            </a>

                                                            <div className="flex items-center gap-1.5">
                                                                {testRes && (
                                                                    <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold ${testRes.success ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"}`} title={testRes.message}>
                                                                        {testRes.success ? `✓ ${testRes.latencyMs}ms` : "✕ Gagal"}
                                                                    </span>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleTestAi("openrouter")}
                                                                    disabled={isPinging}
                                                                    className="px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 text-foreground border border-border flex items-center gap-1 cursor-pointer disabled:opacity-50 font-medium"
                                                                >
                                                                    {isPinging ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Zap className="h-2.5 w-2.5 text-amber-500" />}
                                                                    <span>Ping Test</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {/* 6. Custom / OpenAI-Compatible Card */}
                                            {(() => {
                                                const hasKey = Boolean(settings.customApiKey?.trim() || settings.aiBaseUrl?.trim());
                                                const testRes = providerTestResults["custom"];
                                                const isPinging = testingProvider === "custom";
                                                return (
                                                    <div className={`p-4 rounded-xl border transition-all space-y-2.5 ${hasKey ? "bg-card/70 border-border" : "bg-muted/20 border-border/60"}`}>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-foreground">Custom / Compatible</span>
                                                                <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-muted text-muted-foreground border border-border">
                                                                    vLLM / LiteLLM / Self-hosted
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                {hasKey ? (
                                                                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold flex items-center gap-1">
                                                                        <Check className="h-3 w-3" /> Siap
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border text-[10px]">
                                                                        Opsional
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <div className="relative">
                                                                <input
                                                                    type={showKeyMap["custom"] ? "text" : "password"}
                                                                    name="customApiKey"
                                                                    value={settings.customApiKey || ""}
                                                                    onChange={handleChange}
                                                                    placeholder="API Key kustom (opsional)..."
                                                                    className="w-full pl-3 pr-9 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary text-xs font-mono"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowKeyMap(prev => ({ ...prev, custom: !prev.custom }))}
                                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                                                                >
                                                                    {showKeyMap["custom"] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                                                </button>
                                                            </div>
                                                            <input
                                                                type="text"
                                                                name="aiBaseUrl"
                                                                value={settings.aiBaseUrl || ""}
                                                                onChange={handleChange}
                                                                placeholder="Base URL: https://api.openai.com/v1"
                                                                className="w-full px-3 py-1.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary text-[11px] font-mono"
                                                            />
                                                        </div>

                                                        <div className="flex items-center justify-between pt-1 text-[10px]">
                                                            <span className="text-muted-foreground text-[10px]">OpenAI Endpoint Standard</span>
                                                            <div className="flex items-center gap-1.5">
                                                                {testRes && (
                                                                    <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold ${testRes.success ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"}`} title={testRes.message}>
                                                                        {testRes.success ? `✓ ${testRes.latencyMs}ms` : "✕ Gagal"}
                                                                    </span>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleTestAi("custom")}
                                                                    disabled={isPinging}
                                                                    className="px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 text-foreground border border-border flex items-center gap-1 cursor-pointer disabled:opacity-50 font-medium"
                                                                >
                                                                    {isPinging ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Zap className="h-2.5 w-2.5 text-amber-500" />}
                                                                    <span>Ping Test</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* Smart Auto-Failover (Anti-Downtime & Redundancy) Card */}
                                    <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 via-background to-primary/10 border border-primary/20 space-y-3">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20 shrink-0 mt-0.5">
                                                    <ShieldCheck className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-xs font-bold text-foreground">Smart Auto-Failover (Anti-Downtime & Redundancy)</h4>
                                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                            Zero Visitor Error
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                                                        Bila provider utama kehabisan kuota (429 Rate Limit), server sibuk (503 High Demand), atau timeout, AI otomatis mengalihkan request ke provider cadangan yang aktif secara transparan. Pengunjung website tidak akan pernah mengalami error.
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Toggle Switch */}
                                            <button
                                                type="button"
                                                onClick={() => setSettings(prev => ({
                                                    ...prev,
                                                    aiAutoFailover: prev.aiAutoFailover === "false" ? "true" : "false"
                                                }))}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                                                    settings.aiAutoFailover !== "false" ? "bg-primary" : "bg-muted border border-border"
                                                }`}
                                                title={settings.aiAutoFailover !== "false" ? "Auto-Failover Aktif" : "Auto-Failover Nonaktif"}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        settings.aiAutoFailover !== "false" ? "translate-x-6" : "translate-x-1"
                                                    }`}
                                                />
                                            </button>
                                        </div>

                                        {/* Active backup chain preview */}
                                        {(() => {
                                            const configuredList = [
                                                { id: "gemini", name: "Google Gemini", hasKey: Boolean(settings.geminiApiKey?.trim() || settings.aiApiKey?.trim()) },
                                                { id: "groq", name: "Groq (LPU)", hasKey: Boolean(settings.groqApiKey?.trim()) },
                                                { id: "openai", name: "OpenAI", hasKey: Boolean(settings.openaiApiKey?.trim()) },
                                                { id: "deepseek", name: "DeepSeek", hasKey: Boolean(settings.deepseekApiKey?.trim()) },
                                                { id: "openrouter", name: "OpenRouter", hasKey: Boolean(settings.openrouterApiKey?.trim()) },
                                                { id: "custom", name: "Custom", hasKey: Boolean(settings.customApiKey?.trim()) },
                                            ].filter(p => p.hasKey);

                                            return (
                                                <div className="pt-2 border-t border-border/50 flex flex-wrap items-center gap-2 text-[11px]">
                                                    <span className="text-muted-foreground font-medium">Rantai Redundansi Otomatis:</span>
                                                    {configuredList.length === 0 ? (
                                                        <span className="text-amber-500 text-[10px]">Belum ada API key terisi. Masukkan minimal 1 API key di atas.</span>
                                                    ) : (
                                                        configuredList.map((item, idx) => {
                                                            const isPrimary = item.id === (settings.aiProvider || "gemini");
                                                            return (
                                                                <span
                                                                    key={item.id}
                                                                    className={`px-2 py-0.5 rounded-lg font-mono text-[10px] flex items-center gap-1 border ${
                                                                        isPrimary
                                                                            ? "bg-primary text-white border-primary font-bold shadow-xs"
                                                                            : "bg-background/80 text-foreground border-border"
                                                                    }`}
                                                                >
                                                                    {isPrimary ? `★ Utama: ${item.name}` : `${idx + 1}. Cadangan: ${item.name}`}
                                                                </span>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Model Name & Smart Selector */}
                                    {(() => {
                                        const currentProv = AI_PROVIDERS[settings.aiProvider || "gemini"] || AI_PROVIDERS.gemini;
                                        const currentModel = settings.aiModel || (settings.aiProvider === "gemini" ? (settings.geminiModel || currentProv.defaultModel) : currentProv.defaultModel);
                                        const activeModelsList: AIModelItem[] = fetchedModels[currentProv.id] || currentProv.availableModels || currentProv.recommendedModels.map(m => ({
                                            id: m.id,
                                            name: m.name,
                                            tag: m.tag,
                                            isRecommended: true
                                        }));
                                        const selectedModelObj = activeModelsList.find(m => m.id === currentModel);

                                        return (
                                            <div className="space-y-2.5">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                                        <Cpu className="h-3.5 w-3.5 text-primary" />
                                                        <span>Nama Model AI ({currentProv.name})</span>
                                                        {fetchedModels[currentProv.id] && (
                                                            <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                                                                <CheckCircle2 className="h-3 w-3" />
                                                                Live API ({fetchedModels[currentProv.id].length} model)
                                                            </span>
                                                        )}
                                                    </label>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleFetchModels({ silent: false })}
                                                            disabled={fetchingModels}
                                                            className="text-[11px] px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 flex items-center gap-1.5 font-medium transition-all cursor-pointer disabled:opacity-50"
                                                            title="Tarik daftar model yang aktif langsung dari API provider"
                                                        >
                                                            <RefreshCw className={`h-3 w-3 ${fetchingModels ? "animate-spin" : ""}`} />
                                                            <span>{fetchingModels ? "Mengambil Model..." : "Ambil Model dari API"}</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setCustomModelMode(!customModelMode)}
                                                            className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors cursor-pointer"
                                                        >
                                                            {customModelMode ? "Pilih dari Daftar" : "Ketik Manual"}
                                                        </button>
                                                    </div>
                                                </div>

                                                {!customModelMode ? (
                                                    <div className="relative">
                                                        <select
                                                            name="aiModel"
                                                            value={currentModel}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setSettings(prev => ({
                                                                    ...prev,
                                                                    aiModel: val,
                                                                    ...(prev.aiProvider === "gemini" ? { geminiModel: val } : {})
                                                                }));
                                                            }}
                                                            className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-xs font-mono font-semibold text-foreground appearance-none cursor-pointer pr-10"
                                                        >
                                                            {!activeModelsList.some(m => m.id === currentModel) && (
                                                                <option value={currentModel}>
                                                                    {currentModel} (Model Saat Ini)
                                                                </option>
                                                            )}

                                                            {activeModelsList.some(m => m.isRecommended) && (
                                                                <optgroup label="⚡ Model Rekomendasi Utama">
                                                                    {activeModelsList
                                                                        .filter(m => m.isRecommended)
                                                                        .map(m => (
                                                                            <option key={m.id} value={m.id}>
                                                                                {m.name !== m.id ? `${m.name} (${m.id})` : m.id} {m.tag ? `[${m.tag}]` : ""}
                                                                            </option>
                                                                        ))}
                                                                </optgroup>
                                                            )}

                                                            <optgroup label={`🌐 Semua Model ${fetchedModels[currentProv.id] ? "dari API" : "Tersedia"} (${activeModelsList.length})`}>
                                                                {activeModelsList
                                                                    .filter(m => !m.isRecommended)
                                                                    .map(m => (
                                                                        <option key={m.id} value={m.id}>
                                                                            {m.name !== m.id ? `${m.name} (${m.id})` : m.id} {m.tag ? `[${m.tag}]` : ""}
                                                                        </option>
                                                                    ))}
                                                            </optgroup>
                                                        </select>
                                                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                                    </div>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        name="aiModel"
                                                        value={currentModel}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            setSettings(prev => ({
                                                                ...prev,
                                                                aiModel: val,
                                                                ...(prev.aiProvider === "gemini" ? { geminiModel: val } : {})
                                                            }));
                                                        }}
                                                        placeholder="e.g. gemini-2.0-flash, gpt-4o, llama-3.3-70b-versatile..."
                                                        className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-xs font-mono font-semibold text-foreground"
                                                    />
                                                )}

                                                {/* Selected Model Description / Specs Badge */}
                                                {(selectedModelObj?.description || selectedModelObj?.contextWindow) && (
                                                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border/50">
                                                        <span className="font-mono font-semibold text-foreground shrink-0">{currentModel}</span>
                                                        {selectedModelObj?.description && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="truncate">{selectedModelObj.description}</span>
                                                            </>
                                                        )}
                                                        {selectedModelObj?.contextWindow && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="shrink-0 font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">
                                                                    {selectedModelObj.contextWindow >= 1000000
                                                                        ? `${(selectedModelObj.contextWindow / 1000000).toFixed(0)}M token`
                                                                        : `${Math.round(selectedModelObj.contextWindow / 1000)}k token`}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Recommended Model Preset Chips */}
                                                {currentProv.recommendedModels && currentProv.recommendedModels.length > 0 && (
                                                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                                        <span className="text-[11px] text-muted-foreground mr-1">Rekomendasi:</span>
                                                        {currentProv.recommendedModels.map((m) => {
                                                            const isSelected = currentModel === m.id;
                                                            return (
                                                                <button
                                                                    key={m.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSettings(prev => ({
                                                                            ...prev,
                                                                            aiModel: m.id,
                                                                            ...(prev.aiProvider === "gemini" ? { geminiModel: m.id } : {})
                                                                        }));
                                                                    }}
                                                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 border ${
                                                                        isSelected
                                                                            ? "bg-primary text-white border-primary shadow-2xs font-semibold"
                                                                            : "bg-card border-border/70 text-foreground hover:bg-muted"
                                                                    }`}
                                                                >
                                                                    <span>{m.name}</span>
                                                                    {m.tag && (
                                                                        <span className={`text-[9px] px-1 py-0.2 rounded font-normal ${
                                                                            isSelected ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                                                                        }`}>
                                                                            {m.tag}
                                                                        </span>
                                                                    )}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {/* 1-Click AI Test Button & Live Feedback */}
                                    <div className="space-y-3 pt-2 border-t border-border/60">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div>
                                                <p className="text-xs font-bold text-foreground">Uji Konektivitas AI ({AI_PROVIDERS[settings.aiProvider || "gemini"]?.name || settings.aiProvider})</p>
                                                <p className="text-[11px] text-muted-foreground">Kirim request ping langsung ke endpoint untuk memastikan API key dan model berfungsi normal.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleTestAi()}
                                                disabled={testingAi}
                                                className="py-2.5 px-5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60 shrink-0 self-start sm:self-auto"
                                            >
                                                {testingAi ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Zap className="h-4 w-4" />
                                                )}
                                                <span>{testingAi ? "Menghubungi Provider AI..." : `Test Koneksi ${AI_PROVIDERS[settings.aiProvider || "gemini"]?.name || "AI"}`}</span>
                                            </button>
                                        </div>

                                        {/* Test Result Callout */}
                                        {aiTestResult && (
                                            <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 transition-all ${
                                                aiTestResult.success
                                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                                                    : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400"
                                            }`}>
                                                {aiTestResult.success ? (
                                                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                                                ) : (
                                                    <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
                                                )}
                                                <div className="space-y-1 flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                                        <p className="font-bold">{aiTestResult.success ? "Uji Koneksi AI Berhasil" : "Uji Koneksi AI Gagal"}</p>
                                                        {aiTestResult.latencyMs !== undefined && (
                                                            <span className="px-2 py-0.5 rounded-md bg-background/80 border border-border text-[10px] font-mono font-bold">
                                                                Latency: {aiTestResult.latencyMs}ms
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] leading-relaxed break-words">{aiTestResult.message}</p>
                                                    {aiTestResult.reply && (
                                                        <div className="mt-2 p-2.5 rounded-xl bg-background/70 border border-border/60 text-[11px] font-mono text-foreground">
                                                            <span className="text-muted-foreground font-sans text-[10px] block mb-1 uppercase font-semibold">Respon Model:</span>
                                                            &quot;{aiTestResult.reply}&quot;
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Custom AI Chatbot Persona */}
                                    <div className="space-y-2 pt-2 border-t border-border/60">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                                                <span>Custom Persona & System Instructions (Public Chatbot)</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const defaultPrompt = "You are an AI assistant for a professional Portfolio Website. Your job is to answer questions about the portfolio owner (Me).\nOur background: Senior Network Engineer & Developer with expertise in Next.js, React, Node.js, Cisco, and Python.\nLocation: Jakarta, Indonesia.\nTone: Professional, helpful, and slightly futuristic.\nAnswer questions based on our skills and experience. If questions are unrelated, politely redirect them.";
                                                    setSettings(prev => ({
                                                        ...prev,
                                                        aiCustomPrompt: defaultPrompt,
                                                        geminiCustomPrompt: defaultPrompt
                                                    }));
                                                }}
                                                className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                                            >
                                                Gunakan Template Default
                                            </button>
                                        </div>
                                        <textarea
                                            name="aiCustomPrompt"
                                            value={settings.aiCustomPrompt || settings.geminiCustomPrompt || ""}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setSettings(prev => ({
                                                    ...prev,
                                                    aiCustomPrompt: val,
                                                    geminiCustomPrompt: val
                                                }));
                                            }}
                                            rows={4}
                                            placeholder="Tuliskan instruksi sistem persona untuk asisten AI pada widget chat publik..."
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-xs leading-relaxed"
                                        />
                                        <p className="text-[11px] text-muted-foreground">
                                            Instruksi sistem ini berlaku untuk provider apapun yang dipilih (Google, OpenAI, Groq, DeepSeek, dsb).
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Dedicated Portfolio Assistant AI Model Card */}
                            <div className="bg-card/40 backdrop-blur-md border border-primary/20 rounded-2xl p-6 shadow-sm space-y-5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/20">
                                            <Bot className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-bold text-foreground">Model Khusus AI Portfolio Assistant</h3>
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                                                    Chatbot Publik
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Konfigurasi model AI terpisah khusus untuk widget chat pengunjung di sisi publik (ultra-cepat, responsif, dan hemat biaya)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Mode Toggle: Global vs Dedicated */}
                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                                            <input
                                                type="radio"
                                                name="assistantAiMode"
                                                checked={!settings.assistantAiModel}
                                                onChange={() => {
                                                    setSettings(prev => ({
                                                        ...prev,
                                                        assistantAiModel: "",
                                                        assistantAiProvider: ""
                                                    }));
                                                }}
                                                className="text-primary focus:ring-primary h-4 w-4"
                                            />
                                            <span>Gunakan Model Global AI ({settings.aiModel || "gemini-flash-lite-latest"})</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                                            <input
                                                type="radio"
                                                name="assistantAiMode"
                                                checked={Boolean(settings.assistantAiModel)}
                                                onChange={() => {
                                                    setSettings(prev => ({
                                                        ...prev,
                                                        assistantAiModel: prev.assistantAiModel || "gemini-flash-lite-latest",
                                                        assistantAiProvider: prev.assistantAiProvider || prev.aiProvider || "gemini"
                                                    }));
                                                }}
                                                className="text-primary focus:ring-primary h-4 w-4"
                                            />
                                            <span>Tentukan Model Khusus Portfolio Assistant</span>
                                        </label>
                                    </div>

                                    {Boolean(settings.assistantAiModel) && (
                                        <div className="p-4 rounded-xl bg-background/60 border border-border space-y-4">
                                            {/* Assistant Provider */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-foreground">
                                                    Provider AI untuk Assistant
                                                </label>
                                                <select
                                                    name="assistantAiProvider"
                                                    value={settings.assistantAiProvider || settings.aiProvider || "gemini"}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        const provPreset = AI_PROVIDERS[val] || AI_PROVIDERS.gemini;
                                                        setSettings(prev => ({
                                                            ...prev,
                                                            assistantAiProvider: val,
                                                            assistantAiModel: provPreset.defaultModel
                                                        }));
                                                    }}
                                                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-xs font-semibold"
                                                >
                                                    {Object.values(AI_PROVIDERS).map(prov => (
                                                        <option key={prov.id} value={prov.id}>
                                                            {prov.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Kunci API: Menggunakan kunci <strong className="text-foreground">{AI_PROVIDERS[settings.assistantAiProvider || settings.aiProvider || "gemini"]?.name}</strong> dari Gudang Kunci di atas.
                                                </p>
                                            </div>

                                            {/* Assistant Model Name */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-foreground">
                                                    Nama Model AI Assistant
                                                </label>
                                                <input
                                                    type="text"
                                                    name="assistantAiModel"
                                                    value={settings.assistantAiModel || ""}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setSettings(prev => ({ ...prev, assistantAiModel: val }));
                                                    }}
                                                    placeholder="e.g. gemini-flash-lite-latest, llama-3.3-70b-versatile"
                                                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-xs font-mono"
                                                />
                                                <div className="flex flex-wrap gap-1.5 pt-1">
                                                    <span className="text-[11px] text-muted-foreground">Pilihan Cepat:</span>
                                                    {["gemini-flash-lite-latest", "gemini-3.7-flash", "gemini-flash-latest", "llama-3.3-70b-versatile", "gpt-4o-mini"].map(rec => (
                                                        <button
                                                            key={rec}
                                                            type="button"
                                                            onClick={() => setSettings(prev => ({ ...prev, assistantAiModel: rec }))}
                                                            className={`text-[10px] px-2 py-0.5 rounded-md font-mono transition-all border ${
                                                                settings.assistantAiModel === rec
                                                                    ? "bg-primary text-white border-primary"
                                                                    : "bg-muted text-muted-foreground hover:text-foreground border-border"
                                                            }`}
                                                        >
                                                            {rec}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Custom Instructions for Assistant */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-foreground">
                                                    Instruksi Khusus Persona Portfolio Assistant
                                                </label>
                                                <textarea
                                                    name="assistantAiCustomPrompt"
                                                    value={settings.assistantAiCustomPrompt || ""}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setSettings(prev => ({ ...prev, assistantAiCustomPrompt: val }));
                                                    }}
                                                    rows={3}
                                                    placeholder="Petunjuk khusus bagaimana AI harus menyapa pengunjung, nada bicara, atau prioritas topik..."
                                                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section 2: MongoDB Database Connectivity */}
                            <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/20">
                                            <Database className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-bold text-foreground">MongoDB Cluster Connectivity</h3>
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                                    Operational
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Basis data utama untuk menyimpan artikel, projek, sertifikasi, media library, dan setelan sistem
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action to ping active connection */}
                                    <button
                                        type="button"
                                        onClick={() => handleTestDatabase(false)}
                                        disabled={testingDb}
                                        className="px-4 py-2 rounded-xl text-xs font-bold bg-card border border-border hover:bg-muted text-foreground transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 self-start sm:self-auto"
                                    >
                                        {testingDb ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <RefreshCw className="h-4 w-4 text-primary" />}
                                        <span>Cek Latensi Database Aktif</span>
                                    </button>
                                </div>

                                <div className="grid gap-5">
                                    {/* Custom URI Input */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                                <span>MongoDB Connection URI (Override / Cluster Kustom)</span>
                                                <span className="text-[10px] text-muted-foreground font-normal">(Opsional)</span>
                                            </label>
                                            <span className="text-[11px] text-muted-foreground font-mono">
                                                Driver: Mongoose 8.x
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type={showMongoUri ? "text" : "password"}
                                                name="mongoDbUri"
                                                value={settings.mongoDbUri || ""}
                                                onChange={handleChange}
                                                placeholder="mongodb+srv://<username>:<password>@cluster0.mongodb.net/portfolio_db"
                                                className="w-full pl-3.5 pr-11 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-xs font-mono"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowMongoUri(!showMongoUri)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1"
                                                title={showMongoUri ? "Sembunyikan URI" : "Tampilkan URI"}
                                            >
                                                {showMongoUri ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-muted-foreground">
                                            <p>
                                                Jika diisi, Anda dapat menguji URI cluster baru sebelum melakukan migrasi server. Jika kosong, sistem membaca <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px]">MONGODB_URI</code> dari <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px]">.env.local</code>.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => handleTestDatabase(true)}
                                                disabled={testingDb || !settings.mongoDbUri}
                                                className="px-3 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20 font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none self-start sm:self-auto shrink-0"
                                            >
                                                Uji URI Kustom
                                            </button>
                                        </div>
                                    </div>

                                    {/* Test Result Callout for Database */}
                                    {dbTestResult && (
                                        <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 transition-all ${
                                            dbTestResult.success
                                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                                                : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400"
                                        }`}>
                                            {dbTestResult.success ? (
                                                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                                            ) : (
                                                <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
                                            )}
                                            <div className="space-y-1.5 flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                                    <p className="font-bold">
                                                        {dbTestResult.success
                                                            ? (dbTestResult.isCustomUri ? "Koneksi URI Kustom Berhasil" : "Koneksi Database Aktif Normal")
                                                            : "Koneksi Database Gagal"}
                                                    </p>
                                                    {dbTestResult.latencyMs !== undefined && (
                                                        <span className="px-2 py-0.5 rounded-md bg-background/80 border border-border text-[10px] font-mono font-bold">
                                                            Latency: {dbTestResult.latencyMs}ms
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] leading-relaxed break-words">{dbTestResult.message}</p>
                                                {dbTestResult.success && dbTestResult.host && (
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                                                        <div className="p-2 rounded-lg bg-background/60 border border-border/50 text-[10px]">
                                                            <span className="text-muted-foreground block">Host:</span>
                                                            <span className="font-mono font-semibold truncate block">{dbTestResult.host}</span>
                                                        </div>
                                                        <div className="p-2 rounded-lg bg-background/60 border border-border/50 text-[10px]">
                                                            <span className="text-muted-foreground block">Database:</span>
                                                            <span className="font-mono font-semibold truncate block">{dbTestResult.databaseName}</span>
                                                        </div>
                                                        <div className="p-2 rounded-lg bg-background/60 border border-border/50 text-[10px] col-span-2 sm:col-span-1">
                                                            <span className="text-muted-foreground block">Koleksi:</span>
                                                            <span className="font-mono font-semibold truncate block">{dbTestResult.collectionsCount ?? 0} Koleksi</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Security & Deployment Best Practices */}
                                    <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 flex items-start gap-3 text-xs">
                                        <div className="p-1.5 bg-primary/10 rounded-lg text-primary shrink-0 mt-0.5">
                                            <Shield className="h-4 w-4" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-bold text-foreground">Praktik Keamanan Database & API Key</p>
                                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                Pastikan IP server hosting terdaftar pada <strong>Network Access / IP Access List</strong> di MongoDB Atlas. Jangan bagikan string URI atau API Key kepada siapapun. Fitur isolasi uji coba di atas melakukan verifikasi tanpa mengganggu sesi database server yang sedang aktif.
                                            </p>
                                        </div>
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-foreground">Projects Hero Badge [EN]</label>
                                            <input
                                                name="projectsHeroBadge"
                                                value={settings.projectsHeroBadge || ""}
                                                onChange={handleChange}
                                                placeholder="e.g. Engineering Portfolio"
                                                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-foreground">Projects Hero Badge [ID]</label>
                                            <input
                                                name="projectsHeroBadge_id"
                                                value={settings.projectsHeroBadge_id || ""}
                                                onChange={handleChange}
                                                placeholder="mis. Portofolio Rekayasa"
                                                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-foreground">Projects Hero Title [EN]</label>
                                            <input
                                                name="projectsHeroTitle"
                                                value={settings.projectsHeroTitle || ""}
                                                onChange={handleChange}
                                                placeholder="e.g. Engineered Solutions & Projects"
                                                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-foreground">Projects Hero Title [ID]</label>
                                            <input
                                                name="projectsHeroTitle_id"
                                                value={settings.projectsHeroTitle_id || ""}
                                                onChange={handleChange}
                                                placeholder="mis. Solusi & Proyek Terekayasa"
                                                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Projects Hero Subtitle [EN]</label>
                                        <textarea
                                            name="projectsHeroSubtitle"
                                            value={settings.projectsHeroSubtitle || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="A showcase of production network architectures..."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Projects Hero Subtitle [ID]</label>
                                        <textarea
                                            name="projectsHeroSubtitle_id"
                                            value={settings.projectsHeroSubtitle_id || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Koleksi arsitektur jaringan produksi, aplikasi web..."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-foreground">Bottom CTA Banner Title [EN]</label>
                                            <input
                                                name="projectsCtaTitle"
                                                value={settings.projectsCtaTitle || ""}
                                                onChange={handleChange}
                                                placeholder="e.g. Have an ambitious project in mind?"
                                                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-foreground">Bottom CTA Banner Title [ID]</label>
                                            <input
                                                name="projectsCtaTitle_id"
                                                value={settings.projectsCtaTitle_id || ""}
                                                onChange={handleChange}
                                                placeholder="mis. Punya proyek ambisius yang ingin dibangun?"
                                                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Bottom CTA Banner Subtitle [EN]</label>
                                        <textarea
                                            name="projectsCtaSubtitle"
                                            value={settings.projectsCtaSubtitle || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Whether you need high-availability network infrastructure..."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Bottom CTA Banner Subtitle [ID]</label>
                                        <textarea
                                            name="projectsCtaSubtitle_id"
                                            value={settings.projectsCtaSubtitle_id || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Baik Anda membutuhkan infrastruktur jaringan berkeandalan tinggi..."
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-foreground">Blog Hero Badge [EN]</label>
                                            <input
                                                name="blogHeroBadge"
                                                value={settings.blogHeroBadge || ""}
                                                onChange={handleChange}
                                                placeholder="e.g. Technical Publications & Notes"
                                                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-foreground">Blog Hero Badge [ID]</label>
                                            <input
                                                name="blogHeroBadge_id"
                                                value={settings.blogHeroBadge_id || ""}
                                                onChange={handleChange}
                                                placeholder="mis. Publikasi Teknis & Catatan"
                                                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-foreground">Blog Hero Title [EN]</label>
                                            <input
                                                name="blogHeroTitle"
                                                value={settings.blogHeroTitle || ""}
                                                onChange={handleChange}
                                                placeholder="e.g. Engineering Insights & Deep Dives"
                                                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-foreground">Blog Hero Title [ID]</label>
                                            <input
                                                name="blogHeroTitle_id"
                                                value={settings.blogHeroTitle_id || ""}
                                                onChange={handleChange}
                                                placeholder="mis. Wawasan Rekayasa & Ulasan Mendalam"
                                                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Blog Hero Subtitle [EN]</label>
                                        <textarea
                                            name="blogHeroSubtitle"
                                            value={settings.blogHeroSubtitle || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Architectural post-mortems, hands-on tutorials..."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Blog Hero Subtitle [ID]</label>
                                        <textarea
                                            name="blogHeroSubtitle_id"
                                            value={settings.blogHeroSubtitle_id || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Cetak biru arsitektur, tutorial praktis, dan prinsip..."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-foreground">Blog Newsletter Card Title [EN]</label>
                                            <input
                                                name="blogNewsletterTitle"
                                                value={settings.blogNewsletterTitle || ""}
                                                onChange={handleChange}
                                                placeholder="e.g. Stay Updated with Technical Insights"
                                                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-foreground">Blog Newsletter Card Title [ID]</label>
                                            <input
                                                name="blogNewsletterTitle_id"
                                                value={settings.blogNewsletterTitle_id || ""}
                                                onChange={handleChange}
                                                placeholder="mis. Tetap Terinformasi dengan Wawasan Teknis"
                                                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Blog Newsletter Card Description [EN]</label>
                                        <textarea
                                            name="blogNewsletterDesc"
                                            value={settings.blogNewsletterDesc || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Subscribe to receive notifications when new deep dives..."
                                            className="w-full px-3.5 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Blog Newsletter Card Description [ID]</label>
                                        <textarea
                                            name="blogNewsletterDesc_id"
                                            value={settings.blogNewsletterDesc_id || ""}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Berlangganan untuk menerima pemberitahuan saat ulasan mendalam baru diterbitkan..."
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

            {/* Media Library Picker Modal for CV */}
            <AnimatePresence>
                {isMediaModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-2xl rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between pb-3 border-b border-border">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                        <FolderOpen className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-foreground">Pilih File dari Media Library</h3>
                                        <p className="text-xs text-muted-foreground">Pilih file dokumen PDF untuk dijadikan Resume / CV aktif</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsMediaModalOpen(false)}
                                    className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Filters & Search */}
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={mediaSearch}
                                        onChange={(e) => setMediaSearch(e.target.value)}
                                        placeholder="Cari nama file..."
                                        className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div className="inline-flex p-1 rounded-xl bg-muted/60 border border-border/60 text-xs shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setMediaFilter("pdf")}
                                        className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                                            mediaFilter === "pdf" ? "bg-background text-primary shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        PDF Only
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMediaFilter("all")}
                                        className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                                            mediaFilter === "all" ? "bg-background text-primary shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        Semua File
                                    </button>
                                </div>
                            </div>

                            {/* File List / Content */}
                            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
                                {loadingMedia ? (
                                    <div className="h-48 flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        <span>Memuat media library...</span>
                                    </div>
                                ) : filteredCvMedia.length === 0 ? (
                                    <div className="h-48 flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs text-center p-4">
                                        <FileText className="h-8 w-8 text-muted-foreground/40" />
                                        <p className="font-semibold text-foreground">Tidak ada file yang cocok</p>
                                        <p className="text-[11px]">Coba ubah kata kunci pencarian atau upload file baru melalui tab &quot;Upload PDF&quot;.</p>
                                    </div>
                                ) : (
                                    filteredCvMedia.map((file) => {
                                        const isSelected = settings.resumeUrl === file.fileUrl;
                                        const isPdf = file.fileType === "pdf" || file.fileUrl?.toLowerCase().endsWith(".pdf");
                                        return (
                                            <div
                                                key={file._id}
                                                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                                    isSelected
                                                        ? "border-primary bg-primary/10 shadow-2xs"
                                                        : "border-border/70 bg-background hover:border-primary/40 hover:bg-muted/30"
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                        isPdf ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary"
                                                    }`}>
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-foreground truncate">{file.fileName}</p>
                                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                                                            <span className="uppercase font-semibold">{file.fileType}</span>
                                                            <span>•</span>
                                                            <span>{formatCvFileSize(file.fileSize)}</span>
                                                            <span>•</span>
                                                            <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <a
                                                        href={file.fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                                        title="Lihat Pratinjau File"
                                                    >
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSelectMediaCv(file.fileUrl)}
                                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                            isSelected
                                                                ? "bg-primary text-white shadow-xs"
                                                                : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
                                                        }`}
                                                    >
                                                        {isSelected ? "Terpilih" : "Pilih File"}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
                                <span className="text-muted-foreground text-[11px]">
                                    {filteredCvMedia.length} file ditemukan
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setIsMediaModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-border font-semibold hover:bg-muted transition-colors cursor-pointer"
                                >
                                    Tutup
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
