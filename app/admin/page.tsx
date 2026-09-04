"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { LogOut, FileText, Briefcase, Image as ImageIcon, MessageSquare, BarChart3, Eye, Pencil } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart, Pie, Cell, Legend
} from "recharts";

// Type definitions
interface Post {
    _id: string;
    title: string;
    category: string;
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
    category: string;
    imageUrl?: string;
}

const analyticsData = [
    { name: "Mon", views: 400, downloads: 24, messages: 12 },
    { name: "Tue", views: 300, downloads: 13, messages: 9 },
    { name: "Wed", views: 200, downloads: 38, messages: 15 },
    { name: "Thu", views: 278, downloads: 39, messages: 10 },
    { name: "Fri", views: 189, downloads: 48, messages: 22 },
    { name: "Sat", views: 239, downloads: 38, messages: 20 },
    { name: "Sun", views: 349, downloads: 43, messages: 25 },
];

interface GuestbookEntry {
    _id: string;
    name: string;
    message: string;
    createdAt: string;
    approved: boolean;
}

export default function AdminDashboard() {
    const { status } = useSession();
    const [isWorking, setIsWorking] = useState(true);

    const [stats, setStats] = useState({ totalPosts: 0, totalProjects: 0, totalGallery: 0, visitors: 0, avgDuration: 0 });
    const [posts, setPosts] = useState<Post[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [gallery, setGallery] = useState<GalleryItem[]>([]);
    const [recentGuestbook, setRecentGuestbook] = useState<GuestbookEntry[]>([]);
    const [deviceStats, setDeviceStats] = useState({ mobile: 0, desktop: 0 });
    const [topPages, setTopPages] = useState<{ _id: string; count: number }[]>([]);

    useEffect(() => {
        let isMounted = true;
        if (status === "authenticated") {
            const loadData = async () => {
                try {
                    const [postsRes, projectsRes, galleryRes, settingsRes, sessionsRes, guestbookRes] = await Promise.all([
                        fetch('/api/blog'),
                        fetch('/api/projects'),
                        fetch('/api/gallery'),
                        fetch('/api/settings?key=isWorking'),
                        fetch('/api/analytics/session/stats'),
                        fetch('/api/guestbook?limit=5')
                    ]);

                    const [postsData, projectsData, galleryData, settingsData, sessionsData, guestbookData] = await Promise.all([
                        postsRes.json(),
                        projectsRes.json(),
                        galleryRes.json(),
                        settingsRes.json(),
                        sessionsRes.json(),
                        guestbookRes.json()
                    ]);

                    if (!isMounted) return;

                    if (postsData.success) setPosts(postsData.data);
                    if (projectsData.success) setProjects(projectsData.data);
                    if (galleryData.success) setGallery(galleryData.data);
                    if (guestbookData.success) setRecentGuestbook(guestbookData.data);
                    if (settingsData.success && settingsData.data !== undefined) setIsWorking(settingsData.data);

                    setStats({
                        totalPosts: postsData.data?.length || 0,
                        totalProjects: projectsData.data?.length || 0,
                        totalGallery: galleryData.data?.length || 0,
                        visitors: sessionsData.data?.totalVisitors || 0,
                        avgDuration: sessionsData.data?.avgDuration || 0
                    });

                    if (sessionsData.success && sessionsData.data?.devices) {
                        setDeviceStats(sessionsData.data.devices);
                    }
                    if (sessionsData.success && sessionsData.data?.topPages) {
                        setTopPages(sessionsData.data.topPages);
                    }

                } catch (error) {
                    console.error("Failed to fetch admin data", error);
                }
            };
            loadData();
        }
        return () => {
            isMounted = false;
        };
    }, [status]);

    const handleToggleWorking = async () => {
        const newValue = !isWorking;
        setIsWorking(newValue);
        try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'isWorking', value: newValue })
            });
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    if (status === "loading") {
        return <div className="flex h-screen items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>;
    }

    return (
        <div className="flex min-h-screen flex-col bg-background/50">
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="space-y-8">
                    {/* Content Area */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight">System Overview</h2>
                                <p className="text-muted-foreground">Real-time performance and portfolio metrics.</p>
                            </div>
                            <div className="flex items-center gap-3 bg-card/50 backdrop-blur-xl border border-primary/10 p-2 rounded-2xl">
                                <span className="text-xs font-bold pl-2">Status:</span>
                                <button
                                    onClick={handleToggleWorking}
                                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${isWorking ? "bg-green-500 text-white shadow-lg shadow-green-500/20" : "bg-orange-500 text-white shadow-lg shadow-orange-500/20"}`}
                                >
                                    {isWorking ? "Available for Hire" : "Currently Busy"}
                                </button>
                            </div>
                        </div>

                            {/* Summary Stats */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                {[
                                    { label: "Total Posts", value: stats.totalPosts, trend: "+12%", icon: <FileText className="h-4 w-4" /> },
                                    { label: "Total Projects", value: stats.totalProjects, trend: "+8%", icon: <Briefcase className="h-4 w-4" /> },
                                    { label: "Gallery Items", value: stats.totalGallery, trend: "+5%", icon: <ImageIcon className="h-4 w-4" /> },
                                    { label: "Avg Session", value: `${Math.floor(stats.avgDuration / 60)}m ${stats.avgDuration % 60}s`, trend: "+10%", icon: <LogOut className="h-4 w-4 rotate-180" /> },
                                ].map((stat) => (
                                    <div key={stat.label} className="bg-card/40 backdrop-blur-md border border-primary/10 rounded-2xl p-6 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-2 bg-primary/10 rounded-lg text-primary">{stat.icon}</div>
                                            <span className={`text-[10px] font-bold ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-orange-500'}`}>{stat.trend}</span>
                                        </div>
                                        <div className="text-2xl font-bold">{stat.value}</div>
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Quick Actions / Shortcuts */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <Link href="/admin/posts/new">
                                    <button className="w-full bg-gradient-to-br from-purple-500/10 to-purple-600/10 hover:from-purple-500/20 hover:to-purple-600/20 border border-purple-500/20 hover:border-purple-500/40 p-4 rounded-2xl flex items-center gap-4 transition-all group">
                                        <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-foreground">New Post</div>
                                            <div className="text-xs text-muted-foreground">Write a blog post</div>
                                        </div>
                                    </button>
                                </Link>

                                <Link href="/admin/projects/new">
                                    <button className="w-full bg-gradient-to-br from-blue-500/10 to-blue-600/10 hover:from-blue-500/20 hover:to-blue-600/20 border border-blue-500/20 hover:border-blue-500/40 p-4 rounded-2xl flex items-center gap-4 transition-all group">
                                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                            <Briefcase className="h-6 w-6" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-foreground">New Project</div>
                                            <div className="text-xs text-muted-foreground">Add to portfolio</div>
                                        </div>
                                    </button>
                                </Link>

                                <Link href="/admin/gallery/new">
                                    <button className="w-full bg-gradient-to-br from-pink-500/10 to-pink-600/10 hover:from-pink-500/20 hover:to-pink-600/20 border border-pink-500/20 hover:border-pink-500/40 p-4 rounded-2xl flex items-center gap-4 transition-all group">
                                        <div className="h-12 w-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
                                            <ImageIcon className="h-6 w-6" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-foreground">Upload Image</div>
                                            <div className="text-xs text-muted-foreground">Add to gallery</div>
                                        </div>
                                    </button>
                                </Link>

                                <Link href="/admin/profile">
                                    <button className="w-full bg-gradient-to-br from-green-500/10 to-green-600/10 hover:from-green-500/20 hover:to-green-600/20 border border-green-500/20 hover:border-green-500/40 p-4 rounded-2xl flex items-center gap-4 transition-all group">
                                        <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                                            <Pencil className="h-6 w-6" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-foreground">Edit Profile</div>
                                            <div className="text-xs text-muted-foreground">Update bio & info</div>
                                        </div>
                                    </button>
                                </Link>
                            </div>
                            <div className="grid gap-8 lg:grid-cols-2">
                                <div className="bg-card/40 backdrop-blur-md border border-primary/10 rounded-3xl p-6 shadow-xl">
                                    <h3 className="font-bold mb-6 text-sm uppercase tracking-widest text-muted-foreground">Top Content</h3>
                                    <div className="w-full h-[320px]">
                                        {posts.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={posts.map(p => ({
                                                    ...p,
                                                    views: p.views || 0,
                                                    likes: p.likes || 0
                                                })).sort((a, b) => b.views - a.views).slice(0, 5)}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(139, 92, 246, 0.1)" />
                                                    <XAxis
                                                        dataKey="title"
                                                        fontSize={10}
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tickFormatter={(val) => val.length > 10 ? val.substring(0, 10) + '...' : val}
                                                    />
                                                    <YAxis
                                                        fontSize={10}
                                                        axisLine={false}
                                                        tickLine={false}
                                                        allowDecimals={false}
                                                    />
                                                    <Tooltip
                                                        cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                                                        contentStyle={{
                                                            background: "var(--card)",
                                                            color: "var(--foreground)",
                                                            border: "1px solid var(--border)",
                                                            borderRadius: "12px",
                                                            fontSize: "12px"
                                                        }}
                                                    />
                                                    <Bar dataKey="views" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Views" />
                                                    <Bar dataKey="likes" fill="#ec4899" radius={[4, 4, 0, 0]} name="Likes" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                                <BarChart3 className="h-12 w-12 mb-2" />
                                                <p className="text-sm">No data available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-card/40 backdrop-blur-md border border-primary/10 rounded-3xl p-6 shadow-xl">
                                    <h3 className="font-bold mb-6 text-sm uppercase tracking-widest text-muted-foreground">Portfolio Performance</h3>
                                    <div className="w-full h-[320px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={analyticsData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(139, 92, 246, 0.1)" />
                                                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                                                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                                                <Tooltip
                                                    contentStyle={{
                                                        background: "var(--card)",
                                                        color: "var(--foreground)",
                                                        border: "1px solid var(--border)",
                                                        borderRadius: "12px",
                                                        fontSize: "12px"
                                                    }}
                                                />
                                                <Line type="monotone" dataKey="downloads" stroke="#ec4899" strokeWidth={2} dot={{ r: 4 }} />
                                                <Line type="monotone" dataKey="messages" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Activity & Health Row */}
                            <div className="grid gap-8 lg:grid-cols-2">
                                {/* Recent Guestbook Activity */}
                                <div className="bg-card/40 backdrop-blur-md border border-primary/10 rounded-3xl p-6 shadow-xl flex flex-col">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Recent Activity</h3>
                                        <Link href="/admin/guestbook">
                                            <button className="text-xs text-primary font-bold hover:underline">View All</button>
                                        </Link>
                                    </div>
                                    <div className="space-y-4 flex-1">
                                        {recentGuestbook.length > 0 ? (
                                            recentGuestbook.map((entry) => (
                                                <div key={entry._id} className="flex gap-4 p-3 rounded-xl bg-background/50 hover:bg-background/80 transition-colors border border-primary/5">
                                                    <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                                        {entry.name.charAt(0)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <div className="font-bold text-sm truncate">{entry.name}</div>
                                                            <div className="text-[10px] text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString()}</div>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground line-clamp-2 italic">&quot;{entry.message}&quot;</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                                <MessageSquare className="h-10 w-10 mb-2" />
                                                <p className="text-sm">No recent messages</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Content Health Audit */}
                                <div className="bg-card/40 backdrop-blur-md border border-primary/10 rounded-3xl p-6 shadow-xl">
                                    <h3 className="font-bold mb-6 text-sm uppercase tracking-widest text-muted-foreground">Content Health</h3>
                                    <div className="space-y-4">
                                        {[
                                            {
                                                label: "Projects without Images",
                                                count: projects.filter(p => !p.imageUrl && !p.image).length,
                                                status: projects.filter(p => !p.imageUrl && !p.image).length === 0 ? "good" : "warning",
                                                link: "/admin/projects"
                                            },
                                            {
                                                label: "Posts with < 50 views",
                                                count: posts.filter(p => (p.views || 0) < 50).length,
                                                status: "info",
                                                link: "/admin/posts"
                                            },
                                            {
                                                label: "Gallery items without categories",
                                                count: gallery.filter(g => !g.category).length,
                                                status: gallery.filter(g => !g.category).length === 0 ? "good" : "warning",
                                                link: "/admin/gallery"
                                            }
                                        ].map((item, idx) => (
                                            <Link key={idx} href={item.link}>
                                                <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 hover:bg-background/80 transition-all border border-primary/5 group cursor-pointer hover:border-primary/20">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-2 w-2 rounded-full ${item.status === 'good' ? 'bg-green-500' : item.status === 'warning' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                                                        <span className="text-sm font-medium">{item.label}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-bold text-sm">{item.count}</span>
                                                        <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                            →
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Audience Analytics Row */}
                            <div className="grid gap-8 lg:grid-cols-2 mt-8">
                                <div className="bg-card/40 backdrop-blur-md border border-primary/10 rounded-3xl p-6 shadow-xl h-[400px]">
                                    <h3 className="font-bold mb-6 text-sm uppercase tracking-widest text-muted-foreground">Device Breakdown</h3>
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: 'Mobile', value: deviceStats.mobile },
                                                        { name: 'Desktop', value: deviceStats.desktop }
                                                    ]}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    <Cell fill="#ec4899" /> {/* Mobile - Pink */}
                                                    <Cell fill="#8b5cf6" /> {/* Desktop - Purple */}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        background: "var(--card)",
                                                        border: "1px solid var(--border)",
                                                        borderRadius: "12px",
                                                        fontSize: "12px"
                                                    }}
                                                />
                                                <Legend verticalAlign="bottom" height={36} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-card/40 backdrop-blur-md border border-primary/10 rounded-3xl p-6 shadow-xl h-[400px] flex flex-col">
                                    <h3 className="font-bold mb-6 text-sm uppercase tracking-widest text-muted-foreground">Most Visited Pages</h3>
                                    <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                                        {topPages.length > 0 ? (
                                            topPages.map((page, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-primary/5">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="h-8 w-8 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                            #{idx + 1}
                                                        </div>                                                        <span className="text-sm font-medium truncate" title={page._id}>
                                                            {page._id === '/' ? 'Home' : page._id}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <Eye className="h-3 w-3 text-muted-foreground" />
                                                        <span className="font-bold text-sm">{page.count}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                                <FileText className="h-10 w-10 mb-2" />
                                                <p className="text-sm">No page views yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                </div>
            </main>
        </div>
    );
}
