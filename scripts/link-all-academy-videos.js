const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function linkAllAcademyVideos() {
  try {
    console.log('🎓 Linking all academy videos to lessons...\n');

    // 1. Define video mappings based on filenames
    const videoMappings = [
      // Testosteron module
      { fileName: 'testosteron 1.mp4', moduleSlug: 'test', lessonTitle: 'Wat is Testosteron' },
      { fileName: 'testosteron 2.mp4', moduleSlug: 'test', lessonTitle: 'De Kracht van Hoog Testosteron' },
      { fileName: 'testosteron3.mp4', moduleSlug: 'test', lessonTitle: 'Testosteron Killers: Wat moet je Elimineren' },
      { fileName: 'testosteron 4.mp4', moduleSlug: 'test', lessonTitle: 'De Waarheid over Testosteron Doping' },
      { fileName: 'testosteron 5.mp4', moduleSlug: 'test', lessonTitle: 'TRT en mijn Visie' },

      // Brotherhood module
      { fileName: 'brotherhood 05-01.mp4', moduleSlug: 'brotherhood', lessonTitle: 'Waarom een Brotherhood' },
      { fileName: 'brotherhood 05-02.mp4', moduleSlug: 'brotherhood', lessonTitle: 'Eer en Loyaliteit' },
      { fileName: 'brotherhood 05-03.mp4', moduleSlug: 'brotherhood', lessonTitle: 'Cut The Weak' },
      { fileName: 'brotherhood 05-04.mp4', moduleSlug: 'brotherhood', lessonTitle: 'Bouw de juiste Kring ' },
      { fileName: 'brotherhood 05-05.mp4', moduleSlug: 'brotherhood', lessonTitle: 'Hoe je je Broeders versterkt en samen groeit' },

      // Discipline & Identiteit module
      { fileName: 'discipline 01-01.mp4', moduleSlug: 'discipline-identiteit', lessonTitle: 'Wat is Discipline en waarom is dit Essentieel' },
      { fileName: 'discipline 01-02.mp4', moduleSlug: 'discipline-identiteit', lessonTitle: 'Discipline van korte termijn naar een levensstijl' },
      { fileName: 'discipline 01-03.mp4', moduleSlug: 'discipline-identiteit', lessonTitle: 'Wat is Identiteit en Waarom zijn Kernwaarden Essentieel?' },
      { fileName: 'discipline 01-04.mp4', moduleSlug: 'discipline-identiteit', lessonTitle: 'Ontdek je kernwaarden en bouw je Top Tier identiteit' },
      { fileName: 'discipline 01-05.mp4', moduleSlug: 'discipline-identiteit', lessonTitle: 'Je Identiteit Definiëren' },

      // Fysieke Dominantie module
      { fileName: 'fysieke dominantie 02-01.mp4', moduleSlug: 'fysieke-dominantie', lessonTitle: 'Waarom is fysieke dominantie zo belangrijk?' },
      { fileName: 'fysieke dominantie 02-02.mp4', moduleSlug: 'fysieke-dominantie', lessonTitle: 'Het belang van kracht, spiermassa en conditie' },
      { fileName: 'fysieke dominantie 02-03.mp4', moduleSlug: 'fysieke-dominantie', lessonTitle: 'Status, Zelfrespect en Aantrekkingskracht' },
      { fileName: 'fysieke dominantie 02-04.mp4', moduleSlug: 'fysieke-dominantie', lessonTitle: 'Vitaliteit en Levensduur' },
      { fileName: 'fysieke dominantie 02-05.mp4', moduleSlug: 'fysieke-dominantie', lessonTitle: 'Embrace the Suck' },

      // Mentale Kracht module
      { fileName: 'mentale kracht 03-01.mp4', moduleSlug: 'mentale-kracht-weerbaarheid', lessonTitle: 'Wat is mentale kracht' },
      { fileName: 'mentale kracht 03-02.mp4', moduleSlug: 'mentale-kracht-weerbaarheid', lessonTitle: 'Een Onbreekbare Mindset' },
      { fileName: 'mentale kracht 03-03.mp4', moduleSlug: 'mentale-kracht-weerbaarheid', lessonTitle: 'Wordt Een Onbreekbare Man' },
      { fileName: 'mentale kracht 03-04.mp4', moduleSlug: 'mentale-kracht-weerbaarheid', lessonTitle: 'Mentale Weerbaarheid in de Praktijk' },

      // Business & Finance module
      { fileName: 'finance 04-01.mp4', moduleSlug: 'business-and-finance-', lessonTitle: 'De Financiële Mindset ' },
      { fileName: 'finance 04-02.mp4', moduleSlug: 'business-and-finance-', lessonTitle: 'Grip op je geld' },
      { fileName: 'finance 04-03.mp4', moduleSlug: 'business-and-finance-', lessonTitle: 'Van Werknemer naar eigen Verdienmodellen' },
      { fileName: 'finance 04-04.mp4', moduleSlug: 'business-and-finance-', lessonTitle: 'Vermogen Opbouwen Begin met Investeren' },
      { fileName: 'finance 04-05.mp4', moduleSlug: 'business-and-finance-', lessonTitle: 'Financiële Vrijheid en Legacy ' },

      // Voeding & Gezondheid module
      { fileName: 'voeding 06-01.mp4', moduleSlug: 'voeding-gezondheid', lessonTitle: 'De Basisprincipes van Voeding' },
      { fileName: 'voeding 06-02.mp4', moduleSlug: 'voeding-gezondheid', lessonTitle: 'Hydratatie en Water inname' },
      { fileName: 'voeding 06-03.mp4', moduleSlug: 'voeding-gezondheid', lessonTitle: 'Slaap de vergeten superkracht' },
      { fileName: 'voeding 06-04.mp4', moduleSlug: 'voeding-gezondheid', lessonTitle: 'Energie en Focus' },
      { fileName: 'voeding 06-05.mp4', moduleSlug: 'voeding-gezondheid', lessonTitle: 'Gezondheid als Fundament' }
    ];

    // 2. Get all academy lessons
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

    // 3. Update lessons with video URLs
    console.log('\n2️⃣ Updating lessons with video URLs...');
    let updatedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const mapping of videoMappings) {
      const lesson = lessons?.find(l => 
        l.academy_modules.slug === mapping.moduleSlug && 
        l.title === mapping.lessonTitle
      );

      if (lesson) {
        const videoUrl = `https://wkjvstuttbeyqzyjayxj.supabase.co/storage/v1/object/public/academy-videos/academy/${mapping.fileName}`;
        
        console.log(`\n📖 Updating: ${mapping.lessonTitle}`);
        console.log(`   Module: ${mapping.moduleSlug}`);
        console.log(`   Video: ${mapping.fileName}`);
        console.log(`   URL: ${videoUrl}`);

        const { error: updateError } = await supabase
          .from('academy_lessons')
          .update({ 
            video_url: videoUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', lesson.id);

        if (updateError) {
          console.log(`❌ Error updating ${mapping.lessonTitle}:`, updateError.message);
          errorCount++;
        } else {
          console.log(`✅ Successfully updated: ${mapping.lessonTitle}`);
          updatedCount++;
        }
      } else {
        console.log(`⚠️ Lesson not found: ${mapping.lessonTitle} (${mapping.moduleSlug})`);
        skippedCount++;
      }
    }

    // 4. Verify and analyze results
    console.log('\n3️⃣ Analyzing video coverage...');
    const { data: updatedLessons, error: verifyError } = await supabase
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

    if (verifyError) {
      console.log('❌ Error verifying updates:', verifyError.message);
    } else {
      console.log(`✅ Found ${updatedLessons?.length || 0} lessons after update`);
      
      // Group by module
      const moduleStats = {};
      updatedLessons?.forEach(lesson => {
        const moduleSlug = lesson.academy_modules.slug;
        if (!moduleStats[moduleSlug]) {
          moduleStats[moduleSlug] = { total: 0, withVideo: 0, withoutVideo: 0 };
        }
        moduleStats[moduleSlug].total++;
        if (lesson.video_url) {
          moduleStats[moduleSlug].withVideo++;
        } else {
          moduleStats[moduleSlug].withoutVideo++;
        }
      });

      console.log('\n📊 Module Analysis:');
      Object.entries(moduleStats).forEach(([moduleSlug, stats]) => {
        const coverage = Math.round((stats.withVideo / stats.total) * 100);
        console.log(`\n📚 ${moduleSlug}:`);
        console.log(`   📖 Total lessons: ${stats.total}`);
        console.log(`   ✅ With video: ${stats.withVideo}`);
        console.log(`   ❌ Without video: ${stats.withoutVideo}`);
        console.log(`   📈 Coverage: ${coverage}%`);
      });

      // Show lessons without videos
      console.log('\n4️⃣ Lessons without videos:');
      const lessonsWithoutVideos = updatedLessons?.filter(l => !l.video_url) || [];
      if (lessonsWithoutVideos.length === 0) {
        console.log('   🎉 All lessons have videos!');
      } else {
        lessonsWithoutVideos.forEach((lesson, index) => {
          console.log(`   ${index + 1}. ${lesson.academy_modules.slug} -> ${lesson.title}`);
        });
      }

      // Overall statistics
      const totalLessons = updatedLessons?.length || 0;
      const lessonsWithVideos = updatedLessons?.filter(l => l.video_url).length || 0;
      const overallCoverage = Math.round((lessonsWithVideos / totalLessons) * 100);

      console.log(`\n📊 Overall Statistics:`);
      console.log(`   📖 Total lessons: ${totalLessons}`);
      console.log(`   ✅ Lessons with videos: ${lessonsWithVideos}`);
      console.log(`   ❌ Lessons without videos: ${totalLessons - lessonsWithVideos}`);
      console.log(`   📈 Overall coverage: ${overallCoverage}%`);
    }

    // 5. Summary
    console.log(`\n📊 Update Summary:`);
    console.log(`   🎯 Video mappings: ${videoMappings.length}`);
    console.log(`   ✅ Updated: ${updatedCount} lessons`);
    console.log(`   ❌ Errors: ${errorCount} lessons`);
    console.log(`   ⚠️ Skipped: ${skippedCount} lessons`);

    console.log('\n🎉 All academy videos linked successfully!');

  } catch (error) {
    console.error('❌ Error linking academy videos:', error);
  }
}

linkAllAcademyVideos();
