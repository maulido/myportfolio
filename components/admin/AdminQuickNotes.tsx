"use client";

import { useState, useEffect, useRef } from "react";
import { StickyNote, Save, CheckCircle2, RotateCcw, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminQuickNotes() {
    const [notes, setNotes] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState(false);
    const [loading, setLoading] = useState(true);
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        let isMounted = true;
        const loadNotes = async () => {
            try {
                const res = await fetch("/api/settings?key=adminQuickNotes");
                const json = await res.json();
                if (isMounted && json.success && typeof json.data === "string") {
                    setNotes(json.data);
                }
            } catch (err) {
                console.error("Failed to load admin notes:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        loadNotes();
        return () => {
            isMounted = false;
        };
    }, []);

    const saveNotes = async (contentToSave: string) => {
        setIsSaving(true);
        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    key: "adminQuickNotes",
                    value: contentToSave
                })
            });
            const json = await res.json();
            if (json.success) {
                setIsDirty(false);
                const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                setLastSaved(timeStr);
            } else {
                toast.error("Gagal menyimpan catatan");
            }
        } catch {
            toast.error("Error saat menyimpan catatan");
        } finally {
            setIsSaving(false);
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setNotes(val);
        setIsDirty(true);

        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        // Debounce auto-save after 2 seconds of inactivity
        autoSaveTimerRef.current = setTimeout(() => {
            saveNotes(val);
        }, 2000);
    };

    const insertTemplate = (prefix: string) => {
        const next = notes ? `${notes}\n${prefix}` : prefix;
        setNotes(next);
        setIsDirty(true);
        saveNotes(next);
    };

    return (
        <div className="bg-card/90 dark:bg-card/50 backdrop-blur-md border border-border/80 dark:border-primary/10 rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full">
            <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                            <StickyNote className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm uppercase tracking-widest text-foreground">
                                Engineering Scratchpad
                            </h3>
                            <p className="text-[11px] text-muted-foreground">
                                Auto-saved persistent notes & quick tasks
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {lastSaved && !isDirty && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                Saved {lastSaved}
                            </span>
                        )}
                        {isDirty && (
                            <span className="text-[10px] text-amber-500 flex items-center gap-1 font-mono">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                                Unsaved changes...
                            </span>
                        )}
                        <button
                            onClick={() => saveNotes(notes)}
                            disabled={isSaving || !isDirty}
                            className="p-1.5 rounded-lg border border-border hover:bg-muted text-foreground transition-all disabled:opacity-40 cursor-pointer"
                            title="Simpan sekarang"
                        >
                            <Save className={`h-3.5 w-3.5 ${isSaving ? "animate-spin" : ""}`} />
                        </button>
                    </div>
                </div>

                {/* Quick Snippet Buttons */}
                <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
                    <button
                        type="button"
                        onClick={() => insertTemplate("• [ ] ")}
                        className="px-2 py-0.5 rounded-md bg-muted/60 hover:bg-muted text-[10px] font-medium text-foreground transition-colors cursor-pointer border border-border/40"
                    >
                        + Todo Item
                    </button>
                    <button
                        type="button"
                        onClick={() => insertTemplate(`## Log ${new Date().toISOString().split("T")[0]}:\n`)}
                        className="px-2 py-0.5 rounded-md bg-muted/60 hover:bg-muted text-[10px] font-medium text-foreground transition-colors cursor-pointer border border-border/40"
                    >
                        + Date Stamp
                    </button>
                    <button
                        type="button"
                        onClick={() => insertTemplate("📌 Network Config Note:\n- Host:\n- Port:\n- Status:\n")}
                        className="px-2 py-0.5 rounded-md bg-muted/60 hover:bg-muted text-[10px] font-medium text-foreground transition-colors cursor-pointer border border-border/40"
                    >
                        + Config Note
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            if (confirm("Kosongkan catatan scratchpad?")) {
                                setNotes("");
                                saveNotes("");
                            }
                        }}
                        className="ml-auto p-1 text-muted-foreground hover:text-rose-500 transition-colors"
                        title="Clear all notes"
                    >
                        <RotateCcw className="h-3 w-3" />
                    </button>
                </div>

                <textarea
                    value={notes}
                    onChange={handleTextChange}
                    placeholder={loading ? "Memuat catatan..." : "Tuliskan ide fitur, to-do list, catatan konfigurasi server, atau reminder pribadi di sini..."}
                    className="w-full h-44 p-3 rounded-xl bg-background/50 border border-border/70 text-xs font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none transition-all"
                />
            </div>

            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-primary" /> Markdown & plaintext format
                </span>
                <span>{notes.length} characters</span>
            </div>
        </div>
    );
}
