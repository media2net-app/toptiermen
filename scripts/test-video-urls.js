require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testVideoUrls() {
  console.log('🎥 TESTING VIDEO URLS');
  console.log('=====================');
  
  try {
    // Haal alle oefeningen op met video URLs
    const { data: exercises, error } = await supabase
      .from('exercises')
      .select('id, name, video_url')
      .not('video_url', 'is', null)
      .order('name');

    if (error) {
      console.error('❌ Fout bij ophalen oefeningen:', error);
      return;
    }

    console.log(`\n📊 ${exercises.length} oefeningen met video URLs gevonden`);

    // Test specifiek Abdominal Crunch
    const abdominalCrunch = exercises.find(e => e.name === 'Abdominal Crunch');
    if (abdominalCrunch) {
      console.log('\n🔍 TESTING ABDOMINAL CRUNCH:');
      console.log('============================');
      console.log(`Naam: ${abdominalCrunch.name}`);
      console.log(`Video URL: ${abdominalCrunch.video_url}`);
      
      // Test de URL
      try {
        const response = await fetch(abdominalCrunch.video_url, { method: 'HEAD' });
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);
        console.log(`Content-Length: ${response.headers.get('content-length')} bytes`);
        
        if (response.ok) {
          console.log('✅ Video URL is toegankelijk');
        } else {
          console.log('❌ Video URL is niet toegankelijk');
        }
      } catch (fetchError) {
        console.log('❌ Fout bij testen URL:', fetchError.message);
      }
    }

    // Test een paar andere videos
    console.log('\n🔍 TESTING ANDERE VIDEOS:');
    console.log('==========================');
    
    const testExercises = exercises.slice(0, 5); // Test eerste 5
    for (const exercise of testExercises) {
      console.log(`\n📹 ${exercise.name}:`);
      console.log(`URL: ${exercise.video_url}`);
      
      try {
        const response = await fetch(exercise.video_url, { method: 'HEAD' });
        console.log(`Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          console.log('✅ Toegankelijk');
        } else {
          console.log('❌ Niet toegankelijk');
        }
      } catch (fetchError) {
        console.log('❌ Fout:', fetchError.message);
      }
    }

    // Controleer storage bucket
    console.log('\n🔍 CHECKING STORAGE BUCKET:');
    console.log('===========================');
    
    try {
      const { data: files, error: storageError } = await supabase.storage
        .from('workout-videos')
        .list('exercises', {
          limit: 10,
          offset: 0
        });

      if (storageError) {
        console.log('❌ Fout bij ophalen storage files:', storageError);
      } else {
        console.log(`✅ ${files.length} files gevonden in storage bucket`);
        console.log('📋 Eerste 10 files:');
        files.slice(0, 10).forEach(file => {
          console.log(`  - ${file.name} (${file.metadata?.size || 'unknown'} bytes)`);
        });
        
        // Check of Abdominal Crunch.mp4 bestaat
        const abdominalFile = files.find(f => f.name === 'Abdominal Crunch.mp4');
        if (abdominalFile) {
          console.log('\n✅ Abdominal Crunch.mp4 gevonden in storage!');
          console.log(`Bestandsgrootte: ${abdominalFile.metadata?.size || 'unknown'} bytes`);
        } else {
          console.log('\n❌ Abdominal Crunch.mp4 NIET gevonden in storage!');
        }
      }
    } catch (storageError) {
      console.log('❌ Fout bij storage check:', storageError);
    }

    // Test CDN URL
    console.log('\n🔍 TESTING CDN URL:');
    console.log('===================');
    
    if (abdominalCrunch) {
      const cdnUrl = abdominalCrunch.video_url.replace('/storage/v1/object/public/', '/storage/v1/object/sign/');
      console.log(`CDN URL: ${cdnUrl}`);
      
      try {
        const response = await fetch(cdnUrl, { method: 'HEAD' });
        console.log(`CDN Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          console.log('✅ CDN URL is toegankelijk');
        } else {
          console.log('❌ CDN URL is niet toegankelijk');
        }
      } catch (fetchError) {
        console.log('❌ Fout bij CDN test:', fetchError.message);
      }
    }

  } catch (error) {
    console.error('❌ Fout bij testen video URLs:', error);
  }
}

testVideoUrls().catch(console.error);
