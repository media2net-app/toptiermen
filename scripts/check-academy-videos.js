const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAcademyVideos() {
  try {
    console.log('🎓 Checking academy video URLs...\n');

    // 1. Get all academy lessons
    console.log('1️⃣ Fetching academy lessons...');
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

    // 2. Check video URLs
    console.log('\n2️⃣ Checking video URLs...');
    let withVideos = 0;
    let withoutVideos = 0;

    lessons?.forEach((lesson, index) => {
      console.log(`\n📖 Lesson ${index + 1}: ${lesson.title}`);
      console.log(`   Module: ${lesson.academy_modules.slug}`);
      console.log(`   Video URL: ${lesson.video_url || '❌ Geen video URL'}`);
      
      if (lesson.video_url) {
        withVideos++;
        
        // Check if it's a CDN URL
        if (lesson.video_url.includes('supabase.co')) {
          console.log(`   ✅ CDN URL detected`);
        } else if (lesson.video_url.startsWith('academy-videos/')) {
          console.log(`   ✅ Bucket path detected`);
        } else {
          console.log(`   ⚠️ Unknown URL format`);
        }
      } else {
        withoutVideos++;
      }
    });

    // 3. Summary
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Lessons with videos: ${withVideos}`);
    console.log(`   ❌ Lessons without videos: ${withoutVideos}`);
    console.log(`   📈 Video coverage: ${Math.round((withVideos / (withVideos + withoutVideos)) * 100)}%`);

    // 4. Test specific lesson (Testosteron module)
    console.log('\n3️⃣ Testing specific lesson...');
    const testosteronLesson = lessons?.find(l => 
      l.title === 'Wat is Testosteron' && 
      l.academy_modules.slug === 'test'
    );

    if (testosteronLesson) {
      console.log(`\n🎯 Testosteron lesson found:`);
      console.log(`   Title: ${testosteronLesson.title}`);
      console.log(`   Video URL: ${testosteronLesson.video_url || '❌ Geen video URL'}`);
      console.log(`   Lesson ID: ${testosteronLesson.id}`);
      console.log(`   Module Slug: ${testosteronLesson.academy_modules.slug}`);
      
      if (testosteronLesson.video_url) {
        console.log(`   ✅ Video URL is present`);
      } else {
        console.log(`   ❌ Video URL is missing`);
      }
    } else {
      console.log(`❌ Testosteron lesson not found`);
    }

    console.log('\n🎉 Academy video check completed!');

  } catch (error) {
    console.error('❌ Error checking academy videos:', error);
  }
}

checkAcademyVideos();
