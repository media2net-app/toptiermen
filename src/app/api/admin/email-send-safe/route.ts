import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-service';

interface Recipient {
  id?: string;
  email: string;
  name?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      recipients = [],
      template = 'sneak_preview',
      variables = {},
      dryRun = true,
      batchDelayMs = 0,
      emailDelayMs = 150,
      max = 500
    } = body || {};

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: 'Recipients are required' }, { status: 400 });
    }

    // Safety: cap total recipients
    const list: Recipient[] = recipients.slice(0, Math.min(max, recipients.length));

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        total: list.length,
        template,
        sample: list.slice(0, 10)
      });
    }

    // Actual sending (batched, minimal delay per email)
    const emailService = new EmailService();

    const results = {
      attempted: list.length,
      sent: 0,
      failed: 0,
      errors: [] as { email: string; error: string }[],
    };

    // Single batch for simplicity; UI is admin-only and list is capped
    for (let i = 0; i < list.length; i++) {
      const r = list[i];
      try {
        const ok = await emailService.sendEmail(
          r.email,
          'ignored',
          template,
          {
            name: r.name || (r.email?.split('@')[0] || 'Lid'),
            ...variables,
          },
          { tracking: true }
        );
        if (ok) results.sent += 1; else {
          results.failed += 1;
          results.errors.push({ email: r.email, error: 'send-failed' });
        }
      } catch (e: any) {
        results.failed += 1;
        results.errors.push({ email: r.email, error: e?.message || 'unknown' });
      }

      // tiny delay between emails
      if (emailDelayMs > 0 && i < list.length - 1) {
        await new Promise((res) => setTimeout(res, emailDelayMs));
      }
    }

    return NextResponse.json({
      success: true,
      dryRun: false,
      template,
      ...results,
    });
  } catch (error) {
    console.error('❌ Error in email-send-safe:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
