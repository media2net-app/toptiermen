import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { userId, role } = await request.json();
    
    console.log('🔧 Force updating user role by ID:', userId, 'to', role);
    
    // Force update with raw SQL to bypass constraints
    const { error: updateError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: `
        UPDATE public.users 
        SET role = '${role}'
        WHERE id = '${userId}';
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
      .select('role, email, id')
      .eq('id', userId)
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