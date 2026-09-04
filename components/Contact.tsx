"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState, useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';

export function Contact() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [contactInfo, setContactInfo] = useState({
        email: "email@example.com",
        phone: "+1 (555) 123-4567",
        location: "Jakarta, Indonesia"
    });

    useEffect(() => {
        // Fetch contact info from API
        fetch('/api/contact-info')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    setContactInfo(data.data);
                }
            })
            .catch(err => console.error('Failed to fetch contact info:', err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData(e.target as HTMLFormElement);
            const data = {
                name: `${formData.get('firstName')} ${formData.get('lastName')}`,
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
                toast.success('Message sent successfully! I\'ll get back to you soon.', {
                    duration: 5000,
                    style: {
                        background: '#10b981',
                        color: '#fff',
                    },
                });

                // Reset form
                (e.target as HTMLFormElement).reset();
            } else {
                throw new Error(result.error || 'Failed to send message');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to send message. Please try again.', {
                duration: 4000,
            });
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
                    className="grid gap-6 lg:grid-cols-2 lg:gap-12"
                >
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-4xl font-extrabold tracking-tighter md:text-5xl lg:text-6xl mb-6">
                                Get in <span className="text-gradient">Touch</span>
                            </h2>
                            <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                                Have a project in mind or just want to say hi? I&apos;m always open to discussing new opportunities and creative ideas.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {[
                                { icon: <Mail className="h-6 w-6" />, label: "Email", value: contactInfo.email, href: `mailto:${contactInfo.email}` },
                                { icon: <Phone className="h-6 w-6" />, label: "Phone", value: contactInfo.phone, href: `tel:${contactInfo.phone.replace(/[^0-9+]/g, '')}` },
                                { icon: <MapPin className="h-6 w-6" />, label: "Location", value: contactInfo.location, href: "#" }
                            ].map((item, i) => (
                                <motion.a
                                    key={i}
                                    href={item.href}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-4 group"
                                >
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-lg shadow-primary/5">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.label}</p>
                                        <p className="font-bold text-foreground group-hover:text-primary transition-colors">{item.value}</p>
                                    </div>
                                </motion.a>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-xl border border-border/80 dark:border-primary/20 bg-card/90 dark:bg-card/80 backdrop-blur-md p-6 shadow-sm md:shadow-xl">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="first-name" className="text-sm font-medium leading-none text-muted-foreground">First name</label>
                                    <input id="first-name" name="firstName" className="flex h-11 w-full rounded-xl border border-input bg-background/60 px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary transition-all duration-200" required placeholder="First name" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="last-name" className="text-sm font-medium leading-none text-muted-foreground">Last name</label>
                                    <input id="last-name" name="lastName" className="flex h-11 w-full rounded-xl border border-input bg-background/60 px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary transition-all duration-200" required placeholder="Last name" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium leading-none text-muted-foreground">Email</label>
                                <input id="email" name="email" type="email" className="flex h-11 w-full rounded-xl border border-input bg-background/60 px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary transition-all duration-200" required placeholder="name@example.com" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-medium leading-none text-muted-foreground">Message</label>
                                <textarea id="message" name="message" className="flex min-h-[120px] w-full rounded-xl border border-input bg-background/60 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary transition-all duration-200 resize-y" required placeholder="Your message..." />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isSubmitting}
                                className="relative group overflow-hidden inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-bold transition-all bg-primary text-white shadow-xl shadow-primary/25 h-12 px-6 w-full"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {isSubmitting ? "Dispatching Message..." : (
                                        <>
                                            Send Message
                                            <Send className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </motion.button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

