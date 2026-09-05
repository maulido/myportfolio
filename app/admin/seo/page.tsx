"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
    Search, 
    Globe, 
    Share2, 
    ExternalLink, 
    CheckCircle2, 
    Copy, 
    Check, 
    Laptop, 
    Smartphone, 
    Sparkles, 
    Settings as SettingsIcon,
    FileCode,
    Bot
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useSettings } from "@/lib/useSettings";

type PageKey = "home" | "about" | "projects" | "blog" | "contact" | "uses" | "certifications";

export default function AdminSeoPage() {
    const { settings } = useSettings();
    const [selectedPage, setSelectedPage] = useState<PageKey>("home");
    const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    // Sitemap & Robots live state
    const [sitemapRoutes, setSitemapRoutes] = useState<Array<{ url: string; priority: string; changefreq: string }>>([]);
    const [robotsText, setRobotsText] = useState("");

    const siteDomain = typeof window !== "undefined" ? window.location.host : "maulido.dev";
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://maulido.dev";

    const brandName = settings.brandName || "Maulido";

    // Resolved Metadata for each page
    const pageMetadata = useMemo(() => {
        const pages: Record<PageKey, {
            name: string;
            path: string;
            title: string;
            description: string;
            ogImage: string;
            canonical: string;
        }> = {
            home: {
                name: "Home Page",
                path: "/",
                title: settings.siteTitle || `${brandName} | Network & Software Engineer Portfolio`,
                description: settings.siteDescription || "Explore the portfolio of a dedicated Network and Software Engineer specializing in modern web apps and robust network solutions.",
                ogImage: `${baseUrl}/opengraph-image`,
                canonical: `${baseUrl}/`
            },
            about: {
                name: "About Page",
                path: "/about",
                title: `About Me | ${brandName} - Network & Software Engineer`,
                description: settings.aboutHeroSubtitle || "Detailed professional biography, engineering philosophy, technical stack breakdown, and educational credentials.",
                ogImage: `${baseUrl}/opengraph-image`,
                canonical: `${baseUrl}/about`
            },
            projects: {
                name: "Projects Archive",
                path: "/projects",
                title: `Engineering Projects | ${brandName}`,
                description: settings.projectsHeroSubtitle || "Explore enterprise network topologies, full-stack web applications, open-source utilities, and infrastructure automations.",
                ogImage: `${baseUrl}/opengraph-image`,
                canonical: `${baseUrl}/projects`
            },
            blog: {
                name: "Technical Blog",
                path: "/blog",
                title: `Technical Publications & Notes | ${brandName}`,
                description: settings.blogHeroSubtitle || "Architectural post-mortems, hands-on tutorials, and engineering principles across networking and modern web development.",
                ogImage: `${baseUrl}/opengraph-image`,
                canonical: `${baseUrl}/blog`
            },
            contact: {
                name: "Contact & Advisory",
                path: "/contact",
                title: `Contact & Technical Advisory | ${brandName}`,
                description: settings.contactHeroSubtitle || "Have an engineering challenge, architectural consultation, or a collaborative project in mind? Reach out directly.",
                ogImage: `${baseUrl}/opengraph-image`,
                canonical: `${baseUrl}/contact`
            },
            uses: {
                name: "Uses & Setup",
                path: "/uses",
                title: `Uses & Equipment Setup | ${brandName}`,
                description: settings.usesHeroSubtitle || "A comprehensive catalog of hardware, developer software, and desk gear that power my daily engineering workflow.",
                ogImage: `${baseUrl}/opengraph-image`,
                canonical: `${baseUrl}/uses`
            },
            certifications: {
                name: "Certifications",
                path: "/certifications",
                title: `Licenses & Certifications | ${brandName}`,
                description: settings.certificationsHeroSubtitle || "Validated technical competencies across network administration, software engineering, and cloud platforms.",
                ogImage: `${baseUrl}/opengraph-image`,
                canonical: `${baseUrl}/certifications`
            }
        };

        return pages[selectedPage];
    }, [selectedPage, settings, brandName, baseUrl]);

    // Live fetch sitemap and robots
    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                const sitemapRes = await fetch("/sitemap.xml");
                const sitemapText = await sitemapRes.text();
                const urlMatches = sitemapText.match(/<url>([\s\S]*?)<\/url>/g) || [];
                const parsed = urlMatches.slice(0, 15).map(u => {
                    const loc = u.match(/<loc>(.*?)<\/loc>/)?.[1] || "";
                    const priority = u.match(/<priority>(.*?)<\/priority>/)?.[1] || "0.8";
                    const changefreq = u.match(/<changefreq>(.*?)<\/changefreq>/)?.[1] || "monthly";
                    return { url: loc, priority, changefreq };
                });
                if (isMounted) {
                    setSitemapRoutes(parsed);
                }
            } catch {
                console.error("Failed to parse sitemap");
            }

            try {
                const robotsRes = await fetch("/robots.txt");
                const text = await robotsRes.text();
                if (isMounted) {
                    setRobotsText(text);
                }
            } catch {
                console.error("Failed to fetch robots.txt");
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    const copyTag = (code: string, label: string) => {
        navigator.clipboard.writeText(code);
        setCopiedKey(label);
        toast.success(`${label} copied to clipboard!`);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    // Character length meters
    const titleLen = pageMetadata.title.length;
    const descLen = pageMetadata.description.length;

    const titleStatus = titleLen >= 40 && titleLen <= 65 ? "optimal" : titleLen > 65 ? "overflow" : "short";
    const descStatus = descLen >= 110 && descLen <= 165 ? "optimal" : descLen > 165 ? "overflow" : "short";

    return (
        <div className="space-y-8">
            <Toaster position="top-right" />

            {/* Top Title & Links */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                        <Globe className="h-7 w-7 text-primary" />
                        <span>SEO & Social Share Simulator</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Inspect real-time Google search snippets, OpenGraph cards, Twitter cards, and sitemap health.
                    </p>
                </div>
                <Link
                    href="/admin/settings"
                    className="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-bold transition-all shadow-md shadow-primary/25"
                >
                    <SettingsIcon className="h-4 w-4" />
                    <span>Edit Meta in Settings</span>
                </Link>
            </div>

            {/* Page Selector Tabs */}
            <div className="p-4 rounded-2xl bg-card/70 backdrop-blur-md border border-border space-y-3 shadow-sm">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Page to Audit & Simulate</p>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {[
                        { key: "home", label: "Home (/)" },
                        { key: "about", label: "About (/about)" },
                        { key: "projects", label: "Projects (/projects)" },
                        { key: "blog", label: "Blog (/blog)" },
                        { key: "contact", label: "Contact (/contact)" },
                        { key: "uses", label: "Uses (/uses)" },
                        { key: "certifications", label: "Certifications (/certifications)" }
                    ].map((p) => {
                        const isSelected = selectedPage === p.key;
                        return (
                            <button
                                key={p.key}
                                type="button"
                                onClick={() => setSelectedPage(p.key as PageKey)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                                    isSelected
                                        ? "bg-primary text-white border-primary shadow-sm shadow-primary/25"
                                        : "bg-background/80 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                                }`}
                            >
                                {p.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Dual Grid: Simulators (8 cols) & Character Meter / Meta Audit (4 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Visual Social & Search Previews (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* 1. Google SERP Simulator Card */}
                    <div className="p-6 rounded-3xl bg-card/80 backdrop-blur-md border border-border shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                                    <Search className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-foreground">Google Search Result (SERP)</h3>
                                    <p className="text-[11px] text-muted-foreground">Organic search snippet simulation</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border">
                                <button
                                    onClick={() => setPreviewDevice("desktop")}
                                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                                        previewDevice === "desktop" ? "bg-card text-foreground font-bold shadow-sm" : "text-muted-foreground"
                                    }`}
                                    title="Desktop View"
                                >
                                    <Laptop className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setPreviewDevice("mobile")}
                                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                                        previewDevice === "mobile" ? "bg-card text-foreground font-bold shadow-sm" : "text-muted-foreground"
                                    }`}
                                    title="Mobile View"
                                >
                                    <Smartphone className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Google Result Preview Box */}
                        <div className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1f1f1f] border border-border/80 shadow-sm transition-all ${
                            previewDevice === "mobile" ? "max-w-md mx-auto" : "w-full"
                        }`}>
                            {/* Breadcrumb / URL */}
                            <div className="flex items-center gap-2 mb-1.5">
                                <div className="h-4 w-4 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                                    M
                                </div>
                                <div className="flex items-center gap-1 text-[12px] text-[#4d5156] dark:text-[#bdc1c6] font-sans truncate">
                                    <span className="font-medium">{siteDomain}</span>
                                    <span>›</span>
                                    <span>{selectedPage === "home" ? "home" : selectedPage}</span>
                                </div>
                            </div>

                            {/* Title */}
                            <h4 className="text-base sm:text-lg font-normal text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-snug truncate">
                                {pageMetadata.title}
                            </h4>

                            {/* Snippet Description */}
                            <p className="text-xs sm:text-[13px] text-[#4d5156] dark:text-[#bdc1c6] mt-1.5 leading-relaxed line-clamp-2">
                                {pageMetadata.description}
                            </p>
                        </div>
                    </div>

                    {/* 2. Twitter / X Large Card Preview */}
                    <div className="p-6 rounded-3xl bg-card/80 backdrop-blur-md border border-border shadow-sm space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
                                <Share2 className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-foreground">Twitter / X Summary Large Card</h3>
                                <p className="text-[11px] text-muted-foreground">Preview when shared in tweets, DMs, or threads</p>
                            </div>
                        </div>

                        <div className="max-w-xl mx-auto rounded-2xl border border-border overflow-hidden bg-card/60 shadow-sm">
                            <div className="relative w-full h-52 sm:h-64 bg-slate-900 flex items-center justify-center overflow-hidden border-b border-border">
                                <Image
                                    src="/og-image.png"
                                    alt="Twitter Card Preview"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                <span className="absolute bottom-3 left-4 text-xs font-mono font-bold text-white/90 bg-black/60 px-2 py-0.5 rounded">
                                    1200 × 630 px
                                </span>
                            </div>
                            <div className="p-4 space-y-1">
                                <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">{siteDomain}</p>
                                <h4 className="font-bold text-sm sm:text-base text-foreground truncate">{pageMetadata.title}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{pageMetadata.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* 3. LinkedIn & WhatsApp OpenGraph Card Preview */}
                    <div className="p-6 rounded-3xl bg-card/80 backdrop-blur-md border border-border shadow-sm space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-600">
                                <Globe className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-foreground">LinkedIn & Messaging OpenGraph Preview</h3>
                                <p className="text-[11px] text-muted-foreground">Preview when shared on LinkedIn feed or WhatsApp chat bubble</p>
                            </div>
                        </div>

                        <div className="max-w-xl mx-auto rounded-2xl border border-border overflow-hidden bg-card/60 shadow-sm">
                            <div className="relative w-full h-48 bg-slate-900 overflow-hidden border-b border-border">
                                <Image
                                    src="/og-image.png"
                                    alt="OpenGraph Preview"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="p-4 space-y-1 bg-muted/20">
                                <h4 className="font-bold text-sm text-foreground truncate">{pageMetadata.title}</h4>
                                <p className="text-xs text-muted-foreground font-mono">{siteDomain}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: SEO Quality Meters & Direct Code Audit (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Character Limits & Health Metrics */}
                    <div className="p-6 rounded-3xl bg-card/80 backdrop-blur-md border border-border shadow-sm space-y-6">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <h3 className="font-bold text-sm text-foreground">Snippet Quality Score</h3>
                        </div>

                        {/* Title Length Meter */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-foreground">Title Length</span>
                                <span className={`font-mono font-bold ${
                                    titleStatus === "optimal" ? "text-emerald-500" : titleStatus === "overflow" ? "text-red-500" : "text-amber-500"
                                }`}>
                                    {titleLen} / 60 chars
                                </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${
                                        titleStatus === "optimal" ? "bg-emerald-500" : titleStatus === "overflow" ? "bg-red-500" : "bg-amber-500"
                                    }`}
                                    style={{ width: `${Math.min(100, (titleLen / 60) * 100)}%` }}
                                />
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                {titleStatus === "optimal" && "Optimal length for full visibility on search engines."}
                                {titleStatus === "overflow" && "Title may be truncated with ellipsis (...) on desktop SERPs."}
                                {titleStatus === "short" && "Title could be expanded with secondary keywords."}
                            </p>
                        </div>

                        {/* Description Length Meter */}
                        <div className="space-y-2 pt-3 border-t border-border/60">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-foreground">Description Length</span>
                                <span className={`font-mono font-bold ${
                                    descStatus === "optimal" ? "text-emerald-500" : descStatus === "overflow" ? "text-red-500" : "text-amber-500"
                                }`}>
                                    {descLen} / 160 chars
                                </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${
                                        descStatus === "optimal" ? "bg-emerald-500" : descStatus === "overflow" ? "bg-red-500" : "bg-amber-500"
                                    }`}
                                    style={{ width: `${Math.min(100, (descLen / 160) * 100)}%` }}
                                />
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                {descStatus === "optimal" && "Ideal meta description length for CTR optimization."}
                                {descStatus === "overflow" && "Description exceeds 160 chars and will be clipped by search engines."}
                                {descStatus === "short" && "Description is concise; consider adding actionable value."}
                            </p>
                        </div>

                        {/* Canonical & Robot Directives */}
                        <div className="pt-3 border-t border-border/60 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Indexing Directive:</span>
                                <span className="font-semibold text-emerald-500 flex items-center gap-1">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    <span>index, follow</span>
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Canonical URL:</span>
                                <span className="font-mono text-xs text-foreground truncate max-w-[170px]" title={pageMetadata.canonical}>
                                    {pageMetadata.path}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Meta Tags Quick Copy */}
                    <div className="p-6 rounded-3xl bg-card/80 backdrop-blur-md border border-border shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileCode className="h-4 w-4 text-primary" />
                                <h3 className="font-bold text-sm text-foreground">Generated HTML Tags</h3>
                            </div>
                        </div>

                        <div className="space-y-2.5 font-mono text-[11px]">
                            <div className="p-2.5 rounded-xl bg-background border border-border flex items-center justify-between gap-2">
                                <span className="truncate text-muted-foreground">{'<title>'}{pageMetadata.title}{'</title>'}</span>
                                <button
                                    onClick={() => copyTag(`<title>${pageMetadata.title}</title>`, "Title Tag")}
                                    className="p-1 text-muted-foreground hover:text-primary shrink-0"
                                    title="Copy"
                                >
                                    {copiedKey === "Title Tag" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                            </div>

                            <div className="p-2.5 rounded-xl bg-background border border-border flex items-center justify-between gap-2">
                                <span className="truncate text-muted-foreground">{'<meta name="description" content="..." />'}</span>
                                <button
                                    onClick={() => copyTag(`<meta name="description" content="${pageMetadata.description}" />`, "Meta Description")}
                                    className="p-1 text-muted-foreground hover:text-primary shrink-0"
                                    title="Copy"
                                >
                                    {copiedKey === "Meta Description" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                            </div>

                            <div className="p-2.5 rounded-xl bg-background border border-border flex items-center justify-between gap-2">
                                <span className="truncate text-muted-foreground">{'<meta property="og:title" content="..." />'}</span>
                                <button
                                    onClick={() => copyTag(`<meta property="og:title" content="${pageMetadata.title}" />`, "OG Title")}
                                    className="p-1 text-muted-foreground hover:text-primary shrink-0"
                                    title="Copy"
                                >
                                    {copiedKey === "OG Title" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Sitemap & Robots Live Inspection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sitemap Inspector */}
                <div className="p-6 rounded-3xl bg-card/80 backdrop-blur-md border border-border shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                                <FileCode className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-foreground">Sitemap.xml Live Inspector</h3>
                                <p className="text-[11px] text-muted-foreground">{sitemapRoutes.length} indexed URLs discovered</p>
                            </div>
                        </div>
                        <a
                            href="/sitemap.xml"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                            <span>Open XML</span>
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-2 pr-1 text-xs">
                        {sitemapRoutes.map((route, idx) => (
                            <div key={idx} className="p-2.5 rounded-xl bg-background/60 border border-border/70 flex items-center justify-between">
                                <span className="font-mono text-foreground truncate max-w-[280px]" title={route.url}>
                                    {route.url.replace(/^https?:\/\/[^\/]+/, "") || "/"}
                                </span>
                                <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground shrink-0">
                                    <span className="px-1.5 py-0.5 rounded bg-muted">p:{route.priority}</span>
                                    <span>{route.changefreq}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Robots.txt Inspector */}
                <div className="p-6 rounded-3xl bg-card/80 backdrop-blur-md border border-border shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                                <Bot className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-foreground">Robots.txt Crawler Rules</h3>
                                <p className="text-[11px] text-muted-foreground">Search crawler directives & security filters</p>
                            </div>
                        </div>
                        <a
                            href="/robots.txt"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                            <span>Open Raw</span>
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>

                    <div className="p-4 rounded-xl bg-background font-mono text-xs text-muted-foreground leading-relaxed border border-border whitespace-pre-wrap">
                        {robotsText || "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: https://maulido.dev/sitemap.xml"}
                    </div>
                </div>
            </div>
        </div>
    );
}
