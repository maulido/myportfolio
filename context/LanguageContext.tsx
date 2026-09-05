"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { en, TranslationDictionary } from "@/locales/en";
import { id } from "@/locales/id";

export type Language = "en" | "id";

interface LanguageContextType {
    locale: Language;
    setLocale: (lang: Language) => void;
    toggleLocale: () => void;
    t: (path: string, fallback?: string) => string;
    dictionary: TranslationDictionary;
    mounted: boolean;
}

const dictionaries: Record<Language, TranslationDictionary> = {
    en,
    id,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    // Deterministic initial state: always start with 'en' to guarantee identical SSR & initial client hydration
    const [locale, setLocaleState] = useState<Language>("en");
    const [mounted, setMounted] = useState(false);

    // Sync saved preference from URL query param, localStorage, or cookie strictly AFTER hydration
    useEffect(() => {
        setMounted(true);

        try {
            // Priority 1: Check URL search query param (e.g. ?lang=id)
            const urlParams = new URLSearchParams(window.location.search);
            const queryLang = urlParams.get("lang") as Language | null;
            if (queryLang === "en" || queryLang === "id") {
                setLocaleState(queryLang);
                return;
            }

            // Priority 2: Saved user preference in localStorage
            const savedLang = localStorage.getItem("portfolio_lang") as Language | null;
            if (savedLang === "en" || savedLang === "id") {
                setLocaleState(savedLang);
                return;
            }

            // Priority 3: Saved user cookie
            const cookieMatch = document.cookie.match(/(?:^|;\s*)portfolio_lang=([^;]+)/);
            if (cookieMatch && (cookieMatch[1] === "en" || cookieMatch[1] === "id")) {
                setLocaleState(cookieMatch[1] as Language);
                return;
            }
        } catch {
            // Silently handle any storage/browser restrictions
        }
    }, []);

    // Sync document element, localStorage, and cookie whenever locale changes (only after mount)
    useEffect(() => {
        if (!mounted) return;
        try {
            document.documentElement.lang = locale;
            localStorage.setItem("portfolio_lang", locale);
            document.cookie = `portfolio_lang=${locale}; path=/; max-age=31536000; SameSite=Lax`;
        } catch {
            // Silently handle storage errors
        }
    }, [locale, mounted]);

    const setLocale = useCallback((newLocale: Language) => {
        setLocaleState(newLocale);
        try {
            if (typeof window !== "undefined") {
                localStorage.setItem("portfolio_lang", newLocale);
                document.cookie = `portfolio_lang=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
                document.documentElement.lang = newLocale;
            }
        } catch {
            // Ignore
        }
    }, []);

    const toggleLocale = useCallback(() => {
        setLocaleState((prev) => {
            const next = prev === "en" ? "id" : "en";
            try {
                if (typeof window !== "undefined") {
                    localStorage.setItem("portfolio_lang", next);
                    document.cookie = `portfolio_lang=${next}; path=/; max-age=31536000; SameSite=Lax`;
                    document.documentElement.lang = next;
                }
            } catch {
                // Ignore
            }
            return next;
        });
    }, []);

    // Translate helper function using dot notation e.g. "nav.home"
    const t = useCallback((path: string, fallback?: string): string => {
        const dict = dictionaries[locale] || en;
        const keys = path.split(".");
        let current: unknown = dict;

        for (const key of keys) {
            if (current && typeof current === "object" && key in current) {
                current = (current as Record<string, unknown>)[key];
            } else {
                return fallback || path;
            }
        }

        return typeof current === "string" ? current : (fallback || path);
    }, [locale]);

    return (
        <LanguageContext.Provider
            value={{
                locale,
                setLocale,
                toggleLocale,
                t,
                dictionary: dictionaries[locale] || en,
                mounted,
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
