import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import OTP from '@/models/OTP';

export async function POST(req: Request) {
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ success: false, error: "Email and OTP are required" }, { status: 400 });
        }

        await dbConnect();

        const record = await OTP.findOne({ email, otp });

        if (!record) {
            return NextResponse.json({ success: false, error: "Invalid or expired OTP" }, { status: 400 });
        }

        // Delete OTP after successful verification
        await OTP.deleteOne({ _id: record._id });

        // In a real app, you would return a signed URL or a temporary token.
        // For now, we'll return success and the frontend will handle the download.
        return NextResponse.json({
            success: true,
            message: "OTP verified!",
            downloadUrl: "/cv.pdf" // Path to the CV in public folder
        });
    } catch (error) {
        console.error("OTP Verify Error:", error);
        return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
    }
}
