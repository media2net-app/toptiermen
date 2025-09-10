import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    console.log('🔍 Fetching packages for frontend...');
    
    // Use service role to bypass RLS
    const { data: packages, error } = await supabase
      .from('prelaunch_packages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching packages:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
    }

    console.log('✅ Successfully fetched packages for frontend:', packages?.length || 0);
    
    // Log some details for debugging
    if (packages && packages.length > 0) {
      console.log('📋 Sample package:', {
        id: packages[0].id,
        name: packages[0].full_name,
        email: packages[0].email,
        status: packages[0].payment_status,
        price: packages[0].discounted_price
      });
    }
    
    return NextResponse.json({
      success: true,
      count: packages?.length || 0,
      packages: packages || []
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Unexpected error: ${error.message}` 
    });
  }
}
