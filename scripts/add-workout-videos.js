const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addWorkoutVideos() {
  try {
    console.log('🏋️ Adding workout video URLs to training exercises...\n');

    // 1. Get all training schema exercises
    console.log('1️⃣ Fetching training schema exercises...');
    const { data: exercises, error: exercisesError } = await supabase
      .from('training_schema_exercises')
      .select('*')
      .order('order_index');

    if (exercisesError) {
      console.log('❌ Error fetching exercises:', exercisesError.message);
      return;
    }

    console.log(`✅ Found ${exercises?.length || 0} exercises`);

    // 2. Define workout video mappings
    const workoutVideos = {
      'Bench Press': 'workout-videos/exercises/bench-press-tutorial.mp4',
      'Incline Dumbbell Press': 'workout-videos/exercises/incline-dumbbell-press-tutorial.mp4',
      'Overhead Press': 'workout-videos/exercises/overhead-press-tutorial.mp4',
      'Lateral Raises': 'workout-videos/exercises/lateral-raises-tutorial.mp4',
      'Tricep Dips': 'workout-videos/exercises/tricep-dips-tutorial.mp4',
      'Tricep Pushdowns': 'workout-videos/exercises/tricep-pushdowns-tutorial.mp4',
      'Squat': 'workout-videos/exercises/squat-tutorial.mp4',
      'Leg Press': 'workout-videos/exercises/leg-press-tutorial.mp4',
      'Romanian Deadlift': 'workout-videos/exercises/romanian-deadlift-tutorial.mp4',
      'Leg Extensions': 'workout-videos/exercises/leg-extensions-tutorial.mp4',
      'Leg Curls': 'workout-videos/exercises/leg-curls-tutorial.mp4',
      'Standing Calf Raises': 'workout-videos/exercises/standing-calf-raises-tutorial.mp4',
      'Deadlift': 'workout-videos/exercises/deadlift-tutorial.mp4',
      'Pull-ups': 'workout-videos/exercises/pull-ups-tutorial.mp4',
      'Barbell Row': 'workout-videos/exercises/barbell-row-tutorial.mp4',
      'Lat Pulldown': 'workout-videos/exercises/lat-pulldown-tutorial.mp4',
      'Bicep Curls': 'workout-videos/exercises/bicep-curls-tutorial.mp4',
      'Hammer Curls': 'workout-videos/exercises/hammer-curls-tutorial.mp4',
      'Front Squat': 'workout-videos/exercises/front-squat-tutorial.mp4',
      'Walking Lunges': 'workout-videos/exercises/walking-lunges-tutorial.mp4',
      'Hip Thrusts': 'workout-videos/exercises/hip-thrusts-tutorial.mp4',
      'Good Mornings': 'workout-videos/exercises/good-mornings-tutorial.mp4',
      'Seated Calf Raises': 'workout-videos/exercises/seated-calf-raises-tutorial.mp4',
      'Planks': 'workout-videos/exercises/planks-tutorial.mp4'
    };

    // 3. Update exercises with video URLs
    console.log('\n2️⃣ Adding video URLs to exercises...');
    let updatedCount = 0;
    let skippedCount = 0;

    for (const exercise of exercises || []) {
      const videoUrl = workoutVideos[exercise.exercise_name];
      
      if (videoUrl) {
        const { error: updateError } = await supabase
          .from('training_schema_exercises')
          .update({ 
            video_url: videoUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', exercise.id);

        if (updateError) {
          console.log(`❌ Error updating ${exercise.exercise_name}:`, updateError.message);
        } else {
          console.log(`✅ Added video URL for: ${exercise.exercise_name}`);
          updatedCount++;
        }
      } else {
        console.log(`⚠️ No video URL found for: ${exercise.exercise_name}`);
        skippedCount++;
      }
    }

    // 4. Verify the updates
    console.log('\n3️⃣ Verifying video links...');
    const { data: updatedExercises, error: verifyError } = await supabase
      .from('training_schema_exercises')
      .select('exercise_name, video_url')
      .not('video_url', 'is', null)
      .limit(10);

    if (verifyError) {
      console.log('❌ Error verifying updates:', verifyError.message);
    } else {
      console.log(`✅ Found ${updatedExercises?.length || 0} exercises with video URLs:`);
      updatedExercises?.forEach((exercise, index) => {
        console.log(`   ${index + 1}. ${exercise.exercise_name} -> ${exercise.video_url}`);
      });
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Updated: ${updatedCount} exercises`);
    console.log(`   ⚠️ Skipped: ${skippedCount} exercises`);

    // 5. Show exercises without videos
    console.log('\n4️⃣ Exercises without videos:');
    const exercisesWithoutVideos = exercises?.filter(e => !e.video_url) || [];
    exercisesWithoutVideos.slice(0, 10).forEach((exercise, index) => {
      console.log(`   ${index + 1}. ${exercise.exercise_name}`);
    });

    if (exercisesWithoutVideos.length > 10) {
      console.log(`   ... and ${exercisesWithoutVideos.length - 10} more`);
    }

    console.log('\n🎉 Workout video linking completed!');
    console.log('\n📝 Note: You may need to manually add the video_url column to the training_schema_exercises table in the Supabase dashboard if it doesn\'t exist.');

  } catch (error) {
    console.error('❌ Error adding workout videos:', error);
  }
}

addWorkoutVideos();
