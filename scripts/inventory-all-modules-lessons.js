require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inventoryAllModulesLessons() {
  try {
    console.log('📚 COMPLETE ACADEMY INVENTORY');
    console.log('==============================\n');

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

    let totalLessons = 0;
    let lessonsWithEbooks = 0;
    let lessonsWithoutEbooks = 0;

    const moduleInventory = [];

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
          status,
          academy_ebooks (
            id,
            title,
            file_url,
            status
          )
        `)
        .eq('module_id', module.id)
        .eq('status', 'published')
        .order('order_index');

      if (lessonsError) {
        console.error(`❌ Error fetching lessons for ${module.title}:`, lessonsError);
        continue;
      }

      const moduleData = {
        module: module,
        lessons: lessons || [],
        lessonsWithEbooks: 0,
        lessonsWithoutEbooks: 0
      };

      console.log(`📋 Found ${lessons?.length || 0} published lessons:\n`);

      for (const lesson of lessons || []) {
        const hasEbook = lesson.academy_ebooks && lesson.academy_ebooks.length > 0;
        const ebookStatus = hasEbook ? '✅' : '❌';
        
        console.log(`   ${ebookStatus} Lesson ${lesson.order_index}: ${lesson.title}`);
        
        if (hasEbook) {
          const ebook = lesson.academy_ebooks[0];
          console.log(`      📄 Ebook: ${ebook.title}`);
          console.log(`      📁 File: ${ebook.file_url}`);
          lessonsWithEbooks++;
          moduleData.lessonsWithEbooks++;
        } else {
          console.log(`      📄 Ebook: MISSING`);
          lessonsWithoutEbooks++;
          moduleData.lessonsWithoutEbooks++;
        }
        
        totalLessons++;
      }

      moduleInventory.push(moduleData);
      console.log('');
    }

    // Summary
    console.log('📊 COMPLETE INVENTORY SUMMARY');
    console.log('==============================');
    console.log(`📚 Total Modules: ${modules?.length || 0}`);
    console.log(`📖 Total Lessons: ${totalLessons}`);
    console.log(`✅ Lessons with Ebooks: ${lessonsWithEbooks}`);
    console.log(`❌ Lessons without Ebooks: ${lessonsWithoutEbooks}`);
    console.log(`📈 Completion Rate: ${((lessonsWithEbooks / totalLessons) * 100).toFixed(1)}%`);

    console.log('\n📋 MODULE BREAKDOWN:');
    console.log('===================');
    moduleInventory.forEach((moduleData, index) => {
      const completionRate = ((moduleData.lessonsWithEbooks / moduleData.lessons.length) * 100).toFixed(1);
      const status = moduleData.lessonsWithoutEbooks === 0 ? '✅ COMPLETE' : '🔄 IN PROGRESS';
      
      console.log(`${index + 1}. ${moduleData.module.title}`);
      console.log(`   📖 Lessons: ${moduleData.lessons.length}`);
      console.log(`   ✅ With Ebooks: ${moduleData.lessonsWithEbooks}`);
      console.log(`   ❌ Missing: ${moduleData.lessonsWithoutEbooks}`);
      console.log(`   📈 Completion: ${completionRate}% - ${status}`);
      console.log('');
    });

    // Generate work plan
    console.log('📋 WORK PLAN PRIORITY ORDER:');
    console.log('============================');
    
    const incompleteModules = moduleInventory
      .filter(m => m.lessonsWithoutEbooks > 0)
      .sort((a, b) => b.lessonsWithoutEbooks - a.lessonsWithoutEbooks);

    incompleteModules.forEach((moduleData, index) => {
      console.log(`${index + 1}. ${moduleData.module.title} (${moduleData.lessonsWithoutEbooks} ebooks needed)`);
      
      const missingLessons = moduleData.lessons.filter(l => !l.academy_ebooks || l.academy_ebooks.length === 0);
      missingLessons.forEach(lesson => {
        console.log(`   - ${lesson.title}`);
      });
      console.log('');
    });

    // Save detailed inventory to file
    const fs = require('fs');
    const inventoryData = {
      generated_at: new Date().toISOString(),
      summary: {
        total_modules: modules?.length || 0,
        total_lessons: totalLessons,
        lessons_with_ebooks: lessonsWithEbooks,
        lessons_without_ebooks: lessonsWithoutEbooks,
        completion_rate: ((lessonsWithEbooks / totalLessons) * 100).toFixed(1)
      },
      modules: moduleInventory.map(m => ({
        module: m.module,
        lessons: m.lessons.map(l => ({
          id: l.id,
          title: l.title,
          order_index: l.order_index,
          has_ebook: l.academy_ebooks && l.academy_ebooks.length > 0,
          ebook: l.academy_ebooks?.[0] || null
        })),
        lessons_with_ebooks: m.lessonsWithEbooks,
        lessons_without_ebooks: m.lessonsWithoutEbooks
      }))
    };

    fs.writeFileSync('academy-inventory.json', JSON.stringify(inventoryData, null, 2));
    console.log('💾 Detailed inventory saved to: academy-inventory.json');

    console.log('\n🎯 NEXT STEPS:');
    console.log('==============');
    console.log('1. Review the inventory above');
    console.log('2. Start with the highest priority module');
    console.log('3. Create HTML ebooks for each missing lesson');
    console.log('4. Generate PDF versions from HTML');
    console.log('5. Update database records');
    console.log('6. Test and verify');

  } catch (error) {
    console.error('❌ Error creating inventory:', error);
  }
}

// Run the inventory
inventoryAllModulesLessons();
