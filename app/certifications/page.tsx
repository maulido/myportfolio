"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Award, Calendar, ExternalLink, CheckCircle } from "lucide-react";
import Link from "next/link";
import { CertificationSkeleton } from "@/components/Skeleton";

interface ICertification {
    _id: string;
    title: string;
    issuer: string;
    date: string;
    credentialUrl: string;
}

export default function CertificationsPage() {
    const [certs, setCerts] = useState<ICertification[]>([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />
            <main className="flex-1 pt-24 pb-16">
                <div className="container mx-auto px-4 md:px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-4xl font-bold tracking-tighter md:text-5xl lg:text-6xl mb-4">
                            Professional <span className="text-gradient">Certifications</span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-[700px] mx-auto">
                            Validated expertise and continuous learning journey.
                        </p>
                    </motion.div>

                    {loading ? (
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
                            {[1, 2, 3].map((i) => (
                                <CertificationSkeleton key={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
                            {certs.map((cert, index) => (
                                <motion.div
                                    key={cert._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="group relative flex flex-col justify-between rounded-2xl border border-primary/10 bg-card/40 backdrop-blur-md p-8 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden"
                                >
                                    {/* Decoration */}
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>

                                    <div className="relative z-10 mb-8">
                                        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-inner">
                                            <Award className="h-7 w-7" />
                                        </div>
                                        <h3 className="text-2xl font-bold tracking-tight mb-2 group-hover:text-primary transition-colors">{cert.title}</h3>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-[1px] bg-primary/30"></div>
                                            <p className="text-muted-foreground font-semibold uppercase tracking-widest text-[10px]">{cert.issuer}</p>
                                        </div>
                                    </div>

                                    <div className="relative z-10 space-y-6">
                                        <div className="flex items-center text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
                                            <Calendar className="mr-2 h-3 w-3" />
                                            Issued: {new Date(cert.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                                        </div>

                                        {cert.credentialUrl && (
                                            <a
                                                href={cert.credentialUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center w-full md:w-auto h-11 px-6 rounded-xl bg-primary/5 text-sm font-bold text-primary border border-primary/20 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm"
                                            >
                                                Verify Credential
                                                <ExternalLink className="ml-2 h-4 w-4" />
                                            </a>
                                        )}
                                    </div>

                                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                                        <CheckCircle className="h-6 w-6 text-green-500/80 drop-shadow-sm" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
