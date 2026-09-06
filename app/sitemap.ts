import { MetadataRoute } from 'next'
import dbConnect from '@/lib/db'
import Project from '@/models/Project'
import Post from '@/models/Post'

interface ProjectDoc {
    _id: string;
    slug?: string;
    updatedAt?: Date;
}

interface PostDoc {
    _id: string;
    slug: string;
    updatedAt?: Date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    // Static routes
    const routes = [
        '',
        '/about',
        '/projects',
        '/blog',
        '/contact',
        '/gallery',
        '/certifications',
        '/guestbook',
        '/uses',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    try {
        // Connect to database with timeout
        const dbConnection = await Promise.race([
            dbConnect(),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Database connection timeout')), 5000)
            )
        ]);

        if (!dbConnection) {
            console.warn('Database not available during build, returning static routes only');
            return routes;
        }

        // Fetch dynamic routes with timeout
        const [projects, posts] = await Promise.race([
            Promise.all([
                Project.find({}).select('slug updatedAt').lean().exec(),
                Post.find({ published: true }).select('slug updatedAt').lean().exec()
            ]),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Query timeout')), 5000)
            )
        ]);

        const projectRoutes = projects.map((project: ProjectDoc) => ({
            url: `${baseUrl}/projects/${project.slug || project._id}`,
            lastModified: project.updatedAt || new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }))

        const postRoutes = posts.map((post: PostDoc) => ({
            url: `${baseUrl}/blog/${post.slug}`,
            lastModified: post.updatedAt || new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }))

        return [...routes, ...projectRoutes, ...postRoutes]

    } catch (error) {
        console.warn("Sitemap generation error, returning static routes only:", error instanceof Error ? error.message : error);
        // Return static routes as fallback
        return routes
    }
}
