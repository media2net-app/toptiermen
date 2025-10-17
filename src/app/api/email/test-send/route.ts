import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-service';

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'email is required' }, { status: 400 });
    }

    const svc = new EmailService();
    const ok = await svc.sendEmail(
      email,
      'Test Email - Top Tier Men',
      'test_email',
      {
        name: name || 'Gebruiker',
        email,
      },
      { tracking: true }
    );

    if (!ok) {
      return NextResponse.json({ success: false, error: 'Failed to send test email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Internal error' }, { status: 500 });
  }
}
