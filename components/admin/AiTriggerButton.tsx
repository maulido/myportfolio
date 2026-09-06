"use client";

import { Sparkles } from "lucide-react";

interface AiTriggerButtonProps {
    tab?: "translate" | "excerpt" | "tags" | "improve" | "seo";
    seoMode?: "audit" | "optimize" | "ideas";
    text?: string;
    title?: string;
    label?: string;
    className?: string;
    targetField?: string;
}

export default function AiTriggerButton({
    tab = "translate",
    seoMode,
    text,
    title,
    label = "AI Assistant",
    className = "",
    targetField
}: AiTriggerButtonProps) {
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        window.dispatchEvent(
            new CustomEvent("open-ai-assistant", {
                detail: { tab, seoMode, text, title, targetField }
            })
        );
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 transition-all cursor-pointer shadow-2xs ${className}`}
            title="Buka AI Assistant untuk bidang ini"
        >
            <Sparkles className="h-3 w-3" />
            <span>{label}</span>
        </button>
    );
}
