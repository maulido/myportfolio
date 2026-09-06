import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth-helpers';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';

export async function GET(req: Request) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    try {
        if (key) {
            const setting = await Settings.findOne({ key });
            return NextResponse.json({ success: true, data: setting?.value });
        }
        const settings = await Settings.find({});
        return NextResponse.json({ success: true, data: settings });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch settings"
        }, { status: 400 });
    }
}

export async function POST(req: Request) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    await dbConnect();
    try {
        const body = await req.json();

        // Support bulk update: { settings: { key: value, ... } }
        if (body.settings && typeof body.settings === 'object') {
            const bulkOps = Object.entries(body.settings).map(([key, value]) => ({
                updateOne: {
                    filter: { key },
                    update: { $set: { key, value } },
                    upsert: true
                }
            }));

            if (bulkOps.length > 0) {
                await Settings.bulkWrite(bulkOps);
            }

            try {
                const paths = ['/', '/about', '/projects', '/certifications', '/blog', '/gallery', '/uses', '/contact', '/maintenance'];
                paths.forEach(p => {
                    try { revalidatePath(p); } catch {}
                });
                try { revalidatePath('/', 'layout'); } catch {}
            } catch (revErr) {
                console.warn("revalidatePath error:", revErr);
            }

            return NextResponse.json({ success: true, message: "Settings updated successfully" });
        }

        // Single key-value update: { key, value }
        const { key, value } = body;
        if (!key) {
            return NextResponse.json({ success: false, error: "Key is required" }, { status: 400 });
        }

        const setting = await Settings.findOneAndUpdate(
            { key },
            { value },
            { upsert: true, new: true }
        );

        try {
            const paths = ['/', '/about', '/projects', '/certifications', '/blog', '/gallery', '/uses', '/contact', '/maintenance'];
            paths.forEach(p => {
                try { revalidatePath(p); } catch {}
            });
            try { revalidatePath('/', 'layout'); } catch {}
        } catch (revErr) {
            console.warn("revalidatePath error:", revErr);
        }

        return NextResponse.json({ success: true, data: setting });
    } catch (error) {
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Failed to update settings" }, { status: 400 });
    }
}
