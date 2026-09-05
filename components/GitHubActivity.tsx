"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Star, GitFork, ExternalLink, Code2 } from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';
import { useSettings } from "@/lib/useSettings";

interface GitHubRepo {
    id: number;
    name: string;
    description: string;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    language: string;
    updated_at: string;
}

const LANGUAGE_COLORS: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    Python: '#3572A5',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Rust: '#dea584',
    Go: '#00ADD8',
    PHP: '#4F5D95',
    Shell: '#89e051',
    Dockerfile: '#384d54',
    C: '#555555',
    'C++': '#f34b7d',
    'C#': '#178600',
    Java: '#b07219',
};

export function GitHubActivity({ username }: { username?: string }) {
    const { get } = useSettings();
    const activeUsername = username || get("githubUsername", "maulido");
    const showActivity = get("showGithubActivity", "true") !== "false";

    const [repos, setRepos] = useState<GitHubRepo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!showActivity || !activeUsername) {
            setLoading(false);
            return;
        }

        async function fetchRepos() {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);

                const res = await fetch(
                    `/api/github?username=${encodeURIComponent(activeUsername)}`,
                    { signal: controller.signal }
                );

                clearTimeout(timeoutId);

                if (!res.ok) {
                    setError(true);
                    return;
                }

                const result = await res.json();
                const reposData = result.success ? result.data : result;

                // Validate response
                if (Array.isArray(reposData) && reposData.length > 0) {
                    setRepos(reposData);
                } else {
                    setError(true);
                }
            } catch (error) {
                // Silently handle errors - component will just not render
                if (error instanceof Error) {
                    if (error.name === 'AbortError') {
                        console.warn('GitHub API request timed out');
                    } else {
                        console.warn('Failed to fetch GitHub repos:', error.message);
                    }
                }
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        fetchRepos();
    }, [activeUsername, showActivity]);

    if (!showActivity) return null;

    if (loading) {
        return (
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4 md:px-6">
                    <h2 className="text-3xl font-bold mb-8">
                        Recent <span className="text-gradient">GitHub Activity</span>
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-5 rounded-2xl border border-primary/20 bg-card/40 animate-pulse space-y-3">
                                <div className="h-5 bg-muted/30 rounded w-2/3"></div>
                                <div className="h-4 bg-muted/20 rounded w-full"></div>
                                <div className="h-4 bg-muted/20 rounded w-4/5"></div>
                                <div className="flex gap-4 pt-2">
                                    <div className="h-3 w-16 bg-muted/20 rounded"></div>
                                    <div className="h-3 w-12 bg-muted/20 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // Don't show section if there's an error or no repos
    if (error || repos.length === 0) return null;

    return (
        <section className="py-16 md:py-24 relative overflow-hidden">
            {/* Background Ambient Elements */}
            <div className="absolute top-1/2 left-1/4 h-[350px] w-[350px] rounded-full bg-primary/8 blur-[90px] pointer-events-none -z-10" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-3">
                        <Code2 className="h-3.5 w-3.5" />
                        <span>Open Source & Repos</span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                        Recent <span className="text-gradient">GitHub Activity</span>
                    </h2>
                    <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
                        Real-time public repositories and open-source contributions.
                    </p>
                </motion.div>

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {repos.map((repo, index) => (
                        <motion.div
                            key={repo.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                            viewport={{ once: true }}
                            className="h-full"
                        >
                            <SpotlightCard
                                className="p-6 h-full flex flex-col justify-between group hover:scale-[1.02] active:scale-[0.99] transition-all duration-300"
                                spotlightColor="rgba(56, 189, 248, 0.12)"
                            >
                                <a
                                    href={repo.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col h-full justify-between focus:outline-none"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 text-base">
                                                {repo.name}
                                            </h3>
                                            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
                                        </div>

                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px] leading-relaxed">
                                            {repo.description || 'No description provided for this repository.'}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border/60 dark:border-white/5 mt-auto">
                                        {repo.language && (
                                            <span className="flex items-center gap-1.5 font-medium">
                                                <span
                                                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                                                    style={{
                                                        backgroundColor: LANGUAGE_COLORS[repo.language] || 'var(--color-primary, #06b6d4)'
                                                    }}
                                                />
                                                <span>{repo.language}</span>
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20" />
                                            <span>{repo.stargazers_count}</span>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <GitFork className="h-3.5 w-3.5" />
                                            <span>{repo.forks_count}</span>
                                        </span>
                                    </div>
                                </a>
                            </SpotlightCard>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center mt-10">
                    <a
                        href={`https://github.com/${username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-card/90 dark:bg-card/50 hover:bg-primary/10 border border-border/80 dark:border-primary/20 rounded-xl font-semibold hover:border-primary/40 text-sm shadow-sm transition-all duration-200 group"
                    >
                        <Github className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                        <span>View All Repositories on GitHub</span>
                    </a>
                </div>
            </div>
        </section>
    );
}
