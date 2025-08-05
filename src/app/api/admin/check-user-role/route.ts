import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    console.log('🔍 Checking user role for:', email);
    
    // Get user role from database
    const { data: allUsers, error } = await supabaseAdmin
      .from('users')
      .select('role, full_name, email, id, created_at')
      .eq('email', email)
      .order('created_at', { ascending: false });



    if (!allUsers || allUsers.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // If multiple records, keep the most recent one
    const data = allUsers[0];
    
    if (allUsers.length > 1) {
      console.log(`⚠️ Found ${allUsers.length} records for ${email}, using most recent`);
      
      // Delete older records
      for (let i = 1; i < allUsers.length; i++) {
        await supabaseAdmin
          .from('users')
          .delete()
          .eq('id', allUsers[i].id);
      }
    }

    if (error) {
      console.error('❌ Error checking user role:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 400 });
    }

    console.log('✅ User role found:', data);
    
    return NextResponse.json({
      success: true,
      user: data
    });

  } catch (error) {
    console.error('❌ Check user role error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 