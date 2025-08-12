const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addVideoUrlToExercises() {
  try {
    console.log('🎥 Adding video_url column to training_schema_exercises table...\n');

    // 1. Check if column already exists
    console.log('1️⃣ Checking if video_url column exists...');
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'training_schema_exercises' });

    if (columnsError) {
      console.log('⚠️ Could not check columns, proceeding with addition...');
    } else {
      const hasVideoUrl = columns?.some((col) => col.column_name === 'video_url');
      if (hasVideoUrl) {
        console.log('✅ video_url column already exists');
        return;
      }
    }

    // 2. Add video_url column
    console.log('2️⃣ Adding video_url column...');
    const { error: alterError } = await supabase
      .rpc('exec_sql', {
        sql: `
          ALTER TABLE training_schema_exercises 
          ADD COLUMN IF NOT EXISTS video_url TEXT;
        `
      });

    if (alterError) {
      console.log('❌ Error adding video_url column:', alterError.message);
      console.log('⚠️ You may need to add this column manually in the Supabase dashboard');
      return;
    }

    console.log('✅ video_url column added successfully');

    // 3. Add some sample video URLs to existing exercises
    console.log('\n3️⃣ Adding sample video URLs to exercises...');
    
    const sampleVideos = {
      'Bench Press': '/videos/bench-press-tutorial.mp4',
      'Incline Dumbbell Press': '/videos/incline-dumbbell-press-tutorial.mp4',
      'Overhead Press': '/videos/overhead-press-tutorial.mp4',
      'Lateral Raises': '/videos/lateral-raises-tutorial.mp4',
      'Tricep Dips': '/videos/tricep-dips-tutorial.mp4',
      'Tricep Pushdowns': '/videos/tricep-pushdowns-tutorial.mp4',
      'Squat': '/videos/squat-tutorial.mp4',
      'Leg Press': '/videos/leg-press-tutorial.mp4',
      'Romanian Deadlift': '/videos/romanian-deadlift-tutorial.mp4',
      'Leg Extensions': '/videos/leg-extensions-tutorial.mp4',
      'Leg Curls': '/videos/leg-curls-tutorial.mp4',
      'Standing Calf Raises': '/videos/standing-calf-raises-tutorial.mp4',
      'Deadlift': '/videos/deadlift-tutorial.mp4',
      'Pull-ups': '/videos/pull-ups-tutorial.mp4',
      'Barbell Row': '/videos/barbell-row-tutorial.mp4',
      'Lat Pulldown': '/videos/lat-pulldown-tutorial.mp4',
      'Bicep Curls': '/videos/bicep-curls-tutorial.mp4',
      'Hammer Curls': '/videos/hammer-curls-tutorial.mp4',
      'Front Squat': '/videos/front-squat-tutorial.mp4',
      'Walking Lunges': '/videos/walking-lunges-tutorial.mp4',
      'Hip Thrusts': '/videos/hip-thrusts-tutorial.mp4',
      'Good Mornings': '/videos/good-mornings-tutorial.mp4',
      'Seated Calf Raises': '/videos/seated-calf-raises-tutorial.mp4',
      'Planks': '/videos/planks-tutorial.mp4'
    };

    // Get all exercises
    const { data: exercises, error: exercisesError } = await supabase
      .from('training_schema_exercises')
      .select('*');

    if (exercisesError) {
      console.log('❌ Error fetching exercises:', exercisesError.message);
      return;
    }

    console.log(`📊 Found ${exercises?.length || 0} exercises to update`);

    // Update exercises with video URLs
    let updatedCount = 0;
    for (const exercise of exercises || []) {
      const videoUrl = sampleVideos[exercise.exercise_name];
      if (videoUrl) {
        const { error: updateError } = await supabase
          .from('training_schema_exercises')
          .update({ video_url: videoUrl })
          .eq('id', exercise.id);

        if (updateError) {
          console.log(`❌ Error updating ${exercise.exercise_name}:`, updateError.message);
        } else {
          console.log(`✅ Added video URL for: ${exercise.exercise_name}`);
          updatedCount++;
        }
      }
    }

    console.log(`\n🎯 Updated ${updatedCount} exercises with video URLs`);

    // 4. Verify the updates
    console.log('\n4️⃣ Verifying updates...');
    const { data: verifyExercises, error: verifyError } = await supabase
      .from('training_schema_exercises')
      .select('exercise_name, video_url')
      .not('video_url', 'is', null)
      .limit(10);

    if (verifyError) {
      console.log('❌ Error verifying updates:', verifyError.message);
    } else {
      console.log(`✅ Found ${verifyExercises?.length || 0} exercises with video URLs:`);
      verifyExercises?.forEach((ex, index) => {
        console.log(`   ${index + 1}. ${ex.exercise_name} -> ${ex.video_url}`);
      });
    }

    console.log('\n🎉 Video URL integration completed successfully!');

  } catch (error) {
    console.error('❌ Error adding video URLs:', error);
  }
}

addVideoUrlToExercises();
