require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function matchVideosToExercises() {
  console.log('🔍 Koppelen van videos aan oefeningen...');
  
  // Haal alle oefeningen op
  const { data: exercises, error: exercisesError } = await supabase
    .from('exercises')
    .select('*')
    .order('name');
    
  if (exercisesError) {
    console.error('❌ Fout bij ophalen oefeningen:', exercisesError);
    return;
  }
  
  // Nieuwe videos die je hebt geüpload
  const newVideos = [
    'Seated Leg Curl.mp4',
    'Squatten.mp4', 
    'Abductie Machine.mp4',
    'Deadlift.mp4',
    'Cabel Flye Borst.mp4',
    'Vaste Lat Pulldown.mp4',
    'Stiff Deadlift.mp4'
  ];
  
  console.log('🆕 NIEUWE VIDEOS:');
  console.log('================');
  newVideos.forEach((video, index) => {
    console.log(`${index + 1}. ${video}`);
  });
  
  console.log('\n🔍 MAPPING OEFENINGEN:');
  console.log('======================');
  
  // Mapping van video namen naar oefening namen
  const videoToExerciseMapping = {
    'Seated Leg Curl.mp4': 'Leg Curls',
    'Squatten.mp4': 'Squat', 
    'Abductie Machine.mp4': 'Leg Extensions', // Mogelijk abductie machine
    'Deadlift.mp4': 'Deadlift',
    'Cabel Flye Borst.mp4': 'Cable Flyes',
    'Vaste Lat Pulldown.mp4': 'Lat Pulldown',
    'Stiff Deadlift.mp4': 'Stiff Deadlift'
  };
  
  let updatedCount = 0;
  
  for (const [videoName, exerciseName] of Object.entries(videoToExerciseMapping)) {
    // Zoek de oefening in de database
    const exercise = exercises.find(ex => ex.name === exerciseName);
    
    if (exercise) {
      console.log(`✅ ${videoName} -> ${exerciseName} (ID: ${exercise.id})`);
      
      // Update de oefening met video URL
      const videoUrl = `workout-videos/exercises/${videoName}`;
      const { error: updateError } = await supabase
        .from('exercises')
        .update({ video_url: videoUrl })
        .eq('id', exercise.id);
        
      if (updateError) {
        console.error(`❌ Fout bij updaten van ${exerciseName}:`, updateError);
      } else {
        console.log(`✅ ${exerciseName} geüpdatet met video URL`);
        updatedCount++;
      }
    } else {
      console.log(`❌ Oefening '${exerciseName}' niet gevonden in database`);
    }
  }
  
  console.log(`\n📊 SAMENVATTING:`);
  console.log(`✅ Succesvol geüpdatet: ${updatedCount} oefeningen`);
  console.log(`📹 Videos gekoppeld: ${newVideos.length}`);
  
  // Toon alle oefeningen met video URLs
  console.log('\n📋 OEFENINGEN MET VIDEO URLS:');
  console.log('==============================');
  
  const { data: updatedExercises, error: fetchError } = await supabase
    .from('exercises')
    .select('name, video_url')
    .not('video_url', 'is', null)
    .order('name');
    
  if (!fetchError && updatedExercises) {
    updatedExercises.forEach(exercise => {
      console.log(`✅ ${exercise.name} -> ${exercise.video_url}`);
    });
  }
}

matchVideosToExercises().catch(console.error);
