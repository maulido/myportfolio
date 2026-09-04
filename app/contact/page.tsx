import { Navbar } from "@/components/Navbar";
import { Contact } from "@/components/Contact";
import { Breadcrumb } from "@/components/Breadcrumb";

export default function ContactPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 pt-16">
                {/* Breadcrumbs */}
                <div className="container mx-auto px-4 md:px-6 py-4">
                    <Breadcrumb items={[{ label: "Contact" }]} />
                </div>

                <Contact />
            </main>
        </div>
    );
}
