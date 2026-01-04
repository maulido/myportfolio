/**
 * Input Sanitization Utilities
 * Sanitizes user input to prevent XSS and injection attacks
 */

/**
 * Escapes HTML special characters to prevent XSS
 */
export function sanitizeHtml(input: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    };

    return input.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Sanitizes general text input (trim + escape)
 */
export function sanitizeInput(input: string): string {
    return sanitizeHtml(input.trim());
}

/**
 * Validates and sanitizes email addresses
 */
export function sanitizeEmail(email: string): string | null {
    const trimmed = email.trim().toLowerCase();

    // Basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmed)) {
        return null;
    }

    // Additional validation: max length
    if (trimmed.length > 254) {
        return null;
    }

    return trimmed;
}

/**
 * Validates and sanitizes URLs
 */
export function sanitizeUrl(url: string): string | null {
    const trimmed = url.trim();

    try {
        const parsed = new URL(trimmed);

        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return null;
        }

        return parsed.toString();
    } catch {
        return null;
    }
}

/**
 * Sanitizes text with length limit
 */
export function sanitizeText(input: string, maxLength: number): string {
    const trimmed = input.trim();

    if (trimmed.length > maxLength) {
        return sanitizeHtml(trimmed.substring(0, maxLength));
    }

    return sanitizeHtml(trimmed);
}

/**
 * Removes potentially dangerous characters from filenames
 */
export function sanitizeFilename(filename: string): string {
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/\.{2,}/g, '.')
        .substring(0, 255);
}

/**
 * Validates MongoDB ObjectId format
 */
export function isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
}
