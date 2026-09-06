import { NextResponse } from "next/server";
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

export async function GET() {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        await dbConnect();

        const [
            posts,
            projects,
            certifications,
            careerJourneys,
            skills,
            faqs,
            gallery,
            uses,
            testimonials,
            endorsements,
            guestbook,
            contacts,
            newsletter,
            media,
            settings
        ] = await Promise.all([
            Post.find({}).lean(),
            Project.find({}).lean(),
            Certification.find({}).lean(),
            CareerJourney.find({}).lean(),
            Skill.find({}).lean(),
            Faq.find({}).lean(),
            GalleryItem.find({}).lean(),
            UsesItem.find({}).lean(),
            Testimonial.find({}).lean(),
            Endorsement.find({}).lean(),
            GuestbookEntry.find({}).lean(),
            ContactMessage.find({}).lean(),
            Newsletter.find({}).lean(),
            Media.find({}).lean(),
            Settings.find({}).lean()
        ]);

        const backupData = {
            version: "1.0",
            exportedAt: new Date().toISOString(),
            system: "Antigravity Portfolio Engine",
            counts: {
                posts: posts.length,
                projects: projects.length,
                certifications: certifications.length,
                careerJourneys: careerJourneys.length,
                skills: skills.length,
                faqs: faqs.length,
                gallery: gallery.length,
                uses: uses.length,
                testimonials: testimonials.length,
                endorsements: endorsements.length,
                guestbook: guestbook.length,
                contacts: contacts.length,
                newsletter: newsletter.length,
                media: media.length,
                settings: settings.length
            },
            data: {
                posts,
                projects,
                certifications,
                careerJourneys,
                skills,
                faqs,
                gallery,
                uses,
                testimonials,
                endorsements,
                guestbook,
                contacts,
                newsletter,
                media,
                settings
            }
        };

        const jsonString = JSON.stringify(backupData, null, 2);
        const filename = `portfolio-backup-${new Date().toISOString().split("T")[0]}.json`;

        return new Response(jsonString, {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="${filename}"`
            }
        });
    } catch (error) {
        console.error("Backup export error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to generate database backup"
            },
            { status: 500 }
        );
    }
}
