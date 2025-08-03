import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log('🔍 Testing Supabase configuration...');
    console.log('URL:', supabaseUrl ? 'Configured' : 'Missing');
    console.log('Key:', supabaseAnonKey ? 'Configured' : 'Missing');

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase environment variables',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Skip bucket listing and test workout-videos bucket directly
    console.log('🔍 Testing workout-videos bucket directly...');
    const { data: testFiles, error: testError } = await supabase.storage
      .from('workout-videos')
      .list('exercises', { limit: 10 });
    
    if (testError) {
      console.error('❌ Direct bucket test failed:', testError);
      return NextResponse.json({
        success: false,
        error: 'Failed to access workout-videos bucket',
        directTestError: testError.message
      });
    } else {
      console.log('✅ Direct bucket test successful - bucket exists!');
      console.log('📁 Files found:', testFiles?.length || 0);
      
      return NextResponse.json({
        success: true,
        supabaseUrl: supabaseUrl,
        supabaseKeyStart: supabaseAnonKey.substring(0, 20) + '...',
        buckets: ['workout-videos'],
        files: testFiles || [],
        totalFiles: testFiles?.length || 0,
        note: 'Direct access to workout-videos/exercises successful'
      });
    }

    // The direct test above already handled everything
    // This code is now unreachable but kept for structure
    return NextResponse.json({
      success: false,
      error: 'Unexpected code path reached'
    });

  } catch (error: any) {
    console.error('❌ Supabase test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error'
    }, { status: 500 });
  }
} 