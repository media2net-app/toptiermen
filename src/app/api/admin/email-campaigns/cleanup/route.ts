import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Cleaning up test email campaigns...');

    // Delete all test campaigns and their tracking data
    const { error: deleteError } = await supabaseAdmin
      .from('email_campaigns')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all campaigns

    if (deleteError) {
      console.error('❌ Error cleaning up campaigns:', deleteError);
      return NextResponse.json({ 
        error: 'Failed to clean up campaigns' 
      }, { status: 500 });
    }

    console.log('✅ Test email campaigns cleaned up successfully');

    return NextResponse.json({ 
      success: true,
      message: 'Test email campaigns cleaned up successfully'
    });

  } catch (error) {
    console.error('❌ Error in cleanup API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
