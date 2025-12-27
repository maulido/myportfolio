"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function AnalyticsTracker() {
    const pathname = usePathname();
    const sessionIdRef = useRef<string | null>(null);

    useEffect(() => {
        // Initialize Session ID
        let sid = localStorage.getItem('v_session_id');
        if (!sid) {
            sid = crypto.randomUUID();
            localStorage.setItem('v_session_id', sid);
        }
        sessionIdRef.current = sid;

        const trackView = async () => {
            try {
                // Track Page View (Traditional)
                await fetch('/api/analytics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'page_view',
                        identifier: pathname === '/' ? 'home' : pathname.replace(/^\//, '')
                    }),
                });

                // Track Session
                await fetch('/api/analytics/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId: sid,
                        path: pathname,
                        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
                        isMobile: typeof window !== 'undefined' && window.innerWidth < 768
                    }),
                });
            } catch (error) {
                console.error("Analytics error:", error);
            }
        };

        trackView();

        // Heartbeat timer
        const interval = setInterval(async () => {
            if (!sessionIdRef.current) return;
            try {
                await fetch('/api/analytics/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId: sessionIdRef.current,
                        path: pathname,
                        isHeartbeat: true
                    }),
                });
            } catch (e) { }
        }, 60000); // Every minute

        return () => clearInterval(interval);
    }, [pathname]);

    return null;
}
