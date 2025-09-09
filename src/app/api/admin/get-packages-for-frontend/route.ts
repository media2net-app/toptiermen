import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    console.log('🔍 Fetching packages for frontend...');
    
    const { data: packages, error } = await supabase
      .from('prelaunch_packages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching packages:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      });
    }

    console.log('✅ Successfully fetched packages for frontend:', packages?.length || 0);
    
    return NextResponse.json({
      success: true,
      count: packages?.length || 0,
      packages: packages || []
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Unexpected error' 
    });
  }
}
