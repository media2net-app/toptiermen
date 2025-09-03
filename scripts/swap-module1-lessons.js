const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function swapModule1Lessons() {
  console.log('🔄 Swapping Module 1 (Testosteron) lessons 4 and 5...\n');

  try {
    const moduleId = 'c671fea4-bfb1-4ccc-b23e-220e80783d06'; // Testosteron module

    // First, get the current lessons
    console.log('1️⃣ Getting current lesson order...');
    const { data: currentLessons, error: fetchError } = await supabase
      .from('academy_lessons')
      .select('id, title, order_index')
      .eq('module_id', moduleId)
      .order('order_index');

    if (fetchError) {
      console.error('❌ Error fetching lessons:', fetchError);
      return;
    }

    console.log('📚 Current lessons:');
    currentLessons.forEach(lesson => {
      console.log(`   ${lesson.order_index}. ${lesson.title}`);
    });

    // Find lessons 4 and 5
    const lesson4 = currentLessons.find(l => l.order_index === 4);
    const lesson5 = currentLessons.find(l => l.order_index === 5);

    if (!lesson4 || !lesson5) {
      console.error('❌ Could not find lessons 4 and 5');
      return;
    }

    console.log('\n2️⃣ Lessons to swap:');
    console.log(`   Current Les 4: ${lesson4.title}`);
    console.log(`   Current Les 5: ${lesson5.title}`);

    // Use a temporary order_index to avoid unique constraint issues
    console.log('\n3️⃣ Performing swap...');
    
    // Step 1: Move lesson 4 to temporary position (999)
    const { error: temp1 } = await supabase
      .from('academy_lessons')
      .update({ order_index: 999 })
      .eq('id', lesson4.id);

    if (temp1) {
      console.error('❌ Error in step 1:', temp1);
      return;
    }

    // Step 2: Move lesson 5 to position 4
    const { error: step2 } = await supabase
      .from('academy_lessons')
      .update({ order_index: 4 })
      .eq('id', lesson5.id);

    if (step2) {
      console.error('❌ Error in step 2:', step2);
      return;
    }

    // Step 3: Move lesson 4 (from temp position) to position 5
    const { error: step3 } = await supabase
      .from('academy_lessons')
      .update({ order_index: 5 })
      .eq('id', lesson4.id);

    if (step3) {
      console.error('❌ Error in step 3:', step3);
      return;
    }

    console.log('✅ Swap completed successfully!');

    // Verify the result
    console.log('\n4️⃣ Verifying results...');
    const { data: newLessons } = await supabase
      .from('academy_lessons')
      .select('id, title, order_index')
      .eq('module_id', moduleId)
      .order('order_index');

    console.log('\n📚 New lesson order:');
    console.log('====================');
    newLessons.forEach(lesson => {
      console.log(`   ${lesson.order_index}. ${lesson.title}`);
    });

    console.log('\n🎉 Module 1 lesson order updated successfully!');
    console.log('📋 Summary:');
    console.log(`   Les 4 is now: ${newLessons.find(l => l.order_index === 4)?.title}`);
    console.log(`   Les 5 is now: ${newLessons.find(l => l.order_index === 5)?.title}`);

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

swapModule1Lessons();
