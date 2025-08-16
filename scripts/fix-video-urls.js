require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixVideoUrls() {
  console.log('🔧 Video URLs corrigeren...');
  
  // Haal alle oefeningen op met video URLs
  const { data: exercises, error: exercisesError } = await supabase
    .from('exercises')
    .select('id, name, video_url')
    .not('video_url', 'is', null)
    .order('name');
    
  if (exercisesError) {
    console.error('❌ Fout bij ophalen oefeningen:', exercisesError);
    return;
  }
  
  console.log(`📋 ${exercises.length} oefeningen gevonden met video URLs`);
  
  let updatedCount = 0;
  
  for (const exercise of exercises) {
    console.log(`\n🔍 Controleren: ${exercise.name}`);
    console.log(`   Huidige URL: ${exercise.video_url}`);
    
    // Check of de URL al een volledige Supabase URL is
    if (exercise.video_url.startsWith('https://')) {
      console.log(`   ✅ Al een volledige URL`);
      continue;
    }
    
    // Check of het een relatieve URL is
    if (exercise.video_url.startsWith('workout-videos/exercises/')) {
      // Converteer naar volledige Supabase URL
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const fullUrl = `${supabaseUrl}/storage/v1/object/public/${exercise.video_url}`;
      
      console.log(`   🔄 Converteer naar: ${fullUrl}`);
      
      // Update de database
      const { error: updateError } = await supabase
        .from('exercises')
        .update({ video_url: fullUrl })
        .eq('id', exercise.id);
        
      if (updateError) {
        console.error(`   ❌ Fout bij updaten:`, updateError);
      } else {
        console.log(`   ✅ Succesvol geüpdatet`);
        updatedCount++;
      }
    } else {
      console.log(`   ⚠️  Onbekende URL format`);
    }
  }
  
  console.log(`\n📊 SAMENVATTING:`);
  console.log(`✅ Succesvol geüpdatet: ${updatedCount} oefeningen`);
  
  // Toon resultaat
  console.log('\n📋 OEFENINGEN MET CORRECTE VIDEO URLS:');
  console.log('========================================');
  
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
  
  // Test een video URL
  if (updatedExercises && updatedExercises.length > 0) {
    const testExercise = updatedExercises[0];
    console.log(`\n🧪 Testen van video URL: ${testExercise.name}`);
    
    try {
      const response = await fetch(testExercise.video_url, { method: 'HEAD' });
      if (response.ok) {
        console.log(`✅ Video URL werkt (Status: ${response.status})`);
      } else {
        console.log(`❌ Video URL werkt niet (Status: ${response.status})`);
      }
    } catch (error) {
      console.error(`❌ Fout bij testen video URL:`, error.message);
    }
  }
}

fixVideoUrls().catch(console.error);
