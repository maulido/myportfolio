"use client";

import { Github, Linkedin, Mail } from "lucide-react";
import { useState } from "react";
import { useSettings } from "@/lib/useSettings";

export function Footer({ settings: initialSettings }: { settings?: Record<string, string | undefined> }) {
    const { settings: clientSettings } = useSettings();
    const settings = { ...(initialSettings || {}), ...(clientSettings || {}) };
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const githubUrl = settings?.socialGithub || "https://github.com";
    const linkedinUrl = settings?.socialLinkedin || "https://linkedin.com";
    const rawEmail = settings?.contactEmail || "example@example.com";
    const contactEmail = rawEmail.replace(/^mailto:/i, "");
    // const twitterUrl = settings?.socialTwitter;
    // const instagramUrl = settings?.socialInstagram;

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        try {
            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (res.ok) {
                setStatus("success");
                setEmail("");
            } else {
                setStatus("error");
            }
        } catch {
            setStatus("error");
        }
    };

    return (
        <footer className="relative border-t border-border bg-card dark:bg-[#030712] py-16 overflow-hidden">
            {/* Top Glow (Dark mode only) */}
            <div className="hidden dark:block absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="hidden dark:block absolute top-0 left-1/2 -translate-x-1/2 w-full h-[150px] bg-primary/5 blur-[120px] -z-10" />

            <div className="container mx-auto px-4 text-center">
                <div className="mb-8 flex justify-center space-x-6">
                    {githubUrl && (
                        <a
                            href={githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative p-3 rounded-full bg-muted/60 dark:bg-white/5 hover:bg-muted dark:hover:bg-white/10 transition-all duration-300 ring-1 ring-border dark:ring-white/10 hover:ring-primary/50 shadow-sm"
                        >
                            <Github className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="sr-only">GitHub</span>
                        </a>
                    )}
                    {linkedinUrl && (
                        <a
                            href={linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative p-3 rounded-full bg-muted/60 dark:bg-white/5 hover:bg-muted dark:hover:bg-white/10 transition-all duration-300 ring-1 ring-border dark:ring-white/10 hover:ring-primary/50 shadow-sm"
                        >
                            <Linkedin className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="sr-only">LinkedIn</span>
                        </a>
                    )}
                    {contactEmail && (
                        <a
                            href={`mailto:${contactEmail}`}
                            className="group relative p-3 rounded-full bg-muted/60 dark:bg-white/5 hover:bg-muted dark:hover:bg-white/10 transition-all duration-300 ring-1 ring-border dark:ring-white/10 hover:ring-primary/50 shadow-sm"
                        >
                            <Mail className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="sr-only">Email</span>
                        </a>
                    )}
                </div>
                <div className="space-y-4 max-w-sm mx-auto mb-12">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-foreground/70">
                        {settings?.footerNewsletterTitle || "Subscribe to Newsletter"}
                    </h4>
                    {settings?.footerNewsletterSubtitle && (
                        <p className="text-xs text-muted-foreground">{settings.footerNewsletterSubtitle}</p>
                    )}
                    <form className="flex flex-col sm:flex-row gap-2.5" onSubmit={handleSubscribe}>
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 rounded-xl border border-input dark:border-white/10 bg-background dark:bg-white/5 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
                            disabled={status === "loading" || status === "success"}
                        />
                        <button
                            type="submit"
                            disabled={status === "loading" || status === "success"}
                            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-primary/20"
                        >
                            {status === "loading" ? "..." : status === "success" ? "Joined!" : "Join"}
                        </button>
                    </form>
                    {status === "error" && <p className="text-xs text-red-500 font-medium">Transmission error. Try again.</p>}
                    {status === "success" && <p className="text-xs text-green-600 dark:text-green-400 font-medium">Welcome to the network.</p>}
                </div>

                <div className="space-y-1.5 pt-4 border-t border-border/60 dark:border-white/5">
                    <h3 className="text-base font-bold text-gradient">{settings?.brandName || "Portfolio"}</h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                        {settings?.footerTagline || "Built with Next.js & TailwindCSS."}
                    </p>
                    <p className="text-xs text-muted-foreground/80 pt-2">
                        &copy; {new Date().getFullYear()} {settings?.copyrightText || "All rights reserved."}
                    </p>
                </div>
            </div>
        </footer>
    );
}
