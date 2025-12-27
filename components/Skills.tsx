"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from "recharts";
import { SiNextdotjs, SiReact, SiTypescript, SiTailwindcss, SiFramer, SiNodedotjs, SiMongodb, SiPostgresql, SiPython, SiCisco, SiDocker, SiLinux, SiAmazonwebservices } from "react-icons/si";
import { Brain, Users, MessageSquare, Zap } from "lucide-react";

type Skill = {
    name: string;
    rating: number; // 1-5
    icon: React.ReactNode;
};

type SkillCategory = {
    category: string;
    items: Skill[];
};

const skills: SkillCategory[] = [
    {
        category: "Frontend Development",
        items: [
            { name: "Next.js", rating: 5, icon: <SiNextdotjs className="h-6 w-6" /> },
            { name: "React", rating: 5, icon: <SiReact className="h-6 w-6 text-blue-400" /> },
            { name: "TypeScript", rating: 4, icon: <SiTypescript className="h-6 w-6 text-blue-600" /> },
            { name: "Tailwind", rating: 5, icon: <SiTailwindcss className="h-6 w-6 text-cyan-400" /> },
        ],
    },
    {
        category: "Backend & Database",
        items: [
            { name: "Node.js", rating: 4, icon: <SiNodedotjs className="h-6 w-6 text-green-500" /> },
            { name: "MongoDB", rating: 4, icon: <SiMongodb className="h-6 w-6 text-green-600" /> },
            { name: "PostgreSQL", rating: 3, icon: <SiPostgresql className="h-6 w-6 text-blue-500" /> },
            { name: "Python", rating: 3, icon: <SiPython className="h-6 w-6 text-yellow-500" /> },
        ],
    },
    {
        category: "Network & DevOps",
        items: [
            { name: "Cisco", rating: 5, icon: <SiCisco className="h-6 w-6 text-blue-700" /> },
            { name: "Docker", rating: 4, icon: <SiDocker className="h-6 w-6 text-blue-400" /> },
            { name: "Linux", rating: 4, icon: <SiLinux className="h-6 w-6" /> },
            { name: "AWS", rating: 3, icon: <SiAmazonwebservices className="h-6 w-6 text-orange-500" /> },
        ],
    },
    {
        category: "Soft Skills",
        items: [
            { name: "Problem Solving", rating: 5, icon: <Brain className="h-6 w-6 text-purple-500" /> },
            { name: "Leadership", rating: 4, icon: <Users className="h-6 w-6 text-indigo-500" /> },
            { name: "Communication", rating: 5, icon: <MessageSquare className="h-6 w-6 text-pink-500" /> },
            { name: "Agile/Scrum", rating: 4, icon: <Zap className="h-6 w-6 text-yellow-400" /> },
        ],
    },
];

const radarData = [
    { subject: "Frontend", A: 100, fullMark: 100 },
    { subject: "Backend", A: 85, fullMark: 100 },
    { subject: "Networking", A: 95, fullMark: 100 },
    { subject: "DevOps", A: 80, fullMark: 100 },
    { subject: "Soft Skills", A: 90, fullMark: 100 },
];

export function Skills() {
    return (
        <section id="skills" className="py-16 md:py-24 bg-card/30 transition-colors duration-500">
            <div className="container mx-auto px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl font-bold tracking-tighter md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        Tech Stack Mastery
                    </h2>
                    <p className="mt-4 text-muted-foreground text-lg max-w-[700px] mx-auto">
                        An interactive radar visualization and detailed breakdown of my professional capabilities.
                    </p>
                </motion.div>

                {/* Radar Chart Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7 }}
                    viewport={{ once: true }}
                    className="mb-20 h-[300px] md:h-[450px] w-full flex justify-center items-center rounded-3xl bg-card/50 backdrop-blur-xl border border-primary/10 p-4 shadow-2xl relative group"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-3xl pointer-events-none" />
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid stroke="rgba(139, 92, 246, 0.2)" />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: "currentColor", fontSize: 12, opacity: 0.7 }}
                            />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="Skills"
                                dataKey="A"
                                stroke="var(--primary)"
                                fill="var(--primary)"
                                fillOpacity={0.5}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </motion.div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {skills.map((cat, index) => (
                        <motion.div
                            key={cat.category}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group relative overflow-hidden bg-card/50 backdrop-blur-md rounded-2xl border border-primary/10 p-6 shadow-xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Star className="h-10 w-10 text-primary" />
                            </div>

                            <h3 className="font-bold text-lg mb-6 text-primary border-b border-primary/10 pb-2">{cat.category}</h3>

                            <div className="space-y-4">
                                {cat.items.map((skill) => (
                                    <div key={skill.name} className="flex flex-col space-y-2">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors">
                                                {skill.icon}
                                            </div>
                                            <span className="text-xs font-semibold tracking-wide">{skill.name}</span>
                                        </div>
                                        <div className="flex gap-1 items-center pl-10">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`h-2.5 w-2.5 ${star <= skill.rating ? "fill-accent text-accent" : "text-muted/20"}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
