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
 * Validates if a URL is strictly acceptable for Telegram InlineKeyboardButton
 * Requirements from Telegram API:
 * 1. Must be http://, https://, or tg://
 * 2. Cannot be mailto:
 * 3. Cannot be localhost or local/private IP addresses
 * 4. Must have a valid dot in domain
 */
export function isValidTelegramButtonUrl(url?: string): boolean {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (trimmed.startsWith('mailto:')) return false;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('tg://')) return false;
    if (
        trimmed.includes('localhost') ||
        trimmed.includes('127.0.0.1') ||
        trimmed.includes('0.0.0.0') ||
        trimmed.includes('::1')
    ) {
        return false;
    }
    try {
        const parsed = new URL(trimmed);
        return parsed.hostname.includes('.');
    } catch {
        return false;
    }
}

interface TelegramInlineButton {
    text: string;
    url?: string;
    callback_data?: string;
}

/**
 * Filters rows of inline keyboard buttons so only valid URLs are sent.
 * Drops buttons and rows that fail Telegram's URL validation.
 */
export function filterValidInlineKeyboard(inlineKeyboard?: TelegramInlineButton[][]): TelegramInlineButton[][] | undefined {
    if (!inlineKeyboard || inlineKeyboard.length === 0) return undefined;
    const validRows: TelegramInlineButton[][] = [];
    for (const row of inlineKeyboard) {
        const validButtons = row.filter(btn => isValidTelegramButtonUrl(btn.url));
        if (validButtons.length > 0) {
            validRows.push(validButtons);
        }
    }
    return validRows.length > 0 ? validRows : undefined;
}

/**
 * Helper to resolve Telegram Bot Token and Chat ID
 * Priority: Admin Settings (Database) -> Environment Variables (.env)
 */
