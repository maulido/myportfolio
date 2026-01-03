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
    const [typingSpeed, setTypingSpeed] = useState(150);
    const [isWorking, setIsWorking] = useState(true);

    // Calculate greeting outside of useEffect to avoid setState in effect
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    }, []);

    useEffect(() => {
        // Fetch availability status
        fetch('/api/settings?key=isWorking')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data !== undefined) setIsWorking(data.data);
            })
            .catch(err => console.error("Failed to fetch status", err));
    }, []);

    useEffect(() => {
        const handleTyping = () => {
            const i = loopNum % roles.length;
            const fullText = roles[i];

            setText(isDeleting
                ? fullText.substring(0, text.length - 1)
                : fullText.substring(0, text.length + 1)
            );

            setTypingSpeed(isDeleting ? 30 : 150);

            if (!isDeleting && text === fullText) {
                setTimeout(() => setIsDeleting(true), 1500); // Pause at end
            } else if (isDeleting && text === "") {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }
        };

        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [text, isDeleting, loopNum, typingSpeed]);

    return (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden py-20 pt-28">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 opacity-50 animate-pulse" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-accent/10 rounded-full blur-[100px] -z-10" />

            <div className="container px-4 md:px-6 z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="flex flex-col items-center gap-4 mb-6">
                        <div className="inline-block rounded-full bg-muted/50 px-3 py-1 text-sm text-muted-foreground backdrop-blur-md border border-primary/20">
                            👋 {greeting}, I&apos;m a...
                        </div>
                        {isWorking && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold uppercase tracking-widest"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Available for New Projects
                            </motion.div>
                        )}
                    </div>
                    <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl md:text-8xl lg:text-9xl mb-8 leading-tight">
                        <span className="text-gradient block pb-2 drop-shadow-2xl">Digital Architect</span>
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
                    className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mb-8"
                >
                    Building robust network infrastructures and scalable web applications with a focus on comprehensive digital solutions.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="space-x-4 pt-8"
                >
                    <Link href="/projects" className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent px-8 text-sm font-medium text-black shadow-lg transition-transform hover:scale-105 hover:shadow-primary/25 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                        View Work
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    <button
                        onClick={() => window.dispatchEvent(new Event("open-cv-modal"))}
                        className="inline-flex h-11 items-center justify-center rounded-full border border-primary/50 bg-background/50 backdrop-blur-sm px-8 text-sm font-medium shadow-sm transition-colors hover:bg-primary/10 hover:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                        Download CV
                        <Download className="ml-2 h-4 w-4" />
                    </button>
                </motion.div>
            </div>
        </section>
    );
}
