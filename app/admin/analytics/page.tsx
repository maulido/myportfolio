"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, Users, FileText, TrendingUp } from "lucide-react";

interface Stats {
    totalViews: number;
    uniqueVisitors: number;
    totalSessions: number;
    popularPages: { path: string; count: number }[];
}

export default function AdminAnalyticsPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30');

    useEffect(() => {
        fetchStats();
    }, [timeRange]);

    const fetchStats = async () => {
        try {
            const response = await fetch(`/api/analytics/stats?days=${timeRange}`);
            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

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
                            Track your site performance and visitor behavior
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
