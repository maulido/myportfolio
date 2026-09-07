"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
    Bot,
    Search,
    RotateCcw,
    Briefcase,
    Mail,
    Phone,
    Send,
    Trash2,
    Archive,
    User,
    ShieldCheck,
    MessageSquare,
    Loader2,
    Sparkles
} from "lucide-react";
import toast from "react-hot-toast";

interface ConversationMessage {
    _id?: string;
    sender: "visitor" | "bot" | "admin";
    senderName: string;
    content: string;
    timestamp: string;
}

interface ConversationItem {
    _id: string;
    sessionId: string;
    visitorName: string;
    visitorContact?: string;
    isLead: boolean;
    category: string;
    status: "active" | "replied" | "archived";
    unreadByAdmin: boolean;
    lastMessage: string;
    lastMessageAt: string;
    createdAt: string;
}

interface FullConversation extends ConversationItem {
    messages: ConversationMessage[];
    ip?: string;
    userAgent?: string;
}

const CANNED_RESPONSES = [
    {
        label: "👋 Salam Pembuka",
        text: "Halo! Terima kasih telah berkunjung ke portfolio saya. Ada yang bisa saya bantu atau diskusikan lebih lanjut?"
    },
    {
        label: "💼 Minat Proyek / Lowongan",
        text: "Terima kasih atas tawarannya! Saya sangat tertarik. Boleh diceritakan lebih detail mengenai scope pekerjaan dan timeline yang diharapkan?"
    },
    {
        label: "💬 Hubungkan via WhatsApp",
        text: "Terima kasih atas pesannya! Untuk diskusi yang lebih cepat dan fleksibel, mari kita terhubung via WhatsApp di +62 812-3456-7890."
    },
    {
        label: "📄 Penawaran Kirim CV",
        text: "Halo! Resume/CV resmi beserta rincian pengalaman kerja siap saya kirimkan. Boleh minta alamat email Anda untuk saya hubungi?"
    }
];

