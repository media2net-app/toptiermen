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
    
    // Get request info for logging
    const referrer = req.headers.get('referer') || null;
    const userAgent = req.headers.get('user-agent') || null;
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
    
    // Log the click to database
    try {
      await supabaseAdmin.from('affiliate_clicks').insert({
        code: code.toUpperCase(),
        referrer,
        user_agent: userAgent,
        ip_address: ip,
        clicked_at: new Date().toISOString(),
      });
      console.log('📊 Click logged for affiliate:', code);
    } catch (logError) {
      console.warn('Failed to log affiliate click:', logError);
      // Continue even if logging fails
    }
    
    // Redirect to maandelijks pakketten page
    const redirectTarget = 'https://platform.toptiermen.eu/pakketten/maandelijks';
    
    // Set cookie with affiliate code
    const res = NextResponse.redirect(redirectTarget, 302);
    res.cookies.set('ttm_ref', code.toUpperCase(), {
      maxAge: 60 * 24 * 60 * 60, // 60 days
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
    });
    console.log('🍪 Cookie set for affiliate:', code);

    return res;
  } catch (error) {
    console.error('❌ Affiliate route error:', error);
    // Fallback redirect even on error
    return NextResponse.redirect('https://platform.toptiermen.eu/pakketten/maandelijks', 302);
  }
}