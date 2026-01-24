"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Plus, LayoutDashboard, FileText, Briefcase, Image, Award, MessageCircle, Pencil, Trash2, Search, Mail, Package, MessageSquare, FolderOpen, BarChart3, Eye } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import CareerFilter from "@/components/admin/CareerFilter";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
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
    tags: string[];
    image?: string;
}

interface GalleryItem {
    _id: string;
    title: string;
    category: string;
    imageUrl?: string;
    date: string;
}

interface Certification {
    _id: string;
    title: string;
    issuer: string;
    issueDate: string;
    category: string;
}

interface Newsletter {
    _id: string;
    email: string;
    name?: string;
    subscribed: boolean;
    createdAt: string;
}

interface Testimonial {
    _id: string;
    name: string;
    role: string;
    company?: string;
}

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

interface Skill {
    _id: string;
    name: string;
    level: 'Expert' | 'Advanced' | 'Intermediate' | 'Beginner';
    years: number;
    category: string;
    icon: string;
    color?: string;
    order: number;
}

interface AnalyticsData {
    type: string;
    count: number;
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

// ... types
interface GuestbookEntry {
    _id: string;
    name: string;
    message: string;
    createdAt: string;
    approved: boolean;
}

// ... existing types ...

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const [activeTab, setActiveTab] = useState("overview");
    const [isWorking, setIsWorking] = useState(true);

    const [stats, setStats] = useState({ totalPosts: 0, totalProjects: 0, totalGallery: 0, visitors: 0, avgDuration: 0 });
    const [posts, setPosts] = useState<Post[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [gallery, setGallery] = useState<GalleryItem[]>([]);
    const [certs, setCerts] = useState<Certification[]>([]);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [newsletter, setNewsletter] = useState<Newsletter[]>([]);
    const [careers, setCareers] = useState<CareerJourney[]>([]);
    const [careerTypeFilter, setCareerTypeFilter] = useState<'all' | 'work' | 'education' | 'achievement'>('all');
    const [skills, setSkills] = useState<Skill[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [recentGuestbook, setRecentGuestbook] = useState<GuestbookEntry[]>([]);

    // Delete confirmation state
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; type: string; id: string; name: string }>({
        show: false,
        type: '',
        id: '',
        name: ''
    });

    const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());

