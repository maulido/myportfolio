import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import Project from "@/models/Project";
import Skill from "@/models/Skill";
import Certification from "@/models/Certification";

export async function POST(req: NextRequest) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        const { ids, type } = await req.json();

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { success: false, message: "No IDs provided" },
                { status: 400 }
            );
        }

        await dbConnect();

        let result;
        switch (type) {
            case 'post':
                result = await Post.deleteMany({ _id: { $in: ids } });
                break;
            case 'project':
                result = await Project.deleteMany({ _id: { $in: ids } });
                break;
            case 'skill':
                result = await Skill.deleteMany({ _id: { $in: ids } });
                break;
            case 'certification':
                result = await Certification.deleteMany({ _id: { $in: ids } });
                break;
            default:
                return NextResponse.json(
                    { success: false, message: "Invalid type" },
                    { status: 400 }
                );
        }

        return NextResponse.json({
            success: true,
            message: `Successfully deleted ${result.deletedCount} items`,
            deletedCount: result.deletedCount
        });

    } catch (error) {
        console.error("Bulk delete error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
