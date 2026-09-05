"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    User,
    FolderGit2,
    BookOpen,
    Image as ImageIcon,
    Award,
    Laptop,
    MessageSquare,
    Mail,
    Menu,
    X,
    Search,
    ChevronDown,
    LucideIcon
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";

interface NavItem {
    key: string;
    defaultName: string;
    href: string;
    icon: LucideIcon;
}

const primaryNavItems: NavItem[] = [
    { key: "nav.home", defaultName: "Home", href: "/", icon: Home },
    { key: "nav.about", defaultName: "About", href: "/about", icon: User },
    { key: "nav.projects", defaultName: "Projects", href: "/projects", icon: FolderGit2 },
    { key: "nav.blog", defaultName: "Blog", href: "/blog", icon: BookOpen },
];

const secondaryNavItems: NavItem[] = [
    { key: "nav.gallery", defaultName: "Gallery", href: "/gallery", icon: ImageIcon },
    { key: "nav.certifications", defaultName: "Certifications", href: "/certifications", icon: Award },
    { key: "nav.uses", defaultName: "Uses", href: "/uses", icon: Laptop },
    { key: "nav.guestbook", defaultName: "Guestbook", href: "/guestbook", icon: MessageSquare },
];

const contactNavItem: NavItem = {
    key: "nav.contact",
    defaultName: "Contact",
    href: "/contact",
    icon: Mail,
};

const allNavItems: NavItem[] = [
    ...primaryNavItems,
    ...secondaryNavItems,
    contactNavItem,
];

interface NavbarProps {
    brandName?: string;
}

