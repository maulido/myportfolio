"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, Loader2 } from "lucide-react";

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "bot", content: "Hello! I'm your portfolio assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const currentInput = input.trim();
        if (!currentInput || isLoading) return;

        const userMessage = { role: "user", content: currentInput };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
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
                throw new Error(data.error || "Something went wrong");
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "bot", content: "Sorry, I'm having trouble connecting right now. Please try again later." }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const handleOpenChat = () => setIsOpen(true);
        window.addEventListener("open-chat-widget", handleOpenChat);
        return () => window.removeEventListener("open-chat-widget", handleOpenChat);
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-24 left-6 md:left-8 z-[60]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85, y: 20, transformOrigin: "bottom left" }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: 20 }}
                        className="bg-card w-[calc(100vw-3rem)] sm:w-80 md:w-96 h-[480px] rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden backdrop-blur-xl"
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
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-full hover:bg-white/20 transition-colors"
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
                                        {msg.content}
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
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 bg-background border border-input rounded-xl px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:scale-100"
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
