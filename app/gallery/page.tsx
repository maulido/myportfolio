"use client";
import { Breadcrumb } from "@/components/Breadcrumb";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import Image from "next/image";
import { X, ZoomIn, Calendar } from "lucide-react";
import { GallerySkeleton } from "@/components/Skeleton";

interface IGalleryItem {
    _id: string;
    title: string;
    description: string;
    imageUrl: string;
    category: string;
    date: string;
}

export default function GalleryPage() {
    const [items, setItems] = useState<IGalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<IGalleryItem | null>(null);

    useEffect(() => {
        async function fetchGallery() {
            try {
                const res = await fetch('/api/gallery');
                const data = await res.json();
                if (data.success) {
                    setItems(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch gallery", error);
            } finally {
                setLoading(false);
            }
        }
        fetchGallery();

        // Timeout after 5 seconds
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 5000);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />
            <main className="flex-1 pt-24 pb-16">
                {/* Breadcrumbs */}
                <div className="container mx-auto px-4 md:px-6 pb-4">
                    <Breadcrumb items={[{ label: "Gallery" }]} />
                </div>
                <div className="container mx-auto px-4 md:px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-4xl font-bold tracking-tighter md:text-5xl lg:text-6xl mb-4">
                            Activity <span className="text-gradient">Gallery</span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-[700px] mx-auto">
                            A visual journey of my projects, events, and milestones.
                        </p>
                    </motion.div>

                    {loading ? (
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <GallerySkeleton key={i} />
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                            <div className="mb-6 p-4 rounded-full bg-muted/30 text-muted-foreground">
                                <X className="h-12 w-12" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Gallery Coming Soon</h3>
                            <p className="text-muted-foreground max-w-md">
                                I&apos;m curating a collection of project screenshots and photos. Check back later!
                            </p>
                        </div>
                    ) : (
                        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 max-w-7xl mx-auto">
                            {items.map((item, index) => (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                    viewport={{ once: true }}
                                    className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-pointer border border-border/80 dark:border-primary/10 hover:border-primary/40 transition-all duration-500 shadow-sm hover:shadow-xl bg-card"
                                    onClick={() => setSelectedImage(item)}
                                >
                                    <div className="relative aspect-[4/3] w-full bg-muted/30 overflow-hidden">
                                        {/* Background pattern for placeholder */}
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
                                        {item.imageUrl && (
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.title}
                                                width={400}
                                                height={300}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        )}
                                        {!item.imageUrl && (
                                            <div className="absolute inset-0 flex items-center justify-center text-primary/20">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2">{item.category}</span>
                                        <h3 className="text-white font-bold text-xl mb-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{item.title}</h3>
                                        <p className="text-white/70 text-sm line-clamp-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">{item.description}</p>
                                        <div className="absolute top-4 right-4 text-white/50 scale-0 group-hover:scale-100 transition-transform duration-300">
                                            <ZoomIn className="h-5 w-5" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-10 backdrop-blur-md"
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="relative max-w-6xl w-full max-h-full overflow-hidden rounded-3xl bg-card/40 border border-primary/20 shadow-2xl backdrop-blur-2xl flex flex-col md:flex-row"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-6 right-6 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 hover:scale-110 transition-all"
                            >
                                <X className="h-6 w-6" />
                            </button>

                            <div className="w-full md:w-2/3 aspect-video md:aspect-auto md:h-[70vh] bg-muted/20 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                                {selectedImage.imageUrl ? (
                                    <Image
                                        src={selectedImage.imageUrl}
                                        alt={selectedImage.title}
                                        width={1200}
                                        height={800}
                                        className="w-full h-full object-contain relative z-10"
                                    />
                                ) : (
                                    <div className="text-xl font-bold text-primary/30 tracking-widest uppercase">No Preview Available</div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>

                            <div className="flex-1 p-8 md:p-12 flex flex-col justify-between bg-card/60">
                                <div>
                                    <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-[0.2em] uppercase mb-6">
                                        {selectedImage.category}
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 mb-4">{selectedImage.title}</h2>
                                    <p className="text-muted-foreground text-lg leading-relaxed mb-8">{selectedImage.description}</p>
                                </div>

                                <div className="flex items-center justify-between pt-8 border-t border-primary/10">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">Discovery Date</p>
                                            <p className="text-sm font-bold">{new Date(selectedImage.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
