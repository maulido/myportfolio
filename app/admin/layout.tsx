"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, LogOut, Wrench } from "lucide-react";
import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        let isMounted = true;
        fetch("/api/settings?key=isMaintenanceMode")
            .then((res) => res.json())
            .then((d) => {
                if (isMounted && d.success && (d.data === "true" || d.data === true)) {
                    setIsMaintenanceActive(true);
                }
            })
            .catch(() => {});

        return () => {
            isMounted = false;
        };
    }, []);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Top Navigation */}
            <nav className="border-b border-primary/10 bg-card/20 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <LayoutDashboard className="h-6 w-6 text-primary" />
                        </div>
                        <span className="font-bold text-xl tracking-tighter">ADMIN<span className="text-primary">CORE</span></span>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                        {isMaintenanceActive && (
                            <Link
                                href="/admin/settings"
                                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold animate-pulse hover:bg-rose-500/25 transition-colors"
                                title="Maintenance Mode is Active - Click to configure in Settings"
                            >
                                <Wrench className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Maintenance Mode Active</span>
                                <span className="sm:hidden">Maintenance</span>
                            </Link>
                        )}
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-bold text-foreground">{session?.user?.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Super Admin</span>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors border border-primary/10"
                            title="Sign Out"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content with Sidebar */}
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="grid gap-8 md:grid-cols-[250px_1fr]">
                    {/* Sidebar */}
                    <AdminSidebar />

                    {/* Content Area */}
                    <div className="w-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
