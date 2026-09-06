import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import Testimonial from '@/models/Testimonial';
import Post from '@/models/Post';
import GalleryItem from '@/models/GalleryItem';
import Certification from '@/models/Certification';
import { requireAuth } from '@/lib/auth-helpers';

export async function GET() {
    // Require admin authentication to prevent unauthorized public seeding
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    await dbConnect();

    try {
        // Seed Projects
        const projectCount = await Project.countDocuments();
        if (projectCount === 0) {
            await Project.create([
                {
                    title: "Project Alpha",
                    slug: "project-alpha",
                    category: "Web Development",
                    description: "A comprehensive network monitoring dashboard built with Next.js and real-time data visualization.",
                    technologies: ["Next.js", "TypeScript", "WebSocket", "TailwindCSS"],
                    githubUrl: "https://github.com",
                    demoUrl: "https://example.com",
                    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60"
                },
                {
                    title: "Project Beta",
                    slug: "project-beta",
                    category: "Automation",
                    description: "Automated network configuration script generator using Python and Flask.",
                    technologies: ["Python", "Flask", "Network Automation", "Docker"],
                    githubUrl: "https://github.com",
                    demoUrl: "https://example.com",
                    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=60"
                },
                {
                    title: "Portfolio Website",
                    slug: "portfolio-website",
                    category: "Web Development",
                    description: "This personal portfolio website featuring SEO best practices and smooth animations.",
                    technologies: ["Next.js", "React", "Framer Motion", "TailwindCSS"],
                    githubUrl: "https://github.com",
                    demoUrl: "https://example.com",
                    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60"
                }
            ]);
        }

        // Seed Testimonials
        const testimonialCount = await Testimonial.countDocuments();
        if (testimonialCount === 0) {
            await Testimonial.create([
                {
                    name: "Jane Smith",
                    role: "CTO",
                    company: "Tech Corp",
                    content: "John is an exceptional engineer who bridges the gap between software and networking perfectly.",
                    image: "/placeholder-user.jpg"
                },
                {
                    name: "Mike Johnson",
                    role: "Product Manager",
                    company: "StartUp Inc",
                    content: "Highly recommended! Delivered the project on time and exceeded expectations.",
                    image: "/placeholder-user.jpg"
                }
            ]);
        }


        // Seed Blog Posts
        const postCount = await Post.countDocuments();
        if (postCount === 0) {
            await Post.create([
                {
                    title: "The Future of Network Automation",
                    slug: "future-of-network-automation",
                    excerpt: "Exploring how Python and Ansible are reshaping the landscape of network engineering.",
                    content: "Network automation is rapidly becoming a requirement rather than a luxury...",
                    tags: ["Networking", "Automation", "Python"],
                    coverImage: "/placeholder-project.jpg"
                },
                {
                    title: "Building Scalable Web Apps with Next.js",
                    slug: "building-scalable-web-apps",
                    excerpt: "Why Next.js is my go-to framework for modern web development.",
                    content: "Next.js offers a powerful set of features including server-side rendering...",
                    tags: ["Next.js", "React", "Web Development"],
                    coverImage: "/placeholder-project.jpg"
                }
            ]);
        }

        // Seed Gallery Items
        const galleryCount = await GalleryItem.countDocuments();
        if (galleryCount === 0) {
            await GalleryItem.create([
                {
                    title: "Data Center Migration",
                    description: "Successfully migrated 500+ servers to new facility.",
                    imageUrl: "/placeholder-project.jpg", // Using placeholder for now
                    category: "Networking",
                    date: new Date("2024-01-15")
                },
                {
                    title: "Tech Conference Speaker",
                    description: "Giving a talk on Cloud Security at TechConf 2024.",
                    imageUrl: "/placeholder-project.jpg",
                    category: "Events",
                    date: new Date("2024-03-20")
                },
                {
                    title: "Hackathon Win",
                    description: "First place at the Global AI Hackathon.",
                    imageUrl: "/placeholder-project.jpg",
                    category: "Awards",
                    date: new Date("2023-11-10")
                }
            ]);
        }


        // Seed Certifications
        const certCount = await Certification.countDocuments();
        if (certCount === 0) {
            await Certification.create([
                {
                    title: "Cisco Certified Network Associate (CCNA)",
                    issuer: "Cisco",
                    issueDate: new Date("2023-05-15"),
                    credentialUrl: "https://www.credly.com",
                    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60"
                },
                {
                    title: "AWS Certified Solutions Architect",
                    issuer: "Amazon Web Services",
                    issueDate: new Date("2023-08-20"),
                    credentialUrl: "https://www.credly.com",
                    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60"
                },
                {
                    title: "Google Cloud Professional Data Engineer",
                    issuer: "Google Cloud",
                    issueDate: new Date("2024-02-10"),
                    credentialUrl: "https://www.credly.com",
                    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60"
                }
            ]);
        }

        return NextResponse.json({ success: true, message: "Database seeded successfully" });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to seed database"
        }, { status: 500 });
    }
}
