"use client";

import { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, Users, FileText, TrendingUp, Bot, Briefcase, Zap, Clock, Mail, MessageSquare } from "lucide-react";

interface Stats {
    totalViews: number;
    uniqueVisitors: number;
    totalSessions: number;
    popularPages: { path: string; count: number }[];
}

interface AiInsights {
    totalQueries: number;
    totalLeads: number;
    cachedQueries: number;
    avgLatency: number;
    categoryStats: { category: string; count: number }[];
    recentLeads: { _id: string; query: string; leadContact?: string; category: string; createdAt: string }[];
    recentQueries: { _id: string; query: string; category: string; isLead: boolean; leadContact?: string; latencyMs: number; cached: boolean; createdAt: string }[];
}

export default function AdminAnalyticsPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [aiInsights, setAiInsights] = useState<AiInsights | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30');

    const fetchStats = useCallback(async () => {
        try {
            const [webRes, aiRes] = await Promise.all([
                fetch(`/api/analytics/stats?days=${timeRange}`),
                fetch(`/api/admin/analytics/ai-insights`)
            ]);

            const webData = await webRes.json();
            if (webData.success) {
                setStats(webData.data);
            }

            const aiData = await aiRes.json();
            if (aiData.success) {
                setAiInsights(aiData.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    }, [timeRange]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background/50 p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background/50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Analytics Dashboard</h1>
                        <p className="text-muted-foreground">
                            Track your site performance, visitor behavior, and AI assistant inquiries
                        </p>
                    </div>

                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="flex h-10 rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                    </select>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="border border-primary/20 rounded-xl p-6 bg-card/40 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                            <Eye className="h-8 w-8 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-bold">{stats?.totalViews || 0}</p>
                            <p className="text-sm text-muted-foreground">Total Page Views</p>
                        </div>
                    </div>

                    <div className="border border-primary/20 rounded-xl p-6 bg-card/40 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                            <Users className="h-8 w-8 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-bold">{stats?.uniqueVisitors || 0}</p>
                            <p className="text-sm text-muted-foreground">Unique Visitors</p>
                        </div>
                    </div>

                    <div className="border border-primary/20 rounded-xl p-6 bg-card/40 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                            <FileText className="h-8 w-8 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-bold">{stats?.totalSessions || 0}</p>
                            <p className="text-sm text-muted-foreground">Total Sessions</p>
                        </div>
                    </div>

                    <div className="border border-primary/20 rounded-xl p-6 bg-card/40 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                            <TrendingUp className="h-8 w-8 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-bold">
                                {stats?.totalSessions ? Math.round(stats.totalViews / stats.totalSessions * 10) / 10 : 0}
                            </p>
                            <p className="text-sm text-muted-foreground">Avg. Pages/Session</p>
                        </div>
                    </div>
                </div>

                {/* AI Assistant Intelligence Section */}
                <div className="space-y-6 pt-4">
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Bot className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">AI Assistant Intelligence</h2>
                                <p className="text-sm text-muted-foreground">
                                    Aktivitas interaksi pengunjung, prospek rekrutmen, dan performa cache AI
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* AI Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="border border-primary/20 rounded-xl p-5 bg-card/40 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-3">
                                <MessageSquare className="h-6 w-6 text-primary" />
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Interaksi</span>
                            </div>
                            <p className="text-2xl font-bold">{aiInsights?.totalQueries ?? 0}</p>
                            <p className="text-xs text-muted-foreground mt-1">Total Pertanyaan Pengunjung</p>
                        </div>

                        <div className="border border-emerald-500/20 rounded-xl p-5 bg-card/40 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-3">
                                <Briefcase className="h-6 w-6 text-emerald-500" />
                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">Hot Leads</span>
                            </div>
                            <p className="text-2xl font-bold text-emerald-500">{aiInsights?.totalLeads ?? 0}</p>
                            <p className="text-xs text-muted-foreground mt-1">Peluang Kerja / Proyek Masuk</p>
                        </div>

                        <div className="border border-amber-500/20 rounded-xl p-5 bg-card/40 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-3">
                                <Zap className="h-6 w-6 text-amber-500" />
                                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-medium">&lt;20ms</span>
                            </div>
                            <p className="text-2xl font-bold">
                                {aiInsights?.totalQueries ? Math.round(((aiInsights.cachedQueries || 0) / aiInsights.totalQueries) * 100) : 0}%
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Cache Hit Rate ({aiInsights?.cachedQueries ?? 0} terjawab instan)</p>
                        </div>

                        <div className="border border-blue-500/20 rounded-xl p-5 bg-card/40 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-3">
                                <Clock className="h-6 w-6 text-blue-500" />
                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-medium">Streaming</span>
                            </div>
                            <p className="text-2xl font-bold">{aiInsights?.avgLatency ? `${(aiInsights.avgLatency / 1000).toFixed(2)}s` : "<1s"}</p>
                            <p className="text-xs text-muted-foreground mt-1">Rata-rata Latensi Respons</p>
                        </div>
                    </div>

                    {/* AI Leads & Topics Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recruitment Leads Panel */}
                        <div className="border border-primary/20 rounded-xl p-6 bg-card/40 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-emerald-500" /> Prospek Rekrutmen & Kolaborasi
                                </h3>
                                <span className="text-xs text-muted-foreground">Deteksi Otomatis</span>
                            </div>

                            {aiInsights?.recentLeads && aiInsights.recentLeads.length > 0 ? (
                                <div className="space-y-3">
                                    {aiInsights.recentLeads.map((lead, idx) => (
                                        <div key={idx} className="p-3 rounded-lg border border-border/60 bg-background/50 space-y-1.5">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 capitalize">
                                                    {lead.category}
                                                </span>
                                                <span className="text-[11px] text-muted-foreground">
                                                    {new Date(lead.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-foreground italic">
                                                &quot;{lead.query}&quot;
                                            </p>
                                            {lead.leadContact && (
                                                <div className="flex items-center gap-1.5 text-xs text-primary font-medium mt-1">
                                                    <Mail className="h-3 w-3" />
                                                    <span>Kontak: {lead.leadContact}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-muted-foreground text-sm">
                                    Belum ada prospek rekrutmen terdeteksi. Asisten AI akan otomatis mendeteksi ketika pengunjung mengajukan tawaran kerja atau proyek.
                                </div>
                            )}
                        </div>

                        {/* Recent Inquiries & Categories */}
                        <div className="border border-primary/20 rounded-xl p-6 bg-card/40 backdrop-blur-sm flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Bot className="h-5 w-5 text-primary" /> Topik Pertanyaan Populer
                                </h3>
                                {aiInsights?.categoryStats && aiInsights.categoryStats.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {aiInsights.categoryStats.map((cat, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 text-xs rounded-full bg-muted border border-border flex items-center gap-1.5 font-medium"
                                            >
                                                <span className="capitalize">{cat.category}</span>
                                                <span className="px-1.5 py-0.2 rounded-full bg-primary/20 text-primary font-bold text-[10px]">
                                                    {cat.count}
                                                </span>
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground mb-4">Belum ada statistik kategori tercatat.</p>
                                )}

                                <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Pertanyaan Terkini</h4>
                                {aiInsights?.recentQueries && aiInsights.recentQueries.length > 0 ? (
                                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                        {aiInsights.recentQueries.slice(0, 8).map((q, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-border/40 last:border-0">
                                                <span className="truncate max-w-[70%] font-medium">{q.query}</span>
                                                <div className="flex items-center gap-1.5">
                                                    {q.cached && (
                                                        <span className="px-1.5 py-0.5 text-[9px] rounded bg-amber-500/10 text-amber-500 font-semibold">
                                                            Cache
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] text-muted-foreground tabular-nums">
                                                        {new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground">Belum ada pertanyaan masuk.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Popular Pages Chart */}
                <div className="border border-primary/20 rounded-xl p-6 bg-card/40 backdrop-blur-sm">
                    <h2 className="text-xl font-bold mb-6">Popular Pages</h2>
                    {stats?.popularPages && stats.popularPages.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.popularPages.slice(0, 10)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="path"
                                    stroke="rgba(255,255,255,0.5)"
                                    tick={{ fill: 'rgba(255,255,255,0.7)' }}
                                />
                                <YAxis
                                    stroke="rgba(255,255,255,0.5)"
                                    tick={{ fill: 'rgba(255,255,255,0.7)' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="count" fill="#667eea" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            No data available yet
                        </div>
                    )}
                </div>

                {/* Popular Pages List */}
                {stats?.popularPages && stats.popularPages.length > 0 && (
                    <div className="border border-primary/20 rounded-xl p-6 bg-card/40 backdrop-blur-sm">
                        <h2 className="text-xl font-bold mb-4">Top Pages</h2>
                        <div className="space-y-2">
                            {stats.popularPages.slice(0, 10).map((page, index) => (
                                <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                                    <span className="text-sm font-medium">{page.path}</span>
                                    <span className="text-sm text-muted-foreground">{page.count} views</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
