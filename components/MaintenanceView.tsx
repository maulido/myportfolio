"use client";

import { useLanguage } from "@/context/LanguageContext";
import { GlobalSettings } from "@/lib/settings";
import { motion } from "framer-motion";
import {
    Wrench,
    Clock,
    Mail,
    Lock,
    RefreshCw,
    ShieldAlert,
    Server,
    Globe,
    ExternalLink
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface MaintenanceViewProps {
    settings?: GlobalSettings;
}

export default function MaintenanceView({ settings = {} }: MaintenanceViewProps) {
    const { locale, toggleLocale, mounted } = useLanguage();
    const isId = mounted && locale === "id";
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        if (typeof window !== "undefined") {
            window.location.reload();
        }
    };

    // Bilingual content resolutions
    const title = isId
        ? (settings.maintenanceTitle_id || settings.maintenanceTitle || "Situs Sedang Dalam Pemeliharaan Berkala")
        : (settings.maintenanceTitle || "Scheduled Infrastructure Maintenance");

    const message = isId
        ? (settings.maintenanceMessage_id || settings.maintenanceMessage || "Kami sedang melakukan optimalisasi infrastruktur, peningkatan server, dan pembaruan keamanan. Seluruh layanan akan segera kembali normal.")
        : (settings.maintenanceMessage || "We are currently conducting routine performance tuning, server optimization, and security updates. All services will be restored shortly.");

    const expectedEnd = isId
        ? (settings.maintenanceExpectedEnd_id || settings.maintenanceExpectedEnd || "Dalam beberapa jam")
        : (settings.maintenanceExpectedEnd || "Within a few hours");

    const email = settings.contactEmail || "contact@example.com";
    const whatsapp = settings.whatsappNumber;
    const github = settings.socialGithub;
    const linkedin = settings.socialLinkedin;

    return (
        <div className="relative min-h-screen w-full flex flex-col justify-between items-center bg-background text-foreground px-4 py-8 overflow-hidden select-none">
            {/* Background Ambient Glows & Grid */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/10 via-primary/10 to-transparent rounded-full blur-3xl opacity-70" />
                <div className="absolute bottom-10 left-1/3 w-[450px] h-[450px] bg-gradient-to-br from-indigo-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl opacity-50" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />
            </div>

            {/* Top Bar: Brand & Language Switcher */}
            <header className="w-full max-w-4xl flex items-center justify-between pb-6 z-10">
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        <Server className="h-4 w-4" />
                    </div>
                    <span className="font-bold tracking-tight text-sm sm:text-base">
                        {settings.brandName || "Portfolio"} <span className="text-primary font-mono text-xs">/OPS</span>
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleLocale}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-muted/80 hover:bg-muted border border-border/80 transition-colors cursor-pointer shadow-xs"
                        title={isId ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
                    >
                        <Globe className="h-3.5 w-3.5 text-primary" />
                        <span>{isId ? "ID" : "EN"}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">| {isId ? "EN" : "ID"}</span>
                    </button>
                </div>
            </header>

            {/* Main Interactive Hero Card */}
            <main className="w-full max-w-2xl my-auto z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="relative rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 sm:p-10 shadow-2xl overflow-hidden"
                >
                    {/* Pulsing Accent Border */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-80" />

                    {/* Status Badge */}
                    <div className="flex justify-center mb-6">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold tracking-wide">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                            </span>
                            <span>{isId ? "PEMELIHARAAN SISTEM AKTIF" : "SYSTEM MAINTENANCE IN PROGRESS"}</span>
                        </div>
                    </div>

                    {/* Animated Server / Wrench Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <motion.div
                                animate={{ rotate: [0, 8, -8, 0] }}
                                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                                className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-primary/20 to-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10"
                            >
                                <Wrench className="h-10 w-10 text-amber-500" />
                            </motion.div>
                            <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-background border border-border flex items-center justify-center shadow-md">
                                <ShieldAlert className="h-4 w-4 text-primary" />
                            </div>
                        </div>
                    </div>

                    {/* Headline & Explanation */}
                    <div className="text-center space-y-3 mb-8">
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                            {title}
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg mx-auto">
                            {message}
                        </p>
                    </div>

                    {/* Estimated Recovery & Diagnostics Info */}
                    <div className="grid gap-3 sm:grid-cols-2 mb-8">
                        <div className="p-3.5 rounded-2xl bg-background/50 border border-border/80 flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                                <Clock className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                    {isId ? "Estimasi Selesai" : "Estimated Return"}
                                </div>
                                <div className="text-xs sm:text-sm font-bold text-foreground truncate">
                                    {expectedEnd}
                                </div>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-background/50 border border-border/80 flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                                <Server className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                    {isId ? "Integritas Data" : "Data & State"}
                                </div>
                                <div className="text-xs sm:text-sm font-bold text-emerald-500 truncate">
                                    {isId ? "100% Aman & Terlindungi" : "100% Safe & Secure"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact Channels */}
                    <div className="space-y-3 pt-2 border-t border-border/60">
                        <div className="text-center text-xs font-semibold text-muted-foreground">
                            {isId ? "Perlu komunikasi mendesak? Hubungi saluran langsung:" : "Urgent inquiry? Reach out via direct channels:"}
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {email && (
                                <a
                                    href={`mailto:${email}?subject=Urgent%20Inquiry%20(Maintenance)`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-all border border-border shadow-xs"
                                >
                                    <Mail className="h-3.5 w-3.5 text-primary" />
                                    <span>Email</span>
                                </a>
                            )}
                            {whatsapp && (
                                <a
                                    href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-all border border-emerald-500/30 shadow-xs"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    <span>WhatsApp</span>
                                </a>
                            )}
                            {linkedin && (
                                <a
                                    href={linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-all border border-blue-500/30 shadow-xs"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    <span>LinkedIn</span>
                                </a>
                            )}
                            {github && (
                                <a
                                    href={github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-all border border-border shadow-xs"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    <span>GitHub</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Refresh Button */}
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-md shadow-primary/25 active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                            <span>{isId ? "Muat Ulang Halaman" : "Check System Status"}</span>
                        </button>
                    </div>
                </motion.div>
            </main>

            {/* Bottom Footer with Discrete Admin Login Gateway */}
            <footer className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 text-xs text-muted-foreground border-t border-border/40 z-10">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>HTTP 503 Service Unavailable • Automatic retry configured</span>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/80 hover:text-foreground transition-colors hover:underline"
                    >
                        <Lock className="h-3 w-3" />
                        <span>{isId ? "Akses Administrator" : "Admin Portal"}</span>
                    </Link>
                </div>
            </footer>
        </div>
    );
}
