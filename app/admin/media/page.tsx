"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { 
    Trash2, 
    Copy, 
    ExternalLink, 
    Upload, 
    Link2, 
    Search, 
    X, 
    FileText, 
    Image as ImageIcon, 
    Loader2, 
    Check, 
    CheckSquare,
    RefreshCw, 
    FolderOpen 
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { UploadDropzone } from "@/lib/uploadthing";

interface MediaFile {
    _id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    tags?: string[];
    createdAt: string;
}

export default function AdminMediaPage() {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState<"all" | "image" | "pdf" | "other">("all");

    // Upload mode tab: "dropzone" | "url"
    const [uploadMode, setUploadMode] = useState<"dropzone" | "url">("dropzone");
    const [urlName, setUrlName] = useState("");
    const [urlLink, setUrlLink] = useState("");
    const [isRegisteringUrl, setIsRegisteringUrl] = useState(false);

    // Lightbox / detail modal
    const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    // Delete confirmation modal
    const [deleteTarget, setDeleteTarget] = useState<MediaFile | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Batch operations state
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBatchDeleting, setIsBatchDeleting] = useState(false);
    const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/media");
            const data = await response.json();
            if (data.success && Array.isArray(data.data)) {
                setFiles(data.data);
            } else {
                toast.error(data.error || "Failed to load media files.");
            }
        } catch {
            toast.error("Network error while loading media library.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/media/${deleteTarget._id}`, {
                method: "DELETE"
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setFiles(prev => prev.filter(f => f._id !== deleteTarget._id));
                toast.success("File deleted successfully");
                setDeleteTarget(null);
                if (selectedMedia?._id === deleteTarget._id) {
                    setSelectedMedia(null);
                }
            } else {
                toast.error(data.error || "Failed to delete file");
            }
        } catch {
            toast.error("Network error deleting file");
        } finally {
            setIsDeleting(false);
        }
    };

    const toggleSelect = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === filteredFiles.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredFiles.map(f => f._id));
        }
    };

    const handleBatchDelete = async () => {
        if (selectedIds.length === 0) return;
        setIsBatchDeleting(true);
        try {
            const response = await fetch("/api/media", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: selectedIds })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setFiles(prev => prev.filter(f => !selectedIds.includes(f._id)));
                toast.success(`${data.deletedCount || selectedIds.length} files deleted successfully`);
                setSelectedIds([]);
                setShowBatchDeleteConfirm(false);
                if (selectedMedia && selectedIds.includes(selectedMedia._id)) {
                    setSelectedMedia(null);
                }
            } else {
                toast.error(data.error || "Failed to delete selected files");
            }
        } catch {
            toast.error("Network error deleting files");
        } finally {
            setIsBatchDeleting(false);
        }
    };

    const handleCopySelectedUrls = () => {
        const urls = files
            .filter(f => selectedIds.includes(f._id))
            .map(f => f.fileUrl)
            .join("\n");
        navigator.clipboard.writeText(urls);
        toast.success(`Copied ${selectedIds.length} URLs to clipboard!`);
    };

    const handleRegisterUrl = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!urlName.trim() || !urlLink.trim()) {
            toast.error("Please enter both file name and valid URL.");
            return;
        }

        setIsRegisteringUrl(true);
        try {
            const isPdf = urlLink.toLowerCase().includes(".pdf");
            const payload = {
                fileName: urlName.trim(),
                fileUrl: urlLink.trim(),
                fileSize: 1024 * 512, // Default 512 KB placeholder
                fileType: isPdf ? "pdf" : "image",
                tags: ["external-cdn"]
            };

            const response = await fetch("/api/media", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (response.ok && data.success) {
                toast.success("External asset registered successfully!");
                setUrlName("");
                setUrlLink("");
                fetchFiles();
            } else {
                toast.error(data.error || "Failed to register URL.");
            }
        } catch {
            toast.error("Network error registering URL.");
        } finally {
            setIsRegisteringUrl(false);
        }
    };

    const copyUrl = (url: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        toast.success("CDN URL copied to clipboard!");
        setTimeout(() => setCopiedUrl(null), 2500);
    };

    const formatFileSize = (bytes: number) => {
        if (!bytes || bytes === 0) return "0 B";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    };

    // Filtered files
    const filteredFiles = useMemo(() => {
        return files.filter(file => {
            const matchesSearch = file.fileName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType =
                selectedType === "all" ? true :
                selectedType === "image" ? file.fileType === "image" :
                selectedType === "pdf" ? file.fileType === "pdf" :
                file.fileType !== "image" && file.fileType !== "pdf";
            return matchesSearch && matchesType;
        });
    }, [files, searchTerm, selectedType]);

    const imageCount = files.filter(f => f.fileType === "image").length;
    const pdfCount = files.filter(f => f.fileType === "pdf").length;
    const otherCount = files.length - imageCount - pdfCount;

    return (
        <div className="space-y-8">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                        <FolderOpen className="h-7 w-7 text-primary" />
                        <span>Media Library & Assets</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Upload images, documents, and external assets with automatic CDN hosting and instant URL generation.
                    </p>
                </div>
                <button
                    onClick={fetchFiles}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold transition-all shadow-sm"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-primary" : ""}`} />
                    <span>Refresh Assets</span>
                </button>
            </div>

            {/* Upload Area Component */}
            <div className="rounded-3xl border border-border bg-card/70 backdrop-blur-md p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4 text-primary" />
                        <h2 className="font-bold text-sm text-foreground">Add New Assets</h2>
                    </div>

                    <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border">
                        <button
                            type="button"
                            onClick={() => setUploadMode("dropzone")}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                uploadMode === "dropzone" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            UploadDropzone
                        </button>
                        <button
                            type="button"
                            onClick={() => setUploadMode("url")}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                uploadMode === "url" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            External URL
                        </button>
                    </div>
                </div>

                {uploadMode === "dropzone" ? (
                    <div className="pt-2">
                        <UploadDropzone
                            endpoint="imageUploader"
                            onClientUploadComplete={async (res) => {
                                if (res && res.length > 0) {
                                    for (const file of res) {
                                        try {
                                            await fetch("/api/media", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                    fileName: file.name,
                                                    fileUrl: file.url,
                                                    fileSize: file.size || 1024 * 100,
                                                    fileType: file.name.endsWith(".pdf") ? "pdf" : "image",
                                                    tags: ["uploadthing"]
                                                })
                                            });
                                        } catch (err) {
                                            console.error("Error saving media record:", err);
                                        }
                                    }
                                    toast.success("Assets uploaded and saved to library!");
                                    fetchFiles();
                                }
                            }}
                            onUploadError={(error: Error) => {
                                toast.error(`Upload error: ${error.message}`);
                            }}
                            appearance={{
                                container: "border-2 border-dashed border-border/80 hover:border-primary/50 bg-background/50 rounded-2xl p-6 transition-colors",
                                label: "text-xs font-semibold text-primary hover:underline",
                                button: "bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-primary/20",
                                allowedContent: "text-[11px] text-muted-foreground"
                            }}
                        />
                    </div>
                ) : (
                    <form onSubmit={handleRegisterUrl} className="pt-2 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-foreground">Asset Name / Title</label>
                                <input
                                    type="text"
                                    required
                                    value={urlName}
                                    onChange={(e) => setUrlName(e.target.value)}
                                    placeholder="e.g. Architecture Diagram or Profile Photo"
                                    className="w-full h-10 px-3.5 rounded-xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-foreground">Direct Image / PDF URL</label>
                                <input
                                    type="url"
                                    required
                                    value={urlLink}
                                    onChange={(e) => setUrlLink(e.target.value)}
                                    placeholder="https://images.unsplash.com/... or https://cdn.example.com/file.jpg"
                                    className="w-full h-10 px-3.5 rounded-xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isRegisteringUrl}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/25 disabled:opacity-60"
                            >
                                {isRegisteringUrl ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Registering...</span>
                                    </>
                                ) : (
                                    <>
                                        <Link2 className="h-4 w-4" />
                                        <span>Register Asset</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 rounded-2xl bg-card/70 backdrop-blur-md border border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search media files by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 rounded-xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 transition-all outline-none"
                        />
                    </div>

                    {filteredFiles.length > 0 && (
                        <button
                            type="button"
                            onClick={handleSelectAll}
                            className={`px-3 h-10 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                                selectedIds.length === filteredFiles.length && filteredFiles.length > 0
                                    ? "bg-primary text-white border-primary shadow-xs"
                                    : "bg-card border-border text-foreground hover:bg-muted"
                            }`}
                        >
                            <CheckSquare className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">
                                {selectedIds.length === filteredFiles.length ? "Deselect All" : "Select All"}
                            </span>
                            <span className="sm:hidden">
                                {selectedIds.length === filteredFiles.length ? "Clear" : "All"}
                            </span>
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <button
                        onClick={() => setSelectedType("all")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                            selectedType === "all"
                                ? "bg-primary text-white border-primary shadow-sm"
                                : "bg-card text-muted-foreground border-border hover:bg-muted"
                        }`}
                    >
                        All ({files.length})
                    </button>
                    <button
                        onClick={() => setSelectedType("image")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                            selectedType === "image"
                                ? "bg-primary text-white border-primary shadow-sm"
                                : "bg-card text-muted-foreground border-border hover:bg-muted"
                        }`}
                    >
                        Images ({imageCount})
                    </button>
                    <button
                        onClick={() => setSelectedType("pdf")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                            selectedType === "pdf"
                                ? "bg-primary text-white border-primary shadow-sm"
                                : "bg-card text-muted-foreground border-border hover:bg-muted"
                        }`}
                    >
                        PDFs ({pdfCount})
                    </button>
                    <button
                        onClick={() => setSelectedType("other")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                            selectedType === "other"
                                ? "bg-primary text-white border-primary shadow-sm"
                                : "bg-card text-muted-foreground border-border hover:bg-muted"
                        }`}
                    >
                        Other ({otherCount})
                    </button>
                </div>
            </div>

            {/* Media Grid */}
            {loading ? (
                <div className="p-16 text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="text-xs text-muted-foreground">Loading media assets...</p>
                </div>
            ) : filteredFiles.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-border rounded-3xl bg-card/40 p-8 space-y-2">
                    <FolderOpen className="h-10 w-10 mx-auto text-muted-foreground opacity-40" />
                    <h3 className="text-base font-bold text-foreground">No media files found</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        {searchTerm ? "No files matched your search term." : "Your media library is empty. Use the upload area above to add your first asset."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {filteredFiles.map((file) => (
                        <div
                            key={file._id}
                            onClick={() => setSelectedMedia(file)}
                            className={`group relative flex flex-col justify-between rounded-2xl border bg-card/60 backdrop-blur-md p-3.5 transition-all duration-300 hover:shadow-lg cursor-pointer space-y-3 ${
                                selectedIds.includes(file._id)
                                    ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                                    : "border-border/80 hover:border-primary/50"
                            }`}
                        >
                            {/* Checkbox Selector Button */}
                            <button
                                type="button"
                                onClick={(e) => toggleSelect(file._id, e)}
                                className={`absolute top-5 left-5 z-20 p-1.5 rounded-lg border transition-all cursor-pointer shadow-xs ${
                                    selectedIds.includes(file._id)
                                        ? "bg-primary text-white border-primary"
                                        : "bg-black/60 text-white/80 border-white/30 hover:bg-black/90 opacity-0 group-hover:opacity-100"
                                }`}
                                title={selectedIds.includes(file._id) ? "Batalkan pilihan file" : "Pilih file untuk aksi massal"}
                            >
                                <Check className={`h-3 w-3 ${selectedIds.includes(file._id) ? "opacity-100" : "opacity-0"}`} />
                            </button>

                            {/* Preview Box */}
                            {file.fileType === "image" ? (
                                <div className="relative w-full h-40 rounded-xl overflow-hidden bg-muted border border-border/40">
                                    <Image
                                        src={file.fileUrl}
                                        alt={file.fileName}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        sizes="(max-width: 768px) 100vw, 25vw"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                    <span className="absolute bottom-2 left-2 text-[10px] font-mono text-white/90 bg-black/60 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        Click to inspect
                                    </span>
                                </div>
                            ) : (
                                <div className="w-full h-40 rounded-xl bg-muted/60 border border-border/40 flex flex-col items-center justify-center gap-2 group-hover:bg-muted transition-colors">
                                    <FileText className="h-12 w-12 text-primary/70" />
                                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{file.fileType} document</span>
                                </div>
                            )}

                            {/* Info */}
                            <div className="space-y-1">
                                <p className="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors" title={file.fileName}>
                                    {file.fileName}
                                </p>
                                <p className="text-[11px] text-muted-foreground font-mono">
                                    {formatFileSize(file.fileSize)} • {new Date(file.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Card Actions Bar */}
                            <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                                <button
                                    type="button"
                                    onClick={(e) => copyUrl(file.fileUrl, e)}
                                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary h-8 px-2.5 transition-colors"
                                    title="Copy CDN Link"
                                >
                                    {copiedUrl === file.fileUrl ? (
                                        <>
                                            <Check className="h-3 w-3 text-emerald-500" />
                                            <span>Copied</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3 w-3" />
                                            <span>Copy Link</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteTarget(file);
                                    }}
                                    className="inline-flex items-center justify-center p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                    title="Delete file"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox / Asset Detail Modal */}
            <AnimatePresence>
                {selectedMedia && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-2xl rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-5 overflow-hidden"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-border">
                                <div className="flex items-center gap-2 min-w-0">
                                    <ImageIcon className="h-5 w-5 text-primary shrink-0" />
                                    <h3 className="font-bold text-sm sm:text-base text-foreground truncate">
                                        {selectedMedia.fileName}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setSelectedMedia(null)}
                                    className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted shrink-0"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Full Image Preview */}
                            {selectedMedia.fileType === "image" ? (
                                <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden bg-black/40 border border-border">
                                    <Image
                                        src={selectedMedia.fileUrl}
                                        alt={selectedMedia.fileName}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="w-full h-56 rounded-2xl bg-muted/40 border border-border flex flex-col items-center justify-center gap-3">
                                    <FileText className="h-16 w-16 text-primary/70" />
                                    <p className="text-xs text-muted-foreground font-mono">{selectedMedia.fileUrl}</p>
                                </div>
                            )}

                            {/* Metadata Matrix */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div className="p-3 rounded-xl bg-background border border-border/80 space-y-0.5">
                                    <span className="text-muted-foreground text-[10px] uppercase font-semibold">Format</span>
                                    <p className="font-bold text-foreground uppercase">{selectedMedia.fileType}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-background border border-border/80 space-y-0.5">
                                    <span className="text-muted-foreground text-[10px] uppercase font-semibold">File Size</span>
                                    <p className="font-bold text-foreground font-mono">{formatFileSize(selectedMedia.fileSize)}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-background border border-border/80 space-y-0.5 sm:col-span-2">
                                    <span className="text-muted-foreground text-[10px] uppercase font-semibold">Uploaded Date</span>
                                    <p className="font-bold text-foreground">{new Date(selectedMedia.createdAt).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Actions Bar */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                <button
                                    onClick={() => setDeleteTarget(selectedMedia)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                    Delete Asset
                                </button>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={selectedMedia.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted text-foreground transition-colors"
                                    >
                                        <span>Open Raw</span>
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                    <button
                                        onClick={() => copyUrl(selectedMedia.fileUrl)}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                                    >
                                        <Copy className="h-3.5 w-3.5" />
                                        <span>Copy URL</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4"
                        >
                            <div className="h-12 w-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
                                <Trash2 className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-foreground">Delete File?</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Are you sure you want to permanently delete <strong className="text-foreground">{deleteTarget.fileName}</strong>? Any pages referencing this URL will no longer be able to load it.
                                </p>
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setDeleteTarget(null)}
                                    className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted text-foreground"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={handleDelete}
                                    className="px-4 py-2.5 rounded-xl bg-destructive text-white text-xs font-bold hover:bg-destructive/90 transition-all shadow-md shadow-destructive/20 disabled:opacity-60"
                                >
                                    {isDeleting ? "Deleting..." : "Confirm Delete"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Batch Action Floating Toolbar */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-6 inset-x-4 max-w-xl mx-auto z-40 bg-card/95 backdrop-blur-md border border-primary/40 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3 text-xs"
                    >
                        <div className="flex items-center gap-2 font-bold text-foreground">
                            <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                            <span>{selectedIds.length} file{selectedIds.length > 1 ? "s" : ""} terpilih</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleCopySelectedUrls}
                                className="px-3 py-1.5 rounded-xl bg-background border border-border hover:bg-muted text-foreground font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <Copy className="h-3.5 w-3.5" />
                                <span>Salin URLs</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowBatchDeleteConfirm(true)}
                                className="px-3.5 py-1.5 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Hapus ({selectedIds.length})</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedIds([])}
                                className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                                title="Batal pilihan"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Batch Delete Confirmation Modal */}
            <AnimatePresence>
                {showBatchDeleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4"
                        >
                            <div className="h-12 w-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
                                <Trash2 className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-foreground">Hapus {selectedIds.length} File Sekaligus?</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Tindakan ini akan menghapus {selectedIds.length} file terpilih secara permanen dari database. Halaman yang merujuk pada URL file ini tidak akan dapat memuatnya lagi.
                                </p>
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowBatchDeleteConfirm(false)}
                                    className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted text-foreground cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    disabled={isBatchDeleting}
                                    onClick={handleBatchDelete}
                                    className="px-4 py-2.5 rounded-xl bg-destructive text-white text-xs font-bold hover:bg-destructive/90 transition-all shadow-md shadow-destructive/20 disabled:opacity-60 cursor-pointer"
                                >
                                    {isBatchDeleting ? "Menghapus..." : `Ya, Hapus ${selectedIds.length} File`}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
