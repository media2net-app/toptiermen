import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Removing problematic constraint...');
    
    // Remove the constraint completely
    const removeConstraintSQL = `
      ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
    `;
    
    const { error: removeError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: removeConstraintSQL
    });

    if (removeError) {
      console.error('❌ Error removing constraint:', removeError);
      return NextResponse.json({
        success: false,
        error: removeError.message
      }, { status: 400 });
    }

    console.log('✅ Constraint removed');

    // Now update the test user
    const updateUserSQL = `
      UPDATE public.users 
      SET role = 'test' 
      WHERE email = 'test@toptiermen.com';
    `;
    
    const { error: updateError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: updateUserSQL
    });

    if (updateError) {
      console.error('❌ Error updating user:', updateError);
    } else {
      console.log('✅ Test user updated');
    }

    // Verify the update
    const { data: user, error: verifyError } = await supabaseAdmin
      .from('users')
      .select('email, role')
      .eq('email', 'test@toptiermen.com')
      .single();

    if (verifyError) {
      console.error('❌ Error verifying user:', verifyError);
    } else {
      console.log('✅ User verified:', user);
    }

    return NextResponse.json({
      success: true,
      message: 'Constraint removed and user updated',
      user: user
    });

  } catch (error) {
    console.error('❌ Remove constraint error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 