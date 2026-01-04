"use client";

import { motion } from "framer-motion";
import { Download, ShieldCheck, Bot, MapPin, Mail, Phone, Github, Linkedin, Twitter, Globe, Instagram, TrendingUp, Award, Code, Briefcase } from "lucide-react";
import { useState, useEffect } from "react";

interface AboutMeContent {
    paragraph1: string;
    paragraph2: string;
    profilePhotoUrl?: string;
    name?: string;
    title?: string;
    location?: string;
    email?: string;
    phone?: string;
    socialLinks?: {
        github?: string;
        linkedin?: string;
        twitter?: string;
        website?: string;
        instagram?: string;
    };
    stats?: {
        yearsExperience?: number;
        projectsCompleted?: number;
        technologiesMastered?: number;
        certificationsEarned?: number;
    };
}

interface EducationEntry {
    _id: string;
    title: string;
    organization: string;
    startDate: string;
    endDate?: string;
}

export function About() {
    const [aboutMe, setAboutMe] = useState<AboutMeContent>({
        paragraph1: 'Loading...',
        paragraph2: ''
    });
    const [education, setEducation] = useState<EducationEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const aboutRes = await fetch('/api/about');
                const aboutData = await aboutRes.json();
                if (aboutData.success) {
                    setAboutMe(aboutData.data);
                }

                const eduRes = await fetch('/api/career?type=education');
                const eduData = await eduRes.json();
                if (eduData.success) {
                    setEducation(eduData.data);
                }
            } catch (error) {
                console.error('Failed to fetch About data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const stats = [
        {
            icon: TrendingUp,
            value: aboutMe.stats?.yearsExperience || 0,
            label: "Years Experience",
            color: "text-blue-500"
        },
        {
            icon: Briefcase,
            value: aboutMe.stats?.projectsCompleted || 0,
            label: "Projects Completed",
            color: "text-green-500"
        },
        {
            icon: Code,
            value: aboutMe.stats?.technologiesMastered || 0,
            label: "Technologies",
            color: "text-purple-500"
        },
        {
            icon: Award,
            value: aboutMe.stats?.certificationsEarned || 0,
            label: "Certifications",
            color: "text-orange-500"
        }
    ];

    const socialLinks = [
        { icon: Github, url: aboutMe.socialLinks?.github, label: "GitHub" },
        { icon: Linkedin, url: aboutMe.socialLinks?.linkedin, label: "LinkedIn" },
        { icon: Twitter, url: aboutMe.socialLinks?.twitter, label: "Twitter" },
        { icon: Globe, url: aboutMe.socialLinks?.website, label: "Website" },
        { icon: Instagram, url: aboutMe.socialLinks?.instagram, label: "Instagram" }
    ].filter(link => link.url);

    return (
        <section id="about" className="py-16 md:py-24 bg-muted/50 overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid gap-12 lg:grid-cols-2 items-center">
                    {/* Profile Photo */}
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
                                {aboutMe.profilePhotoUrl ? (
                                    <img
                                        src={aboutMe.profilePhotoUrl}
                                        alt={aboutMe.name || "Profile"}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <>
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                                        <div className="flex flex-col items-center justify-center text-primary/60">
                                            <Bot className="h-20 w-20 md:h-32 md:w-32 mb-4 animate-pulse" />
                                            <span className="text-sm font-bold tracking-widest uppercase">Identity Protected</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Content */}
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

                            {/* Name & Title */}
                            {(aboutMe.name || aboutMe.title) && (
                                <div className="mb-4">
                                    {aboutMe.name && (
                                        <h3 className="text-2xl font-bold mb-1">{aboutMe.name}</h3>
                                    )}
                                    {aboutMe.title && (
                                        <p className="text-lg text-primary font-semibold">{aboutMe.title}</p>
                                    )}
                                </div>
                            )}

                            {/* Contact Info */}
                            {(aboutMe.location || aboutMe.email || aboutMe.phone) && (
                                <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                                    {aboutMe.location && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-primary" />
                                            <span>{aboutMe.location}</span>
                                        </div>
                                    )}
                                    {aboutMe.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-primary" />
                                            <a href={`mailto:${aboutMe.email}`} className="hover:text-primary transition-colors">
                                                {aboutMe.email}
                                            </a>
                                        </div>
                                    )}
                                    {aboutMe.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-primary" />
                                            <a href={`tel:${aboutMe.phone}`} className="hover:text-primary transition-colors">
                                                {aboutMe.phone}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Paragraphs */}
                        {isLoading ? (
                            <p className="text-muted-foreground text-lg leading-relaxed">Loading...</p>
                        ) : (
                            <>
                                <p className="text-muted-foreground text-lg leading-relaxed">
                                    {aboutMe.paragraph1}
                                </p>
                                <p className="text-muted-foreground text-lg leading-relaxed">
                                    {aboutMe.paragraph2}
                                </p>
                            </>
                        )}

                        {/* Social Links */}
                        {socialLinks.length > 0 && (
                            <div className="flex gap-3 pt-2">
                                {socialLinks.map((social, index) => (
                                    <motion.a
                                        key={index}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="p-3 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm hover:shadow-lg"
                                        title={social.label}
                                    >
                                        <social.icon className="h-5 w-5" />
                                    </motion.a>
                                ))}
                            </div>
                        )}

                        {/* Quick Stats */}
                        {(aboutMe.stats?.yearsExperience || aboutMe.stats?.projectsCompleted || aboutMe.stats?.technologiesMastered || aboutMe.stats?.certificationsEarned) ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                                {stats.map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        className="p-4 rounded-xl bg-card border border-primary/10 shadow-sm text-center"
                                    >
                                        <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                                        <div className="text-2xl font-bold">{stat.value}+</div>
                                        <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                <div className="p-4 rounded-xl bg-card border border-primary/10 shadow-sm">
                                    <h3 className="font-bold mb-3 text-primary flex items-center gap-2">
                                        <ShieldCheck className="h-5 w-5" /> Education
                                    </h3>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        {education.length > 0 ? (
                                            education.map((edu) => {
                                                const startYear = new Date(edu.startDate).getFullYear();
                                                const endYear = edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present';
                                                return (
                                                    <li key={edu._id} className="flex items-start gap-2">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                                                        <span>{edu.title} ({startYear}-{endYear})</span>
                                                    </li>
                                                );
                                            })
                                        ) : (
                                            <li className="flex items-start gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                                                <span>No education entries yet</span>
                                            </li>
                                        )}
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
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
