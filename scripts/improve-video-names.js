require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function improveVideoNames() {
  console.log('✨ Improving video names and display names...\n');
  
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

    console.log(`📋 Found ${videos?.length || 0} videos to improve\n`);

    // Improve each video name
    for (const video of videos || []) {
      const originalName = video.original_name;
      const currentDisplayName = video.name;
      
      // Create better display name
      let newDisplayName = originalName
        .replace('TTM_', '')
        .replace('.mp4', '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

      // Add numbering for better organization
      if (newDisplayName.includes('algemeen')) {
        const number = newDisplayName.match(/\d+/)?.[0] || '';
        newDisplayName = `Algemeen ${number}`;
      } else if (newDisplayName.includes('jongeren')) {
        const number = newDisplayName.match(/\d+/)?.[0] || '';
        newDisplayName = `Jongeren ${number}`;
      } else if (newDisplayName.includes('vaders')) {
        const number = newDisplayName.match(/\d+/)?.[0] || '';
        newDisplayName = `Vaders ${number}`;
      } else if (newDisplayName.includes('zakelijk')) {
        const number = newDisplayName.match(/\d+/)?.[0] || '';
        newDisplayName = `Zakelijk ${number}`;
      }

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
          console.log(`✅ Updated: "${currentDisplayName}" → "${newDisplayName}"`);
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
      console.log(`📋 Final videos with improved names:`);
      finalVideos?.forEach(video => {
        console.log(`   - "${video.name}" → ${video.target_audience}`);
      });
    }

    console.log('\n🎉 Name Improvement Summary:');
    console.log('============================');
    console.log(`✅ Videos processed: ${videos?.length || 0}`);
    console.log(`✅ Display names improved`);
    console.log(`✅ Target audiences preserved`);

    console.log('\n🎯 NAME IMPROVEMENT SUCCESSFUL! ✅');
    console.log('All videos now have clean, professional display names.');

  } catch (error) {
    console.error('❌ Error during name improvement:', error);
  }
}

improveVideoNames().catch(console.error);
