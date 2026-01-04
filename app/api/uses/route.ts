import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UsesItem from '@/models/UsesItem';

// GET - Get all uses items grouped by category
export async function GET() {
    try {
        await dbConnect();

        const items = await UsesItem.find()
            .sort({ category: 1, order: 1, createdAt: -1 })
            .lean();

        // Group by category
        const groupedItems = items.reduce((acc: any, item) => {
            if (!acc[item.category]) {
                acc[item.category] = [];
            }
            acc[item.category].push(item);
            return acc;
        }, {});

        return NextResponse.json({
            success: true,
            data: groupedItems,
            items: items // Also return flat list
        });
    } catch (error) {
        console.error('Error fetching uses items:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch uses items' },
            { status: 500 }
        );
    }
}

// POST - Create new uses item (admin only)
export async function POST(request: Request) {
    try {
        await dbConnect();

        const body = await request.json();
        const item = await UsesItem.create(body);

        return NextResponse.json({ success: true, data: item }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating uses item:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create uses item' },
            { status: 500 }
        );
    }
}
