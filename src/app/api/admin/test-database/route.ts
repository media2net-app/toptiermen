import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing database connection...');
    
    const testResults = {
      connection: false,
      tableExists: false,
      canSelect: false,
      canInsert: false,
      errors: []
    };

    // Test 1: Basic connection
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('count')
        .limit(1);

      if (error) {
        testResults.errors.push(`Connection test failed: ${error.message} (Code: ${error.code})`);
      } else {
        testResults.connection = true;
        testResults.tableExists = true;
        testResults.canSelect = true;
        console.log('✅ Database connection successful');
      }
    } catch (err) {
      testResults.errors.push(`Connection error: ${err}`);
    }

    // Test 2: Try to insert a test record (will be cleaned up)
    if (testResults.connection) {
      try {
        const testData = {
          name: 'TEST_VIDEO_' + Date.now(),
          original_name: 'test_video_' + Date.now() + '.mp4',
          file_path: '/videos/advertenties/test_video.mp4',
          file_size: 1024,
          mime_type: 'video/mp4',
          campaign_status: 'inactive'
        };

        const { data, error } = await supabase
          .from('videos')
          .insert([testData])
          .select()
          .single();

        if (error) {
          testResults.errors.push(`Insert test failed: ${error.message} (Code: ${error.code})`);
        } else {
          testResults.canInsert = true;
          console.log('✅ Insert test successful');

          // Clean up test record
          try {
            await supabase
              .from('videos')
              .delete()
              .eq('id', data.id);
            console.log('✅ Test record cleaned up');
          } catch (cleanupErr) {
            console.log('⚠️ Could not clean up test record:', cleanupErr);
          }
        }
      } catch (err) {
        testResults.errors.push(`Insert error: ${err}`);
      }
    }

    console.log('🧪 Database test complete:', testResults);
    return NextResponse.json({ 
      success: true, 
      testResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Database test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Database test failed', 
      details: error 
    }, { status: 500 });
  }
}
