import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth-helpers';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get('slug');

        const conn = await dbConnect();
        if (!conn) {
            return NextResponse.json({ success: false, error: "Database connection not established" }, { status: 503 });
        }

        let projects;
        if (slug) {
            projects = await Project.find({ slug }).lean();
        } else {
            projects = await Project.find({}).sort({ createdAt: -1 }).lean();
        }

        return NextResponse.json(
            { success: true, data: projects },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
                },
            }
        );
    } catch (error: unknown) {
        console.error("API GET Projects Error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Internal Server Error"
        }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    await dbConnect();

    try {
        const body = await req.json();
        const project = await Project.create(body);

        try {
            revalidatePath('/projects');
            revalidatePath('/');
            const projectSlug = Array.isArray(project) ? project[0]?.slug : (project as { slug?: string })?.slug;
            if (projectSlug) revalidatePath(`/projects/${projectSlug}`);
        } catch (revErr) {
            console.warn("revalidatePath error:", revErr);
        }

        return NextResponse.json({ success: true, data: project }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to create project" },
            { status: 400 }
        );
    }
}
