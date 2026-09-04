"use client";

import { motion } from "framer-motion";
import { Award, Calendar, Code2 } from "lucide-react";
import { getIcon } from "@/lib/iconMap";
import { useState, useEffect } from "react";

type SkillLevel = "Expert" | "Advanced" | "Intermediate" | "Beginner";

type Skill = {
    _id: string;
    name: string;
    level: SkillLevel;
    years: number;
    icon: string;
    color?: string;
};

type SkillCategory = {
    category: string;
    icon: React.ReactNode;
    skills: Skill[];
};

const getLevelColor = (level: SkillLevel): string => {
    switch (level) {
        case "Expert": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
        case "Advanced": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
        case "Intermediate": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
        case "Beginner": return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
};

const getLevelDot = (level: SkillLevel): string => {
    switch (level) {
        case "Expert": return "bg-emerald-500";
        case "Advanced": return "bg-blue-500";
        case "Intermediate": return "bg-amber-500";
        case "Beginner": return "bg-slate-500";
    }
};

export function Skills() {
    const [skills, setSkills] = useState<SkillCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        try {
            const response = await fetch('/api/skills');
            const result = await response.json();

            if (result.success) {
                // Map API data to component format
                const mappedSkills = result.data.map((group: { category: string; skills: Skill[] }) => ({
                    category: group.category,
                    icon: <Code2 className="h-5 w-5" />,
                    skills: group.skills
                }));
                setSkills(mappedSkills);
            } else {
                setError('Failed to load skills');
            }
        } catch (err) {
            console.error('Error fetching skills:', err);
            setError('Failed to load skills');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section id="skills" className="py-16 md:py-24 bg-gradient-to-b from-background to-card/30 transition-colors duration-500">
            <div className="container mx-auto px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl font-bold tracking-tighter md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        Technical Skills
                    </h2>
                    <p className="mt-4 text-muted-foreground text-lg max-w-[700px] mx-auto">
                        A comprehensive overview of my technical expertise and professional experience across various domains.
                    </p>
                </motion.div>

                {isLoading ? (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-card/40 rounded-2xl border border-border/60 p-6 space-y-4">
                                <div className="h-6 w-1/2 bg-muted/60 animate-pulse rounded-lg mb-4" />
                                <div className="space-y-3">
                                    <div className="h-4 w-full bg-muted/60 animate-pulse rounded" />
                                    <div className="h-4 w-4/5 bg-muted/60 animate-pulse rounded" />
                                    <div className="h-4 w-2/3 bg-muted/60 animate-pulse rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground">{error}</p>
                    </div>
                ) : skills.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground">No skills found</p>
                    </div>
                ) : (
                    <>
                        {/* Skills Grid */}
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {skills.map((category, categoryIndex) => (
                                <motion.div
                                    key={category.category}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                                    viewport={{ once: true }}
                                    className="group relative overflow-hidden bg-card/90 dark:bg-card/50 backdrop-blur-md rounded-2xl border border-border/80 dark:border-primary/10 p-6 shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-1"
                                >
                                    {/* Category Header */}
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/80 dark:border-primary/10">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                            {category.icon}
                                        </div>
                                        <h3 className="font-bold text-lg">{category.category}</h3>
                                    </div>

                                    {/* Skills List */}
                                    <div className="space-y-4">
                                        {category.skills.map((skill: Skill, skillIndex: number) => (
                                            <motion.div
                                                key={skill._id}
                                                initial={{ opacity: 0, x: -10 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ delay: categoryIndex * 0.1 + skillIndex * 0.05 }}
                                                viewport={{ once: true }}
                                                className="group/skill"
                                            >
                                                {/* Skill Name with Icon */}
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className={skill.color || 'text-foreground'}>
                                                            {getIcon(skill.icon, "h-4 w-4")}
                                                        </div>
                                                        <span className="text-sm font-semibold">{skill.name}</span>
                                                    </div>
                                                </div>

                                                {/* Level Badge and Years */}
                                                <div className="flex items-center gap-2 ml-6">
                                                    {/* Level Badge */}
                                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getLevelColor(skill.level)}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${getLevelDot(skill.level)}`} />
                                                        {skill.level}
                                                    </div>

                                                    {/* Years of Experience */}
                                                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-muted/50 text-muted-foreground border border-muted">
                                                        <Calendar className="h-2.5 w-2.5" />
                                                        {skill.years}y
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Legend */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            viewport={{ once: true }}
                            className="mt-12 flex flex-wrap justify-center gap-4 text-xs"
                        >
                            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl sm:rounded-full bg-card/90 dark:bg-card/50 backdrop-blur-md border border-border/80 dark:border-primary/10 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <Award className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground font-medium">Proficiency Levels:</span>
                                </div>
                                {["Expert", "Advanced", "Intermediate", "Beginner"].map((level) => (
                                    <div key={level} className="flex items-center gap-1.5">
                                        <div className={`w-2 h-2 rounded-full ${getLevelDot(level as SkillLevel)}`} />
                                        <span className="text-muted-foreground">{level}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </div>
        </section>
    );
}
