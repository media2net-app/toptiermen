import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { userId, role } = await request.json();
    
    console.log('🔧 Updating user role by ID:', userId, 'to', role);
    
    // Update user role by ID
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ role: role })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Error updating user role:', updateError);
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

    console.log('✅ User role updated in profiles');

    // Sync auth.users metadata role for immediate client recognition
    try {
      const { error: authUpdateError } = await (supabaseAdmin as any).auth.admin.updateUserById(userId, {
        user_metadata: { role }
      });
      if (authUpdateError) {
        console.error('⚠️ Failed to sync auth user metadata role:', authUpdateError);
      } else {
        console.log('✅ Synced auth.user_metadata.role');
      }
    } catch (e) {
      console.error('⚠️ Exception syncing auth.user_metadata.role:', e);
    }
    
    return NextResponse.json({
      success: true,
      message: 'User role updated successfully',
      verified: verifyData
    });

  } catch (error) {
    console.error('❌ Update user role error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 