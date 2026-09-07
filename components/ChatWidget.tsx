"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, Loader2, Copy, Check, Sparkles, MessageCircle, FileText, ArrowRight, RotateCcw } from "lucide-react";
import Link from "next/link";

interface ChatMessage {
    role: "user" | "bot";
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

function ContextualActions({
    content,
    onCloseChat
}: {
    content: string;
    onCloseChat: () => void;
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
                        href="https://wa.me/6281234567890"
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

function FormattedChatMessage({
    content,
    isUser,
    onCloseChat,
}: {
    content: string;
    isUser: boolean;
    onCloseChat?: () => void;
}) {
    const renderFormattedText = (text: string) => {
        const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
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

            return part;
        });
    };

    const lines = content.split('\n');
    return (
        <div className="space-y-1.5 break-words">
            {lines.map((line, lIdx) => {
                if (!line.trim()) return <div key={lIdx} className="h-1.5" />;
                return (
                    <p key={lIdx} className="leading-relaxed">
                        {renderFormattedText(line)}
                    </p>
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
    { label: "🚀 Keahlian", prompt: "Apa saja keahlian dan tech stack utama Maulido?" },
    { label: "💼 Proyek", prompt: "Ceritakan proyek unggulan yang pernah dikerjakan Maulido" },
    { label: "📜 Sertifikasi", prompt: "Sertifikasi profesional apa saja yang dimiliki Maulido?" },
    { label: "📄 Download CV", prompt: "Bagaimana cara mendownload CV resmi Maulido?" },
    { label: "💬 Hubungi", prompt: "Bagaimana cara menghubungi Maulido untuk tawaran kerja atau proyek?" },
];

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_GREETING]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Restore state from localStorage & sessionStorage on initial mount
    useEffect(() => {
        try {
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

    // Persist messages to localStorage whenever they change
    useEffect(() => {
        if (!isHydrated) return;
        try {
            const toSave = messages.slice(-50);
            localStorage.setItem("portfolio_chat_messages", JSON.stringify(toSave));
        } catch (err) {
            console.warn("Failed to save chat messages:", err);
        }
    }, [messages, isHydrated]);

    // Auto-scroll to bottom on message or loading change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleOpen = () => {
        setIsOpen(true);
        try {
            localStorage.setItem("portfolio_chat_open", "true");
        } catch {}
    };

    const handleClose = () => {
        setIsOpen(false);
        try {
            localStorage.setItem("portfolio_chat_open", "false");
        } catch {}
    };

    const handleResetChat = () => {
        setMessages([DEFAULT_GREETING]);
        try {
            localStorage.removeItem("portfolio_chat_messages");
        } catch {}
    };

    const handleInputChange = (val: string) => {
        setInput(val);
        try {
            sessionStorage.setItem("portfolio_chat_draft", val);
        } catch {}
    };

    const handleSend = async (overridePrompt?: string, e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const currentInput = (typeof overridePrompt === "string" ? overridePrompt : input).trim();
        if (!currentInput || isLoading) return;

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
                body: JSON.stringify({ message: currentInput, history })
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
                        className="bg-card w-[calc(100vw-3rem)] sm:w-84 md:w-96 h-[510px] rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden backdrop-blur-xl pointer-events-auto"
                    >
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
                                            AI
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
                                    onClick={handleResetChat}
                                    title="Mulai percakapan baru"
                                    className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white/90 hover:text-white"
                                    aria-label="Reset chat"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
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
                                return (
                                    <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[88%] p-3 rounded-2xl text-sm ${
                                            isUser
                                                ? "bg-primary text-white rounded-tr-none shadow-sm"
                                                : "bg-card border border-border rounded-tl-none shadow-sm text-foreground"
                                        }`}>
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

                                            {/* Contextual Interactive Action Buttons */}
                                            {!isUser && msg.content && (
                                                <ContextualActions content={msg.content} onCloseChat={handleClose} />
                                            )}

                                            {/* Bubble Footer: Timestamps & Copy */}
                                            <div className={`flex items-center mt-1.5 text-[10px] ${
                                                isUser ? "justify-end text-white/70" : "justify-between text-muted-foreground"
                                            }`}>
                                                {!isUser && msg.content && <CopyButton text={msg.content} />}
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
                        <form onSubmit={(e) => handleSend(undefined, e)} className="p-2.5 bg-card border-t border-border flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => handleInputChange(e.target.value)}
                                placeholder="Tanyakan keahlian, proyek, atau kontak..."
                                className="flex-1 bg-background border border-input rounded-xl px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:scale-100 cursor-pointer flex items-center justify-center"
                                aria-label="Send message"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
