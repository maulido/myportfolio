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
    MapPin,
    Award,
    TrendingUp,
    Github,
    Linkedin,
    ArrowRight,
    Activity
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { SpotlightCard } from "./SpotlightCard";

interface AboutMeData {
    paragraph1?: string;
    paragraph2?: string;
    profilePhotoUrl?: string;
    name?: string;
    title?: string;
    location?: string;
    email?: string;
    phone?: string;
    socialLinks?: {
        github?: string;
        linkedin?: string;
        twitter?: string;
        website?: string;
        instagram?: string;
    };
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
    const [settings, setSettings] = useState<Record<string, string>>({});

    useEffect(() => {
        async function fetchAboutDetails() {
            try {
                const [aboutRes, eduRes, skillsRes, settingsRes] = await Promise.all([
                    fetch('/api/about'),
                    fetch('/api/career?type=education'),
                    fetch('/api/skills'),
                    fetch('/api/settings')
                ]);

                if (aboutRes.ok) {
                    const aData = await aboutRes.json();
                    if (aData.success) setAboutData(aData.data);
                }

                if (settingsRes.ok) {
                    const sData = await settingsRes.json();
                    if (sData.success && Array.isArray(sData.data)) {
                        const map: Record<string, string> = {};
                        sData.data.forEach((item: { key: string; value: unknown }) => {
                            if (item && item.key) map[item.key] = String(item.value ?? '');
                        });
                        setSettings(map);
                    }
                }

                if (eduRes.ok) {
                    const eData = await eduRes.json();
                    if (eData.success) setEducation(eData.data);
                }

                if (skillsRes.ok) {
                    const sData = await skillsRes.json();
                    if (sData.success && Array.isArray(sData.data)) {
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
            title: settings.aboutPrinciple1Title || "Security & Zero-Trust by Default",
            desc: settings.aboutPrinciple1Desc || "Security is never an afterthought. From strict network firewall rules and encrypted tunnels to secure authentication tokens and sanitized payloads, every layer must be hardened.",
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            icon: Server,
            title: settings.aboutPrinciple2Title || "Reliability & High Availability",
            desc: settings.aboutPrinciple2Desc || "Trained in real-world networking topologies, I design software architectures that gracefully handle connection drops, packet jitter, and server failovers without losing data integrity.",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            icon: Terminal,
            title: settings.aboutPrinciple3Title || "Clean Code & Automated DevOps",
            desc: settings.aboutPrinciple3Desc || "If a workflow is executed repeatedly, it should be automated. I champion clean, self-documenting code, containerized builds, and automated CI/CD deployment pipelines.",
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        },
        {
            icon: Compass,
            title: settings.aboutPrinciple4Title || "Pragmatic Architecture",
            desc: settings.aboutPrinciple4Desc || "Choosing the optimal tool for the problem. Avoiding unnecessary architectural bloat while prioritizing latency, maintainability, and exceptional developer experience.",
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        }
    ];

    const methodology = [
        {
            step: "01",
            title: settings.aboutMethod1Title || "Discovery & Topology Audit",
            desc: settings.aboutMethod1Desc || "Analyzing requirement matrices, examining packet flows, bandwidth overhead, user journeys, and bottleneck vulnerability points before writing any code."
        },
        {
            step: "02",
            title: settings.aboutMethod2Title || "Modular Architecture",
            desc: settings.aboutMethod2Desc || "Architecting loosely coupled components, strict schema validations, hardened firewall rules, and scalable database data structures."
        },
        {
            step: "03",
            title: settings.aboutMethod3Title || "Hardening & Test Automation",
            desc: settings.aboutMethod3Desc || "Executing rigorous type verification, zero-trust token authentication, end-to-end stress testing, and edge case resilience handling."
        },
        {
            step: "04",
            title: settings.aboutMethod4Title || "CI/CD & Continuous Telemetry",
            desc: settings.aboutMethod4Desc || "Deploying via automated pipelines with real-time error telemetry, uptime health checks, and zero-downtime rolling updates."
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

    const stats = [
        {
            icon: TrendingUp,
            value: aboutData?.stats?.yearsExperience ? `${aboutData.stats.yearsExperience}+` : "4+",
            label: "Years Experience",
            sub: "Continuous Field Work",
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            icon: Code2,
            value: aboutData?.stats?.projectsCompleted ? `${aboutData.stats.projectsCompleted}+` : "25+",
            label: "Systems & Projects",
            sub: "Shipped to Production",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            icon: Award,
            value: aboutData?.stats?.certificationsEarned ? `${aboutData.stats.certificationsEarned}+` : "8+",
            label: "Certifications",
            sub: "Industry Validated",
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        },
        {
            icon: Activity,
            value: "99.9%",
            label: "Uptime Focus",
            sub: "Zero-Downtime Philosophy",
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        }
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
                            {/* Rotating Ambient Conic Glow */}
                            <div className="absolute -inset-2 bg-gradient-to-tr from-primary via-accent to-primary rounded-full blur-xl opacity-30 group-hover:opacity-60 transition duration-700 pointer-events-none" />
                            
                            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-primary/25 shadow-2xl bg-card flex items-center justify-center p-1">
                                <div className="relative w-full h-full rounded-full overflow-hidden">
                                    {aboutData?.profilePhotoUrl ? (
                                        <Image
                                            src={aboutData.profilePhotoUrl}
                                            alt={aboutData.name || "Profile"}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            sizes="(max-width: 768px) 256px, 320px"
                                            priority
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-primary/70 p-6 text-center h-full w-full bg-muted/20">
                                            <Cpu className="h-16 w-16 mb-3 animate-pulse" />
                                            <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Digital Architect</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick Specs Pill Badges */}
                        <div className="mt-8 w-full max-w-sm space-y-2.5">
                            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-border/80 dark:border-white/10 bg-card/70 backdrop-blur-sm text-xs font-medium shadow-xs">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <MapPin className="h-3.5 w-3.5 text-primary" /> Location
                                </span>
                                <span className="text-foreground font-semibold">{aboutData?.location || "Indonesia"}</span>
                            </div>
                            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-border/80 dark:border-white/10 bg-card/70 backdrop-blur-sm text-xs font-medium shadow-xs">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Globe2 className="h-3.5 w-3.5 text-emerald-500" /> Availability
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                                    Open for Opportunities
                                </span>
                            </div>
                            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-border/80 dark:border-white/10 bg-card/70 backdrop-blur-sm text-xs font-medium shadow-xs">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Layers className="h-3.5 w-3.5 text-primary" /> Focus
                                </span>
                                <span className="text-foreground font-semibold">Network & Fullstack</span>
                            </div>
                        </div>

                        {/* Social Links Row */}
                        <div className="mt-5 flex items-center gap-3">
                            {aboutData?.socialLinks?.github && (
                                <a
                                    href={aboutData.socialLinks.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 rounded-xl border border-border/80 bg-card/60 text-muted-foreground hover:text-primary hover:border-primary/40 transition-all shadow-xs"
                                    title="GitHub"
                                >
                                    <Github className="h-4 w-4" />
                                </a>
                            )}
                            {aboutData?.socialLinks?.linkedin && (
                                <a
                                    href={aboutData.socialLinks.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 rounded-xl border border-border/80 bg-card/60 text-muted-foreground hover:text-primary hover:border-primary/40 transition-all shadow-xs"
                                    title="LinkedIn"
                                >
                                    <Linkedin className="h-4 w-4" />
                                </a>
                            )}
                            {aboutData?.email && (
                                <a
                                    href={`mailto:${aboutData.email}`}
                                    className="p-2.5 rounded-xl border border-border/80 bg-card/60 text-muted-foreground hover:text-primary hover:border-primary/40 transition-all shadow-xs"
                                    title="Email Direct"
                                >
                                    <Mail className="h-4 w-4" />
                                </a>
                            )}
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
                                <Sparkles className="h-3.5 w-3.5" /> {settings.aboutHeroBadge || "Comprehensive Biography"}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-foreground">
                                {settings.aboutHeroTitle ? (
                                    <span>{settings.aboutHeroTitle}</span>
                                ) : (
                                    <>
                                        Bridging <span className="text-gradient">Hardware Protocols</span> with Modern <span className="text-gradient">Software Systems</span>
                                    </>
                                )}
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
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                                >
                                    <Download className="h-4 w-4" /> Download Official CV
                                </button>
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border/80 dark:border-white/10 bg-card text-foreground font-semibold text-sm hover:bg-muted/60 hover:border-primary/40 transition-all"
                                >
                                    <Mail className="h-4 w-4" /> Get in Touch
                                </Link>
                                <Link
                                    href="/projects"
                                    className="inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                                >
                                    <span>Explore Featured Work</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 2. Core Metrics Strip */}
            <section className="container mx-auto px-4 md:px-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((s, idx) => (
                        <motion.div
                            key={s.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: idx * 0.08 }}
                        >
                            <SpotlightCard className="p-6 h-full flex flex-col justify-between group hover:scale-[1.02] transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${s.bg} ${s.color} group-hover:scale-110 transition-transform`}>
                                        <s.icon className="h-6 w-6" />
                                    </div>
                                    <span className="text-3xl font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors">
                                        {s.value}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-foreground mb-0.5">{s.label}</h3>
                                    <p className="text-xs text-muted-foreground">{s.sub}</p>
                                </div>
                            </SpotlightCard>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* 3. Engineering Philosophy / Principles */}
            <section className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-3">
                        <Compass className="h-3.5 w-3.5" />
                        <span>Core Pillars</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                        Core <span className="text-gradient">Engineering Principles</span>
                    </h2>
                    <p className="mt-3 text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
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
                            className="h-full"
                        >
                            <SpotlightCard className="p-6 h-full flex flex-col justify-between group hover:scale-[1.02] transition-all duration-300">
                                <div>
                                    <div className={`h-12 w-12 rounded-xl ${p.bg} ${p.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                                        <p.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                        {p.title}
                                    </h3>
                                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                                        {p.desc}
                                    </p>
                                </div>
                            </SpotlightCard>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* 4. Engineering Methodology */}
            <section className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-14">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-3">
                        <Terminal className="h-3.5 w-3.5" />
                        <span>Execution Blueprint</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                        How I Approach <span className="text-gradient">Engineering Challenges</span>
                    </h2>
                    <p className="mt-3 text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
                        A disciplined, repeatable methodology ensuring resilience from initial network planning to cloud deployment.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {methodology.map((m, idx) => (
                        <motion.div
                            key={m.step}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: idx * 0.08 }}
                            className="h-full"
                        >
                            <SpotlightCard className="p-6 h-full flex flex-col justify-between group hover:scale-[1.02] transition-all duration-300">
                                <div>
                                    <span className="text-2xl font-mono font-extrabold text-primary/40 group-hover:text-primary transition-colors">
                                        {m.step}
                                    </span>
                                    <h3 className="text-base font-bold text-foreground mt-3 mb-2 group-hover:text-primary transition-colors">
                                        {m.title}
                                    </h3>
                                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                                        {m.desc}
                                    </p>
                                </div>
                            </SpotlightCard>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* 5. Dual-Domain Technical Mastery */}
            <section className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-3">
                        <Layers className="h-3.5 w-3.5" />
                        <span>Technical Breadth</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                        Dual-Domain <span className="text-gradient">Technical Mastery</span>
                    </h2>
                    <p className="mt-3 text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
                        Structured competencies across both physical network routing and cloud-native software architecture.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Domain 1: Network & Infrastructure */}
                    <SpotlightCard className="p-8 h-full flex flex-col justify-between" spotlightColor="rgba(59, 130, 246, 0.15)">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3.5 border-b border-border/80 dark:border-white/10 pb-5">
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
                                    <div key={item} className="flex items-center gap-2 p-2.5 rounded-lg bg-background/50 border border-border/60 dark:border-white/5 text-xs font-medium text-foreground hover:border-primary/40 transition-colors">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SpotlightCard>

                    {/* Domain 2: Software Engineering & Cloud */}
                    <SpotlightCard className="p-8 h-full flex flex-col justify-between" spotlightColor="rgba(168, 85, 247, 0.15)">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3.5 border-b border-border/80 dark:border-white/10 pb-5">
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
                                    <div key={item} className="flex items-center gap-2 p-2.5 rounded-lg bg-background/50 border border-border/60 dark:border-white/5 text-xs font-medium text-foreground hover:border-primary/40 transition-colors">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SpotlightCard>
                </div>
            </section>

            {/* 6. Academic Background */}
            {education && education.length > 0 && (
                <section className="container mx-auto px-4 md:px-6">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-3">
                            <GraduationCap className="h-3.5 w-3.5" />
                            <span>Formal Education</span>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">
                            Academic <span className="text-gradient">Foundations</span>
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
                                <SpotlightCard
                                    key={edu._id}
                                    className="p-6 transition-all duration-300 hover:scale-[1.01]"
                                    spotlightColor="rgba(56, 189, 248, 0.1)"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                                                <GraduationCap className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-foreground">{edu.title}</h3>
                                                <p className="text-sm text-primary font-medium">{edu.organization}</p>
                                                {edu.description && (
                                                    <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">{edu.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold shrink-0 self-start sm:self-center border border-border/50">
                                            {startYear} – {endYear}
                                        </span>
                                    </div>
                                </SpotlightCard>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* 7. Collaboration CTA Banner */}
            <section className="container mx-auto px-4 md:px-6">
                <SpotlightCard className="p-8 md:p-12 text-center relative overflow-hidden" spotlightColor="rgba(56, 189, 248, 0.15)">
                    <div className="max-w-2xl mx-auto space-y-4 relative z-10">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Let&apos;s Build Together</span>
                        </div>
                        <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-foreground">
                            Have an Infrastructure or Software Project in Mind?
                        </h2>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                            Whether you need network architecture hardening, custom API services, or a high-performance web platform, I&apos;m always ready to collaborate.
                        </p>
                        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-[1.02]"
                            >
                                <Mail className="h-4 w-4" /> Start a Conversation
                            </Link>
                            <Link
                                href="/projects"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border/80 bg-card text-foreground font-semibold text-sm hover:bg-muted/60 transition-all"
                            >
                                View Selected Works
                            </Link>
                        </div>
                    </div>
                </SpotlightCard>
            </section>
        </div>
    );
}
