"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="p-2 h-9 w-9" />;
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all duration-300 border border-primary/20 hover:border-primary/50 group"
            title="Toggle theme"
        >
            <Moon className="h-5 w-5 text-primary transition-all duration-300 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
            <Sun className="absolute top-2 left-2 h-5 w-5 text-primary transition-all duration-300 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </button>
    );
}
