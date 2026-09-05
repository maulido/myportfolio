/**
 * Input sanitization utility to prevent XSS and malformed input
 */
export function sanitizeText(str: unknown): string {
    if (typeof str !== 'string') return '';
    return str
        .replace(/<[^>]*>?/gm, '') // Remove all HTML tags
        .trim();
}

export function sanitizeEmail(email: unknown): string {
    if (typeof email !== 'string') return '';
    return email
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9@._+-]/g, '');
}
