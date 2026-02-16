import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_PORT === '465' || !process.env.SMTP_PORT, // true for 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    pool: true
});

interface MailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: MailOptions) {
    try {
        const fromAddress = process.env.SMTP_FROM || 'rottenplan0@gmail.com';

        const info = await transporter.sendMail({
            from: `"Much Racing" <${fromAddress}>`,
            to,
            subject,
            html,
        });
        console.log('[SMTP Success]: Message sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error: any) {
        console.error('[SMTP Error]: Failed to send email:', error);
        throw error;
    }
}

export async function sendVerificationEmail(email: string, name: string, code: string) {
    const subject = 'Much Racing - Verify your account';
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 8px;">
            <h1 style="color: #dc2626; text-align: center;">MUCH RACING</h1>
            <p>Hello ${name || 'Racer'},</p>
            <p>Welcome to the Much Racing team! Use the code below to verify your account:</p>
            <div style="background: #f8fafc; padding: 20px; text-align: center; border-radius: 8px; margin: 25px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #1e293b;">${code}</span>
            </div>
            <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes.</p>
        </div>
    `;
    return sendEmail({ to: email, subject, html });
}

export async function sendNewCodeEmail(email: string, name: string, code: string) {
    const subject = 'Much Racing - New Verification Code';
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 8px;">
            <h1 style="color: #dc2626; text-align: center;">MUCH RACING</h1>
            <p>Hello ${name || 'Racer'},</p>
            <p>As requested, here is your new verification code:</p>
            <div style="background: #f8fafc; padding: 20px; text-align: center; border-radius: 8px; margin: 25px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #1e293b;">${code}</span>
            </div>
            <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes.</p>
            <hr style="border: 0; border-top: 1px solid #e1e1e1; margin: 25px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">Jika anda tidak meminta kode baru, abaikan email ini.</p>
        </div>
    `;
    return sendEmail({ to: email, subject, html });
}
