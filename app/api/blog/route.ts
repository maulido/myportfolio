import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';

export async function GET(req: Request) {
    await dbConnect();

    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get('slug');

        let posts;
        if (slug) {
            posts = await Post.find({ slug }).lean();
        } else {
            posts = await Post.find({}).sort({ createdAt: -1 }).lean();
        }

        return NextResponse.json(
            { success: true, data: posts },
            {
                headers: {
                    // Cache for 1 hour, revalidate in background for 24 hours
                    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
                }
            }
        );
    } catch (error) {
        return NextResponse.json({ success: false, error: error }, { status: 400 });
    }
}

export async function POST(req: Request) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    await dbConnect();

    try {
        const body = await req.json();
        const post = await Post.create(body);
        return NextResponse.json({ success: true, data: post }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error }, { status: 400 });
    }
}
