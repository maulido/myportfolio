import { MetadataRoute } from 'next'
import dbConnect from '@/lib/db'
import Project from '@/models/Project'
import Post from '@/models/Post'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://example.com' // Replace with actual domain

    // Static routes
    const routes = [
        '',
        '/about',
        '/projects',
        '/blog',
        '/contact',
        '/gallery',
        '/certifications',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    try {
        await dbConnect()

        // Dynamic routes: Projects
        const projects = await Project.find({}).select('slug updatedAt').lean()
        const projectRoutes = projects.map((project: any) => ({
            url: `${baseUrl}/projects/${project._id}`,
            lastModified: project.updatedAt || new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }))

        // Dynamic routes: Blog Posts
        const posts = await Post.find({}).select('slug updatedAt').lean()
        const postRoutes = posts.map((post: any) => ({
            url: `${baseUrl}/blog/${post.slug}`,
            lastModified: post.updatedAt || new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }))

        return [...routes, ...projectRoutes, ...postRoutes]

    } catch (error) {
        console.error("Sitemap generation error:", error)
        return routes
    }
}
