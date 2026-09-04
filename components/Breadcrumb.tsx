import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://portfolio.local";

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": baseUrl
            },
            ...items.map((item, index) => ({
                "@type": "ListItem",
                "position": index + 2,
                "name": item.label,
                ...(item.href ? { "item": `${baseUrl}${item.href.startsWith('/') ? item.href : `/${item.href}`}` } : {})
            }))
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <nav className={`flex items-center gap-1.5 text-xs text-muted-foreground py-1 overflow-x-auto ${className}`} aria-label="Breadcrumb">
                <Link href="/" className="hover:text-foreground transition-colors shrink-0">
                    Home
                </Link>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <span key={index} className="flex items-center gap-1.5 shrink-0">
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                            {item.href && !isLast ? (
                                <Link href={item.href} className="hover:text-foreground transition-colors">
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="text-foreground font-medium truncate max-w-[220px] sm:max-w-md">
                                    {item.label}
                                </span>
                            )}
                        </span>
                    );
                })}
            </nav>
        </>
    );
}
