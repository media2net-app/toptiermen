require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Database connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function reorderAcademyModules() {
  console.log('🔄 Reordering Academy Modules...\n');

  try {
    // Step 1: Get all modules
    console.log('1️⃣ Fetching all academy modules...');
    const { data: modules, error: fetchError } = await supabase
      .from('academy_modules')
      .select('*')
      .order('order_index', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching modules:', fetchError.message);
      return;
    }

    if (!modules || modules.length === 0) {
      console.log('⚠️ No modules found');
      return;
    }

    console.log(`✅ Found ${modules.length} modules`);
    console.log('\n📋 Current module order:');
    modules.forEach((module, index) => {
      console.log(`${index + 1}. ${module.title} (order_index: ${module.order_index})`);
    });

    // Step 2: Find testosterone module
    const testosteroneModule = modules.find(module => 
      module.title.toLowerCase().includes('testosteron') || 
      module.title.toLowerCase().includes('testosterone') ||
      module.description.toLowerCase().includes('testosteron') ||
      module.description.toLowerCase().includes('testosterone')
    );

    if (!testosteroneModule) {
      console.log('\n⚠️ No testosterone module found. Available modules:');
      modules.forEach((module, index) => {
        console.log(`${index + 1}. ${module.title}`);
      });
      return;
    }

    console.log(`\n🎯 Found testosterone module: "${testosteroneModule.title}" (current order_index: ${testosteroneModule.order_index})`);

    // Step 3: Create new order
    const otherModules = modules.filter(module => module.id !== testosteroneModule.id);
    const newOrder = [testosteroneModule, ...otherModules];

    console.log('\n📋 New module order:');
    newOrder.forEach((module, index) => {
      console.log(`${index + 1}. ${module.title}`);
    });

    // Step 4: Update order_index for all modules
    console.log('\n2️⃣ Updating module order...');
    
    const updatePromises = newOrder.map((module, index) => {
      const newOrderIndex = index + 1;
      console.log(`   Updating "${module.title}" to order_index: ${newOrderIndex}`);
      
      return supabase
        .from('academy_modules')
        .update({ 
          order_index: newOrderIndex,
          updated_at: new Date().toISOString()
        })
        .eq('id', module.id);
    });

    const results = await Promise.all(updatePromises);
    
    // Check for errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('❌ Errors occurred during update:');
      errors.forEach(error => console.error(error.error));
      return;
    }

    console.log('\n✅ All modules updated successfully!');

    // Step 5: Verify the new order
    console.log('\n3️⃣ Verifying new order...');
    const { data: updatedModules, error: verifyError } = await supabase
      .from('academy_modules')
      .select('*')
      .order('order_index', { ascending: true });

    if (verifyError) {
      console.error('❌ Error verifying order:', verifyError.message);
      return;
    }

    console.log('\n📋 Final module order:');
    updatedModules.forEach((module, index) => {
      console.log(`${index + 1}. ${module.title} (order_index: ${module.order_index})`);
    });

    console.log('\n🎉 Academy modules successfully reordered!');
    console.log(`✅ Testosterone module is now module 1`);
    console.log(`✅ All other modules have been shifted up`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
reorderAcademyModules(); 