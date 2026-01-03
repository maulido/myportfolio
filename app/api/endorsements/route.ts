import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Endorsement from '@/models/Endorsement';

// Get endorsement counts for all skills
export async function GET() {
    try {
        await dbConnect();

        const endorsements = await Endorsement.aggregate([
            {
                $group: {
                    _id: '$skill',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    skill: '$_id',
                    count: 1,
                    _id: 0
                }
            }
        ]);

        const endorsementMap = endorsements.reduce((acc: any, item) => {
            acc[item.skill] = item.count;
            return acc;
        }, {});

        return NextResponse.json({
            success: true,
            data: endorsementMap
        });
    } catch (error) {
        console.error('Error fetching endorsements:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch endorsements'
        }, { status: 500 });
    }
}

// Endorse a skill
export async function POST(req: NextRequest) {
    try {
        const { skill, email, name } = await req.json();

        if (!skill) {
            return NextResponse.json({
                success: false,
                message: 'Skill is required'
            }, { status: 400 });
        }

        await dbConnect();

        // Get IP address
        const ip = req.headers.get('x-forwarded-for') ||
            req.headers.get('x-real-ip') ||
            'unknown';

        // Check if already endorsed (rate limiting)
        const existingEndorsement = await Endorsement.findOne({
            skill,
            endorserIp: ip,
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        });

        if (existingEndorsement) {
            return NextResponse.json({
                success: false,
                message: 'You have already endorsed this skill recently'
            }, { status: 429 });
        }

        // Create endorsement
        await Endorsement.create({
            skill,
            endorserEmail: email,
            endorserName: name,
            endorserIp: ip,
        });

        // Get updated count
        const count = await Endorsement.countDocuments({ skill });

        return NextResponse.json({
            success: true,
            message: 'Skill endorsed successfully!',
            data: { skill, count }
        });
    } catch (error) {
        console.error('Error endorsing skill:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to endorse skill'
        }, { status: 500 });
    }
}
