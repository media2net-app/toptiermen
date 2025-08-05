import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking users table constraints...');
    
    // Check the current constraint
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: `
        SELECT 
          conname as constraint_name,
          pg_get_constraintdef(oid) as constraint_definition
        FROM pg_constraint 
        WHERE conrelid = 'public.users'::regclass 
        AND conname = 'users_role_check';
      `
    });

    if (error) {
      console.error('❌ Error checking constraint:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 400 });
    }

    console.log('✅ Constraint found:', data);
    
    return NextResponse.json({
      success: true,
      constraint: data
    });

  } catch (error) {
    console.error('❌ Check constraint error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 