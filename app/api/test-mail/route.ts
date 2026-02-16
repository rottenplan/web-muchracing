import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mail';

export async function GET() {
    try {
        console.log('[TEST-MAIL]: Starting SMTP connection test...');

        const result = await sendEmail({
            to: 'rottenplan0@gmail.com', // Test sending to the user's email
            subject: 'Much Racing - SMTP Test',
            html: '<p>Jika Anda menerima email ini, berarti konfigurasi SMTP sudah benar.</p>'
        });

        return NextResponse.json({
            success: true,
            message: 'Test email sent successfully',
            messageId: result.messageId
        });
    } catch (error: any) {
        console.error('[TEST-MAIL Error]:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to send test email',
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
