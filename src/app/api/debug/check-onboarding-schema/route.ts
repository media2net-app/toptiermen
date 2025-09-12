import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Try to get the first record to see the schema
    const { data, error } = await supabase
      .from('user_onboarding_status')
      .select('*')
      .limit(1);

    if (error) {
      return NextResponse.json({ 
        error: 'Table query failed', 
        details: error,
        suggestion: 'Table might not exist or have different structure'
      });
    }

    // Also check if we can get Chiel's user ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, package_type')
      .eq('email', 'chielvanderzee@gmail.com')
      .single();

    return NextResponse.json({
      table_exists: true,
      sample_record: data?.[0] || null,
      total_records: data?.length || 0,
      chiel_profile: profile || null,
      profile_error: profileError?.message || null
    });
  } catch (error) {
    console.error('Schema check error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
}