    const handleBulkDelete = async (type: 'post' | 'project') => {
        const ids = type === 'post' ? Array.from(selectedPosts) : []; // Extend for projects later

        if (!confirm(`Are you sure you want to delete ${ids.length} items?`)) return;

        try {
            const res = await fetch('/api/admin/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids, type })
            });

            if (res.ok) {
                alert('Bulk delete successful');
                fetchData();
                setSelectedPosts(new Set());
            } else {
                alert('Failed to delete items');
            }
        } catch (error) {
            console.error('Bulk delete failed', error);
        }
    };

    // Debug: Log component mount
    useEffect(() => {
        console.log('AdminDashboard mounted');
        console.log('Session status:', status);
        console.log('Session data:', session);
    }, []);

    // Debug: Log when posts change
    useEffect(() => {
        console.log('Posts updated:', posts.length, 'posts');
    }, [posts]);

    const fetchData = async () => {
        try {
            const [postsRes, projectsRes, galleryRes, certsRes, testimonialsRes, newsletterRes, careersRes, skillsRes, analyticsRes, settingsRes, sessionsRes, guestbookRes] = await Promise.all([
                fetch('/api/blog'),
                fetch('/api/projects'),
                fetch('/api/gallery'),
                fetch('/api/certifications'),
                fetch('/api/testimonials'),
                fetch('/api/newsletter'),
                fetch('/api/career'),
                fetch('/api/skills'),
                fetch('/api/analytics'),
                fetch('/api/settings?key=isWorking'),
                fetch('/api/analytics/session/stats'),
                fetch('/api/guestbook?limit=5')
            ]);

            const [postsData, projectsData, galleryData, certsData, testimonialsData, newsletterData, careersData, skillsData, analyticsData, settingsData, sessionsData, guestbookData] = await Promise.all([
                postsRes.json(),
                projectsRes.json(),
                galleryRes.json(),
                certsRes.json(),
                testimonialsRes.json(),
                newsletterRes.json(),
                careersRes.json(),
                skillsRes.json(),
                analyticsRes.json(),
                settingsRes.json(),
                sessionsRes.json(),
                guestbookRes.json()
            ]);

            if (postsData.success) setPosts(postsData.data);
            if (projectsData.success) setProjects(projectsData.data);
            if (galleryData.success) setGallery(galleryData.data);
            if (certsData.success) setCerts(certsData.data);
            if (testimonialsData.success) setTestimonials(testimonialsData.data);
            if (newsletterData.success) setNewsletter(newsletterData.data);
            if (guestbookData.success) setRecentGuestbook(guestbookData.data);
            if (careersData.success) {
                setCareers(careersData.data);
            }
            if (skillsData.success) {
                // Flatten grouped skills into single array
                const allSkills = skillsData.data.flatMap((group: any) => group.skills);
                setSkills(allSkills);
            }
            if (settingsData.success && settingsData.data !== undefined) setIsWorking(settingsData.data);

            // Calculate aggregate stats (for future use)
            // const totalViews = analyticsData.data
            //     ?.filter((a: AnalyticsData) => a.type === 'page_view')
            //     ?.reduce((acc: number, curr: AnalyticsData) => acc + curr.count, 0) || 0;
            // const totalDownloads = analyticsData.data
            //     ?.find((a: AnalyticsData) => a.type === 'cv_download')?.count || 0;

            setStats({
                totalPosts: postsData.data?.length || 0,
                totalProjects: projectsData.data?.length || 0,
                totalGallery: galleryData.data?.length || 0,
                visitors: sessionsData.data?.totalVisitors || 0,
                avgDuration: sessionsData.data?.avgDuration || 0
            });
        } catch (error) {
            // Keep error logging for admin debugging
            console.error("Failed to fetch admin data", error);
        }
    };

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



    const handleDelete = async (type: string, id: string, name: string = '') => {
        console.log('🗑️ handleDelete called with:', { type, id, name });

        // Show confirmation modal instead of browser confirm
        setDeleteConfirm({
            show: true,
            type,
            id,
            name
        });
    };

    const executeDelete = async () => {
        const { type, id } = deleteConfirm;
        console.log('🗑️ Executing delete for:', { type, id });

        // Hide confirmation modal
        setDeleteConfirm({ show: false, type: '', id: '', name: '' });

        try {
            let endpoint = `/api/${type}/${id}`;
            if (type === 'post') endpoint = `/api/blog/${id}`;
            if (type === 'project') endpoint = `/api/projects/${id}`;
            if (type === 'career') endpoint = `/api/career/${id}`;
            if (type === 'certification') endpoint = `/api/certifications/${id}`;
            if (type === 'testimonial') endpoint = `/api/testimonials/${id}`;
            if (type === 'skill') endpoint = `/api/skills/${id}`;

            console.log(`Deleting ${type} with ID: ${id} at endpoint: ${endpoint}`);

            const res = await fetch(endpoint, { method: 'DELETE' });

            // Check if response is JSON before parsing
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await res.text();
                console.error('Non-JSON response received:', text.substring(0, 200));
                alert(`Server error: Expected JSON response but received HTML. Please check if you're logged in and try again.`);
                return;
            }

            const data = await res.json();

            console.log('Delete response:', res.status, data);

            if (res.ok) {
                alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
                fetchData();
            } else {
                console.error('Delete failed:', data);
                alert(`Failed to delete ${type}: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert(`An error occurred while deleting ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const cancelDelete = () => {
        console.log('Delete cancelled by user');
        setDeleteConfirm({ show: false, type: '', id: '', name: '' });
    };

    const handleCareerFilterChange = (filter: 'all' | 'work' | 'education' | 'achievement') => {
        setCareerTypeFilter(filter);
    };

    useEffect(() => {
        if (status === "authenticated") {
            fetchData();
        }
    }, [status]);

    useEffect(() => {
        setSearchTerm("");
    }, [activeTab]);

    if (status === "loading") {
        return <div className="flex h-screen items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>;
    }

    return (
        <div className="flex min-h-screen flex-col bg-background/50">
            {/* Delete Confirmation Modal */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card border border-primary/20 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
                        <p className="text-muted-foreground mb-6">
                            Are you sure you want to delete this {deleteConfirm.type}?
                            {deleteConfirm.name && <><br /><span className="font-semibold text-foreground">"{deleteConfirm.name}"</span></>}
                            <br /><br />
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeDelete}
                                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="space-y-8">
                    {/* Content Area */}
                    {activeTab === "overview" && (
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
                                    { label: "Gallery Items", value: stats.totalGallery, trend: "+5%", icon: <Image className="h-4 w-4" /> },
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
                                            <Image className="h-6 w-6" />
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
                                                        <p className="text-xs text-muted-foreground line-clamp-2 italic">"{entry.message}"</p>
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
                                                count: projects.filter(p => !p.image).length,
                                                status: projects.filter(p => !p.image).length === 0 ? "good" : "warning",
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

                        </motion.div>
                    )}
                    {activeTab === "posts" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-3xl font-bold tracking-tight">Manage Posts</h2>
                                    {selectedPosts.size > 0 && (
                                        <button
                                            onClick={() => handleBulkDelete('post')}
                                            className="px-3 py-1 text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors animate-in fade-in slide-in-from-left-4"
                                        >
                                            Delete {selectedPosts.size} Selected
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Search posts..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 rounded-xl bg-card border border-primary/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
                                        />
                                    </div>
                                    <Link href="/admin/posts/new">
                                        <button className="inline-flex items-center justify-center rounded-2xl text-sm font-bold bg-primary text-white hover:bg-primary/90 h-11 px-6 shadow-lg shadow-primary/25 transition-all active:scale-95">
                                            <Plus className="mr-2 h-4 w-4" />
                                            New Post
                                        </button>
                                    </Link>
                                </div>
                            </div>

                            {posts.filter((p: Post) => p.title.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
                                <div className="grid gap-4">
                                    <div className="flex items-center gap-2 px-4 pb-2 text-sm text-muted-foreground">
                                        <input
                                            type="checkbox"
                                            checked={selectedPosts.size === posts.length && posts.length > 0}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedPosts(new Set(posts.map(p => p._id)));
                                                } else {
                                                    setSelectedPosts(new Set());
                                                }
                                            }}
                                            className="rounded border-primary/20 bg-card data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                        />
                                        <span>Select All</span>
                                    </div>
                                    {posts.filter((p: Post) => p.title.toLowerCase().includes(searchTerm.toLowerCase())).map((post: Post) => (
                                        <div key={post._id} className={`bg-card/40 backdrop-blur-md border ${selectedPosts.has(post._id) ? 'border-primary' : 'border-primary/10'} rounded-2xl p-4 flex items-center justify-between transition-colors`}>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPosts.has(post._id)}
                                                    onChange={(e) => {
                                                        const newSelected = new Set(selectedPosts);
                                                        if (e.target.checked) {
                                                            newSelected.add(post._id);
                                                        } else {
                                                            newSelected.delete(post._id);
                                                        }
                                                        setSelectedPosts(newSelected);
                                                    }}
                                                    className="rounded border-primary/20 bg-card"
                                                />
                                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {post.title.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold">{post.title}</h4>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span>{post.category}</span>
                                                        <span>•</span>
                                                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <Eye className="h-3 w-3" />
                                                            {post.views || 0}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link href={`/admin/posts/${post._id}`}>
                                                    <button type="button" className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleDelete('post', post._id, post.title);
                                                    }}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-3xl border-2 border-dashed border-primary/10 bg-card/20 backdrop-blur-sm px-8 py-20 text-center text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p className="font-bold">No posts found</p>
                                    <p className="text-xs">Create your first blog post to see it here.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                    {activeTab === "documents" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-bold tracking-tight">CV Management</h2>
                                <button className="inline-flex items-center justify-center rounded-2xl text-sm font-bold bg-primary text-white hover:bg-primary/90 h-11 px-6 shadow-lg shadow-primary/25 transition-all active:scale-95">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Upload New Version
                                </button>
                            </div>
                            <div className="bg-card/40 backdrop-blur-md border border-primary/10 rounded-2xl p-6">
                                <div className="space-y-4">
                                    {[
                                        { version: "v2.1", date: "2023-12-01", status: "Active" },
                                        { version: "v2.0", date: "2023-10-15", status: "Archived" },
                                        { version: "v1.9", date: "2023-08-20", status: "Archived" }
                                    ].map((cv) => (
                                        <div key={cv.version} className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-primary/5 hover:border-primary/20 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold">{cv.version}</div>
                                                    <div className="text-xs text-muted-foreground">Uploaded on {cv.date}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cv.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                                                    {cv.status}
                                                </span>
                                                <button className="text-xs font-bold text-primary hover:underline">Download</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                    {activeTab === "projects" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                <h2 className="text-3xl font-bold tracking-tight">Manage Projects</h2>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Search projects..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 rounded-xl bg-card border border-primary/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
                                        />
                                    </div>
                                    <Link href="/admin/projects/new">
                                        <button className="inline-flex items-center justify-center rounded-2xl text-sm font-bold bg-primary text-white hover:bg-primary/90 h-11 px-6 shadow-lg shadow-primary/25 transition-all active:scale-95">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Project
                                        </button>
                                    </Link>
                                </div>
                            </div>

                            {projects.filter((p: Project) => p.title.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
                                <div className="grid gap-4">
                                    {projects.filter((p: Project) => p.title.toLowerCase().includes(searchTerm.toLowerCase())).map((project: Project) => (
                                        <div key={project._id} className="bg-card/40 backdrop-blur-md border border-primary/10 rounded-2xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                                                    {project.image ? <img src={project.image} alt="" className="w-full h-full object-cover" /> : project.title.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold">{project.title}</h4>
                                                    <p className="text-xs text-muted-foreground">{project.tags.join(', ')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link href={`/admin/projects/${project._id}`}>
                                                    <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleDelete('project', project._id, project.title);
                                                    }}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-3xl border-2 border-dashed border-primary/10 bg-card/20 backdrop-blur-sm px-8 py-20 text-center text-muted-foreground">
                                    <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p className="font-bold">No projects found</p>
                                    <p className="text-xs">Add your first project to showcase it here.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                    {activeTab === "gallery" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                <h2 className="text-3xl font-bold tracking-tight">Manage Gallery</h2>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Search gallery..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 rounded-xl bg-card border border-primary/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
                                        />
                                    </div>
                                    <Link href="/admin/gallery/new">
                                        <button className="inline-flex items-center justify-center rounded-2xl text-sm font-bold bg-primary text-white hover:bg-primary/90 h-11 px-6 shadow-lg shadow-primary/25 transition-all active:scale-95">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Image
                                        </button>
                                    </Link>
                                </div>
                            </div>
                            {gallery.filter((g: GalleryItem) => g.title.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
                                <div className="grid gap-4">
                                    {gallery.filter((g: GalleryItem) => g.title.toLowerCase().includes(searchTerm.toLowerCase())).map((item: GalleryItem) => (
                                        <div key={item._id} className="bg-card/40 backdrop-blur-md border border-primary/10 rounded-2xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                                                    {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" /> : item.title.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold">{item.title}</h4>
                                                    <p className="text-xs text-muted-foreground">{item.category} • {new Date(item.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link href={`/admin/gallery/${item._id}`}>
                                                    <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleDelete('gallery', item._id, item.title);
                                                    }}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-3xl border-2 border-dashed border-primary/10 bg-card/20 backdrop-blur-sm px-8 py-20 text-center text-muted-foreground">
                                    <Image className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p className="font-bold">Gallery is empty</p>
                                    <p className="text-xs">Upload images to display them in your gallery.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                    {activeTab === "certifications" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                <h2 className="text-3xl font-bold tracking-tight">Manage Certifications</h2>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Search certs..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 rounded-xl bg-card border border-primary/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
                                        />
                                    </div>
                                    <Link href="/admin/certifications/new">
                                        <button className="inline-flex items-center justify-center rounded-2xl text-sm font-bold bg-primary text-white hover:bg-primary/90 h-11 px-6 shadow-lg shadow-primary/25 transition-all active:scale-95">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Certificate
                                        </button>
                                    </Link>
                                </div>
                            </div>
                            {certs.filter((c: Certification) => c.title.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
                                <div className="grid gap-4">
                                    {certs.filter((c: Certification) => c.title.toLowerCase().includes(searchTerm.toLowerCase())).map((cert: Certification) => (
                                        <div key={cert._id} className="bg-card/40 backdrop-blur-md border border-primary/10 rounded-2xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    <Award className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold">{cert.title}</h4>
                                                    <p className="text-xs text-muted-foreground">{cert.issuer} • {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : 'No date'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link href={`/admin/certifications/${cert._id}`}>
                                                    <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleDelete('certification', cert._id, cert.title);
                                                    }}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-3xl border-2 border-dashed border-primary/10 bg-card/20 backdrop-blur-sm px-8 py-20 text-center text-muted-foreground">
                                    <Award className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p className="font-bold">No certifications</p>
                                    <p className="text-xs">Show off your achievements here.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                    {activeTab === "testimonials" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                <h2 className="text-3xl font-bold tracking-tight">Manage Testimonials</h2>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Search testimonials..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 rounded-xl bg-card border border-primary/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
                                        />
                                    </div>
                                    <Link href="/admin/testimonials/new">
                                        <button className="inline-flex items-center justify-center rounded-2xl text-sm font-bold bg-primary text-white hover:bg-primary/90 h-11 px-6 shadow-lg shadow-primary/25 transition-all active:scale-95">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Testimonial
                                        </button>
                                    </Link>
                                </div>
                            </div>
                            {testimonials.filter((t: Testimonial) => t.name.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
                                <div className="grid gap-4">
                                    {testimonials.filter((t: Testimonial) => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map((t: Testimonial) => (
                                        <div key={t._id} className="bg-card/40 backdrop-blur-md border border-primary/10 rounded-2xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {t.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold">{t.name}</h4>
                                                    <p className="text-xs text-muted-foreground">{t.role} {t.company ? `@ ${t.company}` : ''}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link href={`/admin/testimonials/${t._id}`}>
                                                    <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleDelete('testimonial', t._id, t.name);
                                                    }}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-3xl border-2 border-dashed border-primary/10 bg-card/20 backdrop-blur-sm px-8 py-20 text-center text-muted-foreground">
                                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p className="font-bold">No testimonials found</p>
                                    <p className="text-xs">Manage client feedback and reviews here.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                    {activeTab === "career" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                <h2 className="text-3xl font-bold tracking-tight">Manage Career Journey</h2>
                                <div className="flex items-center gap-4">
                                    <CareerFilter
                                        currentFilter={careerTypeFilter}
                                        onFilterChange={handleCareerFilterChange}
                                    />
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Search career entries..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 rounded-xl bg-card border border-primary/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
                                        />
                                    </div>
                                    <Link href="/admin/career/new">
                                        <button className="inline-flex items-center justify-center rounded-2xl text-sm font-bold bg-primary text-white hover:bg-primary/90 h-11 px-6 shadow-lg shadow-primary/25 transition-all active:scale-95">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Career Entry
                                        </button>
                                    </Link>
                                </div>
                            </div>
                            {careers.filter((c: CareerJourney) => {
                                const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.organization.toLowerCase().includes(searchTerm.toLowerCase());
                                const matchesType = careerTypeFilter === 'all' || c.type === careerTypeFilter;
                                return matchesSearch && matchesType;
                            }).length > 0 ? (
                                <div className="grid gap-4">
                                    {careers.filter((c: CareerJourney) => {
                                        const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.organization.toLowerCase().includes(searchTerm.toLowerCase());
                                        const matchesType = careerTypeFilter === 'all' || c.type === careerTypeFilter;
                                        return matchesSearch && matchesType;
                                    }).map((career: CareerJourney) => (
                                        <div key={career._id} className="bg-card/40 backdrop-blur-md border border-primary/10 rounded-2xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    <Briefcase className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold">{career.title}</h4>
                                                    <p className="text-xs text-muted-foreground">
                                                        {career.organization} • {career.type} • {career.current ? 'Current' : new Date(career.startDate).getFullYear()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link href={`/admin/career/${career._id}`}>
                                                    <button type="button" className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleDelete('career', career._id, career.title);
                                                    }}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-3xl border-2 border-dashed border-primary/10 bg-card/20 backdrop-blur-sm px-8 py-20 text-center text-muted-foreground">
                                    <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p className="font-bold">No career entries found</p>
                                    <p className="text-xs">Add your professional journey and achievements here.</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === "skills" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-bold tracking-tight">Manage Technical Skills</h2>
                                <Link href="/admin/skills/new">
                                    <button className="inline-flex items-center justify-center rounded-2xl text-sm font-bold bg-primary text-white hover:bg-primary/90 h-11 px-6 shadow-lg shadow-primary/25 transition-all active:scale-95">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Skill
                                    </button>
                                </Link>
                            </div>

                            {skills.length > 0 ? (
                                <div className="space-y-6">
                                    {Array.from(new Set(skills.map(s => s.category))).map((category) => {
                                        const categorySkills = skills.filter(s => s.category === category).sort((a, b) => a.order - b.order);
                                        return (
                                            <div key={category} className="rounded-3xl border border-primary/10 bg-card/20 backdrop-blur-sm p-6">
                                                <h3 className="text-lg font-bold mb-4 text-primary">{category}</h3>
                                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                                    {categorySkills.map((skill) => (
                                                        <div
                                                            key={skill._id}
                                                            className="flex items-center justify-between p-4 rounded-xl bg-card/50 border border-primary/5 hover:border-primary/20 transition-all group"
                                                        >
                                                            <div className="flex-1">
                                                                <div className="font-semibold text-sm">{skill.name}</div>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${skill.level === 'Expert' ? 'bg-emerald-500/10 text-emerald-500' :
                                                                        skill.level === 'Advanced' ? 'bg-blue-500/10 text-blue-500' :
                                                                            skill.level === 'Intermediate' ? 'bg-amber-500/10 text-amber-500' :
                                                                                'bg-slate-500/10 text-slate-500'
                                                                        }`}>
                                                                        {skill.level}
                                                                    </span>
                                                                    <span className="text-[10px] text-muted-foreground">{skill.years}y</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Link href={`/admin/skills/${skill._id}`}>
                                                                    <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                                                                        <Pencil className="h-4 w-4" />
                                                                    </button>
                                                                </Link>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleDelete('skill', skill._id, skill.name);
                                                                    }}
                                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="rounded-3xl border-2 border-dashed border-primary/10 bg-card/20 backdrop-blur-sm px-8 py-20 text-center text-muted-foreground">
                                    <Award className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p className="font-bold">No skills found</p>
                                    <p className="text-xs">Add your technical skills and expertise here.</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === "newsletter" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                <h2 className="text-3xl font-bold tracking-tight">Newsletter Subscribers</h2>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Search subscribers..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 rounded-xl bg-card border border-primary/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
                                        />
                                    </div>
                                </div>
                            </div>

                            {newsletter.filter((n: Newsletter) => n.email.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
                                <div className="grid gap-4">
                                    {newsletter.filter((n: Newsletter) => n.email.toLowerCase().includes(searchTerm.toLowerCase())).map((sub: Newsletter) => (
                                        <div key={sub._id} className="bg-card/40 backdrop-blur-md border border-primary/10 rounded-2xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    <Mail className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold">{sub.email}</h4>
                                                    <p className="text-xs text-muted-foreground">{sub.name || 'No name'} • {new Date(sub.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sub.subscribed ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {sub.subscribed ? 'Subscribed' : 'Unsubscribed'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-3xl border-2 border-dashed border-primary/10 bg-card/20 backdrop-blur-sm px-8 py-20 text-center text-muted-foreground">
                                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p className="font-bold">No subscribers yet</p>
                                    <p className="text-xs">Share your newsletter to get subscribers.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </main >
        </div >
    );
}
