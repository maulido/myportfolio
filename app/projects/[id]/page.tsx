import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Github, ArrowLeft } from "lucide-react";
import { Metadata } from 'next';
import * as motion from "framer-motion/client";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    try {
        const { id } = await params;
        await dbConnect();
        const project = await Project.findById(id);

        if (!project) {
            return { title: 'Project Not Found' };
        }

        return {
            title: `${project.title} | John Doe Portfolio`,
            description: project.description.substring(0, 160),
            openGraph: {
                title: project.title,
                description: project.description.substring(0, 160),
                images: project.image ? [project.image] : [],
            }
        };
    } catch (error) {
        return { title: 'John Doe Portfolio' };
    }
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    let project;
    try {
        await dbConnect();
        project = await Project.findById(id);
    } catch (e) {
        console.error("Project Detail Error:", e);
        return notFound();
    }

    if (!project) {
        return notFound();
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 pt-24 pb-16">
                <div className="container px-4 md:px-6">
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Link href="/projects" className="inline-flex items-center text-sm font-medium text-primary hover:text-accent mb-8 group transition-colors">
                                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                Back to All Projects
                            </Link>
                        </motion.div>

                        <div className="grid lg:grid-cols-2 gap-12 items-start">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.7 }}
                                className="aspect-video relative rounded-3xl overflow-hidden border border-primary/20 shadow-2xl group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 mix-blend-overlay z-10" />
                                {project.image ? (
                                    <Image
                                        src={project.image}
                                        alt={project.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-card/50 backdrop-blur-xl">
                                        <span className="text-muted-foreground font-medium">Project Snapshot</span>
                                    </div>
                                )}
                            </motion.div>

                            <div className="space-y-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                                        {project.title}
                                    </h1>
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags.map((tag: string) => (
                                            <span key={tag} className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-xs font-bold text-primary uppercase tracking-wider">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>

                                <div className="flex gap-4">
                                    <Link
                                        href={project.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 inline-flex h-12 items-center justify-center rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95 hover:bg-primary/90"
                                    >
                                        <Github className="mr-2 h-5 w-5" />
                                        Repository
                                    </Link>
                                    {project.demo && (
                                        <Link
                                            href={project.demo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 inline-flex h-12 items-center justify-center rounded-2xl border-2 border-primary/20 bg-card/50 backdrop-blur-sm font-bold shadow-xl transition-all hover:scale-105 active:scale-95 hover:border-primary/50"
                                        >
                                            <ExternalLink className="mr-2 h-5 w-5" />
                                            Live Demo
                                        </Link>
                                    )}
                                </div>

                                <div className="bg-card/40 backdrop-blur-xl border border-primary/10 rounded-3xl p-8 space-y-6 shadow-2xl">
                                    <div className="space-y-2">
                                        <h2 className="text-sm font-bold text-accent uppercase tracking-widest">The Overview</h2>
                                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                            {project.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Extended Case Study Content */}
                        <div className="mt-20 grid md:grid-cols-2 gap-12 border-t border-primary/10 pt-20">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                viewport={{ once: true }}
                                className="space-y-6"
                            >
                                <div className="p-3 bg-red-500/10 rounded-2xl w-fit">
                                    <h3 className="font-bold text-red-400">The Challenge</h3>
                                </div>
                                <p className="text-muted-foreground text-lg leading-relaxed">
                                    This project required solving complex technical hurdles, including performance optimization and seamless integration of various backend services. The primary goal was to create a scalable solution that maintains a high standard of security and user experience.
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                viewport={{ once: true }}
                                className="space-y-6"
                            >
                                <div className="p-3 bg-green-500/10 rounded-2xl w-fit">
                                    <h3 className="font-bold text-green-400">The Solution</h3>
                                </div>
                                <p className="text-muted-foreground text-lg leading-relaxed">
                                    By leveraging modern technologies like Next.js and Tailwind CSS, I implemented a responsive, high-performance interface. The backend was modularized using Node.js, ensuring that features could be developed and deployed independently without compromising system integrity.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
