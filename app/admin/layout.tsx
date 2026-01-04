"use client";

import { SessionProvider } from "next-auth/react";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, LogOut } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();

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
                    <div className="flex items-center gap-4">
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

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SessionProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </SessionProvider>
    );
}
