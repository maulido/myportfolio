"use client";

import { useState, useEffect } from "react";
import { 
    Sparkles, 
    X, 
    Copy, 
    Check, 
    Languages, 
    FileText, 
    Tag, 
    Wand2, 
    Loader2, 
    Bot,
    KeyRound
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useSettings } from "@/lib/useSettings";
import { AI_PROVIDERS } from "@/lib/ai";

type AiTab = "translate" | "excerpt" | "tags" | "improve";

export default function AiAssistantModal() {
    const { settings } = useSettings();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<AiTab>("translate");
    const [inputText, setInputText] = useState("");
    const [inputTitle, setInputTitle] = useState("");
    const [targetLang, setTargetLang] = useState<"id" | "en">("id");
    const [outputResult, setOutputResult] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [missingKeyError, setMissingKeyError] = useState(false);

    const provider = settings.aiProvider || "gemini";
    const preset = AI_PROVIDERS[provider] || AI_PROVIDERS.gemini;
    const model = settings.aiModel || (provider === "gemini" ? (settings.geminiModel || preset.defaultModel) : preset.defaultModel);

    useEffect(() => {
        const handleOpen = (e: Event) => {
            const customEvent = e as CustomEvent<{ tab?: AiTab; text?: string; title?: string }>;
            if (customEvent?.detail) {
                if (customEvent.detail.tab) setActiveTab(customEvent.detail.tab);
                if (customEvent.detail.text !== undefined) setInputText(customEvent.detail.text);
                if (customEvent.detail.title !== undefined) setInputTitle(customEvent.detail.title);
            }
            setMissingKeyError(false);
            setIsOpen(true);
        };

        window.addEventListener("open-ai-assistant", handleOpen);
        return () => window.removeEventListener("open-ai-assistant", handleOpen);
    }, []);

    const handleRunAi = async () => {
        if (!inputText.trim() && activeTab !== "excerpt") {
            toast.error("Silakan masukkan teks input terlebih dahulu");
            return;
        }

        setIsLoading(true);
        setOutputResult("");
        setMissingKeyError(false);

        let action = "translate";
        if (activeTab === "excerpt") action = "generate_excerpt";
        else if (activeTab === "tags") action = "generate_tags";
        else if (activeTab === "improve") action = "improve_writing";

        try {
            const res = await fetch("/api/admin/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action,
                    text: inputText,
                    title: inputTitle,
                    targetLang
                })
            });

            const json = await res.json();
            if (json.success) {
                setOutputResult(json.result);
                toast.success("AI selesai menghasilkan respon!");
            } else {
                if (json.error?.includes("API_KEY") || json.error?.includes("API Key") || json.error?.includes("belum dikonfigurasi")) {
                    setMissingKeyError(true);
                }
                toast.error(json.error || "Gagal memproses permintaan AI");
            }
        } catch {
            toast.error("Error saat menghubungi server AI");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!outputResult) return;
        navigator.clipboard.writeText(outputResult);
        setCopied(true);
        toast.success("Berhasil disalin ke clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl bg-card border border-border/90 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto flex flex-col justify-between">
                <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 mb-5 border-b border-border/80">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-blue-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 shadow-xs">
                                <Bot className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                    <span>AI Content Assistant</span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                        {preset.name.split(" ")[0]} • {model}
                                    </span>
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Penerjemah bilingual cerdas, pembuat ringkasan excerpt & pemoles konten teknis
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Missing API Key Warning if triggered */}
                    {missingKeyError && (
                        <div className="mb-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-1.5">
                            <div className="font-bold flex items-center gap-1.5">
                                <KeyRound className="h-4 w-4 text-amber-500" />
                                <span>API Key Diperlukan ({preset.name})</span>
                            </div>
                            <p>
                                Layanan AI saat ini menggunakan provider <strong>{preset.name}</strong>. Silakan masukkan API Key di menu <Link href="/admin/settings" onClick={() => setIsOpen(false)} className="underline font-bold text-primary">Admin Settings &gt; Database &amp; AI Services</Link>.
                            </p>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/70 border border-border/80 mb-5 overflow-x-auto">
                        <button
                            type="button"
                            onClick={() => { setActiveTab("translate"); setOutputResult(""); }}
                            className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                activeTab === "translate"
                                    ? "bg-background text-foreground shadow-xs font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Languages className="h-3.5 w-3.5 text-primary" />
                            <span>Translate (EN/ID)</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => { setActiveTab("excerpt"); setOutputResult(""); }}
                            className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                activeTab === "excerpt"
                                    ? "bg-background text-foreground shadow-xs font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <FileText className="h-3.5 w-3.5 text-indigo-500" />
                            <span>Excerpt & SEO</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => { setActiveTab("tags"); setOutputResult(""); }}
                            className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                activeTab === "tags"
                                    ? "bg-background text-foreground shadow-xs font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Tag className="h-3.5 w-3.5 text-emerald-500" />
                            <span>Suggest Tags</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => { setActiveTab("improve"); setOutputResult(""); }}
                            className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                activeTab === "improve"
                                    ? "bg-background text-foreground shadow-xs font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Wand2 className="h-3.5 w-3.5 text-purple-500" />
                            <span>Polish Tone</span>
                        </button>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                        {/* Target Language Selector */}
                        {(activeTab === "translate" || activeTab === "excerpt" || activeTab === "improve") && (
                            <div className="flex items-center justify-between p-3 rounded-xl bg-background/60 border border-border/70 text-xs">
                                <span className="font-semibold text-muted-foreground">Target Bahasa Output:</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setTargetLang("id")}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            targetLang === "id"
                                                ? "bg-primary text-primary-foreground shadow-xs"
                                                : "bg-muted text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        Bahasa Indonesia
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTargetLang("en")}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            targetLang === "en"
                                                ? "bg-primary text-primary-foreground shadow-xs"
                                                : "bg-muted text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        English
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === "excerpt" && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-foreground">Judul Artikel / Projek (Opsional)</label>
                                <input
                                    type="text"
                                    value={inputTitle}
                                    onChange={(e) => setInputTitle(e.target.value)}
                                    placeholder="Contoh: Merancang Arsitektur BGP Multihoming..."
                                    className="w-full px-3.5 py-2 rounded-xl bg-background border border-border/80 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground">
                                {activeTab === "translate" && "Teks yang Ingin Diterjemahkan:"}
                                {activeTab === "excerpt" && "Draf Konten Lengkap / Paragraf Utama:"}
                                {activeTab === "tags" && "Teks Konten untuk Dianalisis:"}
                                {activeTab === "improve" && "Draf Teks yang Ingin Dipoles:"}
                            </label>
                            <textarea
                                rows={4}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Ketik atau tempelkan teks di sini..."
                                className="w-full p-3.5 rounded-xl bg-background border border-border/80 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                            />
                        </div>

                        {/* Action Submit Button */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleRunAi}
                                disabled={isLoading}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-primary text-white text-xs font-bold hover:opacity-95 transition-all flex items-center gap-2 shadow-md shadow-primary/20 disabled:opacity-50 cursor-pointer"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        <span>Memproses dengan AI...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-3.5 w-3.5" />
                                        <span>
                                            {activeTab === "translate" && "Terjemahkan Sekarang"}
                                            {activeTab === "excerpt" && "Buat Excerpt Cerdas"}
                                            {activeTab === "tags" && "Analisis & Buat Tag"}
                                            {activeTab === "improve" && "Sempurnakan Tulisan"}
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Output Result Area */}
                        {outputResult && (
                            <div className="mt-4 p-4 rounded-2xl bg-muted/60 border border-border/90 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                        <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                                        Hasil Generasi AI
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleCopy}
                                        className="px-2.5 py-1 rounded-lg bg-background border border-border/80 hover:bg-muted text-[11px] font-semibold text-foreground flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="h-3 w-3 text-emerald-500" />
                                                <span className="text-emerald-500">Tersalin</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-3 w-3 text-muted-foreground" />
                                                <span>Salin Hasil</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="p-3 rounded-xl bg-background border border-border/60 text-xs font-sans text-foreground leading-relaxed whitespace-pre-wrap selection:bg-purple-500/20">
                                    {outputResult}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Bot className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                        <span>
                            Provider: <strong className="text-foreground font-semibold">{preset.name}</strong> • Model: <code className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded text-foreground">{model}</code>
                        </span>
                        <Link
                            href="/admin/settings"
                            onClick={() => setIsOpen(false)}
                            className="text-[11px] text-primary hover:underline font-semibold ml-1 shrink-0"
                        >
                            Ubah di Settings
                        </Link>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-1.5 rounded-xl bg-muted/80 hover:bg-muted text-foreground text-xs font-semibold transition-colors cursor-pointer self-end sm:self-auto"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
