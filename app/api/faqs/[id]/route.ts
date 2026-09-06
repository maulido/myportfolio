import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth-helpers';
import dbConnect from '@/lib/db';
import Faq from '@/models/Faq';

export const dynamic = 'force-dynamic';

// GET - Get single FAQ
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const faq = await Faq.findById(id).lean();

        if (!faq) {
            return NextResponse.json(
                { success: false, error: 'FAQ not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: faq });
    } catch (error) {
        console.error('Error fetching FAQ:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch FAQ' },
            { status: 500 }
        );
    }
}

// PUT - Update FAQ (admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        const updateData: Record<string, unknown> = {};
        if (body.question !== undefined) updateData.question = body.question.trim();
        if (body.question_id !== undefined) updateData.question_id = body.question_id.trim();
        if (body.answer !== undefined) updateData.answer = body.answer.trim();
        if (body.answer_id !== undefined) updateData.answer_id = body.answer_id.trim();
        if (body.category !== undefined) updateData.category = body.category.trim();
        if (body.order !== undefined) updateData.order = Number(body.order) || 0;
        if (body.published !== undefined) updateData.published = Boolean(body.published);

        const faq = await Faq.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!faq) {
            return NextResponse.json(
                { success: false, error: 'FAQ not found' },
                { status: 404 }
            );
        }

        try {
            revalidatePath('/');
            revalidatePath('/contact');
        } catch (revErr) {
            console.warn("revalidatePath error:", revErr);
        }

        return NextResponse.json({ success: true, data: faq });
    } catch (error: unknown) {
        console.error('Error updating FAQ:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to update FAQ' },
            { status: 500 }
        );
    }
}

// DELETE - Delete FAQ (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        await dbConnect();
        const { id } = await params;
        const faq = await Faq.findByIdAndDelete(id);

        if (!faq) {
            return NextResponse.json(
                { success: false, error: 'FAQ not found' },
                { status: 404 }
            );
        }

        try {
            revalidatePath('/');
            revalidatePath('/contact');
        } catch (revErr) {
            console.warn("revalidatePath error:", revErr);
        }

        return NextResponse.json({ success: true, data: faq });
    } catch (error) {
        console.error('Error deleting FAQ:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to delete FAQ' },
            { status: 500 }
        );
    }
}
