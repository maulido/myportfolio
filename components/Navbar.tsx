
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Projects", href: "/projects" },
    { name: "Blog", href: "/blog" },
    { name: "Gallery", href: "/gallery" },
    { name: "Certifications", href: "/certifications" },
    { name: "Uses", href: "/uses" },
    { name: "Guestbook", href: "/guestbook" },
    { name: "Contact", href: "/contact" },
];

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={cn(
                "fixed top-0 z-50 w-full transition-all duration-300",
                scrolled ? "bg-background/80 backdrop-blur-md border-b border-primary/10 py-2" : "bg-transparent py-4"
            )}
        >
            <div className="container mx-auto flex items-center justify-between px-4">
                <Link href="/" className="mr-6 flex items-center space-x-2">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        Portfolio
                    </span>
                </Link>
                <div className="hidden md:flex md:gap-x-8">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-sm font-medium transition-colors hover:text-accent text-muted-foreground"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <button
                        className="md:hidden text-foreground"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <span className="sr-only">Toggle menu</span>
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-b border-primary/10 md:hidden bg-background/95 backdrop-blur-xl"
                    >
                        <div className="container mx-auto flex flex-col gap-4 p-4 text-center">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="text-sm font-medium transition-colors hover:text-accent py-2 block"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

