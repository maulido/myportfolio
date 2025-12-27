"use client";

import { motion } from "framer-motion";
import { Briefcase, Calendar } from "lucide-react";

const experience = [
    {
        company: "Tech Solutions Inc.",
        role: "Senior Network Engineer",
        period: "2021 - Present",
        description: "Leading the network infrastructure team, managing enterprise-grade firewalls, and automating network configurations with Python.",
    },
    {
        company: "Global Connections Ltd.",
        role: "Network Administrator",
        period: "2019 - 2021",
        description: "Maintained 99.9% uptime for corporate network, implemented VPN solutions, and resolved widespread connectivity issues.",
    },
    {
        company: "StartUp Creative",
        role: "Junior Developer",
        period: "2018 - 2019",
        description: "Assisted in frontend development using React and maintained legacy PHP applications.",
    },
];

export function Experience() {
    return (
        <section id="experience" className="py-16 md:py-24">
            <div className="container px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Work Experience</h2>
                    <p className="mt-4 text-muted-foreground">
                        My professional journey and career milestones.
                    </p>
                </motion.div>

                <div className="relative border-l border-muted-foreground/30 ml-4 md:ml-12 space-y-12">
                    {experience.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="relative pl-8 md:pl-12"
                        >
                            <div className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                                <h3 className="text-xl font-bold">{item.role}</h3>
                                <span className="flex items-center text-sm text-muted-foreground mt-1 sm:mt-0">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    {item.period}
                                </span>
                            </div>
                            <div className="flex items-center text-muted-foreground mb-4">
                                <Briefcase className="mr-2 h-4 w-4" />
                                <span className="font-medium text-foreground">{item.company}</span>
                            </div>
                            <p className="text-muted-foreground">
                                {item.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
