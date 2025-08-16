require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function improveVideoMapping() {
  console.log('🔍 VERBETEREN VIDEO MAPPING');
  console.log('===========================');
  
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

    console.log(`\n📊 Totaal oefeningen: ${exercises.length}`);
    
    // Toon alle oefening namen
    console.log('\n📝 ALLE OEFENING NAMEN IN DATABASE:');
    console.log('====================================');
    exercises.forEach((exercise, index) => {
      const hasVideo = exercise.video_url ? '✅' : '❌';
      console.log(`${index + 1}. ${hasVideo} ${exercise.name}`);
    });

    // Video bestanden uit de public map
    const videoFiles = [
      'Biceps Curl Barbell.mp4',
      'Biceps Curl Dumbells.mp4',
      'Shoulder Press Dumbells.mp4',
      'Dumbell Press.mp4',
      'Front Raises.mp4',
      'Side Raises.mp4',
      'Machine Back Extensie.mp4',
      'Seated Dip.mp4',
      'Machine Biceps Curl.mp4',
      'Abdominal Crunch.mp4',
      'Lateral Raise.mp4',
      'Machine Shoulder Press.mp4',
      'Machine Chest Press.mp4',
      'Pectoral Fly.mp4',
      'Calf Press.mp4',
      'Adductie Machine.mp4',
      'Abductie Machine.mp4',
      'Seated Leg Curl.mp4',
      'Walking Lunges.mp4',
      'Stiff Deadlift.mp4',
      'Deadlift.mp4',
      'Squatten.mp4',
      'Lower Back Extensie.mp4',
      'Booty Builder.mp4',
      'Leg Raises.mp4',
      'Hack Squat.mp4',
      'Calf Raises.mp4',
      'Leg Curl.mp4',
      'leg extensie.mp4',
      'legg press.mp4',
      'triceps rope cabel.mp4',
      'biceps cabel.mp4',
      'triceps kabel rechte stang.mp4',
      'militairy press.mp4',
      'schouder press barbell.mp4',
      'Cabel pull touw voor rug.mp4',
      'tricpes dips_.mp4',
      'T Bar roeien machine.mp4',
      'Kneeling leg curl.mp4',
      'triceps extension apparaat.mp4',
      'Seated Row.mp4',
      'Lat Pull Down.mp4',
      'Vaste Lat Pulldown.mp4',
      'Barbel Row Rug.mp4',
      'Cabel Row Rug.mp4',
      'Cabel Flye Borst.mp4',
      'Push Up.mp4',
      'Supine Press.mp4',
      'Machine Pull Up.mp4',
      'Dumbell Flyes.mp4',
      'Incline Chest press.mp4',
      'bankdrukken.mp4'
    ];

    console.log('\n🎥 VIDEO BESTANDEN:');
    console.log('===================');
    videoFiles.forEach((video, index) => {
      console.log(`${index + 1}. ${video}`);
    });

    console.log('\n🔍 SUGGESTIES VOOR MAPPING:');
    console.log('===========================');
    
    // Automatische suggesties maken
    const suggestions = {};
    
    for (const videoFile of videoFiles) {
      const videoName = videoFile.replace('.mp4', '').toLowerCase();
      const matches = [];
      
      for (const exercise of exercises) {
        const exerciseName = exercise.name.toLowerCase();
        
        // Check voor exacte matches
        if (videoName.includes(exerciseName) || exerciseName.includes(videoName)) {
          matches.push({ exercise, score: 100 });
        }
        // Check voor keyword matches
        else {
          const videoWords = videoName.split(' ');
          const exerciseWords = exerciseName.split(' ');
          let score = 0;
          
          for (const videoWord of videoWords) {
            for (const exerciseWord of exerciseWords) {
              if (videoWord.length > 2 && exerciseWord.length > 2) {
                if (videoWord.includes(exerciseWord) || exerciseWord.includes(videoWord)) {
                  score += 20;
                }
              }
            }
          }
          
          if (score > 0) {
            matches.push({ exercise, score });
          }
        }
      }
      
      // Sorteer op score
      matches.sort((a, b) => b.score - a.score);
      
      if (matches.length > 0) {
        suggestions[videoFile] = matches.slice(0, 3); // Top 3 matches
      }
    }

    // Toon suggesties
    for (const [videoFile, matches] of Object.entries(suggestions)) {
      console.log(`\n📹 ${videoFile}:`);
      matches.forEach((match, index) => {
        const hasVideo = match.exercise.video_url ? ' (HAS VIDEO)' : '';
        console.log(`  ${index + 1}. ${match.exercise.name} (score: ${match.score})${hasVideo}`);
      });
    }

    console.log('\n💡 VOLGENDE STAPPEN:');
    console.log('====================');
    console.log('1. Bekijk de suggesties hierboven');
    console.log('2. Pas de mapping aan in upload-local-videos.js');
    console.log('3. Run het upload script opnieuw');

  } catch (error) {
    console.error('❌ Fout bij verbeteren mapping:', error);
  }
}

improveVideoMapping().catch(console.error);
