import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking prelaunch_packages table...');

    // Try to select from the table directly
    const { data: selectData, error: selectError } = await supabase
      .from('prelaunch_packages')
      .select('*')
      .limit(1);

    if (selectError) {
      console.error('Error selecting from table:', selectError);
      return NextResponse.json({
        exists: false,
        message: 'Table prelaunch_packages does not exist or is not accessible',
        error: selectError
      });
    }

    return NextResponse.json({
      exists: true,
      message: 'Table prelaunch_packages exists and is accessible',
      sampleData: selectData
    });

  } catch (error) {
    console.error('Error checking prelaunch table:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
