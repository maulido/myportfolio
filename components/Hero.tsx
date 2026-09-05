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
    const [heroGreetingPrefix, setHeroGreetingPrefix] = useState<string>("I'm a...");
    const [heroAvailableText, setHeroAvailableText] = useState<string>("Available for New Projects");
    const [heroPrimaryCtaText, setHeroPrimaryCtaText] = useState<string>("View Work");
    const [heroPrimaryCtaLink, setHeroPrimaryCtaLink] = useState<string>("/projects");
    const [heroSecondaryCtaText, setHeroSecondaryCtaText] = useState<string>("Download CV");
    const [activeTechTags, setActiveTechTags] = useState<string[]>([
        "Next.js 16",
        "React 19",
        "TypeScript",
        "Tailwind CSS",
        "Docker",
        "Cloud Networks",
        "Python",
        "MongoDB",
    ]);

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
                            setIsWorking(item.value === true || item.value === 'true');
                        }
                        if (item.key === 'heroTitle' && item.value) {
                            setHeroTitle(String(item.value));
                        }
                        if (item.key === 'heroSubtitle' && item.value) {
                            setHeroSubtitle(String(item.value));
                        }
                        if (item.key === 'heroGreetingPrefix' && item.value) {
                            setHeroGreetingPrefix(String(item.value));
                        }
                        if (item.key === 'heroAvailableText' && item.value) {
                            setHeroAvailableText(String(item.value));
                        }
                        if (item.key === 'heroPrimaryCtaText' && item.value) {
                            setHeroPrimaryCtaText(String(item.value));
                        }
                        if (item.key === 'heroPrimaryCtaLink' && item.value) {
                            setHeroPrimaryCtaLink(String(item.value));
                        }
                        if (item.key === 'heroSecondaryCtaText' && item.value) {
                            setHeroSecondaryCtaText(String(item.value));
                        }
                        if (item.key === 'heroRoles' && item.value) {
                            const parsed = String(item.value)
                                .split(',')
                                .map(r => r.trim())
                                .filter(Boolean);
                            if (parsed.length > 0) setActiveRoles(parsed);
                        }
                        if (item.key === 'heroTechTags' && item.value) {
                            const parsed = String(item.value)
                                .split(',')
                                .map(t => t.trim())
                                .filter(Boolean);
                            if (parsed.length > 0) setActiveTechTags(parsed);
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
            {/* Subtle Tech Grid Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_45%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

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
                            {greeting}, {heroGreetingPrefix}
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
                                {heroAvailableText}
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
                    <Link href={heroPrimaryCtaLink} className="group w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-full bg-primary hover:bg-primary/90 text-white px-8 text-sm font-semibold shadow-md shadow-primary/20 transition-all hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                        {heroPrimaryCtaText}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                    <button
                        onClick={() => window.dispatchEvent(new Event("open-cv-modal"))}
                        className="group w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-full border border-border bg-card hover:bg-muted text-foreground px-8 text-sm font-medium shadow-sm transition-all hover:border-primary/50 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                        {heroSecondaryCtaText}
                        <Download className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
                    </button>
                </motion.div>

                {/* Core Tech Stack Showcase Strip */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mt-10 sm:mt-14 pt-6 border-t border-border/40 max-w-2xl mx-auto"
                >
                    <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-muted-foreground/70 mb-3">
                        Core Technologies & Frameworks
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {activeTechTags.map((tech) => (
                            <span
                                key={tech}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-card/80 dark:bg-card/40 border border-border/70 dark:border-primary/20 text-foreground/80 hover:text-primary hover:border-primary/50 hover:scale-105 transition-all duration-200 shadow-2xs cursor-default select-none backdrop-blur-xs"
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-primary/70 mr-2" />
                                {tech}
                            </span>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Floating Scroll-down Indicator */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
            >
                <a
                    href="#about"
                    className="group flex flex-col items-center gap-2 text-xs font-medium text-muted-foreground/70 hover:text-primary transition-colors focus:outline-none"
                    aria-label="Scroll to About section"
                >
                    <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground/60 group-hover:text-primary transition-colors">Scroll</span>
                    <div className="w-5 h-9 rounded-full border-2 border-muted-foreground/30 group-hover:border-primary/60 flex justify-center p-1 transition-colors">
                        <motion.div
                            animate={{
                                y: [0, 10, 0],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatType: "loop",
                                ease: "easeInOut",
                            }}
                            className="w-1.5 h-1.5 rounded-full bg-primary"
                        />
                    </div>
                </a>
            </motion.div>
        </section>
    );
}
