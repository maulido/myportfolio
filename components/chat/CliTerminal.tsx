"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Terminal, X, CornerDownLeft, Sparkles } from "lucide-react";

interface TerminalLine {
    id: string;
    type: "input" | "output" | "system" | "error" | "ai";
    content: string;
    isStreaming?: boolean;
}

interface CliTerminalProps {
    onClose: () => void;
    onSwitchToChat: () => void;
    sessionId: string;
}

const BANNER = `
╔═══════════════════════════════════════════════════════════╗
║  MAULIDO NET-OS v2.6 // NETWORK & DEVELOPER CONSOLE       ║
║  Type 'help' for commands, or ask any question directly.  ║
╚═══════════════════════════════════════════════════════════╝
`.trim();

const HELP_TEXT = `
COMMANDS:
  help                  Tampilkan menu bantuan ini
  ping maulido          Simulasi ICMP ping ke server & profil
  traceroute career     Hop-by-hop visualisasi riwayat karir
  skills                Daftar keahlian teknis & stack jaringan/software
  projects              Daftar proyek unggulan
  certs                 Sertifikasi profesional aktif
  contact               Informasi kontak & WhatsApp
  cv                    Buka/unduh resume resmi
  clear                 Bersihkan layar terminal
  chat                  Kembali ke mode chat grafis biasa
  ai <pertanyaan>       Tanyakan apapun kepada Asisten AI (bisa langsung ketik)
`;

