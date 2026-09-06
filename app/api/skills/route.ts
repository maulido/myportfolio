import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth-helpers';
import dbConnect from '@/lib/db';
import Skill from '@/models/Skill';

export async function GET() {
    try {
        await dbConnect();

        const skills = await Skill.find({}).sort({ category: 1, order: 1 }).lean();

        // Group skills by category
        const groupedSkills = skills.reduce((acc: Record<string, typeof skill[]>, skill) => {
            const category = skill.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(skill);
            return acc;
        }, {});

        // Convert to array format
        const result = Object.keys(groupedSkills).map(category => ({
            category,
            skills: groupedSkills[category]
        }));

        return NextResponse.json(
            { success: true, data: result },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
                },
            }
        );
    } catch (error: unknown) {
        console.error("API GET Skills Error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch skills"
        }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        await dbConnect();
        const body = await req.json();

        // Validate required fields
        if (!body.name || !body.level || body.years === undefined || !body.category || !body.icon) {
            return NextResponse.json({
                success: false,
                error: "Name, level, years, category, and icon are required"
            }, { status: 400 });
        }

        const skill = await Skill.create(body);

        try {
            revalidatePath('/');
            revalidatePath('/about');
        } catch (revErr) {
            console.warn("revalidatePath error:", revErr);
        }

        return NextResponse.json({ success: true, data: skill }, { status: 201 });
    } catch (error: unknown) {
        console.error("API POST Skills Error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to create skill"
        }, { status: 400 });
    }
}
