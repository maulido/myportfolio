"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, FileText, Mail, X, Plus } from "lucide-react";
import Link from "next/link";

export default function FloatingActionButton() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    const menuItems = [
        { icon: <MessageCircle className="h-5 w-5" />, label: "Chat WhatsApp", href: "https://wa.me/6281234567890", color: "bg-[#25D366]", external: true },
        { icon: <Mail className="h-5 w-5" />, label: "Contact Form", href: "/contact", color: "bg-blue-500" },
        { icon: <FileText className="h-5 w-5" />, label: "Download CV", href: "#", color: "bg-green-500", onClick: () => window.dispatchEvent(new Event("open-cv-modal")) },
    ];

    return (
        <div className="fixed bottom-8 left-8 z-50 hidden md:flex flex-col items-start gap-3">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        className="flex flex-col gap-3 items-start mb-2"
                    >
                        {menuItems.map((item, index) => (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                {item.external ? (
                                    <a
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 group"
                                    >
                                        <div className={`p-3 rounded-full text-white shadow-lg ${item.color} hover:scale-110 hover:rotate-6 transition-all duration-300 ring-2 ring-white/20`}>
                                            {item.icon}
                                        </div>
                                        <span className="bg-card/90 backdrop-blur-md px-3 py-1 rounded-md text-xs font-semibold shadow-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-4 whitespace-nowrap">
                                            {item.label}
                                        </span>
                                    </a>
                                ) : (
                                    <Link
                                        href={item.href}
                                        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                                            if (item.onClick) {
                                                e.preventDefault();
                                                item.onClick();
                                            }
                                            setIsOpen(false);
                                        }}
                                        className="flex items-center gap-3 group"
                                    >
                                        <div className={`p-3 rounded-full text-white shadow-lg ${item.color} hover:scale-110 hover:rotate-6 transition-all duration-300 ring-2 ring-white/20`}>
                                            {item.icon}
                                        </div>
                                        <span className="bg-card/90 backdrop-blur-md px-3 py-1 rounded-md text-xs font-semibold shadow-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-4 whitespace-nowrap">
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
                className={`p-4 rounded-full shadow-2xl transition-all duration-500 ring-4 ${isOpen
                    ? "bg-slate-800 rotate-45 ring-red-500/50 scale-90"
                    : "bg-primary hover:scale-110 ring-primary/20 hover:ring-primary/40"
                    } text-white flex items-center justify-center`}
                aria-label="Toggle Menu"
            >
                {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
            </button>
        </div>
    );
}
