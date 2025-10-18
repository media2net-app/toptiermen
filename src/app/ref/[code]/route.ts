import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { code } = params || { code: '' };
    console.log('🔗 Affiliate link accessed:', code);
    
    // Always redirect to homepage for now
    const redirectTarget = 'https://platform.toptiermen.eu';
    
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
    return NextResponse.redirect('https://platform.toptiermen.eu', 302);
  }
}