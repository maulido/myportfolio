"use client";

import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Code2, Users, Clock, Briefcase } from 'lucide-react';
import Image from 'next/image';
import Prism from 'prismjs';
import { useEffect } from 'react';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';

interface CaseStudyProps {
    caseStudy: {
        problem: string;
        solution: string;
        challenges: string[];
        results: {
            metric: string;
            value: string;
            description?: string;
        }[];
        screenshots?: string[];
        codeSnippets?: {
            language: string;
            code: string;
            description: string;
            filename?: string;
        }[];
        technologies?: {
            name: string;
            purpose: string;
        }[];
        teamSize?: number;
        duration?: string;
        role?: string;
    };
}

export function CaseStudy({ caseStudy }: CaseStudyProps) {
    useEffect(() => {
        Prism.highlightAll();
    }, [caseStudy]);

    return (
        <div className="space-y-16 py-8">
            {/* Project Meta */}
            {(caseStudy.teamSize || caseStudy.duration || caseStudy.role) && (
                <div className="grid gap-4 md:grid-cols-3">
                    {caseStudy.role && (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/20 border border-primary/10">
                            <Briefcase className="h-5 w-5 text-primary" />
                            <div>
                                <div className="text-xs text-muted-foreground">Role</div>
                                <div className="font-semibold">{caseStudy.role}</div>
                            </div>
                        </div>
                    )}
                    {caseStudy.teamSize && (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/20 border border-primary/10">
                            <Users className="h-5 w-5 text-primary" />
                            <div>
                                <div className="text-xs text-muted-foreground">Team Size</div>
                                <div className="font-semibold">{caseStudy.teamSize} members</div>
                            </div>
                        </div>
                    )}
                    {caseStudy.duration && (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/20 border border-primary/10">
                            <Clock className="h-5 w-5 text-primary" />
                            <div>
                                <div className="text-xs text-muted-foreground">Duration</div>
                                <div className="font-semibold">{caseStudy.duration}</div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* The Problem */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-4"
            >
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-500/10 rounded-lg">
                        <AlertCircle className="h-6 w-6 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold">The Problem</h2>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed pl-[60px]">
                    {caseStudy.problem}
                </p>
            </motion.section>

            {/* The Solution */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-4"
            >
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-500/10 rounded-lg">
                        <CheckCircle2 className="h-6 w-6 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold">The Solution</h2>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed pl-[60px]">
                    {caseStudy.solution}
                </p>
            </motion.section>

            {/* Technologies Used */}
            {caseStudy.technologies && caseStudy.technologies.length > 0 && (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-6"
                >
                    <h2 className="text-2xl font-bold">Technologies & Tools</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {caseStudy.technologies.map((tech, i) => (
                            <div key={i} className="p-4 rounded-lg border border-primary/20 bg-card/40">
                                <h3 className="font-bold text-primary mb-2">{tech.name}</h3>
                                <p className="text-sm text-muted-foreground">{tech.purpose}</p>
                            </div>
                        ))}
                    </div>
                </motion.section>
            )}

            {/* Challenges & Solutions */}
            {caseStudy.challenges && caseStudy.challenges.length > 0 && (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-6"
                >
                    <h2 className="text-2xl font-bold">Challenges & How I Solved Them</h2>
                    <div className="space-y-4">
                        {caseStudy.challenges.map((challenge, i) => (
                            <div key={i} className="border-l-4 border-primary pl-6 py-2">
                                <p className="text-muted-foreground">{challenge}</p>
                            </div>
                        ))}
                    </div>
                </motion.section>
            )}

            {/* Code Snippets */}
            {caseStudy.codeSnippets && caseStudy.codeSnippets.length > 0 && (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-3">
                        <Code2 className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-bold">Code Highlights</h2>
                    </div>
                    <div className="space-y-6">
                        {caseStudy.codeSnippets.map((snippet, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">{snippet.description}</p>
                                    {snippet.filename && (
                                        <span className="text-xs text-muted-foreground font-mono">
                                            {snippet.filename}
                                        </span>
                                    )}
                                </div>
                                <pre className="rounded-lg overflow-x-auto">
                                    <code className={`language-${snippet.language}`}>
                                        {snippet.code}
                                    </code>
                                </pre>
                            </div>
                        ))}
                    </div>
                </motion.section>
            )}

            {/* Screenshots */}
            {caseStudy.screenshots && caseStudy.screenshots.length > 0 && (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-6"
                >
                    <h2 className="text-2xl font-bold">Screenshots</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {caseStudy.screenshots.map((screenshot, i) => (
                            <div key={i} className="aspect-video relative rounded-lg overflow-hidden border border-primary/20">
                                <Image src={screenshot} alt={`Screenshot ${i + 1}`} fill className="object-cover" unoptimized />
                            </div>
                        ))}
                    </div>
                </motion.section>
            )}

            {/* Results & Impact */}
            {caseStudy.results && caseStudy.results.length > 0 && (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-6"
                >
                    <h2 className="text-2xl font-bold">Results & Impact</h2>
                    <div className="grid gap-6 md:grid-cols-3">
                        {caseStudy.results.map((result, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center p-6 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
                            >
                                <div className="text-4xl font-bold text-primary mb-2">
                                    {result.value}
                                </div>
                                <div className="text-sm font-semibold mb-2">
                                    {result.metric}
                                </div>
                                {result.description && (
                                    <div className="text-xs text-muted-foreground">
                                        {result.description}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            )}
        </div>
    );
}
