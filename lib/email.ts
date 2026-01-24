import nodemailer from 'nodemailer';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
    // If credentials are not present, log to console (Development Mode)
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.log("------------------------------------------");
        console.log(`[Email Service - Dev Mode]`);
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body (HTML length): ${html.length}`);
        console.log("------------------------------------------");
        return { success: true, messageId: 'dev-mock-id' };
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Portfolio" <noreply@example.com>',
            to,
            subject,
            html,
        });

        console.log("Message sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error };
    }
};
