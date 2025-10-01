import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      recipient = 'chielvanderzee@gmail.com',
      name = 'Chiel',
      preview = false,
    } = body || {};

    const emailService = new EmailService();

    // Build template first so we can return preview when requested
    const tpl = emailService.getTemplate('platform_relaunch', { name });

    if (preview) {
      return NextResponse.json({
        success: true,
        message: 'Platform her-lancering email preview generated successfully!',
        subject: tpl.subject,
        html: tpl.html,
      });
    }

    const ok = await emailService.sendEmail(
      recipient,
      tpl.subject,
      'platform_relaunch',
      { name },
      { tracking: true }
    );

    if (!ok) {
      return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Platform her-lancering email sent',
      recipient,
      subject: tpl.subject,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Internal error' }, { status: 500 });
  }
}
