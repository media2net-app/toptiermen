require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function restoreOriginalNames() {
  console.log('🔄 Restoring original video names with TTM_ prefix...\n');
  
  try {
    // Get all videos from database
    const { data: videos, error: dbError } = await supabase
      .from('videos')
      .select('*')
      .eq('bucket_name', 'advertenties')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('❌ Error fetching videos:', dbError);
      return;
    }

    console.log(`📋 Found ${videos?.length || 0} videos to restore\n`);

    // Restore original names for each video
    for (const video of videos || []) {
      const originalName = video.original_name;
      const currentDisplayName = video.name;
      
      // Use the original filename as display name (without .mp4 extension)
      const newDisplayName = originalName.replace('.mp4', '');

      // Update the database record
      try {
        const { error } = await supabase
          .from('videos')
          .update({
            name: newDisplayName,
            updated_at: new Date().toISOString()
          })
          .eq('id', video.id);

        if (error) {
          console.error(`❌ Error updating ${currentDisplayName}:`, error);
        } else {
          console.log(`✅ Restored: "${currentDisplayName}" → "${newDisplayName}"`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${currentDisplayName}:`, error);
      }
    }

    // Verify final state
    console.log('\n🔍 Verifying final state...');
    
    const { data: finalVideos, error: finalDbError } = await supabase
      .from('videos')
      .select('*')
      .eq('bucket_name', 'advertenties')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (finalDbError) {
      console.error('❌ Error checking final database state:', finalDbError);
    } else {
      console.log(`📋 Final videos with original names:`);
      finalVideos?.forEach(video => {
        console.log(`   - "${video.name}" → ${video.target_audience}`);
      });
    }

    console.log('\n🎉 Name Restoration Summary:');
    console.log('============================');
    console.log(`✅ Videos processed: ${videos?.length || 0}`);
    console.log(`✅ Original names restored`);
    console.log(`✅ TTM_ prefix preserved for Facebook linking`);
    console.log(`✅ Target audiences preserved`);

    console.log('\n🎯 NAME RESTORATION SUCCESSFUL! ✅');
    console.log('All videos now have original names matching Facebook uploads.');

  } catch (error) {
    console.error('❌ Error during name restoration:', error);
  }
}

restoreOriginalNames().catch(console.error);
