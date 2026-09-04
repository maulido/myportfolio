"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import FloatingActionButton from "@/components/FAB";
import { Footer } from "@/components/Footer";
import { GlobalSettings } from "@/lib/settings";

// Lazy load non-critical floating components to optimize initial bundle size & FCP
const ChatWidget = dynamic(() => import("@/components/ChatWidget"), { ssr: false });
const DownloadCVModal = dynamic(() => import("@/components/DownloadCVModal"), { ssr: false });
const CommandPalette = dynamic(() => import("@/components/CommandPalette"), { ssr: false });

export default function ClientLayout({ children, settings }: { children: React.ReactNode, settings: GlobalSettings }) {
    const [isCVOpen, setIsCVOpen] = useState(false);
    const pathname = usePathname();
    const isAdminOrAuth = pathname?.startsWith("/admin") || pathname === "/login";

    useEffect(() => {
        const handleOpenCV = () => setIsCVOpen(true);
        window.addEventListener("open-cv-modal", handleOpenCV);
        return () => window.removeEventListener("open-cv-modal", handleOpenCV);
    }, []);

    if (isAdminOrAuth) {
        return (
            <>
                {children}
                <CommandPalette />
            </>
        );
    }

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
