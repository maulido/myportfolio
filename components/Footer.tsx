"use client";

import { useState } from "react";
import Link from "next/link";
import { 
    Github, 
    Linkedin, 
    Twitter, 
    Instagram, 
    Mail, 
    ArrowUp, 
    Send, 
    Loader2, 
    CheckCircle2, 
    AlertCircle, 
    Lock,
    MapPin,
    Radio
} from "lucide-react";
import { useSettings } from "@/lib/useSettings";
import { useLanguage } from "@/context/LanguageContext";

export function Footer({ settings: initialSettings }: { settings?: Record<string, string | undefined> }) {
    const { settings: clientSettings } = useSettings();
    const settings = { ...(initialSettings || {}), ...(clientSettings || {}) };
    const { locale, dictionary } = useLanguage();
    const t = dictionary.footer;
    const tNav = dictionary.nav;

    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [statusMessage, setStatusMessage] = useState("");

    const brandName = settings?.brandName || "Portfolio";
    const githubUrl = settings?.socialGithub || "https://github.com";
    const linkedinUrl = settings?.socialLinkedin || "https://linkedin.com";
    const twitterUrl = settings?.socialTwitter || "";
    const instagramUrl = settings?.socialInstagram || "";
    const rawEmail = settings?.contactEmail || "email@example.com";
    const contactEmail = rawEmail.replace(/^mailto:/i, "");
    const contactLocation = settings?.contactLocation || "Jakarta, Indonesia";
    const isWorking = settings?.isWorking !== "false";
    
    // Dynamic localization fallback for tagline, copyright, and newsletter
    const footerTagline = (locale === "id" && (!settings?.footerTagline || settings?.footerTagline.includes("Digital Architect specializing")))
        ? t.tagline
        : (settings?.footerTagline || t.tagline);

    const copyrightText = settings?.copyrightText || t.rights;

    const newsletterTitle = (locale === "id" && (!settings?.footerNewsletterTitle || settings?.footerNewsletterTitle === "Engineering Dispatch"))
        ? t.newsletterTitle
        : (settings?.footerNewsletterTitle || t.newsletterTitle);

    const newsletterSubtitle = (locale === "id" && (!settings?.footerNewsletterSubtitle || settings?.footerNewsletterSubtitle.includes("Subscribe for occasional updates")))
        ? t.newsletterSubtitle
        : (settings?.footerNewsletterSubtitle || t.newsletterSubtitle);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setStatus("loading");
        setStatusMessage("");
        try {
            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setStatus("success");
                setStatusMessage(t.newsletterSuccess);
                setEmail("");
            } else {
                setStatus("error");
                setStatusMessage(data.error || (locale === "id" ? "Gagal berlangganan. Silakan coba lagi." : "Subscription failed. Please try again."));
            }
        } catch {
            setStatus("error");
            setStatusMessage(locale === "id" ? "Kesalahan transmisi. Silakan coba lagi nanti." : "Transmission error. Please try again later.");
        }
    };

    const scrollToTop = () => {
        if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const navigationLinks = [
        { label: tNav.home, href: "/" },
        { label: tNav.about, href: "/about" },
        { label: tNav.projects, href: "/projects" },
        { label: tNav.certifications, href: "/certifications" },
        { label: tNav.blog, href: "/blog" },
    ];

    const interactiveLinks = [
        { label: tNav.gallery, href: "/gallery" },
        { label: tNav.uses, href: "/uses" },
        { label: tNav.guestbook, href: "/guestbook" },
        { label: tNav.contact, href: "/contact" },
    ];

    return (
        <footer className="relative border-t border-border bg-card/60 dark:bg-[#030712] overflow-hidden pt-16 pb-12">
            {/* Subtle Gradient Glow Ambiance */}
            <div className="hidden dark:block absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent pointer-events-none" />
            <div className="hidden dark:block absolute top-0 left-1/2 -translate-x-1/2 w-full h-[180px] bg-primary/5 blur-[120px] pointer-events-none -z-10" />

            <div className="container mx-auto px-4 md:px-6">
                {/* Main 4-Column Grid Layout */}
                <div className="grid gap-10 md:gap-12 lg:grid-cols-12 pb-14 border-b border-border/70 dark:border-white/5">
                    {/* Col 1: Brand & System Status (4 Cols) */}
                    <div className="lg:col-span-4 space-y-4">
                        <Link href="/" className="inline-block group">
                            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors">
                                <span className="text-gradient">{brandName}</span>
                            </span>
                        </Link>
                        <p suppressHydrationWarning className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm">
                            {footerTagline}
                        </p>

                        {/* Location & Live Availability Badge */}
                        <div className="pt-2 space-y-2.5">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span suppressHydrationWarning>{locale === "id" ? `Berbasis di ${contactLocation}` : `Based in ${contactLocation}`}</span>
                            </div>
                            {isWorking && (
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <span suppressHydrationWarning>{t.statusAvailable}</span>
                                </div>
                            )}
                        </div>

                        {/* Social Icons Strip */}
                        <div className="pt-2 flex items-center gap-2.5 flex-wrap">
                            {githubUrl && (
                                <a
                                    href={githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 rounded-xl border border-border/80 bg-background/50 hover:bg-muted dark:hover:bg-white/10 text-muted-foreground hover:text-primary hover:border-primary/40 transition-all shadow-xs"
                                    aria-label="GitHub Profile"
                                >
                                    <Github className="h-4 w-4" />
                                </a>
                            )}
                            {linkedinUrl && (
                                <a
                                    href={linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 rounded-xl border border-border/80 bg-background/50 hover:bg-muted dark:hover:bg-white/10 text-muted-foreground hover:text-primary hover:border-primary/40 transition-all shadow-xs"
                                    aria-label="LinkedIn Profile"
                                >
                                    <Linkedin className="h-4 w-4" />
                                </a>
                            )}
                            {twitterUrl && (
                                <a
                                    href={twitterUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 rounded-xl border border-border/80 bg-background/50 hover:bg-muted dark:hover:bg-white/10 text-muted-foreground hover:text-primary hover:border-primary/40 transition-all shadow-xs"
                                    aria-label="Twitter/X Profile"
                                >
                                    <Twitter className="h-4 w-4" />
                                </a>
                            )}
                            {instagramUrl && (
                                <a
                                    href={instagramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 rounded-xl border border-border/80 bg-background/50 hover:bg-muted dark:hover:bg-white/10 text-muted-foreground hover:text-primary hover:border-primary/40 transition-all shadow-xs"
                                    aria-label="Instagram Profile"
                                >
                                    <Instagram className="h-4 w-4" />
                                </a>
                            )}
                            {contactEmail && (
                                <a
                                    href={`mailto:${contactEmail}`}
                                    className="p-2.5 rounded-xl border border-border/80 bg-background/50 hover:bg-muted dark:hover:bg-white/10 text-muted-foreground hover:text-primary hover:border-primary/40 transition-all shadow-xs"
                                    aria-label="Email Direct"
                                >
                                    <Mail className="h-4 w-4" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Col 2: Navigation Links (2.5 Cols) */}
                    <div className="lg:col-span-2 space-y-3">
                        <p suppressHydrationWarning className="text-[11px] font-mono uppercase tracking-widest text-foreground/80 font-bold">
                            {locale === "id" ? "Navigasi" : "Navigation"}
                        </p>
                        <ul className="space-y-2 text-xs sm:text-sm">
                            {navigationLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                                    >
                                        <span className="h-1 w-1 rounded-full bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span suppressHydrationWarning>{link.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Col 3: Interactive & Resources (2.5 Cols) */}
                    <div className="lg:col-span-2 space-y-3">
                        <p suppressHydrationWarning className="text-[11px] font-mono uppercase tracking-widest text-foreground/80 font-bold">
                            {locale === "id" ? "Sumber Daya" : "Resources"}
                        </p>
                        <ul className="space-y-2 text-xs sm:text-sm">
                            {interactiveLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                                    >
                                        <span className="h-1 w-1 rounded-full bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span suppressHydrationWarning>{link.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Col 4: Newsletter & Quick Subscription (3.5 Cols) */}
                    <div className="lg:col-span-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <Radio className="h-3.5 w-3.5 text-primary animate-pulse" />
                            <p suppressHydrationWarning className="text-[11px] font-mono uppercase tracking-widest text-foreground/80 font-bold">
                                {newsletterTitle}
                            </p>
                        </div>
                        <p suppressHydrationWarning className="text-xs text-muted-foreground leading-relaxed">
                            {newsletterSubtitle}
                        </p>

                        <form onSubmit={handleSubscribe} className="space-y-2 pt-1">
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder={t.newsletterPlaceholder}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-border/80 dark:border-white/10 bg-background/80 focus:bg-background text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all disabled:opacity-50"
                                    disabled={status === "loading" || status === "success"}
                                />
                                <button
                                    type="submit"
                                    disabled={status === "loading" || status === "success"}
                                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md shadow-primary/25 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
                                >
                                    {status === "loading" ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Send className="h-3.5 w-3.5" />
                                    )}
                                    <span suppressHydrationWarning className="hidden sm:inline">{status === "loading" ? t.newsletterSubscribing : (locale === "id" ? "Gabung" : "Join")}</span>
                                </button>
                            </div>

                            {status === "success" && (
                                <p className="text-xs text-emerald-500 font-medium inline-flex items-center gap-1">
                                    <CheckCircle2 className="h-3.5 w-3.5" /> {statusMessage}
                                </p>
                            )}
                            {status === "error" && (
                                <p className="text-xs text-red-500 font-medium inline-flex items-center gap-1">
                                    <AlertCircle className="h-3.5 w-3.5" /> {statusMessage}
                                </p>
                            )}
                        </form>
                    </div>
                </div>

                {/* Bottom Bar: Copyright, Tech Specs, Admin, Back to Top */}
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1">
                        <span suppressHydrationWarning>
                            &copy; {new Date().getFullYear()} <span className="font-semibold text-foreground">{brandName}</span>. {copyrightText}
                        </span>
                        <span className="hidden sm:inline text-muted-foreground/40">•</span>
                        <span>Next.js 16 &amp; TypeScript</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/70 hover:text-primary transition-colors group"
                            title="Admin Portal Login"
                        >
                            <Lock className="h-3 w-3 group-hover:scale-110 transition-transform" />
                            <span>Portal</span>
                        </Link>

                        <button
                            type="button"
                            onClick={scrollToTop}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-background/60 hover:bg-muted dark:hover:bg-white/10 text-foreground/80 hover:text-primary transition-all text-xs font-semibold shadow-2xs group cursor-pointer"
                            aria-label="Scroll back to top"
                        >
                            <span suppressHydrationWarning>{locale === "id" ? "Atas" : "Top"}</span>
                            <ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
