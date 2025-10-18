import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client directly
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { code } = params || { code: '' };
    console.log('🔗 Affiliate link accessed:', code);
    
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
          console.log('✅ Valid affiliate code found:', code);
        } else {
          console.log('❌ Affiliate code not found:', code, error);
        }
      } catch (e) {
        console.warn('Affiliate validation failed (non-fatal):', e);
      }
    } else {
      console.log('❌ Invalid affiliate code format:', code);
    }

    const redirectTarget = process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu';

    // If not a known/valid code, just redirect without setting cookie
    if (!isValidFormat || !isKnownAffiliate) {
      console.log('🔄 Redirecting without cookie:', redirectTarget);
      return NextResponse.redirect(redirectTarget, 302);
    }

    // Set cookie
    const res = NextResponse.redirect(redirectTarget, 302);
    res.cookies.set('ttm_ref', code.toUpperCase(), {
      maxAge: 60 * 24 * 60 * 60, // 60 days
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // Set to false for localhost testing
    });
    console.log('🍪 Cookie set for affiliate:', code);

    // Best-effort click logging (table may not exist yet)
    try {
      await supabaseAdmin.from('affiliate_clicks').insert({
        code: code.toUpperCase(),
        referrer,
        user_agent: userAgent,
        ip_address: ip,
        clicked_at: new Date().toISOString(),
      });
      console.log('📊 Click logged for affiliate:', code);
    } catch (e) {
      console.warn('Affiliate click logging skipped:', e);
    }

    return res;
  } catch (error) {
    console.error('❌ Affiliate route error:', error);
    // Fallback redirect even on error
    return NextResponse.redirect(process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu', 302);
  }
}