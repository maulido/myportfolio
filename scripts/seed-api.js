// Database Seed Script - TypeScript Compatible
// This script uses the API endpoints to seed data
// Usage: node scripts/seed-api.js

const sampleProjects = [
    {
        title: "Portfolio Website",
        description: "Modern, responsive portfolio website built with Next.js 16, TypeScript, and MongoDB. Features include dark mode, admin dashboard, blog system, and real-time analytics.",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
        tags: ["Next.js", "TypeScript", "MongoDB", "Tailwind CSS"],
        github: "https://github.com/maulido/portfolio",
        demo: "https://yourportfolio.com",
        featured: true,
        status: "completed"
    },
    {
        title: "Network Monitoring Dashboard",
        description: "Real-time network monitoring solution with automated alerts, performance metrics, and detailed analytics. Built for enterprise-level infrastructure management with support for multiple protocols.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
        tags: ["React", "Node.js", "WebSocket", "Chart.js", "Docker"],
        github: "https://github.com/maulido/network-monitor",
        demo: "https://demo.network-monitor.com",
        featured: true,
        status: "completed"
    },
    {
        title: "E-Commerce Platform",
        description: "Full-stack e-commerce solution with payment integration, inventory management, and admin panel. Supports multiple payment gateways and real-time order tracking with automated email notifications.",
        image: "https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=600&fit=crop",
        tags: ["Next.js", "Stripe", "PostgreSQL", "Redis", "AWS"],
        github: "https://github.com/maulido/ecommerce",
        demo: "https://demo.ecommerce.com",
        featured: true,
        status: "in-progress"
    }
];

const sampleGalleryItems = [
    {
        title: "Network Infrastructure Setup",
        description: "Enterprise network deployment with redundant systems and high availability configuration",
        imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop",
        category: "Network Engineering",
        date: new Date("2024-01-15")
    },
    {
        title: "Code Review Session",
        description: "Team collaboration on code quality and best practices",
        imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
        category: "Software Development",
        date: new Date("2024-02-20")
    }
];

const sampleTestimonial = {
    name: "John Doe",
    role: "CTO",
    company: "Tech Innovations Inc.",
    content: "Outstanding work! The network infrastructure was delivered on time and exceeded our expectations. Highly professional and knowledgeable.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"
};

const sampleBlogPost = {
    title: "Building a Modern Portfolio with Next.js 16",
    slug: "building-modern-portfolio-nextjs-16",
    excerpt: "Learn how I built this portfolio website using the latest Next.js features, TypeScript, and MongoDB. A comprehensive guide to modern web development.",
    content: `# Building a Modern Portfolio with Next.js 16

## Introduction

In this post, I'll walk you through the process of building a modern, performant portfolio website using Next.js 16, TypeScript, and MongoDB.

## Tech Stack

- **Next.js 16**: Latest features including Turbopack
- **TypeScript**: Type safety and better DX
- **MongoDB**: Flexible NoSQL database
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations

## Key Features

### 1. Server Components
Next.js 16 makes extensive use of React Server Components for better performance.

### 2. Dark Mode
Implemented with next-themes for seamless theme switching.

### 3. Admin Dashboard
Full-featured admin panel for content management.

## Challenges & Solutions

One of the main challenges was implementing authentication with NextAuth.js. The solution involved...

## Conclusion

Building this portfolio was a great learning experience. The combination of Next.js 16 and TypeScript provides an excellent developer experience.

Feel free to check out the source code on GitHub!`,
    tags: ["Next.js", "TypeScript", "Web Development", "Tutorial"],
    published: true,
    featured: true
};

async function seedViaAPI() {
    const baseUrl = 'http://localhost:3000';

    console.log('🌱 Starting database seeding via API...\n');

    try {
        // Note: This requires authentication
        // For now, we'll create a direct MongoDB insertion script
        console.log('⚠️  API seeding requires authentication.');
        console.log('📝 Sample data prepared. Please use admin dashboard to add content,');
        console.log('   or run the MongoDB commands below:\n');

        console.log('// MongoDB Shell Commands:');
        console.log('use portfolio_db;\n');

        console.log('// Insert Projects:');
        console.log('db.projects.insertMany(' + JSON.stringify(sampleProjects, null, 2) + ');\n');

        console.log('// Insert Gallery Items:');
        console.log('db.galleries.insertMany(' + JSON.stringify(sampleGalleryItems, null, 2) + ');\n');

        console.log('// Insert Testimonial:');
        console.log('db.testimonials.insertOne(' + JSON.stringify(sampleTestimonial, null, 2) + ');\n');

        console.log('// Insert Blog Post:');
        console.log('db.posts.insertOne(' + JSON.stringify(sampleBlogPost, null, 2) + ');\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

seedViaAPI();
