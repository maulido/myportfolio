"use client";

import { motion } from "framer-motion";
import { ArrowRight, Download } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";

const roles = [
    "Network Specialist",
    "Software Engineer",
    "Cloud Architect",
    "DevOps Engineer",
];

export function Hero() {
    const [text, setText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [isWorking, setIsWorking] = useState(true);
    const [activeRoles, setActiveRoles] = useState<string[]>(roles);
    const [heroTitle, setHeroTitle] = useState<string>("Digital Architect");
    const [heroSubtitle, setHeroSubtitle] = useState<string>("Building robust network infrastructures and scalable web applications with a focus on comprehensive digital solutions.");

    // Calculate greeting outside of useEffect to avoid setState in effect
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    }, []);

    useEffect(() => {
        // Fetch settings from API
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.data)) {
                    data.data.forEach((item: { key: string; value: unknown }) => {
                        if (item.key === 'isWorking' && item.value !== undefined) {
                            setIsWorking(Boolean(item.value));
                        }
                        if (item.key === 'heroTitle' && item.value) {
                            setHeroTitle(String(item.value));
                        }
                        if (item.key === 'heroSubtitle' && item.value) {
                            setHeroSubtitle(String(item.value));
                        }
                        if (item.key === 'heroRoles' && item.value) {
                            const parsed = String(item.value)
                                .split(',')
                                .map(r => r.trim())
                                .filter(Boolean);
                            if (parsed.length > 0) setActiveRoles(parsed);
                        }
                    });
                }
            })
            .catch(err => console.error("Failed to fetch settings in Hero", err));
    }, []);

    useEffect(() => {
        if (!activeRoles.length) return;
        const i = loopNum % activeRoles.length;
        const fullText = activeRoles[i] || "";

        let timer: NodeJS.Timeout;

        if (!isDeleting && text === fullText) {
            // Pause at the end before deleting
            timer = setTimeout(() => {
                setIsDeleting(true);
            }, 1800);
        } else if (isDeleting && text === "") {
            // Finished deleting, brief pause then proceed to next role
            timer = setTimeout(() => {
                setIsDeleting(false);
                setLoopNum((prev) => prev + 1);
            }, 250);
        } else {
            // Type or delete character
            const speed = isDeleting ? 35 : 100;
            timer = setTimeout(() => {
                setText((prev) =>
                    isDeleting
                        ? fullText.substring(0, prev.length - 1)
                        : fullText.substring(0, prev.length + 1)
                );
            }, speed);
        }

        return () => clearTimeout(timer);
    }, [text, isDeleting, loopNum, activeRoles]);

    return (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden py-20 pt-28">
            {/* Background Effects (Dark mode only: glowing neon ambience; Hidden in light mode to prevent glare) */}
            <div className="hidden dark:block absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse" />
            <div className="hidden dark:block absolute bottom-0 right-0 w-[800px] h-[600px] bg-accent/10 rounded-full blur-[100px] -z-10" />

            <div className="container px-4 md:px-6 z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                        <div className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-sm font-medium text-foreground/80 border border-border shadow-sm">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
                            {greeting}, I&apos;m a...
                        </div>
                        {isWorking && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold shadow-sm"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Available for New Projects
                            </motion.div>
                        )}
                    </div>
                    <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 sm:mb-8 leading-tight">
                        <span className="text-gradient block pb-2">{heroTitle}</span>
                        <span className="block h-[1.1em] text-foreground/90 min-h-[1.1em]">
                            {text}
                            <span className="animate-pulse text-primary font-light">|</span>
                        </span>
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mx-auto max-w-[700px] text-muted-foreground text-sm sm:text-base md:text-xl mb-6 sm:mb-8 leading-relaxed px-2"
                >
                    {heroSubtitle}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 sm:pt-6 w-full max-w-xs sm:max-w-none mx-auto"
                >
                    <Link href="/projects" className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-full bg-primary hover:bg-primary/90 text-white px-8 text-sm font-semibold shadow-md shadow-primary/20 transition-all hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                        View Work
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    <button
                        onClick={() => window.dispatchEvent(new Event("open-cv-modal"))}
                        className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-full border border-border bg-card hover:bg-muted text-foreground px-8 text-sm font-medium shadow-sm transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                        Download CV
                        <Download className="ml-2 h-4 w-4" />
                    </button>
                </motion.div>
            </div>
        </section>
    );
}
