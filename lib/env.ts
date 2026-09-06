/**
 * Environment Variable Validation
 * Validates required environment variables at application startup
 */

const requiredEnvVars = [
    'MONGODB_URI',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
] as const;

const optionalEnvVars = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'CONTACT_EMAIL',
    'NEXT_PUBLIC_GA_ID',
    'GEMINI_API_KEY',
    'NEXT_PUBLIC_BASE_URL',
    'UPLOADTHING_SECRET',
    'UPLOADTHING_APP_ID',
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_CHAT_ID'
] as const;

export function validateEnv() {
    const missing: string[] = [];
    const warnings: string[] = [];

    // Check required variables
    requiredEnvVars.forEach(key => {
        if (!process.env[key]) {
            missing.push(key);
        }
    });

    // Warn about missing optional variables
    optionalEnvVars.forEach(key => {
        if (!process.env[key]) {
            warnings.push(key);
        }
    });

    // Throw error if required vars are missing
    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\n` +
            `Please check ENV_TEMPLATE.md for configuration details.`
        );
    }

    // Log warnings for optional vars (only in development)
    if (warnings.length > 0 && process.env.NODE_ENV === 'development') {
        console.warn(
            `\n⚠️  Optional environment variables not set:\n${warnings.map(v => `  - ${v}`).join('\n')}\n`
        );
    }

    // Validate NEXTAUTH_SECRET length
    if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
        throw new Error('NEXTAUTH_SECRET must be at least 32 characters long');
    }

    console.log('✅ Environment variables validated successfully');
}

// Export typed environment variables
export const env = {
    // Required
    MONGODB_URI: process.env.MONGODB_URI!,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL!,

    // Optional
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    CONTACT_EMAIL: process.env.CONTACT_EMAIL,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
    UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
    NODE_ENV: process.env.NODE_ENV || 'development'
} as const;
