"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Critical Global Error:", error);
    }, [error]);

    return (
        <html lang="en" className="dark">
            <body className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 font-sans antialiased">
                <div className="max-w-md w-full text-center space-y-6 bg-card border border-border p-8 rounded-3xl shadow-2xl">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
                        <AlertTriangle className="h-8 w-8" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight">Critical System Error</h1>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            A critical error occurred in the root application layout.
                        </p>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={() => reset()}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/25 active:scale-95"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Reload Application
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
