"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    LayoutDashboard,
    FileText,
    Briefcase,
    Image as ImageIcon,
    Award,
    MessageCircle,
    Package,
    MessageSquare,
    FolderOpen,
    BarChart3,
    Settings,
    User,
    Inbox,
    MailCheck,
    Globe,
    HelpCircle,
    Wrench,
    Copy,
    PlusCircle,
    Download,
    Activity,
    Sparkles,
    Database,
    X
} from "lucide-react";
import toast from "react-hot-toast";

interface PaletteItem {
    id: string;
    title: string;
    subtitle: string;
    category: "Navigation" | "Quick Action";
    icon: React.ElementType;
    href?: string;
    action?: () => void | Promise<void>;
    keywords?: string[];
}

export default function AdminCommandPalette() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Close palette
    const closePalette = useCallback(() => {
        setIsOpen(false);
        setQuery("");
        setSelectedIndex(0);
    }, []);

    // Action: Copy active CV link
    const handleCopyCvLink = useCallback(async () => {
        try {
            const res = await fetch("/api/settings?key=resumeUrl");
            const data = await res.json();
            const cvUrl = data.data || "/cv.pdf";
            await navigator.clipboard.writeText(
                cvUrl.startsWith("http") ? cvUrl : `${window.location.origin}${cvUrl}`
            );
            toast.success("Tautan CV aktif berhasil disalin!");
        } catch {
            toast.error("Gagal menyalin tautan CV");
        }
    }, []);

    // Action: Toggle Maintenance Mode
    const handleToggleMaintenance = useCallback(async () => {
        try {
            const currentRes = await fetch("/api/settings?key=isMaintenanceMode");
            const currentData = await currentRes.json();
            const currentVal = currentData.data === "true" || currentData.data === true;
            const nextVal = !currentVal;

            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    settings: { isMaintenanceMode: String(nextVal) }
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(
                    nextVal
                        ? "Mode Pemeliharaan (Maintenance) AKTIF!"
                        : "Mode Pemeliharaan (Maintenance) DINONAKTIFKAN!"
                );
                window.location.reload();
            } else {
                toast.error(data.error || "Gagal mengubah mode maintenance");
            }
        } catch {
            toast.error("Terjadi kesalahan jaringan");
        }
    }, []);

    // Action: Export Database Backup
    const handleDownloadBackup = useCallback(() => {
        toast.loading("Mempersiapkan cadangan database...", { id: "backup-toast" });
        window.location.href = "/api/admin/backup/export";
        setTimeout(() => {
            toast.success("Unduhan cadangan database dimulai!", { id: "backup-toast" });
        }, 1200);
    }, []);

    // Palette Items
    const items: PaletteItem[] = useMemo(() => [
        // Quick Actions
        {
            id: "act-new-post",
            title: "Buat Blog Post Baru",
            subtitle: "Tulis artikel atau tutorial rekayasa baru",
            category: "Quick Action",
            icon: PlusCircle,
            href: "/admin/posts/new",
            keywords: ["tulis", "artikel", "blog", "write", "post", "create"]
        },
        {
            id: "act-new-project",
            title: "Tambah Proyek Baru",
            subtitle: "Publikasikan arsitektur atau portofolio baru",
            category: "Quick Action",
            icon: PlusCircle,
            href: "/admin/projects/new",
            keywords: ["tambah", "proyek", "project", "portofolio", "create"]
        },
        {
            id: "act-toggle-maintenance",
            title: "Toggle Maintenance Mode",
            subtitle: "Nyalakan atau matikan halaman pemeliharaan situs",
            category: "Quick Action",
            icon: Wrench,
            action: handleToggleMaintenance,
            keywords: ["maintenance", "pemeliharaan", "toggle", "offline", "status"]
        },
        {
            id: "act-copy-cv",
            title: "Salin Tautan CV Aktif",
            subtitle: "Salin URL berkas resume/CV ke clipboard",
            category: "Quick Action",
            icon: Copy,
            action: handleCopyCvLink,
            keywords: ["cv", "resume", "salin", "copy", "download", "pdf"]
        },
        {
            id: "act-gemini-ai",
            title: "Gemini AI Content Assistant",
            subtitle: "Bilingual translator, smart excerpt generator & tone polisher",
            category: "Quick Action",
            icon: Sparkles,
            action: () => window.dispatchEvent(new CustomEvent("open-ai-assistant")),
            keywords: ["ai", "gemini", "translate", "terjemah", "bilingual", "excerpt", "seo", "polish", "content"]
        },
        {
            id: "act-backup-modal",
            title: "Database Disaster Recovery & Restore",
            subtitle: "Buka alat pencadangan & pemulihan 15 koleksi MongoDB",
            category: "Quick Action",
            icon: Database,
            action: () => window.dispatchEvent(new CustomEvent("open-backup-modal")),
            keywords: ["backup", "restore", "database", "json", "pulihkan", "cadangan", "recovery"]
        },
        {
            id: "act-backup-export",
            title: "Download Backup Database (JSON)",
            subtitle: "Ekspor langsung seluruh koleksi data situs ke format berkas JSON",
            category: "Quick Action",
            icon: Download,
            action: handleDownloadBackup,
            keywords: ["backup", "cadangan", "export", "ekspor", "json", "database"]
        },
        {
            id: "act-health-check",
            title: "Cek Status Sistem & Latensi Server",
            subtitle: "Buka telemetri infrastruktur jaringan dan server",
            category: "Quick Action",
            icon: Activity,
            href: "/admin#system-health-section",
            keywords: ["health", "status", "ping", "latency", "server", "telemetri"]
        },

        // Navigation
        {
            id: "nav-dashboard",
            title: "Dashboard Overview",
            subtitle: "Ringkasan statistik, analitik, dan status situs",
            category: "Navigation",
            icon: LayoutDashboard,
            href: "/admin",
            keywords: ["home", "dashboard", "utama", "beranda"]
        },
        {
            id: "nav-posts",
            title: "Blog Posts Manager",
            subtitle: "Kelola seluruh publikasi dan artikel blog",
            category: "Navigation",
            icon: FileText,
            href: "/admin/posts",
            keywords: ["artikel", "blog", "posts", "publikasi", "tulisan"]
        },
        {
            id: "nav-projects",
            title: "Projects Manager",
            subtitle: "Kelola portofolio dan proyek rekayasa",
            category: "Navigation",
            icon: Briefcase,
            href: "/admin/projects",
            keywords: ["project", "proyek", "karya", "showcase"]
        },
        {
            id: "nav-gallery",
            title: "Gallery Manager",
            subtitle: "Foto kegiatan, setup, dan dokumentasi",
            category: "Navigation",
            icon: ImageIcon,
            href: "/admin/gallery",
            keywords: ["galeri", "gallery", "foto", "photo", "images"]
        },
        {
            id: "nav-certifications",
            title: "Certifications",
            subtitle: "Sertifikasi resmi, lisensi, dan kredensial",
            category: "Navigation",
            icon: Award,
            href: "/admin/certifications",
            keywords: ["sertifikat", "certificate", "license", "cisco", "aws"]
        },
        {
            id: "nav-testimonials",
            title: "Testimonials",
            subtitle: "Ulasan dan testimoni dari klien / rekan kerja",
            category: "Navigation",
            icon: MessageCircle,
            href: "/admin/testimonials",
            keywords: ["testimoni", "review", "feedback"]
        },
        {
            id: "nav-career",
            title: "Career Journey",
            subtitle: "Riwayat pengalaman kerja dan jenjang karier",
            category: "Navigation",
            icon: Briefcase,
            href: "/admin/career",
            keywords: ["karier", "career", "kerja", "pengalaman", "experience"]
        },
        {
            id: "nav-skills",
            title: "Technical Skills",
            subtitle: "Daftar keahlian teknis jaringan dan pemrograman",
            category: "Navigation",
            icon: Award,
            href: "/admin/skills",
            keywords: ["skills", "keahlian", "kemampuan", "tech"]
        },
        {
            id: "nav-faqs",
            title: "FAQs Manager",
            subtitle: "Pertanyaan umum dan klarifikasi konsultasi",
            category: "Navigation",
            icon: HelpCircle,
            href: "/admin/faqs",
            keywords: ["faq", "tanya", "jawab", "pertanyaan"]
        },
        {
            id: "nav-uses",
            title: "Uses & Setup Equipment",
            subtitle: "Daftar perangkat keras, software, dan desk setup",
            category: "Navigation",
            icon: Package,
            href: "/admin/uses",
            keywords: ["uses", "setup", "gear", "hardware", "software"]
        },
        {
            id: "nav-guestbook",
            title: "Guestbook Signatures",
            subtitle: "Moderasi dan kelola tanda tangan buku tamu",
            category: "Navigation",
            icon: MessageSquare,
            href: "/admin/guestbook",
            keywords: ["buku tamu", "guestbook", "tanda tangan", "pesan"]
        },
        {
            id: "nav-messages",
            title: "Inquiries & Contact Messages",
            subtitle: "Pesan masuk formulir kontak dari pengunjung",
            category: "Navigation",
            icon: Inbox,
            href: "/admin/messages",
            keywords: ["inbox", "pesan", "contact", "kontak", "inquiries"]
        },
        {
            id: "nav-subscribers",
            title: "Newsletter Subscribers",
            subtitle: "Daftar pelanggan newsletter dan broadcast email",
            category: "Navigation",
            icon: MailCheck,
            href: "/admin/subscribers",
            keywords: ["subscriber", "langganan", "newsletter", "broadcast", "email"]
        },
        {
            id: "nav-media",
            title: "Media Library",
            subtitle: "Katalog file gambar dan dokumen CDN terpusat",
            category: "Navigation",
            icon: FolderOpen,
            href: "/admin/media",
            keywords: ["media", "library", "upload", "gambar", "pdf", "file"]
        },
        {
            id: "nav-seo",
            title: "SEO Simulator",
            subtitle: "Simulasi meta tag pencarian dan preview media sosial",
            category: "Navigation",
            icon: Globe,
            href: "/admin/seo",
            keywords: ["seo", "meta", "google", "preview", "sharing"]
        },
        {
            id: "nav-analytics",
            title: "Analytics Dashboard",
            subtitle: "Statistik pengunjung, page views, dan geolokasi",
            category: "Navigation",
            icon: BarChart3,
            href: "/admin/analytics",
            keywords: ["analitik", "analytics", "traffic", "pengunjung", "stats"]
        },
        {
            id: "nav-profile",
            title: "Admin Profile",
            subtitle: "Ubah profil admin dan kata sandi akun",
            category: "Navigation",
            icon: User,
            href: "/admin/profile",
            keywords: ["profil", "profile", "password", "akun", "admin"]
        },
        {
            id: "nav-settings",
            title: "Site Settings",
            subtitle: "Konfigurasi global, telegram bot, CV, dan maintenance",
            category: "Navigation",
            icon: Settings,
            href: "/admin/settings",
            keywords: ["settings", "pengaturan", "konfigurasi", "telegram", "cv"]
        }
    ], [handleCopyCvLink, handleDownloadBackup, handleToggleMaintenance]);

    // Filter items based on query
    const filteredItems = useMemo(() => {
        if (!query.trim()) return items;
        const q = query.toLowerCase();
        return items.filter(item => {
            const matchTitle = item.title.toLowerCase().includes(q);
            const matchSubtitle = item.subtitle.toLowerCase().includes(q);
            const matchKeywords = item.keywords?.some(k => k.toLowerCase().includes(q));
            return matchTitle || matchSubtitle || matchKeywords;
        });
    }, [items, query]);

    const executeItem = useCallback((item: PaletteItem) => {
        closePalette();
        if (item.href) {
            router.push(item.href);
        } else if (item.action) {
            item.action();
        }
    }, [closePalette, router]);

    // Keyboard navigation & global shortcuts listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Open on Ctrl+K or Cmd+K
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setIsOpen(prev => !prev);
                return;
            }

            // Custom event listener trigger
            if (!isOpen) return;

            if (e.key === "Escape") {
                e.preventDefault();
                closePalette();
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
            } else if (e.key === "Enter") {
                e.preventDefault();
                const selected = filteredItems[selectedIndex];
                if (selected) {
                    executeItem(selected);
                }
            }
        };

        const handleCustomOpen = () => setIsOpen(true);

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("open-command-palette", handleCustomOpen);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("open-command-palette", handleCustomOpen);
        };
    }, [isOpen, filteredItems, selectedIndex, closePalette, executeItem]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm">
                    {/* Backdrop click to close */}
                    <div className="fixed inset-0" onClick={closePalette} />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="relative w-full max-w-xl rounded-3xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col z-10"
                    >
                        {/* Search Input Bar */}
                        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-background/60">
                            <Search className="h-5 w-5 text-primary shrink-0" />
                            <input
                                autoFocus
                                type="text"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setSelectedIndex(0);
                                }}
                                placeholder="Ketik perintah atau cari halaman... (cth: 'cv', 'post', 'backup')"
                                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setQuery("");
                                        setSelectedIndex(0);
                                    }}
                                    className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold bg-muted border border-border rounded-lg text-muted-foreground">
                                ESC
                            </kbd>
                        </div>

                        {/* Results List */}
                        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
                            {filteredItems.length === 0 ? (
                                <div className="py-12 text-center text-xs text-muted-foreground space-y-1">
                                    <Search className="h-6 w-6 mx-auto text-muted-foreground/40 mb-2" />
                                    <p className="font-semibold text-foreground">Perintah tidak ditemukan</p>
                                    <p>Coba kata kunci lain seperti &quot;proyek&quot;, &quot;maintenance&quot;, atau &quot;media&quot;.</p>
                                </div>
                            ) : (
                                filteredItems.map((item, idx) => {
                                    const isSelected = idx === selectedIndex;
                                    const Icon = item.icon;
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => executeItem(item)}
                                            onMouseEnter={() => setSelectedIndex(idx)}
                                            className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl cursor-pointer transition-all ${
                                                isSelected
                                                    ? "bg-primary text-white shadow-sm"
                                                    : "hover:bg-muted/60 text-foreground"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`p-2 rounded-xl shrink-0 ${
                                                    isSelected
                                                        ? "bg-white/20 text-white"
                                                        : item.category === "Quick Action"
                                                            ? "bg-primary/10 text-primary"
                                                            : "bg-muted text-muted-foreground"
                                                }`}>
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={`text-xs font-bold truncate ${isSelected ? "text-white" : "text-foreground"}`}>
                                                        {item.title}
                                                    </p>
                                                    <p className={`text-[11px] truncate ${isSelected ? "text-white/80" : "text-muted-foreground"}`}>
                                                        {item.subtitle}
                                                    </p>
                                                </div>
                                            </div>

                                            <span className={`text-[10px] px-2 py-0.5 rounded-md shrink-0 font-semibold uppercase ${
                                                isSelected
                                                    ? "bg-white/20 text-white"
                                                    : "bg-muted/80 text-muted-foreground"
                                            }`}>
                                                {item.category === "Quick Action" ? "Aksi" : "Menu"}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer Tips */}
                        <div className="px-4 py-2.5 border-t border-border bg-muted/30 flex items-center justify-between text-[11px] text-muted-foreground">
                            <div className="flex items-center gap-3">
                                <span><kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px] font-mono">↑</kbd> <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px] font-mono">↓</kbd> Navigasi</span>
                                <span><kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px] font-mono">↵</kbd> Jalankan</span>
                            </div>
                            <span>{filteredItems.length} opsi tersedia</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
