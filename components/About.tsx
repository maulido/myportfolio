"use client";

import { motion } from "framer-motion";
import { Download, ShieldCheck, Bot } from "lucide-react";

export function About() {
    return (
        <section id="about" className="py-16 md:py-24 bg-muted/50 overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid gap-12 lg:grid-cols-2 items-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="flex justify-center"
                    >
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative h-64 w-64 md:h-96 md:w-96 overflow-hidden rounded-full border-4 border-primary/20 shadow-2xl bg-gradient-to-b from-primary/5 to-accent/5 flex items-center justify-center">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                                <div className="flex flex-col items-center justify-center text-primary/60">
                                    <Bot className="h-20 w-20 md:h-32 md:w-32 mb-4 animate-pulse" />
                                    <span className="text-sm font-bold tracking-widest uppercase">Identity Protected</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <div>
                            <h2 className="text-3xl font-bold tracking-tighter md:text-5xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                                About Me
                            </h2>
                            <div className="h-1.5 w-20 bg-primary rounded-full mb-6"></div>
                        </div>

                        <p className="text-muted-foreground text-lg leading-relaxed">
                            I am a passionate professional with a strong background in IT and software development.
                            My journey started with a curiosity about how things work, leading me to specialize in
                            Network Engineering and Software Engineering.
                        </p>

                        <p className="text-muted-foreground text-lg leading-relaxed">
                            I love solving complex problems and building efficient, scalable solutions.
                            Whether it&apos;s configuring a complex network topology or building a modern web application,
                            I bring dedication and attention to detail to every project.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            <div className="p-4 rounded-xl bg-card border border-primary/10 shadow-sm">
                                <h3 className="font-bold mb-3 text-primary flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5" /> Education
                                </h3>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                                        <span>B.S. in Computer Science (2018-2022)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                                        <span>Cisco Certified Network Associate (CCNA)</span>
                                    </li>
                                </ul>
                            </div>

                            <div
                                className="p-4 rounded-xl bg-card border border-primary/10 shadow-sm flex flex-col justify-center items-center text-center group cursor-pointer hover:bg-primary/5 transition-colors"
                                onClick={() => window.dispatchEvent(new Event("open-cv-modal"))}
                            >
                                <div className="p-3 rounded-full bg-primary/10 text-primary mb-3 group-hover:scale-110 transition-transform">
                                    <Download className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-sm">Download My CV</h3>
                                <p className="text-xs text-muted-foreground mt-1">Requires Email Verification</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
