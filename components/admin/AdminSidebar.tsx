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
    User
} from "lucide-react";

export default function AdminSidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === "/admin") {
            return pathname === "/admin";
        }
        return pathname?.startsWith(path);
    };

    return (
        <aside className="w-full flex flex-col gap-2">
            <div className="px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Main Menu</div>
            <Link href="/admin" className="w-full">
                <button className={`w-full inline-flex items-center rounded-xl text-sm font-bold transition-all h-11 px-4 py-2 justify-start ${isActive("/admin") && pathname === "/admin" ? "bg-primary text-white shadow-lg shadow-primary/25" : "hover:bg-primary/5 hover:text-primary"}`}>
                    <LayoutDashboard className="mr-3 h-4 w-4" />
                    Dashboard
                </button>
            </Link>
            <Link href="/admin/posts" className="w-full">
                <button className={`w-full inline-flex items-center rounded-xl text-sm font-bold transition-all h-11 px-4 py-2 justify-start ${isActive("/admin/posts") ? "bg-primary text-white shadow-lg shadow-primary/25" : "hover:bg-primary/5 hover:text-primary"}`}>
                    <FileText className="mr-3 h-4 w-4" />
                    Blog Posts
                </button>
            </Link>
            <Link href="/admin/projects" className="w-full">
                <button className={`w-full inline-flex items-center rounded-xl text-sm font-bold transition-all h-11 px-4 py-2 justify-start ${isActive("/admin/projects") ? "bg-primary text-white shadow-lg shadow-primary/25" : "hover:bg-primary/5 hover:text-primary"}`}>
                    <Briefcase className="mr-3 h-4 w-4" />
                    Projects
                </button>
            </Link>

            <div className="px-4 py-2 mt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Content</div>
            <Link href="/admin/gallery" className="w-full">
                <button className={`w-full inline-flex items-center rounded-xl text-sm font-bold transition-all h-11 px-4 py-2 justify-start ${isActive("/admin/gallery") ? "bg-primary text-white shadow-lg shadow-primary/25" : "hover:bg-primary/5 hover:text-primary"}`}>
                    <ImageIcon className="mr-3 h-4 w-4" />
                    Gallery
                </button>
            </Link>
            <Link href="/admin/certifications" className="w-full">
                <button className={`w-full inline-flex items-center rounded-xl text-sm font-bold transition-all h-11 px-4 py-2 justify-start ${isActive("/admin/certifications") ? "bg-primary text-white shadow-lg shadow-primary/25" : "hover:bg-primary/5 hover:text-primary"}`}>
                    <Award className="mr-3 h-4 w-4" />
                    Certifications
                </button>
            </Link>
            <Link href="/admin/testimonials" className="w-full">
                <button className={`w-full inline-flex items-center rounded-xl text-sm font-bold transition-all h-11 px-4 py-2 justify-start ${isActive("/admin/testimonials") ? "bg-primary text-white shadow-lg shadow-primary/25" : "hover:bg-primary/5 hover:text-primary"}`}>
                    <MessageCircle className="mr-3 h-4 w-4" />
                    Testimonials
                </button>
            </Link>
            <Link href="/admin/career" className="w-full">
                <button className={`w-full inline-flex items-center rounded-xl text-sm font-bold transition-all h-11 px-4 py-2 justify-start ${isActive("/admin/career") ? "bg-primary text-white shadow-lg shadow-primary/25" : "hover:bg-primary/5 hover:text-primary"}`}>
                    <Briefcase className="mr-3 h-4 w-4" />
                    Career Journey
                </button>
            </Link>
            <Link href="/admin/skills" className="w-full">
                <button className={`w-full inline-flex items-center rounded-xl text-sm font-bold transition-all h-11 px-4 py-2 justify-start ${isActive("/admin/skills") ? "bg-primary text-white shadow-lg shadow-primary/25" : "hover:bg-primary/5 hover:text-primary"}`}>
                    <Award className="mr-3 h-4 w-4" />
                    Technical Skills
                </button>
            </Link>

            <div className="px-4 py-2 mt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Interactive</div>
            <Link href="/admin/uses" className="w-full">
                <button className={`w-full inline-flex items-center rounded-xl text-sm font-bold transition-all h-11 px-4 py-2 justify-start ${isActive("/admin/uses") ? "bg-primary text-white shadow-lg shadow-primary/25" : "hover:bg-primary/5 hover:text-primary"}`}>
                    <Package className="mr-3 h-4 w-4" />
                    Uses Page
                </button>
            </Link>
            <Link href="/admin/guestbook" className="w-full">
                <button className={`w-full inline-flex items-center rounded-xl text-sm font-bold transition-all h-11 px-4 py-2 justify-start ${isActive("/admin/guestbook") ? "bg-primary text-white shadow-lg shadow-primary/25" : "hover:bg-primary/5 hover:text-primary"}`}>
                    <MessageSquare className="mr-3 h-4 w-4" />
                    Guestbook
                </button>
            </Link>

            <div className="px-4 py-2 mt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Admin Tools</div>
            <Link href="/admin/media" className="w-full">
                <button className={`w-full inline-flex items-center rounded-xl text-sm font-bold transition-all h-11 px-4 py-2 justify-start ${isActive("/admin/media") ? "bg-primary text-white shadow-lg shadow-primary/25" : "hover:bg-primary/5 hover:text-primary"}`}>
                    <FolderOpen className="mr-3 h-4 w-4" />
                    Media Library
                </button>
            </Link>
            <Link href="/admin/analytics" className="w-full">
                <button className={`w-full inline-flex items-center rounded-xl text-sm font-bold transition-all h-11 px-4 py-2 justify-start ${isActive("/admin/analytics") ? "bg-primary text-white shadow-lg shadow-primary/25" : "hover:bg-primary/5 hover:text-primary"}`}>
                    <BarChart3 className="mr-3 h-4 w-4" />
                    Analytics
                </button>
            </Link>

            <div className="px-4 py-2 mt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Settings</div>
            <Link href="/admin/profile" className="w-full">
                <button className={`w-full inline-flex items-center rounded-xl text-sm font-bold transition-all h-11 px-4 py-2 justify-start ${isActive("/admin/profile") ? "bg-primary text-white shadow-lg shadow-primary/25" : "hover:bg-primary/5 hover:text-primary"}`}>
                    <User className="mr-3 h-4 w-4" />
                    Profile
                </button>
            </Link>
            <Link href="/admin/settings" className="w-full">
                <button className={`w-full inline-flex items-center rounded-xl text-sm font-bold transition-all h-11 px-4 py-2 justify-start ${isActive("/admin/settings") ? "bg-primary text-white shadow-lg shadow-primary/25" : "hover:bg-primary/5 hover:text-primary"}`}>
                    <Settings className="mr-3 h-4 w-4" />
                    Site Settings
                </button>
            </Link>
        </aside>
    );
}
