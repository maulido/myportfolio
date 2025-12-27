"use client";

import { motion } from "framer-motion";
import { Briefcase, Calendar, MapPin } from "lucide-react";

const experience = [
    {
        company: "Tech Solutions Inc.",
        role: "Senior Network Engineer",
        period: "2021 - Present",
        location: "Jakarta, Indonesia",
        description: "Leading the network infrastructure team, managing enterprise-grade firewalls, and automating network configurations with Python.",
    },
    {
        company: "Global Connections Ltd.",
        role: "Network Administrator",
        period: "2019 - 2021",
        location: "Bandung, Indonesia",
        description: "Maintained 99.9% uptime for corporate network, implemented VPN solutions, and resolved widespread connectivity issues.",
    },
    {
        company: "StartUp Creative",
        role: "Junior Developer",
        period: "2018 - 2019",
        location: "Remote",
        description: "Assisted in frontend development using React and maintained legacy PHP applications.",
    },
];

export function Experience() {
    return (
        <section id="experience" className="py-16 md:py-24 relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10" />

            <div className="container mx-auto px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Career Journey</h2>
                    <p className="mt-4 text-muted-foreground">
                        My professional milestones and growth over the years.
                    </p>
                </motion.div>

                <div className="relative max-w-5xl mx-auto mt-12">
                    {/* Centered Line */}
                    <div className="absolute left-1/2 -translate-x-1/2 h-full w-[2px] bg-gradient-to-b from-primary/50 via-primary/20 to-transparent hidden md:block" />
                    <div className="absolute left-6 h-full w-[2px] bg-gradient-to-b from-primary/50 via-primary/20 to-transparent md:hidden" />

                    <div className="space-y-12 md:space-y-0">
                        {experience.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className={`relative flex flex-col md:flex-row items-center justify-between mb-8 md:mb-16 ${index % 2 === 0 ? "md:flex-row-reverse" : ""
                                    }`}
                            >
                                {/* Dot */}
                                <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 top-0 h-4 w-4 rounded-full bg-background border-4 border-primary shadow-[0_0_10px_theme(colors.primary.DEFAULT)] z-10" />

                                {/* Content Card */}
                                <div className="w-full md:w-[45%] pl-16 md:pl-0">
                                    <div className="group bg-card/40 backdrop-blur-md rounded-2xl p-6 border border-white/5 shadow-xl hover:border-primary/40 transition-all duration-300 hover:shadow-primary/5">
                                        <div className="flex flex-col gap-2 mb-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{item.role}</h3>
                                                <span className="hidden sm:inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                                                    {item.period}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-primary/80 font-medium">
                                                <Briefcase className="mr-2 h-4 w-4" />
                                                {item.company}
                                            </div>
                                        </div>

                                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                                            {item.description}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex items-center text-[11px] text-muted-foreground/60">
                                                <MapPin className="mr-1 h-3 w-3" />
                                                {item.location}
                                            </div>
                                            <div className="flex items-center text-[11px] text-muted-foreground/60 sm:hidden">
                                                <Calendar className="mr-1 h-3 w-3" />
                                                {item.period}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Spacer for the other side on desktop */}
                                <div className="hidden md:block md:w-[45%]" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
