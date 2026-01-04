"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Star, GitFork, ExternalLink } from 'lucide-react';

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

export function GitHubActivity({ username = "maulido" }: { username?: string }) {
    const [repos, setRepos] = useState<GitHubRepo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchRepos() {
            try {
                const res = await fetch(
                    `https://api.github.com/users/${username}/repos?sort=updated&per_page=6`,
                    {
                        // Add timeout and error handling
                        signal: AbortSignal.timeout(5000), // 5 second timeout
                    }
                );

                if (!res.ok) {
                    throw new Error(`GitHub API returned ${res.status}`);
                }

                const data = await res.json();

                // Validate response
                if (Array.isArray(data)) {
                    setRepos(data);
                } else {
                    console.warn('GitHub API returned unexpected format');
                    setError(true);
                }
            } catch (error) {
                console.error('Failed to fetch GitHub repos:', error);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchRepos();
    }, [username]);

    if (loading) {
        return (
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4 md:px-6">
                    <h2 className="text-3xl font-bold mb-8">
                        Recent <span className="text-gradient">GitHub Activity</span>
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-4 rounded-lg border border-primary/20 bg-card/40 animate-pulse">
                                <div className="h-6 bg-muted/30 rounded mb-2"></div>
                                <div className="h-4 bg-muted/20 rounded mb-4"></div>
                                <div className="flex gap-4">
                                    <div className="h-3 w-16 bg-muted/20 rounded"></div>
                                    <div className="h-3 w-16 bg-muted/20 rounded"></div>
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
            {/* Background Elements */}
            <div className="absolute top-1/2 left-1/4 h-[300px] w-[300px] rounded-full bg-primary/10 blur-[80px] pointer-events-none" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                        Recent <span className="text-gradient">GitHub Activity</span>
                    </h2>
                    <p className="mt-4 text-muted-foreground">
                        Latest repositories and contributions
                    </p>
                </motion.div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {repos.map((repo, index) => (
                        <motion.a
                            key={repo.id}
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            className="p-4 rounded-lg border border-primary/20 bg-card/40 backdrop-blur-sm hover:border-primary/40 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-bold text-primary group-hover:text-accent transition-colors line-clamp-1">
                                    {repo.name}
                                </h3>
                                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                            </div>

                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
                                {repo.description || 'No description available'}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                {repo.language && (
                                    <span className="flex items-center gap-1">
                                        <span className="h-2 w-2 rounded-full bg-primary" />
                                        {repo.language}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Star className="h-3 w-3" />
                                    {repo.stargazers_count}
                                </span>
                                <span className="flex items-center gap-1">
                                    <GitFork className="h-3 w-3" />
                                    {repo.forks_count}
                                </span>
                            </div>
                        </motion.a>
                    ))}
                </div>

                <div className="text-center mt-8">
                    <a
                        href={`https://github.com/${username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-muted/30 border border-primary/20 rounded-xl font-bold hover:border-primary/40 transition-all"
                    >
                        <Github className="h-5 w-5" />
                        View All Repositories
                    </a>
                </div>
            </div>
        </section>
    );
}
