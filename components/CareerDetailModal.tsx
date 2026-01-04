"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, MapPin, Award, CheckCircle2, Briefcase } from "lucide-react";

interface CareerJourney {
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

interface CareerDetailModalProps {
    career: CareerJourney | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function CareerDetailModal({ career, isOpen, onClose }: CareerDetailModalProps) {
    if (!career) return null;

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'work': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'education': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'achievement': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            default: return 'bg-primary/10 text-primary border-primary/20';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 bottom-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl bg-card/95 backdrop-blur-xl rounded-3xl border border-primary/20 shadow-2xl z-50 max-h-[90vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-card/95 backdrop-blur-xl border-b border-primary/10 p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getTypeColor(career.type)}`}>
                                            {career.type}
                                        </span>
                                        {career.current && (
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                                                Current
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold mb-2">{career.title}</h2>
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="h-4 w-4" />
                                            <span className="font-semibold">{career.organization}</span>
                                        </div>
                                        {career.location && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                <span>{career.location}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>
                                                {formatDate(career.startDate)} - {career.current ? 'Present' : career.endDate ? formatDate(career.endDate) : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-primary/10 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6 space-y-6">
                            {/* Description */}
                            <div>
                                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                    <div className="h-1 w-8 bg-primary rounded-full" />
                                    Description
                                </h3>
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                    {career.description}
                                </p>
                            </div>

                            {/* Responsibilities */}
                            {career.responsibilities && career.responsibilities.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                        <div className="h-1 w-8 bg-blue-500 rounded-full" />
                                        Responsibilities
                                    </h3>
                                    <ul className="space-y-2">
                                        {career.responsibilities.map((resp, index) => (
                                            <li key={index} className="flex items-start gap-3 text-muted-foreground">
                                                <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                                <span>{resp}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Achievements */}
                            {career.achievements && career.achievements.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                        <div className="h-1 w-8 bg-emerald-500 rounded-full" />
                                        Achievements
                                    </h3>
                                    <ul className="space-y-2">
                                        {career.achievements.map((achievement, index) => (
                                            <li key={index} className="flex items-start gap-3 text-muted-foreground">
                                                <Award className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                <span>{achievement}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Skills */}
                            {career.skills && career.skills.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                        <div className="h-1 w-8 bg-purple-500 rounded-full" />
                                        Skills & Technologies
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {career.skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
