"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function About() {
    return (
        <section id="about" className="py-16 md:py-24 bg-muted/50">
            <div className="container px-4 md:px-6">
                <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="flex justify-center"
                    >
                        <div className="relative h-64 w-64 md:h-80 md:w-80 overflow-hidden rounded-full border-4 border-background shadow-xl">
                            {/* Replace with your actual image */}
                            <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-400">
                                <span>Your Photo</span>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="space-y-4"
                    >
                        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                            About Me
                        </h2>
                        <p className="text-muted-foreground">
                            I am a passionate professional with a strong background in IT and software development.
                            My journey started with a curiosity about how things work, leading me to specialize in
                            Network Engineering and Software Engineering.
                        </p>
                        <p className="text-muted-foreground">
                            I love solving complex problems and building efficient, scalable solutions.
                            Whether it's configuring a complex network topology or building a modern web application,
                            I bring dedication and attention to detail to every project.
                        </p>
                        <div className="pt-4">
                            <h3 className="font-semibold mb-2">Education</h3>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                <li>Bachelor's in Computer Science - University Name (2018-2022)</li>
                                <li>Certified Network Associate (CCNA)</li>
                            </ul>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
