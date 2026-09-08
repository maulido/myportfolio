"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Send,
    Bot,
    Loader2,
    Copy,
    Check,
    Sparkles,
    MessageCircle,
    FileText,
    ArrowRight,
    RotateCcw,
    ShieldCheck,
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    Terminal,
    Target
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import MermaidRenderer from "@/components/chat/MermaidRenderer";
import CliTerminal from "@/components/chat/CliTerminal";

interface ChatMessage {
    id?: string;
    role: "user" | "bot" | "admin";
    senderName?: string;
    content: string;
    timestamp?: string;
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback ignore
        }
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            title={copied ? "Tersalin!" : "Salin pesan"}
            aria-label="Salin teks pesan"
        >
            {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
        </button>
    );
}

function SpeakButton({ text }: { text: string }) {
    const [isSpeaking, setIsSpeaking] = useState(false);

    const handleSpeak = () => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) {
            toast.error("Browser Anda belum mendukung text-to-speech.");
            return;
        }

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        window.speechSynthesis.cancel();
        // Clean markdown and symbols for natural sound
        const cleanText = text
            .replace(/```[\s\S]*?```/g, "")
            .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
            .replace(/\[SUGGESTIONS:[\s\S]*?\]/gi, "")
            .replace(/[*_#`~>]/g, "")
            .trim();

        if (!cleanText) return;

        const utterance = new SpeechSynthesisUtterance(cleanText);
        // Detect English vs Indonesian
        const isEnglish = /^[A-Za-z0-9\s.,!?'"-]+$/.test(cleanText.slice(0, 80));
        utterance.lang = isEnglish ? "en-US" : "id-ID";
        utterance.rate = 1.05;

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
    };

    return (
        <button
            type="button"
            onClick={handleSpeak}
            className={`p-1 rounded transition-colors ${
                isSpeaking
                    ? "text-primary bg-primary/10 animate-pulse"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
            title={isSpeaking ? "Hentikan suara" : "Dengarkan pesan"}
            aria-label="Bacakan pesan suara"
        >
            {isSpeaking ? <VolumeX className="h-3 w-3 text-rose-500" /> : <Volume2 className="h-3 w-3" />}
        </button>
    );
}

function ContextualActions({
    content,
    onCloseChat,
    waNumber = "6281234567890"
}: {
    content: string;
    onCloseChat: () => void;
    waNumber?: string;
}) {
    const lower = content.toLowerCase();
    const hasCV = lower.includes("cv") || lower.includes("resume") || lower.includes("curriculum vitae");
    const hasContact = lower.includes("whatsapp") || lower.includes("kontak") || lower.includes("contact") || lower.includes("hubungi") || lower.includes("wa.me");
    const hasProjects = lower.includes("proyek") || lower.includes("project") || lower.includes("portfolio");
    const hasCert = lower.includes("sertifikasi") || lower.includes("sertifikat") || lower.includes("certification");

    if (!hasCV && !hasContact && !hasProjects && !hasCert) {
        return null;
    }

    return (
        <div className="mt-2.5 pt-2 border-t border-border/50 flex flex-wrap gap-1.5">
            {hasCV && (
                <a
                    href="/assets/resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors border border-primary/20"
                >
                    <FileText className="h-3 w-3" /> Unduh CV Resmi
                </a>
            )}
            {hasContact && (
                <>
                    <a
                        href={`https://wa.me/${waNumber || "6281234567890"}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium transition-colors border border-emerald-500/20"
                    >
                        <MessageCircle className="h-3 w-3" /> WhatsApp
                    </a>
                    <Link
                        href="/contact"
                        onClick={onCloseChat}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors border border-border"
                    >
                        ✉️ Form Kontak
                    </Link>
                </>
            )}
            {hasProjects && !hasCV && (
                <Link
                    href="/projects"
                    onClick={onCloseChat}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors border border-border"
                >
                    💼 Lihat Semua Proyek <ArrowRight className="h-2.5 w-2.5" />
                </Link>
            )}
            {hasCert && !hasCV && (
                <Link
                    href="/certifications"
                    onClick={onCloseChat}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors border border-border"
                >
                    📜 Halaman Sertifikasi <ArrowRight className="h-2.5 w-2.5" />
                </Link>
            )}
        </div>
    );
}

