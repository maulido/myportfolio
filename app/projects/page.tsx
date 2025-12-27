import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Projects } from "@/components/Projects";

export default function ProjectsPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 pt-16">
                <Projects />
            </main>
            <Footer />
        </div>
    );
}