export default function AdminAssistantChatsPage() {
    const searchParams = useSearchParams();
    const initialSessionParam = searchParams.get("session");

    const [conversations, setConversations] = useState<ConversationItem[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(initialSessionParam);
    const [activeConversation, setActiveConversation] = useState<FullConversation | null>(null);
    const [loadingList, setLoadingList] = useState(true);
    const [loadingThread, setLoadingThread] = useState(false);
    const [sendingReply, setSendingReply] = useState(false);
    const [replyText, setReplyText] = useState("");

    // Search & Filter
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [leadOnlyFilter, setLeadOnlyFilter] = useState(false);
    const [totalUnread, setTotalUnread] = useState(0);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch conversations list
    const fetchConversations = useCallback(async (selectFirst = false) => {
        try {
            setLoadingList(true);
            const params = new URLSearchParams();
            if (searchQuery) params.set("q", searchQuery);
            if (statusFilter !== "all") params.set("status", statusFilter);
            if (leadOnlyFilter) params.set("lead", "true");

            const res = await fetch(`/api/admin/assistant-chats?${params.toString()}`);
            const data = await res.json();

            if (data.success && data.data) {
                const list: ConversationItem[] = data.data.conversations || [];
                setConversations(list);
                setTotalUnread(data.data.totalUnread || 0);

                if (selectFirst && list.length > 0 && !selectedSessionId) {
                    setSelectedSessionId(list[0].sessionId);
                }
            }
        } catch (err) {
            console.error("Failed to load assistant chats:", err);
            toast.error("Gagal memuat daftar obrolan AI.");
        } finally {
            setLoadingList(false);
        }
    }, [searchQuery, statusFilter, leadOnlyFilter, selectedSessionId]);

    // Initial load
    useEffect(() => {
        fetchConversations(true);
    }, [fetchConversations]);

    // Fetch selected thread detail
    const fetchThread = useCallback(async (sessionId: string) => {
        try {
            setLoadingThread(true);
            const res = await fetch(`/api/admin/assistant-chats/${encodeURIComponent(sessionId)}`);
            const data = await res.json();

            if (data.success && data.data) {
                setActiveConversation(data.data);
                // Mark locally as read
                setConversations(prev =>
                    prev.map(c => c.sessionId === sessionId ? { ...c, unreadByAdmin: false } : c)
                );
            } else {
                toast.error(data.error || "Gagal membuka percakapan.");
            }
        } catch (err) {
            console.error("Failed to load thread:", err);
            toast.error("Gagal memuat pesan percakapan.");
        } finally {
            setLoadingThread(false);
        }
    }, []);

    useEffect(() => {
        if (selectedSessionId) {
            fetchThread(selectedSessionId);
        } else {
            setActiveConversation(null);
        }
    }, [selectedSessionId, fetchThread]);

    // Auto-scroll to bottom of messages container
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [activeConversation?.messages]);

    // Handle Send Admin Reply
    const handleSendReply = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!selectedSessionId || !replyText.trim() || sendingReply) return;

        const textToSend = replyText.trim();
        setSendingReply(true);

        try {
            const res = await fetch(`/api/admin/assistant-chats/${encodeURIComponent(selectedSessionId)}/reply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: textToSend })
            });

            const data = await res.json();

            if (data.success && data.data) {
                setActiveConversation(data.data);
                setReplyText("");
                toast.success("Balasan admin berhasil dikirim ke pengunjung!");

                // Update session in list
                setConversations(prev =>
                    prev.map(c =>
                        c.sessionId === selectedSessionId
                            ? {
                                ...c,
                                status: "replied",
                                unreadByAdmin: false,
                                lastMessage: textToSend.slice(0, 180),
                                lastMessageAt: new Date().toISOString()
                            }
                            : c
                    )
                );
            } else {
                toast.error(data.error || "Gagal mengirim balasan.");
            }
        } catch (err) {
            console.error("Reply error:", err);
            toast.error("Terjadi kesalahan jaringan saat mengirim balasan.");
        } finally {
            setSendingReply(false);
        }
    };

    // Toggle Archive Status
    const handleToggleArchive = async () => {
        if (!activeConversation) return;
        const newStatus = activeConversation.status === "archived" ? "active" : "archived";

        try {
            const res = await fetch(`/api/admin/assistant-chats/${encodeURIComponent(activeConversation.sessionId)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                setActiveConversation(prev => prev ? { ...prev, status: newStatus } : null);
                setConversations(prev =>
                    prev.map(c => c.sessionId === activeConversation.sessionId ? { ...c, status: newStatus } : c)
                );
                toast.success(newStatus === "archived" ? "Percakapan diarsipkan" : "Percakapan diaktifkan kembali");
            }
        } catch {
            toast.error("Gagal memperbarui status arsip.");
        }
    };

    // Delete Conversation
    const handleDeleteConversation = async () => {
        if (!activeConversation) return;
        if (!confirm("Apakah Anda yakin ingin menghapus riwayat percakapan ini secara permanen?")) return;

        try {
            const res = await fetch(`/api/admin/assistant-chats/${encodeURIComponent(activeConversation.sessionId)}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Percakapan berhasil dihapus.");
                setConversations(prev => prev.filter(c => c.sessionId !== activeConversation.sessionId));
                setSelectedSessionId(null);
                setActiveConversation(null);
            }
        } catch {
            toast.error("Gagal menghapus percakapan.");
        }
    };

    const formatTimeAgo = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            const now = new Date();
            const diffMs = now.getTime() - d.getTime();
            const diffMin = Math.floor(diffMs / 60000);
            if (diffMin < 1) return "Baru saja";
            if (diffMin < 60) return `${diffMin}m lalu`;
            const diffHours = Math.floor(diffMin / 60);
            if (diffHours < 24) return `${diffHours}j lalu`;
            const diffDays = Math.floor(diffHours / 24);
            if (diffDays === 1) return "Kemarin";
            if (diffDays < 7) return `${diffDays}h lalu`;
            return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
        } catch {
            return "-";
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
                        <Bot className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Live Chats & Inquiries</h1>
                            {totalUnread > 0 && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary text-white animate-pulse">
                                    {totalUnread} Belum Dibaca
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Pantau riwayat percakapan pengunjung dengan AI Assistant dan balas pesan langsung secara real-time
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => fetchConversations()}
                        disabled={loadingList}
                        className="px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                        title="Segarkan daftar obrolan"
                    >
                        <RotateCcw className={`h-3.5 w-3.5 ${loadingList ? "animate-spin" : ""}`} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Main Chat Workstation (2 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
                {/* Left Column: Conversation Sessions List */}
                <div className="lg:col-span-4 xl:col-span-4 bg-card/40 backdrop-blur-md border border-border rounded-2xl flex flex-col overflow-hidden shadow-sm">
                    {/* Search & Filter Header */}
                    <div className="p-3.5 border-b border-border/80 space-y-3 bg-card/60">
                        <div className="relative">
                            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nama, pesan, email..."
                                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-xs">
                            <button
                                type="button"
                                onClick={() => { setStatusFilter("all"); setLeadOnlyFilter(false); }}
                                className={`px-2.5 py-1 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                                    statusFilter === "all" && !leadOnlyFilter
                                        ? "bg-primary text-white shadow-2xs"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                            >
                                Semua
                            </button>
                            <button
                                type="button"
                                onClick={() => { setLeadOnlyFilter(true); setStatusFilter("all"); }}
                                className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                                    leadOnlyFilter
                                        ? "bg-emerald-500 text-white shadow-2xs"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                            >
                                <Briefcase className="h-3 w-3" /> Leads
                            </button>
                            <button
                                type="button"
                                onClick={() => { setStatusFilter("active"); setLeadOnlyFilter(false); }}
                                className={`px-2.5 py-1 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                                    statusFilter === "active" && !leadOnlyFilter
                                        ? "bg-primary text-white shadow-2xs"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                            >
                                Belum Dibalas
                            </button>
                            <button
                                type="button"
                                onClick={() => { setStatusFilter("archived"); setLeadOnlyFilter(false); }}
                                className={`px-2.5 py-1 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                                    statusFilter === "archived"
                                        ? "bg-primary text-white shadow-2xs"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                            >
                                Arsip
                            </button>
                        </div>
                    </div>

                    {/* Sessions List Items */}
                    <div className="flex-1 overflow-y-auto divide-y divide-border/40 p-2 space-y-1">
                        {loadingList ? (
                            <div className="h-full flex items-center justify-center py-20 text-muted-foreground gap-2 text-xs">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                <span>Memuat obrolan...</span>
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center py-20 text-center text-muted-foreground px-4">
                                <MessageSquare className="h-8 w-8 text-muted-foreground/40 mb-2" />
                                <p className="text-xs font-semibold text-foreground">Tidak Ada Percakapan</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    Belum ada pengunjung yang cocok dengan kriteria filter saat ini.
                                </p>
                            </div>
                        ) : (
                            conversations.map((item) => {
                                const isSelected = selectedSessionId === item.sessionId;
                                return (
                                    <div
                                        key={item.sessionId}
                                        onClick={() => setSelectedSessionId(item.sessionId)}
                                        className={`p-3 rounded-xl cursor-pointer transition-all ${
                                            isSelected
                                                ? "bg-primary/15 border border-primary/30 shadow-xs"
                                                : "hover:bg-muted/60 border border-transparent"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <div className="h-7 w-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                                    {item.visitorName ? item.visitorName.charAt(0).toUpperCase() : "P"}
                                                </div>
                                                <div className="truncate">
                                                    <span className="text-xs font-bold text-foreground block truncate">
                                                        {item.visitorName || "Pengunjung"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                {item.unreadByAdmin && (
                                                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                                )}
                                                <span className="text-[10px] text-muted-foreground font-mono">
                                                    {formatTimeAgo(item.lastMessageAt || item.createdAt)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Snippet */}
                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed pl-8">
                                            {item.lastMessage || "(Tidak ada isi pesan)"}
                                        </p>

                                        {/* Badges */}
                                        <div className="flex items-center gap-1.5 mt-2 pl-8 flex-wrap">
                                            {item.isLead && (
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                                    <Briefcase className="h-2.5 w-2.5" /> Lead
                                                </span>
                                            )}
                                            {item.status === "replied" && (
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                                    Dibalas
                                                </span>
                                            )}
                                            {item.status === "archived" && (
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-muted text-muted-foreground border border-border">
                                                    Arsip
                                                </span>
                                            )}
                                            {item.visitorContact && (
                                                <span className="text-[10px] text-primary truncate max-w-[140px]">
                                                    ✉️ {item.visitorContact}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right Column: Chat Thread Viewer & Live Reply */}
                <div className="lg:col-span-8 xl:col-span-8 bg-card/40 backdrop-blur-md border border-border rounded-2xl flex flex-col overflow-hidden shadow-sm">
                    {loadingThread ? (
                        <div className="h-full flex items-center justify-center text-muted-foreground gap-2 text-xs">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            <span>Memuat isi obrolan...</span>
                        </div>
                    ) : !activeConversation ? (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                            <div className="p-4 rounded-3xl bg-primary/5 text-primary mb-3 border border-primary/10">
                                <MessageSquare className="h-10 w-10 opacity-70" />
                            </div>
                            <h3 className="text-base font-bold text-foreground">Pilih Obrolan Pengunjung</h3>
                            <p className="text-xs text-muted-foreground max-w-sm mt-1">
                                Pilih salah satu sesi percakapan di sebelah kiri untuk meninjau seluruh dialog antara pengunjung dan AI Assistant, serta mengirimkan balasan langsung.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Thread Header */}
                            <div className="p-4 border-b border-border bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-sm font-bold text-foreground">
                                            {activeConversation.visitorName || "Pengunjung Web"}
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted border border-border capitalize">
                                            {activeConversation.category || "General"}
                                        </span>
                                        {activeConversation.isLead && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                                <Briefcase className="h-3 w-3" /> Prospek Rekrutmen / Proyek
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
                                        <span>Session: {activeConversation.sessionId}</span>
                                        {activeConversation.ip && <span>IP: {activeConversation.ip}</span>}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                    <button
                                        type="button"
                                        onClick={handleToggleArchive}
                                        className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                                        title={activeConversation.status === "archived" ? "Aktifkan kembali" : "Arsipkan percakapan"}
                                    >
                                        <Archive className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDeleteConversation}
                                        className="p-2 rounded-xl border border-border hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all"
                                        title="Hapus percakapan"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Lead Contact Info Card (If present) */}
                            {activeConversation.visitorContact && (
                                <div className="px-4 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                                            Kontak Pengunjung Terdeteksi:
                                        </span>
                                        <span className="font-mono font-bold text-foreground">
                                            {activeConversation.visitorContact}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {activeConversation.visitorContact.includes("@") && (
                                            <a
                                                href={`mailto:${activeConversation.visitorContact}`}
                                                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1"
                                            >
                                                <Mail className="h-3 w-3" /> Kirim Email
                                            </a>
                                        )}
                                        {/[0-9]{8,}/.test(activeConversation.visitorContact) && (
                                            <a
                                                href={`https://wa.me/${activeConversation.visitorContact.replace(/[^0-9]/g, "")}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1"
                                            >
                                                <Phone className="h-3 w-3" /> WhatsApp
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Message Stream Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
                                {activeConversation.messages && activeConversation.messages.length > 0 ? (
                                    activeConversation.messages.map((msg, idx) => {
                                        const isVisitor = msg.sender === "visitor";
                                        const isAdmin = msg.sender === "admin";
                                        const isBot = msg.sender === "bot";

                                        return (
                                            <div
                                                key={idx}
                                                className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                                            >
                                                <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm shadow-xs ${
                                                    isAdmin
                                                        ? "bg-primary text-white rounded-tr-none"
                                                        : isBot
                                                            ? "bg-card border border-border rounded-tl-none text-foreground"
                                                            : "bg-muted border border-border/80 rounded-tl-none text-foreground"
                                                }`}>
                                                    {/* Bubble Header */}
                                                    <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-white/10 dark:border-border/40 text-[10px]">
                                                        <div className="flex items-center gap-1 font-bold">
                                                            {isAdmin && (
                                                                <>
                                                                    <ShieldCheck className="h-3.5 w-3.5 text-white" />
                                                                    <span>{msg.senderName || "Maulido (Admin)"}</span>
                                                                </>
                                                            )}
                                                            {isBot && (
                                                                <>
                                                                    <Bot className="h-3.5 w-3.5 text-primary" />
                                                                    <span className="text-primary font-bold">AI Assistant</span>
                                                                </>
                                                            )}
                                                            {isVisitor && (
                                                                <>
                                                                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                                                                    <span className="text-muted-foreground">Pengunjung Web</span>
                                                                </>
                                                            )}
                                                        </div>
                                                        <span className={isAdmin ? "text-white/80" : "text-muted-foreground"}>
                                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                        </span>
                                                    </div>

                                                    {/* Bubble Content */}
                                                    <p className="whitespace-pre-wrap leading-relaxed">
                                                        {msg.content}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-20 text-muted-foreground text-xs">
                                        Tidak ada pesan tercatat pada sesi ini.
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Canned Responses Chips */}
                            <div className="px-4 py-2 border-t border-border/60 bg-card/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                                <span className="text-[10px] text-muted-foreground font-semibold shrink-0 mr-1">
                                    Template Cepat:
                                </span>
                                {CANNED_RESPONSES.map((tmpl, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setReplyText(tmpl.text)}
                                        className="whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-medium bg-muted hover:bg-muted/80 text-foreground border border-border transition-all cursor-pointer"
                                    >
                                        {tmpl.label}
                                    </button>
                                ))}
                            </div>

                            {/* Reply Input Form */}
                            <form onSubmit={handleSendReply} className="p-3 bg-card border-t border-border space-y-2">
                                <div className="relative">
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                                                e.preventDefault();
                                                handleSendReply();
                                            }
                                        }}
                                        placeholder="Ketik balasan Anda sebagai Maulido (Admin)... (Tekan Ctrl+Enter untuk kirim)"
                                        rows={2}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-xs leading-relaxed resize-none"
                                        disabled={sendingReply}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-muted-foreground">
                                        💡 Pengunjung akan langsung melihat balasan ini di widget chat mereka dengan lencana <b>Verified Admin</b>.
                                    </span>
                                    <button
                                        type="submit"
                                        disabled={sendingReply || !replyText.trim()}
                                        className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 active:scale-95 transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 disabled:scale-100 cursor-pointer"
                                    >
                                        {sendingReply ? (
                                            <>
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                <span>Mengirim...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-3.5 w-3.5" />
                                                <span>Kirim Balasan sebagai Admin</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
