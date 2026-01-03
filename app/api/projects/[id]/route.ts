import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import { UTApi } from 'uploadthing/server';

const utapi = new UTApi();

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await dbConnect();

    try {
        const project = await Project.findById(id);
        if (!project) {
            return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: project });
    } catch (error) {
        return NextResponse.json({ success: false, error: error }, { status: 400 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await dbConnect();

    try {
        // Get the project first to extract file key
        const project = await Project.findById(id);

        if (!project) {
            return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
        }

        // Extract file key from image URL if exists
        if (project.image) {
            const fileKey = project.image.split('/f/')[1];
            if (fileKey) {
                try {
                    await utapi.deleteFiles(fileKey);
                    console.log(`Deleted file from UploadThing: ${fileKey}`);
                } catch (error) {
                    console.error('Failed to delete file from UploadThing:', error);
                }
            }
        }

        // Delete from database
        await Project.findByIdAndDelete(id);

        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({ success: false, error: error }, { status: 400 });
    }
}
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await dbConnect();

    try {
        const body = await request.json();

        // Get the current project to check if image is being replaced
        const currentProject = await Project.findById(id);
        if (!currentProject) {
            return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
        }

        // If image is being updated and is different from current, delete old file
        if (body.image && body.image !== currentProject.image && currentProject.image) {
            const oldFileKey = currentProject.image.split('/f/')[1];
            if (oldFileKey) {
                try {
                    await utapi.deleteFiles(oldFileKey);
                    console.log(`Deleted old file from UploadThing: ${oldFileKey}`);
                } catch (error) {
                    console.error('Failed to delete old file from UploadThing:', error);
                    // Continue with update even if old file deletion fails
                }
            }
        }

        const project = await Project.findByIdAndUpdate(id, body, { new: true });
        if (!project) {
            return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: project });
    } catch (error) {
        console.error('Update error:', error);
        return NextResponse.json({ success: false, error: error }, { status: 400 });
    }
}
