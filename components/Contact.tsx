"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send, Copy, Check, Radio, Loader2, CheckCircle2 } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import { useSettings } from "@/lib/useSettings";

export function Contact({ settings: initialSettings }: { settings?: Record<string, string | undefined> }) {
    const { settings: clientSettings } = useSettings();
    const settings = { ...(initialSettings || {}), ...(clientSettings || {}) };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const title = settings?.contactSectionTitle || "Let's Build Something Exceptional Together";
    const subtitle = settings?.contactSectionSubtitle || "Have an engineering challenge or project inquiry? I'm always open to discussing modern network infrastructure and scalable full-stack web applications.";
    
    const rawEmail = settings?.contactEmail || "email@example.com";
    const contactEmail = rawEmail.replace(/^mailto:/i, "");
    const rawPhone = settings?.contactPhone || "+62 812-3456-7890";
    const contactLocation = settings?.contactLocation || "Jakarta, Indonesia";

    const copyToClipboard = (text: string, label: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopiedKey(label);
        toast.success(`${label} copied to clipboard!`, {
            duration: 2500,
            style: {
                background: '#0f172a',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
            },
        });
        setTimeout(() => setCopiedKey(null), 2500);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData(e.currentTarget);
            const data = {
                name: `${formData.get('firstName')} ${formData.get('lastName')}`.trim(),
                email: formData.get('email') as string,
                message: formData.get('message') as string,
            };

            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setIsSuccess(true);
                toast.success("Message dispatched successfully!");
                (e.target as HTMLFormElement).reset();
            } else {
                throw new Error(result.error || 'Failed to send message');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="py-24 relative overflow-hidden bg-background">
            <Toaster position="top-right" />
            {/* Background Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent -z-10" />
            <div className="container mx-auto px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="grid gap-10 lg:grid-cols-2 lg:gap-12 items-start"
                >
                    <div className="space-y-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
                                <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-500" />
                                <span>Direct Communication Channel</span>
                            </div>

                            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl mb-4">
                                {title.includes(" ") ? (
                                    <>
                                        {title.substring(0, title.lastIndexOf(" "))}{" "}
                                        <span className="text-gradient">
                                            {title.substring(title.lastIndexOf(" ") + 1)}
                                        </span>
                                    </>
                                ) : (
                                    <span>{title}</span>
                                )}
                            </h2>
                            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-md">
                                {subtitle}
                            </p>
                        </div>

                        <div className="space-y-3.5">
                            {[
                                { icon: <Mail className="h-5 w-5" />, label: "Email", value: contactEmail, href: `mailto:${contactEmail}`, canCopy: true },
                                { icon: <Phone className="h-5 w-5" />, label: "Phone & WhatsApp", value: rawPhone, href: `tel:${rawPhone.replace(/[^0-9+]/g, '')}`, canCopy: true },
                                { icon: <MapPin className="h-5 w-5" />, label: "Base Location", value: contactLocation, href: "#", canCopy: false }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center justify-between p-3 rounded-2xl border border-border/60 bg-card/60 hover:bg-muted/40 transition-colors group"
                                >
                                    <a
                                        href={item.href}
                                        className="flex items-center gap-4 flex-1 min-w-0"
                                    >
                                        <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
                                            {item.icon}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.label}</p>
                                            <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">{item.value}</p>
                                        </div>
                                    </a>
                                    {item.canCopy && (
                                        <button
                                            type="button"
                                            onClick={(e) => copyToClipboard(item.value, item.label, e)}
                                            className="p-2 rounded-xl text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-all active:scale-90 shrink-0 ml-2"
                                            title={`Copy ${item.label}`}
                                            aria-label={`Copy ${item.label}`}
                                        >
                                            {copiedKey === item.label ? (
                                                <Check className="h-4 w-4 text-emerald-500" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-border bg-card/80 backdrop-blur-md p-6 sm:p-8 shadow-xl">
                        {isSuccess ? (
                            <div className="text-center py-8 space-y-4">
                                <div className="h-12 w-12 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold">Message Received</h3>
                                <p className="text-sm text-muted-foreground">Thank you for getting in touch. I will review your message promptly.</p>
                                <button
                                    onClick={() => setIsSuccess(false)}
                                    className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
                                >
                                    Send Another
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label htmlFor="first-name" className="text-xs font-semibold text-muted-foreground">First Name</label>
                                        <input id="first-name" name="firstName" className="flex h-11 w-full rounded-xl border border-input bg-background/60 px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary transition-all duration-200" required placeholder="First name" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label htmlFor="last-name" className="text-xs font-semibold text-muted-foreground">Last Name</label>
                                        <input id="last-name" name="lastName" className="flex h-11 w-full rounded-xl border border-input bg-background/60 px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary transition-all duration-200" placeholder="Last name" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="email" className="text-xs font-semibold text-muted-foreground">Email</label>
                                    <input id="email" name="email" type="email" className="flex h-11 w-full rounded-xl border border-input bg-background/60 px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary transition-all duration-200" required placeholder="name@example.com" />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="message" className="text-xs font-semibold text-muted-foreground">Message</label>
                                    <textarea id="message" name="message" className="flex min-h-[120px] w-full rounded-xl border border-input bg-background/60 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary transition-all duration-200 resize-y" required placeholder="Describe your project or inquiry..." />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-11 rounded-xl bg-primary text-white font-bold text-sm shadow-md shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Send Message</span>
                                            <Send className="h-4 w-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
