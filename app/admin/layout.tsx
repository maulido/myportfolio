"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, LogOut, Wrench, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminCommandPalette from "@/components/admin/AdminCommandPalette";
import DatabaseBackupModal from "@/components/admin/DatabaseBackupModal";
import AiAssistantModal from "@/components/admin/AiAssistantModal";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        let isMounted = true;
        fetch("/api/settings?key=isMaintenanceMode")
            .then((res) => res.json())
            .then((d) => {
                if (isMounted && d.success && (d.data === "true" || d.data === true)) {
                    setIsMaintenanceActive(true);
                }
            })
            .catch(() => {});

        return () => {
            isMounted = false;
        };
    }, []);

    if (status === "loading" || !session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Top Navigation */}
            <nav className="border-b border-primary/10 bg-card/20 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <LayoutDashboard className="h-6 w-6 text-primary" />
                        </div>
                        <span className="font-bold text-xl tracking-tighter">ADMIN<span className="text-primary">CORE</span></span>
                    </div>

                    {/* Quick Command Palette Trigger */}
                    <button
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
                        className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-background/80 border border-border/80 hover:border-primary/50 text-xs text-muted-foreground hover:text-foreground transition-all shadow-2xs cursor-pointer"
                        title="Tekan Ctrl+K atau Cmd+K untuk membuka"
                    >
                        <Search className="h-3.5 w-3.5 text-primary" />
                        <span>Cari menu / aksi cepat...</span>
                        <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-muted border border-border rounded-md text-foreground">
                            Ctrl K
                        </kbd>
                    </button>

                    <div className="flex items-center gap-3 sm:gap-4">
                        {/* Mobile Command Palette Trigger Button */}
                        <button
                            type="button"
                            onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
                            className="sm:hidden p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground"
                            title="Command Palette"
                        >
                            <Search className="h-4 w-4" />
                        </button>

                        {/* AI Assistant Quick Trigger */}
                        <button
                            type="button"
                            onClick={() => window.dispatchEvent(new CustomEvent("open-ai-assistant"))}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                            title="Buka AI Content Assistant"
                        >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span className="hidden md:inline">AI Assistant</span>
                        </button>

                        {isMaintenanceActive && (
                            <Link
                                href="/admin/settings"
                                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold animate-pulse hover:bg-rose-500/25 transition-colors"
                                title="Maintenance Mode is Active - Click to configure in Settings"
                            >
                                <Wrench className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Maintenance Mode Active</span>
                                <span className="sm:hidden">Maintenance</span>
                            </Link>
                        )}
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-bold text-foreground">{session?.user?.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Super Admin</span>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors border border-primary/10"
                            title="Sign Out"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content with Sidebar */}
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="grid gap-8 md:grid-cols-[250px_1fr]">
                    {/* Sidebar */}
                    <AdminSidebar />

                    {/* Content Area */}
                    <div className="w-full">
                        {children}
                    </div>
                </div>
            </main>

            {/* Global Admin Command Palette Modal */}
            <AdminCommandPalette />

            {/* Global Database Backup & Restore Modal */}
            <DatabaseBackupModal />

            {/* Global AI Content Assistant Modal */}
            <AiAssistantModal />
        </div>
    );
}
