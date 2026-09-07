"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, Loader2 } from "lucide-react";
import Link from "next/link";

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

interface ChatMessage {
    role: "user" | "bot";
    content: string;
}

const DEFAULT_GREETING: ChatMessage = {
    role: "bot",
    content: "Hello! I'm your portfolio assistant. How can I help you today?"
};

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
            // Keep up to 50 latest messages to prevent localStorage overflow
            const toSave = messages.slice(-50);
            localStorage.setItem("portfolio_chat_messages", JSON.stringify(toSave));
        } catch (err) {
            console.warn("Failed to save chat messages:", err);
        }
    }, [messages, isHydrated]);

    // Scroll to bottom on message or loading change
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


    const handleInputChange = (val: string) => {
        setInput(val);
        try {
            sessionStorage.setItem("portfolio_chat_draft", val);
        } catch {}
    };

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const currentInput = input.trim();
        if (!currentInput || isLoading) return;

        const userMessage: ChatMessage = { role: "user", content: currentInput };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        try {
            sessionStorage.removeItem("portfolio_chat_draft");
        } catch {}
        setIsLoading(true);

        try {
            // Find first user message index so history starts with 'user'
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

            const data = await res.json();

            if (data.response) {
                setMessages((prev) => [...prev, { role: "bot", content: data.response }]);
            } else {
                const userMsg = (data.error?.includes("high demand") || data.error?.includes("503"))
                    ? "Model AI saat ini sedang mengalami lonjakan antrean server (high demand). Silakan coba kirim kembali pesan Anda dalam beberapa saat."
                    : (data.error || "Maaf, asisten AI sedang mengalami gangguan koneksi. Silakan coba sesaat lagi.");
                setMessages((prev) => [...prev, { role: "bot", content: userMsg }]);
            }
        } catch (error) {
            console.warn("Chat connection warning:", error);
            setMessages((prev) => [
                ...prev,
                { role: "bot", content: "Maaf, terjadi gangguan jaringan. Silakan coba kirim kembali pesan Anda dalam beberapa saat." }
            ]);
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
                        className="bg-card w-[calc(100vw-3rem)] sm:w-80 md:w-96 h-[480px] rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden backdrop-blur-xl pointer-events-auto"
                    >
                        {/* Header */}
                        <div className="bg-primary p-4 text-white flex justify-between items-center shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-full">
                                    <Bot className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Portfolio Assistant</h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                                        <span className="text-[10px] text-white/80">Online</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-1 rounded-full hover:bg-white/20 transition-colors text-white"
                                aria-label="Close chat"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === "user"
                                        ? "bg-primary text-white rounded-tr-none shadow-sm"
                                        : "bg-card border border-border rounded-tl-none shadow-sm text-foreground"
                                        }`}>
                                        <FormattedChatMessage
                                            content={msg.content}
                                            isUser={msg.role === "user"}
                                            onCloseChat={handleClose}
                                        />
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-card border border-border p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        <span className="text-xs text-muted-foreground">Thinking...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-3 bg-card border-t border-border flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => handleInputChange(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 bg-background border border-input rounded-xl px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:scale-100 cursor-pointer"
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
