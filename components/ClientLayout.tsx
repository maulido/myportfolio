"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { SessionProvider, useSession } from "next-auth/react";
import { Wrench, ExternalLink, Power } from "lucide-react";
import toast from "react-hot-toast";
import FloatingActionButton from "@/components/FAB";
import { Footer } from "@/components/Footer";
import MaintenanceView from "@/components/MaintenanceView";
import { GlobalSettings } from "@/lib/settings";
import { mutateSettingsCache } from "@/lib/useSettings";

// Lazy load non-critical floating components to optimize initial bundle size & FCP
const ChatWidget = dynamic(() => import("@/components/ChatWidget"), { ssr: false });
const DownloadCVModal = dynamic(() => import("@/components/DownloadCVModal"), { ssr: false });
const CommandPalette = dynamic(() => import("@/components/CommandPalette"), { ssr: false });

function ClientLayoutInner({
    children,
    settings,
}: {
    children: React.ReactNode;
    settings: GlobalSettings;
}) {
    const [isCVOpen, setIsCVOpen] = useState(false);
    const [isDisablingMaintenance, setIsDisablingMaintenance] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        const handleOpenCV = () => setIsCVOpen(true);
        window.addEventListener("open-cv-modal", handleOpenCV);
        return () => window.removeEventListener("open-cv-modal", handleOpenCV);
    }, []);

    const isAdminOrAuth = pathname?.startsWith("/admin") || pathname === "/login";
    const isMaintenancePage = pathname === "/maintenance";
    const isMaintenanceMode = settings.isMaintenanceMode === "true";

    // 1. Never block admin or auth routes
    if (isAdminOrAuth) {
        return (
            <>
                {children}
                <CommandPalette />
            </>
        );
    }

    // 2. Direct access to standalone maintenance page
    if (isMaintenancePage) {
        return <>{children}</>;
    }

    // 3. Maintenance mode active handling
    if (isMaintenanceMode) {
        // While session is loading, show a minimal loading placeholder so public users never see a flash of real content
        if (status === "loading") {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                </div>
            );
        }

        // If user is authenticated admin: enable Admin Preview Mode with actionable top banner
        if (status === "authenticated" && session?.user) {
            const handleDisableMaintenance = async () => {
                if (isDisablingMaintenance) return;
                setIsDisablingMaintenance(true);
                try {
                    const res = await fetch("/api/settings", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ key: "isMaintenanceMode", value: "false" }),
                    });
                    if (res.ok) {
                        mutateSettingsCache({ isMaintenanceMode: "false" });
                        toast.success("Maintenance Mode Disabled! Website is now live.");
                        router.refresh();
                    } else {
                        toast.error("Failed to disable maintenance mode");
                    }
                } catch (error) {
                    console.error("Failed to disable maintenance", error);
                    toast.error("An error occurred while updating status");
                } finally {
                    setIsDisablingMaintenance(false);
                }
            };

            return (
                <>
                    {/* Floating Admin Preview Alert Banner */}
                    <div className="sticky top-0 z-[100] w-full bg-amber-500 text-slate-950 px-4 py-2.5 text-xs font-bold flex flex-wrap items-center justify-between gap-3 shadow-md">
                        <div className="flex items-center gap-2">
                            <span className="p-1 rounded bg-slate-950/10">
                                <Wrench className="h-4 w-4 text-slate-950" />
                            </span>
                            <span>
                                ADMIN PREVIEW: Maintenance Mode is ON. Public visitors see the Maintenance Page.
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href="/maintenance"
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-950/10 hover:bg-slate-950/20 text-slate-950 transition-colors"
                            >
                                <span>Preview Maintenance View</span>
                                <ExternalLink className="h-3 w-3" />
                            </Link>
                            <button
                                onClick={handleDisableMaintenance}
                                disabled={isDisablingMaintenance}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 text-white hover:bg-slate-900 transition-all cursor-pointer disabled:opacity-50"
                            >
                                <Power className="h-3 w-3" />
                                <span>{isDisablingMaintenance ? "Disabling..." : "Go Live (Turn Off)"}</span>
                            </button>
                        </div>
                    </div>

                    {children}
                    <Footer settings={settings} />
                    <FloatingActionButton />
                    <ChatWidget />
                    <DownloadCVModal isOpen={isCVOpen} onClose={() => setIsCVOpen(false)} />
                    <CommandPalette />
                </>
            );
        }

        // Public visitor: Intercept and render Maintenance Page
        return <MaintenanceView settings={settings} />;
    }

    // 4. Normal live site rendering
    return (
        <>
            {children}
            <Footer settings={settings} />
            <FloatingActionButton />
            <ChatWidget />
            <DownloadCVModal isOpen={isCVOpen} onClose={() => setIsCVOpen(false)} />
            <CommandPalette />
        </>
    );
}

export default function ClientLayout({
    children,
    settings,
}: {
    children: React.ReactNode;
    settings: GlobalSettings;
}) {
    return (
        <SessionProvider>
            <ClientLayoutInner settings={settings}>
                {children}
            </ClientLayoutInner>
        </SessionProvider>
    );
}
