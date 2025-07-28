const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testVideoUpload() {
  console.log('🧪 Testing video upload functionality...');

  try {
    // Test 1: Check if bucket exists
    console.log('🔍 Checking workout-videos bucket...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ Error listing buckets:', bucketError);
    } else {
      const workoutBucket = buckets?.find(bucket => bucket.id === 'workout-videos');
      if (workoutBucket) {
        console.log('✅ workout-videos bucket exists:', workoutBucket);
      } else {
        console.log('❌ workout-videos bucket not found');
        console.log('📋 Available buckets:', buckets?.map(b => b.id));
      }
    }

    // Test 2: Check if we can access the bucket
    console.log('🔍 Testing bucket access...');
    const { data: files, error: filesError } = await supabase.storage
      .from('workout-videos')
      .list('exercises', { limit: 1 });

    if (filesError) {
      console.error('❌ Error accessing bucket:', filesError);
    } else {
      console.log('✅ Bucket access successful');
      console.log('📊 Files in exercises folder:', files?.length || 0);
    }

    // Test 3: Check exercises table structure
    console.log('🔍 Checking exercises table...');
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('id, name, video_url')
      .limit(1);

    if (exercisesError) {
      console.error('❌ Error accessing exercises table:', exercisesError);
    } else {
      console.log('✅ Exercises table accessible');
      console.log('📊 Sample exercise:', exercises?.[0]);
    }

    console.log('\n🎉 Video upload test completed!');
    console.log('📋 If all tests passed, video uploads should work');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testVideoUpload(); 