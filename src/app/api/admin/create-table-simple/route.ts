import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Creating prelaunch_packages table (simple approach)...');

    // Try to insert a test record to see if table exists
    const { error: testError } = await supabase
      .from('prelaunch_packages')
      .select('id')
      .limit(1);

    if (testError && testError.code === '42P01') {
      console.log('Table does not exist, returning error...');
      return NextResponse.json({
        success: false,
        message: 'Table prelaunch_packages does not exist. Please create it manually in Supabase dashboard.',
        error: testError
      });
    }

    console.log('✅ Table exists and is accessible');
    return NextResponse.json({
      success: true,
      message: 'Table prelaunch_packages exists and is accessible'
    });

  } catch (error) {
    console.error('Error checking table:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