export default function CliTerminal({ onClose, onSwitchToChat, sessionId }: CliTerminalProps) {
    const [lines, setLines] = useState<TerminalLine[]>([
        { id: "1", type: "system", content: BANNER },
        { id: "2", type: "output", content: "Terminal siap. Ketik 'help' untuk melihat daftar perintah." }
    ]);
    const [inputVal, setInputVal] = useState("");
    const [history, setHistory] = useState<string[]>([]);
    const [historyIdx, setHistoryIdx] = useState<number>(-1);
    const [isExecuting, setIsExecuting] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll on new line
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [lines]);

    // Auto-focus input on mount or click
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const appendLine = useCallback((type: TerminalLine["type"], content: string): string => {
        const id = Math.random().toString(36).substring(2, 9);
        setLines(prev => [...prev, { id, type, content }]);
        return id;
    }, []);

    const executeAiQuery = async (query: string) => {
        setIsExecuting(true);
        const aiLineId = Math.random().toString(36).substring(2, 9);

        setLines(prev => [
            ...prev,
            { id: aiLineId, type: "ai", content: "", isStreaming: true }
        ]);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: query,
                    sessionId,
                    history: []
                })
            });

            if (!res.ok || !res.body) {
                setLines(prev =>
                    prev.map(l => l.id === aiLineId ? { ...l, type: "error", content: "AI gateway error: HTTP " + res.status, isStreaming: false } : l)
                );
                return;
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let accumulated = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const linesRaw = chunk.split("\n\n");

                for (const line of linesRaw) {
                    if (line.startsWith("data: ")) {
                        const jsonStr = line.replace("data: ", "").trim();
                        if (jsonStr === "[DONE]") continue;

                        try {
                            const parsed = JSON.parse(jsonStr);
                            if (parsed.text) {
                                accumulated += parsed.text;
                                setLines(prev =>
                                    prev.map(l => l.id === aiLineId ? { ...l, content: accumulated } : l)
                                );
                            } else if (parsed.error) {
                                setLines(prev =>
                                    prev.map(l => l.id === aiLineId ? { ...l, type: "error", content: "Error: " + parsed.error } : l)
                                );
                            }
                        } catch {}
                    }
                }
            }

            setLines(prev =>
                prev.map(l => l.id === aiLineId ? { ...l, isStreaming: false } : l)
            );
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : "Koneksi ke AI gagal.";
            setLines(prev =>
                prev.map(l => l.id === aiLineId ? { ...l, type: "error", content: "Network error: " + errMsg, isStreaming: false } : l)
            );
        } finally {
            setIsExecuting(false);
        }
    };

    const handleCommand = async (cmdStr: string) => {
        const raw = cmdStr.trim();
        if (!raw || isExecuting) return;

        // Add to history
        setHistory(prev => [raw, ...prev]);
        setHistoryIdx(-1);
        setInputVal("");

        // Show prompt echo
        appendLine("input", raw);

        const lower = raw.toLowerCase();
        const parts = lower.split(" ");
        const baseCmd = parts[0];

        switch (baseCmd) {
            case "help":
                appendLine("output", HELP_TEXT);
                break;

            case "clear":
            case "cls":
                setLines([]);
                break;

            case "chat":
            case "gui":
            case "exit":
                onSwitchToChat();
                break;

            case "ping": {
                appendLine("output", "PING maulido.internal (192.168.10.1): 56 data bytes");
                setIsExecuting(true);
                setTimeout(() => {
                    appendLine("output", "64 bytes from 192.168.10.1: icmp_seq=0 ttl=64 time=1.24 ms");
                }, 200);
                setTimeout(() => {
                    appendLine("output", "64 bytes from 192.168.10.1: icmp_seq=1 ttl=64 time=0.98 ms");
                }, 400);
                setTimeout(() => {
                    appendLine("output", "64 bytes from 192.168.10.1: icmp_seq=2 ttl=64 time=1.05 ms\n--- maulido ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss, time 2002ms\nStatus: HOST ONLINE & OPERATIONAL [Senior Network & Software Engineer]");
                    setIsExecuting(false);
                }, 700);
                break;
            }

            case "traceroute":
            case "tracert": {
                appendLine("output", "traceroute to career.experience (10.0.0.1), 30 hops max, 60 byte packets");
                setIsExecuting(true);
                setTimeout(() => {
                    appendLine("output", " 1  router-gateway (192.168.1.1)  0.642 ms  [Foundational IT & Hardware]");
                }, 250);
                setTimeout(() => {
                    appendLine("output", " 2  isp-core-edge (10.20.0.1)     2.154 ms  [Network Administration & Cisco Routing]");
                }, 500);
                setTimeout(() => {
                    appendLine("output", " 3  cloud-vpc-gw (172.16.0.1)      6.418 ms  [Cloud Infrastructure & Docker DevOps]");
                }, 750);
                setTimeout(() => {
                    appendLine("output", " 4  maulido.senior.dev (10.0.0.1)   12.802 ms [Full Stack Next.js, Python & High-Availability Network Architecture]\nTrace complete.");
                    setIsExecuting(false);
                }, 1000);
                break;
            }

            case "skills":
                appendLine("output", `
TECH MATRIX:
  [Networking]  Cisco IOS, Mikrotik, OSPF, BGP, VLAN, VPN/IPsec, Failover, QoS
  [Software]    TypeScript, Next.js 16, React 19, Node.js, Python, REST/GraphQL
  [Databases]   MongoDB, PostgreSQL, Redis In-Memory Cache
  [DevOps/Sys]  Docker, Linux Ubuntu/Debian Server, Nginx, CI/CD, Git
                `.trim());
                break;

            case "projects":
                appendLine("output", `
PORTFOLIO SHOWCASE:
  1. High-Availability Dual-ISP Network Architecture [/projects]
  2. Full-Stack Automated Monitoring Dashboard
  3. Enterprise VLAN & IPsec Site-to-Site VPN
Ketik pertanyaan bebas atau buka menu proyek di web untuk melihat detail arsitektur.
                `.trim());
                break;

            case "certs":
            case "certifications":
                appendLine("output", `
VERIFIED CERTIFICATIONS:
  * Cisco Certified Network Associate (CCNA)
  * MikroTik Certified Network Associate (MTCNA)
  * Advanced Web Application & System Engineering
                `.trim());
                break;

            case "contact":
                appendLine("output", `
CONTACT CHANNELS:
  Email     : contact@maulido.dev
  WhatsApp  : https://wa.me/6281234567890
  LinkedIn  : linkedin.com/in/maulido
  Web Form  : /contact
                `.trim());
                break;

            case "cv":
            case "resume":
                window.dispatchEvent(new Event("open-cv-modal"));
                appendLine("output", "Membuka modal pratinjau CV resmi...");
                break;

            default: {
                // If it starts with 'ai ', remove it
                const prompt = raw.startsWith("ai ") ? raw.substring(3).trim() : raw;
                await executeAiQuery(prompt);
                break;
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleCommand(inputVal);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (history.length > 0 && historyIdx < history.length - 1) {
                const nextIdx = historyIdx + 1;
                setHistoryIdx(nextIdx);
                setInputVal(history[nextIdx] || "");
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (historyIdx > 0) {
                const nextIdx = historyIdx - 1;
                setHistoryIdx(nextIdx);
                setInputVal(history[nextIdx] || "");
            } else if (historyIdx === 0) {
                setHistoryIdx(-1);
                setInputVal("");
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0d1117] text-[#58a6ff] font-mono text-xs select-text">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-[#161b22] border-b border-[#30363d] text-muted-foreground select-none">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 mr-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] inline-block" />
                    </div>
                    <Terminal className="h-3.5 w-3.5 text-[#3fb950]" />
                    <span className="text-[11px] text-[#c9d1d9] font-semibold">guest@maulido-net-os:~</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={onSwitchToChat}
                        className="px-2 py-0.5 rounded text-[10px] bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] transition-colors border border-[#30363d] flex items-center gap-1 cursor-pointer"
                        title="Kembali ke tampilan chat biasa"
                    >
                        <Sparkles className="h-2.5 w-2.5 text-amber-400" />
                        Mode GUI
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d] transition-colors cursor-pointer"
                        title="Tutup Terminal"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* Terminal Body */}
            <div
                className="flex-1 p-3 overflow-y-auto space-y-2 text-[11px] leading-relaxed"
                onClick={() => inputRef.current?.focus()}
            >
                {lines.map((line) => {
                    if (line.type === "system") {
                        return (
                            <pre key={line.id} className="text-[#3fb950] whitespace-pre font-mono text-[10px]">
                                {line.content}
                            </pre>
                        );
                    }
                    if (line.type === "input") {
                        return (
                            <div key={line.id} className="flex items-start gap-1 text-[#e6edf3]">
                                <span className="text-[#7ee787]">➜</span>
                                <span className="text-[#79c0ff]">~</span>
                                <span className="text-[#e6edf3] font-semibold">{line.content}</span>
                            </div>
                        );
                    }
                    if (line.type === "error") {
                        return (
                            <div key={line.id} className="text-[#f85149] pl-3">
                                {line.content}
                            </div>
                        );
                    }
                    if (line.type === "ai") {
                        return (
                            <div key={line.id} className="pl-3 text-[#c9d1d9] whitespace-pre-wrap">
                                <span className="text-[#a371f7] font-semibold mr-1.5">[AI Assistant]:</span>
                                {line.content}
                                {line.isStreaming && (
                                    <span className="inline-block w-1.5 h-3.5 ml-1 bg-[#3fb950] animate-pulse align-middle" />
                                )}
                            </div>
                        );
                    }
                    return (
                        <pre key={line.id} className="text-[#8b949e] whitespace-pre-wrap pl-3 font-mono">
                            {line.content}
                        </pre>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Terminal Command Input Prompt */}
            <div className="p-2.5 bg-[#161b22] border-t border-[#30363d] flex items-center gap-2">
                <span className="text-[#7ee787] font-bold">➜</span>
                <span className="text-[#79c0ff] font-bold">~</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isExecuting}
                    placeholder={isExecuting ? "Menjalankan perintah..." : "Ketik perintah (e.g. 'help', 'ping', atau tanya AI)..."}
                    className="flex-1 bg-transparent text-[#e6edf3] focus:outline-none placeholder:text-[#484f58] font-mono text-xs disabled:opacity-60"
                />
                <button
                    type="button"
                    onClick={() => handleCommand(inputVal)}
                    disabled={!inputVal.trim() || isExecuting}
                    className="p-1 rounded bg-[#238636] hover:bg-[#2ea043] text-white disabled:opacity-40 transition-colors cursor-pointer"
                    title="Jalankan perintah"
                >
                    <CornerDownLeft className="h-3 w-3" />
                </button>
            </div>
        </div>
    );
}
