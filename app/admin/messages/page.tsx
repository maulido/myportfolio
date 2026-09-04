"use client";

import { useState, useEffect } from "react";
import { 
    Mail, 
    MailOpen, 
    Trash2, 
    Search, 
    Reply, 
    Clock, 
    RefreshCw,
    Inbox,
    X
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface ContactMessage {
    _id: string;
    name: string;
    email: string;
    message: string;
    read: boolean;
    ip?: string;
    createdAt: string;
}

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "read">("all");
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/contact");
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                setMessages(data.data);
            } else {
                toast.error(data.error || "Failed to load messages");
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast.error("Network error while loading messages");
        } finally {
            setLoading(false);
        }
    };

    const toggleReadStatus = async (id: string, currentStatus: boolean, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        try {
            const res = await fetch(`/api/contact/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ read: !currentStatus })
            });
            const data = await res.json();
            if (data.success) {
                setMessages(prev => prev.map(m => m._id === id ? { ...m, read: !currentStatus } : m));
                if (selectedMessage && selectedMessage._id === id) {
                    setSelectedMessage(prev => prev ? { ...prev, read: !currentStatus } : null);
                }
                toast.success(!currentStatus ? "Marked as read" : "Marked as unread");
            }
        } catch {
            toast.error("Failed to update message status");
        }
    };

    const deleteMessage = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!confirm("Are you sure you want to permanently delete this message?")) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/contact/${id}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (data.success) {
                setMessages(prev => prev.filter(m => m._id !== id));
                if (selectedMessage?._id === id) {
                    setSelectedMessage(null);
                }
                toast.success("Message deleted successfully");
            } else {
                toast.error(data.error || "Failed to delete message");
            }
        } catch {
            toast.error("Failed to delete message");
        } finally {
            setDeletingId(null);
        }
    };

    const openMessageDetails = (msg: ContactMessage) => {
        setSelectedMessage(msg);
        if (!msg.read) {
            // Automatically mark as read
            fetch(`/api/contact/${msg._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ read: true })
            }).then(res => res.json()).then(data => {
                if (data.success) {
                    setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, read: true } : m));
                    setSelectedMessage(prev => prev ? { ...prev, read: true } : null);
                }
            }).catch(console.error);
        }
    };

    const unreadCount = messages.filter(m => !m.read).length;

    const filteredMessages = messages.filter(msg => {
        const matchesSearch = 
            msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            msg.message.toLowerCase().includes(searchQuery.toLowerCase());

        if (filterStatus === "unread") return matchesSearch && !msg.read;
        if (filterStatus === "read") return matchesSearch && msg.read;
        return matchesSearch;
    });

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <Inbox className="h-7 w-7 text-primary" />
                        Client Inquiries
                        {unreadCount > 0 && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-white">
                                {unreadCount} new
                            </span>
                        )}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Review, respond to, and manage contact inquiries submitted through your website.
                    </p>
                </div>
                <button
                    onClick={fetchMessages}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card/80 hover:bg-muted text-foreground text-xs font-semibold transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or message..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-xl border border-border bg-card/50 text-xs font-medium self-start sm:self-auto">
                    <button
                        onClick={() => setFilterStatus("all")}
                        className={`px-3 py-1.5 rounded-lg transition-colors ${filterStatus === "all" ? "bg-primary text-white font-bold shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        All ({messages.length})
                    </button>
                    <button
                        onClick={() => setFilterStatus("unread")}
                        className={`px-3 py-1.5 rounded-lg transition-colors ${filterStatus === "unread" ? "bg-primary text-white font-bold shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Unread ({unreadCount})
                    </button>
                    <button
                        onClick={() => setFilterStatus("read")}
                        className={`px-3 py-1.5 rounded-lg transition-colors ${filterStatus === "read" ? "bg-primary text-white font-bold shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Read ({messages.length - unreadCount})
                    </button>
                </div>
            </div>

            {/* Message List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="p-4 rounded-xl border border-border/70 bg-card/40 space-y-2">
                            <div className="h-4 w-1/4 bg-muted/60 animate-pulse rounded" />
                            <div className="h-4 w-3/4 bg-muted/60 animate-pulse rounded" />
                        </div>
                    ))}
                </div>
            ) : filteredMessages.length === 0 ? (
                <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-border/80 bg-card/20">
                    <Inbox className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-foreground">No inquiries found</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                        {searchQuery ? "No messages match your search criteria." : "You currently have no incoming messages from the contact form."}
                    </p>
                </div>
            ) : (
                <div className="space-y-2.5">
                    {filteredMessages.map((msg) => (
                        <div
                            key={msg._id}
                            onClick={() => openMessageDetails(msg)}
                            className={`group relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                                !msg.read 
                                    ? "bg-card border-primary/40 shadow-sm hover:border-primary/70" 
                                    : "bg-card/40 border-border/70 hover:bg-card/70 hover:border-border"
                            }`}
                        >
                            <div className="flex items-start gap-3.5 min-w-0">
                                <div className="mt-1">
                                    {!msg.read ? (
                                        <span className="flex h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary/20" title="Unread" />
                                    ) : (
                                        <span className="flex h-2.5 w-2.5 rounded-full bg-muted-foreground/40" title="Read" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`text-sm ${!msg.read ? "font-bold text-foreground" : "font-medium text-foreground/80"}`}>
                                            {msg.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            &lt;{msg.email}&gt;
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                        {msg.message}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                <span className="text-[11px] text-muted-foreground flex items-center gap-1 mr-2">
                                    <Clock className="h-3 w-3" />
                                    {new Date(msg.createdAt).toLocaleDateString()}
                                </span>
                                
                                <button
                                    onClick={(e) => toggleReadStatus(msg._id, msg.read, e)}
                                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                    title={msg.read ? "Mark as unread" : "Mark as read"}
                                >
                                    {msg.read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4 text-primary" />}
                                </button>
                                <a
                                    href={`mailto:${msg.email}?subject=Re: Portfolio Contact Inquiry`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                                    title="Reply via Email"
                                >
                                    <Reply className="h-4 w-4" />
                                </a>
                                <button
                                    onClick={(e) => deleteMessage(msg._id, e)}
                                    disabled={deletingId === msg._id}
                                    className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Message Details Modal */}
            <AnimatePresence>
                {selectedMessage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="w-full max-w-2xl bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="flex items-start justify-between gap-4 border-b border-border/80 pb-5">
                                <div>
                                    <div className="flex items-center gap-2.5">
                                        <h2 className="text-xl font-bold text-foreground">
                                            {selectedMessage.name}
                                        </h2>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                                            Inquiry
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1.5">
                                        <a href={`mailto:${selectedMessage.email}`} className="text-primary hover:underline">
                                            {selectedMessage.email}
                                        </a>
                                        <span>•</span>
                                        <span>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                                        {selectedMessage.ip && (
                                            <>
                                                <span>•</span>
                                                <span className="font-mono text-[11px] text-muted-foreground/80">IP: {selectedMessage.ip}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedMessage(null)}
                                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Message Body */}
                            <div className="flex-1 overflow-y-auto pr-1">
                                <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                    {selectedMessage.message}
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/80">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleReadStatus(selectedMessage._id, selectedMessage.read)}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                    >
                                        {selectedMessage.read ? <Mail className="h-3.5 w-3.5" /> : <MailOpen className="h-3.5 w-3.5 text-primary" />}
                                        {selectedMessage.read ? "Mark Unread" : "Mark Read"}
                                    </button>
                                    <button
                                        onClick={() => deleteMessage(selectedMessage._id)}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-500/20 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Delete
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setSelectedMessage(null)}
                                        className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                                    >
                                        Close
                                    </button>
                                    <a
                                        href={`mailto:${selectedMessage.email}?subject=Re: Portfolio Contact Inquiry`}
                                        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                                    >
                                        <Reply className="h-3.5 w-3.5" />
                                        Reply via Email
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
