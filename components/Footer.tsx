import { Github, Linkedin, Mail } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-border/40 bg-background py-8">
            <div className="container mx-auto px-4 text-center">
                <div className="mb-4 flex justify-center space-x-6">
                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground transition-colors hover:text-primary"
                    >
                        <Github className="h-5 w-5" />
                        <span className="sr-only">GitHub</span>
                    </a>
                    <a
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground transition-colors hover:text-primary"
                    >
                        <Linkedin className="h-5 w-5" />
                        <span className="sr-only">LinkedIn</span>
                    </a>
                    <a
                        href="mailto:example@example.com"
                        className="text-muted-foreground transition-colors hover:text-primary"
                    >
                        <Mail className="h-5 w-5" />
                        <span className="sr-only">Email</span>
                    </a>
                </div>
                <p className="text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} Portfolio. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
