import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { oldVideoName, newVideoName, newVideoPath } = await request.json();

    if (!oldVideoName || !newVideoName || !newVideoPath) {
      return NextResponse.json(
        { error: 'oldVideoName, newVideoName, and newVideoPath are required' },
        { status: 400 }
      );
    }

    console.log(`🔄 Replacing video: ${oldVideoName} with ${newVideoName} from ${newVideoPath}`);

    // Step 1: Download the new video from submap
    console.log('📥 Step 1: Downloading new video from submap...');
    const { data: newVideoData, error: downloadError } = await supabaseAdmin.storage
      .from('advertenties')
      .download(newVideoPath);

    if (downloadError) {
      console.error('❌ Error downloading new video:', downloadError);
      return NextResponse.json(
        { error: 'Failed to download new video', details: downloadError.message },
        { status: 500 }
      );
    }

    // Step 2: Create backup of old video
    console.log('📦 Step 2: Creating backup of old video...');
    const backupName = `${oldVideoName}.backup`;
    const { data: oldVideoData, error: oldVideoError } = await supabaseAdmin.storage
      .from('advertenties')
      .download(oldVideoName);

    if (oldVideoError) {
      console.error('❌ Error downloading old video for backup:', oldVideoError);
      return NextResponse.json(
        { error: 'Failed to download old video for backup', details: oldVideoError.message },
        { status: 500 }
      );
    }

    // Upload backup
    const { error: backupError } = await supabaseAdmin.storage
      .from('advertenties')
      .upload(backupName, oldVideoData, {
        contentType: oldVideoData.type,
        upsert: true
      });

    if (backupError) {
      console.error('❌ Error creating backup:', backupError);
      return NextResponse.json(
        { error: 'Failed to create backup', details: backupError.message },
        { status: 500 }
      );
    }

    // Step 3: Upload new video with old video name
    console.log('📤 Step 3: Uploading new video with old video name...');
    const { error: uploadError } = await supabaseAdmin.storage
      .from('advertenties')
      .upload(oldVideoName, newVideoData, {
        contentType: newVideoData.type,
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Error uploading new video:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload new video', details: uploadError.message },
        { status: 500 }
      );
    }

    // Step 4: Delete the new video from submap
    console.log('🗑️  Step 4: Deleting new video from submap...');
    const { error: deleteError } = await supabaseAdmin.storage
      .from('advertenties')
      .remove([newVideoPath]);

    if (deleteError) {
      console.error('❌ Error deleting new video from submap:', deleteError);
      // Don't fail the entire operation, just log the error
      console.log('⚠️  Warning: Could not delete new video from submap');
    }

    // Step 5: Clean up backup (optional)
    console.log('🧹 Step 5: Cleaning up backup...');
    const { error: cleanupError } = await supabaseAdmin.storage
      .from('advertenties')
      .remove([backupName]);

    if (cleanupError) {
      console.error('❌ Error cleaning up backup:', cleanupError);
      console.log('⚠️  Warning: Could not clean up backup');
    }

    // Get public URL for the replaced video
    const { data: urlData } = supabaseAdmin.storage
      .from('advertenties')
      .getPublicUrl(oldVideoName);

    console.log('✅ Video replaced successfully');

    return NextResponse.json({
      success: true,
      oldVideoName,
      newVideoName,
      newVideoPath,
      publicUrl: urlData.publicUrl,
      message: 'Video replaced successfully from submap'
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
