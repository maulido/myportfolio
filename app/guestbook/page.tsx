"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { MessageSquare, Send, ChevronLeft, ChevronRight } from "lucide-react";

interface GuestbookEntry {
    _id: string;
    name: string;
    website?: string;
    message: string;
    createdAt: string;
}

export default function GuestbookPage() {
    const [entries, setEntries] = useState<GuestbookEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        website: "",
        message: ""
    });
    const [charCount, setCharCount] = useState(0);
    const maxChars = 500;

    useEffect(() => {
        fetchEntries();
    }, [page]);

    const fetchEntries = async () => {
        try {
            const response = await fetch(`/api/guestbook?page=${page}&limit=10`);
            const data = await response.json();
            if (data.success) {
                setEntries(data.data);
                setTotalPages(data.pagination.pages);
            }
        } catch (error) {
            console.error('Error fetching entries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'message') {
            if (value.length <= maxChars) {
                setFormData(prev => ({ ...prev, [name]: value }));
                setCharCount(value.length);
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch('/api/guestbook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message || 'Thank you! Your message will appear after approval.');
                setFormData({ name: "", email: "", website: "", message: "" });
                setCharCount(0);
            } else {
                alert(data.error || 'Failed to submit message');
            }
        } catch (error) {
            console.error('Error submitting:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

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
                        <div className="flex items-center gap-3 mb-4">
                            <MessageSquare className="h-10 w-10 text-primary" />
                            <h1 className="text-4xl md:text-5xl font-bold text-gradient">
                                Guestbook
                            </h1>
                        </div>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Leave a message, share your thoughts, or just say hi! All messages are moderated before appearing.
                        </p>
                    </motion.div>
                </section>

                <div className="container px-4 md:px-6 max-w-4xl mx-auto space-y-12">
                    {/* Message Form */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="border border-primary/20 rounded-xl p-6 md:p-8 bg-card/40 backdrop-blur-sm"
                    >
                        <h2 className="text-2xl font-bold mb-6">Leave a Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Name *</label>
                                    <input
                                        required
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        maxLength={100}
                                        className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="Your name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email (optional, not shown)</label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Website (optional)</label>
                                <input
                                    name="website"
                                    type="url"
                                    value={formData.website}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="https://yourwebsite.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Message *</label>
                                    <span className={`text-xs ${charCount > maxChars * 0.9 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                        {charCount}/{maxChars}
                                    </span>
                                </div>
                                <textarea
                                    required
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={4}
                                    className="flex w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Your message..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6"
                            >
                                {submitting ? "Sending..." : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.section>

                    {/* Messages List */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold">Messages ({entries.length > 0 ? `Page ${page} of ${totalPages}` : '0'})</h2>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            </div>
                        ) : entries.length > 0 ? (
                            <>
                                <div className="space-y-4">
                                    {entries.map((entry, index) => (
                                        <motion.div
                                            key={entry._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="border border-border rounded-lg p-6 bg-card/20 hover:border-primary/40 transition-colors"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    {entry.website ? (
                                                        <a
                                                            href={entry.website}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-semibold text-primary hover:underline"
                                                        >
                                                            {entry.name}
                                                        </a>
                                                    ) : (
                                                        <span className="font-semibold">{entry.name}</span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(entry.createdAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                {entry.message}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 pt-4">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        <span className="text-sm text-muted-foreground">
                                            Page {page} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 border border-dashed border-border rounded-lg">
                                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-muted-foreground">
                                    No messages yet. Be the first to leave one!
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
