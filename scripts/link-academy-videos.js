const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function linkAcademyVideos() {
  try {
    console.log('🎥 Linking academy videos to lessons...\n');

    // 1. Get all modules
    console.log('1️⃣ Fetching academy modules...');
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('*')
      .order('order_index');

    if (modulesError) {
      console.log('❌ Error fetching modules:', modulesError.message);
      return;
    }

    console.log(`✅ Found ${modules?.length || 0} modules:`);
    modules?.forEach((module, index) => {
      console.log(`   ${index + 1}. ${module.title} (${module.slug})`);
    });

    // 2. Get all lessons
    console.log('\n2️⃣ Fetching academy lessons...');
    const { data: lessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select('*')
      .order('order_index');

    if (lessonsError) {
      console.log('❌ Error fetching lessons:', lessonsError.message);
      return;
    }

    console.log(`✅ Found ${lessons?.length || 0} lessons`);

    // 3. Define video mappings based on uploaded files and actual module slugs
    const videoMappings = {
      // Testosteron module (slug: 'test')
      'test': {
        'testosteron 1.mp4': 'Wat is Testosteron',
        'testosteron 2.mp4': 'De Kracht van Hoog Testosteron',
        'testosteron3.mp4': 'Testosteron Killers: Wat moet je Elimineren'
      },
      // Brotherhood module (slug: 'brotherhood')
      'brotherhood': {
        'brotherhood 05-02.mp4': 'Eer en Loyaliteit',
        'brotherhood 05-04.mp4': 'Bouw de juiste Kring'
      },
      // Voeding & Gezondheid module (slug: 'voeding-gezondheid')
      'voeding-gezondheid': {
        'voeding 06-01.mp4': 'De Basisprincipes van Voeding'
      }
    };

    // 4. Link videos to lessons
    console.log('\n3️⃣ Linking videos to lessons...');
    let linkedCount = 0;
    let skippedCount = 0;

    for (const module of modules || []) {
      const moduleSlug = module.slug.toLowerCase();
      const moduleVideos = videoMappings[moduleSlug];
      
      if (!moduleVideos) {
        console.log(`⚠️ No video mappings found for module: ${module.title}`);
        continue;
      }

      console.log(`\n📚 Processing module: ${module.title} (${moduleSlug})`);
      
      // Get lessons for this module
      const moduleLessons = lessons?.filter(l => l.module_id === module.id) || [];
      console.log(`   📖 Found ${moduleLessons.length} lessons in this module`);
      
      for (const [videoFile, lessonTitle] of Object.entries(moduleVideos)) {
        // Find lesson by title (more flexible matching)
        const lesson = moduleLessons.find(l => {
          const lessonTitleLower = l.title.toLowerCase();
          const targetTitleLower = lessonTitle.toLowerCase();
          
          // Check for exact match or partial match
          return lessonTitleLower === targetTitleLower ||
                 lessonTitleLower.includes(targetTitleLower) ||
                 targetTitleLower.includes(lessonTitleLower);
        });

        if (!lesson) {
          console.log(`   ⚠️ Lesson not found for video: ${videoFile} (${lessonTitle})`);
          skippedCount++;
          continue;
        }

        // Create video URL
        const videoUrl = `academy-videos/academy/${videoFile}`;
        
        // Update lesson with video URL
        const { error: updateError } = await supabase
          .from('academy_lessons')
          .update({ 
            video_url: videoUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', lesson.id);

        if (updateError) {
          console.log(`   ❌ Error updating lesson "${lesson.title}":`, updateError.message);
        } else {
          console.log(`   ✅ Linked: ${videoFile} -> "${lesson.title}"`);
          linkedCount++;
        }
      }
    }

    // 5. Verify the updates
    console.log('\n4️⃣ Verifying video links...');
    const { data: updatedLessons, error: verifyError } = await supabase
      .from('academy_lessons')
      .select('title, video_url, module_id')
      .not('video_url', 'is', null);

    if (verifyError) {
      console.log('❌ Error verifying updates:', verifyError.message);
    } else {
      console.log(`✅ Found ${updatedLessons?.length || 0} lessons with video URLs:`);
      updatedLessons?.forEach((lesson, index) => {
        const module = modules?.find(m => m.id === lesson.module_id);
        console.log(`   ${index + 1}. ${module?.title || 'Unknown'} -> ${lesson.title} -> ${lesson.video_url}`);
      });
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Linked: ${linkedCount} videos`);
    console.log(`   ⚠️ Skipped: ${skippedCount} videos`);

    // 6. Show lessons without videos
    console.log('\n5️⃣ Lessons without videos:');
    const lessonsWithoutVideos = lessons?.filter(l => !l.video_url) || [];
    lessonsWithoutVideos.forEach((lesson, index) => {
      const module = modules?.find(m => m.id === lesson.module_id);
      console.log(`   ${index + 1}. ${module?.title || 'Unknown'} -> ${lesson.title}`);
    });

    console.log('\n🎉 Academy video linking completed!');

  } catch (error) {
    console.error('❌ Error linking academy videos:', error);
  }
}

linkAcademyVideos();
