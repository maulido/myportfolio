"use client";

import { motion } from "framer-motion";

const skills = {
    "Technical Skills": ["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python"],
    "Networking": ["Cisco IOS", "Mikrotik", "Routing & Switching", "VPN", "Firewalls", "Wireshark"],
    "Tools": ["Git", "Docker", "Linux", "VS Code", "Postman", "Figma"],
    "Soft Skills": ["Problem Solving", "Team Leadership", "Communication", "Time Management"],
};

export function Skills() {
    return (
        <section id="skills" className="py-16 md:py-24">
            <div className="container px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Skills & Expertise</h2>
                    <p className="mt-4 text-muted-foreground">
                        A comprehensive overview of my technical abilities and professional competencies.
                    </p>
                </motion.div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {Object.entries(skills).map(([category, items], index) => (
                        <motion.div
                            key={category}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-card text-card-foreground rounded-lg border shadow-sm p-6"
                        >
                            <h3 className="font-semibold text-lg mb-4 text-primary">{category}</h3>
                            <ul className="space-y-2">
                                {items.map((skill) => (
                                    <li key={skill} className="flex items-center text-sm text-muted-foreground">
                                        <span className="mr-2 h-1.5 w-1.5 rounded-full bg-primary/60" />
                                        {skill}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
