import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Getting all prelaunch packages...');

    const { data, error } = await supabase
      .from('prelaunch_packages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching packages:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code
      });
    }

    console.log(`✅ Found ${data?.length || 0} packages`);
    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      packages: data || []
    });

  } catch (error) {
    console.error('Error getting packages:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
