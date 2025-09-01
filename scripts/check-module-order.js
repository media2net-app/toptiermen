require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkModuleOrder() {
  try {
    console.log('🔍 CHECKING ACADEMY MODULE ORDER');
    console.log('================================\n');

    // Get all modules ordered by order_index
    const { data: modules, error } = await supabase
      .from('academy_modules')
      .select('*')
      .eq('status', 'published')
      .order('order_index', { ascending: true });

    if (error) {
      console.error('❌ Error fetching modules:', error);
      return;
    }

    if (!modules || modules.length === 0) {
      console.log('⚠️ No modules found');
      return;
    }

    console.log(`✅ Found ${modules.length} modules\n`);

    console.log('📋 CURRENT MODULE ORDER:');
    console.log('========================');
    modules.forEach((module, index) => {
      const moduleNumber = index + 1;
      console.log(`${moduleNumber.toString().padStart(2, '0')}. ${module.title} (order_index: ${module.order_index})`);
    });

    // Check if Testosteron is first
    const testosteronModule = modules.find(module => 
      module.title.toLowerCase().includes('testosteron') ||
      module.slug === 'test'
    );

    if (testosteronModule) {
      console.log(`\n🎯 Testosteron module found: "${testosteronModule.title}"`);
      console.log(`   Current position: ${modules.indexOf(testosteronModule) + 1}`);
      console.log(`   Current order_index: ${testosteronModule.order_index}`);
      
      if (modules.indexOf(testosteronModule) === 0) {
        console.log('✅ Testosteron is correctly positioned as Module 1');
      } else {
        console.log('❌ Testosteron is NOT Module 1 - this needs to be fixed!');
      }
    } else {
      console.log('\n⚠️ Testosteron module not found!');
    }

    // Check for Discipline module
    const disciplineModule = modules.find(module => 
      module.title.toLowerCase().includes('discipline') ||
      module.title.toLowerCase().includes('identiteit')
    );

    if (disciplineModule) {
      console.log(`\n🎯 Discipline module found: "${disciplineModule.title}"`);
      console.log(`   Current position: ${modules.indexOf(disciplineModule) + 1}`);
      console.log(`   Current order_index: ${disciplineModule.order_index}`);
    }

    console.log('\n📊 SUMMARY:');
    console.log('===========');
    console.log(`Total modules: ${modules.length}`);
    console.log(`Testosteron position: ${testosteronModule ? modules.indexOf(testosteronModule) + 1 : 'Not found'}`);
    console.log(`Discipline position: ${disciplineModule ? modules.indexOf(disciplineModule) + 1 : 'Not found'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the check
checkModuleOrder().then(() => {
  console.log('\n✅ Module order check completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
