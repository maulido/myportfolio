import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { testTelegramConnection } from '@/lib/telegram';

/**
 * POST /api/telegram/test
 * Protected admin endpoint to verify Telegram Bot Token and Chat ID
 */
export async function POST(req: Request) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        const body = await req.json().catch(() => ({}));
        const { botToken, chatId } = body;

        const result = await testTelegramConnection(botToken, chatId);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Koneksi berhasil! Pesan uji coba terkirim dari bot @${result.bot?.username || result.bot?.first_name}.`,
            bot: result.bot
        });
    } catch (error: any) {
        console.error('[TELEGRAM TEST API ERROR]', error);
        return NextResponse.json(
            { success: false, error: error?.message || 'Gagal menguji koneksi Telegram.' },
            { status: 500 }
        );
    }
}
