import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
  }

  try {
    // Update the profile to have active status
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select('id, email, full_name, package_type, status, created_at, updated_at')
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json({ error: 'Failed to update profile', details: updateError }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Profile status updated for ${email}`,
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Fix profile error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
}
