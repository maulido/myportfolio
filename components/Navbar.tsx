
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search, ChevronDown, Award, Image as ImageIcon, Laptop, BookOpen } from "lucide-react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";

const primaryNavItems = [
    { key: "nav.home", defaultName: "Home", href: "/" },
    { key: "nav.about", defaultName: "About", href: "/about" },
    { key: "nav.projects", defaultName: "Projects", href: "/projects" },
    { key: "nav.blog", defaultName: "Blog", href: "/blog" },
];

const secondaryNavItems = [
    { key: "nav.gallery", defaultName: "Gallery", href: "/gallery", icon: ImageIcon },
    { key: "nav.certifications", defaultName: "Certifications", href: "/certifications", icon: Award },
    { key: "nav.uses", defaultName: "Uses", href: "/uses", icon: Laptop },
    { key: "nav.guestbook", defaultName: "Guestbook", href: "/guestbook", icon: BookOpen },
];

const contactNavItem = { key: "nav.contact", defaultName: "Contact", href: "/contact" };

const allNavItems = [
    ...primaryNavItems,
    ...secondaryNavItems,
    contactNavItem,
];

interface NavbarProps {
    brandName?: string;
}

export function Navbar({ brandName: initialBrandName }: NavbarProps = {}) {
    const pathname = usePathname();
    const { t } = useLanguage();
    const [brandName, setBrandName] = useState(initialBrandName || "Portfolio");
    const [isOpen, setIsOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    const isSecondaryActive = secondaryNavItems.some((item) =>
        pathname.startsWith(item.href)
    );

    useEffect(() => {
        if (initialBrandName) return;

        let isMounted = true;
        fetch('/api/settings?key=brandName')
            .then(res => res.json())
            .then(data => {
                if (!isMounted) return;
                if (data.success && data.data) {
                    setBrandName(String(data.data));
                }
            })
            .catch(() => {});

        return () => {
            isMounted = false;
        };
    }, [initialBrandName]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);



    return (
        <nav
            className={cn(
                "fixed top-0 z-40 w-full transition-all duration-300",
                scrolled
                    ? "bg-background/85 backdrop-blur-md border-b border-border/80 dark:border-primary/10 shadow-xs py-3"
                    : "bg-transparent py-4 sm:py-5"
            )}
        >
            {/* Top Interactive Scroll Progress Indicator */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-accent to-primary origin-left z-50 pointer-events-none"
                style={{ scaleX }}
            />

            <div className="container mx-auto flex items-center justify-between px-4 sm:px-6">
                {/* Brand Logo */}
                <Link href="/" className="mr-4 flex items-center space-x-2 shrink-0">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        {brandName}
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-x-1 xl:gap-x-2">
                    {/* Primary Links */}
                    {primaryNavItems.map((item) => {
                        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "relative text-xs xl:text-sm font-medium transition-colors px-2.5 xl:px-3 py-1.5 rounded-full z-10 shrink-0",
                                    isActive
                                        ? "text-primary font-semibold"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                                )}
                            >
                                {isActive && (
                                    <motion.span
                                        layoutId="navbar-active-indicator"
                                        className="absolute inset-0 bg-primary/10 rounded-full border border-primary/20 -z-10 shadow-xs"
                                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                                    />
                                )}
                                {t(item.key, item.defaultName)}
                            </Link>
                        );
                    })}

                    {/* Secondary Links on XL screens (1280px+) */}
                    <div className="hidden xl:flex items-center gap-x-1 xl:gap-x-2">
                        {secondaryNavItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "relative text-xs xl:text-sm font-medium transition-colors px-2.5 xl:px-3 py-1.5 rounded-full z-10 shrink-0",
                                        isActive
                                            ? "text-primary font-semibold"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                                    )}
                                >
                                    {isActive && (
                                        <motion.span
                                            layoutId="navbar-active-indicator"
                                            className="absolute inset-0 bg-primary/10 rounded-full border border-primary/20 -z-10 shadow-xs"
                                            transition={{ type: "spring", stiffness: 400, damping: 32 }}
                                        />
                                    )}
                                    {t(item.key, item.defaultName)}
                                </Link>
                            );
                        })}
                    </div>

                    {/* "More" Dropdown on LG screens (1024px to 1279px) */}
                    <div className="relative xl:hidden" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={cn(
                                "relative text-xs font-medium transition-colors px-2.5 py-1.5 rounded-full z-10 inline-flex items-center gap-1 shrink-0",
                                isSecondaryActive
                                    ? "text-primary font-semibold"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                            )}
                            aria-expanded={isDropdownOpen}
                            aria-haspopup="true"
                        >
                            {isSecondaryActive && (
                                <motion.span
                                    layoutId="navbar-active-indicator"
                                    className="absolute inset-0 bg-primary/10 rounded-full border border-primary/20 -z-10 shadow-xs"
                                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                                />
                            )}
                            <span>{t("nav.more", "More")}</span>
                            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", isDropdownOpen && "rotate-180")} />
                        </button>

                        <AnimatePresence>
                            {isDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-full left-0 mt-2 w-48 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/80 dark:border-primary/20 shadow-xl py-1.5 z-50 overflow-hidden"
                                >
                                    {secondaryNavItems.map((item) => {
                                        const isActive = pathname.startsWith(item.href);
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setIsDropdownOpen(false)}
                                                className={cn(
                                                    "flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors hover:bg-muted/60",
                                                    isActive
                                                        ? "text-primary font-semibold bg-primary/10"
                                                        : "text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                <Icon className="h-4 w-4 text-primary/70 shrink-0" />
                                                <span>{t(item.key, item.defaultName)}</span>
                                            </Link>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Contact Link */}
                    {(() => {
                        const isActive = pathname.startsWith(contactNavItem.href);
                        return (
                            <Link
                                href={contactNavItem.href}
                                className={cn(
                                    "relative text-xs xl:text-sm font-medium transition-colors px-2.5 xl:px-3 py-1.5 rounded-full z-10 shrink-0",
                                    isActive
                                        ? "text-primary font-semibold"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                                )}
                            >
                                {isActive && (
                                    <motion.span
                                        layoutId="navbar-active-indicator"
                                        className="absolute inset-0 bg-primary/10 rounded-full border border-primary/20 -z-10 shadow-xs"
                                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                                    />
                                )}
                                {t(contactNavItem.key, contactNavItem.defaultName)}
                            </Link>
                        );
                    })()}
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                    <button
                        onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
                        className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full border border-border/80 bg-card/60 hover:bg-muted/60 text-muted-foreground hover:text-foreground text-xs font-medium transition-all shadow-2xs group shrink-0"
                        aria-label="Open search and command palette"
                        title="Search (Ctrl + K)"
                    >
                        <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                        <span className="hidden xl:inline">{t("nav.search", "Search...")}</span>
                        <kbd className="hidden xl:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono font-semibold bg-muted rounded text-muted-foreground border border-border/60">
                            ⌘K
                        </kbd>
                    </button>
                    <LanguageToggle />
                    <ThemeToggle />
                    <button
                        className="lg:hidden text-foreground p-1.5 rounded-lg hover:bg-muted/50 transition-colors shrink-0"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle navigation menu"
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile / Tablet Menu Drawer (< lg) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-b border-border/80 dark:border-primary/10 lg:hidden bg-background/95 backdrop-blur-xl shadow-lg overflow-hidden"
                    >
                        <div className="container mx-auto flex flex-col gap-1 p-4 text-center">
                            {allNavItems.map((item) => {
                                const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "text-sm font-medium py-2.5 px-4 rounded-xl block transition-colors",
                                            isActive
                                                ? "text-primary font-semibold bg-primary/10"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                                        )}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {t(item.key, item.defaultName)}
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

