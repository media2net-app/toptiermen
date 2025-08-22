require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyVideoStatus() {
  console.log('🔍 Verifying video status and confirming "Updated" videos...\n');
  
  try {
    // Fetch all videos from the database
    const { data: videos, error } = await supabase
      .from('videos')
      .select('*')
      .eq('bucket_name', 'advertenties')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching videos:', error);
      return;
    }

    console.log(`📋 Total videos in database: ${videos?.length || 0}\n`);

    // Group videos by their base name (without Updated suffix)
    const videoGroups = {};
    
    videos?.forEach(video => {
      const baseName = video.name.replace(' (Updated)', '');
      if (!videoGroups[baseName]) {
        videoGroups[baseName] = [];
      }
      videoGroups[baseName].push(video);
    });

    console.log('📊 Video Groups Analysis:');
    console.log('========================\n');

    let updatedCount = 0;
    let totalGroups = 0;

    for (const [baseName, groupVideos] of Object.entries(videoGroups)) {
      totalGroups++;
      console.log(`🎬 **${baseName}**:`);
      
      groupVideos.forEach(video => {
        const isUpdated = video.name.includes('(Updated)');
        const status = isUpdated ? '🆕 UPDATED' : '📁 OLD';
        
        console.log(`   ${status} - ${video.name}`);
        console.log(`      Original Name: ${video.original_name}`);
        console.log(`      Target Audience: ${video.target_audience}`);
        console.log(`      Created: ${video.created_at}`);
        console.log(`      File Size: ${(video.file_size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`      Duration: ${video.duration_seconds}s`);
        console.log(`      Dimensions: ${video.width}x${video.height}`);
        console.log('');
        
        if (isUpdated) updatedCount++;
      });
    }

    console.log('📈 Summary:');
    console.log('===========');
    console.log(`✅ Total video groups: ${totalGroups}`);
    console.log(`🆕 Updated videos: ${updatedCount}`);
    console.log(`📁 Old videos: ${videos.length - updatedCount}`);
    console.log(`🎯 Total videos: ${videos.length}`);

    // Verify the 3 specific "Updated" videos
    console.log('\n🔍 Verifying the 3 "Updated" videos:');
    console.log('===================================');
    
    const expectedUpdatedVideos = [
      'algemeen_01 (Updated)',
      'jongeren_01 (Updated)', 
      'vaders_01 (Updated)'
    ];

    const actualUpdatedVideos = videos.filter(v => v.name.includes('(Updated)')).map(v => v.name);
    
    console.log('Expected Updated videos:');
    expectedUpdatedVideos.forEach(expected => {
      const found = actualUpdatedVideos.includes(expected);
      console.log(`   ${found ? '✅' : '❌'} ${expected}`);
    });

    console.log('\nActual Updated videos:');
    actualUpdatedVideos.forEach(actual => {
      console.log(`   ✅ ${actual}`);
    });

    // Check for any unexpected "Updated" videos
    const unexpectedUpdated = actualUpdatedVideos.filter(actual => 
      !expectedUpdatedVideos.includes(actual)
    );

    if (unexpectedUpdated.length > 0) {
      console.log('\n⚠️  Unexpected "Updated" videos found:');
      unexpectedUpdated.forEach(unexpected => {
        console.log(`   ⚠️  ${unexpected}`);
      });
    }

    // Verify target audiences are correct
    console.log('\n🎯 Target Audience Verification:');
    console.log('===============================');
    
    const targetAudienceMapping = {
      'algemeen_01': 'Algemeen',
      'algemeen_02': 'Algemeen', 
      'algemeen_03': 'Algemeen',
      'algemeen_04': 'Algemeen',
      'algemeen_05': 'Algemeen',
      'jongeren_01': 'Jongeren',
      'jongeren_02': 'Jongeren',
      'vaders_01': 'Vaders',
      'vaders_02': 'Vaders',
      'zakelijk_01': 'Zakelijk',
      'zakelijk_02': 'Zakelijk'
    };

    let correctAudiences = 0;
    let incorrectAudiences = 0;

    videos?.forEach(video => {
      const baseName = video.name.replace(' (Updated)', '');
      const expectedAudience = targetAudienceMapping[baseName];
      const actualAudience = video.target_audience;
      
      if (expectedAudience === actualAudience) {
        correctAudiences++;
        console.log(`   ✅ ${video.name} → ${actualAudience}`);
      } else {
        incorrectAudiences++;
        console.log(`   ❌ ${video.name} → ${actualAudience} (should be ${expectedAudience})`);
      }
    });

    console.log(`\n📊 Target Audience Summary:`);
    console.log(`   ✅ Correct: ${correctAudiences}`);
    console.log(`   ❌ Incorrect: ${incorrectAudiences}`);

    // Final verification
    console.log('\n🎉 Final Verification:');
    console.log('=====================');
    
    const hasCorrectUpdatedCount = updatedCount === 3;
    const hasCorrectTotalCount = videos.length === 11;
    const hasCorrectAudiences = incorrectAudiences === 0;
    
    console.log(`✅ 3 Updated videos: ${hasCorrectUpdatedCount ? 'YES' : 'NO'}`);
    console.log(`✅ 11 Total videos: ${hasCorrectTotalCount ? 'YES' : 'NO'}`);
    console.log(`✅ Correct target audiences: ${hasCorrectAudiences ? 'YES' : 'NO'}`);
    
    if (hasCorrectUpdatedCount && hasCorrectTotalCount && hasCorrectAudiences) {
      console.log('\n🎯 ALL VERIFICATIONS PASSED! ✅');
    } else {
      console.log('\n⚠️  SOME VERIFICATIONS FAILED! ❌');
    }

  } catch (error) {
    console.error('❌ Error during verification:', error);
  }
}

verifyVideoStatus().catch(console.error);
