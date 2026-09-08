"use client";

import { useEffect, useRef, useState, useId } from "react";
import { Copy, Check, Maximize2, X, AlertCircle } from "lucide-react";

interface MermaidRendererProps {
    chart: string;
    onCloseChat?: () => void;
}

export default function MermaidRenderer({ chart }: MermaidRendererProps) {
    const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
    const elementId = `mermaid-${rawId}`;
    const containerRef = useRef<HTMLDivElement>(null);
    const [svgContent, setSvgContent] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function renderChart() {
            if (!chart || !chart.trim()) return;

            try {
                const mermaidModule = await import("mermaid");
                const mermaid = mermaidModule.default;

                const isDark = document.documentElement.classList.contains("dark");

                mermaid.initialize({
                    startOnLoad: false,
                    theme: isDark ? "dark" : "default",
                    themeVariables: isDark
                        ? {
                            primaryColor: "#4f46e5",
                            primaryTextColor: "#ffffff",
                            primaryBorderColor: "#6366f1",
                            lineColor: "#818cf8",
                            secondaryColor: "#1e1b4b",
                            tertiaryColor: "#0f172a",
                            background: "#0f172a"
                        }
                        : {
                            primaryColor: "#4f46e5",
                            primaryTextColor: "#ffffff",
                            primaryBorderColor: "#4338ca",
                            lineColor: "#4f46e5",
                            secondaryColor: "#e0e7ff",
                            tertiaryColor: "#f8fafc"
                        },
                    securityLevel: "loose",
                    fontFamily: "inherit"
                });

                const cleanChart = chart.trim();
                const renderId = `${elementId}-${Date.now()}`;
                const { svg } = await mermaid.render(renderId, cleanChart);

                if (isMounted) {
                    setSvgContent(svg);
                    setError(null);
                }
            } catch (err) {
                console.warn("Mermaid render error:", err);
                if (isMounted) {
                    setError("Diagram syntax format");
                }
            }
        }

        renderChart();

        return () => {
            isMounted = false;
        };
    }, [chart, elementId]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(chart);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {}
    };

    if (error) {
        return (
            <div className="my-2 p-2.5 rounded-xl bg-muted/60 border border-border text-xs font-mono">
                <div className="flex items-center justify-between text-muted-foreground mb-1 text-[11px]">
                    <span className="flex items-center gap-1 font-semibold">
                        <AlertCircle className="h-3 w-3 text-amber-500" />
                        Diagram Source
                    </span>
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="hover:text-foreground p-0.5 rounded transition-colors"
                        title="Salin Mermaid code"
                    >
                        {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                </div>
                <pre className="overflow-x-auto text-[10px] text-foreground p-2 rounded bg-background/80 whitespace-pre">
                    {chart}
                </pre>
            </div>
        );
    }

    if (!svgContent) {
        return (
            <div className="my-2 p-4 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-center text-xs text-muted-foreground animate-pulse">
                <span>Merender diagram alur...</span>
            </div>
        );
    }

    return (
        <>
            <div className="my-2.5 rounded-xl border border-primary/20 bg-card/90 overflow-hidden shadow-xs">
                <div className="flex items-center justify-between px-3 py-1.5 bg-muted/40 border-b border-border/60 text-[11px]">
                    <span className="font-semibold text-primary flex items-center gap-1">
                        📊 Diagram Arsitektur
                    </span>
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="p-1 rounded hover:bg-muted hover:text-foreground transition-colors"
                            title="Salin Mermaid code"
                        >
                            {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsFullscreen(true)}
                            className="p-1 rounded hover:bg-muted hover:text-foreground transition-colors"
                            title="Perbesar Diagram"
                        >
                            <Maximize2 className="h-3 w-3" />
                        </button>
                    </div>
                </div>
                <div
                    ref={containerRef}
                    className="p-3 overflow-x-auto flex justify-center max-h-[320px] select-none"
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                />
            </div>

            {/* Fullscreen Lightbox Modal */}
            {isFullscreen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col p-4 sm:p-8"
                    onClick={() => setIsFullscreen(false)}
                >
                    <div
                        className="relative max-w-4xl w-full m-auto bg-card rounded-2xl border border-border p-5 shadow-2xl flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-border">
                            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                                📊 Diagram Arsitektur & Topologi
                            </h4>
                            <button
                                type="button"
                                onClick={() => setIsFullscreen(false)}
                                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div
                            className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-[300px]"
                            dangerouslySetInnerHTML={{ __html: svgContent }}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
