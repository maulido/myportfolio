import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth-helpers';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        await dbConnect();

        const { slug } = await params;

        // Check if slug is a valid MongoDB ObjectId
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);

        const project = isObjectId
            ? await Project.findById(slug).populate('relatedProjects').lean()
            : await Project.findOne({ slug }).populate('relatedProjects').lean();

        if (!project) {
            return NextResponse.json(
                { success: false, error: 'Project not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: project });
    } catch (error) {
        console.error('Error fetching project:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch project' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        await dbConnect();

        const { slug } = await params;
        const body = await request.json();

        // Check if slug is a valid MongoDB ObjectId
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);

        const project = isObjectId
            ? await Project.findByIdAndUpdate(slug, body, { new: true, runValidators: true })
            : await Project.findOneAndUpdate({ slug }, body, { new: true, runValidators: true });

        if (!project) {
            return NextResponse.json(
                { success: false, error: 'Project not found' },
                { status: 404 }
            );
        }

        try {
            revalidatePath('/projects');
            revalidatePath('/');
            if (project.slug) revalidatePath(`/projects/${project.slug}`);
        } catch (revErr) {
            console.warn("revalidatePath error:", revErr);
        }

        return NextResponse.json({ success: true, data: project });
    } catch (error) {
        console.error('Error updating project:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to update project' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        await dbConnect();

        const { slug } = await params;

        // Check if slug is a valid MongoDB ObjectId
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);

        const project = isObjectId
            ? await Project.findByIdAndDelete(slug)
            : await Project.findOneAndDelete({ slug });

        if (!project) {
            return NextResponse.json(
                { success: false, error: 'Project not found' },
                { status: 404 }
            );
        }

        try {
            revalidatePath('/projects');
            revalidatePath('/');
            if (project.slug) revalidatePath(`/projects/${project.slug}`);
        } catch (revErr) {
            console.warn("revalidatePath error:", revErr);
        }

        return NextResponse.json({ success: true, data: project });
    } catch (error) {
        console.error('Error deleting project:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to delete project' },
            { status: 500 }
        );
    }
}

