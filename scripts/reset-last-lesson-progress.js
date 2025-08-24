const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetLastLessonProgress() {
  try {
    console.log('🔍 Finding the last lesson of the last module...');
    
    // Get all modules ordered by order_index
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('id, title, order_index')
      .eq('status', 'published')
      .order('order_index', { ascending: false })
      .limit(1);

    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError);
      return;
    }

    if (!modules || modules.length === 0) {
      console.error('❌ No modules found');
      return;
    }

    const lastModule = modules[0];
    console.log(`📚 Last module: ${lastModule.title} (ID: ${lastModule.id})`);

    // Get lessons for the last module, ordered by order_index
    const { data: lessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select('id, title, order_index')
      .eq('module_id', lastModule.id)
      .eq('status', 'published')
      .order('order_index', { ascending: false })
      .limit(1);

    if (lessonsError) {
      console.error('❌ Error fetching lessons:', lessonsError);
      return;
    }

    if (!lessons || lessons.length === 0) {
      console.error('❌ No lessons found for the last module');
      return;
    }

    const lastLesson = lessons[0];
    console.log(`📖 Last lesson: ${lastLesson.title} (ID: ${lastLesson.id})`);

    // Find user "Chiel"
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .ilike('full_name', '%Chiel%')
      .limit(1);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    if (!users || users.length === 0) {
      console.error('❌ User "Chiel" not found');
      return;
    }

    const chiel = users[0];
    console.log(`👤 Found user: ${chiel.full_name} (ID: ${chiel.id})`);

    // Check current progress for this lesson
    const { data: currentProgress, error: progressError } = await supabase
      .from('user_lesson_progress')
      .select('id, completed, completed_at')
      .eq('user_id', chiel.id)
      .eq('lesson_id', lastLesson.id)
      .single();

    if (progressError && progressError.code !== 'PGRST116') {
      console.error('❌ Error checking current progress:', progressError);
      return;
    }

    if (currentProgress) {
      console.log(`📊 Current progress: ${currentProgress.completed ? 'Completed' : 'Not completed'}`);
      
      if (currentProgress.completed) {
        // Reset to not completed
        const { error: updateError } = await supabase
          .from('user_lesson_progress')
          .update({ 
            completed: false, 
            completed_at: null 
          })
          .eq('id', currentProgress.id);

        if (updateError) {
          console.error('❌ Error updating progress:', updateError);
          return;
        }

        console.log('✅ Successfully reset lesson progress to "not completed"');
      } else {
        console.log('ℹ️ Lesson was already not completed');
      }
    } else {
      // Create new progress entry as not completed
      const { error: insertError } = await supabase
        .from('user_lesson_progress')
        .insert({
          user_id: chiel.id,
          lesson_id: lastLesson.id,
          completed: false,
          completed_at: null
        });

      if (insertError) {
        console.error('❌ Error creating progress entry:', insertError);
        return;
      }

      console.log('✅ Created new progress entry as "not completed"');
    }

    console.log('\n🎯 Ready for testing!');
    console.log(`📚 Module: ${lastModule.title}`);
    console.log(`📖 Lesson: ${lastLesson.title}`);
    console.log(`👤 User: ${chiel.full_name}`);
    console.log('💡 Now complete this lesson to test the Academy Master badge unlock!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

resetLastLessonProgress();
