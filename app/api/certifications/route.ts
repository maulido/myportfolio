import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Certification from '@/models/Certification';

export async function GET() {
    await dbConnect();

    try {
        const certs = await Certification.find({}).sort({ date: -1 });
        return NextResponse.json({ success: true, data: certs });
    } catch (error) {
        return NextResponse.json({ success: false, error: error }, { status: 400 });
    }
}

export async function POST(req: Request) {
    await dbConnect();

    try {
        const body = await req.json();
        const cert = await Certification.create(body);
        return NextResponse.json({ success: true, data: cert }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error }, { status: 400 });
    }
}
