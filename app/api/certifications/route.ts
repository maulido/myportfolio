import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth-helpers';
import dbConnect from '@/lib/db';
import Certification from '@/models/Certification';

export async function GET() {
    await dbConnect();

    try {
        const certs = await Certification.find({}).sort({ issueDate: -1 }).lean();
        return NextResponse.json(
            { success: true, data: certs },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
                },
            }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to fetch certifications" },
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
        const cert = await Certification.create(body);

        try {
            revalidatePath('/certifications');
            revalidatePath('/');
        } catch (revErr) {
            console.warn("revalidatePath error:", revErr);
        }

        return NextResponse.json({ success: true, data: cert }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to create certification" },
            { status: 400 }
        );
    }
}
