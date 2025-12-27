import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { success: false, message: 'Email is required' },
                { status: 400 }
            );
        }

        // MOCK: In a real app, you would save this to Mailcham/ConvertKit/Database
        console.log(`[Mock Newsletter] Subscribed: ${email}`);

        return NextResponse.json({
            success: true,
            message: 'Successfully subscribed to the newsletter!',
        });
    } catch (error) {
        console.error('Newsletter API Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
