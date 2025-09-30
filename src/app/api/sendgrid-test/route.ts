import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// Ensure API key is available
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'info@toptiermen.nl';
const SENDGRID_EU_RESIDENCY = process.env.SENDGRID_EU_RESIDENCY === 'true';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  if (SENDGRID_EU_RESIDENCY) {
    // Enable EU data residency if requested
    // See: https://github.com/sendgrid/sendgrid-nodejs
    // @ts-ignore - method exists in SDK versions that support data residency
    (sgMail as any).setDataResidency?.('eu');
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!SENDGRID_API_KEY) {
      return NextResponse.json({ success: false, error: 'Missing SENDGRID_API_KEY' }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const to = body.to || process.env.SENDGRID_TEST_TO;
    const subject = body.subject || 'Top Tier Men • Test E-mail';
    const html = body.html || '<strong>SendGrid test vanaf Top Tier Men</strong>';
    const from = body.from || SENDGRID_FROM_EMAIL;

    if (!to) {
      return NextResponse.json({ success: false, error: 'Recipient `to` is required (or set SENDGRID_TEST_TO in env)' }, { status: 400 });
    }

    const msg = { to, from, subject, html } as sgMail.MailDataRequired;

    const [resp] = await sgMail.send(msg);

    return NextResponse.json({ success: true, status: resp.statusCode });
  } catch (err: any) {
    const detail = err?.response?.body || err?.message || 'Unknown error';
    console.error('SendGrid error:', detail);
    return NextResponse.json({ success: false, error: 'Failed to send email', detail }, { status: 500 });
  }
}
