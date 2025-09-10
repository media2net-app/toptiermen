import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    console.log('🔍 Debug: Checking prelaunch_packages table...');
    
    // Try to access the table directly
    console.log('🔍 Checking if prelaunch_packages table is accessible...');

    // Try to get count first
    const { count, error: countError } = await supabase
      .from('prelaunch_packages')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error getting count:', countError);
      return NextResponse.json({ 
        success: false, 
        error: `Count error: ${countError.message}`,
        step: 'count_check',
        tableExists: tableInfo?.length > 0
      });
    }

    console.log('📊 Total records:', count);

    // Now try to get actual data
    const { data: packages, error: dataError } = await supabase
      .from('prelaunch_packages')
      .select('*')
      .order('created_at', { ascending: false });

    if (dataError) {
      console.error('❌ Error fetching data:', dataError);
      return NextResponse.json({ 
        success: false, 
        error: `Data fetch error: ${dataError.message}`,
        step: 'data_fetch',
        tableExists: tableInfo?.length > 0,
        count: count
      });
    }

    console.log('✅ Successfully fetched packages:', packages?.length || 0);
    
    return NextResponse.json({
      success: true,
      tableExists: true, // We know it exists since we can query it
      count: count,
      packages: packages || [],
      debug: {
        countError: countError,
        dataError: dataError
      }
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Unexpected error: ${error.message}`,
      step: 'unexpected'
    });
  }
}
