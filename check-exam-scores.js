require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkExamScores() {
  try {
    console.log('🔍 Checking exam scores for basic.user@toptiermen.eu...');
    
    // Get the user ID
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', 'basic.user@toptiermen.eu')
      .single();

    if (userError || !userData) {
      console.error('❌ User not found:', userError);
      return;
    }

    const userId = userData.id;
    console.log(`✅ Found user: ${userData.email} (${userId})`);

    // Check user_lesson_progress for exam scores
    console.log('\n📊 Checking user_lesson_progress for exam scores...');
    const { data: lessonProgress, error: progressError } = await supabase
      .from('user_lesson_progress')
      .select(`
        *,
        academy_lessons (
          id,
          title,
          module_id,
          order_index,
          exam_questions
        )
      `)
      .eq('user_id', userId);

    if (progressError) {
      console.error('❌ Error fetching lesson progress:', progressError);
    } else {
      console.log(`📊 Found ${lessonProgress?.length || 0} lesson progress records:`);
      
      if (lessonProgress && lessonProgress.length > 0) {
        lessonProgress.forEach((progress, index) => {
          console.log(`\n📚 Lesson Progress ${index + 1}:`);
          console.log(`   Lesson ID: ${progress.lesson_id}`);
          console.log(`   Lesson Title: ${progress.academy_lessons?.title || 'Unknown'}`);
          console.log(`   Module ID: ${progress.academy_lessons?.module_id || 'Unknown'}`);
          console.log(`   Completed: ${progress.completed}`);
          console.log(`   Exam Score: ${progress.exam_score}`);
          console.log(`   Completed At: ${progress.completed_at}`);
          console.log(`   Has Exam Questions: ${progress.academy_lessons?.exam_questions ? 'Yes' : 'No'}`);
        });
      } else {
        console.log('❌ No lesson progress found');
      }
    }

    // Check for exam lessons specifically
    console.log('\n🎯 Checking for exam lessons...');
    const { data: examLessons, error: examLessonsError } = await supabase
      .from('academy_lessons')
      .select('id, title, module_id, order_index, exam_questions')
      .not('exam_questions', 'is', null)
      .order('module_id, order_index');

    if (examLessonsError) {
      console.error('❌ Error fetching exam lessons:', examLessonsError);
    } else {
      console.log(`🎯 Found ${examLessons?.length || 0} exam lessons:`);
      
      if (examLessons && examLessons.length > 0) {
        examLessons.forEach((lesson) => {
          console.log(`   Exam: ${lesson.title} (Module: ${lesson.module_id}, Order: ${lesson.order_index})`);
          
          // Check if user has completed this exam
          const userExamProgress = lessonProgress?.find(p => p.lesson_id === lesson.id);
          if (userExamProgress) {
            console.log(`     ✅ User completed with score: ${userExamProgress.exam_score}`);
          } else {
            console.log(`     ❌ User has not completed this exam`);
          }
        });
      } else {
        console.log('❌ No exam lessons found');
      }
    }

    // Check module unlocks
    console.log('\n🔓 Checking current module unlocks...');
    const { data: moduleUnlocks, error: unlockError } = await supabase
      .from('user_module_unlocks')
      .select('*')
      .eq('user_id', userId);

    if (unlockError) {
      console.error('❌ Error fetching module unlocks:', unlockError);
    } else {
      console.log(`🔓 Found ${moduleUnlocks?.length || 0} module unlocks:`);
      
      if (moduleUnlocks && moduleUnlocks.length > 0) {
        moduleUnlocks.forEach((unlock) => {
          console.log(`   Module ${unlock.module_id} unlocked at: ${unlock.unlocked_at}`);
        });
      } else {
        console.log('❌ No module unlocks found');
      }
    }

    // Check if Module 2 should be unlocked
    console.log('\n🎯 Checking if Module 2 should be unlocked...');
    
    // Get Module 1 exam lesson
    const module1Id = 'c671fea4-bfb1-4ccc-b23e-220e80783d06'; // Testosteron
    const module2Id = 'ba58a203-b2d0-442b-83a3-62cfb0a79478'; // Discipline & Identiteit
    
    const { data: module1Exam, error: module1ExamError } = await supabase
      .from('academy_lessons')
      .select('id, title, exam_questions')
      .eq('module_id', module1Id)
      .not('exam_questions', 'is', null)
      .single();

    if (module1ExamError) {
      console.log('❌ Error finding Module 1 exam:', module1ExamError);
    } else if (module1Exam) {
      console.log(`📋 Module 1 exam found: ${module1Exam.title}`);
      
      // Check user's score for this exam
      const userExamProgress = lessonProgress?.find(p => p.lesson_id === module1Exam.id);
      if (userExamProgress && userExamProgress.exam_score !== null) {
        console.log(`📊 User's exam score: ${userExamProgress.exam_score}`);
        
        // Check if score is 9/10 or higher
        if (userExamProgress.exam_score >= 9) {
          console.log('✅ Score is 9/10 or higher - Module 2 should be unlocked!');
          
          // Check if Module 2 is already unlocked
          const module2Unlocked = moduleUnlocks?.find(u => u.module_id === module2Id);
          if (module2Unlocked) {
            console.log('✅ Module 2 is already unlocked');
          } else {
            console.log('❌ Module 2 is NOT unlocked - this is the problem!');
            console.log('🔧 Need to unlock Module 2 manually or fix the unlock logic');
          }
        } else {
          console.log(`❌ Score ${userExamProgress.exam_score}/10 is not sufficient (need 9/10)`);
        }
      } else {
        console.log('❌ User has not completed the Module 1 exam yet');
      }
    } else {
      console.log('❌ No Module 1 exam found');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkExamScores();
