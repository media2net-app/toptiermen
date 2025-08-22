require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUploadedVideos() {
  console.log('🔍 Checking uploaded videos and setting up database records...\n');
  
  try {
    // Get all files from bucket
    const { data: files, error: bucketError } = await supabase.storage
      .from('advertenties')
      .list('', { limit: 100 });

    if (bucketError) {
      console.error('❌ Error fetching bucket files:', bucketError);
      return;
    }

    console.log(`📁 Found ${files?.length || 0} files in bucket:`);
    files?.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.name} (${(file.metadata?.size / 1024 / 1024).toFixed(2)} MB)`);
    });

    // Get current database records
    const { data: dbVideos, error: dbError } = await supabase
      .from('videos')
      .select('*')
      .eq('bucket_name', 'advertenties');

    if (dbError) {
      console.error('❌ Error fetching database videos:', dbError);
      return;
    }

    console.log(`\n📋 Found ${dbVideos?.length || 0} videos in database`);

    // Create database records for files that don't have records
    const filesWithoutRecords = files?.filter(file => 
      !dbVideos?.some(video => video.original_name === file.name)
    ) || [];

    if (filesWithoutRecords.length > 0) {
      console.log(`\n➕ Creating database records for ${filesWithoutRecords.length} files...`);
      
      for (const file of filesWithoutRecords) {
        // Determine target audience based on filename
        let targetAudience = 'Algemeen';
        let displayName = file.name.replace('.mp4', '');
        
        if (file.name.toLowerCase().includes('jongeren')) {
          targetAudience = 'Jongeren';
        } else if (file.name.toLowerCase().includes('vaders')) {
          targetAudience = 'Vaders';
        } else if (file.name.toLowerCase().includes('zakelijk')) {
          targetAudience = 'Zakelijk';
        }

        // Check if it's an "Updated" video
        if (file.name.toLowerCase().includes('updated') || file.name.toLowerCase().includes('nieuw')) {
          displayName += ' (Updated)';
        }

        const newRecord = {
          name: displayName,
          original_name: file.name,
          file_path: `advertenties/${file.name}`,
          file_size: file.metadata?.size || 0,
          mime_type: 'video/mp4',
          duration_seconds: null,
          width: null,
          height: null,
          target_audience: targetAudience,
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
            console.error(`❌ Error creating record for ${file.name}:`, error);
          } else {
            console.log(`✅ Created record: ${displayName} → ${targetAudience}`);
          }
        } catch (error) {
          console.error(`❌ Error processing ${file.name}:`, error);
        }
      }
    } else {
      console.log('\n✅ All files already have database records');
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
        console.log(`   - "${video.name}" → ${video.target_audience}`);
      });
    }

    // Check bucket again
    const { data: finalFiles, error: finalBucketError } = await supabase.storage
      .from('advertenties')
      .list('', { limit: 100 });

    if (finalBucketError) {
      console.error('❌ Error checking final bucket state:', finalBucketError);
    } else {
      console.log(`\n📁 Final files in bucket: ${finalFiles?.length || 0}`);
      finalFiles?.forEach(file => {
        console.log(`   - ${file.name}`);
      });
    }

    console.log('\n🎉 Setup Summary:');
    console.log('================');
    console.log(`✅ Files in bucket: ${finalFiles?.length || 0}`);
    console.log(`✅ Videos in database: ${finalVideos?.length || 0}`);
    console.log(`✅ Database records created: ${filesWithoutRecords.length}`);

    if ((finalVideos?.length || 0) === (finalFiles?.length || 0)) {
      console.log('\n🎯 SETUP SUCCESSFUL! ✅');
      console.log('All uploaded videos now have proper database records.');
    } else {
      console.log('\n⚠️  SETUP INCOMPLETE! ❌');
    }

  } catch (error) {
    console.error('❌ Error during setup:', error);
  }
}

checkUploadedVideos().catch(console.error);
