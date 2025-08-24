const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findDisciplineLessons() {
  try {
    console.log('🔍 Finding Discipline & Identiteit lessons...');
    
    // Get discipline module first
    const { data: disciplineModule, error: moduleError } = await supabase
      .from('academy_modules')
      .select('id, title, slug')
      .eq('slug', 'discipline-identiteit')
      .single();

    if (moduleError) {
      console.error('❌ Error finding discipline module:', moduleError);
      return;
    }

    console.log(`✅ Found module: ${disciplineModule.title} (ID: ${disciplineModule.id})\n`);

    // Get all lessons for this module
    const { data: lessons, error } = await supabase
      .from('academy_lessons')
      .select(`
        id,
        title,
        order_index,
        status,
        content
      `)
      .eq('module_id', disciplineModule.id)
      .eq('status', 'published')
      .order('order_index');

    if (error) {
      console.error('❌ Error fetching lessons:', error);
      return;
    }

    console.log(`✅ Found ${lessons?.length || 0} lessons in Discipline & Identiteit module:\n`);

    lessons?.forEach((lesson, index) => {
      console.log(`${index + 1}. ${lesson.title}`);
      console.log(`   ID: ${lesson.id}`);
      console.log(`   Order: ${lesson.order_index}`);
      console.log(`   Status: ${lesson.status}`);
      console.log(`   Content length: ${lesson.content?.length || 0} characters`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

findDisciplineLessons();
