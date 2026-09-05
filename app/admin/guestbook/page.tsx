"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Check,
    AlertTriangle,
    Trash2,
    Pin,
    CornerDownRight,
    Search,
    X,
    ExternalLink,
    RefreshCw,
    ShieldAlert,
    CheckCircle2,
    Clock,
    Heart,
    Undo2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface GuestbookEntry {
    _id: string;
    name: string;
    email?: string;
    website?: string;
    message: string;
    approved: boolean;
    spam: boolean;
    pinned?: boolean;
    likes?: number;
    adminReply?: string;
    adminRepliedAt?: string;
    ipAddress?: string;
    createdAt: string;
}

interface Counts {
    pending: number;
    approved: number;
    spam: number;
}

export default function AdminGuestbookPage() {
    const [entries, setEntries] = useState<GuestbookEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"pending" | "approved" | "spam">("pending");
    const [searchQuery, setSearchQuery] = useState("");
    const [counts, setCounts] = useState<Counts>({ pending: 0, approved: 0, spam: 0 });

    // Reply Modal state
    const [replyingEntry, setReplyingEntry] = useState<GuestbookEntry | null>(null);
    const [replyText, setReplyText] = useState("");
    const [isSavingReply, setIsSavingReply] = useState(false);

    // Delete Modal state
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchEntries = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                admin: "true",
                status: activeTab,
                limit: "50",
            });
            if (searchQuery.trim()) {
                params.set("search", searchQuery.trim());
            }

            const response = await fetch(`/api/guestbook?${params.toString()}`);
            const data = await response.json();
            if (data.success) {
                setEntries(data.data || []);
                if (data.counts) {
                    setCounts(data.counts);
                }
            } else {
                toast.error(data.error || "Failed to load guestbook entries");
            }
        } catch (error) {
            console.error("Error fetching guestbook entries:", error);
            toast.error("Network error while fetching entries");
        } finally {
            setLoading(false);
        }
    }, [activeTab, searchQuery]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchEntries();
        }, 200);
        return () => clearTimeout(timer);
    }, [fetchEntries]);

    const handleUpdateStatus = async (id: string, updates: Partial<GuestbookEntry>, successMsg: string) => {
        try {
            const response = await fetch(`/api/guestbook/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            const data = await response.json();
            if (response.ok) {
                toast.success(successMsg);
                fetchEntries();
            } else {
                toast.error(data.error || "Failed to update entry");
            }
        } catch (error) {
            console.error("Error updating entry:", error);
            toast.error("Network error occurred");
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingId) return;
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/guestbook/${deletingId}`, {
                method: "DELETE",
            });
            if (response.ok) {
                toast.success("Signature deleted successfully");
                setDeletingId(null);
                fetchEntries();
            } else {
                toast.error("Failed to delete entry");
            }
        } catch (error) {
            console.error("Error deleting entry:", error);
            toast.error("Network error occurred");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSaveReply = async () => {
        if (!replyingEntry) return;
        setIsSavingReply(true);
        try {
            const response = await fetch(`/api/guestbook/${replyingEntry._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminReply: replyText.trim() }),
            });
            if (response.ok) {
                toast.success("Owner reply saved!");
                setReplyingEntry(null);
                setReplyText("");
                fetchEntries();
            } else {
                toast.error("Failed to save reply");
            }
        } catch (error) {
            console.error("Error saving reply:", error);
            toast.error("Network error occurred");
        } finally {
            setIsSavingReply(false);
        }
    };

    const openReplyModal = (entry: GuestbookEntry) => {
        setReplyingEntry(entry);
        setReplyText(entry.adminReply || "");
    };

    return (
        <div className="space-y-8">
            {/* Header & Metrics */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/70 dark:border-primary/20">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Guestbook Moderation</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Review, pin, reply, and moderate visitor signatures and wall notes.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={fetchEntries}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-card/60 hover:bg-muted/70 text-xs font-semibold transition-all shadow-2xs"
                        title="Refresh List"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                    <a
                        href="/guestbook"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs"
                    >
                        <span>View Public Wall</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                    onClick={() => setActiveTab("pending")}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        activeTab === "pending"
                            ? "bg-amber-500/10 border-amber-500/40 shadow-sm"
                            : "bg-card/60 dark:bg-white/[0.02] border-border/80 hover:border-amber-500/30"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">Pending Approval</span>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-bold text-amber-500 mt-2">{counts.pending}</div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Awaiting moderation review</p>
                </div>

                <div
                    onClick={() => setActiveTab("approved")}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        activeTab === "approved"
                            ? "bg-emerald-500/10 border-emerald-500/40 shadow-sm"
                            : "bg-card/60 dark:bg-white/[0.02] border-border/80 hover:border-emerald-500/30"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">Live Approved</span>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold text-emerald-500 mt-2">{counts.approved}</div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Published on public wall</p>
                </div>

                <div
                    onClick={() => setActiveTab("spam")}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        activeTab === "spam"
                            ? "bg-rose-500/10 border-rose-500/40 shadow-sm"
                            : "bg-card/60 dark:bg-white/[0.02] border-border/80 hover:border-rose-500/30"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">Spam & Flagged</span>
                        <ShieldAlert className="h-4 w-4 text-rose-500" />
                    </div>
                    <div className="text-2xl font-bold text-rose-500 mt-2">{counts.spam}</div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Automated spam filter quarantine</p>
                </div>
            </div>

            {/* Filter Tabs & Search Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Tabs */}
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/40 dark:bg-white/[0.03] border border-border/70 dark:border-white/10 w-full sm:w-auto">
                    <button
                        onClick={() => setActiveTab("pending")}
                        className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            activeTab === "pending"
                                ? "bg-amber-500 text-white shadow-xs"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Pending ({counts.pending})
                    </button>
                    <button
                        onClick={() => setActiveTab("approved")}
                        className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            activeTab === "approved"
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Approved ({counts.approved})
                    </button>
                    <button
                        onClick={() => setActiveTab("spam")}
                        className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            activeTab === "spam"
                                ? "bg-rose-600 text-white shadow-xs"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Spam ({counts.spam})
                    </button>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search signatures, names, emails..."
                        className="w-full h-9 pl-9 pr-8 rounded-xl border border-border/80 dark:border-white/10 bg-card/60 dark:bg-white/[0.03] text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </div>
            </div>

            {/* Content List */}
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <span className="text-xs text-muted-foreground">Loading guestbook moderation records...</span>
                </div>
            ) : entries.length === 0 ? (
                <div className="text-center py-16 rounded-2xl border border-dashed border-border/80 dark:border-white/10 p-8">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-foreground">All caught up in this view!</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                        {activeTab === "pending"
                            ? "There are no pending signatures requiring moderation."
                            : activeTab === "approved"
                            ? "No approved signatures found. Approve pending entries to show them on the wall."
                            : "No spam or quarantined entries."}
                    </p>
                </div>
            ) : (
                <div className="space-y-3.5">
                    <AnimatePresence>
                        {entries.map((entry) => (
                            <motion.div
                                key={entry._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className={`rounded-2xl border p-5 transition-all bg-card/80 dark:bg-white/[0.02] ${
                                    entry.pinned
                                        ? "border-amber-500/40 bg-amber-500/[0.02]"
                                        : "border-border/80 dark:border-white/10"
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    {/* Author & Meta */}
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-sm text-foreground">{entry.name}</span>

                                            {entry.pinned && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                                    <Pin className="h-3 w-3" />
                                                    <span>Pinned</span>
                                                </span>
                                            )}

                                            {entry.likes ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                                    <Heart className="h-3 w-3 fill-rose-500" />
                                                    <span>{entry.likes}</span>
                                                </span>
                                            ) : null}

                                            {entry.website && (
                                                <a
                                                    href={entry.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                                                >
                                                    <span>{entry.website.replace(/^https?:\/\//, '')}</span>
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                            {entry.email && <span>{entry.email}</span>}
                                            {entry.ipAddress && <span className="font-mono text-[10px]">IP: {entry.ipAddress}</span>}
                                            <span>{new Date(entry.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                                        {/* If Pending: Approve, Spam, Delete */}
                                        {activeTab === "pending" && (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateStatus(entry._id, { approved: true, spam: false }, "Signature approved!")}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs"
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                    <span>Approve</span>
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(entry._id, { approved: false, spam: true }, "Marked as spam")}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-all shadow-xs"
                                                >
                                                    <AlertTriangle className="h-3.5 w-3.5" />
                                                    <span>Spam</span>
                                                </button>
                                            </>
                                        )}

                                        {/* If Approved: Pin/Unpin, Reply, Revoke, Delete */}
                                        {activeTab === "approved" && (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateStatus(entry._id, { pinned: !entry.pinned }, entry.pinned ? "Unpinned signature" : "Pinned to top of wall!")}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                                        entry.pinned
                                                            ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40"
                                                            : "border-border/80 hover:bg-muted/70 text-muted-foreground hover:text-foreground"
                                                    }`}
                                                    title={entry.pinned ? "Unpin signature" : "Pin to top of public wall"}
                                                >
                                                    <Pin className="h-3.5 w-3.5" />
                                                    <span>{entry.pinned ? "Unpin" : "Pin"}</span>
                                                </button>

                                                <button
                                                    onClick={() => openReplyModal(entry)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-border/80 hover:bg-muted/70 text-xs font-semibold text-foreground transition-all"
                                                >
                                                    <CornerDownRight className="h-3.5 w-3.5 text-primary" />
                                                    <span>{entry.adminReply ? "Edit Reply" : "Reply"}</span>
                                                </button>

                                                <button
                                                    onClick={() => handleUpdateStatus(entry._id, { approved: false }, "Revoked approval")}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-border/80 hover:bg-muted/70 text-xs font-semibold text-muted-foreground transition-all"
                                                    title="Move back to pending review"
                                                >
                                                    <Undo2 className="h-3.5 w-3.5" />
                                                    <span>Revoke</span>
                                                </button>
                                            </>
                                        )}

                                        {/* If Spam: Restore */}
                                        {activeTab === "spam" && (
                                            <button
                                                onClick={() => handleUpdateStatus(entry._id, { approved: false, spam: false }, "Restored to pending")}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs"
                                            >
                                                <Undo2 className="h-3.5 w-3.5" />
                                                <span>Restore</span>
                                            </button>
                                        )}

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => setDeletingId(entry._id)}
                                            className="p-1.5 rounded-xl border border-border/80 hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground transition-all"
                                            title="Delete permanently"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Message text */}
                                <div className="mt-3 pt-3 border-t border-border/60 dark:border-white/5">
                                    <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                        {entry.message}
                                    </p>
                                </div>

                                {/* Existing Admin Reply */}
                                {entry.adminReply && (
                                    <div className="mt-3 p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-2.5">
                                        <CornerDownRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                        <div className="text-xs space-y-0.5">
                                            <div className="font-bold text-primary">Your Official Reply:</div>
                                            <p className="text-foreground/90">{entry.adminReply}</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Owner Reply Modal */}
            <AnimatePresence>
                {replyingEntry && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-lg rounded-3xl bg-card border border-border/80 dark:border-primary/20 shadow-2xl p-6 space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold">Write Owner Reply</h3>
                                <button
                                    onClick={() => setReplyingEntry(null)}
                                    className="p-1 rounded-full text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-3 rounded-xl bg-muted/40 text-xs text-muted-foreground border border-border/60">
                                <span className="font-semibold text-foreground">Replying to {replyingEntry.name}:</span>
                                <p className="mt-1 italic line-clamp-2">&ldquo;{replyingEntry.message}&rdquo;</p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold">Your Official Response</label>
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    rows={4}
                                    placeholder="Write a warm note of appreciation or technical reply..."
                                    className="w-full p-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    onClick={() => setReplyingEntry(null)}
                                    className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveReply}
                                    disabled={isSavingReply}
                                    className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs"
                                >
                                    {isSavingReply ? "Saving..." : "Publish Reply"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Custom Delete Confirmation Modal */}
            <AnimatePresence>
                {deletingId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-sm rounded-3xl bg-card border border-border/80 shadow-2xl p-6 text-center space-y-4"
                        >
                            <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                                <Trash2 className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Delete Signature?</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    This action will permanently delete this guestbook signature from the database.
                                </p>
                            </div>

                            <div className="flex items-center justify-center gap-2 pt-2">
                                <button
                                    onClick={() => setDeletingId(null)}
                                    className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    disabled={isDeleting}
                                    className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-all shadow-xs"
                                >
                                    {isDeleting ? "Deleting..." : "Yes, Delete"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
