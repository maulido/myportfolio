"use client";

import { motion } from "framer-motion";
import { Briefcase, Calendar, MapPin, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import CareerDetailModal from "./CareerDetailModal";

interface CareerEntry {
    _id: string;
    type: 'work' | 'education' | 'achievement';
    title: string;
    organization: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
    skills: string[];
    achievements?: string[];
    responsibilities?: string[];
}

export function Experience() {
    const [experience, setExperience] = useState<CareerEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCareer, setSelectedCareer] = useState<CareerEntry | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCareerClick = (career: CareerEntry) => {
        setSelectedCareer(career);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedCareer(null), 300);
    };

    useEffect(() => {
        const fetchCareerData = async () => {
            try {
                const res = await fetch('/api/career');
                const data = await res.json();
                if (data.success) {
                    // Filter only work type entries
                    const workEntries = data.data.filter((entry: CareerEntry) => entry.type === 'work');
                    setExperience(workEntries);
                }
            } catch (error) {
                console.error('Failed to fetch career data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCareerData();
    }, []);

    const formatPeriod = (startDate: string, endDate: string | undefined, current: boolean) => {
        const start = new Date(startDate).getFullYear();
        const end = current ? 'Present' : endDate ? new Date(endDate).getFullYear() : '';
        return `${start} - ${end}`;
    };

    if (isLoading) {
        return (
            <section id="experience" className="py-16 md:py-24 relative overflow-hidden">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center">Loading career journey...</div>
                </div>
            </section>
        );
    }

    if (experience.length === 0) {
        return null; // Don't show section if no work experience
    }
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
                                key={item._id}
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
                                    <div
                                        onClick={() => handleCareerClick(item)}
                                        className="group bg-card/40 backdrop-blur-md rounded-2xl p-6 border border-white/5 shadow-xl hover:border-primary/40 transition-all duration-300 hover:shadow-primary/5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <div className="flex flex-col gap-2 mb-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                                                <span className="hidden sm:inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                                                    {formatPeriod(item.startDate, item.endDate, item.current)}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-primary/80 font-medium">
                                                <Briefcase className="mr-2 h-4 w-4" />
                                                {item.organization}
                                            </div>
                                        </div>

                                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                                            {item.description}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex items-center text-[11px] text-muted-foreground/60">
                                                <MapPin className="mr-1 h-3 w-3" />
                                                {item.location || 'Remote'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center text-[11px] text-muted-foreground/60 sm:hidden">
                                                    <Calendar className="mr-1 h-3 w-3" />
                                                    {formatPeriod(item.startDate, item.endDate, item.current)}
                                                </div>
                                                <div className="flex items-center text-xs text-primary font-medium group-hover:gap-1 transition-all">
                                                    View Details
                                                    <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                                </div>
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

            {/* Career Detail Modal */}
            <CareerDetailModal
                career={selectedCareer}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </section>
    );
}
