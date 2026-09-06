import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth-helpers';
import dbConnect from '@/lib/db';
import Faq from '@/models/Faq';

export const dynamic = 'force-dynamic';

const DEFAULT_FAQS = [
    {
        question: "What is your typical turnaround time for new project inquiries?",
        question_id: "Berapa waktu respon standar Anda untuk pertanyaan proyek baru?",
        answer: "I review and reply to all professional inquiries within 2 to 4 business hours. If your message is sent during evenings or weekends, I will reply first thing the next business morning.",
        answer_id: "Saya meninjau dan membalas semua pertanyaan profesional dalam waktu 2 hingga 4 jam kerja. Jika pesan Anda dikirim saat malam hari atau akhir pekan, saya akan membalasnya di pagi hari kerja berikutnya.",
        category: "Inquiry Clarifications",
        order: 0,
        published: true
    },
    {
        question: "Are you available for international or remote contract engagements?",
        question_id: "Apakah Anda bersedia untuk kontrak kerja remote atau internasional?",
        answer: "Yes. I have extensive experience collaborating asynchronously across diverse time zones with distributed engineering teams, as well as providing on-site technical architecture consulting.",
        answer_id: "Ya. Saya berpengalaman berkolaborasi secara asinkron lintas zona waktu dengan tim engineering terdistribusi, serta menyediakan konsultasi arsitektur teknis on-site.",
        category: "Inquiry Clarifications",
        order: 1,
        published: true
    },
    {
        question: "What are your primary technology domains?",
        question_id: "Apa saja domain teknologi utama Anda?",
        answer: "My core expertise bridges two high-impact domains: modern Full-Stack Software Engineering (Next.js, React, TypeScript, Node.js, Cloud Native) and Enterprise Network Infrastructure (Cisco, MikroTik, BGP, OSPF, VLANs, and Network Security).",
        answer_id: "Keahlian utama saya menghubungkan dua domain berdampak tinggi: Rekayasa Perangkat Lunak Full-Stack modern (Next.js, React, TypeScript, Node.js, Cloud Native) dan Infrastruktur Jaringan Enterprise (Cisco, MikroTik, BGP, OSPF, VLANs, dan Keamanan Jaringan).",
        category: "Inquiry Clarifications",
        order: 2,
        published: true
    },
    {
        question: "Can you sign a mutual Non-Disclosure Agreement (NDA) before sharing project specs?",
        question_id: "Bisakah Anda menandatangani Non-Disclosure Agreement (NDA) sebelum pembagian spesifikasi proyek?",
        answer: "Absolutely. I respect intellectual property and proprietary architectures. Feel free to request an NDA execution prior to sharing technical documents or repository access.",
        answer_id: "Tentu saja. Saya sangat menghormati hak kekayaan intelektual dan kerahasiaan arsitektur. Anda dapat mengajukan NDA sebelum membagikan dokumen teknis atau akses repositori.",
        category: "Inquiry Clarifications",
        order: 3,
        published: true
    },
    {
        question: "How do you structure project consulting and implementation milestones?",
        question_id: "Bagaimana Anda menyusun milestone konsultasi dan implementasi proyek?",
        answer: "Every engagement begins with a technical discovery phase to define scope, architectural requirements, and risk mitigation. Deliverables are organized into transparent sprint milestones with continuous testing and documentation.",
        answer_id: "Setiap proyek dimulai dengan tahap technical discovery untuk menentukan ruang lingkup, kebutuhan arsitektur, dan mitigasi risiko. Deliverables diatur dalam sprint milestones yang transparan dengan pengujian dan dokumentasi berkala.",
        category: "Inquiry Clarifications",
        order: 4,
        published: true
    }
];

export async function GET(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const includeAll = searchParams.get('all') === 'true';

        const count = await Faq.countDocuments();
        if (count === 0) {
            await Faq.insertMany(DEFAULT_FAQS);
        }

        const query = includeAll ? {} : { published: true };
        const faqs = await Faq.find(query)
            .sort({ order: 1, createdAt: 1 })
            .lean();

        return NextResponse.json({
            success: true,
            data: faqs
        });
    } catch (error: unknown) {
        console.error('Error fetching FAQs:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch FAQs' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        await dbConnect();
        const body = await request.json();

        if (!body.question || !body.answer) {
            return NextResponse.json(
                { success: false, error: 'Question and answer are required' },
                { status: 400 }
            );
        }

        const faq = await Faq.create({
            question: body.question.trim(),
            question_id: body.question_id ? body.question_id.trim() : undefined,
            answer: body.answer.trim(),
            answer_id: body.answer_id ? body.answer_id.trim() : undefined,
            category: body.category?.trim() || 'General',
            order: typeof body.order === 'number' ? body.order : 0,
            published: body.published !== false
        });

        try {
            revalidatePath('/');
            revalidatePath('/contact');
        } catch (revErr) {
            console.warn("revalidatePath error:", revErr);
        }

        return NextResponse.json({ success: true, data: faq }, { status: 201 });
    } catch (error: unknown) {
        console.error('Error creating FAQ:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to create FAQ' },
            { status: 500 }
        );
    }
}
