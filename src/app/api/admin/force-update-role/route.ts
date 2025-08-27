import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { email, role } = await request.json();
    
    console.log('🔧 Force updating user role:', email, 'to', role);
    
    // Force update with raw SQL
    const { error: updateError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: `
        UPDATE public.users 
        SET role = '${role}', updated_at = NOW()
        WHERE email = '${email}';
      `
    });

    if (updateError) {
      console.error('❌ Error force updating user role:', updateError);
      return NextResponse.json({
        success: false,
        error: updateError.message
      }, { status: 400 });
    }

    // Verify the update
    const { data: verifyData, error: verifyError } = await supabaseAdmin
      .from('profiles')
      .select('role, email')
      .eq('email', email)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError);
    } else {
      console.log('✅ Verified update:', verifyData);
    }

    console.log('✅ User role force updated successfully');
    
    return NextResponse.json({
      success: true,
      message: 'User role force updated successfully',
      verified: verifyData
    });

  } catch (error) {
    console.error('❌ Force update user role error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 