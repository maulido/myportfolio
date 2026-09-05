"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";

export function LanguageToggle() {
    const { locale, toggleLocale } = useLanguage();

    return (
        <button
            onClick={toggleLocale}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-border/80 bg-card/60 hover:bg-muted/60 text-muted-foreground hover:text-foreground text-xs font-semibold transition-all shadow-2xs group"
            aria-label={`Switch language. Current language is ${locale === "en" ? "English" : "Bahasa Indonesia"}`}
            title={`Switch to ${locale === "en" ? "Bahasa Indonesia" : "English"}`}
        >
            <Globe className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span suppressHydrationWarning className="font-mono text-[11px] uppercase tracking-wider text-foreground">
                {locale}
            </span>
        </button>
    );
}
