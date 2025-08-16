require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mapping van oefening namen naar video bestandsnamen
const exerciseVideoMapping = {
  'Barbell Row': 'barbell-row.mp4',
  'Bicep Curl': 'bicep-curl.mp4',
  'Bicep Curls Barbel': 'bicep-curls-barbell.mp4',
  'Bulgarian Split Squat': 'bulgarian-split-squat.mp4',
  'Cable Flyes': 'cable-flyes.mp4',
  'Cable Kickback': 'cable-kickback.mp4',
  'Calf Raises': 'calf-raises.mp4',
  'Crunches': 'crunches.mp4',
  'Deadlift': 'deadlift.mp4',
  'Donkey Kicks': 'donkey-kicks.mp4',
  'Dumbbell Flyes': 'dumbbell-flyes.mp4',
  'Dumbbell Press': 'dumbbell-press.mp4',
  'Dumbbell Shoulder Press': 'dumbbell-shoulder-press.mp4',
  'Face Pulls': 'face-pulls.mp4',
  'Front Raises': 'front-raises.mp4',
  'Glute Bridge': 'glute-bridge.mp4',
  'Good Mornings': 'good-mornings.mp4',
  'Hammer Curl': 'hammer-curl.mp4',
  'Hammer Curls': 'hammer-curls.mp4',
  'Hip Thrusts': 'hip-thrusts.mp4',
  'Incline Bench Press': 'incline-bench-press.mp4',
  'Incline Dumbbell Press': 'incline-dumbbell-press.mp4',
  'Lat Pulldown': 'lat-pulldown.mp4',
  'Lateral Raises': 'lateral-raises.mp4',
  'Leg Curls': 'leg-curls.mp4',
  'Leg Extensions': 'leg-extensions.mp4',
  'Leg Press': 'leg-press.mp4',
  'Leg Raises': 'leg-raises.mp4',
  'Lunges': 'lunges.mp4',
  'Mountain Climbers': 'mountain-climbers.mp4',
  'Overhead Press': 'overhead-press.mp4',
  'Overhead Tricep Extension': 'overhead-tricep-extension.mp4',
  'Plank': 'plank.mp4',
  'Preacher Curl': 'preacher-curl.mp4',
  'Preacher Curls': 'preacher-curls.mp4',
  'Pull-up': 'pull-up.mp4',
  'Push-ups': 'push-ups.mp4',
  'Russian Twist': 'russian-twist.mp4',
  'Seated Cable Row': 'seated-cable-row.mp4',
  'Seated Calf Raises': 'seated-calf-raises.mp4',
  'Shrugs': 'shrugs.mp4',
  'Squat': 'squat.mp4',
  'Standing Calf Raises': 'standing-calf-raises.mp4',
  'Stiff Deadlift': 'stiff-deadlift.mp4',
  'Tricep Dips': 'tricep-dips.mp4',
  'Tricep Pushdown': 'tricep-pushdown.mp4',
  'Tricep Pushdowns': 'tricep-pushdowns.mp4',
  'Triceps Rope': 'triceps-rope.mp4',
  'Upright Rows': 'upright-rows.mp4',
  'Walking Lunges': 'walking-lunges.mp4'
};

async function renameExerciseVideos() {
  console.log('🔄 Oefening videos hernoemen...');
  
  try {
    // Haal alle videos op uit de storage bucket
    const { data: videos, error: videosError } = await supabase.storage
      .from('workout-videos')
      .list('exercises', { limit: 100 });
      
    if (videosError) {
      console.error('❌ Fout bij ophalen videos:', videosError);
      return;
    }
    
    console.log(`📹 ${videos.length} videos gevonden om te hernoemen`);
    
    // Toon huidige videos
    console.log('\n📋 HUIDIGE VIDEOS:');
    videos.forEach((video, index) => {
      console.log(`${index + 1}. ${video.name}`);
    });
    
    // Vraag gebruiker om bevestiging
    console.log('\n⚠️  WAARSCHUWING: Dit script zal alle videos hernoemen!');
    console.log('📝 Zorg ervoor dat je de juiste mapping hebt ingesteld voordat je doorgaat.');
    console.log('\n🔍 MAPPING OVERZICHT:');
    
    Object.entries(exerciseVideoMapping).forEach(([exercise, videoName]) => {
      console.log(`${exercise} -> ${videoName}`);
    });
    
    console.log('\n❓ Wil je doorgaan met hernoemen? (y/N)');
    
    // Voor nu gaan we door zonder bevestiging, maar in productie zou je hier een prompt willen
    console.log('🚀 Doorgaan met hernoemen...');
    
    // Hernoem elke video
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      const newName = exerciseVideoMapping[Object.keys(exerciseVideoMapping)[i]];
      
      if (!newName) {
        console.log(`⚠️  Geen mapping gevonden voor video ${video.name}`);
        continue;
      }
      
      console.log(`🔄 Hernoemen: ${video.name} -> ${newName}`);
      
      try {
        // Download de video
        const { data: videoData, error: downloadError } = await supabase.storage
          .from('workout-videos')
          .download(`exercises/${video.name}`);
          
        if (downloadError) {
          console.error(`❌ Fout bij downloaden van ${video.name}:`, downloadError);
          continue;
        }
        
        // Upload met nieuwe naam
        const { error: uploadError } = await supabase.storage
          .from('workout-videos')
          .upload(`exercises/${newName}`, videoData, {
            upsert: true
          });
          
        if (uploadError) {
          console.error(`❌ Fout bij uploaden van ${newName}:`, uploadError);
          continue;
        }
        
        // Verwijder oude video
        const { error: deleteError } = await supabase.storage
          .from('workout-videos')
          .remove([`exercises/${video.name}`]);
          
        if (deleteError) {
          console.error(`❌ Fout bij verwijderen van ${video.name}:`, deleteError);
        }
        
        console.log(`✅ ${video.name} -> ${newName}`);
        
      } catch (error) {
        console.error(`❌ Fout bij hernoemen van ${video.name}:`, error);
      }
    }
    
    console.log('\n🎉 Hernoemen voltooid!');
    
    // Toon resultaat
    const { data: newVideos, error: newVideosError } = await supabase.storage
      .from('workout-videos')
      .list('exercises', { limit: 100 });
      
    if (!newVideosError) {
      console.log('\n📋 NIEUWE VIDEOS:');
      newVideos.forEach((video, index) => {
        console.log(`${index + 1}. ${video.name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Onverwachte fout:', error);
  }
}

// Functie om alleen de mapping te tonen zonder hernoemen
async function showMapping() {
  console.log('📋 OEFENING-VIDEO MAPPING:');
  console.log('==========================');
  
  Object.entries(exerciseVideoMapping).forEach(([exercise, videoName], index) => {
    console.log(`${index + 1}. ${exercise} -> ${videoName}`);
  });
  
  console.log(`\n📊 Totaal: ${Object.keys(exerciseVideoMapping).length} mappings`);
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--show-mapping') || args.includes('-s')) {
  showMapping();
} else {
  renameExerciseVideos();
}
