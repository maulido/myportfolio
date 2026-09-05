"use client";

import { useState, useEffect, useMemo } from "react";
import { 
    MailCheck, 
    Users, 
    Search, 
    Download, 
    Send, 
    Trash2, 
    CheckCircle2, 
    XCircle, 
    RefreshCw, 
    Loader2, 
    X,
    Shield
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Subscriber {
    _id: string;
    email: string;
    name?: string;
    subscribed: boolean;
    subscribedAt: string;
    unsubscribedAt?: string;
    createdAt: string;
}

export default function AdminSubscribersPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "unsubscribed">("all");

    // Modal state for broadcast composer
    const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
    const [broadcastSubject, setBroadcastSubject] = useState("");
    const [broadcastContent, setBroadcastContent] = useState("");
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    // Modal state for delete confirmation
    const [deleteTarget, setDeleteTarget] = useState<Subscriber | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const fetchSubscribers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/newsletter");
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                setSubscribers(data.data);
            } else {
                toast.error(data.error || "Failed to load subscribers.");
            }
        } catch {
            toast.error("Network error loading subscriber list.");
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (subscriber: Subscriber) => {
        const nextStatus = !subscriber.subscribed;
        try {
            const res = await fetch(`/api/newsletter/${subscriber._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subscribed: nextStatus })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setSubscribers(prev =>
                    prev.map(s => s._id === subscriber._id ? { ...s, subscribed: nextStatus } : s)
                );
                toast.success(nextStatus ? "Marked as active" : "Marked as unsubscribed");
            } else {
                toast.error(data.error || "Failed to update subscriber status");
            }
        } catch {
            toast.error("Network error while updating status");
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/newsletter/${deleteTarget._id}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setSubscribers(prev => prev.filter(s => s._id !== deleteTarget._id));
                toast.success("Subscriber permanently removed.");
                setDeleteTarget(null);
            } else {
                toast.error(data.error || "Failed to remove subscriber.");
            }
        } catch {
            toast.error("Network error while removing subscriber.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSendBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!broadcastSubject.trim() || !broadcastContent.trim()) {
            toast.error("Please provide both subject and content.");
            return;
        }

        setIsBroadcasting(true);
        try {
            const res = await fetch("/api/newsletter/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject: broadcastSubject.trim(),
                    content: broadcastContent.trim()
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(data.message || "Broadcast successfully dispatched!");
                setIsBroadcastOpen(false);
                setBroadcastSubject("");
                setBroadcastContent("");
            } else {
                toast.error(data.error || "Broadcast dispatch failed.");
            }
        } catch {
            toast.error("Network error while sending broadcast.");
        } finally {
            setIsBroadcasting(false);
        }
    };

    const handleExportCSV = () => {
        if (subscribers.length === 0) {
            toast.error("No subscribers to export.");
            return;
        }

        const headers = ["Email", "Name", "Status", "Subscribed At", "Unsubscribed At"];
        const rows = subscribers.map(s => [
            `"${s.email.replace(/"/g, '""')}"`,
            `"${(s.name || '').replace(/"/g, '""')}"`,
            s.subscribed ? "Active" : "Unsubscribed",
            `"${new Date(s.subscribedAt || s.createdAt).toISOString()}"`,
            s.unsubscribedAt ? `"${new Date(s.unsubscribedAt).toISOString()}"` : '""'
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Subscribers CSV exported successfully!");
    };

    // Filtered data
    const filteredSubscribers = useMemo(() => {
        return subscribers.filter(s => {
            const matchesSearch = s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesStatus =
                statusFilter === "all" ? true :
                statusFilter === "active" ? s.subscribed : !s.subscribed;
            return matchesSearch && matchesStatus;
        });
    }, [subscribers, searchQuery, statusFilter]);

    const activeCount = subscribers.filter(s => s.subscribed).length;
    const unsubscribedCount = subscribers.filter(s => !s.subscribed).length;
    const retentionRate = subscribers.length > 0 ? Math.round((activeCount / subscribers.length) * 100) : 100;

    return (
        <div className="space-y-6">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                        <MailCheck className="h-7 w-7 text-primary" />
                        <span>Newsletter & Subscribers</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Manage technical dispatch audience, export CSV records, and broadcast email updates.
                    </p>
                </div>
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center justify-center gap-2 px-4 h-10 rounded-xl bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold transition-all shadow-sm"
                    >
                        <Download className="h-4 w-4 text-muted-foreground" />
                        <span>Export CSV</span>
                    </button>
                    <button
                        onClick={() => setIsBroadcastOpen(true)}
                        className="inline-flex items-center justify-center gap-2 px-4 h-10 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-bold transition-all shadow-md shadow-primary/25"
                    >
                        <Send className="h-4 w-4" />
                        <span>Compose Broadcast</span>
                    </button>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-card/60 backdrop-blur-md border border-border/80 shadow-sm space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Audience</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-foreground">{subscribers.length}</p>
                    <p className="text-[11px] text-muted-foreground">All registered subscribers</p>
                </div>
                <div className="p-5 rounded-2xl bg-card/60 backdrop-blur-md border border-border/80 shadow-sm space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Recipients</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-emerald-500">{activeCount}</p>
                    <p className="text-[11px] text-muted-foreground">Eligible for broadcasts</p>
                </div>
                <div className="p-5 rounded-2xl bg-card/60 backdrop-blur-md border border-border/80 shadow-sm space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unsubscribed</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-muted-foreground">{unsubscribedCount}</p>
                    <p className="text-[11px] text-muted-foreground">Opted-out emails</p>
                </div>
                <div className="p-5 rounded-2xl bg-card/60 backdrop-blur-md border border-border/80 shadow-sm space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Retention Rate</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-primary">{retentionRate}%</p>
                    <p className="text-[11px] text-muted-foreground">Active audience ratio</p>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="p-4 rounded-2xl bg-card/70 backdrop-blur-md border border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by email address or name..."
                        className="w-full h-10 pl-10 pr-4 rounded-xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 transition-all outline-none"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <button
                        onClick={() => setStatusFilter("all")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                            statusFilter === "all"
                                ? "bg-primary text-white border-primary shadow-sm"
                                : "bg-card text-muted-foreground border-border hover:bg-muted"
                        }`}
                    >
                        All ({subscribers.length})
                    </button>
                    <button
                        onClick={() => setStatusFilter("active")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                            statusFilter === "active"
                                ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                                : "bg-card text-muted-foreground border-border hover:bg-muted"
                        }`}
                    >
                        Active ({activeCount})
                    </button>
                    <button
                        onClick={() => setStatusFilter("unsubscribed")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                            statusFilter === "unsubscribed"
                                ? "bg-muted-foreground text-white border-muted-foreground shadow-sm"
                                : "bg-card text-muted-foreground border-border hover:bg-muted"
                        }`}
                    >
                        Unsubscribed ({unsubscribedCount})
                    </button>
                    <button
                        onClick={fetchSubscribers}
                        disabled={loading}
                        className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ml-1"
                        title="Refresh list"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-primary" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Subscribers Table */}
            <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-md overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-12 text-center space-y-3">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                        <p className="text-xs text-muted-foreground">Loading subscribers database...</p>
                    </div>
                ) : filteredSubscribers.length === 0 ? (
                    <div className="p-12 text-center space-y-2">
                        <Users className="h-10 w-10 mx-auto text-muted-foreground opacity-40" />
                        <h3 className="text-base font-bold text-foreground">No subscribers found</h3>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                            {searchQuery ? "No subscriber matched your search query." : "No newsletter subscribers recorded yet."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm">
                            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase text-[11px] tracking-wider">
                                <tr>
                                    <th className="px-5 py-3.5">Subscriber</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5">Date Subscribed</th>
                                    <th className="px-5 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {filteredSubscribers.map((subscriber) => (
                                    <tr key={subscriber._id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-foreground">{subscriber.email}</div>
                                            {subscriber.name && (
                                                <div className="text-[11px] text-muted-foreground">{subscriber.name}</div>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            {subscriber.subscribed ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    <span>Active</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold border border-border">
                                                    <XCircle className="h-3.5 w-3.5" />
                                                    <span>Unsubscribed</span>
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-muted-foreground font-mono text-xs">
                                            {new Date(subscriber.subscribedAt || subscriber.createdAt).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric"
                                            })}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => toggleStatus(subscriber)}
                                                    className="px-3 py-1 rounded-lg text-xs font-semibold border border-border hover:bg-muted text-foreground transition-colors"
                                                    title={subscriber.subscribed ? "Unsubscribe user" : "Re-activate user"}
                                                >
                                                    {subscriber.subscribed ? "Unsubscribe" : "Activate"}
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(subscriber)}
                                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                    title="Permanently Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Broadcast Dispatch Modal */}
            <AnimatePresence>
                {isBroadcastOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-xl rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-5"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-border">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                        <Send className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base text-foreground">Compose Engineering Dispatch</h3>
                                        <p className="text-xs text-muted-foreground">Broadcast to {activeCount} active subscriber(s)</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsBroadcastOpen(false)}
                                    className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSendBroadcast} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">Email Subject</label>
                                    <input
                                        type="text"
                                        required
                                        value={broadcastSubject}
                                        onChange={(e) => setBroadcastSubject(e.target.value)}
                                        placeholder="e.g. Architectural Retrospective: Designing Resilient Next.js Networks"
                                        className="w-full h-11 px-3.5 rounded-xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm outline-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">Message Content (Markdown / Plaintext)</label>
                                    <textarea
                                        required
                                        rows={8}
                                        value={broadcastContent}
                                        onChange={(e) => setBroadcastContent(e.target.value)}
                                        placeholder="Write your technical briefing, project announcement, or tutorial breakdown here..."
                                        className="w-full p-3.5 rounded-xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm outline-none resize-y"
                                    />
                                </div>

                                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground space-y-1">
                                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                                        <Shield className="h-3.5 w-3.5 text-primary" />
                                        <span>Recipient Privacy Guaranteed</span>
                                    </p>
                                    <p>Recipients are batched in blind carbon copy (BCC) to protect subscriber emails.</p>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsBroadcastOpen(false)}
                                        className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted text-foreground transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isBroadcasting}
                                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-60"
                                    >
                                        {isBroadcasting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Broadcasting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4" />
                                                <span>Transmit Dispatch</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4"
                        >
                            <div className="h-12 w-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
                                <Trash2 className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-foreground">Remove Subscriber?</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Are you sure you want to permanently delete <strong className="text-foreground">{deleteTarget.email}</strong> from your newsletter list? This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setDeleteTarget(null)}
                                    className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted text-foreground"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={handleDelete}
                                    className="px-4 py-2.5 rounded-xl bg-destructive text-white text-xs font-bold hover:bg-destructive/90 transition-all shadow-md shadow-destructive/20 disabled:opacity-60"
                                >
                                    {isDeleting ? "Deleting..." : "Confirm Delete"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
