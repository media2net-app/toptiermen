import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    console.log('🔧 Password reset requested for:', email);
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'E-mailadres is verplicht'
      }, { status: 400 });
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Send password reset email
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
    });

    if (error) {
      console.error('❌ Error sending password reset email:', error);
      return NextResponse.json({
        success: false,
        error: 'Fout bij het versturen van wachtwoord reset e-mail'
      }, { status: 400 });
    }

    console.log('✅ Password reset email sent successfully to:', email);
    
    return NextResponse.json({
      success: true,
      message: 'Wachtwoord reset e-mail is verstuurd'
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    return NextResponse.json({
      success: false,
      error: 'Interne server fout'
    }, { status: 500 });
  }
}
