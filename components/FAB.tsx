"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, FileText, Mail, X, Plus, Bot } from "lucide-react";
import Link from "next/link";

export default function FloatingActionButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [waNumber, setWaNumber] = useState("6281234567890");

    useEffect(() => {
        fetch("/api/settings?key=whatsappNumber")
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    // Clean number (remove non-digits)
                    const cleaned = String(data.data).replace(/[^0-9]/g, '');
                    if (cleaned) setWaNumber(cleaned);
                }
            })
            .catch(err => console.error("Failed to fetch WhatsApp number in FAB", err));
    }, []);

    const toggleMenu = () => setIsOpen(!isOpen);

    const menuItems = [
        {
            icon: <Bot className="h-5 w-5" />,
            label: "AI Assistant",
            color: "bg-indigo-600",
            onClick: () => window.dispatchEvent(new Event("open-chat-widget"))
        },
        {
            icon: <MessageCircle className="h-5 w-5" />,
            label: "WhatsApp",
            href: `https://wa.me/${waNumber}`,
            color: "bg-[#25D366]",
            external: true
        },
        {
            icon: <Mail className="h-5 w-5" />,
            label: "Contact",
            href: "/contact",
            color: "bg-blue-600"
        },
        {
            icon: <FileText className="h-5 w-5" />,
            label: "Download CV",
            color: "bg-emerald-600",
            onClick: () => window.dispatchEvent(new Event("open-cv-modal"))
        },
    ];

    return (
        <div className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-50 flex flex-col items-start gap-3">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.85 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.85 }}
                        className="flex flex-col gap-2.5 items-start mb-2"
                    >
                        {menuItems.map((item, index) => (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.04 }}
                            >
                                {item.external ? (
                                    <a
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 group"
                                    >
                                        <div className={`p-3 rounded-full text-white shadow-lg ${item.color} hover:scale-110 transition-transform duration-200 ring-2 ring-white/20`}>
                                            {item.icon}
                                        </div>
                                        <span className="bg-card px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md border border-border opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-2 whitespace-nowrap text-foreground">
                                            {item.label}
                                        </span>
                                    </a>
                                ) : item.onClick ? (
                                    <button
                                        onClick={() => {
                                            item.onClick();
                                            setIsOpen(false);
                                        }}
                                        className="flex items-center gap-3 group"
                                    >
                                        <div className={`p-3 rounded-full text-white shadow-lg ${item.color} hover:scale-110 transition-transform duration-200 ring-2 ring-white/20`}>
                                            {item.icon}
                                        </div>
                                        <span className="bg-card px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md border border-border opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-2 whitespace-nowrap text-foreground">
                                            {item.label}
                                        </span>
                                    </button>
                                ) : (
                                    <Link
                                        href={item.href!}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 group"
                                    >
                                        <div className={`p-3 rounded-full text-white shadow-lg ${item.color} hover:scale-110 transition-transform duration-200 ring-2 ring-white/20`}>
                                            {item.icon}
                                        </div>
                                        <span className="bg-card px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md border border-border opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-2 whitespace-nowrap text-foreground">
                                            {item.label}
                                        </span>
                                    </Link>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={toggleMenu}
                className={`p-3.5 md:p-4 rounded-full shadow-2xl transition-all duration-300 ring-4 ${isOpen
                    ? "bg-slate-900 dark:bg-slate-800 rotate-45 ring-primary/40 scale-90"
                    : "bg-primary hover:scale-105 ring-primary/20 hover:ring-primary/40"
                    } text-white flex items-center justify-center`}
                aria-label="Toggle Quick Menu"
            >
                {isOpen ? <X className="h-5 w-5 md:h-6 md:w-6" /> : <Plus className="h-5 w-5 md:h-6 md:w-6" />}
            </button>
        </div>
    );
}
