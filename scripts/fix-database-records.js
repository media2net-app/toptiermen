require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Expected videos with their target audiences
const expectedVideos = [
  { name: 'algemeen_01', original_name: 'algemeen_01.mp4', target_audience: 'Algemeen', is_updated: true },
  { name: 'algemeen_02', original_name: 'algemeen_02.mp4', target_audience: 'Algemeen', is_updated: false },
  { name: 'algemeen_03', original_name: 'algemeen_03.mp4', target_audience: 'Algemeen', is_updated: false },
  { name: 'algemeen_04', original_name: 'algemeen_04.mp4', target_audience: 'Algemeen', is_updated: false },
  { name: 'algemeen_05', original_name: 'algemeen_05.mp4', target_audience: 'Algemeen', is_updated: false },
  { name: 'jongeren_01', original_name: 'jongeren_01.mp4', target_audience: 'Jongeren', is_updated: true },
  { name: 'jongeren_02', original_name: 'jongeren_02.mp4', target_audience: 'Jongeren', is_updated: false },
  { name: 'vaders_01', original_name: 'vaders_01.mp4', target_audience: 'Vaders', is_updated: true },
  { name: 'vaders_02', original_name: 'vaders_02.mp4', target_audience: 'Vaders', is_updated: false },
  { name: 'zakelijk_01', original_name: 'zakelijk_01.mp4', target_audience: 'Zakelijk', is_updated: false },
  { name: 'zakelijk_02', original_name: 'zakelijk_02.mp4', target_audience: 'Zakelijk', is_updated: false }
];

async function fixDatabaseRecords() {
  console.log('🔧 Fixing database records to match bucket contents...\n');
  
  try {
    // Get current database records
    const { data: currentVideos, error: dbError } = await supabase
      .from('videos')
      .select('*')
      .eq('bucket_name', 'advertenties')
      .eq('is_deleted', false);

    if (dbError) {
      console.error('❌ Error fetching current videos:', dbError);
      return;
    }

    console.log(`📋 Current videos in database: ${currentVideos?.length || 0}`);
    currentVideos?.forEach(video => {
      console.log(`   - ${video.name} (${video.original_name})`);
    });

    // Get bucket files
    const { data: bucketFiles, error: bucketError } = await supabase.storage
      .from('advertenties')
      .list('', { limit: 100 });

    if (bucketError) {
      console.error('❌ Error fetching bucket files:', bucketError);
      return;
    }

    console.log(`\n📁 Files in bucket: ${bucketFiles?.length || 0}`);
    bucketFiles?.forEach(file => {
      console.log(`   - ${file.name}`);
    });

    // Find missing database records
    const bucketFileNames = bucketFiles?.map(f => f.name) || [];
    const existingDbFileNames = currentVideos?.map(v => v.original_name) || [];
    
    const missingFiles = bucketFileNames.filter(fileName => 
      !existingDbFileNames.includes(fileName)
    );

    console.log(`\n🔍 Missing database records: ${missingFiles.length}`);
    missingFiles.forEach(file => {
      console.log(`   - ${file}`);
    });

    // Add missing database records
    if (missingFiles.length > 0) {
      console.log('\n➕ Adding missing database records...');
      
      for (const fileName of missingFiles) {
        const expectedVideo = expectedVideos.find(v => v.original_name === fileName);
        
        if (expectedVideo) {
          const displayName = expectedVideo.is_updated 
            ? `${expectedVideo.name} (Updated)`
            : expectedVideo.name;

          const newRecord = {
            name: displayName,
            original_name: fileName,
            file_path: `advertenties/${fileName}`,
            file_size: 0, // Will be updated when we get file info
            mime_type: 'video/mp4',
            duration_seconds: null,
            width: null,
            height: null,
            target_audience: expectedVideo.target_audience,
            campaign_status: 'active',
            bucket_name: 'advertenties',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_deleted: false
          };

          try {
            const { data, error } = await supabase
              .from('videos')
              .insert([newRecord])
              .select();

            if (error) {
              console.error(`❌ Error adding ${fileName}:`, error);
            } else {
              console.log(`✅ Added: ${displayName} (${fileName})`);
            }
          } catch (error) {
            console.error(`❌ Error processing ${fileName}:`, error);
          }
        } else {
          console.log(`⚠️  No expected video config for: ${fileName}`);
        }
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
      console.log(`📋 Final videos in database: ${finalVideos?.length || 0}`);
      finalVideos?.forEach(video => {
        console.log(`   - ${video.name} (${video.original_name}) → ${video.target_audience}`);
      });
    }

    // Final verification
    const hasCorrectCount = finalVideos?.length === 11;
    const allExpectedPresent = expectedVideos.every(expected => 
      finalVideos?.some(v => v.original_name === expected.original_name)
    );

    console.log('\n🎉 Fix Summary:');
    console.log('===============');
    console.log(`✅ Missing records added: ${missingFiles.length}`);
    console.log(`✅ Final video count: ${finalVideos?.length || 0}`);
    console.log(`✅ Correct count (11): ${hasCorrectCount ? 'YES' : 'NO'}`);
    console.log(`✅ All expected videos present: ${allExpectedPresent ? 'YES' : 'NO'}`);

    if (hasCorrectCount && allExpectedPresent) {
      console.log('\n🎯 DATABASE FIX SUCCESSFUL! ✅');
      console.log('All 11 videos now have proper database records.');
    } else {
      console.log('\n⚠️  DATABASE FIX INCOMPLETE! ❌');
    }

  } catch (error) {
    console.error('❌ Error during database fix:', error);
  }
}

fixDatabaseRecords().catch(console.error);