function parseSuggestions(content: string): { cleanContent: string; suggestions: string[] } {
    const sugMatch = content.match(/\[SUGGESTIONS:\s*([\s\S]*?)\]/i);
    let suggestions: string[] = [];
    if (sugMatch) {
        suggestions = sugMatch[1]
            .split("|")
            .map(s => s.trim().replace(/^["'“”«»]|["'“”«»]$/g, ""))
            .filter(Boolean);
    }

    // Strip both complete [SUGGESTIONS: ...] and streaming/unclosed [SUGGESTIONS: ... from cleanContent
    let cleanContent = content.replace(/\[SUGGESTIONS:\s*[\s\S]*?\]/gi, "");
    cleanContent = cleanContent.replace(/\[SUGGESTIONS:[\s\S]*$/gi, "").trim();

    return { cleanContent, suggestions };
}

function FormattedChatMessage({
    content,
    isUser,
    onCloseChat,
}: {
    content: string;
    isUser: boolean;
    onCloseChat?: () => void;
}) {
    const { cleanContent } = parseSuggestions(content);

    const renderFormattedText = (text: string) => {
        const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`)/g);
        return parts.map((part, pIdx) => {
            const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
            if (linkMatch) {
                const [, linkText, linkUrl] = linkMatch;
                const isInternal = linkUrl.startsWith("/");
                if (isInternal) {
                    return (
                        <Link
                            key={pIdx}
                            href={linkUrl}
                            onClick={onCloseChat}
                            className={`font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity ${
                                isUser ? "text-white" : "text-primary"
                            }`}
                        >
                            {linkText}
                        </Link>
                    );
                }
                return (
                    <a
                        key={pIdx}
                        href={linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity ${
                            isUser ? "text-white" : "text-primary"
                        }`}
                    >
                        {linkText}
                    </a>
                );
            }

            const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
            if (boldMatch) {
                return <strong key={pIdx} className="font-semibold">{boldMatch[1]}</strong>;
            }

            if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
                return (
                    <code key={pIdx} className="px-1 py-0.5 rounded bg-muted font-mono text-[11px] text-primary">
                        {part.slice(1, -1)}
                    </code>
                );
            }

            return part;
        });
    };

    // Split content by mermaid code blocks
    const segments = cleanContent.split(/(```mermaid[\s\S]*?```)/g);

    return (
        <div className="space-y-2 break-words">
            {segments.map((seg, sIdx) => {
                const mermaidMatch = seg.match(/^```mermaid\s*([\s\S]*?)```$/);
                if (mermaidMatch) {
                    return (
                        <MermaidRenderer
                            key={sIdx}
                            chart={mermaidMatch[1]}
                            onCloseChat={onCloseChat}
                        />
                    );
                }

                const lines = seg.split('\n');
                return (
                    <div key={sIdx} className="space-y-1.5">
                        {lines.map((line, lIdx) => {
                            if (!line.trim()) return <div key={lIdx} className="h-1" />;
                            return (
                                <p key={lIdx} className="leading-relaxed">
                                    {renderFormattedText(line)}
                                </p>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
}

const DEFAULT_GREETING: ChatMessage = {
    role: "bot",
    content: "Halo! Saya Asisten AI Portfolio Maulido. Ada yang bisa saya bantu terkait profil keahlian, proyek jaringan/software, sertifikasi, atau kerjasama?",
    timestamp: "Online"
};

const PROMPT_CHIPS = [
    { label: "🎯 Match JD", prompt: "OPEN_JD_MODAL" },
    { label: "🚀 Keahlian", prompt: "Apa saja keahlian dan tech stack utama Maulido?" },
    { label: "💼 Proyek", prompt: "Ceritakan proyek unggulan yang pernah dikerjakan Maulido" },
    { label: "📜 Sertifikasi", prompt: "Sertifikasi profesional apa saja yang dimiliki Maulido?" },
    { label: "📄 Download CV", prompt: "Bagaimana cara mendownload CV resmi Maulido?" },
    { label: "💬 Hubungi", prompt: "Bagaimana cara menghubungi Maulido untuk tawaran kerja atau proyek?" },
];

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"chat" | "terminal">("chat");
    const [sessionId, setSessionId] = useState<string>("");
    const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_GREETING]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const [waNumber, setWaNumber] = useState("6281234567890");
    const [isListening, setIsListening] = useState(false);
    const [isJdModalOpen, setIsJdModalOpen] = useState(false);
    const [jdInput, setJdInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);

    // Clean up speech and voice recognition on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch {}
            }
            if (typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // Fetch dynamic WhatsApp number
    useEffect(() => {
        fetch("/api/settings?key=whatsappNumber")
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    const cleaned = String(data.data).replace(/[^0-9]/g, '');
                    if (cleaned) setWaNumber(cleaned);
                }
            })
            .catch(() => {});
    }, []);

    // Speech-to-Text handler
    const handleToggleVoiceInput = () => {
        if (typeof window === "undefined") return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRec) {
            toast.error("Browser Anda belum mendukung input suara Web Speech.");
            return;
        }

        if (isListening) {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch {}
            }
            setIsListening(false);
            return;
        }

        try {
            const recognition = new SpeechRec();
            recognitionRef.current = recognition;
            recognition.lang = "id-ID";
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => {
                setIsListening(false);
                recognitionRef.current = null;
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognition.onerror = (event: any) => {
                setIsListening(false);
                recognitionRef.current = null;
                if (event?.error === "not-allowed") {
                    toast.error("Akses mikrofon ditolak oleh browser.");
                }
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                if (transcript) {
                    setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
                }
            };

            recognition.start();
        } catch {
            setIsListening(false);
            recognitionRef.current = null;
        }
    };

    // Initialize or restore session ID and chat history
    useEffect(() => {
        try {
            let currentSession = localStorage.getItem("portfolio_chat_session_id");
            if (!currentSession) {
                currentSession = "sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
                localStorage.setItem("portfolio_chat_session_id", currentSession);
            }
            setSessionId(currentSession);

            const savedOpen = localStorage.getItem("portfolio_chat_open");
            if (savedOpen === "true") {
                setIsOpen(true);
            }

            const savedMessages = localStorage.getItem("portfolio_chat_messages");
            if (savedMessages) {
                const parsed = JSON.parse(savedMessages);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setMessages(parsed);
                }
            }

            const savedDraft = sessionStorage.getItem("portfolio_chat_draft");
            if (savedDraft) {
                setInput(savedDraft);
            }
        } catch (err) {
            console.warn("Failed to load chat history:", err);
        } finally {
            setIsHydrated(true);
        }
    }, []);

    // Persist messages to localStorage
    useEffect(() => {
        if (!isHydrated) return;
        try {
            const toSave = messages.slice(-50);
            localStorage.setItem("portfolio_chat_messages", JSON.stringify(toSave));
        } catch (err) {
            console.warn("Failed to save chat messages:", err);
        }
    }, [messages, isHydrated]);

    // Auto-scroll on new message or loading change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    // Real-Time Smart Sync Polling (Fetch Admin Replies while chat is open)
    const syncWithServer = useCallback(async () => {
        if (!sessionId || !isOpen || isLoading) return;
        try {
            const res = await fetch(`/api/chat/sync?sessionId=${encodeURIComponent(sessionId)}`);
            if (!res.ok) return;
            const data = await res.json();
            if (data.success && Array.isArray(data.messages)) {
                // Check if there are any admin messages from server not yet in local state
                const adminMsgs = data.messages.filter((m: { sender: string }) => m.sender === "admin");
                if (adminMsgs.length > 0) {
                    setMessages((prev) => {
                        const existingAdminContents = new Set(
                            prev.filter(p => p.role === "admin").map(p => p.content)
                        );
                        const newAdminItems: ChatMessage[] = [];
                        for (const am of adminMsgs) {
                            if (!existingAdminContents.has(am.content)) {
                                const timeStr = am.timestamp ? new Date(am.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Baru saja";
                                newAdminItems.push({
                                    role: "admin",
                                    senderName: am.senderName || "Maulido (Admin)",
                                    content: am.content,
                                    timestamp: timeStr
                                });
                            }
                        }
                        if (newAdminItems.length > 0) {
                            return [...prev, ...newAdminItems];
                        }
                        return prev;
                    });
                }
            }
        } catch {
            // Silently ignore network sync errors
        }
    }, [sessionId, isOpen, isLoading]);

    // Trigger sync on open and every 5 seconds while open
    useEffect(() => {
        if (!isOpen) return;
        syncWithServer();
        const interval = setInterval(syncWithServer, 5000);
        return () => clearInterval(interval);
    }, [isOpen, syncWithServer]);

    const handleOpen = () => {
        setIsOpen(true);
        try {
            localStorage.setItem("portfolio_chat_open", "true");
        } catch {}
    };

    const handleClose = () => {
        setIsOpen(false);
        if (recognitionRef.current) {
            try {
                recognitionRef.current.abort();
            } catch {}
            recognitionRef.current = null;
        }
        setIsListening(false);
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
        try {
            localStorage.setItem("portfolio_chat_open", "false");
        } catch {}
    };

    const handleResetChat = () => {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
        const newSession = "sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
        setSessionId(newSession);
        setMessages([DEFAULT_GREETING]);
        try {
            localStorage.setItem("portfolio_chat_session_id", newSession);
            localStorage.removeItem("portfolio_chat_messages");
        } catch {}
    };

    const handleInputChange = (val: string) => {
        setInput(val);
        try {
            sessionStorage.setItem("portfolio_chat_draft", val);
        } catch {}
    };

    const handleSubmitJd = () => {
        if (!jdInput.trim() || isLoading) return;
        const prompt = `Tolong evaluasi kesesuaian profil dan keahlian Maulido untuk Job Description berikut:\n\n${jdInput.trim()}`;
        setIsJdModalOpen(false);
        setJdInput("");
        handleSend(prompt);
    };

    const handleSend = async (overridePrompt?: string, e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (overridePrompt === "OPEN_JD_MODAL") {
            setIsJdModalOpen(true);
            return;
        }
        const currentInput = (typeof overridePrompt === "string" ? overridePrompt : input).trim();
        if (!currentInput || isLoading) return;

        // Cancel previous speech reading when a new message is sent
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }

        const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const userMessage: ChatMessage = { role: "user", content: currentInput, timestamp: timeStr };

        // Append user message + prepare empty bot message for live streaming
        setMessages((prev) => [
            ...prev,
            userMessage,
            { role: "bot", content: "", timestamp: timeStr }
        ]);

        if (typeof overridePrompt !== "string") {
            setInput("");
            try {
                sessionStorage.removeItem("portfolio_chat_draft");
            } catch {}
        }
        setIsLoading(true);

        try {
            const firstUserIdx = messages.findIndex(m => m.role === 'user');
            const historyMessages = firstUserIdx >= 0 ? messages.slice(firstUserIdx) : [];

            const history = historyMessages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));

            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: currentInput,
                    history,
                    sessionId: sessionId || undefined
                })
            });

            if (!res.ok || !res.body) {
                const errData = await res.json().catch(() => ({}));
                const errMsg = errData.error || "Maaf, asisten AI sedang mengalami gangguan koneksi. Silakan coba sesaat lagi.";
                setMessages((prev) => {
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    if (last && last.role === "bot") {
                        last.content = errMsg;
                    }
                    return updated;
                });
                return;
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const blocks = buffer.split("\n\n");
                buffer = blocks.pop() || "";

                for (const block of blocks) {
                    const trimmed = block.trim();
                    if (!trimmed) continue;

                    if (trimmed.includes("data: [DONE]")) {
                        break;
                    }

                    if (trimmed.startsWith("data: ")) {
                        try {
                            const jsonStr = trimmed.slice(6);
                            const parsed = JSON.parse(jsonStr);
                            if (parsed.sessionId && !sessionId) {
                                setSessionId(parsed.sessionId);
                                localStorage.setItem("portfolio_chat_session_id", parsed.sessionId);
                            }
                            if (parsed.text) {
                                setMessages((prev) => {
                                    const updated = [...prev];
                                    const last = updated[updated.length - 1];
                                    if (last && last.role === "bot") {
                                        last.content += parsed.text;
                                    }
                                    return updated;
                                });
                            } else if (parsed.error) {
                                setMessages((prev) => {
                                    const updated = [...prev];
                                    const last = updated[updated.length - 1];
                                    if (last && last.role === "bot") {
                                        last.content = `⚠️ ${parsed.error}`;
                                    }
                                    return updated;
                                });
                            }
                        } catch {
                            // ignore partial JSON parse error
                        }
                    }
                }
            }
        } catch (error) {
            console.warn("Chat connection warning:", error);
            setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.role === "bot") {
                    last.content = "Maaf, terjadi gangguan jaringan. Silakan coba kirim kembali pesan Anda dalam beberapa saat.";
                }
                return updated;
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const handleOpenChat = () => handleOpen();
        const handleCloseChat = () => handleClose();
        window.addEventListener("open-chat-widget", handleOpenChat);
        window.addEventListener("close-chat-widget", handleCloseChat);
        return () => {
            window.removeEventListener("open-chat-widget", handleOpenChat);
            window.removeEventListener("close-chat-widget", handleCloseChat);
        };
    }, []);

    if (!isOpen && !isHydrated) return null;

    return (
        <div className={`fixed bottom-24 left-6 md:left-8 z-[60] ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85, y: 20, transformOrigin: "bottom left" }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: 20 }}
                        className="bg-card w-[calc(100vw-3rem)] sm:w-84 md:w-96 h-[520px] max-h-[calc(100dvh-7rem)] rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden backdrop-blur-xl pointer-events-auto relative"
                    >
                        {viewMode === "terminal" ? (
                            <CliTerminal
                                onClose={handleClose}
                                onSwitchToChat={() => setViewMode("chat")}
                                sessionId={sessionId}
                                waNumber={waNumber}
                            />
                        ) : (
                            <>
                                {/* Header */}
                                <div className="bg-primary p-3.5 text-white flex justify-between items-center shadow-md select-none">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 bg-white/20 rounded-full">
                                            <Bot className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <h3 className="font-bold text-sm leading-tight">Portfolio Assistant</h3>
                                                <span className="inline-flex items-center px-1.5 py-0.2 text-[9px] rounded-full bg-white/20 font-semibold uppercase tracking-wider">
                                                    AI + Live
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                                                <span className="text-[10px] text-white/80">Streaming Online</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setViewMode("terminal")}
                                            title="Buka Mode Terminal CLI"
                                            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white/90 hover:text-white cursor-pointer"
                                            aria-label="Terminal mode"
                                        >
                                            <Terminal className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleResetChat}
                                            title="Mulai percakapan baru"
                                            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white/90 hover:text-white cursor-pointer"
                                            aria-label="Reset chat"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
                                            aria-label="Close chat"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-muted/30">
                                    {messages.map((msg, idx) => {
                                        const isUser = msg.role === "user";
                                        const isAdmin = msg.role === "admin";
                                        const { suggestions } = !isUser ? parseSuggestions(msg.content) : { suggestions: [] };

                                        return (
                                            <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                                                <div className={`max-w-[88%] p-3 rounded-2xl text-sm ${
                                                    isUser
                                                        ? "bg-primary text-white rounded-tr-none shadow-sm"
                                                        : isAdmin
                                                            ? "bg-primary/10 border-2 border-primary/40 text-foreground rounded-tl-none shadow-md"
                                                            : "bg-card border border-border rounded-tl-none shadow-sm text-foreground"
                                                }`}>
                                                    {/* Special Header for Live Admin Reply */}
                                                    {isAdmin && (
                                                        <div className="flex items-center justify-between gap-1.5 mb-2 pb-1.5 border-b border-primary/20">
                                                            <div className="flex items-center gap-1.5 font-bold text-xs text-primary">
                                                                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                                                                <span>{msg.senderName || "Maulido (Admin)"}</span>
                                                            </div>
                                                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                                                                ✓ Verified
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Live typing indicator when message is empty */}
                                                    {!isUser && !msg.content ? (
                                                        <div className="flex items-center gap-2 py-0.5 text-xs text-muted-foreground">
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                                                            <span>Mengetik jawaban...</span>
                                                        </div>
                                                    ) : (
                                                        <FormattedChatMessage
                                                            content={msg.content}
                                                            isUser={isUser}
                                                            onCloseChat={handleClose}
                                                        />
                                                    )}

                                                    {/* Contextual Interactive Action Buttons for Bot */}
                                                    {!isUser && !isAdmin && msg.content && (
                                                        <ContextualActions content={msg.content} onCloseChat={handleClose} waNumber={waNumber} />
                                                    )}

                                                    {/* Dynamic Suggested Follow-up Chips on the latest Bot message */}
                                                    {!isUser && !isAdmin && suggestions.length > 0 && idx === messages.length - 1 && (
                                                        <div className="mt-2.5 pt-2 border-t border-border/50 flex flex-wrap gap-1.5">
                                                            <span className="w-full text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                                                                <Sparkles className="h-2.5 w-2.5 text-primary" /> Rekomendasi Pertanyaan:
                                                            </span>
                                                            {suggestions.map((sug, sIdx) => (
                                                                <button
                                                                    key={sIdx}
                                                                    type="button"
                                                                    onClick={() => handleSend(sug)}
                                                                    disabled={isLoading}
                                                                    className="px-2.5 py-1 text-xs rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors border border-primary/20 cursor-pointer text-left active:scale-95 disabled:opacity-50"
                                                                >
                                                                    {sug}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Bubble Footer: Timestamps, Copy, and Text-to-Speech */}
                                                    <div className={`flex items-center mt-1.5 text-[10px] ${
                                                        isUser ? "justify-end text-white/70" : "justify-between text-muted-foreground"
                                                    }`}>
                                                        {!isUser && msg.content ? (
                                                            <div className="flex items-center gap-0.5">
                                                                <CopyButton text={msg.content} />
                                                                <SpeakButton text={msg.content} />
                                                            </div>
                                                        ) : <div />}
                                                        {msg.timestamp && (
                                                            <span className="tabular-nums font-medium">{msg.timestamp}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {isLoading && messages[messages.length - 1]?.role === "user" && (
                                        <div className="flex justify-start">
                                            <div className="bg-card border border-border p-3 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm">
                                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                <span className="text-xs text-muted-foreground">Menganalisis basis pengetahuan...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Quick Prompt Chips */}
                                <div className="px-3 py-1.5 border-t border-border/50 bg-card/90 flex gap-1.5 overflow-x-auto no-scrollbar select-none">
                                    {PROMPT_CHIPS.map((chip, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleSend(chip.prompt)}
                                            disabled={isLoading}
                                            className="whitespace-nowrap px-2.5 py-1 text-xs rounded-full bg-primary/10 text-primary hover:bg-primary/20 active:scale-95 transition-all font-medium border border-primary/20 disabled:opacity-50 cursor-pointer flex items-center gap-1"
                                        >
                                            <Sparkles className="h-2.5 w-2.5 opacity-70" />
                                            {chip.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Input Form */}
                                <form onSubmit={(e) => handleSend(undefined, e)} className="p-2.5 bg-card border-t border-border flex gap-2 items-center">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => handleInputChange(e.target.value)}
                                        placeholder={isListening ? "Mendengarkan suara Anda..." : "Tanyakan keahlian, proyek, atau kontak..."}
                                        className={`flex-1 bg-background border rounded-xl px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none transition-all ${
                                            isListening ? "border-rose-500 ring-1 ring-rose-500/30" : "border-input"
                                        }`}
                                        disabled={isLoading}
                                    />
                                    {/* Speech-to-Text Button */}
                                    <button
                                        type="button"
                                        onClick={handleToggleVoiceInput}
                                        className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                                            isListening
                                                ? "bg-rose-500 text-white animate-pulse shadow-md"
                                                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                                        }`}
                                        title={isListening ? "Mendengarkan... Klik untuk berhenti" : "Input suara (Speech-to-Text)"}
                                        aria-label="Voice input"
                                    >
                                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading || !input.trim()}
                                        className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:scale-100 cursor-pointer flex items-center justify-center shrink-0"
                                        aria-label="Send message"
                                    >
                                        <Send className="h-4 w-4" />
                                    </button>
                                </form>

                                {/* Job Description (JD) Matcher Modal */}
                                {isJdModalOpen && (
                                    <div className="absolute inset-0 z-30 bg-background/95 backdrop-blur-md p-4 flex flex-col justify-between animate-in fade-in zoom-in-95 duration-200">
                                        <div>
                                            <div className="flex items-center justify-between pb-2 border-b border-border">
                                                <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
                                                    <Target className="h-4 w-4 text-primary" />
                                                    <span>Match My Job Description</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsJdModalOpen(false)}
                                                    className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                                                Tempelkan teks lowongan kerja / kualifikasi yang dicari. AI akan mengevaluasi kecocokan profil & proyek Maulido, menghitung persentase skor kesesuaian, dan menyajikan ringkasan instan.
                                            </p>
                                            <textarea
                                                value={jdInput}
                                                onChange={(e) => setJdInput(e.target.value)}
                                                placeholder="Contoh: Dicari Senior Network & Full Stack Engineer dengan keahlian Cisco, Python, Next.js, dan arsitektur High-Availability..."
                                                rows={7}
                                                className="w-full mt-3 p-2.5 rounded-xl bg-muted/40 border border-border text-xs focus:ring-1 focus:ring-primary focus:outline-none resize-none leading-relaxed text-foreground"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                                            <button
                                                type="button"
                                                onClick={() => setIsJdModalOpen(false)}
                                                className="px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSubmitJd}
                                                disabled={!jdInput.trim()}
                                                className="px-4 py-1.5 text-xs font-bold bg-primary text-white hover:bg-primary/90 rounded-lg shadow-sm disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
                                            >
                                                <Sparkles className="h-3.5 w-3.5" />
                                                <span>Analisis Kecocokan</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
