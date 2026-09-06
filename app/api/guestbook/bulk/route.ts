import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth-helpers';
import dbConnect from '@/lib/db';
import GuestbookEntry from '@/models/GuestbookEntry';

export async function POST(request: NextRequest) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        await dbConnect();

        const { action, ids } = await request.json();

        if (!action || !ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid request' },
                { status: 400 }
            );
        }

        let result;

        switch (action) {
            case 'approve':
                result = await GuestbookEntry.updateMany(
                    { _id: { $in: ids } },
                    { approved: true, spam: false }
                );
                break;

            case 'reject':
            case 'delete':
                result = await GuestbookEntry.deleteMany(
                    { _id: { $in: ids } }
                );
                break;

            case 'spam':
                result = await GuestbookEntry.updateMany(
                    { _id: { $in: ids } },
                    { spam: true, approved: false }
                );
                break;

            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid action' },
                    { status: 400 }
                );
        }

        try {
            revalidatePath('/guestbook');
            revalidatePath('/');
        } catch (revErr) {
            console.warn("revalidatePath error:", revErr);
        }

        return NextResponse.json({
            success: true,
            data: result,
            message: `Successfully ${action}ed ${ids.length} item(s)`
        });
    } catch (error: unknown) {
        console.error('Bulk guestbook operation error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to perform bulk operation' },
            { status: 500 }
        );
    }
}
