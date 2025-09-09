import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Testing database connection...');
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Test 1: Basic connection
    console.log('Test 1: Basic connection test');
    const { data: testData, error: testError } = await supabase
      .from('prelaunch_packages')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Basic connection failed:', testError);
      return NextResponse.json({ 
        success: false, 
        error: 'Basic connection failed',
        details: testError 
      });
    }
    
    // Test 2: Get all data
    console.log('Test 2: Fetching all packages...');
    const { data: packages, error: packagesError } = await supabase
      .from('prelaunch_packages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (packagesError) {
      console.error('❌ Packages fetch failed:', packagesError);
      return NextResponse.json({ 
        success: false, 
        error: 'Packages fetch failed',
        details: packagesError 
      });
    }
    
    console.log('✅ Successfully fetched packages:', packages?.length || 0);
    
    return NextResponse.json({
      success: true,
      count: packages?.length || 0,
      packages: packages || [],
      connectionTest: 'passed',
      packagesTest: 'passed'
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Unexpected error',
      details: error 
    });
  }
}
