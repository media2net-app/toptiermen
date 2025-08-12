const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function scanNewAcademyVideos() {
  try {
    console.log('🔍 Scanning for new academy videos...\n');

    // 1. List all files in the academy-videos bucket
    console.log('1️⃣ Scanning academy-videos bucket...');
    const { data: bucketFiles, error: bucketError } = await supabase.storage
      .from('academy-videos')
      .list('academy', {
        limit: 100,
        offset: 0
      });

    if (bucketError) {
      console.log('❌ Error scanning bucket:', bucketError.message);
      return;
    }

    console.log(`✅ Found ${bucketFiles?.length || 0} files in bucket`);

    if (!bucketFiles || bucketFiles.length === 0) {
      console.log('❌ No files found in bucket');
      return;
    }

    // 2. Show all files found
    console.log('\n2️⃣ Files found in bucket:');
    bucketFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.name}`);
    });

    // 3. Get all academy lessons
    console.log('\n3️⃣ Fetching academy lessons...');
    const { data: lessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select(`
        id,
        title,
        video_url,
        academy_modules!inner(
          id,
          slug
        )
      `)
      .order('order_index');

    if (lessonsError) {
      console.log('❌ Error fetching lessons:', lessonsError.message);
      return;
    }

    console.log(`✅ Found ${lessons?.length || 0} lessons`);

    // 4. Show lessons without videos
    console.log('\n4️⃣ Lessons without videos:');
    const lessonsWithoutVideos = lessons?.filter(l => !l.video_url) || [];
    lessonsWithoutVideos.forEach((lesson, index) => {
      console.log(`   ${index + 1}. ${lesson.academy_modules.slug} -> ${lesson.title}`);
    });

    console.log('\n🎉 Academy video scan completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Review the files found in the bucket');
    console.log('   2. Manually map files to lessons based on naming patterns');
    console.log('   3. Update the video URLs in the database');

  } catch (error) {
    console.error('❌ Error scanning new academy videos:', error);
  }
}

scanNewAcademyVideos();
