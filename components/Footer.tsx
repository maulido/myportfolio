"use client";

import { Github, Linkedin, Mail } from "lucide-react";
import { useState } from "react";

export function Footer({ settings }: { settings: Record<string, string | undefined> }) {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const githubUrl = settings?.socialGithub || "https://github.com";
    const linkedinUrl = settings?.socialLinkedin || "https://linkedin.com";
    const contactEmail = settings?.contactEmail || "mailto:example@example.com";
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
        <footer className="relative border-t border-primary/10 bg-black/50 backdrop-blur-xl py-20 overflow-hidden">
            {/* Top Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[150px] bg-primary/5 blur-[120px] -z-10" />

            <div className="container mx-auto px-4 text-center">
                <div className="mb-8 flex justify-center space-x-8">
                    {githubUrl && (
                        <a
                            href={githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300 ring-1 ring-white/10 hover:ring-primary/50"
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
                            className="group relative p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300 ring-1 ring-white/10 hover:ring-primary/50"
                        >
                            <Linkedin className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="sr-only">LinkedIn</span>
                        </a>
                    )}
                    {contactEmail && (
                        <a
                            href={`mailto:${contactEmail}`}
                            className="group relative p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300 ring-1 ring-white/10 hover:ring-primary/50"
                        >
                            <Mail className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="sr-only">Email</span>
                        </a>
                    )}
                </div>
                <div className="space-y-6 max-w-sm mx-auto mb-16">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Subscribe to Newsletter</h4>
                    <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleSubscribe}>
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all disabled:opacity-50"
                            disabled={status === "loading" || status === "success"}
                        />
                        <button
                            type="submit"
                            disabled={status === "loading" || status === "success"}
                            className="rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-primary/20"
                        >
                            {status === "loading" ? "..." : status === "success" ? "Joined!" : "Join"}
                        </button>
                    </form>
                    {status === "error" && <p className="text-xs text-red-400 font-medium">Transmission error. Try again.</p>}
                    {status === "success" && <p className="text-xs text-green-400 font-medium">Welcome to the network.</p>}
                </div>

                <div className="space-y-2">
                    <h3 className="text-lg font-bold text-gradient">Portfolio</h3>
                    <p className="text-sm text-muted-foreground/60">
                        Built with Next.js & TailwindCSS.
                    </p>
                    <p className="text-xs text-muted-foreground/40 mt-4">
                        &copy; {new Date().getFullYear()} All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
