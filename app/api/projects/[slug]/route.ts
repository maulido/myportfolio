import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Project from '@/models/Project';

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        await dbConnect();

        const project = await Project.findOne({ slug: params.slug })
            .populate('relatedProjects')
            .lean();

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
