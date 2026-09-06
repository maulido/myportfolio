"use client";

import { useState, useEffect, useRef } from "react";
import { 
    Download, 
    Upload, 
    Database, 
    X, 
    CheckCircle2, 
    AlertTriangle, 
    FileText, 
    RefreshCw, 
    ShieldCheck, 
    Layers
} from "lucide-react";
import toast from "react-hot-toast";

interface BackupSummary {
    [key: string]: number;
}

interface BackupFileContent {
    version: string;
    exportedAt: string;
    system?: string;
    counts?: Record<string, number>;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    data?: Record<string, any[]>;
    /* eslint-enable @typescript-eslint/no-explicit-any */
}

export default function DatabaseBackupModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [restoreFile, setRestoreFile] = useState<File | null>(null);
    const [parsedBackup, setParsedBackup] = useState<BackupFileContent | null>(null);
    const [restoreMode, setRestoreMode] = useState<"upsert" | "replace">("upsert");
    const [restoreSuccessSummary, setRestoreSuccessSummary] = useState<BackupSummary | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener("open-backup-modal", handleOpen);
        return () => window.removeEventListener("open-backup-modal", handleOpen);
    }, []);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const res = await fetch("/api/admin/backup/export");
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Gagal mengunduh backup");
            }
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `portfolio-backup-${new Date().toISOString().split("T")[0]}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Database backup berhasil diunduh!");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error saat export backup");
        } finally {
            setIsExporting(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith(".json")) {
            toast.error("File harus berformat .json");
            return;
        }

        setRestoreFile(file);
        setRestoreSuccessSummary(null);

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                if (!json.data && !json.collections) {
                    throw new Error("Format backup tidak valid (data tidak ditemukan)");
                }
                setParsedBackup(json);
                toast.success("File backup valid dan siap dipulihkan");
            } catch {
                toast.error("File backup rusak atau format tidak valid");
                setParsedBackup(null);
                setRestoreFile(null);
            }
        };
        reader.readAsText(file);
    };

    const handleRestore = async () => {
        if (!parsedBackup) return;

        if (restoreMode === "replace") {
            const confirmed = window.confirm(
                "PERINGATAN: Mode 'Ganti Total' akan menghapus semua data saat ini dan menggantinya dengan isi file backup. Apakah Anda yakin ingin melanjutkan?"
            );
            if (!confirmed) return;
        }

        setIsRestoring(true);
        try {
            const res = await fetch("/api/admin/backup/restore", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    data: parsedBackup.data || parsedBackup,
                    mode: restoreMode
                })
            });

            const json = await res.json();
            if (json.success) {
                toast.success("Pemulihan database berhasil!");
                setRestoreSuccessSummary(json.summary);
                setParsedBackup(null);
                setRestoreFile(null);
            } else {
                toast.error(json.error || "Gagal melakukan restore");
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error saat restore");
        } finally {
            setIsRestoring(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl bg-card border border-border/90 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-border/80">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                            <Database className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <span>Database Disaster Recovery & Backup</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                    1-Click JSON
                                </span>
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Cadangkan dan pulihkan seluruh konten portofolio, media, sertifikat & pengaturan
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

                <div className="space-y-6">
                    {/* SECTION 1: EXPORT BACKUP */}
                    <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Download className="h-4 w-4 text-primary" />
                                    <span>Ekspor Backup Database Lengkap</span>
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                    Mengekspor 15 koleksi MongoDB (Artikel, Projek, Sertifikasi, Perjalanan Karir, Keahlian, FAQ, Galeri, Uses, Testimonial, Guestbook, Kontak, Newsletter, Media, dan Seluruh Pengaturan Situs) ke satu file JSON terstruktur.
                                </p>
                            </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                Siap diunduh langsung ke lokal komputer
                            </span>
                            <button
                                onClick={handleExport}
                                disabled={isExporting}
                                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50 shadow-md shadow-primary/20 cursor-pointer"
                            >
                                <Download className={`h-3.5 w-3.5 ${isExporting ? "animate-bounce" : ""}`} />
                                <span>{isExporting ? "Membuat Backup..." : "Download Backup JSON"}</span>
                            </button>
                        </div>
                    </div>

                    {/* SECTION 2: RESTORE BACKUP */}
                    <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 space-y-4">
                        <div>
                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <Upload className="h-4 w-4 text-amber-500" />
                                <span>Pulihkan / Restore dari File JSON</span>
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                Unggah file cadangan JSON yang pernah Anda unduh sebelumnya untuk memulihkan seluruh data portofolio.
                            </p>
                        </div>

                        {/* File Upload Input */}
                        <div className="flex items-center gap-3">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 rounded-xl bg-background border border-border text-foreground hover:bg-muted text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                            >
                                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{restoreFile ? "Ganti File Backup..." : "Pilih File Backup (.json)"}</span>
                            </button>
                            {restoreFile && (
                                <div className="text-xs font-mono text-muted-foreground truncate">
                                    {restoreFile.name} ({(restoreFile.size / 1024).toFixed(1)} KB)
                                </div>
                            )}
                        </div>

                        {/* File Inspection / Preview */}
                        {parsedBackup && (
                            <div className="p-4 rounded-xl bg-background border border-border/80 space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-foreground flex items-center gap-1.5">
                                        <Layers className="h-3.5 w-3.5 text-primary" />
                                        Ringkasan Konten Backup
                                    </span>
                                    <span className="text-[10px] font-mono text-muted-foreground">
                                        Dibuat: {parsedBackup.exportedAt ? new Date(parsedBackup.exportedAt).toLocaleString("id-ID") : "Unknown"}
                                    </span>
                                </div>

                                {parsedBackup.counts && (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                                        {Object.entries(parsedBackup.counts).map(([col, count]) => (
                                            <div key={col} className="p-1.5 rounded-lg bg-muted/60 border border-border/50 flex items-center justify-between">
                                                <span className="text-muted-foreground capitalize truncate">{col}</span>
                                                <span className="font-mono font-bold text-foreground">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Mode Selection */}
                                <div className="pt-2 border-t border-border/60 space-y-2">
                                    <label className="text-xs font-bold text-foreground block">
                                        Pilih Mode Pemulihan:
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                        <label className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                                            restoreMode === "upsert" 
                                                ? "border-primary bg-primary/5 text-foreground font-semibold" 
                                                : "border-border bg-background text-muted-foreground"
                                        }`}>
                                            <input
                                                type="radio"
                                                name="restoreMode"
                                                value="upsert"
                                                checked={restoreMode === "upsert"}
                                                onChange={() => setRestoreMode("upsert")}
                                                className="mt-0.5"
                                            />
                                            <div>
                                                <div className="font-bold text-xs text-foreground">Gabungkan / Upsert (Aman)</div>
                                                <div className="text-[10px] text-muted-foreground mt-0.5">
                                                    Memperbarui data yang cocok & menambahkan yang belum ada tanpa menghapus data baru.
                                                </div>
                                            </div>
                                        </label>

                                        <label className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                                            restoreMode === "replace" 
                                                ? "border-rose-500 bg-rose-500/5 text-foreground font-semibold" 
                                                : "border-border bg-background text-muted-foreground"
                                        }`}>
                                            <input
                                                type="radio"
                                                name="restoreMode"
                                                value="replace"
                                                checked={restoreMode === "replace"}
                                                onChange={() => setRestoreMode("replace")}
                                                className="mt-0.5"
                                            />
                                            <div>
                                                <div className="font-bold text-xs text-rose-600 dark:text-rose-400">Ganti Total (Clean Replace)</div>
                                                <div className="text-[10px] text-muted-foreground mt-0.5">
                                                    Menghapus koleksi saat ini dan menggantinya persis dengan data file backup.
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-end">
                                    <button
                                        onClick={handleRestore}
                                        disabled={isRestoring}
                                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                                    >
                                        <RefreshCw className={`h-3.5 w-3.5 ${isRestoring ? "animate-spin" : ""}`} />
                                        <span>{isRestoring ? "Sedang Memulihkan Database..." : "Jalankan Pemulihan Sekarang"}</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Restore Summary after success */}
                        {restoreSuccessSummary && (
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 space-y-2">
                                <div className="flex items-center gap-2 font-bold text-xs">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    <span>Database berhasil dipulihkan!</span>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 text-[11px] pt-1">
                                    {Object.entries(restoreSuccessSummary).map(([col, count]) => (
                                        <div key={col} className="p-1 rounded bg-background/50 flex items-center justify-between text-foreground">
                                            <span className="capitalize">{col}:</span>
                                            <span className="font-mono font-bold">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        <span>Selalu lakukan backup sebelum update besar database</span>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 rounded-xl bg-muted/80 hover:bg-muted text-foreground font-semibold text-xs transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
