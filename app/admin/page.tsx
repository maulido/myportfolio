"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
    FileText,
    Briefcase,
    MessageSquare,
    BarChart3,
    Eye,
    Inbox,
    Users,
    Clock,
    ArrowUpRight,
    CheckCircle2,
    AlertCircle,
    ExternalLink,
    Award,
    Settings,
    FolderOpen,
    TrendingUp,
    Wrench
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";

// Type definitions
interface Post {
    _id: string;
    title: string;
    category?: string;
    createdAt: string;
    views?: number;
    likes?: number;
}

interface Project {
    _id: string;
    title: string;
    tags?: string[];
    technologies?: string[];
    image?: string;
    imageUrl?: string;
}

interface GalleryItem {
    _id: string;
    title: string;
    category?: string;
    imageUrl?: string;
}

interface ContactMessage {
    _id: string;
    name: string;
    email: string;
    message: string;
    read: boolean;
    createdAt: string;
}

interface NewsletterSubscriber {
    _id: string;
    email: string;
    name?: string;
    subscribed: boolean;
    createdAt: string;
}

interface GuestbookEntry {
    _id: string;
    name: string;
    message: string;
    createdAt: string;
    approved: boolean;
    spam?: boolean;
}

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const [isWorking, setIsWorking] = useState(true);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
    const [isUpdatingMaintenance, setIsUpdatingMaintenance] = useState(false);

    // Core entity states
    const [posts, setPosts] = useState<Post[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [gallery, setGallery] = useState<GalleryItem[]>([]);
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
    const [recentGuestbook, setRecentGuestbook] = useState<GuestbookEntry[]>([]);
    const [pendingGuestbookCount, setPendingGuestbookCount] = useState(0);

    // Analytics states
    const [deviceStats, setDeviceStats] = useState({ mobile: 0, desktop: 0 });
    const [topPages, setTopPages] = useState<{ _id: string; count: number }[]>([]);
    const [visitors, setVisitors] = useState(0);
    const [avgDuration, setAvgDuration] = useState(0);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        let isMounted = true;
        if (status === "authenticated") {
            const loadData = async () => {
                setIsLoadingData(true);
                try {
                    const [
                        postsRes,
                        projectsRes,
                        galleryRes,
                        settingsRes,
                        maintenanceRes,
                        sessionsRes,
                        guestbookRes,
                        pendingGuestbookRes,
                        messagesRes,
                        subscribersRes
                    ] = await Promise.allSettled([
                        fetch("/api/blog"),
                        fetch("/api/projects"),
                        fetch("/api/gallery"),
                        fetch("/api/settings?key=isWorking"),
                        fetch("/api/settings?key=isMaintenanceMode"),
                        fetch("/api/analytics/session/stats"),
                        fetch("/api/guestbook?limit=5"),
                        fetch("/api/guestbook/pending"),
                        fetch("/api/contact"),
                        fetch("/api/newsletter")
                    ]);

                    if (!isMounted) return;

                    // Handle Blog Posts
                    if (postsRes.status === "fulfilled" && postsRes.value.ok) {
                        const d = await postsRes.value.json();
                        if (d.success && Array.isArray(d.data)) setPosts(d.data);
                    }

                    // Handle Projects
                    if (projectsRes.status === "fulfilled" && projectsRes.value.ok) {
                        const d = await projectsRes.value.json();
                        if (d.success && Array.isArray(d.data)) setProjects(d.data);
                    }

                    // Handle Gallery
                    if (galleryRes.status === "fulfilled" && galleryRes.value.ok) {
                        const d = await galleryRes.value.json();
                        if (d.success && Array.isArray(d.data)) setGallery(d.data);
                    }

                    // Handle Working Status
                    if (settingsRes.status === "fulfilled" && settingsRes.value.ok) {
                        const d = await settingsRes.value.json();
                        if (d.success && d.data !== undefined) setIsWorking(Boolean(d.data));
                    }

                    // Handle Maintenance Mode Status
                    if (maintenanceRes.status === "fulfilled" && maintenanceRes.value.ok) {
                        const d = await maintenanceRes.value.json();
                        if (d.success && d.data !== undefined) {
                            setIsMaintenanceMode(d.data === "true" || d.data === true);
                        }
                    }

                    // Handle Session Analytics
                    if (sessionsRes.status === "fulfilled" && sessionsRes.value.ok) {
                        const d = await sessionsRes.value.json();
                        if (d.success && d.data) {
                            setVisitors(d.data.totalVisitors || 0);
                            setAvgDuration(d.data.avgDuration || 0);
                            if (d.data.devices) setDeviceStats(d.data.devices);
                            if (d.data.topPages) setTopPages(d.data.topPages);
                        }
                    }

                    // Handle Recent Guestbook
                    if (guestbookRes.status === "fulfilled" && guestbookRes.value.ok) {
                        const d = await guestbookRes.value.json();
                        if (d.success && Array.isArray(d.data)) setRecentGuestbook(d.data);
                    }

                    // Handle Pending Guestbook
                    if (pendingGuestbookRes.status === "fulfilled" && pendingGuestbookRes.value.ok) {
                        const d = await pendingGuestbookRes.value.json();
                        if (d.success && Array.isArray(d.data)) setPendingGuestbookCount(d.data.length);
                    }

                    // Handle Inquiries / Contact Messages
                    if (messagesRes.status === "fulfilled" && messagesRes.value.ok) {
                        const d = await messagesRes.value.json();
                        if (d.success && Array.isArray(d.data)) setMessages(d.data);
                    }

                    // Handle Newsletter Subscribers
                    if (subscribersRes.status === "fulfilled" && subscribersRes.value.ok) {
                        const d = await subscribersRes.value.json();
                        if (d.success && Array.isArray(d.data)) setSubscribers(d.data);
                    }
                } catch (error) {
                    console.error("Failed to fetch admin dashboard data", error);
                } finally {
                    if (isMounted) setIsLoadingData(false);
                }
            };

            loadData();
        }

        return () => {
            isMounted = false;
        };
    }, [status]);

    const handleToggleWorking = async () => {
        if (isUpdatingStatus) return;
        setIsUpdatingStatus(true);
        const newValue = !isWorking;
        setIsWorking(newValue);

        try {
            await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: "isWorking", value: newValue })
            });
        } catch (error) {
            console.error("Failed to update status", error);
            setIsWorking(!newValue);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleToggleMaintenance = async () => {
        if (isUpdatingMaintenance) return;
        setIsUpdatingMaintenance(true);
        const nextValue = !isMaintenanceMode;
        setIsMaintenanceMode(nextValue);

        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: "isMaintenanceMode", value: nextValue ? "true" : "false" })
            });

            if (res.ok) {
                if (nextValue) {
                    toast.success("Maintenance Mode Activated! Public visitors now see the maintenance screen.");
                } else {
                    toast.success("Maintenance Mode Disabled! Website is live for all visitors.");
                }
            } else {
                setIsMaintenanceMode(!nextValue);
                toast.error("Failed to update maintenance mode");
            }
        } catch (error) {
            console.error("Failed to update maintenance mode", error);
            setIsMaintenanceMode(!nextValue);
            toast.error("Network error while updating maintenance mode");
        } finally {
            setIsUpdatingMaintenance(false);
        }
    };

    if (status === "loading" || isLoadingData) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent"></div>
            </div>
        );
    }

    const unreadMessagesCount = messages.filter(m => !m.read).length;
    const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);
    const projectsWithoutImages = projects.filter(p => !p.imageUrl && !p.image).length;
    const totalDevices = (deviceStats.desktop + deviceStats.mobile) || 1;
    const desktopPct = Math.round((deviceStats.desktop / totalDevices) * 100);
    const mobilePct = 100 - desktopPct;

    const hasPendingAction = unreadMessagesCount > 0 || pendingGuestbookCount > 0;

    return (
        <div className="space-y-8">
            {/* Top Header & Availability Bar */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60"
            >
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Executive Dashboard</h1>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                            LIVE
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Welcome back, <span className="font-semibold text-foreground">{session?.user?.name || "Admin"}</span>. Real-time portfolio performance & moderation overview.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <Link
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors border border-border"
                    >
                        <span>View Live Site</span>
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </Link>

                    {/* Maintenance Mode Instant Toggle */}
                    <div className="flex items-center gap-2 bg-card border border-border/80 p-1 rounded-2xl shadow-xs">
                        <button
                            onClick={handleToggleMaintenance}
                            disabled={isUpdatingMaintenance}
                            title={isMaintenanceMode ? "Click to disable maintenance mode & restore live site" : "Click to enable maintenance mode"}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                                isMaintenanceMode
                                    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/25"
                                    : "bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Wrench className={`h-3.5 w-3.5 ${isMaintenanceMode ? "animate-spin" : ""}`} />
                            <span>{isMaintenanceMode ? "Maintenance ON" : "Maintenance OFF"}</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-2 bg-card border border-border/80 p-1.5 rounded-2xl shadow-xs">
                        <button
                            onClick={handleToggleWorking}
                            disabled={isUpdatingStatus}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                isWorking
                                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                                    : "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                            }`}
                        >
                            <span className="relative flex h-2 w-2">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isWorking ? "bg-white" : "bg-white"}`}></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                            </span>
                            {isWorking ? "Available for Hire" : "Currently Busy"}
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Maintenance Mode Alert Banner if active */}
            {isMaintenanceMode && (
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-900 dark:text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0">
                            <Wrench className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-sm font-bold flex items-center gap-2">
                                <span>Maintenance Mode is Active</span>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-600 text-white animate-pulse">
                                    PUBLIC BLOCKED
                                </span>
                            </div>
                            <div className="text-xs opacity-90 mt-0.5">
                                Regular visitors are intercepted by the Maintenance Page. You can preview the live site with admin session or turn off maintenance.
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Link href="/maintenance?preview=true" target="_blank" className="flex-1 sm:flex-none">
                            <button className="w-full px-3 py-1.5 rounded-xl bg-background/80 hover:bg-background text-foreground text-xs font-semibold transition-all border border-border">
                                Preview Screen
                            </button>
                        </Link>
                        <button
                            onClick={handleToggleMaintenance}
                            disabled={isUpdatingMaintenance}
                            className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                            Turn Off (Go Live)
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Actionable Notification / Moderation Banner */}
            {hasPendingAction ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                            <AlertCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-sm font-bold">Action Required: Pending Items</div>
                            <div className="text-xs opacity-90">
                                {unreadMessagesCount > 0 && `${unreadMessagesCount} unread client inquiry${unreadMessagesCount > 1 ? "s" : ""}`}
                                {unreadMessagesCount > 0 && pendingGuestbookCount > 0 && " and "}
                                {pendingGuestbookCount > 0 && `${pendingGuestbookCount} guestbook entry awaiting approval`}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {unreadMessagesCount > 0 && (
                            <Link href="/admin/messages" className="flex-1 sm:flex-none">
                                <button className="w-full px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs">
                                    Review Inquiries ({unreadMessagesCount})
                                </button>
                            </Link>
                        )}
                        {pendingGuestbookCount > 0 && (
                            <Link href="/admin/guestbook" className="flex-1 sm:flex-none">
                                <button className="w-full px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold transition-all border border-amber-500/40">
                                    Moderate ({pendingGuestbookCount})
                                </button>
                            </Link>
                        )}
                    </div>
                </motion.div>
            ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>All systems clear. No pending inquiries or guestbook approvals.</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Operational</span>
                </div>
            )}

            {/* 6 Key Metric KPI Cards */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                {/* 1. Blog Posts */}
                <div className="bg-card/90 dark:bg-card/50 backdrop-blur-md border border-border/80 dark:border-primary/10 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                            <FileText className="h-4 w-4" />
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-0.5">
                            <Eye className="h-3 w-3" /> {totalViews}
                        </span>
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight">{posts.length}</div>
                        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Blog Posts</div>
                    </div>
                </div>

                {/* 2. Projects */}
                <div className="bg-card/90 dark:bg-card/50 backdrop-blur-md border border-border/80 dark:border-primary/10 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                            <Briefcase className="h-4 w-4" />
                        </span>
                        <span className="text-[10px] font-bold text-emerald-500">
                            Portfolio
                        </span>
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight">{projects.length}</div>
                        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Projects</div>
                    </div>
                </div>

                {/* 3. Inquiries */}
                <div className="bg-card/90 dark:bg-card/50 backdrop-blur-md border border-border/80 dark:border-primary/10 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                            <Inbox className="h-4 w-4" />
                        </span>
                        {unreadMessagesCount > 0 ? (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-500 text-white animate-pulse">
                                {unreadMessagesCount} New
                            </span>
                        ) : (
                            <span className="text-[10px] font-bold text-muted-foreground">Clean</span>
                        )}
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight">{messages.length}</div>
                        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Inquiries</div>
                    </div>
                </div>

                {/* 4. Subscribers */}
                <div className="bg-card/90 dark:bg-card/50 backdrop-blur-md border border-border/80 dark:border-primary/10 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="p-2 rounded-xl bg-pink-500/10 text-pink-500">
                            <Users className="h-4 w-4" />
                        </span>
                        <span className="text-[10px] font-bold text-pink-500">
                            Audience
                        </span>
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight">{subscribers.length}</div>
                        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Subscribers</div>
                    </div>
                </div>

                {/* 5. Visitors */}
                <div className="bg-card/90 dark:bg-card/50 backdrop-blur-md border border-border/80 dark:border-primary/10 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                            <BarChart3 className="h-4 w-4" />
                        </span>
                        <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
                            <TrendingUp className="h-3 w-3" /> Live
                        </span>
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight">{visitors}</div>
                        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Sessions</div>
                    </div>
                </div>

                {/* 6. Avg Duration */}
                <div className="bg-card/90 dark:bg-card/50 backdrop-blur-md border border-border/80 dark:border-primary/10 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                            <Clock className="h-4 w-4" />
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground">Engaged</span>
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight">
                            {Math.floor(avgDuration / 60)}m {avgDuration % 60}s
                        </div>
                        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Avg Time</div>
                    </div>
                </div>
            </div>

            {/* Quick Action Hub */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Quick Actions Hub</h2>
                    <span className="text-xs text-muted-foreground">Direct management shortcuts</span>
                </div>
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
                    {[
                        { title: "New Post", desc: "Write article", href: "/admin/posts/new", icon: FileText, color: "from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-500" },
                        { title: "New Project", desc: "Showcase work", href: "/admin/projects/new", icon: Briefcase, color: "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-500" },
                        { title: "Add Cert", desc: "Credentials", href: "/admin/certifications/new", icon: Award, color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-500" },
                        { title: "Media Lib", desc: "Asset manager", href: "/admin/media", icon: FolderOpen, color: "from-pink-500/20 to-pink-600/10 border-pink-500/30 text-pink-500" },
                        { title: "Inquiries", desc: "Client mail", href: "/admin/messages", icon: Inbox, color: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-500", badge: unreadMessagesCount },
                        { title: "Guestbook", desc: "Visitor notes", href: "/admin/guestbook", icon: MessageSquare, color: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-500", badge: pendingGuestbookCount },
                        { title: "Analytics", desc: "Traffic metrics", href: "/admin/analytics", icon: BarChart3, color: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-500" },
                        { title: "Settings", desc: "Global config", href: "/admin/settings", icon: Settings, color: "from-slate-500/20 to-slate-600/10 border-slate-500/30 text-slate-400" },
                    ].map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link key={item.title} href={item.href}>
                                <div className={`relative p-3 rounded-2xl bg-gradient-to-br ${item.color} border transition-all hover:scale-105 active:scale-95 group cursor-pointer shadow-xs flex flex-col justify-between h-28`}>
                                    {item.badge ? (
                                        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-red-500 text-white">
                                            {item.badge}
                                        </span>
                                    ) : null}
                                    <div className="h-8 w-8 rounded-xl bg-background/80 flex items-center justify-center shadow-xs">
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">{item.title}</div>
                                        <div className="text-[10px] text-muted-foreground">{item.desc}</div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Dual Live Feeds: Recent Inquiries + Recent Guestbook */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Inquiries Feed */}
                <div className="bg-card/90 dark:bg-card/50 backdrop-blur-md border border-border/80 dark:border-primary/10 rounded-2xl p-6 shadow-xs flex flex-col">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                                <Inbox className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Recent Client Inquiries</h3>
                                <p className="text-xs text-muted-foreground">Messages from the contact form</p>
                            </div>
                        </div>
                        <Link href="/admin/messages" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                            <span>View All</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    <div className="space-y-3 flex-1">
                        {messages.length > 0 ? (
                            messages.slice(0, 4).map((msg) => (
                                <Link key={msg._id} href="/admin/messages">
                                    <div className={`p-3 rounded-xl border transition-all hover:bg-muted/50 mb-2 ${
                                        !msg.read ? "bg-primary/5 border-primary/20" : "bg-background/40 border-border/60"
                                    }`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-xs text-foreground">{msg.name}</span>
                                                {!msg.read && (
                                                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-primary text-white">
                                                        NEW
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground">
                                                {new Date(msg.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-muted-foreground font-mono mb-1">{msg.email}</div>
                                        <p className="text-xs text-foreground/80 line-clamp-2 italic">&quot;{msg.message}&quot;</p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="h-44 flex flex-col items-center justify-center text-muted-foreground text-center">
                                <Inbox className="h-8 w-8 mb-2 opacity-40" />
                                <p className="text-xs font-medium">No contact messages received yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Guestbook Feed */}
                <div className="bg-card/90 dark:bg-card/50 backdrop-blur-md border border-border/80 dark:border-primary/10 rounded-2xl p-6 shadow-xs flex flex-col">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                                <MessageSquare className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Recent Guestbook Entries</h3>
                                <p className="text-xs text-muted-foreground">Public notes left by visitors</p>
                            </div>
                        </div>
                        <Link href="/admin/guestbook" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                            <span>Manage</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    <div className="space-y-3 flex-1">
                        {recentGuestbook.length > 0 ? (
                            recentGuestbook.slice(0, 4).map((entry) => (
                                <div key={entry._id} className="p-3 rounded-xl bg-background/40 border border-border/60 hover:bg-muted/50 transition-all flex items-start gap-3">
                                    <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                                        {entry.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-xs text-foreground truncate">{entry.name}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                                entry.approved ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                            }`}>
                                                {entry.approved ? "Approved" : "Pending"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 italic">&quot;{entry.message}&quot;</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-44 flex flex-col items-center justify-center text-muted-foreground text-center">
                                <MessageSquare className="h-8 w-8 mb-2 opacity-40" />
                                <p className="text-xs font-medium">No guestbook entries found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Analytics & Diagnostics Section */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Top Content Performance (Views vs Likes) */}
                <div className="lg:col-span-2 bg-card/90 dark:bg-card/50 backdrop-blur-md border border-border/80 dark:border-primary/10 rounded-2xl p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Top Content Performance</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Top articles ranked by views & reader reactions</p>
                        </div>
                        <Link href="/admin/posts" className="text-xs font-bold text-primary hover:underline">
                            All Posts
                        </Link>
                    </div>
                    <div className="w-full h-[280px]">
                        {posts.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={posts.map(p => ({
                                    ...p,
                                    views: p.views || 0,
                                    likes: p.likes || 0
                                })).sort((a, b) => b.views - a.views).slice(0, 5)}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.1)" />
                                    <XAxis
                                        dataKey="title"
                                        fontSize={10}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + "..." : val}
                                    />
                                    <YAxis
                                        fontSize={10}
                                        axisLine={false}
                                        tickLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: "rgba(99, 102, 241, 0.05)" }}
                                        contentStyle={{
                                            background: "var(--card)",
                                            color: "var(--foreground)",
                                            border: "1px solid var(--border)",
                                            borderRadius: "12px",
                                            fontSize: "12px"
                                        }}
                                    />
                                    <Bar dataKey="views" fill="#6366f1" radius={[4, 4, 0, 0]} name="Views" />
                                    <Bar dataKey="likes" fill="#ec4899" radius={[4, 4, 0, 0]} name="Likes" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                                <BarChart3 className="h-8 w-8 mb-2 opacity-40" />
                                <p className="text-xs">No article data available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Audience Device Breakdown */}
                <div className="bg-card/90 dark:bg-card/50 backdrop-blur-md border border-border/80 dark:border-primary/10 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Device Breakdown</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Desktop vs Mobile visitor split</p>
                    </div>
                    <div className="w-full h-[200px] flex items-center justify-center my-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: "Desktop", value: deviceStats.desktop || 1 },
                                        { name: "Mobile", value: deviceStats.mobile || 0 }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    <Cell fill="#6366f1" /> {/* Desktop - Indigo */}
                                    <Cell fill="#ec4899" /> {/* Mobile - Pink */}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: "var(--card)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "12px",
                                        fontSize: "12px"
                                    }}
                                />
                                <Legend verticalAlign="bottom" height={24} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-center">
                        <div className="p-2 rounded-xl bg-indigo-500/10">
                            <div className="text-xs font-bold text-indigo-500">{desktopPct}%</div>
                            <div className="text-[10px] text-muted-foreground font-medium">Desktop ({deviceStats.desktop})</div>
                        </div>
                        <div className="p-2 rounded-xl bg-pink-500/10">
                            <div className="text-xs font-bold text-pink-500">{mobilePct}%</div>
                            <div className="text-[10px] text-muted-foreground font-medium">Mobile ({deviceStats.mobile})</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Popular Routes & Content Health Audit */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Most Visited Pages */}
                <div className="bg-card/90 dark:bg-card/50 backdrop-blur-md border border-border/80 dark:border-primary/10 rounded-2xl p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
                        <div>
                            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Top Site Routes</h3>
                            <p className="text-xs text-muted-foreground">Most traversed portfolio destinations</p>
                        </div>
                        <Link href="/admin/analytics" className="text-xs font-bold text-primary hover:underline">
                            Full Analytics
                        </Link>
                    </div>
                    <div className="space-y-2.5">
                        {topPages.length > 0 ? (
                            topPages.slice(0, 5).map((page, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-background/40 border border-border/60">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="h-6 w-6 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                            #{idx + 1}
                                        </div>
                                        <span className="text-xs font-medium text-foreground truncate" title={page._id}>
                                            {page._id === "/" ? "/ (Home)" : page._id}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-bold text-primary shrink-0 ml-2">
                                        <Eye className="h-3 w-3 text-muted-foreground" />
                                        <span>{page.count}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-xs text-muted-foreground">
                                No page view analytics recorded yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Health & System Diagnostics */}
                <div className="bg-card/90 dark:bg-card/50 backdrop-blur-md border border-border/80 dark:border-primary/10 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
                            <div>
                                <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Portfolio Health & Status</h3>
                                <p className="text-xs text-muted-foreground">Content completeness & diagnostics</p>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                Healthy
                            </span>
                        </div>

                        <div className="space-y-2.5">
                            <Link href="/admin/projects">
                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-background/40 border border-border/60 hover:bg-muted/40 transition-colors cursor-pointer mb-2">
                                    <div className="flex items-center gap-2 text-xs">
                                        <div className={`h-2 w-2 rounded-full ${projectsWithoutImages === 0 ? "bg-emerald-500" : "bg-amber-500"}`} />
                                        <span className="font-medium text-foreground">Projects Missing Images</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-bold">
                                        <span>{projectsWithoutImages}</span>
                                        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                                    </div>
                                </div>
                            </Link>

                            <Link href="/admin/posts">
                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-background/40 border border-border/60 hover:bg-muted/40 transition-colors cursor-pointer mb-2">
                                    <div className="flex items-center gap-2 text-xs">
                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                        <span className="font-medium text-foreground">Articles with &lt; 20 Views</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-bold">
                                        <span>{posts.filter(p => (p.views || 0) < 20).length}</span>
                                        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                                    </div>
                                </div>
                            </Link>

                            <Link href="/admin/gallery">
                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-background/40 border border-border/60 hover:bg-muted/40 transition-colors cursor-pointer mb-2">
                                    <div className="flex items-center gap-2 text-xs">
                                        <div className="h-2 w-2 rounded-full bg-purple-500" />
                                        <span className="font-medium text-foreground">Gallery Items</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-bold">
                                        <span>{gallery.length}</span>
                                        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                                    </div>
                                </div>
                            </Link>

                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-background/40 border border-border/60">
                                <div className="flex items-center gap-2 text-xs">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                    <span className="font-medium text-foreground">MongoDB Connection</span>
                                </div>
                                <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase">Connected</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Admin Engine: Next.js 16 App Router</span>
                        <Link href="/admin/settings" className="font-bold text-primary hover:underline">
                            Configure Settings
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
