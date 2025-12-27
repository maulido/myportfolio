"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
            >
                <h1 className="text-9xl font-extrabold text-primary/20">404</h1>
                <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Page Not Found</h2>
                <p className="text-lg text-muted-foreground max-w-[600px] mx-auto">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    Or maybe it's just a glitch in the matrix.
                </p>
                <div className="pt-8">
                    <Link href="/" className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                        Return Home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
