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
    KeyRound,
    Globe,
    ShieldCheck
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useSettings } from "@/lib/useSettings";
import { AI_PROVIDERS } from "@/lib/ai";

type AiTab = "translate" | "excerpt" | "tags" | "improve" | "seo";

export default function AiAssistantModal() {
    const { settings } = useSettings();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<AiTab>("translate");
    const [seoMode, setSeoMode] = useState<"audit" | "optimize" | "ideas">("audit");
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
        if (!inputText.trim() && activeTab !== "excerpt" && !(activeTab === "seo" && (seoMode === "audit" || seoMode === "ideas"))) {
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
        else if (activeTab === "seo") {
            if (seoMode === "audit") action = "seo_audit";
            else if (seoMode === "optimize") action = "seo_optimize";
            else if (seoMode === "ideas") action = "content_ideas";
        }

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

                        <button
                            type="button"
                            onClick={() => { setActiveTab("seo"); setOutputResult(""); }}
                            className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                activeTab === "seo"
                                    ? "bg-background text-foreground shadow-xs font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Globe className="h-3.5 w-3.5 text-blue-500" />
                            <span>SEO &amp; Audit</span>
                        </button>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                        {/* Target Language Selector */}
                        {(activeTab === "translate" || activeTab === "excerpt" || activeTab === "improve" || activeTab === "seo") && (
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

                        {/* SEO Mode Selector & Safety Shield Banner */}
                        {activeTab === "seo" && (
                            <div className="space-y-3">
                                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs">
                                    <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                                    <div>
                                        <div className="font-bold flex items-center gap-1.5">
                                            <span>Safe Website Knowledge Engine</span>
                                            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 rounded font-mono font-medium">Sensitive Data Filtered</span>
                                        </div>
                                        <p className="text-[11px] text-emerald-700 dark:text-emerald-300/90 mt-0.5 leading-relaxed">
                                            AI membaca seluruh proyek, artikel, keahlian, dan metrik publik situs Anda untuk rekomendasi SEO &amp; internal cross-linking. Password, auth token, dan API key otomatis dikecualikan 100%.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/80">
                                    <button
                                        type="button"
                                        onClick={() => { setSeoMode("audit"); setOutputResult(""); }}
                                        className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                            seoMode === "audit"
                                                ? "bg-background text-foreground shadow-xs font-bold"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        📊 Audit Seluruh Situs
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setSeoMode("optimize"); setOutputResult(""); }}
                                        className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                            seoMode === "optimize"
                                                ? "bg-background text-foreground shadow-xs font-bold"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        🎯 Optimasi Konten Ini
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setSeoMode("ideas"); setOutputResult(""); }}
                                        className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                            seoMode === "ideas"
                                                ? "bg-background text-foreground shadow-xs font-bold"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        💡 Ide Topik &amp; Projek
                                    </button>
                                </div>
                            </div>
                        )}

                        {(activeTab === "excerpt" || (activeTab === "seo" && (seoMode === "optimize" || seoMode === "audit"))) && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-foreground">
                                    {activeTab === "seo" ? "Judul Halaman / Artikel (Opsional)" : "Judul Artikel / Projek (Opsional)"}
                                </label>
                                <input
                                    type="text"
                                    value={inputTitle}
                                    onChange={(e) => setInputTitle(e.target.value)}
                                    placeholder="Contoh: Merancang Arsitektur BGP Multihoming atau /projects/network-automation"
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
                                {activeTab === "seo" && seoMode === "audit" && "Fokus Halaman / Catatan Khusus (Biarkan kosong untuk audit seluruh website):"}
                                {activeTab === "seo" && seoMode === "optimize" && "Draf Konten / Teks yang Ingin Dioptimalkan:"}
                                {activeTab === "seo" && seoMode === "ideas" && "Preferensi Topik / Minat Khusus (Opsional):"}
                            </label>
                            <textarea
                                rows={activeTab === "seo" && (seoMode === "audit" || seoMode === "ideas") ? 3 : 4}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder={
                                    activeTab === "seo" && seoMode === "audit"
                                        ? "Kosongkan untuk mengaudit seluruh website, atau ketik topik/halaman tertentu yang ingin dianalisis..."
                                        : activeTab === "seo" && seoMode === "ideas"
                                        ? "Kosongkan untuk ide umum berdasarkan skill & projek Anda, atau ketik teknologi tertentu..."
                                        : "Ketik atau tempelkan teks di sini..."
                                }
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
                                            {activeTab === "seo" && seoMode === "audit" && "Jalankan Audit SEO Website"}
                                            {activeTab === "seo" && seoMode === "optimize" && "Optimasi SEO & Internal Links"}
                                            {activeTab === "seo" && seoMode === "ideas" && "Hasilkan Ide Konten & Projek"}
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
