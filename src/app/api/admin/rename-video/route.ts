import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { oldFileName, newFileName } = await request.json();
    
    if (!oldFileName || !newFileName) {
      return NextResponse.json(
        { error: 'oldFileName and newFileName are required' },
        { status: 400 }
      );
    }

    console.log(`🔄 Renaming video: ${oldFileName} → ${newFileName}`);

    // Step 1: Download the old file
    console.log('📥 Step 1: Downloading old file...');
    const { data: downloadData, error: downloadError } = await supabaseAdmin.storage
      .from('advertenties')
      .download(oldFileName);

    if (downloadError) {
      console.error('❌ Download error:', downloadError);
      return NextResponse.json(
        { error: 'Failed to download old file', details: downloadError.message },
        { status: 500 }
      );
    }

    // Step 2: Upload with new filename
    console.log('📤 Step 2: Uploading with new filename...');
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('advertenties')
      .upload(newFileName, downloadData, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload with new filename', details: uploadError.message },
        { status: 500 }
      );
    }

    // Step 3: Delete the old file
    console.log('🗑️  Step 3: Deleting old file...');
    const { error: deleteError } = await supabaseAdmin.storage
      .from('advertenties')
      .remove([oldFileName]);

    if (deleteError) {
      console.error('❌ Delete error:', deleteError);
      // Don't fail the operation if delete fails, just log it
      console.log('⚠️  Warning: Failed to delete old file, but new file was uploaded successfully');
    }

    console.log('✅ Video renamed successfully');

    // Get public URL for the new file
    const { data: urlData } = supabaseAdmin.storage
      .from('advertenties')
      .getPublicUrl(newFileName);

    return NextResponse.json({
      success: true,
      oldFileName,
      newFileName,
      publicUrl: urlData.publicUrl,
      message: 'Video renamed successfully'
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