export function Navbar({ brandName: initialBrandName }: NavbarProps = {}) {
    const pathname = usePathname();
    const [brandName, setBrandName] = useState(initialBrandName || "Portfolio");
    const [isOpen, setIsOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [hoveredHref, setHoveredHref] = useState<string | null>(null);
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
        fetch("/api/settings?key=brandName")
            .then((res) => res.json())
            .then((data) => {
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
        <>
            {/* Top Interactive Scroll Progress Indicator */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-primary via-indigo-500 to-accent origin-left z-50 pointer-events-none"
                style={{ scaleX }}
            />

            {/* Floating Capsule Island Dock */}
            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-40 w-full pointer-events-none transition-all duration-300 px-3 sm:px-6",
                    scrolled ? "pt-2 sm:pt-3" : "pt-3 sm:pt-4"
                )}
            >
                <div
                    className={cn(
                        "container max-w-7xl mx-auto flex items-center justify-between pointer-events-auto rounded-full transition-all duration-300",
                        scrolled
                            ? "bg-background/85 dark:bg-background/80 backdrop-blur-2xl border border-border/80 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-primary/5 px-3.5 sm:px-5 py-1.5 sm:py-2"
                            : "bg-background/70 dark:bg-background/60 backdrop-blur-xl border border-border/60 dark:border-white/10 shadow-md shadow-black/5 dark:shadow-primary/5 px-3.5 sm:px-5 py-2 sm:py-2.5"
                    )}
                >
                    {/* Brand Logo & Status */}
                    <Link href="/" className="flex items-center gap-2.5 group shrink-0 select-none">
                        <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent p-0.5 shadow-xs transition-transform duration-200 group-hover:scale-105">
                            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-background/90 backdrop-blur-xs">
                                <span className="font-extrabold text-sm bg-clip-text text-transparent bg-gradient-to-br from-primary to-accent">
                                    {brandName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm sm:text-base font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-primary/80 group-hover:to-primary transition-colors">
                                {brandName}
                            </span>
                            <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium -mt-0.5">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                </span>
                                Available for work
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Track */}
                    <div
                        onMouseLeave={() => setHoveredHref(null)}
                        className="hidden lg:flex items-center p-1 rounded-full bg-muted/40 dark:bg-white/[0.03] border border-border/50 dark:border-white/5 backdrop-blur-xs relative"
                    >
                        {/* Primary Links */}
                        {primaryNavItems.map((item) => {
                            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onMouseEnter={() => setHoveredHref(item.href)}
                                    className={cn(
                                        "relative text-xs xl:text-xs 2xl:text-sm font-medium transition-colors px-2.5 xl:px-3 py-1.5 rounded-full z-10 shrink-0",
                                        isActive
                                            ? "text-primary font-semibold"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {/* Gliding Hover Pill */}
                                    {hoveredHref === item.href && !isActive && (
                                        <motion.span
                                            layoutId="navbar-hover-pill"
                                            className="absolute inset-0 bg-muted/80 dark:bg-white/[0.06] rounded-full -z-10"
                                            transition={{ type: "spring", stiffness: 450, damping: 35 }}
                                        />
                                    )}

                                    {/* Active Spring Pill */}
                                    {isActive && (
                                         <motion.span
                                             layoutId="navbar-active-pill"
                                             className="absolute inset-0 bg-primary/15 dark:bg-primary/25 rounded-full border border-primary/30 dark:border-primary/40 shadow-[0_0_12px_rgba(99,102,241,0.2)] -z-10"
                                             transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                         />
                                     )}
                                     {item.defaultName}
                                 </Link>
                            );
                        })}

                        {/* Secondary Links on XL Screens (1280px+) */}
                        <div className="hidden xl:flex items-center">
                            {secondaryNavItems.map((item) => {
                                const isActive = pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onMouseEnter={() => setHoveredHref(item.href)}
                                        className={cn(
                                            "relative text-xs xl:text-xs 2xl:text-sm font-medium transition-colors px-2.5 xl:px-3 py-1.5 rounded-full z-10 shrink-0",
                                            isActive
                                                ? "text-primary font-semibold"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {hoveredHref === item.href && !isActive && (
                                            <motion.span
                                                layoutId="navbar-hover-pill"
                                                className="absolute inset-0 bg-muted/80 dark:bg-white/[0.06] rounded-full -z-10"
                                                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                                            />
                                        )}

                                        {isActive && (
                                            <motion.span
                                                layoutId="navbar-active-pill"
                                                className="absolute inset-0 bg-primary/15 dark:bg-primary/25 rounded-full border border-primary/30 dark:border-primary/40 shadow-[0_0_12px_rgba(99,102,241,0.2)] -z-10"
                                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                            />
                                        )}
                                        {item.defaultName}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* "More" Dropdown Capsule on LG Screens (1024px to 1279px) */}
                        <div className="relative xl:hidden" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                onMouseEnter={() => setHoveredHref("dropdown-more")}
                                className={cn(
                                    "relative text-xs font-medium transition-colors px-2.5 py-1.5 rounded-full z-10 inline-flex items-center gap-1 shrink-0",
                                    isSecondaryActive
                                        ? "text-primary font-semibold"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                                aria-expanded={isDropdownOpen}
                                aria-haspopup="true"
                            >
                                {hoveredHref === "dropdown-more" && !isSecondaryActive && (
                                    <motion.span
                                        layoutId="navbar-hover-pill"
                                        className="absolute inset-0 bg-muted/80 dark:bg-white/[0.06] rounded-full -z-10"
                                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                                    />
                                )}
                                {isSecondaryActive && (
                                    <motion.span
                                        layoutId="navbar-active-pill"
                                        className="absolute inset-0 bg-primary/15 dark:bg-primary/25 rounded-full border border-primary/30 dark:border-primary/40 shadow-[0_0_12px_rgba(99,102,241,0.2)] -z-10"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}
                                <span>More</span>
                                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", isDropdownOpen && "rotate-180")} />
                            </button>

                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute top-full left-0 mt-2.5 w-52 rounded-2xl bg-card/95 dark:bg-card/90 backdrop-blur-2xl border border-border/80 dark:border-primary/20 shadow-2xl p-1.5 z-50 overflow-hidden"
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
                                                        "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors",
                                                        isActive
                                                            ? "text-primary font-semibold bg-primary/10"
                                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "p-1 rounded-lg",
                                                        isActive ? "bg-primary/20 text-primary" : "bg-muted/60 text-muted-foreground"
                                                    )}>
                                                        <Icon className="h-3.5 w-3.5" />
                                                    </div>
                                                    <span className="flex-1">{item.defaultName}</span>
                                                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
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
                                    onMouseEnter={() => setHoveredHref(contactNavItem.href)}
                                    className={cn(
                                        "relative text-xs xl:text-xs 2xl:text-sm font-medium transition-colors px-2.5 xl:px-3 py-1.5 rounded-full z-10 shrink-0",
                                        isActive
                                            ? "text-primary font-semibold"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {hoveredHref === contactNavItem.href && !isActive && (
                                        <motion.span
                                            layoutId="navbar-hover-pill"
                                            className="absolute inset-0 bg-muted/80 dark:bg-white/[0.06] rounded-full -z-10"
                                            transition={{ type: "spring", stiffness: 450, damping: 35 }}
                                        />
                                    )}
                                    {isActive && (
                                        <motion.span
                                            layoutId="navbar-active-pill"
                                            className="absolute inset-0 bg-primary/15 dark:bg-primary/25 rounded-full border border-primary/30 dark:border-primary/40 shadow-[0_0_12px_rgba(99,102,241,0.2)] -z-10"
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    {contactNavItem.defaultName}
                                </Link>
                            );
                        })()}
                    </div>

                    {/* Right Action Controls */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        {/* Search / Command Palette Button */}
                        <button
                            onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
                            className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full border border-border/80 dark:border-white/10 bg-card/60 dark:bg-white/[0.03] hover:bg-muted/70 dark:hover:bg-white/[0.08] text-muted-foreground hover:text-foreground text-xs font-medium transition-all shadow-2xs group shrink-0"
                            aria-label="Open search and command palette"
                            title="Search (Ctrl + K)"
                        >
                            <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                            <span className="hidden xl:inline text-[11px]">Search...</span>
                            <kbd className="hidden xl:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono font-semibold bg-muted dark:bg-white/10 rounded text-muted-foreground border border-border/60 dark:border-white/10">
                                ⌘K
                            </kbd>
                        </button>

                        <LanguageToggle />
                        <ThemeToggle />

                        {/* Mobile Menu Toggle Button */}
                        <button
                            className="lg:hidden p-1.5 rounded-full border border-border/70 dark:border-white/10 bg-card/60 dark:bg-white/[0.03] hover:bg-muted/70 text-foreground transition-colors shrink-0"
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label="Toggle navigation menu"
                        >
                            {isOpen ? <X className="h-5 w-5 text-primary" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile / Tablet Drawer (< lg) */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                            transition={{ duration: 0.18, ease: "easeOut" }}
                            className="container max-w-7xl mx-auto pointer-events-auto mt-2 rounded-3xl bg-background/95 dark:bg-background/90 backdrop-blur-2xl border border-border/80 dark:border-primary/20 shadow-2xl p-4 sm:p-5 overflow-hidden"
                        >
                            {/* Search shortcut in mobile drawer */}
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    window.dispatchEvent(new Event("open-command-palette"));
                                }}
                                className="w-full mb-3 flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-muted/50 dark:bg-white/5 border border-border/60 dark:border-white/10 text-muted-foreground text-xs font-medium hover:text-foreground transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <Search className="h-3.5 w-3.5 text-primary" />
                                    <span>Search pages, projects, articles...</span>
                                </span>
                                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-background/80 rounded border border-border/60">⌘K</kbd>
                            </button>

                            {/* Staggered Navigation Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {allNavItems.map((item) => {
                                    const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all",
                                                isActive
                                                    ? "text-primary font-semibold bg-primary/10 border border-primary/20 shadow-xs"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "p-1.5 rounded-xl transition-colors",
                                                    isActive ? "bg-primary/20 text-primary" : "bg-muted/60 dark:bg-white/5 text-muted-foreground"
                                                )}
                                            >
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <span className="flex-1 text-sm">{item.defaultName}</span>
                                            {isActive && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Mobile Drawer Bottom Info */}
                            <div className="mt-4 pt-3 border-t border-border/60 dark:border-white/10 flex items-center justify-between text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1.5 text-[11px]">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    Available for freelance & full-time
                                </span>
                                <div className="flex items-center gap-1">
                                    <LanguageToggle />
                                    <ThemeToggle />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>
        </>
    );
}
