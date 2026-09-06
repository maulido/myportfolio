import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-helpers";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import Project from "@/models/Project";
import Certification from "@/models/Certification";
import CareerJourney from "@/models/CareerJourney";
import Skill from "@/models/Skill";
import Faq from "@/models/Faq";
import GalleryItem from "@/models/GalleryItem";
import UsesItem from "@/models/UsesItem";
import Testimonial from "@/models/Testimonial";
import Endorsement from "@/models/Endorsement";
import GuestbookEntry from "@/models/GuestbookEntry";
import ContactMessage from "@/models/ContactMessage";
import Newsletter from "@/models/Newsletter";
import Media from "@/models/Media";
import Settings from "@/models/Settings";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        const body = await req.json();
        const payloadData = body.data?.data || body.data || body;
        const mode = body.mode || "upsert"; // "upsert" or "replace"

        if (!payloadData || typeof payloadData !== "object") {
            return NextResponse.json(
                { success: false, error: "Invalid backup data format." },
                { status: 400 }
            );
        }

        await dbConnect();

        // Model mapping
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const modelMap: Record<string, any> = {
            posts: Post,
            projects: Project,
            certifications: Certification,
            careerJourneys: CareerJourney,
            skills: Skill,
            faqs: Faq,
            gallery: GalleryItem,
            uses: UsesItem,
            testimonials: Testimonial,
            endorsements: Endorsement,
            guestbook: GuestbookEntry,
            contacts: ContactMessage,
            newsletter: Newsletter,
            media: Media,
            settings: Settings
        };
        /* eslint-enable @typescript-eslint/no-explicit-any */

        const restoreSummary: Record<string, number> = {};

        for (const [key, Model] of Object.entries(modelMap)) {
            const items = payloadData[key];
            if (!Array.isArray(items) || items.length === 0) continue;

            if (mode === "replace") {
                await Model.deleteMany({});
                if (items.length > 0) {
                    await Model.insertMany(items, { ordered: false });
                }
                restoreSummary[key] = items.length;
            } else {
                // Upsert mode: strip _id to avoid MongoDB immutable field modification error
                let count = 0;
                for (const item of items) {
                    const { _id, ...cleanItem } = item;
                    if (key === "settings" && item.key) {
                        await Model.findOneAndUpdate(
                            { key: item.key },
                            { $set: cleanItem },
                            { upsert: true, new: true }
                        );
                        count++;
                    } else if (_id) {
                        await Model.findByIdAndUpdate(
                            _id,
                            { $set: cleanItem },
                            { upsert: true, new: true }
                        );
                        count++;
                    } else if (cleanItem.slug) {
                        await Model.findOneAndUpdate(
                            { slug: cleanItem.slug },
                            { $set: cleanItem },
                            { upsert: true, new: true }
                        );
                        count++;
                    } else {
                        await Model.create(cleanItem);
                        count++;
                    }
                }
                restoreSummary[key] = count;
            }
        }

        try {
            const paths = ["/", "/about", "/projects", "/certifications", "/blog", "/gallery", "/uses", "/contact", "/maintenance"];
            paths.forEach(p => {
                try { revalidatePath(p); } catch {}
            });
            try { revalidatePath("/", "layout"); } catch {}
        } catch (e) {
            console.warn("Revalidation warning during restore:", e);
        }

        return NextResponse.json({
            success: true,
            message: `Restore completed successfully (${mode} mode)`,
            summary: restoreSummary
        });
    } catch (error) {
        console.error("Backup restore error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to restore backup"
            },
            { status: 500 }
        );
    }
}