export async function getTelegramCredentials() {
    let enabled = false;
    let botToken = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
    let chatId = (process.env.TELEGRAM_CHAT_ID || '').trim();
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

        // Check enabled state:
        // If explicitly set to "false", disable.
        // If set to "true", enable.
        // If undefined/empty but botToken & chatId are provided, auto-enable!
        if (settings.telegramEnabled === 'false') {
            enabled = false;
        } else if (settings.telegramEnabled === 'true') {
            enabled = Boolean(botToken && chatId);
        } else {
            enabled = Boolean(botToken && chatId);
        }

        if (settings.telegramNotifyContact !== undefined) {
            notifyContact = settings.telegramNotifyContact !== 'false';
        }
        if (settings.telegramNotifyGuestbook !== undefined) {
            notifyGuestbook = settings.telegramNotifyGuestbook !== 'false';
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

interface SendTelegramOptions {
    text: string;
    inlineKeyboard?: TelegramInlineButton[][];
    customToken?: string;
    customChatId?: string;
}

/**
 * Core function to send message via Telegram Bot API with automatic retry fallback
 */
export async function sendTelegramMessage(options: SendTelegramOptions): Promise<{ success: boolean; data?: unknown; error?: string }> {
    const { text, inlineKeyboard, customToken, customChatId } = options;

    const creds = await getTelegramCredentials();
    const token = (customToken || creds.botToken || '').trim();
    const rawChatId = (customChatId || creds.chatId || '').trim();
    const targetChatId = rawChatId.replace(/["'\s]/g, '');

    if (!token || !targetChatId) {
        return {
            success: false,
            error: 'Telegram Bot Token atau Chat ID belum diisi.'
        };
    }

    const cleanInlineKeyboard = filterValidInlineKeyboard(inlineKeyboard);

    const payload: Record<string, unknown> = {
        chat_id: targetChatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
    };

    if (cleanInlineKeyboard && cleanInlineKeyboard.length > 0) {
        payload.reply_markup = {
            inline_keyboard: cleanInlineKeyboard
        };
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout

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
            console.warn('[TELEGRAM API ERROR]', data);

            // Fallback retry: If failed and reply_markup was present, retry without buttons
            if (payload.reply_markup) {
                console.warn('[TELEGRAM] Retrying message without reply_markup...');
                delete payload.reply_markup;
                try {
                    const retryRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const retryData = await retryRes.json();
                    if (retryRes.ok && retryData.ok) {
                        return { success: true, data: retryData.result };
                    }
                } catch (retryErr) {
                    console.error('[TELEGRAM RETRY ERROR]', retryErr);
                }
            }

            // User-friendly error message resolution
            let errorDesc = data?.description || `HTTP Error ${response.status}`;
            if (errorDesc.includes('chat not found')) {
                errorDesc = 'Chat ID tidak ditemukan. Pastikan Anda sudah membuka bot di Telegram dan menekan tombol START (/start), serta menggunakan Chat ID berupa angka (dari @userinfobot).';
            } else if (errorDesc.includes('bot was blocked')) {
                errorDesc = 'Bot diblokir oleh akun Telegram Anda. Buka bot di Telegram lalu unblock / kirim pesan /start.';
            } else if (errorDesc.includes('Unauthorized') || response.status === 401) {
                errorDesc = 'Bot Token tidak valid. Periksa kembali token yang Anda dapatkan dari @BotFather.';
            }

            return {
                success: false,
                error: errorDesc
            };
        }

        return {
            success: true,
            data: data.result
        };
    } catch (err: unknown) {
        const errorObj = err instanceof Error ? err : null;
        const errorMessage = errorObj?.name === 'AbortError' 
            ? 'Koneksi ke Telegram API timeout (melebihi 7 detik)' 
            : errorObj?.message || 'Terjadi gangguan jaringan saat menghubungi Telegram';
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
    const rawChatId = (chatIdOverride || creds.chatId || '').trim();
    const chatId = rawChatId.replace(/["'\s]/g, '');

    if (!token) {
        return { success: false, error: 'Telegram Bot Token belum diisi.' };
    }
    if (!chatId) {
        return { success: false, error: 'Telegram Chat ID belum diisi.' };
    }

    if (chatId.startsWith('@')) {
        return {
            success: false,
            error: 'Chat ID tidak boleh diawali @. Untuk akun pribadi Telegram, gunakan angka ID (contoh: 123456789) yang didapat dari bot @userinfobot.'
        };
    }

    try {
        // Step 1: Verify token with getMe
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const getMeRes = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        const getMeData = await getMeRes.json();
        if (!getMeRes.ok || !getMeData.ok) {
            return {
                success: false,
                error: `Bot Token tidak valid (${getMeData?.description || 'Unauthorized'}). Pastikan token dari @BotFather sudah benar.`
            };
        }

        const botInfo = getMeData.result;
        const siteUrl = getSiteBaseUrl();
        const nowStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        const isPublicDomain = isValidTelegramButtonUrl(siteUrl);

        // Step 2: Prepare test message text
        const testText = [
            `🚀 <b>Uji Coba Notifikasi Telegram Berhasil!</b>`,
            ``,
            `🤖 <b>Nama Bot:</b> @${escapeTelegramHtml(botInfo.username || botInfo.first_name)}`,
            `🆔 <b>ID Bot:</b> <code>${botInfo.id}</code>`,
            `🎯 <b>Target Chat ID:</b> <code>${chatId}</code>`,
            `🕒 <b>Waktu:</b> ${nowStr} WIB`,
            ``,
            `✅ Bot telah berhasil terhubung dengan sistem portfolio Anda. Setiap ada pesan kontak atau entri buku tamu baru, notifikasi akan langsung masuk ke obrolan ini.`
        ].join('\n');

        // Step 3: Add button only if siteUrl is public domain, otherwise send clean message
        const inlineKeyboard: TelegramInlineButton[][] = [];
        if (isPublicDomain) {
            inlineKeyboard.push([
                { text: '🖥️ Buka Panel Admin', url: `${siteUrl}/admin` }
            ]);
        }

        const sendResult = await sendTelegramMessage({
            text: testText,
            customToken: token,
            customChatId: chatId,
            inlineKeyboard: inlineKeyboard.length > 0 ? inlineKeyboard : undefined
        });

        if (!sendResult.success) {
            return {
                success: false,
                error: sendResult.error || 'Gagal mengirim pesan uji coba ke Chat ID. Pastikan Anda sudah membuka bot dan menekan START (/start).'
            };
        }

        return {
            success: true,
            bot: botInfo
        };
    } catch (err: unknown) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Gagal menghubungi Telegram API.'
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
        const isPublicDomain = isValidTelegramButtonUrl(siteUrl);

        const text = [
            `📬 <b>Pesan Kontak Baru Diterima!</b>`,
            ``,
            `👤 <b>Pengirim:</b> ${cleanName}`,
            `✉️ <b>Email:</b> <a href="mailto:${cleanEmail}">${cleanEmail}</a>`,
            `🌐 <b>IP Address:</b> <code>${cleanIp}</code>`,
            `🕒 <b>Waktu:</b> ${nowStr} WIB`,
            ``,
            `💬 <b>Isi Pesan:</b>`,
            `<i>"${cleanMessage}"</i>`
        ].join('\n');

        const inlineKeyboard: TelegramInlineButton[][] = [];
        if (isPublicDomain) {
            inlineKeyboard.push([
                { text: '🖥️ Buka Panel Admin', url: `${siteUrl}/admin` }
            ]);
        }

        await sendTelegramMessage({
            text,
            inlineKeyboard: inlineKeyboard.length > 0 ? inlineKeyboard : undefined
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
        const isPublicDomain = isValidTelegramButtonUrl(siteUrl);

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

        const inlineKeyboard: TelegramInlineButton[][] = [];
        if (isPublicDomain) {
            inlineKeyboard.push([
                { text: '🛡️ Moderasi Buku Tamu', url: `${siteUrl}/admin/guestbook` },
                { text: '📖 Buka Guestbook', url: `${siteUrl}/guestbook` }
            ]);
        }

        await sendTelegramMessage({
            text,
            inlineKeyboard: inlineKeyboard.length > 0 ? inlineKeyboard : undefined
        });
    } catch (err) {
        console.error('[TELEGRAM] Error in notifyGuestbookSubmission:', err);
    }
}
