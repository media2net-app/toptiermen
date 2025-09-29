require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing Supabase env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  const email = process.env.FRODO_EMAIL || 'fvanhouten1986@gmail.com';
  console.log('🔧 Fixing Module 1 completions for:', email);

  // 1) Get user
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('email', email)
    .single();
  if (profileError || !profile) {
    console.error('❌ Could not find profile', profileError);
    process.exit(1);
  }
  const userId = profile.id;
  console.log('👤 User:', profile);

  // 2) Get module 1 and module 2
  const { data: modules, error: modulesError } = await supabase
    .from('academy_modules')
    .select('id, title, order_index')
    .in('order_index', [1, 2])
    .order('order_index', { ascending: true });
  if (modulesError || !modules || modules.length < 2) {
    console.error('❌ Could not fetch modules', modulesError);
    process.exit(1);
  }
  const module1 = modules.find(m => m.order_index === 1);
  const module2 = modules.find(m => m.order_index === 2);
  console.log('📚 Modules:', { module1: module1.title, module2: module2.title });

  // 3) Get all lessons in module 1
  const { data: lessons, error: lessonsError } = await supabase
    .from('academy_lessons')
    .select('id, title, type')
    .eq('module_id', module1.id)
    .order('order_index', { ascending: true });
  if (lessonsError || !lessons || lessons.length === 0) {
    console.error('❌ Could not fetch module 1 lessons', lessonsError);
    process.exit(1);
  }
  console.log(`📘 Module 1 lessons: ${lessons.length}`);

  // 4) Upsert completions (score 100)
  const now = new Date().toISOString();
  for (const lesson of lessons) {
    const payload = {
      user_id: userId,
      lesson_id: lesson.id,
      completed_at: now,
      score: 100,
      time_spent: 300
    };
    const { error: upsertErr } = await supabase
      .from('academy_lesson_completions')
      .upsert(payload, { onConflict: 'user_id,lesson_id' });
    if (upsertErr) {
      console.error('⚠️ Upsert completion failed for', lesson.title, upsertErr.message);
    } else {
      console.log('✅ Completion set for', lesson.title);
    }
  }

  // 5) Mark module 1 completed in module completions
  const total = lessons.length;
  const { error: modCompErr } = await supabase
    .from('academy_module_completions')
    .upsert({
      user_id: userId,
      module_id: module1.id,
      completed_at: now,
      total_lessons: total,
      completed_lessons: total
    }, { onConflict: 'user_id,module_id' });
  if (modCompErr) {
    console.error('⚠️ Module completion upsert failed:', modCompErr.message);
  } else {
    console.log('🏁 Module 1 marked completed (', total, '/', total, ')');
  }

  // 6) Ensure module 2 unlocked
  const { data: existingUnlock } = await supabase
    .from('user_module_unlocks')
    .select('module_id, unlocked_at')
    .eq('user_id', userId)
    .eq('module_id', module2.id)
    .maybeSingle();
  if (!existingUnlock) {
    const { error: unlockErr } = await supabase
      .from('user_module_unlocks')
      .upsert({ user_id: userId, module_id: module2.id, unlocked_at: now }, { onConflict: 'user_id,module_id' });
    if (unlockErr) {
      console.error('⚠️ Failed to unlock module 2:', unlockErr.message);
    } else {
      console.log('🔓 Module 2 unlocked');
    }
  } else {
    console.log('ℹ️ Module 2 already unlocked at', existingUnlock.unlocked_at);
  }

  console.log('✅ Fix complete.');
}

main().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
