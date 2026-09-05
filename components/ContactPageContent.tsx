"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail,
    MapPin,
    Send,
    Copy,
    Check,
    Clock,
    Calendar,
    ShieldCheck,
    Globe,
    ExternalLink,
    ChevronDown,
    Sparkles,
    Terminal,
    CheckCircle2,
    Loader2,
    MessageCircle,
    Building2,
    Zap
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useSettings } from "@/lib/useSettings";

interface ContactPageContentProps {
    initialSettings?: Record<string, string | undefined>;
}

export function ContactPageContent({ initialSettings }: ContactPageContentProps) {
    const { settings: clientSettings } = useSettings();
    const settings = { ...(initialSettings || {}), ...(clientSettings || {}) };

    // Settings fields with sensible fallbacks
    const heroBadge = settings?.contactHeroBadge || "Direct Channel & Technical Advisory";
    const heroTitle = settings?.contactHeroTitle || "Let's Build Something Exceptional Together";
    const heroSubtitle = settings?.contactHeroSubtitle || "Have an engineering challenge, architectural consultation, or a collaborative project in mind? Reach out directly via the form or my primary communication channels.";
    
    const rawEmail = settings?.contactEmail || "email@example.com";
    const contactEmail = rawEmail.replace(/^mailto:/i, "");
    const rawPhone = settings?.contactPhone || "+62 812-3456-7890";
    const rawWhatsapp = settings?.whatsappNumber || rawPhone.replace(/[^0-9]/g, "");
    const contactLocation = settings?.contactLocation || "Jakarta, Indonesia";
    const responseTime = settings?.contactResponseTime || "Within 2 to 4 hours";
    const workingHours = settings?.contactWorkingHours || "Mon - Fri, 09:00 - 18:00 WIB (UTC+7)";
    const meetingUrl = settings?.contactMeetingUrl || "";

    // Live Jakarta Local Clock
    const [jakartaTime, setJakartaTime] = useState<string>("");
    const [isBusinessHours, setIsBusinessHours] = useState<boolean>(true);

    useEffect(() => {
        const updateClock = () => {
            try {
                const now = new Date();
                const formatter = new Intl.DateTimeFormat("en-US", {
                    timeZone: "Asia/Jakarta",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                });
                setJakartaTime(formatter.format(now));

                // Check if Mon-Fri between 09:00 and 18:00 WIB
                const jakartaHour = parseInt(
                    new Intl.DateTimeFormat("en-US", {
                        timeZone: "Asia/Jakarta",
                        hour: "numeric",
                        hour12: false,
                    }).format(now),
                    10
                );
                const jakartaDay = new Intl.DateTimeFormat("en-US", {
                    timeZone: "Asia/Jakarta",
                    weekday: "short",
                }).format(now);

                const isWeekday = !["Sat", "Sun"].includes(jakartaDay);
                setIsBusinessHours(isWeekday && jakartaHour >= 9 && jakartaHour < 18);
            } catch {
                setJakartaTime("09:00:00 AM");
            }
        };

        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    // Form state
    const [selectedCategory, setSelectedCategory] = useState("Full-Stack Development");
    const [selectedTimeline, setSelectedTimeline] = useState("1 - 3 Months");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [honeypot, setHoneypot] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [copiedItem, setCopiedItem] = useState<string | null>(null);

    // FAQ Accordion State
    const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

    const categories = [
        "Full-Stack Development",
        "Network Architecture & Routing",
        "Cloud & DevOps Infrastructure",
        "Technical Advisory & Audit",
        "General Inquiry"
    ];

    const timelines = [
        "Immediate (< 1 Month)",
        "1 - 3 Months",
        "Quarterly / Long-Term",
        "Flexible Exploration"
    ];

    const faqs = [
        {
            q: "What is your typical turnaround time for new project inquiries?",
            a: "I review and reply to all professional inquiries within 2 to 4 business hours. If your message is sent during evenings or weekends, I will reply first thing the next business morning."
        },
        {
            q: "Are you available for international or remote contract engagements?",
            a: "Yes. I have extensive experience collaborating asynchronously across diverse time zones with distributed engineering teams, as well as providing on-site technical architecture consulting."
        },
        {
            q: "What are your primary technology domains?",
            a: "My core expertise bridges two high-impact domains: modern Full-Stack Software Engineering (Next.js, React, TypeScript, Node.js, Cloud Native) and Enterprise Network Infrastructure (Cisco, MikroTik, BGP, OSPF, VLANs, and Network Security)."
        },
        {
            q: "Can you sign a mutual Non-Disclosure Agreement (NDA) before sharing project specs?",
            a: "Absolutely. I respect intellectual property and proprietary architectures. Feel free to request an NDA execution prior to sharing technical documents or repository access."
        },
        {
            q: "How do you structure project consulting and implementation milestones?",
            a: "Every engagement begins with a technical discovery phase to define scope, architectural requirements, and risk mitigation. Deliverables are organized into transparent sprint milestones with continuous testing and documentation."
        }
    ];

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedItem(label);
        toast.success(`${label} copied to clipboard!`, {
            duration: 2500,
            style: {
                background: "#0f172a",
                color: "#f8fafc",
                border: "1px solid rgba(255,255,255,0.1)",
            },
        });
        setTimeout(() => setCopiedItem(null), 2500);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (honeypot) return; // Silent discard for bot spam

        if (!firstName.trim() || !email.trim() || !message.trim()) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);

        try {
            const formattedMessage = `[Inquiry: ${selectedCategory} | Timeline: ${selectedTimeline}]\n\n${message.trim()}`;
            const payload = {
                name: `${firstName.trim()} ${lastName.trim()}`.trim(),
                email: email.trim(),
                message: formattedMessage,
            };

            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setIsSuccess(true);
                toast.success("Your message has been sent successfully!");
            } else {
                toast.error(data.error || "Failed to dispatch message. Please try again.");
            }
        } catch {
            toast.error("Network error while submitting. Please try reaching out directly via email.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setIsSuccess(false);
        setFirstName("");
        setLastName("");
        setEmail("");
        setMessage("");
        setSelectedCategory(categories[0]);
        setSelectedTimeline(timelines[1]);
    };

    return (
        <div className="relative overflow-hidden pb-24">
            <Toaster position="top-right" />

            {/* Background Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-[140px] pointer-events-none -z-10" />

            {/* Section 1: Hero Header */}
            <div className="container mx-auto px-4 md:px-6 pt-6 pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-3xl"
                >
                    {/* Live Status Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <span>{heroBadge}</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15] mb-4">
                        {heroTitle.includes(" ") ? (
                            <>
                                {heroTitle.substring(0, heroTitle.lastIndexOf(" "))}{" "}
                                <span className="text-gradient">
                                    {heroTitle.substring(heroTitle.lastIndexOf(" ") + 1)}
                                </span>
                            </>
                        ) : (
                            <span className="text-gradient">{heroTitle}</span>
                        )}
                    </h1>

                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                        {heroSubtitle}
                    </p>
                </motion.div>

                {/* Section 2: Quick Action Connectivity Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10"
                >
                    {/* Card 1: Direct Email */}
                    <div className="group relative p-5 rounded-2xl bg-card/60 backdrop-blur-md border border-border hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                <Mail className="h-5 w-5" />
                            </div>
                            <button
                                onClick={() => copyToClipboard(contactEmail, "Email")}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                title="Copy Email"
                                aria-label="Copy Email"
                            >
                                {copiedItem === "Email" ? (
                                    <Check className="h-4 w-4 text-emerald-500" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Direct Email</p>
                        <a
                            href={`mailto:${contactEmail}`}
                            className="font-bold text-foreground hover:text-primary text-sm transition-colors truncate block mt-1"
                        >
                            {contactEmail}
                        </a>
                        <p className="text-[11px] text-muted-foreground/80 mt-1">1-click mailto or copy</p>
                    </div>

                    {/* Card 2: Instant WhatsApp / Chat */}
                    <div className="group relative p-5 rounded-2xl bg-card/60 backdrop-blur-md border border-border hover:border-emerald-500/50 transition-all duration-300 shadow-sm hover:shadow-md">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                                <MessageCircle className="h-5 w-5" />
                            </div>
                            <button
                                onClick={() => copyToClipboard(rawPhone, "Phone Number")}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                                title="Copy Phone Number"
                                aria-label="Copy Phone Number"
                            >
                                {copiedItem === "Phone Number" ? (
                                    <Check className="h-4 w-4 text-emerald-500" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">WhatsApp & Direct Call</p>
                        <a
                            href={`https://wa.me/${rawWhatsapp}?text=${encodeURIComponent("Hello Maulido, I would like to discuss a project inquiry.")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-foreground hover:text-emerald-500 text-sm transition-colors truncate block mt-1"
                        >
                            {rawPhone}
                        </a>
                        <p className="text-[11px] text-muted-foreground/80 mt-1">Instant messaging</p>
                    </div>

                    {/* Card 3: Local Timezone & Status */}
                    <div className="group relative p-5 rounded-2xl bg-card/60 backdrop-blur-md border border-border hover:border-amber-500/50 transition-all duration-300 shadow-sm hover:shadow-md">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                                <Clock className="h-5 w-5" />
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                isBusinessHours
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                    : "bg-muted text-muted-foreground border-border"
                            }`}>
                                {isBusinessHours ? "Business Hours" : "Standby"}
                            </span>
                        </div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Local Time (WIB)</p>
                        <p className="font-mono font-bold text-foreground text-sm mt-1">
                            {jakartaTime || "09:00:00 AM"} <span className="text-xs text-muted-foreground font-sans">UTC+7</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground/80 mt-1">Base: {contactLocation}</p>
                    </div>

                    {/* Card 4: Meeting / Technical Discovery */}
                    <div className="group relative p-5 rounded-2xl bg-card/60 backdrop-blur-md border border-border hover:border-blue-500/50 transition-all duration-300 shadow-sm hover:shadow-md">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <Zap className="h-4 w-4 text-blue-500" />
                        </div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Consultation</p>
                        {meetingUrl ? (
                            <a
                                href={meetingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-foreground hover:text-blue-500 text-sm transition-colors flex items-center gap-1 mt-1"
                            >
                                <span>Schedule Video Call</span>
                                <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                        ) : (
                            <p className="font-bold text-foreground text-sm mt-1">
                                15-Min Discovery
                            </p>
                        )}
                        <p className="text-[11px] text-muted-foreground/80 mt-1">Response: {responseTime}</p>
                    </div>
                </motion.div>
            </div>

            {/* Section 3: Dual Column Workspace (Profile/Trust Left, Interactive Form Right) */}
            <div className="container mx-auto px-4 md:px-6 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Left Column: Technical Advisory & Assurance (5 cols) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-5 space-y-6"
                    >
                        {/* Advisory Profile Card */}
                        <div className="p-6 rounded-3xl bg-card/70 backdrop-blur-md border border-border space-y-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                                    <Building2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">Operational Protocol</h3>
                                    <p className="text-xs text-muted-foreground">Engineering standards & client commitments</p>
                                </div>
                            </div>

                            <div className="space-y-4 text-xs sm:text-sm">
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
                                    <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-foreground">Response SLA</p>
                                        <p className="text-muted-foreground text-xs mt-0.5">{responseTime} during regular working days.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
                                    <Globe className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-foreground">Working Hours & Timezone</p>
                                        <p className="text-muted-foreground text-xs mt-0.5">{workingHours}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
                                    <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-foreground">Confidentiality & Non-Disclosure</p>
                                        <p className="text-muted-foreground text-xs mt-0.5">Mutual NDA execution ready for enterprise codebases and proprietary specs.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Core Engineering Competencies */}
                            <div className="pt-2 border-t border-border/60">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                    Core Advisory Focus
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {[
                                        "Enterprise Networking",
                                        "Full-Stack Next.js 16",
                                        "BGP & OSPF Routing",
                                        "Microservices & APIs",
                                        "Cloud Architecture",
                                        "Security & Hardening"
                                    ].map((skill, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2.5 py-1 rounded-lg bg-primary/5 border border-primary/15 text-foreground/90 text-xs font-medium"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Location Preview Card */}
                        <div className="p-6 rounded-3xl bg-card/70 backdrop-blur-md border border-border space-y-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-foreground">Base of Operations</h4>
                                    <p className="text-xs text-muted-foreground">{contactLocation}</p>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Operating from Jakarta, Indonesia (UTC+7). Open to full-time remote contracts, hybrid technical leadership, and global on-site consultations.
                            </p>
                        </div>
                    </motion.div>

                    {/* Right Column: Interactive Inquiry Form (7 cols) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-7"
                    >
                        <div className="relative rounded-3xl border border-border bg-card/80 backdrop-blur-xl p-6 sm:p-8 md:p-10 shadow-xl">
                            {isSuccess ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12 space-y-5"
                                >
                                    <div className="h-16 w-16 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                                        <CheckCircle2 className="h-8 w-8" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold text-foreground">Message Dispatched!</h3>
                                        <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
                                            Thank you for reaching out. Your inquiry has been securely stored and forwarded to my direct inbox. I will review it and reply within {responseTime.toLowerCase()}.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="inline-flex items-center justify-center rounded-xl bg-primary text-white font-semibold text-sm px-6 py-3 shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
                                    >
                                        Send Another Inquiry
                                    </button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Category Pill Selector */}
                                    <div className="space-y-2.5">
                                        <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                                            <Terminal className="h-3.5 w-3.5 text-primary" />
                                            <span>Project Type / Inquiry Topic</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {categories.map((cat) => {
                                                const isSelected = selectedCategory === cat;
                                                return (
                                                    <button
                                                        key={cat}
                                                        type="button"
                                                        onClick={() => setSelectedCategory(cat)}
                                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                                                            isSelected
                                                                ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                                                                : "bg-background/80 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                                                        }`}
                                                    >
                                                        {cat}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Name Fields */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-foreground">
                                                First Name <span className="text-destructive">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                placeholder="e.g. Alex"
                                                className="w-full h-11 px-3.5 rounded-xl bg-background/60 border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-foreground">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                placeholder="e.g. Morgan"
                                                className="w-full h-11 px-3.5 rounded-xl bg-background/60 border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-foreground">
                                            Your Email Address <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="alex@company.com"
                                            className="w-full h-11 px-3.5 rounded-xl bg-background/60 border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all outline-none"
                                        />
                                    </div>

                                    {/* Estimated Timeline / Urgency */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5 text-primary" />
                                            <span>Estimated Timeline</span>
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {timelines.map((t) => {
                                                const isSelected = selectedTimeline === t;
                                                return (
                                                    <button
                                                        key={t}
                                                        type="button"
                                                        onClick={() => setSelectedTimeline(t)}
                                                        className={`px-2.5 py-2 rounded-xl text-xs font-medium text-center transition-all border ${
                                                            isSelected
                                                                ? "bg-card border-primary text-primary font-bold shadow-sm"
                                                                : "bg-background/60 border-border text-muted-foreground hover:text-foreground"
                                                        }`}
                                                    >
                                                        {t}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Honeypot for Anti-spam bots */}
                                    <input
                                        type="text"
                                        name="website"
                                        value={honeypot}
                                        onChange={(e) => setHoneypot(e.target.value)}
                                        tabIndex={-1}
                                        autoComplete="off"
                                        className="hidden"
                                    />

                                    {/* Message */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-semibold text-foreground">
                                                Project Details / Message <span className="text-destructive">*</span>
                                            </label>
                                            <span className="text-[11px] text-muted-foreground">
                                                {message.length} chars
                                            </span>
                                        </div>
                                        <textarea
                                            required
                                            rows={5}
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Tell me about your project goals, technical constraints, current stack, or the specific architectural problem you'd like to solve..."
                                            className="w-full p-3.5 rounded-xl bg-background/60 border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all outline-none resize-y"
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full h-12 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Transmitting Message...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Transmit Inquiry</span>
                                                <Send className="h-4 w-4" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Section 4: Frequently Asked Questions (FAQ) */}
            <div className="container mx-auto px-4 md:px-6 mt-20">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Inquiry Clarifications</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Helpful details regarding communication cadence, contracting terms, and technical discovery.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {faqs.map((faq, idx) => {
                            const isExpanded = expandedFaq === idx;
                            return (
                                <div
                                    key={idx}
                                    className="rounded-2xl border border-border bg-card/60 backdrop-blur-md overflow-hidden transition-colors"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                                        className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-semibold text-sm sm:text-base text-foreground hover:text-primary transition-colors gap-4"
                                    >
                                        <span>{faq.q}</span>
                                        <ChevronDown
                                            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                                                isExpanded ? "rotate-180 text-primary" : ""
                                            }`}
                                        />
                                    </button>
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                                                    {faq.a}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
