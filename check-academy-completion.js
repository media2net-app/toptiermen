const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAcademyCompletion() {
  try {
    const userId = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c'; // Rick's user ID
    
    console.log('🔍 Checking Academy completion for rick@toptiermen.eu...');
    
    // Check if academy_lesson_completions table exists and has data
    const { data: completions, error: completionsError } = await supabase
      .from('academy_lesson_completions')
      .select('*')
      .eq('user_id', userId);
    
    if (completionsError) {
      console.error('❌ Error fetching lesson completions:', completionsError.message);
      return;
    }
    
    console.log('📊 Lesson completions found:', completions?.length || 0);
    
    if (completions && completions.length > 0) {
      console.log('✅ Academy lessons are completed for Rick');
      console.log('📋 Sample completions:', completions.slice(0, 3));
    } else {
      console.log('❌ No Academy lesson completions found for Rick');
      console.log('🔧 Need to complete Academy lessons...');
      
      // Complete all Academy lessons for Rick
      await completeAllAcademyLessons(userId);
    }
    
  } catch (error) {
    console.error('❌ Error checking Academy completion:', error);
  }
}

async function completeAllAcademyLessons(userId) {
  try {
    console.log('🚀 Completing all Academy lessons for Rick...');
    
    // Get all lessons
    const { data: lessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select('id, title, module_id')
      .order('module_id', { ascending: true })
      .order('order_index', { ascending: true });
    
    if (lessonsError) {
      console.error('❌ Error fetching lessons:', lessonsError.message);
      return;
    }
    
    console.log(`📚 Found ${lessons.length} lessons to complete`);
    
    // Complete each lesson
    for (const lesson of lessons) {
      const { error: insertError } = await supabase
        .from('academy_lesson_completions')
        .insert({
          user_id: userId,
          lesson_id: lesson.id,
          completed_at: new Date().toISOString(),
          score: 100,
          time_spent: 300 // 5 minutes per lesson
        });
      
      if (insertError) {
        console.error(`❌ Error completing lesson ${lesson.title}:`, insertError.message);
      } else {
        console.log(`✅ Completed: ${lesson.title}`);
      }
    }
    
    console.log('🎉 All Academy lessons completed for Rick!');
    
  } catch (error) {
    console.error('❌ Error completing Academy lessons:', error);
  }
}

checkAcademyCompletion();
