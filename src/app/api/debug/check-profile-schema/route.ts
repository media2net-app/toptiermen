import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get Chiel's profile to see available columns
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'chielvanderzee@gmail.com')
      .single();

    if (profileError) {
      return NextResponse.json({ 
        error: 'Profile not found', 
        details: profileError 
      });
    }

    return NextResponse.json({
      profile,
      available_columns: Object.keys(profile || {}),
      has_package_type: !!profile?.package_type,
      has_status: !!profile?.status
    });
  } catch (error) {
    console.error('Schema check error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
}
