import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Fixing role constraint...');
    
    // Drop the existing constraint and recreate it with 'test' role
    const { error: dropError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE public.users 
        DROP CONSTRAINT IF EXISTS users_role_check;
      `
    });

    if (dropError) {
      console.error('❌ Error dropping constraint:', dropError);
    }

    // Add new constraint with 'test' role
    const { error: addError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE public.users 
        ADD CONSTRAINT users_role_check 
        CHECK (role IN ('user', 'admin', 'test'));
      `
    });

    if (addError) {
      console.error('❌ Error adding constraint:', addError);
      return NextResponse.json({
        success: false,
        error: addError.message
      }, { status: 400 });
    }

    console.log('✅ Role constraint fixed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Role constraint fixed successfully'
    });

  } catch (error) {
    console.error('❌ Fix role constraint error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 