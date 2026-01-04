"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { ExternalLink, Laptop, Code, Server, Armchair, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface UsesItem {
    _id: string;
    name: string;
    category: string;
    description: string;
    url?: string;
    imageUrl?: string;
    featured: boolean;
    order: number;
}

const categoryIcons: Record<string, any> = {
    Hardware: Laptop,
    Software: Code,
    Services: Server,
    "Desk Setup": Armchair,
    Other: Package
};

export default function UsesPage() {
    const [groupedItems, setGroupedItems] = useState<Record<string, UsesItem[]>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsesItems();
    }, []);

    const fetchUsesItems = async () => {
        try {
            const response = await fetch('/api/uses');
            const data = await response.json();
            if (data.success) {
                setGroupedItems(data.data);
            }
        } catch (error) {
            console.error('Error fetching uses items:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 pt-24 pb-16">
                {/* Hero Section */}
                <section className="container px-4 md:px-6 mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-3xl"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
                            What I Use
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            A collection of tools, software, and hardware that power my daily workflow.
                            From development to productivity, here's what I use to get things done.
                        </p>
                    </motion.div>
                </section>

                {/* Categories */}
                <section className="container px-4 md:px-6 space-y-16">
                    {Object.entries(groupedItems).map(([category, items], categoryIndex) => {
                        const Icon = categoryIcons[category] || Package;

                        return (
                            <motion.div
                                key={category}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: categoryIndex * 0.1 }}
                            >
                                <div className="flex items-center gap-3 mb-8">
                                    <Icon className="h-8 w-8 text-primary" />
                                    <h2 className="text-3xl font-bold">{category}</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {items.map((item, index) => (
                                        <motion.div
                                            key={item._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group border border-border rounded-lg p-6 hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/5"
                                        >
                                            {item.imageUrl && (
                                                <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden bg-muted">
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform"
                                                    />
                                                </div>
                                            )}

                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                                                    {item.name}
                                                </h3>
                                                {item.url && (
                                                    <a
                                                        href={item.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-muted-foreground hover:text-primary transition-colors"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <ExternalLink className="h-5 w-5" />
                                                    </a>
                                                )}
                                            </div>

                                            <p className="text-muted-foreground leading-relaxed">
                                                {item.description}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}

                    {Object.keys(groupedItems).length === 0 && (
                        <div className="text-center py-16">
                            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-xl text-muted-foreground">
                                No items added yet. Check back soon!
                            </p>
                        </div>
                    )}
                </section>
            </main>
            <Footer />
        </div>
    );
}
