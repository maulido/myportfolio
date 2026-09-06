import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth-helpers';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';

export async function GET(req: Request) {
    await dbConnect();

    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get('slug');
        const includeAll = searchParams.get('all') === 'true';

        const filter: Record<string, unknown> = {};
        if (slug) {
            filter.slug = slug;
        }
        if (!includeAll) {
            filter.published = { $ne: false };
        }

        const posts = await Post.find(filter).sort({ createdAt: -1 }).lean();

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
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to fetch posts" },
            { status: 400 }
        );
    }
}

export async function POST(req: Request) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    await dbConnect();

    try {
        const body = await req.json();
        const post = await Post.create(body);

        try {
            revalidatePath('/blog');
            revalidatePath('/');
            const postSlug = Array.isArray(post) ? post[0]?.slug : (post as { slug?: string })?.slug;
            if (postSlug) revalidatePath(`/blog/${postSlug}`);
        } catch (revErr) {
            console.warn("revalidatePath error:", revErr);
        }

        return NextResponse.json({ success: true, data: post }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to create post" },
            { status: 400 }
        );
    }
}
