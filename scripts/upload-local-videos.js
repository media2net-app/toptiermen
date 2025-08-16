require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Video mapping - Verbeterde mapping op basis van database oefeningen
const videoToExerciseMapping = {
  // Nieuwe videos die nog niet gekoppeld zijn
  'Front Raises.mp4': 'Front Raises',
  'legg press.mp4': 'Leg Press',
  'Abdominal Crunch.mp4': 'Crunches',
  'Machine Back Extensie.mp4': 'Cable Kickback',
  'Seated Dip.mp4': 'Tricep Dips',
  'Calf Press.mp4': 'Calf Raises',
  'Adductie Machine.mp4': 'Cable Kickback',
  'Abductie Machine.mp4': 'Cable Kickback',
  'Lower Back Extensie.mp4': 'Cable Kickback',
  'Booty Builder.mp4': 'Glute Bridge',
  'Hack Squat.mp4': 'Squat',
  'leg extensie.mp4': 'Leg Extensions',
  'biceps cabel.mp4': 'Bicep Curl',
  'militairy press.mp4': 'Overhead Press',
  'schouder press barbell.mp4': 'Overhead Press',
  'Cabel pull touw voor rug.mp4': 'Face Pulls',
  'T Bar roeien machine.mp4': 'Barbell Row',
  'Kneeling leg curl.mp4': 'Leg Curls',
  'triceps extension apparaat.mp4': 'Overhead Tricep Extension',
  'Seated Row.mp4': 'Seated Cable Row',
  'Cabel Row Rug.mp4': 'Barbell Row',
  'Cabel Flye Borst.mp4': 'Cable Flyes',
  'Push Up.mp4': 'Push-ups',
  'Supine Press.mp4': 'Dumbbell Press',
  'Machine Pull Up.mp4': 'Pull-up',
  'Incline Chest press.mp4': 'Incline Bench Press',
  'bankdrukken.mp4': 'Push-ups'
};

async function getExistingVideos() {
  console.log('🔍 Controleren welke videos al bestaan in storage...');
  
  try {
    const { data: files, error } = await supabase.storage
      .from('workout-videos')
      .list('exercises', {
        limit: 1000,
        offset: 0
      });

    if (error) {
      console.error('❌ Fout bij ophalen bestaande videos:', error);
      return [];
    }

    console.log(`✅ ${files.length} bestaande videos gevonden`);
    return files.map(file => file.name);
  } catch (error) {
    console.error('❌ Fout bij ophalen bestaande videos:', error);
    return [];
  }
}

async function uploadVideo(filePath, fileName) {
  console.log(`📤 Uploaden: ${fileName}`);
  
  try {
    const fileBuffer = fs.readFileSync(filePath);
    
    const { data, error } = await supabase.storage
      .from('workout-videos')
      .upload(`exercises/${fileName}`, fileBuffer, {
        contentType: 'video/mp4',
        upsert: false
      });

    if (error) {
      console.error(`❌ Fout bij uploaden ${fileName}:`, error);
      return false;
    }

    console.log(`✅ ${fileName} succesvol geüpload`);
    return true;
  } catch (error) {
    console.error(`❌ Fout bij uploaden ${fileName}:`, error);
    return false;
  }
}

async function linkVideoToExercise(fileName, exerciseName) {
  console.log(`🔗 Koppelen: ${fileName} → ${exerciseName}`);
  
  try {
    const videoUrl = `https://${process.env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1]}/storage/v1/object/public/workout-videos/exercises/${fileName}`;
    
    const { data, error } = await supabase
      .from('exercises')
      .update({ 
        video_url: videoUrl,
        updated_at: new Date().toISOString()
      })
      .eq('name', exerciseName);

    if (error) {
      console.error(`❌ Fout bij koppelen ${fileName} aan ${exerciseName}:`, error);
      return false;
    }

    if (data && data.length > 0) {
      console.log(`✅ ${fileName} gekoppeld aan ${exerciseName}`);
      return true;
    } else {
      console.log(`⚠️  Geen oefening gevonden met naam: ${exerciseName}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Fout bij koppelen ${fileName} aan ${exerciseName}:`, error);
    return false;
  }
}

async function uploadLocalVideos() {
  console.log('🚀 STARTING LOCAL VIDEO UPLOAD SCRIPT');
  console.log('=====================================');
  
  const videoDir = path.join(process.cwd(), 'public', 'video-oefeningen');
  
  // Controleer of de directory bestaat
  if (!fs.existsSync(videoDir)) {
    console.error('❌ Video directory niet gevonden:', videoDir);
    return;
  }

  // Haal bestaande videos op
  const existingVideos = await getExistingVideos();
  
  // Lees alle video bestanden
  const videoFiles = fs.readdirSync(videoDir)
    .filter(file => file.toLowerCase().endsWith('.mp4'))
    .sort();

  console.log(`\n📁 ${videoFiles.length} video bestanden gevonden in public/video-oefeningen/`);
  
  let uploadedCount = 0;
  let linkedCount = 0;
  let skippedCount = 0;

  for (const fileName of videoFiles) {
    console.log(`\n--- ${fileName} ---`);
    
    // Controleer of video al bestaat
    if (existingVideos.includes(fileName)) {
      console.log(`⏭️  ${fileName} bestaat al, overslaan...`);
      skippedCount++;
      continue;
    }

    // Upload video
    const filePath = path.join(videoDir, fileName);
    const uploadSuccess = await uploadVideo(filePath, fileName);
    
    if (uploadSuccess) {
      uploadedCount++;
      
      // Koppel aan oefening
      const exerciseName = videoToExerciseMapping[fileName];
      if (exerciseName) {
        const linkSuccess = await linkVideoToExercise(fileName, exerciseName);
        if (linkSuccess) {
          linkedCount++;
        }
      } else {
        console.log(`⚠️  Geen mapping gevonden voor: ${fileName}`);
      }
    }
  }

  console.log('\n📊 UPLOAD SAMENVATTING');
  console.log('======================');
  console.log(`✅ Geüpload: ${uploadedCount}`);
  console.log(`🔗 Gekoppeld: ${linkedCount}`);
  console.log(`⏭️  Overgeslagen: ${skippedCount}`);
  console.log(`📁 Totaal verwerkt: ${videoFiles.length}`);
  
  if (uploadedCount > 0) {
    console.log('\n🎉 Upload voltooid!');
  } else {
    console.log('\nℹ️  Geen nieuwe videos om te uploaden.');
  }
}

// Run het script
uploadLocalVideos().catch(console.error);
