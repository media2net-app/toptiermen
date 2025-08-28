require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixTestosteronLessonNumbering() {
  try {
    console.log('🔧 FIXING TESTOSTERON LESSON NUMBERING');
    console.log('======================================\n');

    // Find the Testosteron module
    const { data: testosteronModule, error: moduleError } = await supabase
      .from('academy_modules')
      .select('id, title, slug')
      .eq('slug', 'test')
      .single();

    if (moduleError) {
      console.error('❌ Error finding testosteron module:', moduleError);
      return;
    }

    console.log(`✅ Found module: ${testosteronModule.title} (ID: ${testosteronModule.id})\n`);

    // Get all lessons for this module
    const { data: lessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select(`
        id,
        title,
        order_index,
        status
      `)
      .eq('module_id', testosteronModule.id)
      .eq('status', 'published')
      .order('order_index');

    if (lessonsError) {
      console.error('❌ Error fetching lessons:', lessonsError);
      return;
    }

    console.log(`✅ Found ${lessons?.length || 0} lessons\n`);

    // Map lesson titles to correct order_index (1-5)
    const lessonOrderMappings = {
      'Wat is Testosteron': 1,
      'De Kracht van Hoog Testosteron': 2,
      'Testosteron Killers: Wat moet je Elimineren': 3,
      'TRT en mijn Visie': 4,
      'De Waarheid over Testosteron Doping': 5
    };

    let updatedCount = 0;
    let errorCount = 0;

    // Update each lesson's order_index
    for (const lesson of lessons || []) {
      console.log(`📖 Processing lesson: ${lesson.title}`);
      console.log(`   Current order_index: ${lesson.order_index}`);

      const correctOrderIndex = lessonOrderMappings[lesson.title];
      if (!correctOrderIndex) {
        console.log(`   ⚠️  No order mapping found for: ${lesson.title}`);
        continue;
      }

      if (lesson.order_index === correctOrderIndex) {
        console.log(`   ✅ Already correct order_index: ${correctOrderIndex}`);
        continue;
      }

      // Update the lesson with correct order_index
      const { error: updateError } = await supabase
        .from('academy_lessons')
        .update({
          order_index: correctOrderIndex,
          updated_at: new Date().toISOString()
        })
        .eq('id', lesson.id);

      if (updateError) {
        console.error(`   ❌ Error updating lesson ${lesson.title}:`, updateError);
        errorCount++;
      } else {
        console.log(`   ✅ Updated order_index: ${lesson.order_index} → ${correctOrderIndex}`);
        updatedCount++;
      }
    }

    console.log('\n📊 UPDATE SUMMARY');
    console.log('==================');
    console.log(`📚 Total lessons: ${lessons?.length || 0}`);
    console.log(`✅ Updated: ${updatedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📈 Success rate: ${((updatedCount / (lessons?.length || 1)) * 100).toFixed(1)}%`);

    if (updatedCount > 0) {
      console.log('\n🎉 Testosteron lesson numbering fixed successfully!');
      console.log('✨ Lessons now have correct order_index (1-5)');
    } else {
      console.log('\nℹ️  No updates needed - all lessons already have correct numbering');
    }

    // Verify the updates
    console.log('\n🔍 Verifying updates...');
    const { data: updatedLessons, error: verifyError } = await supabase
      .from('academy_lessons')
      .select(`
        id,
        title,
        order_index,
        status
      `)
      .eq('module_id', testosteronModule.id)
      .eq('status', 'published')
      .order('order_index');

    if (verifyError) {
      console.error('❌ Error verifying updates:', verifyError);
    } else {
      console.log('\n📋 Updated lessons:');
      updatedLessons?.forEach(lesson => {
        console.log(`   ${lesson.order_index}. ${lesson.title}`);
      });
    }

    console.log('\n✨ Testosteron module lesson numbering complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the fix
fixTestosteronLessonNumbering();
