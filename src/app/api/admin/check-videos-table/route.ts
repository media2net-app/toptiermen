import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking videos table status...');
    
    // Check if videos table exists by trying to select from it
    const { data: videos, error: selectError } = await supabase
      .from('videos')
      .select('count')
      .limit(1);

    if (selectError) {
      console.log('❌ Videos table error:', selectError);
      return NextResponse.json({ 
        success: false, 
        error: 'Videos table not found or inaccessible',
        details: selectError,
        needsSetup: true
      });
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Count error:', countError);
      return NextResponse.json({ 
        success: false, 
        error: 'Error counting videos',
        details: countError
      });
    }

    console.log('✅ Videos table exists with', count, 'videos');
    return NextResponse.json({ 
      success: true, 
      tableExists: true,
      videoCount: count || 0,
      message: 'Videos table is accessible'
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Unexpected error occurred', 
      details: error 
    }, { status: 500 });
  }
}
