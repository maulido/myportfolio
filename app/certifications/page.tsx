"use client";
import Link from "next/link";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Award, Calendar, ExternalLink, CheckCircle, Search, TrendingUp, Clock } from "lucide-react";
import CertificationDetailModal from "@/components/CertificationDetailModal";

interface ICertification {
    _id: string;
    title: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;
    imageUrl?: string;
    certificateFileUrl?: string;
    category: string;
    skills: string[];
    description?: string;
}

export default function CertificationsPage() {
    const [certs, setCerts] = useState<ICertification[]>([]);
    const [filteredCerts, setFilteredCerts] = useState<ICertification[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [selectedCert, setSelectedCert] = useState<ICertification | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        async function fetchCerts() {
            try {
                const res = await fetch('/api/certifications');
                const data = await res.json();
                if (data.success) {
                    setCerts(data.data);
                    setFilteredCerts(data.data);
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
    const allCategories = ["All", ...new Set(certs.map(c => c.category))];

    // Calculate stats
    const stats = {
        total: certs.length,
        active: certs.filter(c => !c.expiryDate || new Date(c.expiryDate) > new Date()).length,
        expired: certs.filter(c => c.expiryDate && new Date(c.expiryDate) <= new Date()).length,
        categories: new Set(certs.map(c => c.category)).size
    };

    // Filter certifications
    useEffect(() => {
        let filtered = certs;

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(c =>
                c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Filter by category
        if (selectedCategory !== "All") {
            filtered = filtered.filter(c => c.category === selectedCategory);
        }

        setFilteredCerts(filtered);
    }, [searchQuery, selectedCategory, certs]);

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
            <main className="flex-1 pt-24 pb-16">
                {/* Breadcrumbs */}
                <div className="container mx-auto px-4 md:px-6 pb-4">
                    <nav className="text-sm text-muted-foreground">

                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground">Certifications</span>
                    </nav>
                </div>

                <div className="container mx-auto px-4 md:px-6">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl font-bold tracking-tighter md:text-5xl lg:text-6xl mb-4">
                            Professional <span className="text-gradient">Certifications</span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-[700px] mx-auto">
                            Validated expertise and continuous learning journey across various technologies and domains.
                        </p>
                    </motion.div>

                    {/* Stats Dashboard */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-6 rounded-xl bg-card/40 border border-primary/10 text-center"
                        >
                            <Award className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                            <div className="text-3xl font-bold">{stats.total}</div>
                            <div className="text-xs text-muted-foreground mt-1">Total Certifications</div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-6 rounded-xl bg-card/40 border border-primary/10 text-center"
                        >
                            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                            <div className="text-3xl font-bold">{stats.active}</div>
                            <div className="text-xs text-muted-foreground mt-1">Active/Valid</div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-6 rounded-xl bg-card/40 border border-primary/10 text-center"
                        >
                            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                            <div className="text-3xl font-bold">{stats.categories}</div>
                            <div className="text-xs text-muted-foreground mt-1">Categories</div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="p-6 rounded-xl bg-card/40 border border-primary/10 text-center"
                        >
                            <Clock className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                            <div className="text-3xl font-bold">{stats.expired}</div>
                            <div className="text-xs text-muted-foreground mt-1">Expired</div>
                        </motion.div>
                    </div>

                    {/* Search and Filters */}
                    <div className="mb-8 space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search certifications, issuers, or skills..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-primary/20 bg-card/40 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2">
                            {allCategories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === cat
                                        ? "bg-primary text-white shadow-lg shadow-primary/25"
                                        : "bg-card/40 border border-primary/20 hover:border-primary/40"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results Count */}
                    <p className="text-sm text-muted-foreground mb-6">
                        Showing {filteredCerts.length} of {certs.length} certifications
                    </p>

                    {/* Certifications Grid */}
                    {loading ? (
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-64 rounded-2xl bg-muted/20 animate-pulse" />
                            ))}
                        </div>
                    ) : filteredCerts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                            <div className="mb-6 p-4 rounded-full bg-muted/30 text-muted-foreground">
                                <Award className="h-12 w-12" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No Certifications Found</h3>
                            <p className="text-muted-foreground max-w-md mb-6">
                                Try adjusting your search or filter criteria.
                            </p>
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setSelectedCategory("All");
                                }}
                                className="px-6 py-3 bg-primary text-white rounded-xl font-bold"
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
                            {filteredCerts.map((cert, index) => {
                                const isExpired = cert.expiryDate && new Date(cert.expiryDate) <= new Date();
                                const isLifetime = !cert.expiryDate;

                                return (
                                    <motion.div
                                        key={cert._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => handleCertClick(cert)}
                                        className="group relative flex flex-col justify-between rounded-2xl border border-primary/10 bg-card/40 backdrop-blur-md p-8 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden cursor-pointer"
                                    >
                                        {/* Decoration */}
                                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>

                                        {/* Certificate Image/Badge */}
                                        {cert.imageUrl && (
                                            <div className="aspect-video relative mb-4 rounded-lg overflow-hidden bg-muted/20 border border-primary/10">
                                                <Image
                                                    src={cert.imageUrl}
                                                    alt={cert.title}
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    fill
                                                    unoptimized
                                                />
                                            </div>
                                        )}

                                        <div className="relative z-10 mb-8">
                                            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-inner">
                                                <Award className="h-7 w-7" />
                                            </div>
                                            <h3 className="text-2xl font-bold tracking-tight mb-2 group-hover:text-primary transition-colors">{cert.title}</h3>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-[1px] bg-primary/30"></div>
                                                <p className="text-muted-foreground font-semibold uppercase tracking-widest text-[10px]">{cert.issuer}</p>
                                            </div>

                                            {/* Category Badge */}
                                            <div className="mt-4">
                                                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                                    {cert.category}
                                                </span>
                                            </div>

                                            {/* Skills */}
                                            {cert.skills && cert.skills.length > 0 && (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {cert.skills.slice(0, 3).map((skill, idx) => (
                                                        <span key={idx} className="text-xs px-2 py-1 rounded-md bg-muted/30 text-muted-foreground">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {cert.skills.length > 3 && (
                                                        <span className="text-xs px-2 py-1 rounded-md bg-muted/30 text-muted-foreground">
                                                            +{cert.skills.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="relative z-10 space-y-4">
                                            <div className="flex items-center text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
                                                <Calendar className="mr-2 h-3 w-3" />
                                                Issued: {new Date(cert.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                                            </div>

                                            {/* Validity Badge */}
                                            <div className="flex items-center gap-2">
                                                {isLifetime ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold">
                                                        <CheckCircle className="h-3 w-3" />
                                                        Lifetime Valid
                                                    </span>
                                                ) : isExpired ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold">
                                                        <Clock className="h-3 w-3" />
                                                        Expired
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold">
                                                        <CheckCircle className="h-3 w-3" />
                                                        Valid
                                                    </span>
                                                )}
                                            </div>

                                            <div className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                                View Details
                                                <ExternalLink className="h-3 w-3" />
                                            </div>
                                        </div>

                                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                                            <CheckCircle className="h-6 w-6 text-green-500/80 drop-shadow-sm" />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* Detail Modal */}
            {
                selectedCert && (
                    <CertificationDetailModal
                        certification={selectedCert}
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                    />
                )
            }
        </div>
    );
}
