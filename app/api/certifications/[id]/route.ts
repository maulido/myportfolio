import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth-helpers';
import dbConnect from '@/lib/db';
import Certification from '@/models/Certification';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    await dbConnect();

    try {
        const deletedCert = await Certification.findByIdAndDelete(id);
        if (!deletedCert) {
            return NextResponse.json({ success: false, error: "Certification not found" }, { status: 404 });
        }

        try {
            revalidatePath('/certifications');
            revalidatePath('/');
        } catch (revErr) {
            console.warn("revalidatePath error:", revErr);
        }

        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to delete certification" },
            { status: 400 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    await dbConnect();

    try {
        const body = await request.json();
        const cert = await Certification.findByIdAndUpdate(id, body, { new: true });
        if (!cert) {
            return NextResponse.json({ success: false, error: "Certification not found" }, { status: 404 });
        }

        try {
            revalidatePath('/certifications');
            revalidatePath('/');
        } catch (revErr) {
            console.warn("revalidatePath error:", revErr);
        }

        return NextResponse.json({ success: true, data: cert });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to update certification" },
            { status: 400 }
        );
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await dbConnect();

    try {
        const cert = await Certification.findById(id);
        if (!cert) {
            return NextResponse.json({ success: false, error: "Certification not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: cert });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to fetch certification" },
            { status: 400 }
        );
    }
}
