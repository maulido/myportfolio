import { getGlobalSettings } from '@/lib/settings';

/**
 * Escapes HTML characters for Telegram HTML parse mode
 */
export function escapeTelegramHtml(text: string = ''): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Helper to resolve Telegram Bot Token and Chat ID
 * Priority: Admin Settings (Database) -> Environment Variables (.env)
 */
export async function getTelegramCredentials() {
    let enabled = false;
    let botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    let chatId = process.env.TELEGRAM_CHAT_ID || '';
    let notifyContact = true;
    let notifyGuestbook = true;

    try {
        const settings = await getGlobalSettings();
        if (settings.telegramBotToken) {
            botToken = settings.telegramBotToken.trim();
        }
        if (settings.telegramChatId) {
            chatId = settings.telegramChatId.trim();
        }
        // If telegramEnabled is explicitly "false", disable. Defaults to true if token & chatId exist.
        if (settings.telegramEnabled !== undefined) {
            enabled = settings.telegramEnabled === 'true';
        } else {
            enabled = Boolean(botToken && chatId);
        }

        if (settings.telegramNotifyContact !== undefined) {
            notifyContact = settings.telegramNotifyContact === 'true';
        }
        if (settings.telegramNotifyGuestbook !== undefined) {
            notifyGuestbook = settings.telegramNotifyGuestbook === 'true';
        }
    } catch (err) {
        console.warn('[TELEGRAM] Could not load settings from DB, falling back to env:', err);
        enabled = Boolean(botToken && chatId);
    }

    return {
        enabled,
        botToken,
        chatId,
        notifyContact,
        notifyGuestbook
    };
}

/**
 * Get the public site URL for action links
 */
function getSiteBaseUrl(): string {
    return (
        process.env.NEXT_PUBLIC_BASE_URL ||
        process.env.NEXTAUTH_URL ||
        'http://localhost:3000'
    ).replace(/\/$/, '');
}

interface TelegramInlineButton {
    text: string;
    url?: string;
    callback_data?: string;
}

interface SendTelegramOptions {
    text: string;
    inlineKeyboard?: TelegramInlineButton[][];
    customToken?: string;
    customChatId?: string;
}

/**
 * Core function to send message via Telegram Bot API
 */
export async function sendTelegramMessage(options: SendTelegramOptions): Promise<{ success: boolean; data?: any; error?: string }> {
    const { text, inlineKeyboard, customToken, customChatId } = options;

    const creds = await getTelegramCredentials();
    const token = customToken || creds.botToken;
    const targetChatId = customChatId || creds.chatId;

    if (!token || !targetChatId) {
        return {
            success: false,
            error: 'Telegram Bot Token or Chat ID is not configured.'
        };
    }

    const payload: Record<string, any> = {
        chat_id: targetChatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
    };

    if (inlineKeyboard && inlineKeyboard.length > 0) {
        payload.reply_markup = {
            inline_keyboard: inlineKeyboard
        };
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok || !data.ok) {
            console.error('[TELEGRAM API ERROR]', data);
            return {
                success: false,
                error: data?.description || `HTTP Error ${response.status}`
            };
        }

        return {
            success: true,
            data: data.result
        };
    } catch (err: any) {
        const errorMessage = err?.name === 'AbortError' 
            ? 'Request to Telegram API timed out after 6 seconds' 
            : err?.message || 'Unknown network error';
        console.error('[TELEGRAM ERROR]', errorMessage);
        return {
            success: false,
            error: errorMessage
        };
    }
}

/**
 * Test Telegram Bot connection and send a test greeting
 */
export async function testTelegramConnection(tokenOverride?: string, chatIdOverride?: string) {
    const creds = await getTelegramCredentials();
    const token = (tokenOverride || creds.botToken || '').trim();
    const chatId = (chatIdOverride || creds.chatId || '').trim();

    if (!token) {
        return { success: false, error: 'Telegram Bot Token is missing.' };
    }
    if (!chatId) {
        return { success: false, error: 'Telegram Chat ID is missing.' };
    }

    try {
        // Step 1: Verify token with getMe
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const getMeRes = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        const getMeData = await getMeRes.json();
        if (!getMeRes.ok || !getMeData.ok) {
            return {
                success: false,
                error: `Invalid Bot Token: ${getMeData?.description || 'Unauthorized'}`
            };
        }

        const botInfo = getMeData.result;
        const siteUrl = getSiteBaseUrl();
        const nowStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

        // Step 2: Send test message to Chat ID
        const testText = [
            `🚀 <b>Uji Coba Notifikasi Telegram Berhasil!</b>`,
            ``,
            `🤖 <b>Nama Bot:</b> @${escapeTelegramHtml(botInfo.username || botInfo.first_name)}`,
            `🆔 <b>ID Bot:</b> <code>${botInfo.id}</code>`,
            `🎯 <b>Target Chat ID:</b> <code>${chatId}</code>`,
            `🕒 <b>Waktu:</b> ${nowStr} WIB`,
            ``,
            `✅ Bot telah berhasil terhubung dengan sistem website portfolio Anda. Notifikasi Contact Form dan Guestbook akan dikirimkan ke obrolan ini.`
        ].join('\n');

        const sendResult = await sendTelegramMessage({
            text: testText,
            customToken: token,
            customChatId: chatId,
            inlineKeyboard: [
                [
                    { text: '🖥️ Buka Panel Admin', url: `${siteUrl}/admin` }
                ]
            ]
        });

        if (!sendResult.success) {
            return {
                success: false,
                error: `Bot token valid, tapi gagal mengirim ke Chat ID: ${sendResult.error}. Pastikan Anda telah menekan /start pada bot ini.`
            };
        }

        return {
            success: true,
            bot: botInfo
        };
    } catch (err: any) {
        return {
            success: false,
            error: err?.message || 'Failed to connect to Telegram API'
        };
    }
}

