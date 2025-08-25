require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugAcademyCompletionQuery() {
  try {
    console.log('🔍 Debugging Academy Completion Query...\n');

    // Test with Chiel specifically
    const chielId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e';
    
    console.log('1️⃣ Testing the exact query that failed...');
    
    // Get user's lesson progress with the same query as the badge script
    const { data: lessonProgress, error: progressError } = await supabase
      .from('user_lesson_progress')
      .select(`
        lesson_id,
        completed,
        academy_lessons!inner(
          id,
          module_id,
          status
        )
      `)
      .eq('user_id', chielId)
      .eq('completed', true);

    console.log('Query result:');
    console.log('Error:', progressError);
    console.log('Data length:', lessonProgress?.length || 0);
    
    if (lessonProgress && lessonProgress.length > 0) {
      console.log('First few records:');
      lessonProgress.slice(0, 3).forEach((progress, index) => {
        console.log(`  Record ${index + 1}:`, {
          lesson_id: progress.lesson_id,
          completed: progress.completed,
          academy_lessons: progress.academy_lessons
        });
      });
    }

    console.log('\n2️⃣ Testing alternative query without inner join...');
    
    // Try without the inner join
    const { data: lessonProgress2, error: progressError2 } = await supabase
      .from('user_lesson_progress')
      .select(`
        lesson_id,
        completed
      `)
      .eq('user_id', chielId)
      .eq('completed', true);

    console.log('Alternative query result:');
    console.log('Error:', progressError2);
    console.log('Data length:', lessonProgress2?.length || 0);

    console.log('\n3️⃣ Testing with separate queries...');
    
    // Get lesson progress first
    const { data: progress, error: progressErr } = await supabase
      .from('user_lesson_progress')
      .select('lesson_id, completed')
      .eq('user_id', chielId)
      .eq('completed', true);

    if (progressErr) {
      console.error('Progress query error:', progressErr);
      return;
    }

    console.log(`Found ${progress?.length || 0} completed lessons`);

    if (progress && progress.length > 0) {
      // Get lesson details for the first few
      const lessonIds = progress.slice(0, 5).map(p => p.lesson_id);
      
      const { data: lessons, error: lessonsErr } = await supabase
        .from('academy_lessons')
        .select('id, title, module_id, status')
        .in('id', lessonIds);

      console.log('Lessons query result:');
      console.log('Error:', lessonsErr);
      console.log('Lessons found:', lessons?.length || 0);
      
      if (lessons) {
        lessons.forEach(lesson => {
          console.log(`  - ${lesson.title} (Module ID: ${lesson.module_id}, Status: ${lesson.status})`);
        });
      }
    }

    console.log('\n4️⃣ Testing the working query from the previous script...');
    
    // Use the query that worked in the previous script
    const { data: workingProgress, error: workingError } = await supabase
      .from('user_lesson_progress')
      .select(`
        lesson_id,
        completed,
        completed_at,
        academy_lessons!inner(
          id,
          title,
          module_id,
          academy_modules!inner(
            id,
            title,
            slug
          )
        )
      `)
      .eq('user_id', chielId);

    console.log('Working query result:');
    console.log('Error:', workingError);
    console.log('Data length:', workingProgress?.length || 0);

    if (workingProgress && workingProgress.length > 0) {
      console.log('First few working records:');
      workingProgress.slice(0, 3).forEach((progress, index) => {
        console.log(`  Record ${index + 1}:`, {
          lesson_id: progress.lesson_id,
          completed: progress.completed,
          lesson_title: progress.academy_lessons?.title,
          module_title: progress.academy_lessons?.academy_modules?.title
        });
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugAcademyCompletionQuery();

