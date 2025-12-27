import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';

import mongoose from 'mongoose';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await dbConnect();

    try {
        const isObjectId = mongoose.Types.ObjectId.isValid(id);
        const query = isObjectId ? { _id: id } : { slug: id };
        const post = await Post.findOne(query);

        if (!post) {
            return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: post });
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
        const deletedPost = await Post.findByIdAndDelete(id);
        if (!deletedPost) {
            return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
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
        const post = await Post.findByIdAndUpdate(id, body, { new: true });
        if (!post) {
            return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: post });
    } catch (error) {
        return NextResponse.json({ success: false, error: error }, { status: 400 });
    }
}
