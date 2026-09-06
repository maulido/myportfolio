import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import GuestbookEntry from '@/models/GuestbookEntry';
import { rateLimit } from '@/lib/rate-limit';
import { requireAuth } from '@/lib/auth-helpers';
import { notifyGuestbookSubmission } from '@/lib/telegram';

const guestbookLimiter = rateLimit({
    interval: 5 * 60 * 1000, // 5 minutes
    uniqueTokenPerInterval: 500,
});

// GET - Get approved guestbook entries (public) or admin list
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
        const skip = (page - 1) * limit;
        const search = searchParams.get('search')?.trim();
        const sort = searchParams.get('sort') || 'newest';
        const isAdminQuery = searchParams.get('admin') === 'true';

        // Admin mode query: requires authentication
        if (isAdminQuery) {
            const authResult = await requireAuth();
            if (authResult instanceof NextResponse) return authResult;

            const status = searchParams.get('status') || 'pending';
            const adminFilter: Record<string, unknown> = {};

            if (status === 'pending') {
                adminFilter.approved = false;
                adminFilter.spam = false;
            } else if (status === 'approved') {
                adminFilter.approved = true;
                adminFilter.spam = false;
            } else if (status === 'spam') {
                adminFilter.spam = true;
            }

            if (search) {
                const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                adminFilter.$or = [
                    { name: { $regex: escapedSearch, $options: 'i' } },
                    { message: { $regex: escapedSearch, $options: 'i' } },
                    { email: { $regex: escapedSearch, $options: 'i' } }
                ];
            }

            const [entries, total, pendingCount, approvedCount, spamCount] = await Promise.all([
                GuestbookEntry.find(adminFilter)
                    .sort({ pinned: -1, createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                GuestbookEntry.countDocuments(adminFilter),
                GuestbookEntry.countDocuments({ approved: false, spam: false }),
                GuestbookEntry.countDocuments({ approved: true, spam: false }),
                GuestbookEntry.countDocuments({ spam: true }),
            ]);

            return NextResponse.json({
                success: true,
                data: entries,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                },
                counts: {
                    pending: pendingCount,
                    approved: approvedCount,
                    spam: spamCount
                }
            });
        }

        // Public mode: only approved and non-spam entries
        const filter: Record<string, unknown> = { approved: true, spam: false };

        if (search) {
            const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.$or = [
                { name: { $regex: escapedSearch, $options: 'i' } },
                { message: { $regex: escapedSearch, $options: 'i' } }
            ];
        }

        // Sorting configuration: pinned entries always appear first
        const sortConfig: Record<string, 1 | -1> = { pinned: -1 };
        if (sort === 'popular') {
            sortConfig.likes = -1;
            sortConfig.createdAt = -1;
        } else if (sort === 'oldest') {
            sortConfig.createdAt = 1;
        } else {
            sortConfig.createdAt = -1;
        }

        const [entries, total, totalPinned, totalLikesResult] = await Promise.all([
            GuestbookEntry.find(filter)
                .sort(sortConfig)
                .skip(skip)
                .limit(limit)
                .select('-email -ipAddress') // Never expose email and IP to public
                .lean(),
            GuestbookEntry.countDocuments(filter),
            GuestbookEntry.countDocuments({ approved: true, spam: false, pinned: true }),
            GuestbookEntry.aggregate([
                { $match: { approved: true, spam: false } },
                { $group: { _id: null, totalLikes: { $sum: '$likes' } } }
            ])
        ]);

        const totalLikes = totalLikesResult[0]?.totalLikes || 0;

        return NextResponse.json(
            {
                success: true,
                data: entries,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                },
                stats: {
                    totalSignatures: total,
                    totalPinned,
                    totalLikes
                }
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
                },
            }
        );
    } catch (error) {
        console.error('Error fetching guestbook entries:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch entries' },
            { status: 500 }
        );
    }
}

// POST - Submit new guestbook entry
export async function POST(request: NextRequest) {
    try {
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';

        try {
            await guestbookLimiter.check(5, ip); // Max 5 submissions per 5 minutes per IP
        } catch {
            return NextResponse.json(
                { success: false, error: 'Too many submissions. Please wait a few minutes before trying again.' },
                { status: 429 }
            );
        }

        await dbConnect();

        const body = await request.json();
        const { sanitizeText, sanitizeEmail } = await import('@/lib/sanitize');
        const name = sanitizeText(body?.name);
        const message = sanitizeText(body?.message);
        const email = body?.email ? sanitizeEmail(body.email) : undefined;
        const website = body?.website ? sanitizeText(body.website) : undefined;

        if (!name || !message) {
            return NextResponse.json(
                { success: false, error: 'Valid name and message are required.' },
                { status: 400 }
            );
        }

        // Simple rate limiting check - max 10 entries per IP in last hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentEntries = await GuestbookEntry.countDocuments({
            ipAddress: ip,
            createdAt: { $gte: oneHourAgo }
        });

        if (recentEntries >= 10) {
            return NextResponse.json(
                { success: false, error: 'You have reached the maximum number of submissions (10 per hour). Please try again later.' },
                { status: 429 }
            );
        }

        const entry = await GuestbookEntry.create({
            name,
            message,
            email,
            website,
            ipAddress: ip,
            approved: false, // Require approval by default
            spam: false
        });

        // Send Telegram notification in background (non-blocking)
        notifyGuestbookSubmission({
            name,
            message,
            email,
            website,
            ip
        }).catch((err) => {
            console.warn('[GUESTBOOK API] Failed to send Telegram notification:', err);
        });

        return NextResponse.json({
            success: true,
            data: entry,
            message: 'Thank you! Your message will appear after approval.'
        }, { status: 201 });
    } catch (error: unknown) {
        console.error('Error creating guestbook entry:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to submit entry' },
            { status: 500 }
        );
    }
}
