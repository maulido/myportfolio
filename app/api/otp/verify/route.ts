import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import OTP from '@/models/OTP';
import { getGlobalSettings } from '@/lib/settings';

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

        // Retrieve configured resume URL from settings, falling back to default /cv.pdf
        const settings = await getGlobalSettings();
        const downloadUrl = settings.resumeUrl || "/cv.pdf";

        return NextResponse.json({
            success: true,
            message: "OTP verified!",
            downloadUrl
        });
    } catch (error) {
        console.error("OTP Verify Error:", error);
        return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
    }
}
