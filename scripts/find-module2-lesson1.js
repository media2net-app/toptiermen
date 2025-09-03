const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findModule2Lesson1() {
  console.log('🔍 Zoeken naar Module 2 en Les 1...\n');

  try {
    // 1. Find Module 2 (order_index = 2)
    console.log('1️⃣ Zoeken naar Module 2...');
    const { data: module2, error: module2Error } = await supabase
      .from('academy_modules')
      .select('*')
      .eq('order_index', 2)
      .single();

    if (module2Error) {
      console.error('❌ Module 2 fetch error:', module2Error);
      return;
    }

    console.log('✅ Module 2 gevonden:', {
      id: module2.id,
      title: module2.title,
      order_index: module2.order_index,
      description: module2.description
    });

    // 2. Find Lesson 1 of Module 2 (order_index = 1)
    console.log('\n2️⃣ Zoeken naar Les 1 van Module 2...');
    const { data: lesson1, error: lesson1Error } = await supabase
      .from('academy_lessons')
      .select('*')
      .eq('module_id', module2.id)
      .eq('order_index', 1)
      .single();

    if (lesson1Error) {
      console.error('❌ Les 1 fetch error:', lesson1Error);
      return;
    }

    console.log('✅ Les 1 van Module 2 gevonden:', {
      id: lesson1.id,
      title: lesson1.title,
      order_index: lesson1.order_index,
      type: lesson1.type,
      duration: lesson1.duration,
      status: lesson1.status
    });

    // 3. Show all lessons of Module 2 for context
    console.log('\n3️⃣ Alle lessen van Module 2:');
    const { data: allModule2Lessons, error: allLessonsError } = await supabase
      .from('academy_lessons')
      .select('*')
      .eq('module_id', module2.id)
      .order('order_index');

    if (allLessonsError) {
      console.error('❌ Alle lessen fetch error:', allLessonsError);
    } else {
      allModule2Lessons?.forEach((lesson, index) => {
        console.log(`   ${lesson.order_index}. ${lesson.title} (${lesson.type})`);
      });
    }

    console.log('\n🎯 Klaar om titel aan te passen van:');
    console.log(`   "${lesson1.title}" → "De basis van Discipline"`);

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

findModule2Lesson1();
