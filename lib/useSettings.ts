"use client";

import { useState, useEffect } from "react";

let cachedSettings: Record<string, string> | null = null;
let fetchPromise: Promise<Record<string, string>> | null = null;
const listeners = new Set<() => void>();

export function mutateSettingsCache(newSettings: Record<string, string>) {
    cachedSettings = { ...(cachedSettings || {}), ...newSettings };
    listeners.forEach(fn => fn());
}

export function useSettings() {
    const [settings, setSettings] = useState<Record<string, string>>(cachedSettings || {});
    const [loading, setLoading] = useState(!cachedSettings);

    useEffect(() => {
        let isMounted = true;

        const updateState = () => {
            if (isMounted && cachedSettings) {
                setSettings({ ...cachedSettings });
            }
        };

        listeners.add(updateState);

        if (!cachedSettings) {
            if (!fetchPromise) {
                fetchPromise = fetch('/api/settings')
                    .then(res => res.json())
                    .then(data => {
                        const map: Record<string, string> = {};
                        if (data.success && Array.isArray(data.data)) {
                            data.data.forEach((item: { key: string; value: unknown }) => {
                                if (item && item.key) {
                                    map[item.key] = typeof item.value === 'string' 
                                        ? item.value 
                                        : JSON.stringify(item.value);
                                }
                            });
                        }
                        cachedSettings = map;
                        return map;
                    })
                    .catch(err => {
                        console.error("Failed to load settings:", err);
                        return {};
                    })
                    .finally(() => {
                        fetchPromise = null;
                    });
            }

            fetchPromise.then(map => {
                if (isMounted) {
                    setSettings(map);
                    setLoading(false);
                }
            });
        }

        return () => {
            isMounted = false;
            listeners.delete(updateState);
        };
    }, []);

    const get = (key: string, defaultValue: string = ""): string => {
        const val = settings[key];
        return val !== undefined && val !== null && val.trim() !== "" ? val : defaultValue;
    };

    return { settings, loading, get };
}
