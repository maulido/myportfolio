import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';

export async function GET() {
    try {
        await dbConnect();

        // Try to find existing aboutMe settings
        let settings = await Settings.findOne({ key: 'aboutMe' });

        // If not found, create default
        if (!settings) {
            settings = await Settings.create({
                key: 'aboutMe',
                value: true, // dummy value for required field
                aboutMe: {
                    paragraph1: 'I am a passionate professional with a strong background in IT and software development. My journey started with a curiosity about how things work, leading me to specialize in Network Engineering and Software Engineering.',
                    paragraph2: 'I love solving complex problems and building efficient, scalable solutions. Whether it\'s configuring a complex network topology or building a modern web application, I bring dedication and attention to detail to every project.'
                }
            });
        }

        return NextResponse.json({
            success: true,
            data: settings.aboutMe || {
                paragraph1: '',
                paragraph2: ''
            }
        });
    } catch (error: unknown) {
        console.error("API GET About Error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch About Me content"
        }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        // Validate required fields
        if (!body.paragraph1 || !body.paragraph2) {
            return NextResponse.json({
                success: false,
                error: "Both paragraphs are required"
            }, { status: 400 });
        }

        // Update or create settings
        const settings = await Settings.findOneAndUpdate(
            { key: 'aboutMe' },
            {
                key: 'aboutMe',
                value: true,
                aboutMe: {
                    paragraph1: body.paragraph1,
                    paragraph2: body.paragraph2
                }
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, data: settings.aboutMe });
    } catch (error: unknown) {
        console.error("API PUT About Error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to update About Me content"
        }, { status: 500 });
    }
}
