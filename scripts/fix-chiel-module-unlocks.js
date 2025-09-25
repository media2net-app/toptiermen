require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixChielModuleUnlocks() {
  try {
    console.log('🔧 Fixing module unlocks for Chiel...\n');

    // 1. Find Chiel's user ID
    const { data: chielUser, error: userError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', 'chiel@media2net.nl')
      .single();

    if (userError || !chielUser) {
      console.error('❌ Could not find Chiel user:', userError);
      return;
    }

    console.log(`✅ Found Chiel: ${chielUser.full_name} (${chielUser.email})`);

    // 2. Get all published modules
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('*')
      .eq('status', 'published')
      .order('order_index');

    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError);
      return;
    }

    console.log(`✅ Found ${modules?.length || 0} published modules`);

    // 3. Check Chiel's lesson progress to confirm academy completion
    const { data: lessonProgress, error: progressError } = await supabase
      .from('user_lesson_progress')
      .select(`
        *,
        academy_lessons!fk_user_lesson_progress_lesson_id (
          id,
          title,
          module_id,
          status
        )
      `)
      .eq('user_id', chielUser.id)
      .eq('completed', true);

    if (progressError) {
      console.error('❌ Error fetching lesson progress:', progressError);
      return;
    }

    // Calculate completion
    let totalLessons = 0;
    let completedLessons = 0;

    modules?.forEach(module => {
      const publishedLessons = lessonProgress?.filter(p => 
        p.academy_lessons && p.academy_lessons.module_id === module.id
      ) || [];
      
      totalLessons += publishedLessons.length;
      completedLessons += publishedLessons.filter(p => p.completed).length;
      
      console.log(`   📚 ${module.title}: ${publishedLessons.filter(p => p.completed).length}/${publishedLessons.length} lessons completed`);
    });

    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    console.log(`   📊 Progress: ${completedLessons}/${totalLessons} lessons (${progressPercentage}%)`);

    if (progressPercentage < 100) {
      console.log(`   ⚠️ Chiel has not completed the academy yet (${progressPercentage}%)`);
      return;
    }

    console.log(`   ✅ Chiel has completed the academy!`);

    // 4. Check existing module unlocks
    const { data: existingUnlocks, error: unlocksError } = await supabase
      .from('user_module_unlocks')
      .select('*')
      .eq('user_id', chielUser.id);

    if (unlocksError) {
      console.error('❌ Error fetching existing unlocks:', unlocksError);
      return;
    }

    console.log(`   📋 Existing unlocks: ${existingUnlocks?.length || 0}`);

    // 5. Create missing module unlocks
    let unlocksCreated = 0;
    for (const module of modules || []) {
      const existingUnlock = existingUnlocks?.find(u => u.module_id === module.id);
      
      if (!existingUnlock) {
        const { error: insertError } = await supabase
          .from('user_module_unlocks')
          .insert({
            user_id: chielUser.id,
            module_id: module.id,
            unlocked_at: new Date().toISOString()
          });

        if (insertError) {
          console.error(`   ❌ Error creating unlock for ${module.title}:`, insertError);
        } else {
          console.log(`   ✅ Created unlock for: ${module.title}`);
          unlocksCreated++;
        }
      } else {
        console.log(`   ✅ Already unlocked: ${module.title}`);
      }
    }

    console.log(`\n🎉 Module unlocks fix completed!`);
    console.log(`📊 Summary:`);
    console.log(`   Total modules: ${modules?.length || 0}`);
    console.log(`   Existing unlocks: ${existingUnlocks?.length || 0}`);
    console.log(`   New unlocks created: ${unlocksCreated}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixChielModuleUnlocks();
