import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { email, newPassword } = await request.json();
    
    console.log('🔧 Resetting password for:', email);
    
    // Update user password using admin API
    const { data, error } = await supabase.auth.admin.updateUserById(
      'dummy-id', // We need to get the user ID first
      { password: newPassword }
    );

    if (error) {
      console.error('❌ Error resetting password:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 400 });
    }

    console.log('✅ Password reset successful for:', email);
    
    return NextResponse.json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 