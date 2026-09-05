"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    Briefcase,
    Image as ImageIcon,
    Award,
    MessageCircle,
    Package,
    MessageSquare,
    FolderOpen,
    BarChart3,
    Settings,
    User,
    Inbox,
    MailCheck,
    Globe,
    HelpCircle
} from "lucide-react";

export default function AdminSidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === "/admin") {
            return pathname === "/admin";
        }
        return pathname?.startsWith(path);
    };

    const navSections = [
        {
            title: "Main Menu",
            items: [
                { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
                { name: "Blog Posts", href: "/admin/posts", icon: FileText },
                { name: "Projects", href: "/admin/projects", icon: Briefcase },
            ]
        },
        {
            title: "Content",
            items: [
                { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
                { name: "Certifications", href: "/admin/certifications", icon: Award },
                { name: "Testimonials", href: "/admin/testimonials", icon: MessageCircle },
                { name: "Career Journey", href: "/admin/career", icon: Briefcase },
                { name: "Technical Skills", href: "/admin/skills", icon: Award },
                { name: "FAQs", href: "/admin/faqs", icon: HelpCircle },
            ]
        },
        {
            title: "Interactive",
            items: [
                { name: "Uses Page", href: "/admin/uses", icon: Package },
                { name: "Guestbook", href: "/admin/guestbook", icon: MessageSquare },
                { name: "Inquiries", href: "/admin/messages", icon: Inbox },
                { name: "Subscribers", href: "/admin/subscribers", icon: MailCheck },
            ]
        },
        {
            title: "Admin Tools",
            items: [
                { name: "Media Library", href: "/admin/media", icon: FolderOpen },
                { name: "SEO Simulator", href: "/admin/seo", icon: Globe },
                { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
                { name: "Profile", href: "/admin/profile", icon: User },
                { name: "Site Settings", href: "/admin/settings", icon: Settings },
            ]
        }
    ];

    const allItems = navSections.flatMap(s => s.items);

    return (
        <aside className="w-full">
            {/* Mobile / Tablet Horizontal Scrollable Pill Bar */}
            <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border-b border-border/80">
                {allItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                                active
                                    ? "bg-primary text-white shadow-md shadow-primary/25"
                                    : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            {/* Desktop Vertical Categorized Sidebar */}
            <div className="hidden md:flex flex-col gap-2 sticky top-24">
                {navSections.map((section, sIdx) => (
                    <div key={section.title} className={sIdx > 0 ? "mt-4" : ""}>
                        <div className="px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            {section.title}
                        </div>
                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const active = isActive(item.href);
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`w-full inline-flex items-center rounded-xl text-sm font-bold transition-all h-11 px-4 py-2 justify-start ${
                                            active
                                                ? "bg-primary text-white shadow-lg shadow-primary/25"
                                                : "hover:bg-primary/5 hover:text-primary text-foreground/80"
                                        }`}
                                    >
                                        <Icon className="mr-3 h-4 w-4" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
}
