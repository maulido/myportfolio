// Database Seed Script for Portfolio Website
// Run this to populate database with sample data
// Usage: node scripts/seed.js

const mongoose = require('mongoose');

// Sample data
const sampleProjects = [
    {
        title: "Portfolio Website",
        description: "Modern, responsive portfolio website built with Next.js 16, TypeScript, and MongoDB. Features include dark mode, admin dashboard, blog system, and AI-powered chat widget.",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
        tags: ["Next.js", "TypeScript", "MongoDB", "Tailwind CSS"],
        github: "https://github.com/yourusername/portfolio",
        demo: "https://yourportfolio.com",
        featured: true,
        status: "completed"
    },
    {
        title: "Network Monitoring Dashboard",
        description: "Real-time network monitoring solution with automated alerts, performance metrics, and detailed analytics. Built for enterprise-level infrastructure management.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
        tags: ["React", "Node.js", "WebSocket", "Chart.js"],
        github: "https://github.com/yourusername/network-monitor",
        demo: "https://demo.network-monitor.com",
        featured: true,
        status: "completed"
    },
    {
        title: "E-Commerce Platform",
        description: "Full-stack e-commerce solution with payment integration, inventory management, and admin panel. Supports multiple payment gateways and real-time order tracking.",
        image: "https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=600&fit=crop",
        tags: ["Next.js", "Stripe", "PostgreSQL", "Redis"],
        github: "https://github.com/yourusername/ecommerce",
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
    role: "CTO at Tech Company",
    company: "Tech Innovations Inc.",
    content: "Outstanding work! The network infrastructure was delivered on time and exceeded our expectations. Highly professional and knowledgeable.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"
};

// Connection function
async function seedDatabase() {
    try {
        // Connect to MongoDB
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio_db';
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Import models
        const Project = require('../models/Project');
        const Gallery = require('../models/Gallery');
        const Testimonial = require('../models/Testimonial');

        // Clear existing data (optional - comment out if you want to keep existing data)
        // await Project.deleteMany({});
        // await Gallery.deleteMany({});
        // await Testimonial.deleteMany({});
        // console.log('🗑️  Cleared existing data');

        // Insert sample projects
        const projects = await Project.insertMany(sampleProjects);
        console.log(`✅ Inserted ${projects.length} projects`);

        // Insert sample gallery items
        const galleryItems = await Gallery.insertMany(sampleGalleryItems);
        console.log(`✅ Inserted ${galleryItems.length} gallery items`);

        // Insert sample testimonial
        const testimonial = await Testimonial.create(sampleTestimonial);
        console.log(`✅ Inserted 1 testimonial`);

        console.log('\n🎉 Database seeded successfully!');
        console.log('\nSummary:');
        console.log(`- Projects: ${projects.length}`);
        console.log(`- Gallery Items: ${galleryItems.length}`);
        console.log(`- Testimonials: 1`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seed function
seedDatabase();
