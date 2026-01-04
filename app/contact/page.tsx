import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Contact } from "@/components/Contact";

export default function ContactPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 pt-16">
                {/* Breadcrumbs */}
                <div className="container mx-auto px-4 md:px-6 py-4">
                    <nav className="text-sm text-muted-foreground">
                        <a href="/" className="hover:text-primary transition-colors">Home</a>
                        <span className="mx-2">/</span>
                        <span className="text-foreground">Contact</span>
                    </nav>
                </div>

                <Contact />
            </main>
            <Footer />
        </div>
    );
}
