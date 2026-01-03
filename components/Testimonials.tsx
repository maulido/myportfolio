"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Quote, Star } from "lucide-react";
import { TestimonialSkeleton } from "./Skeleton";

interface ITestimonial {
    _id: string;
    name: string;
    role: string;
    company: string;
    content: string;
    rating?: number;
    image?: string;
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

    // ... existing code ...

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
        <section id="testimonials" className="py-16 md:py-24 relative">
            <div className="container mx-auto px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Client <span className="text-gradient">Testimonials</span></h2>
                    <p className="mt-4 text-muted-foreground">
                        What people say about working with me.
                    </p>
                </motion.div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
                    {testimonials.map((item, index) => (
                        <motion.div
                            key={item._id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="glass rounded-xl p-8 relative transition-transform hover:-translate-y-1"
                        >
                            <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/20" />
                            <p className="text-lg text-foreground/90 mb-4 italic">&quot;{item.content}&quot;</p>

                            {item.rating && (
                                <div className="flex gap-1 mb-4">
                                    {Array.from({ length: item.rating }).map((_, i) => (
                                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-muted mr-3 overflow-hidden border border-primary/20">
                                    {item.image ? (
                                        <div className="h-full w-full bg-slate-800 flex items-center justify-center text-xs text-muted-foreground">IMG</div>
                                    ) : <div className="h-full w-full bg-slate-800" />}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-primary">{item.name}</h4>
                                    <p className="text-sm text-muted-foreground">{item.role}, {item.company}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
