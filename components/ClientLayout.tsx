"use client";

import { useEffect, useState } from "react";
import FloatingActionButton from "@/components/FAB";
import ChatWidget from "@/components/ChatWidget";
import DownloadCVModal from "@/components/DownloadCVModal";

import { Footer } from "@/components/Footer";
import { GlobalSettings } from "@/lib/settings";

export default function ClientLayout({ children, settings }: { children: React.ReactNode, settings: GlobalSettings }) {
    const [isCVOpen, setIsCVOpen] = useState(false);

    useEffect(() => {
        const handleOpenCV = () => setIsCVOpen(true);
        window.addEventListener("open-cv-modal", handleOpenCV);
        return () => window.removeEventListener("open-cv-modal", handleOpenCV);
    }, []);

    return (
        <>
            {children}
            <Footer settings={settings} />
            <FloatingActionButton />
            <ChatWidget />
            <DownloadCVModal isOpen={isCVOpen} onClose={() => setIsCVOpen(false)} />
        </>
    );
}
