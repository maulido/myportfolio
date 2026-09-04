"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Application Error:", error);
    }, [error]);

    return (
        <main className="min-h-[80vh] flex items-center justify-center px-4 py-20">
            <div className="max-w-md w-full text-center space-y-6 bg-card/60 backdrop-blur-xl border border-border/80 dark:border-primary/20 p-8 rounded-3xl shadow-xl">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        An unexpected error occurred while loading this page. You can try refreshing the component or return to the home page.
                    </p>
                    {error?.digest && (
                        <p className="text-[11px] font-mono text-muted-foreground/60">
                            Error Reference: {error.digest}
                        </p>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                        onClick={() => reset()}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 active:scale-95"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-muted/50 hover:bg-muted text-foreground text-sm font-medium border border-border/60 transition-all active:scale-95"
                    >
                        <Home className="h-4 w-4" />
                        Back to Home
                    </Link>
                </div>
            </div>
        </main>
    );
}
