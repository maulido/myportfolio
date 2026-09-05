import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';

export async function GET() {
    try {
        await dbConnect();

        // Try to find existing aboutMe settings
        let settings = await Settings.findOne({ key: 'aboutMe' }).lean();

        // If not found, create default
        if (!settings) {
            const created = await Settings.create({
                key: 'aboutMe',
                value: true, // dummy value for required field
                aboutMe: {
                    paragraph1: 'I am a passionate professional with a strong background in IT and software development. My journey started with a curiosity about how things work, leading me to specialize in Network Engineering and Software Engineering.',
                    paragraph2: 'I love solving complex problems and building efficient, scalable solutions. Whether it\'s configuring a complex network topology or building a modern web application, I bring dedication and attention to detail to every project.'
                }
            });
            settings = created.toObject();
        }

        return NextResponse.json({
            success: true,
            data: settings?.aboutMe || {}
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
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
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        await dbConnect();
        const body = await req.json();

        console.log('📝 PUT /api/about - Request body:', body);

        // Validate required fields
        if (!body.paragraph1 || !body.paragraph2) {
            console.log('❌ Validation failed: Missing paragraphs');
            return NextResponse.json({
                success: false,
                error: "Both paragraphs are required"
            }, { status: 400 });
        }

        // Check if document exists
        const existing = await Settings.findOne({ key: 'aboutMe' });
        console.log('🔍 Existing document:', existing ? 'Found' : 'Not found');

        // Build update object dynamically to include all fields
        const updateFields: Record<string, string | number | boolean> = {
            key: 'aboutMe',
            value: true,
            'aboutMe.paragraph1': body.paragraph1,
            'aboutMe.paragraph2': body.paragraph2
        };

        if (body.paragraph1_id !== undefined) updateFields['aboutMe.paragraph1_id'] = body.paragraph1_id;
        if (body.paragraph2_id !== undefined) updateFields['aboutMe.paragraph2_id'] = body.paragraph2_id;

        // Add optional fields if provided
        if (body.profilePhotoUrl !== undefined) updateFields['aboutMe.profilePhotoUrl'] = body.profilePhotoUrl;
        if (body.name !== undefined) updateFields['aboutMe.name'] = body.name;
        if (body.title !== undefined) updateFields['aboutMe.title'] = body.title;
        if (body.location !== undefined) updateFields['aboutMe.location'] = body.location;
        if (body.email !== undefined) updateFields['aboutMe.email'] = body.email;
        if (body.phone !== undefined) updateFields['aboutMe.phone'] = body.phone;

        // Handle social links
        if (body.socialLinks) {
            if (body.socialLinks.github !== undefined) updateFields['aboutMe.socialLinks.github'] = body.socialLinks.github;
            if (body.socialLinks.linkedin !== undefined) updateFields['aboutMe.socialLinks.linkedin'] = body.socialLinks.linkedin;
            if (body.socialLinks.twitter !== undefined) updateFields['aboutMe.socialLinks.twitter'] = body.socialLinks.twitter;
            if (body.socialLinks.website !== undefined) updateFields['aboutMe.socialLinks.website'] = body.socialLinks.website;
            if (body.socialLinks.instagram !== undefined) updateFields['aboutMe.socialLinks.instagram'] = body.socialLinks.instagram;
        }

        // Handle stats
        if (body.stats) {
            if (body.stats.yearsExperience !== undefined) updateFields['aboutMe.stats.yearsExperience'] = body.stats.yearsExperience;
            if (body.stats.projectsCompleted !== undefined) updateFields['aboutMe.stats.projectsCompleted'] = body.stats.projectsCompleted;
            if (body.stats.technologiesMastered !== undefined) updateFields['aboutMe.stats.technologiesMastered'] = body.stats.technologiesMastered;
            if (body.stats.certificationsEarned !== undefined) updateFields['aboutMe.stats.certificationsEarned'] = body.stats.certificationsEarned;
        }

        console.log('🔧 Update fields:', Object.keys(updateFields));

        // Update or create settings using $set to ensure nested fields are updated
        const settings = await Settings.findOneAndUpdate(
            { key: 'aboutMe' },
            { $set: updateFields },
            { upsert: true, new: true, runValidators: true }
        );

        console.log('✅ Settings updated:', settings ? 'Success' : 'Failed');
        console.log('📄 Updated data:', settings?.aboutMe);

        return NextResponse.json({ success: true, data: settings.aboutMe });
    } catch (error: unknown) {
        console.error("❌ API PUT About Error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to update About Me content"
        }, { status: 500 });
    }
}
