import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing advertenties bucket access...');

    // Test 1: Check if we can access the bucket
    console.log('📦 Testing bucket access...');
    
    // Try to list files (this should work with anon key if bucket is public)
    const { data: files, error: listError } = await supabase.storage
      .from('advertenties')
      .list('', {
        limit: 10,
        offset: 0
      });

    if (listError) {
      console.error('❌ List error:', listError);
      
      // Test 2: Try to get a specific file URL
      console.log('🔗 Testing public URL generation...');
      const { data: urlData } = supabase.storage
        .from('advertenties')
        .getPublicUrl('test-file.txt');

      console.log('✅ URL generation works:', urlData.publicUrl);

      return NextResponse.json({
        success: false,
        error: 'Bucket access failed',
        details: listError.message,
        bucketExists: false,
        canGenerateUrls: true,
        testUrl: urlData?.publicUrl || null
      });
    }

    console.log('✅ Bucket access successful');
    console.log('📋 Found files:', files?.length || 0);

    // Test 3: Get URLs for found files
    const videosWithUrls = await Promise.all(
      (files || []).map(async (file) => {
        const { data: urlData } = supabase.storage
          .from('advertenties')
          .getPublicUrl(file.name);

        return {
          name: file.name,
          size: file.metadata?.size,
          type: file.metadata?.mimetype,
          created_at: file.created_at,
          public_url: urlData.publicUrl
        };
      })
    );

    return NextResponse.json({
      success: true,
      bucketExists: true,
      canAccess: true,
      fileCount: files?.length || 0,
      videos: videosWithUrls,
      bucketInfo: {
        name: 'advertenties',
        public: true,
        url: `${supabaseUrl}/storage/v1/object/public/advertenties/`
      }
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
