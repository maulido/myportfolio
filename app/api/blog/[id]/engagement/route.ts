import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: slug } = await params;
        await dbConnect();

        const post = await Post.findOne({ slug }).select("views likes");

        if (!post) {
            return NextResponse.json(
                { success: false, message: "Post not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                views: post.views || 0,
                likes: post.likes || 0
            }
        });
    } catch (error) {
        console.error("Error fetching engagement data:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: slug } = await params;
        const { action } = await request.json();

        if (!['view', 'like'].includes(action)) {
            return NextResponse.json(
                { success: false, message: "Invalid action" },
                { status: 400 }
            );
        }

        await dbConnect();

        const update = action === 'view'
            ? { $inc: { views: 1 } }
            : { $inc: { likes: 1 } };

        const post = await Post.findOneAndUpdate(
            { slug },
            update,
            { new: true }
        ).select("views likes");

        if (!post) {
            return NextResponse.json(
                { success: false, message: "Post not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                views: post.views,
                likes: post.likes
            }
        });
    } catch (error) {
        console.error("Error updating engagement:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
