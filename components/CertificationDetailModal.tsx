"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, ExternalLink, Award, CheckCircle2, Shield } from "lucide-react";
import Image from "next/image";

interface Certification {
    _id: string;
    title: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;
    imageUrl?: string;
    certificateFileUrl?: string;
    category: string;
    skills: string[];
    description?: string;
}

interface CertificationDetailModalProps {
    certification: Certification | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function CertificationDetailModal({ certification, isOpen, onClose }: CertificationDetailModalProps) {
    if (!certification) return null;

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const isExpired = certification.expiryDate && new Date(certification.expiryDate) < new Date();

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
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                            {certification.category}
                                        </span>
                                        {isExpired && (
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                                                Expired
                                            </span>
                                        )}
                                        {!isExpired && certification.expiryDate && (
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                                                Valid
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold mb-2">{certification.title}</h2>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Shield className="h-4 w-4" />
                                        <span className="font-semibold">{certification.issuer}</span>
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
                            {/* Certificate Image */}
                            {certification.imageUrl && (
                                <div className="aspect-video relative rounded-xl overflow-hidden bg-muted/20 border border-primary/10">
                                    <Image
                                        src={certification.imageUrl}
                                        alt={certification.title}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                            )}

                            {/* Description */}
                            {certification.description && (
                                <div>
                                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                        <div className="h-1 w-8 bg-primary rounded-full" />
                                        About This Certification
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {certification.description}
                                    </p>
                                </div>
                            )}

                            {/* Dates */}
                            <div>
                                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                    <div className="h-1 w-8 bg-blue-500 rounded-full" />
                                    Validity Period
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Calendar className="h-5 w-5 text-blue-500" />
                                        <div>
                                            <span className="font-medium">Issued: </span>
                                            <span>{formatDate(certification.issueDate)}</span>
                                        </div>
                                    </div>
                                    {certification.expiryDate && (
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <Calendar className={`h-5 w-5 ${isExpired ? 'text-red-500' : 'text-green-500'}`} />
                                            <div>
                                                <span className="font-medium">Expires: </span>
                                                <span className={isExpired ? 'text-red-500' : ''}>{formatDate(certification.expiryDate)}</span>
                                            </div>
                                        </div>
                                    )}
                                    {!certification.expiryDate && (
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            <span>No expiration date (lifetime validity)</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Skills */}
                            {certification.skills && certification.skills.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                        <div className="h-1 w-8 bg-purple-500 rounded-full" />
                                        Skills Covered
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {certification.skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                                            >
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Credential Info */}
                            {(certification.certificateFileUrl || certification.credentialId || certification.credentialUrl) && (
                                <div>
                                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                        <div className="h-1 w-8 bg-emerald-500 rounded-full" />
                                        Credential Information
                                    </h3>
                                    <div className="space-y-3">
                                        {/* Certificate File */}
                                        {certification.certificateFileUrl && (
                                            <a
                                                href={certification.certificateFileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70 transition-all font-bold shadow-lg shadow-primary/25"
                                            >
                                                <Award className="h-5 w-5" />
                                                View Certificate (PDF)
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        )}
                                        {certification.credentialId && (
                                            <div className="p-4 rounded-xl bg-muted/20 border border-primary/10">
                                                <p className="text-xs text-muted-foreground mb-1">Credential ID</p>
                                                <p className="font-mono text-sm font-medium">{certification.credentialId}</p>
                                            </div>
                                        )}
                                        {certification.credentialUrl && (
                                            <a
                                                href={certification.credentialUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium border border-primary/20"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                Verify Credential Online
                                            </a>
                                        )}
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
