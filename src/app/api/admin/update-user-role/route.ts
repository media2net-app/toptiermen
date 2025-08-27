import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { email, role } = await request.json();
    
    console.log('🔧 Updating user role:', email, 'to', role);
    
    // Update user role in profiles table
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ role: role })
      .eq('email', email);

    if (updateError) {
      console.error('❌ Error updating user role:', updateError);
      return NextResponse.json({
        success: false,
        error: updateError.message
      }, { status: 400 });
    }

    console.log('✅ User role updated successfully');
    
    return NextResponse.json({
      success: true,
      message: 'User role updated successfully'
    });

  } catch (error) {
    console.error('❌ Update user role error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 