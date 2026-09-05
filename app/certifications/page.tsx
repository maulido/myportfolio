"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Breadcrumb } from "@/components/Breadcrumb";
import { 
    Award, 
    Calendar, 
    ExternalLink, 
    CheckCircle2, 
    Search, 
    TrendingUp, 
    Clock, 
    ShieldCheck, 
    X, 
    ChevronRight,
    Lock
} from "lucide-react";
import CertificationDetailModal from "@/components/CertificationDetailModal";
import { SpotlightCard } from "@/components/SpotlightCard";
import { useSettings } from "@/lib/useSettings";
import { useLanguage } from "@/context/LanguageContext";
import { getLocalizedField } from "@/lib/localization";

interface ICertification {
    _id: string;
    title: string;
    title_id?: string;
    issuer: string;
    issuer_id?: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;
    imageUrl?: string;
    certificateFileUrl?: string;
    category: string;
    skills: string[];
    description?: string;
    description_id?: string;
}

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#1e293b" offset="20%" />
      <stop stop-color="#334155" offset="50%" />
      <stop stop-color="#1e293b" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#1e293b" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
    typeof window === 'undefined'
        ? Buffer.from(str).toString('base64')
        : window.btoa(str);

const getShimmerDataUrl = (w: number, h: number) =>
    `data:image/svg+xml;base64,${toBase64(shimmer(w, h))}`;

