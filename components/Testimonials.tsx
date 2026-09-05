"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Quote, Star, Sparkles } from "lucide-react";
import { TestimonialSkeleton } from "./Skeleton";
import { SpotlightCard } from "./SpotlightCard";
import Image from "next/image";

interface ITestimonial {
    _id: string;
    name: string;
    role: string;
    company: string;
    content: string;
    rating?: number;
    image?: string;
}

function getInitials(name: string) {
    return (
        name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase() || "U"
    );
}

export function Testimonials() {
    const [testimonials, setTestimonials] = useState<ITestimonial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTestimonials() {
            try {
                const res = await fetch('/api/testimonials');
                const data = await res.json();
                if (data.success) {
                    setTestimonials(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch testimonials", error);
            } finally {
                setLoading(false);
            }
        }
        fetchTestimonials();
    }, []);

    if (loading) {
        return (
            <section id="testimonials" className="py-16 md:py-24 relative">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
                        <TestimonialSkeleton />
                        <TestimonialSkeleton />
                    </div>
                </div>
            </section>
        );
    }

    if (testimonials.length === 0) {
        return null;
    }

    return (
        <section id="testimonials" className="py-16 md:py-24 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />

            <div className="container mx-auto px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-3">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Client Endorsements</span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Client <span className="text-gradient">Testimonials</span></h2>
                    <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
                        What partners and clients say about collaborative impact and engineering results.
                    </p>
                </motion.div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
                    {testimonials.map((item, index) => (
                        <motion.div
                            key={item._id}
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="h-full"
                        >
                            <SpotlightCard
                                className="p-8 relative h-full flex flex-col justify-between group hover:scale-[1.01] transition-all duration-300"
                                spotlightColor="rgba(56, 189, 248, 0.1)"
                            >
                                <Quote className="absolute top-6 right-6 h-8 w-8 text-primary/15 group-hover:text-primary/30 transition-colors pointer-events-none" />

                                <div>
                                    {item.rating && (
                                        <div className="flex items-center gap-1 mb-4">
                                            {Array.from({ length: item.rating }).map((_, i) => (
                                                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]" />
                                            ))}
                                        </div>
                                    )}

                                    <p className="text-base text-foreground/90 leading-relaxed mb-6 italic">
                                        &ldquo;{item.content}&rdquo;
                                    </p>
                                </div>

                                <div className="flex items-center pt-4 border-t border-border/60 dark:border-white/5 mt-auto">
                                    <div className="h-11 w-11 rounded-full mr-3 overflow-hidden border border-primary/20 flex-shrink-0 flex items-center justify-center bg-gradient-to-tr from-primary/20 via-primary/10 to-accent/20 text-primary font-bold text-sm shadow-inner">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                width={44}
                                                height={44}
                                                unoptimized
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span>{getInitials(item.name)}</span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm truncate">{item.name}</h4>
                                        <p className="text-xs text-muted-foreground truncate">{item.role}{item.company ? ` · ${item.company}` : ''}</p>
                                    </div>
                                </div>
                            </SpotlightCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
