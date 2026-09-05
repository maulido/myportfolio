"use client";

import { Globe } from "lucide-react";

interface AdminLangTabsProps {
    activeTab: "en" | "id";
    onChange: (tab: "en" | "id") => void;
    label?: string;
}

export function AdminLangTabs({ activeTab, onChange, label }: AdminLangTabsProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/80 bg-muted/20">
            <div className="space-y-0.5">
                <div className="text-sm font-semibold flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    <span>{label || "Multilingual Content"}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                    Switch between English (primary) and Indonesian localization tabs.
                </p>
            </div>
            <div className="inline-flex p-1 rounded-lg border border-border/80 bg-background/80 shrink-0">
                <button
                    type="button"
                    onClick={() => onChange("en")}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeTab === "en"
                            ? "bg-primary text-white shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <span className="px-1 py-0.2 rounded bg-black/20 text-[10px]">EN</span>
                    <span>English</span>
                </button>
                <button
                    type="button"
                    onClick={() => onChange("id")}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeTab === "id"
                            ? "bg-primary text-white shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <span className="px-1 py-0.2 rounded bg-black/20 text-[10px]">ID</span>
                    <span>Indonesia</span>
                </button>
            </div>
        </div>
    );
}