/**
 * Dispatch notification for a new Contact Message
 */
export async function notifyContactSubmission({
    name,
    email,
    message,
    ip
}: {
    name: string;
    email: string;
    message: string;
    ip?: string;
}) {
    try {
        const creds = await getTelegramCredentials();
        if (!creds.enabled || !creds.notifyContact) {
            return;
        }

        const siteUrl = getSiteBaseUrl();
        const nowStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        const cleanName = escapeTelegramHtml(name);
        const cleanEmail = escapeTelegramHtml(email);
        const cleanMessage = escapeTelegramHtml(message);
        const cleanIp = escapeTelegramHtml(ip || '-');

        const text = [
            `📬 <b>Pesan Kontak Baru Diterima!</b>`,
            ``,
            `👤 <b>Pengirim:</b> ${cleanName}`,
            `✉️ <b>Email:</b> ${cleanEmail}`,
            `🌐 <b>IP Address:</b> <code>${cleanIp}</code>`,
            `🕒 <b>Waktu:</b> ${nowStr} WIB`,
            ``,
            `💬 <b>Isi Pesan:</b>`,
            `<i>"${cleanMessage}"</i>`
        ].join('\n');

        const inlineKeyboard: TelegramInlineButton[][] = [
            [
                { text: '✉️ Balas via Email', url: `mailto:${cleanEmail}?subject=Re:%20Portfolio%20Inquiry` },
                { text: '🖥️ Buka Admin', url: `${siteUrl}/admin` }
            ]
        ];

        await sendTelegramMessage({
            text,
            inlineKeyboard
        });
    } catch (err) {
        console.error('[TELEGRAM] Error in notifyContactSubmission:', err);
    }
}

/**
 * Dispatch notification for a new Guestbook Entry
 */
export async function notifyGuestbookSubmission({
    name,
    message,
    email,
    website,
    ip
}: {
    name: string;
    message: string;
    email?: string;
    website?: string;
    ip?: string;
}) {
    try {
        const creds = await getTelegramCredentials();
        if (!creds.enabled || !creds.notifyGuestbook) {
            return;
        }

        const siteUrl = getSiteBaseUrl();
        const nowStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        const cleanName = escapeTelegramHtml(name);
        const cleanMessage = escapeTelegramHtml(message);
        const cleanEmail = email ? escapeTelegramHtml(email) : '-';
        const cleanWebsite = website ? escapeTelegramHtml(website) : '-';
        const cleanIp = escapeTelegramHtml(ip || '-');

        const text = [
            `📖 <b>Tanda Tangan Buku Tamu Baru!</b>`,
            ``,
            `👤 <b>Nama:</b> ${cleanName}`,
            `✉️ <b>Email:</b> ${cleanEmail}`,
            `🌐 <b>Website:</b> ${cleanWebsite}`,
            `📍 <b>IP:</b> <code>${cleanIp}</code>`,
            `🕒 <b>Waktu:</b> ${nowStr} WIB`,
            `⚠️ <b>Status:</b> <i>Menunggu Moderasi / Persetujuan</i>`,
            ``,
            `✍️ <b>Pesan:</b>`,
            `<i>"${cleanMessage}"</i>`
        ].join('\n');

        const inlineKeyboard: TelegramInlineButton[][] = [
            [
                { text: '🛡️ Moderasi Buku Tamu', url: `${siteUrl}/admin/guestbook` },
                { text: '📖 Buka Guestbook Publik', url: `${siteUrl}/guestbook` }
            ]
        ];

        await sendTelegramMessage({
            text,
            inlineKeyboard
        });
    } catch (err) {
        console.error('[TELEGRAM] Error in notifyGuestbookSubmission:', err);
    }
}
