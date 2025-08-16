require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function matchNewVideos() {
  console.log('🔍 Koppelen van nieuwe videos aan oefeningen...');
  
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
    'Pectoral Fly.mp4',
    'Push Up.mp4',
    'Cabel pull touw voor rug.mp4',
    'triceps kabel rechte stang.mp4',
    'biceps cabel.mp4',
    'Biceps Curl Dumbells.mp4',
    'Cabel Row Rug.mp4',
    'Machine Biceps Curl.mp4',
    'Shoulder Press Dumbells.mp4',
    'Machine Chest Press.mp4',
    'schouder press barbell.mp4',
    'T Bar roeien machine.mp4',
    'Side Raises.mp4',
    'militairy press.mp4',
    'Leg Raises.mp4',
    'triceps rope cabel.mp4',
    'Walking Lunges.mp4',
    'Calf Press.mp4',
    'Machine Shoulder Press.mp4',
    'Biceps Curl Barbell.mp4',
    'tricpes dips_.mp4'
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
    'Pectoral Fly.mp4': 'Dumbbell Flyes',
    'Push Up.mp4': 'Push-ups',
    'Cabel pull touw voor rug.mp4': 'Seated Cable Row',
    'triceps kabel rechte stang.mp4': 'Tricep Pushdown',
    'biceps cabel.mp4': 'Bicep Curl',
    'Biceps Curl Dumbells.mp4': 'Bicep Curl',
    'Cabel Row Rug.mp4': 'Barbell Row',
    'Machine Biceps Curl.mp4': 'Bicep Curls Barbel',
    'Shoulder Press Dumbells.mp4': 'Dumbbell Shoulder Press',
    'Machine Chest Press.mp4': 'Dumbbell Press',
    'schouder press barbell.mp4': 'Overhead Press',
    'T Bar roeien machine.mp4': 'Barbell Row',
    'Side Raises.mp4': 'Lateral Raises',
    'militairy press.mp4': 'Overhead Press',
    'Leg Raises.mp4': 'Leg Raises',
    'triceps rope cabel.mp4': 'Triceps Rope',
    'Walking Lunges.mp4': 'Walking Lunges',
    'Calf Press.mp4': 'Calf Raises',
    'Machine Shoulder Press.mp4': 'Overhead Press',
    'Biceps Curl Barbell.mp4': 'Bicep Curls Barbel',
    'tricpes dips_.mp4': 'Tricep Dips'
  };
  
  let updatedCount = 0;
  let skippedCount = 0;
  
  for (const [videoName, exerciseName] of Object.entries(videoToExerciseMapping)) {
    // Zoek de oefening in de database
    const exercise = exercises.find(ex => ex.name === exerciseName);
    
    if (exercise) {
      // Check of de oefening al een video heeft
      if (exercise.video_url) {
        console.log(`⚠️  ${videoName} -> ${exerciseName} (AL HEEFT VIDEO)`);
        skippedCount++;
        continue;
      }
      
      console.log(`✅ ${videoName} -> ${exerciseName} (ID: ${exercise.id})`);
      
      // Update de oefening met video URL (relatieve URL)
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
  console.log(`⚠️  Overgeslagen (had al video): ${skippedCount} oefeningen`);
  console.log(`📹 Videos gekoppeld: ${newVideos.length}`);
  
  // Converteer URLs naar volledige URLs
  console.log('\n🔧 URLs converteren naar volledige URLs...');
  await convertToFullUrls();
  
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
      const isFullUrl = exercise.video_url.startsWith('https://');
      const status = isFullUrl ? '✅' : '❌';
      console.log(`${status} ${exercise.name} -> ${exercise.video_url.substring(0, 80)}...`);
    });
  }
}

async function convertToFullUrls() {
  const { data: exercises, error: exercisesError } = await supabase
    .from('exercises')
    .select('id, name, video_url')
    .not('video_url', 'is', null)
    .order('name');
    
  if (exercisesError) return;
  
  let convertedCount = 0;
  
  for (const exercise of exercises) {
    if (exercise.video_url.startsWith('workout-videos/exercises/')) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const fullUrl = `${supabaseUrl}/storage/v1/object/public/${exercise.video_url}`;
      
      const { error: updateError } = await supabase
        .from('exercises')
        .update({ video_url: fullUrl })
        .eq('id', exercise.id);
        
      if (!updateError) {
        convertedCount++;
      }
    }
  }
  
  console.log(`✅ ${convertedCount} URLs geconverteerd naar volledige URLs`);
}

matchNewVideos().catch(console.error);
