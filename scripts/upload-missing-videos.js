require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function uploadMissingVideos() {
  console.log('📤 UPLOADING MISSING VIDEOS');
  console.log('===========================');
  
  try {
    // 1. Haal alle oefeningen op
    const { data: exercises, error } = await supabase
      .from('exercises')
      .select('id, name, video_url')
      .not('video_url', 'is', null)
      .order('name');

    if (error) {
      console.error('❌ Fout bij ophalen oefeningen:', error);
      return;
    }

    console.log(`\n📊 ${exercises.length} oefeningen gevonden`);

    // 2. Haal bestaande videos op uit storage
    const { data: existingFiles, error: storageError } = await supabase.storage
      .from('workout-videos')
      .list('exercises', {
        limit: 1000,
        offset: 0
      });

    if (storageError) {
      console.error('❌ Fout bij ophalen storage files:', storageError);
      return;
    }

    const existingVideoNames = existingFiles.map(file => file.name);
    console.log(`\n📁 ${existingVideoNames.length} bestaande videos in storage`);

    // 3. Bepaal welke videos ontbreken
    const missingVideos = [];
    for (const exercise of exercises) {
      const videoFileName = exercise.video_url.split('/').pop();
      if (!existingVideoNames.includes(videoFileName)) {
        missingVideos.push({
          exercise: exercise,
          fileName: videoFileName
        });
      }
    }

    console.log(`\n❌ ${missingVideos.length} videos ontbreken in storage`);

    if (missingVideos.length === 0) {
      console.log('✅ Alle videos zijn al geüpload!');
      return;
    }

    // 4. Upload ontbrekende videos
    console.log('\n📤 UPLOADING MISSING VIDEOS...');
    console.log('================================');
    
    const videoDir = path.join(process.cwd(), 'public', 'video-oefeningen');
    let uploadedCount = 0;
    let failedCount = 0;

    for (const { exercise, fileName } of missingVideos) {
      console.log(`\n📹 Uploaden: ${fileName}`);
      
      const filePath = path.join(videoDir, fileName);
      
      // Controleer of het bestand bestaat
      if (!fs.existsSync(filePath)) {
        console.log(`❌ Bestand niet gevonden: ${filePath}`);
        failedCount++;
        continue;
      }

      try {
        const fileBuffer = fs.readFileSync(filePath);
        
        const { data, error: uploadError } = await supabase.storage
          .from('workout-videos')
          .upload(`exercises/${fileName}`, fileBuffer, {
            contentType: 'video/mp4',
            upsert: false
          });

        if (uploadError) {
          console.log(`❌ Upload fout: ${uploadError.message}`);
          failedCount++;
        } else {
          console.log(`✅ ${fileName} succesvol geüpload`);
          uploadedCount++;
        }
      } catch (error) {
        console.log(`❌ Fout bij uploaden ${fileName}:`, error.message);
        failedCount++;
      }
    }

    console.log('\n📊 UPLOAD SAMENVATTING:');
    console.log('======================');
    console.log(`✅ Succesvol geüpload: ${uploadedCount}`);
    console.log(`❌ Gefaald: ${failedCount}`);
    console.log(`📁 Totaal verwerkt: ${missingVideos.length}`);

    if (uploadedCount > 0) {
      console.log('\n🎉 Upload voltooid!');
      console.log('💡 Test nu de video previews in de interface.');
    }

  } catch (error) {
    console.error('❌ Fout bij uploaden videos:', error);
  }
}

uploadMissingVideos().catch(console.error);
