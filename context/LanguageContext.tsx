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
}

const dictionaries: Record<Language, TranslationDictionary> = {
    en,
    id,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Language>(() => {
        if (typeof window !== "undefined") {
            // Priority 1: Check URL search query param (e.g. ?lang=id from alternate tags or shares)
            const urlParams = new URLSearchParams(window.location.search);
            const queryLang = urlParams.get("lang") as Language | null;
            if (queryLang === "en" || queryLang === "id") return queryLang;

            // Priority 2: Saved user preference in localStorage
            const savedLang = localStorage.getItem("portfolio_lang") as Language | null;
            if (savedLang === "en" || savedLang === "id") return savedLang;

            // Priority 3: Saved user cookie
            const cookieMatch = document.cookie.match(/(?:^|;\s*)portfolio_lang=([^;]+)/);
            if (cookieMatch && (cookieMatch[1] === "en" || cookieMatch[1] === "id")) {
                return cookieMatch[1] as Language;
            }
        }
        return "en";
    });

    useEffect(() => {
        // Sync with URL query parameter on mount if present
        if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search);
            const queryLang = urlParams.get("lang") as Language | null;
            if ((queryLang === "en" || queryLang === "id") && queryLang !== locale) {
                setLocaleState(queryLang);
            }
        }
    }, [locale]);

    useEffect(() => {
        document.documentElement.lang = locale;
        if (typeof window !== "undefined") {
            localStorage.setItem("portfolio_lang", locale);
            document.cookie = `portfolio_lang=${locale}; path=/; max-age=31536000; SameSite=Lax`;
        }
    }, [locale]);

    const setLocale = useCallback((newLocale: Language) => {
        setLocaleState(newLocale);
        if (typeof window !== "undefined") {
            localStorage.setItem("portfolio_lang", newLocale);
            document.cookie = `portfolio_lang=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
            document.documentElement.lang = newLocale;
        }
    }, []);

    const toggleLocale = useCallback(() => {
        const next = locale === "en" ? "id" : "en";
        setLocale(next);
    }, [locale, setLocale]);

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
