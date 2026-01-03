"use client";

import { motion } from 'framer-motion';
import { Award, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ICertification {
    _id: string;
    title: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;
    imageUrl?: string;
    category: string;
    skills: string[];
    description?: string;
}

export function Certifications() {
    const [certs, setCerts] = useState<ICertification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        async function fetchCertifications() {
            try {
                const res = await fetch('/api/certifications');
                const data = await res.json();
                if (data.success) {
                    setCerts(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch certifications', error);
            } finally {
                setLoading(false);
            }
        }
        fetchCertifications();
    }, []);

    if (loading) {
        return (
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4 md:px-6">
                    <h2 className="text-3xl font-bold mb-8">Loading certifications...</h2>
                </div>
            </section>
        );
    }

    if (certs.length === 0) return null;

    const categories = ['all', ...Array.from(new Set(certs.map(c => c.category)))];
    const filteredCerts = filter === 'all' ? certs : certs.filter(c => c.category === filter);

    return (
        <section className="py-16 md:py-24 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-1/2 right-1/4 h-[300px] w-[300px] rounded-full bg-primary/10 blur-[80px] pointer-events-none" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                        Certifications & <span className="text-gradient">Credentials</span>
                    </h2>
                    <p className="mt-4 text-muted-foreground">
                        Professional certifications and industry credentials
                    </p>
                </motion.div>

                {/* Category Filter */}
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === cat
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                    : 'bg-muted/30 hover:bg-muted/50'
                                }`}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Certifications Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCerts.map((cert, i) => (
                        <motion.div
                            key={cert._id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            className="border border-primary/20 rounded-xl p-6 bg-card/40 backdrop-blur-sm hover:border-primary/40 transition-all group"
                        >
                            {/* Certificate Image/Badge */}
                            {cert.imageUrl && (
                                <div className="aspect-video relative mb-4 rounded-lg overflow-hidden bg-muted/20">
                                    <img
                                        src={cert.imageUrl}
                                        alt={cert.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {/* Title */}
                            <div className="flex items-start gap-2 mb-2">
                                <Award className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                                <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                                    {cert.title}
                                </h3>
                            </div>

                            {/* Issuer */}
                            <p className="text-sm text-muted-foreground mb-3 font-medium">
                                {cert.issuer}
                            </p>

                            {/* Description */}
                            {cert.description && (
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                    {cert.description}
                                </p>
                            )}

                            {/* Date */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                                <Calendar className="h-3 w-3" />
                                <span>Issued {new Date(cert.issueDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                {cert.expiryDate && (
                                    <>
                                        <span>•</span>
                                        <span>Expires {new Date(cert.expiryDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                    </>
                                )}
                            </div>

                            {/* Skills */}
                            {cert.skills && cert.skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {cert.skills.slice(0, 3).map(skill => (
                                        <span
                                            key={skill}
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium"
                                        >
                                            <CheckCircle2 className="h-3 w-3" />
                                            {skill}
                                        </span>
                                    ))}
                                    {cert.skills.length > 3 && (
                                        <span className="text-xs text-muted-foreground">
                                            +{cert.skills.length - 3} more
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Credential Link */}
                            {cert.credentialUrl && (
                                <a
                                    href={cert.credentialUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                                >
                                    Verify Credential
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            )}

                            {/* Credential ID */}
                            {cert.credentialId && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    ID: {cert.credentialId}
                                </p>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
