import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Listing videos from advertenties bucket...');

    // List all files in the advertenties bucket
    const { data: files, error } = await supabase.storage
      .from('advertenties')
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('❌ Error listing files:', error);
      return NextResponse.json(
        { error: 'Failed to list videos', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Found files:', files?.length || 0);

    // Get public URLs for each file
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
          updated_at: file.updated_at,
          public_url: urlData.publicUrl,
          id: file.id
        };
      })
    );

    console.log('✅ Videos with URLs:', videosWithUrls.length);

    return NextResponse.json({
      success: true,
      count: videosWithUrls.length,
      videos: videosWithUrls
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { fileName } = await request.json();
    
    if (!fileName) {
      return NextResponse.json(
        { error: 'fileName is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Getting public URL for:', fileName);

    // Get public URL for specific file
    const { data: urlData } = supabase.storage
      .from('advertenties')
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      fileName,
      public_url: urlData.publicUrl
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
