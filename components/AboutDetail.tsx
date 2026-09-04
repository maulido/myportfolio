"use client";

import { motion } from "framer-motion";
import { 
    Network, 
    Code2, 
    ShieldCheck, 
    Cpu, 
    Server, 
    Terminal, 
    Layers, 
    Compass, 
    Download, 
    Mail, 
    CheckCircle2, 
    Sparkles, 
    GraduationCap, 
    Globe2, 
    MapPin
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

interface AboutMeData {
    paragraph1?: string;
    paragraph2?: string;
    profilePhotoUrl?: string;
    name?: string;
    title?: string;
    location?: string;
    email?: string;
    phone?: string;
    stats?: {
        yearsExperience?: number;
        projectsCompleted?: number;
        technologiesMastered?: number;
        certificationsEarned?: number;
    };
}

interface EducationEntry {
    _id: string;
    title: string;
    organization: string;
    startDate: string;
    endDate?: string;
    description?: string;
}

export function AboutDetail() {
    const [aboutData, setAboutData] = useState<AboutMeData | null>(null);
    const [education, setEducation] = useState<EducationEntry[]>([]);
    const [dynamicNetworkStack, setDynamicNetworkStack] = useState<string[]>([]);
    const [dynamicSoftwareStack, setDynamicSoftwareStack] = useState<string[]>([]);

    useEffect(() => {
        async function fetchAboutDetails() {
            try {
                const [aboutRes, eduRes, skillsRes] = await Promise.all([
                    fetch('/api/about'),
                    fetch('/api/career?type=education'),
                    fetch('/api/skills')
                ]);

                if (aboutRes.ok) {
                    const aData = await aboutRes.json();
                    if (aData.success) setAboutData(aData.data);
                }

                if (eduRes.ok) {
                    const eData = await eduRes.json();
                    if (eData.success) setEducation(eData.data);
                }

                if (skillsRes.ok) {
                    const sData = await skillsRes.json();
                    if (sData.success && Array.isArray(sData.data)) {
                        // Extract and flatten skills from categories
                        const allSkills: { name: string; category: string }[] = [];
                        sData.data.forEach((group: { category?: string; skills?: { name: string; category?: string }[] }) => {
                            if (Array.isArray(group.skills)) {
                                group.skills.forEach((s) => {
                                    if (s?.name) {
                                        allSkills.push({
                                            name: s.name,
                                            category: s.category || group.category || ''
                                        });
                                    }
                                });
                            }
                        });

                        const net = allSkills
                            .filter((s) => {
                                const cat = s.category.toLowerCase();
                                const name = s.name.toLowerCase();
                                return cat.includes('network') || cat.includes('infra') || cat.includes('cisco') || cat.includes('mikrotik') || cat.includes('security') || cat.includes('system') || name.includes('cisco') || name.includes('mikrotik') || name.includes('linux');
                            })
                            .map((s) => s.name);

                        const soft = allSkills
                            .filter((s) => {
                                const cat = s.category.toLowerCase();
                                return cat.includes('software') || cat.includes('web') || cat.includes('front') || cat.includes('back') || cat.includes('cloud') || cat.includes('devops') || cat.includes('database') || cat.includes('tool');
                            })
                            .map((s) => s.name);

                        if (net.length > 0) setDynamicNetworkStack(net);
                        if (soft.length > 0) setDynamicSoftwareStack(soft);
                    }
                }
            } catch (err) {
                console.error("Failed to load about details:", err);
            }
        }

        fetchAboutDetails();
    }, []);

    const principles = [
        {
            icon: ShieldCheck,
            title: "Security & Zero-Trust by Default",
            desc: "Security is never an afterthought. From strict network firewall rules and encrypted tunnels to secure authentication tokens and sanitized payloads, every layer must be hardened."
        },
        {
            icon: Server,
            title: "Reliability & High Availability",
            desc: "Trained in real-world networking topologies, I design software architectures that gracefully handle connection drops, packet jitter, and server failovers without losing data integrity."
        },
        {
            icon: Terminal,
            title: "Clean Code & Automated DevOps",
            desc: "If a workflow is executed repeatedly, it should be automated. I champion clean, self-documenting code, containerized builds, and automated CI/CD deployment pipelines."
        },
        {
            icon: Compass,
            title: "Pragmatic Architecture",
            desc: "Choosing the optimal tool for the problem. Avoiding unnecessary architectural bloat while prioritizing latency, maintainability, and exceptional developer experience."
        }
    ];

    const networkStack = [
        "Cisco IOS & Switching",
        "MikroTik RouterOS",
        "TCP/IP & IPv4/IPv6 Subnetting",
        "BGP & OSPF Routing Protocols",
        "VLAN & Trunking Configuration",
        "WireGuard, IPsec & OpenVPN",
        "Firewall Filter Rules & NAT",
        "Wireshark Packet Telemetry",
        "Linux Server Administration",
        "DNS, DHCP & NTP Infrastructure"
    ];

    const softwareStack = [
        "TypeScript & JavaScript (ESNext)",
        "Next.js 16 (App Router & SSR)",
        "React 19 & State Architecture",
        "Tailwind CSS v4 Modern UI",
        "Node.js & Express REST APIs",
        "MongoDB & Mongoose Modeling",
        "PostgreSQL & Relational Schemas",
        "Docker & Container Orchestration",
        "Git & Automated GitHub Actions",
        "Edge Functions & Cloud Deployments"
    ];

    return (
        <div className="space-y-20 md:space-y-28">
            {/* 1. Hero Bio Section */}
            <section className="container mx-auto px-4 md:px-6">
                <div className="grid gap-12 lg:grid-cols-12 items-center">
                    {/* Left Avatar & Quick Specs */}
                    <div className="lg:col-span-5 flex flex-col items-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="relative group w-64 h-64 md:w-80 md:h-80"
                        >
                            <div className="absolute -inset-1.5 bg-gradient-to-r from-primary via-accent to-primary rounded-3xl blur-md opacity-25 group-hover:opacity-50 transition duration-700" />
                            <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-border bg-card shadow-2xl flex items-center justify-center">
                                {aboutData?.profilePhotoUrl ? (
                                    <Image
                                        src={aboutData.profilePhotoUrl}
                                        alt={aboutData.name || "Profile"}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 256px, 320px"
                                        priority
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-primary/70 p-6 text-center">
                                        <Cpu className="h-16 w-16 mb-3 animate-pulse" />
                                        <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Digital Architect</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Quick Specs Pill Badges */}
                        <div className="mt-8 w-full max-w-sm space-y-2.5">
                            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-border/80 bg-card/60 text-xs font-medium">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <MapPin className="h-3.5 w-3.5 text-primary" /> Location
                                </span>
                                <span className="text-foreground font-semibold">{aboutData?.location || "Indonesia"}</span>
                            </div>
                            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-border/80 bg-card/60 text-xs font-medium">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Globe2 className="h-3.5 w-3.5 text-emerald-500" /> Availability
                                </span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Open for Projects & Roles</span>
                            </div>
                            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-border/80 bg-card/60 text-xs font-medium">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Layers className="h-3.5 w-3.5 text-primary" /> Core Focus
                                </span>
                                <span className="text-foreground font-semibold">Network & Fullstack Eng</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Narrative Content */}
                    <div className="lg:col-span-7 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
                                <Sparkles className="h-3.5 w-3.5" /> Comprehensive Biography
                            </div>
                            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-foreground">
                                Bridging <span className="text-gradient">Hardware Protocols</span> with Modern <span className="text-gradient">Software Systems</span>
                            </h1>
                            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                                {aboutData?.paragraph1 || 
                                    "I am a dual-discipline engineer operating at the intersection of network engineering and modern full-stack software development. With a grounded understanding of how packets travel through physical infrastructure and how cloud applications scale, I build reliable, high-performance digital solutions."
                                }
                            </p>
                            <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                                {aboutData?.paragraph2 || 
                                    "My journey began with deep curiosity for network topologies, routing algorithms, and server infrastructure. As web applications evolved into distributed cloud architectures, I expanded my expertise into TypeScript, Next.js, database optimization, and automated CI/CD deployment pipelines."
                                }
                            </p>

                            {/* Action Buttons */}
                            <div className="pt-6 flex flex-wrap items-center gap-3.5">
                                <button
                                    onClick={() => window.dispatchEvent(new Event("open-cv-modal"))}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    <Download className="h-4 w-4" /> Download Official CV
                                </button>
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-muted/60 transition-all"
                                >
                                    <Mail className="h-4 w-4" /> Get in Touch
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 2. Engineering Philosophy / Principles */}
            <section className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                        Core <span className="text-gradient">Engineering Principles</span>
                    </h2>
                    <p className="mt-3 text-muted-foreground text-base">
                        The fundamental architectural tenets that govern every system I configure and every line of code I ship.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {principles.map((p, idx) => (
                        <motion.div
                            key={p.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: idx * 0.08 }}
                            className="group relative p-6 rounded-2xl border border-border/80 dark:border-primary/20 bg-card/80 dark:bg-card/40 backdrop-blur-sm shadow-xs hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col justify-between"
                        >
                            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-2xl" />
                            <div>
                                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                    <p.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                    {p.title}
                                </h3>
                                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                                    {p.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* 3. Dual-Domain Technical Mastery */}
            <section className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                        Dual-Domain <span className="text-gradient">Technical Mastery</span>
                    </h2>
                    <p className="mt-3 text-muted-foreground text-base">
                        A structured breakdown of my hands-on technical competencies across both physical network infrastructure and cloud-native software.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Domain 1: Network & Infrastructure */}
                    <div className="p-8 rounded-2xl border border-border/80 dark:border-primary/20 bg-card/80 dark:bg-card/40 backdrop-blur-sm shadow-sm space-y-6">
                        <div className="flex items-center gap-3.5 border-b border-border/80 pb-5">
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                                <Network className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-foreground">Network & Infrastructure Engineering</h3>
                                <p className="text-xs text-muted-foreground">Routing, switching, firewalls, and server operating systems</p>
                            </div>
                        </div>

                        <div className="grid gap-2.5 sm:grid-cols-2">
                            {(dynamicNetworkStack.length > 0 ? dynamicNetworkStack : networkStack).map((item) => (
                                <div key={item} className="flex items-center gap-2 p-2.5 rounded-lg bg-background/50 border border-border/60 text-xs font-medium text-foreground">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Domain 2: Software Engineering & Cloud */}
                    <div className="p-8 rounded-2xl border border-border/80 dark:border-primary/20 bg-card/80 dark:bg-card/40 backdrop-blur-sm shadow-sm space-y-6">
                        <div className="flex items-center gap-3.5 border-b border-border/80 pb-5">
                            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                                <Code2 className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-foreground">Software Engineering & Modern Cloud</h3>
                                <p className="text-xs text-muted-foreground">Full-stack web architecture, API services, and containerized deployments</p>
                            </div>
                        </div>

                        <div className="grid gap-2.5 sm:grid-cols-2">
                            {(dynamicSoftwareStack.length > 0 ? dynamicSoftwareStack : softwareStack).map((item) => (
                                <div key={item} className="flex items-center gap-2 p-2.5 rounded-lg bg-background/50 border border-border/60 text-xs font-medium text-foreground">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Academic Background */}
            {education && education.length > 0 && (
                <section className="container mx-auto px-4 md:px-6">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">
                            Academic <span className="text-gradient">Background</span>
                        </h2>
                        <p className="mt-2 text-muted-foreground text-sm">
                            Formal educational foundations in computer technology and systems engineering.
                        </p>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        {education.map((edu) => {
                            const startYear = new Date(edu.startDate).getFullYear();
                            const endYear = edu.endDate ? new Date(edu.endDate).getFullYear() : "Present";

                            return (
                                <div
                                    key={edu._id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-xl border border-border/80 bg-card/60 gap-4"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                                            <GraduationCap className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-foreground">{edu.title}</h3>
                                            <p className="text-sm text-primary font-medium">{edu.organization}</p>
                                            {edu.description && (
                                                <p className="text-xs text-muted-foreground mt-1 max-w-xl">{edu.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold shrink-0 self-start sm:self-center">
                                        {startYear} – {endYear}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}
        </div>
    );
}
