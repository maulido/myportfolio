"use client";

import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, Calendar, MapPin, Award, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useState } from 'react';

export interface TimelineItem {
    id: string;
    type: 'work' | 'education' | 'achievement';
    title: string;
    organization: string;
    companyLogo?: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description: string;
    skills: string[];
    achievements?: string[];
    responsibilities?: string[];
}

interface TimelineProps {
    items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedItems(newExpanded);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'work':
                return <Briefcase className="h-6 w-6" />;
            case 'education':
                return <GraduationCap className="h-6 w-6" />;
            case 'achievement':
                return <Award className="h-6 w-6" />;
            default:
                return <Briefcase className="h-6 w-6" />;
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'work':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'education':
                return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'achievement':
                return 'bg-green-500/10 text-green-400 border-green-500/20';
            default:
                return 'bg-primary/10 text-primary border-primary/20';
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    return (
        <div className="relative py-8">
            {/* Vertical timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />

            <div className="space-y-8">
                {items.map((item, index) => {
                    const isExpanded = expandedItems.has(item.id);

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="relative pl-20"
                        >
                            {/* Icon or Company Logo */}
                            <div className={`absolute left-0 w-16 h-16 rounded-full flex items-center justify-center border-4 border-background ${getIconColor(item.type)} overflow-hidden`}>
                                {item.companyLogo ? (
                                    <Image
                                        src={item.companyLogo}
                                        alt={item.organization}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    getIcon(item.type)
                                )}
                            </div>

                            {/* Content Card */}
                            <div className="border border-primary/20 rounded-xl p-6 bg-card/40 backdrop-blur-sm hover:border-primary/40 transition-all">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                                        <p className="text-primary font-medium">{item.organization}</p>
                                    </div>
                                    <div className="text-right text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1 justify-end">
                                            <Calendar className="h-3 w-3" />
                                            <span>
                                                {formatDate(item.startDate)} - {item.current ? 'Present' : formatDate(item.endDate!)}
                                            </span>
                                        </div>
                                        {item.location && (
                                            <div className="flex items-center gap-1 justify-end mt-1">
                                                <MapPin className="h-3 w-3" />
                                                <span>{item.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-muted-foreground mb-4">{item.description}</p>

                                {/* Expandable Content */}
                                {(item.achievements || item.responsibilities) && (
                                    <>
                                        <button
                                            onClick={() => toggleExpand(item.id)}
                                            className="flex items-center gap-2 text-sm text-primary hover:underline mb-3"
                                        >
                                            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                            {isExpanded ? 'Show less' : 'Show more'}
                                        </button>

                                        {isExpanded && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="space-y-4 mb-4"
                                            >
                                                {item.responsibilities && item.responsibilities.length > 0 && (
                                                    <div>
                                                        <h4 className="font-semibold mb-2 text-sm">Key Responsibilities:</h4>
                                                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                                            {item.responsibilities.map((resp, i) => (
                                                                <li key={i}>{resp}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {item.achievements && item.achievements.length > 0 && (
                                                    <div>
                                                        <h4 className="font-semibold mb-2 text-sm">Key Achievements:</h4>
                                                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                                            {item.achievements.map((achievement, i) => (
                                                                <li key={i}>{achievement}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </>
                                )}

                                {/* Skills */}
                                {item.skills && item.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {item.skills.map(skill => (
                                            <span
                                                key={skill}
                                                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
