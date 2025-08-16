require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Video mapping uit het upload script
const videoToExerciseMapping = {
  'Biceps Curl Barbell.mp4': 'Barbell Biceps Curl',
  'Biceps Curl Dumbells.mp4': 'Dumbbell Biceps Curl',
  'Shoulder Press Dumbells.mp4': 'Dumbbell Shoulder Press',
  'Dumbell Press.mp4': 'Dumbbell Press',
  'Front Raises.mp4': 'Front Raises',
  'Side Raises.mp4': 'Lateral Raises',
  'Machine Back Extensie.mp4': 'Machine Back Extension',
  'Seated Dip.mp4': 'Seated Dip',
  'Machine Biceps Curl.mp4': 'Machine Biceps Curl',
  'Abdominal Crunch.mp4': 'Abdominal Crunch',
  'Lateral Raise.mp4': 'Lateral Raises',
  'Machine Shoulder Press.mp4': 'Machine Shoulder Press',
  'Machine Chest Press.mp4': 'Machine Chest Press',
  'Pectoral Fly.mp4': 'Pectoral Fly',
  'Calf Press.mp4': 'Calf Press',
  'Adductie Machine.mp4': 'Adductor Machine',
  'Abductie Machine.mp4': 'Abductor Machine',
  'Seated Leg Curl.mp4': 'Seated Leg Curl',
  'Walking Lunges.mp4': 'Walking Lunges',
  'Stiff Deadlift.mp4': 'Stiff Leg Deadlift',
  'Deadlift.mp4': 'Deadlift',
  'Squatten.mp4': 'Squat',
  'Lower Back Extensie.mp4': 'Lower Back Extension',
  'Booty Builder.mp4': 'Booty Builder',
  'Leg Raises.mp4': 'Leg Raises',
  'Hack Squat.mp4': 'Hack Squat',
  'Calf Raises.mp4': 'Calf Raises',
  'Leg Curl.mp4': 'Leg Curl',
  'leg extensie.mp4': 'Leg Extension',
  'legg press.mp4': 'Leg Press',
  'triceps rope cabel.mp4': 'Triceps Rope Cable',
  'biceps cabel.mp4': 'Biceps Cable',
  'triceps kabel rechte stang.mp4': 'Triceps Cable Bar',
  'militairy press.mp4': 'Military Press',
  'schouder press barbell.mp4': 'Barbell Shoulder Press',
  'Cabel pull touw voor rug.mp4': 'Cable Pull Rope Back',
  'tricpes dips_.mp4': 'Triceps Dips',
  'T Bar roeien machine.mp4': 'T-Bar Row Machine',
  'Kneeling leg curl.mp4': 'Kneeling Leg Curl',
  'triceps extension apparaat.mp4': 'Triceps Extension Machine',
  'Seated Row.mp4': 'Seated Row',
  'Lat Pull Down.mp4': 'Lat Pulldown',
  'Vaste Lat Pulldown.mp4': 'Fixed Lat Pulldown',
  'Barbel Row Rug.mp4': 'Barbell Row',
  'Cabel Row Rug.mp4': 'Cable Row',
  'Cabel Flye Borst.mp4': 'Cable Flye Chest',
  'Push Up.mp4': 'Push Up',
  'Supine Press.mp4': 'Supine Press',
  'Machine Pull Up.mp4': 'Machine Pull Up',
  'Dumbell Flyes.mp4': 'Dumbbell Flyes',
  'Incline Chest press.mp4': 'Incline Chest Press',
  'bankdrukken.mp4': 'Bench Press'
};

async function checkExerciseMapping() {
  console.log('🔍 EXERCISE MAPPING VERIFICATIE');
  console.log('===============================');
  
  try {
    // Haal alle oefeningen op
    const { data: exercises, error } = await supabase
      .from('exercises')
      .select('id, name, video_url')
      .order('name');

    if (error) {
      console.error('❌ Fout bij ophalen oefeningen:', error);
      return;
    }

    console.log(`\n📊 DATABASE STATISTIEKEN:`);
    console.log(`- Totaal oefeningen: ${exercises.length}`);
    console.log(`- Met video_url: ${exercises.filter(e => e.video_url).length}`);
    console.log(`- Zonder video_url: ${exercises.filter(e => !e.video_url).length}`);

    // Controleer mapping
    console.log('\n🔗 MAPPING VERIFICATIE:');
    console.log('========================');
    
    const exerciseNames = exercises.map(e => e.name);
    const mappedExercises = Object.values(videoToExerciseMapping);
    
    let foundCount = 0;
    let missingCount = 0;
    let alreadyLinkedCount = 0;
    
    for (const [videoFile, exerciseName] of Object.entries(videoToExerciseMapping)) {
      const exercise = exercises.find(e => e.name === exerciseName);
      
      if (exercise) {
        foundCount++;
        if (exercise.video_url) {
          alreadyLinkedCount++;
          console.log(`✅ ${videoFile} → ${exerciseName} (al gekoppeld)`);
        } else {
          console.log(`🔗 ${videoFile} → ${exerciseName} (klaar voor koppeling)`);
        }
      } else {
        missingCount++;
        console.log(`❌ ${videoFile} → ${exerciseName} (NIET GEVONDEN)`);
      }
    }

    console.log('\n📋 SAMENVATTING:');
    console.log('================');
    console.log(`✅ Gevonden in database: ${foundCount}`);
    console.log(`❌ Niet gevonden: ${missingCount}`);
    console.log(`🔗 Al gekoppeld: ${alreadyLinkedCount}`);
    console.log(`📤 Klaar voor upload/koppeling: ${foundCount - alreadyLinkedCount}`);

    // Toon oefeningen zonder video
    const exercisesWithoutVideo = exercises.filter(e => !e.video_url);
    if (exercisesWithoutVideo.length > 0) {
      console.log('\n📝 OEFENINGEN ZONDER VIDEO:');
      console.log('===========================');
      exercisesWithoutVideo.forEach(exercise => {
        console.log(`- ${exercise.name}`);
      });
    }

    // Toon oefeningen die niet in mapping staan
    const unmappedExercises = exerciseNames.filter(name => 
      !mappedExercises.includes(name)
    );
    if (unmappedExercises.length > 0) {
      console.log('\n⚠️  OEFENINGEN NIET IN MAPPING:');
      console.log('===============================');
      unmappedExercises.forEach(name => {
        console.log(`- ${name}`);
      });
    }

  } catch (error) {
    console.error('❌ Fout bij verificatie:', error);
  }
}

checkExerciseMapping().catch(console.error);