export default function CertificationsPage() {
    const [certs, setCerts] = useState<ICertification[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [activeOnly, setActiveOnly] = useState(false);
    const [selectedCert, setSelectedCert] = useState<ICertification | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { get } = useSettings();
    const { dictionary, locale } = useLanguage();

    const heroBadge = locale === 'id'
        ? get("certificationsHeroBadge_id", dictionary.certifications.badge)
        : get("certificationsHeroBadge", dictionary.certifications.badge);
    const heroTitle = locale === 'id'
        ? get("certificationsHeroTitle_id", dictionary.certifications.title)
        : get("certificationsHeroTitle", dictionary.certifications.title);
    const heroSubtitle = locale === 'id'
        ? get("certificationsHeroSubtitle_id", dictionary.certifications.subtitle)
        : get("certificationsHeroSubtitle", dictionary.certifications.subtitle);
    const trustTitle = locale === 'id'
        ? get("certificationsTrustTitle_id", "Otentisitas & Verifikasi Terjamin")
        : get("certificationsTrustTitle", "Authenticity & Verification Guaranteed");
    const trustDesc = locale === 'id'
        ? get("certificationsTrustDesc_id", "Seluruh sertifikasi industri didukung oleh ID kredensial digital resmi, URL verifikasi kriptografis, dan portal penerbit langsung (Cisco, MikroTik, AWS, Google Cloud, CompTIA).")
        : get("certificationsTrustDesc", "All industry certifications listed are backed by official digital credential IDs, cryptographic verification URLs, and direct issuing portal references (Cisco, MikroTik, AWS, Google Cloud, CompTIA).");

    useEffect(() => {
        async function fetchCerts() {
            try {
                const res = await fetch('/api/certifications');
                const data = await res.json();
                if (data.success) {
                    setCerts(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch certifications", error);
            } finally {
                setLoading(false);
            }
        }
        fetchCerts();
    }, []);

    // Get unique categories
    const allCategories = useMemo(() => {
        const cats = new Set<string>();
        certs.forEach(c => {
            if (c.category && c.category.trim() !== "") {
                cats.add(c.category);
            }
        });
        return ["All", ...Array.from(cats)];
    }, [certs]);

    // Calculate stats
    const stats = useMemo(() => {
        const total = certs.length;
        const active = certs.filter(c => !c.expiryDate || new Date(c.expiryDate) > new Date()).length;
        const categoriesCount = new Set(certs.map(c => c.category)).size;
        return {
            total,
            active,
            categories: categoriesCount,
        };
    }, [certs]);

    // Filter certifications
    const filteredCerts = useMemo(() => {
        return certs.filter(c => {
            const locTitle = getLocalizedField(c, "title", locale, c.title);
            const locIssuer = getLocalizedField(c, "issuer", locale, c.issuer);
            const matchesSearch = !searchQuery ||
                locTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                locIssuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (c.skills || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;

            const isExpired = c.expiryDate && new Date(c.expiryDate) <= new Date();
            const matchesActive = !activeOnly || !isExpired;

            return matchesSearch && matchesCategory && matchesActive;
        });
    }, [certs, searchQuery, selectedCategory, activeOnly, locale]);

    const handleCertClick = (cert: ICertification) => {
        setSelectedCert(cert);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedCert(null), 300);
    };

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />
            <main className="flex-1 pt-20 pb-20">
                {/* Ambient Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />

                {/* Breadcrumbs */}
                <div className="container mx-auto px-4 md:px-6 py-4">
                    <Breadcrumb items={[{ label: "Certifications" }]} />
                </div>

                {/* Hero Header */}
                <section className="container mx-auto px-4 md:px-6 pt-4 pb-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="max-w-2xl"
                        >
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-3">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                <span>{heroBadge}</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                                {heroTitle.includes(" ") ? (
                                    <>
                                        {heroTitle.substring(0, heroTitle.lastIndexOf(" "))}{" "}
                                        <span className="text-gradient">
                                            {heroTitle.substring(heroTitle.lastIndexOf(" ") + 1)}
                                        </span>
                                    </>
                                ) : (
                                    <span>{heroTitle}</span>
                                )}
                            </h1>
                            <p className="mt-3 text-base md:text-lg text-muted-foreground leading-relaxed">
                                {heroSubtitle}
                            </p>
                        </motion.div>

                        {/* Top Trust Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="flex items-center gap-2 self-start md:self-end px-4 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold"
                        >
                            <Lock className="h-3.5 w-3.5" />
                            <span>100% Cryptographically Verifiable</span>
                        </motion.div>
                    </div>
                </section>

                {/* Stats Dashboard */}
                <section className="container mx-auto px-4 md:px-6 mb-10">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                        >
                            <SpotlightCard className="p-5 h-full flex flex-col justify-between group hover:scale-[1.02] transition-all">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                                        <Award className="h-5 w-5" />
                                    </div>
                                    <span className="text-2xl font-extrabold text-foreground group-hover:text-primary transition-colors">
                                        {stats.total}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-foreground">Total Credentials</h4>
                                    <p className="text-[11px] text-muted-foreground">Formally Awarded</p>
                                </div>
                            </SpotlightCard>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <SpotlightCard className="p-5 h-full flex flex-col justify-between group hover:scale-[1.02] transition-all">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <span className="text-2xl font-extrabold text-foreground group-hover:text-emerald-500 transition-colors">
                                        {stats.active}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-foreground">Active & Valid</h4>
                                    <p className="text-[11px] text-muted-foreground">Current Standing</p>
                                </div>
                            </SpotlightCard>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                        >
                            <SpotlightCard className="p-5 h-full flex flex-col justify-between group hover:scale-[1.02] transition-all">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
                                        <TrendingUp className="h-5 w-5" />
                                    </div>
                                    <span className="text-2xl font-extrabold text-foreground group-hover:text-purple-500 transition-colors">
                                        {stats.categories}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-foreground">Technical Domains</h4>
                                    <p className="text-[11px] text-muted-foreground">Breadth of Knowledge</p>
                                </div>
                            </SpotlightCard>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <SpotlightCard className="p-5 h-full flex flex-col justify-between group hover:scale-[1.02] transition-all">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <span className="text-2xl font-extrabold text-foreground group-hover:text-amber-500 transition-colors">
                                        100%
                                    </span>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-foreground">Verified Accreditations</h4>
                                    <p className="text-[11px] text-muted-foreground">With Digital Hashes</p>
                                </div>
                            </SpotlightCard>
                        </motion.div>
                    </div>
                </section>

                {/* Filter and Search Controls */}
                <section className="container mx-auto px-4 md:px-6 mb-8">
                    <div className="p-4 md:p-6 rounded-2xl border border-border/80 dark:border-white/10 bg-card/70 backdrop-blur-md shadow-sm space-y-4">
                        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                            {/* Search Input */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder={dictionary.certifications.searchPlaceholder}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border border-border/80 dark:border-white/10 bg-background/60 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/60"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted text-muted-foreground"
                                        title="Clear search"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Active Filter Toggle */}
                            <button
                                onClick={() => setActiveOnly(!activeOnly)}
                                className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all self-end md:self-auto ${
                                    activeOnly
                                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-xs"
                                        : "border-border/80 bg-background/50 text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>{dictionary.certifications.activeStatus} {locale === 'id' ? "Saja" : "Only"}</span>
                            </button>
                        </div>

                        {/* Category Filter Tabs */}
                        <div className="flex flex-wrap gap-2 items-center pt-1 border-t border-border/60 dark:border-white/5">
                            <span className="text-xs font-semibold text-muted-foreground mr-1 shrink-0">
                                Domain:
                            </span>
                            {allCategories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        selectedCategory === cat
                                            ? "bg-primary text-white shadow-xs"
                                            : "bg-background/60 border border-border/60 hover:border-primary/40 text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {cat === "All" ? dictionary.certifications.filterAll : cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results Count & Reset Indicator */}
                    <div className="flex items-center justify-between gap-4 mt-6">
                        <p className="text-xs md:text-sm text-muted-foreground font-medium">
                            {dictionary.certifications.showing} <span className="font-bold text-foreground">{filteredCerts.length}</span> {dictionary.certifications.of} {certs.length} {dictionary.certifications.credentialsCount}
                        </p>
                        {(searchQuery || selectedCategory !== "All" || activeOnly) && (
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setSelectedCategory("All");
                                    setActiveOnly(false);
                                }}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            >
                                <X className="h-3.5 w-3.5" />
                                <span>{dictionary.certifications.clearFilters}</span>
                            </button>
                        )}
                    </div>
                </section>

                {/* Certifications Grid */}
                <section className="container mx-auto px-4 md:px-6">
                    {loading ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-72 rounded-2xl bg-card/40 border border-border/80 animate-pulse" />
                            ))}
                        </div>
                    ) : filteredCerts.length === 0 ? (
                        <SpotlightCard className="p-12 md:p-16 text-center max-w-lg mx-auto">
                            <div className="h-14 w-14 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto mb-4">
                                <Award className="h-7 w-7" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">{dictionary.certifications.noCertificationsFound}</h3>
                            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                                {dictionary.certifications.noCertificationsDesc}
                            </p>
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setSelectedCategory("All");
                                    setActiveOnly(false);
                                }}
                                className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
                            >
                                {dictionary.certifications.clearFilters}
                            </button>
                        </SpotlightCard>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <AnimatePresence mode="popLayout">
                                {filteredCerts.map((cert, index) => {
                                    const isExpired = cert.expiryDate && new Date(cert.expiryDate) <= new Date();
                                    const isLifetime = !cert.expiryDate;
                                    const certTitle = getLocalizedField(cert, "title", locale, cert.title);
                                    const certIssuer = getLocalizedField(cert, "issuer", locale, cert.issuer);

                                    return (
                                        <motion.div
                                            key={cert._id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            transition={{ duration: 0.3, delay: index * 0.04 }}
                                            className="h-full"
                                        >
                                            <SpotlightCard
                                                onClick={() => handleCertClick(cert)}
                                                className="p-6 h-full flex flex-col justify-between cursor-pointer group hover:scale-[1.02] transition-all duration-300"
                                                spotlightColor="rgba(56, 189, 248, 0.12)"
                                            >
                                                <div>
                                                    {/* Certificate Image or Emblem */}
                                                    {cert.imageUrl ? (
                                                        <div className="aspect-video relative mb-5 rounded-xl overflow-hidden bg-muted/20 border border-border/60">
                                                            <Image
                                                                src={cert.imageUrl}
                                                                alt={certTitle}
                                                                fill
                                                                placeholder="blur"
                                                                blurDataURL={getShimmerDataUrl(400, 240)}
                                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                                sizes="(max-width: 768px) 100vw, 360px"
                                                                unoptimized
                                                            />
                                                            <div className="absolute top-2 right-2 z-10">
                                                                {isLifetime ? (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/90 backdrop-blur-md text-slate-950 text-[10px] font-bold shadow-xs">
                                                                        <CheckCircle2 className="h-3 w-3" /> {dictionary.certifications.doesNotExpire}
                                                                    </span>
                                                                ) : isExpired ? (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/90 backdrop-blur-md text-white text-[10px] font-bold shadow-xs">
                                                                        <Clock className="h-3 w-3" /> {dictionary.certifications.expiredStatus}
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/90 backdrop-blur-md text-slate-950 text-[10px] font-bold shadow-xs">
                                                                        <CheckCircle2 className="h-3 w-3" /> {dictionary.certifications.activeStatus}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                                                <Award className="h-6 w-6" />
                                                            </div>
                                                            {isLifetime ? (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                                                                    <CheckCircle2 className="h-3 w-3" /> {dictionary.certifications.doesNotExpire}
                                                                </span>
                                                            ) : isExpired ? (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold border border-red-500/20">
                                                                    <Clock className="h-3 w-3" /> {dictionary.certifications.expiredStatus}
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                                                                    <CheckCircle2 className="h-3 w-3" /> {dictionary.certifications.activeStatus}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Title and Issuer */}
                                                    <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-1.5">
                                                        {certTitle}
                                                    </h3>
                                                    <p className="text-xs text-primary/80 font-bold uppercase tracking-wider mb-3">
                                                        {certIssuer}
                                                    </p>

                                                    {/* Category */}
                                                    {cert.category && (
                                                        <div className="mb-3">
                                                            <span className="inline-block px-2.5 py-0.5 rounded-md bg-muted/60 dark:bg-muted/40 text-muted-foreground text-[11px] font-medium border border-border/50">
                                                                {cert.category}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Skills Tags */}
                                                    {cert.skills && cert.skills.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                                            {cert.skills.slice(0, 3).map((skill, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="text-[10px] font-medium px-2 py-0.5 rounded bg-background/60 text-muted-foreground border border-border/40"
                                                                >
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                            {cert.skills.length > 3 && (
                                                                <span className="text-[10px] text-muted-foreground/60 self-center">
                                                                    +{cert.skills.length - 3} {locale === 'id' ? "lagi" : "more"}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Card Footer */}
                                                <div className="pt-4 mt-auto border-t border-border/60 dark:border-white/5 flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground/70 flex items-center gap-1 text-[11px]">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {new Date(cert.issueDate).toLocaleDateString(locale === 'id' ? "id-ID" : "en-US", { year: 'numeric', month: 'short' })}
                                                    </span>

                                                    <div className="inline-flex items-center gap-1 font-bold text-primary group-hover:gap-1.5 transition-all">
                                                        <span>{dictionary.certifications.viewCredential}</span>
                                                        <ChevronRight className="h-3.5 w-3.5" />
                                                    </div>
                                                </div>
                                            </SpotlightCard>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </section>

                {/* Verification Reassurance Banner */}
                <section className="container mx-auto px-4 md:px-6 pt-16">
                    <SpotlightCard className="p-8 md:p-12 relative overflow-hidden" spotlightColor="rgba(56, 189, 248, 0.15)">
                        <div className="grid gap-6 md:grid-cols-12 items-center">
                            <div className="md:col-span-8 space-y-2">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    <span>Accreditation Guarantee</span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                                    {trustTitle}
                                </h3>
                                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-2xl">
                                    {trustDesc}
                                </p>
                            </div>
                            <div className="md:col-span-4 flex md:justify-end">
                                <button
                                    onClick={() => window.dispatchEvent(new Event("open-cv-modal"))}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-[1.02] cursor-pointer"
                                >
                                    <span>Download Resume with Certifications</span>
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    </SpotlightCard>
                </section>
            </main>

            {/* Detail Modal */}
            {selectedCert && (
                <CertificationDetailModal
                    certification={selectedCert}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}
