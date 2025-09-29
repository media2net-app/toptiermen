require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing Supabase env (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function run({ email, moduleOrderToCheck = 1, moduleOrderToUnlock = 2 }) {
  console.log('🔎 Starting unlock check for user:', email);
  // 1) Find user profile by email
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('email', email)
    .single();

  if (profileError || !profile) {
    console.error('❌ Cannot find profile for email:', email, profileError);
    process.exit(1);
  }

  const userId = profile.id;
  console.log('👤 User:', { userId, email: profile.email, name: profile.full_name });

  // 2) Get module IDs for order 1 and 2
  const { data: modules, error: modulesError } = await supabase
    .from('academy_modules')
    .select('id, title, order_index')
    .in('order_index', [moduleOrderToCheck, moduleOrderToUnlock])
    .order('order_index', { ascending: true });

  if (modulesError || !modules || modules.length < 1) {
    console.error('❌ Could not fetch modules', modulesError);
    process.exit(1);
  }

  const mod1 = modules.find(m => m.order_index === moduleOrderToCheck);
  const mod2 = modules.find(m => m.order_index === moduleOrderToUnlock);

  if (!mod1 || !mod2) {
    console.error('❌ Missing module(s). Found:', modules);
    process.exit(1);
  }

  console.log('📚 Modules:', { module1: mod1.title, module2: mod2.title });

  // 3) Verify module 1 completion via lessons and exam
  // Fetch lessons of module 1
  const { data: mod1Lessons, error: lessonsError } = await supabase
    .from('academy_lessons')
    .select('id, title, type')
    .eq('module_id', mod1.id)
    .order('order_index', { ascending: true });

  if (lessonsError || !mod1Lessons || mod1Lessons.length === 0) {
    console.error('❌ Could not fetch module 1 lessons:', lessonsError);
    process.exit(1);
  }

  // Check completions for user
  const lessonIds = mod1Lessons.map(l => l.id);
  const { data: completions, error: compError } = await supabase
    .from('academy_lesson_completions')
    .select('lesson_id, score, completed_at')
    .eq('user_id', userId)
    .in('lesson_id', lessonIds);

  if (compError) {
    console.error('❌ Error fetching lesson completions:', compError);
    process.exit(1);
  }

  const completedSet = new Set((completions || []).map(c => c.lesson_id));
  const allLessonsCompleted = mod1Lessons.every(l => completedSet.has(l.id));

  // Find exam lesson(s) and see if scored
  const examLessons = mod1Lessons.filter(l => l.type === 'exam');
  let examPassed = false;
  if (examLessons.length > 0) {
    examPassed = examLessons.every(ex => {
      const rec = (completions || []).find(c => c.lesson_id === ex.id);
      return rec && (rec.score === null || rec.score === undefined ? true : rec.score >= 50);
    });
  } else {
    // If no explicit exam lesson found, rely on allLessonsCompleted
    examPassed = allLessonsCompleted;
  }

  console.log('✅ Completion check:', {
    totalLessons: mod1Lessons.length,
    completedCount: completedSet.size,
    allLessonsCompleted,
    examLessons: examLessons.map(e => e.title),
    examPassed
  });

  if (!allLessonsCompleted || !examPassed) {
    console.warn('⚠️ Module 1 not fully completed or exam not passed based on records. Proceeding to unlock Module 2 anyway as per request.');
  }

  // 4) Upsert unlock for module 2
  const { data: unlockExisting } = await supabase
    .from('user_module_unlocks')
    .select('module_id, unlocked_at')
    .eq('user_id', userId)
    .eq('module_id', mod2.id)
    .maybeSingle();

  if (unlockExisting) {
    console.log('ℹ️ Module 2 already unlocked at', unlockExisting.unlocked_at);
  } else {
    const { error: unlockError } = await supabase
      .from('user_module_unlocks')
      .upsert({
        user_id: userId,
        module_id: mod2.id,
        unlocked_at: new Date().toISOString()
      });

    if (unlockError) {
      console.error('❌ Failed to unlock module 2:', unlockError);
      process.exit(1);
    }
    console.log('🎉 Module 2 unlocked for user', email);
  }

  console.log('✅ Done');
}

// Run with default email for Frodo if not provided via env
const email = process.env.FRODO_EMAIL || 'fvanhouten1986@gmail.com';
run({ email }).catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
