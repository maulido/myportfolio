"use client";

import { useState, useEffect, useCallback } from "react";
import { 
    Activity, 
    Database, 
    Send, 
    Cloud, 
    Github, 
    Mail, 
    Cpu, 
    RefreshCw, 
    CheckCircle2, 
    AlertTriangle, 
    Server,
    Zap
} from "lucide-react";
import toast from "react-hot-toast";

interface HealthData {
    timestamp: string;
    totalLatencyMs: number;
    database: {
        status: string;
        latencyMs: number;
        readyState: number;
    };
    telegram: {
        status: string;
        latencyMs: number;
        botUsername?: string;
    };
    uploadThing: {
        status: string;
        latencyMs: number;
    };
    github: {
        status: string;
        remaining: number;
        limit: number;
        resetTime: string;
    };
    smtp: {
        configured: boolean;
        host: string;
    };
    runtime: {
        nodeVersion: string;
        platform: string;
        environment: string;
        heapUsedMb: number;
        heapTotalMb: number;
        rssMb: number;
        uptime: string;
    };
}

export default function SystemHealthWidget() {
    const [health, setHealth] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchHealth = useCallback(async (isManual = false) => {
        if (isManual) setRefreshing(true);
        try {
            const res = await fetch("/api/admin/health");
            const data = await res.json();
            if (data.success) {
                setHealth(data);
                if (isManual) toast.success("Telemetri sistem berhasil diperbarui!");
            } else {
                if (isManual) toast.error(data.error || "Gagal mengambil data kesehatan sistem");
            }
        } catch {
            if (isManual) toast.error("Koneksi ke endpoint telemetri gagal");
        } finally {
            setLoading(false);
            if (isManual) setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchHealth();
        // Poll every 60 seconds
        const interval = setInterval(() => {
            fetchHealth();
        }, 60000);
        return () => clearInterval(interval);
    }, [fetchHealth]);

    const getStatusBadge = (status: string, latency?: number) => {
        if (status === "healthy") {
            const latencyColor = (latency ?? 0) > 400 ? "text-amber-500" : "text-emerald-500";
            return (
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${latencyColor}`} />
                    <span className="text-emerald-600 dark:text-emerald-400">Normal</span>
                    {latency !== undefined && latency >= 0 && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted ${latencyColor}`}>
                            {latency}ms
                        </span>
                    )}
                </div>
            );
        }

        if (status === "disabled") {
            return (
                <span className="text-[11px] text-muted-foreground font-medium px-2 py-0.5 rounded bg-muted">
                    Nonaktif
                </span>
            );
        }

        return (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-500">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                <span className="capitalize">{status.replace("_", " ")}</span>
            </div>
        );
    };

    return (
        <div id="system-health" className="bg-card/40 backdrop-blur-md border border-border rounded-3xl p-6 shadow-sm space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shrink-0">
                        <Activity className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-foreground">Infrastructure & Server Telemetry</h3>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                                Live Monitor
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Real-time status konektivitas database, layanan eksternal, dan runtime server
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => fetchHealth(true)}
                    disabled={refreshing}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-background border border-border hover:border-primary/50 text-xs font-semibold text-foreground transition-all shadow-2xs self-start sm:self-auto cursor-pointer disabled:opacity-60"
                >
                    <RefreshCw className={`h-3.5 w-3.5 text-primary ${refreshing ? "animate-spin" : ""}`} />
                    <span>{refreshing ? "Memeriksa..." : "Segarkan"}</span>
                </button>
            </div>

            {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
                    <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                    <span>Mengukur latensi dan status telemetri...</span>
                </div>
            ) : health ? (
                <div className="space-y-4">
                    {/* Grid Services */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {/* MongoDB Card */}
                        <div className="p-4 rounded-2xl border border-border/80 bg-background/50 flex flex-col justify-between gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                                        <Database className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-bold text-foreground">MongoDB Atlas</span>
                                </div>
                                {getStatusBadge(health.database.status, health.database.latencyMs)}
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center justify-between border-t border-border/40 pt-2">
                                <span>Connection State:</span>
                                <span className="font-mono font-semibold text-foreground">
                                    {health.database.readyState === 1 ? "Connected (Pool Ready)" : "Connecting"}
                                </span>
                            </div>
                        </div>

                        {/* Telegram Bot Card */}
                        <div className="p-4 rounded-2xl border border-border/80 bg-background/50 flex flex-col justify-between gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
                                        <Send className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-bold text-foreground">Telegram Bot</span>
                                </div>
                                {getStatusBadge(health.telegram.status, health.telegram.latencyMs)}
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center justify-between border-t border-border/40 pt-2">
                                <span>Bot Identity:</span>
                                <span className="font-mono font-semibold text-foreground truncate max-w-[130px]">
                                    {health.telegram.botUsername ? `@${health.telegram.botUsername}` : "Unset"}
                                </span>
                            </div>
                        </div>

                        {/* UploadThing CDN */}
                        <div className="p-4 rounded-2xl border border-border/80 bg-background/50 flex flex-col justify-between gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                                        <Cloud className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-bold text-foreground">UploadThing CDN</span>
                                </div>
                                {getStatusBadge(health.uploadThing.status, health.uploadThing.latencyMs)}
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center justify-between border-t border-border/40 pt-2">
                                <span>Edge Storage:</span>
                                <span className="font-mono font-semibold text-foreground">Global CDN Reachable</span>
                            </div>
                        </div>

                        {/* GitHub API Card */}
                        <div className="p-4 rounded-2xl border border-border/80 bg-background/50 flex flex-col justify-between gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                                        <Github className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-bold text-foreground">GitHub API Quota</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-semibold">
                                    <span className="font-mono font-bold text-foreground">{health.github.remaining}</span>
                                    <span className="text-muted-foreground text-[10px]">/ {health.github.limit}</span>
                                </div>
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center justify-between border-t border-border/40 pt-2">
                                <span>Quota Reset:</span>
                                <span className="font-mono font-semibold text-foreground">{health.github.resetTime}</span>
                            </div>
                        </div>

                        {/* SMTP Email Service */}
                        <div className="p-4 rounded-2xl border border-border/80 bg-background/50 flex flex-col justify-between gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-bold text-foreground">SMTP Mailer</span>
                                </div>
                                {health.smtp.configured ? (
                                    <div className="flex items-center gap-1 text-xs font-semibold text-emerald-500">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span>Aktif</span>
                                    </div>
                                ) : (
                                    <span className="text-[11px] text-muted-foreground font-medium px-2 py-0.5 rounded bg-muted">
                                        Dev Simulator
                                    </span>
                                )}
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center justify-between border-t border-border/40 pt-2">
                                <span>Host:</span>
                                <span className="font-mono font-semibold text-foreground truncate max-w-[140px]">
                                    {health.smtp.host}
                                </span>
                            </div>
                        </div>

                        {/* Server Runtime Memory */}
                        <div className="p-4 rounded-2xl border border-border/80 bg-background/50 flex flex-col justify-between gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                                        <Cpu className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-bold text-foreground">Node.js Memory</span>
                                </div>
                                <span className="text-xs font-mono font-bold text-foreground">
                                    {health.runtime.heapUsedMb} MB <span className="text-[10px] text-muted-foreground font-normal">/ {health.runtime.heapTotalMb} MB</span>
                                </span>
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center justify-between border-t border-border/40 pt-2">
                                <span>Server Uptime:</span>
                                <span className="font-mono font-bold text-foreground">{health.runtime.uptime}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Runtime Meta bar */}
                    <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                                <Server className="h-3.5 w-3.5 text-primary" />
                                <strong>Node:</strong> {health.runtime.nodeVersion} ({health.runtime.platform})
                            </span>
                            <span>•</span>
                            <span><strong>Env:</strong> <span className="uppercase font-semibold">{health.runtime.environment}</span></span>
                            <span>•</span>
                            <span><strong>Process RSS:</strong> {health.runtime.rssMb} MB</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3 text-amber-500" />
                            <span>Total Telemetry Latency: <strong>{health.totalLatencyMs}ms</strong></span>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
