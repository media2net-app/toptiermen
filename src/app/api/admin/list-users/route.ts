import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Listing all users...');
    
    // Get all users from database
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, email, role, full_name, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error listing users:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 400 });
    }

    console.log('✅ Users found:', data?.length);
    
    return NextResponse.json({
      success: true,
      users: data
    });

  } catch (error) {
    console.error('❌ List users error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 