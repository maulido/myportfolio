"use client";

import { useEffect, useState } from "react";
import FloatingActionButton from "@/components/FAB";
import ChatWidget from "@/components/ChatWidget";
import DownloadCVModal from "@/components/DownloadCVModal";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [isCVOpen, setIsCVOpen] = useState(false);

    useEffect(() => {
        const handleOpenCV = () => setIsCVOpen(true);
        window.addEventListener("open-cv-modal", handleOpenCV);
        return () => window.removeEventListener("open-cv-modal", handleOpenCV);
    }, []);

    return (
        <>
            {children}
            <FloatingActionButton />
            <ChatWidget />
            <DownloadCVModal isOpen={isCVOpen} onClose={() => setIsCVOpen(false)} />
        </>
    );
}
