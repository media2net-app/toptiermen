require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAllModuleLessonNumbering() {
  try {
    console.log('🔧 CHECKING ALL MODULE LESSON NUMBERING');
    console.log('=======================================\n');

    // Get all modules
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select(`
        id,
        title,
        slug,
        order_index,
        status
      `)
      .eq('status', 'published')
      .order('order_index');

    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError);
      return;
    }

    console.log(`✅ Found ${modules?.length || 0} published modules\n`);

    let totalIssues = 0;
    let totalFixed = 0;

    for (const module of modules || []) {
      console.log(`📖 MODULE: ${module.title} (${module.slug})`);
      console.log('='.repeat(50));

      // Get lessons for this module
      const { data: lessons, error: lessonsError } = await supabase
        .from('academy_lessons')
        .select(`
          id,
          title,
          order_index,
          status
        `)
        .eq('module_id', module.id)
        .eq('status', 'published')
        .order('order_index');

      if (lessonsError) {
        console.error(`❌ Error fetching lessons for ${module.title}:`, lessonsError);
        continue;
      }

      console.log(`📋 Found ${lessons?.length || 0} lessons:\n`);

      let moduleIssues = 0;
      let moduleFixed = 0;

      // Check each lesson's order_index
      for (let i = 0; i < (lessons || []).length; i++) {
        const lesson = lessons[i];
        const expectedOrderIndex = i + 1; // Should be 1, 2, 3, 4, 5...
        const currentOrderIndex = lesson.order_index;

        console.log(`   Lesson ${i + 1}: ${lesson.title}`);
        console.log(`      Current order_index: ${currentOrderIndex}`);
        console.log(`      Expected order_index: ${expectedOrderIndex}`);

        if (currentOrderIndex !== expectedOrderIndex) {
          console.log(`      ❌ ISSUE: Wrong order_index!`);
          moduleIssues++;

          // Fix the order_index
          const { error: updateError } = await supabase
            .from('academy_lessons')
            .update({
              order_index: expectedOrderIndex,
              updated_at: new Date().toISOString()
            })
            .eq('id', lesson.id);

          if (updateError) {
            console.error(`      ❌ Error fixing order_index:`, updateError);
          } else {
            console.log(`      ✅ FIXED: Updated to ${expectedOrderIndex}`);
            moduleFixed++;
          }
        } else {
          console.log(`      ✅ Correct order_index`);
        }
        console.log('');
      }

      totalIssues += moduleIssues;
      totalFixed += moduleFixed;

      if (moduleIssues === 0) {
        console.log(`✅ All lessons in ${module.title} have correct numbering`);
      } else {
        console.log(`🔧 Fixed ${moduleFixed} out of ${moduleIssues} issues in ${module.title}`);
      }
      console.log('');
    }

    // Summary
    console.log('📊 OVERALL SUMMARY');
    console.log('==================');
    console.log(`📚 Total modules checked: ${modules?.length || 0}`);
    console.log(`❌ Total issues found: ${totalIssues}`);
    console.log(`✅ Total issues fixed: ${totalFixed}`);
    
    if (totalIssues === 0) {
      console.log('\n🎉 All modules have correct lesson numbering!');
    } else if (totalFixed === totalIssues) {
      console.log('\n🎉 All lesson numbering issues have been fixed!');
    } else {
      console.log('\n⚠️  Some issues could not be fixed. Please check manually.');
    }

    // Verify final state
    console.log('\n🔍 FINAL VERIFICATION');
    console.log('=====================');
    
    for (const module of modules || []) {
      const { data: finalLessons } = await supabase
        .from('academy_lessons')
        .select('title, order_index')
        .eq('module_id', module.id)
        .eq('status', 'published')
        .order('order_index');

      console.log(`\n📖 ${module.title}:`);
      finalLessons?.forEach(lesson => {
        console.log(`   ${lesson.order_index}. ${lesson.title}`);
      });
    }

    console.log('\n✨ All module lesson numbering check complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the check
checkAllModuleLessonNumbering();
