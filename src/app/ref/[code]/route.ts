import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Redirect user after capturing referral
const DEFAULT_REDIRECT = process.env.NEXT_PUBLIC_SITE_URL || '/';

// 60 days in seconds
const COOKIE_MAX_AGE = 60 * 24 * 60 * 60;

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const { code } = params || { code: '' };
  const url = new URL(req.url);
  const referrer = req.headers.get('referer') || null;
  const userAgent = req.headers.get('user-agent') || null;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || (req as any).ip || null;

  // Basic validation: alphanumeric and dashes/underscores, 2-64 chars
  const isValidFormat = /^[A-Z0-9_-]{2,64}$/i.test(code || '');
  let isKnownAffiliate = false;

  if (isValidFormat) {
    try {
      // Verify code exists in profiles table
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('affiliate_code', code.toUpperCase())
        .maybeSingle();

      if (!error && data) {
        isKnownAffiliate = true;
      }
    } catch (e) {
      // Non-fatal
      console.warn('Affiliate validation failed (non-fatal):', e);
    }
  }

  const redirectTarget = DEFAULT_REDIRECT.replace(/\/$/, '');

  // If not a known/valid code, just redirect without setting cookie
  if (!isValidFormat || !isKnownAffiliate) {
    return NextResponse.redirect(redirectTarget + '/', 302);
  }

  // Set cookie
  const res = NextResponse.redirect(redirectTarget + '/', 302);
  try {
    res.cookies.set({
      name: 'ttm_ref',
      value: code.toUpperCase(),
      maxAge: COOKIE_MAX_AGE,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
    });
  } catch (e) {
    // Fallback for environments without res.cookies
    try {
      const cookieStore = cookies();
      cookieStore.set('ttm_ref', code.toUpperCase(), {
        maxAge: COOKIE_MAX_AGE,
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
      });
    } catch {}
  }

  // Best-effort click logging (table may not exist yet)
  try {
    await supabaseAdmin.from('affiliate_clicks').insert({
      code: code.toUpperCase(),
      referrer,
      user_agent: userAgent,
      ip_address: ip,
      clicked_at: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('Affiliate click logging skipped:', e);
  }

  return res;
}
