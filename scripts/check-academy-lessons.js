const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAcademyLessons() {
  try {
    console.log('🔍 Checking academy lessons...');
    
    // Get all lessons
    const { data: lessons, error } = await supabase
      .from('academy_lessons')
      .select(`
        id,
        title,
        order_index,
        module_id,
        status,
        academy_modules!inner(
          id,
          title,
          slug
        )
      `)
      .order('order_index');

    if (error) {
      console.error('❌ Error fetching lessons:', error);
      return;
    }

    console.log(`✅ Found ${lessons?.length || 0} lessons:\n`);

    lessons?.forEach((lesson, index) => {
      console.log(`${index + 1}. ${lesson.title}`);
      console.log(`   ID: ${lesson.id}`);
      console.log(`   Order: ${lesson.order_index}`);
      console.log(`   Status: ${lesson.status}`);
      console.log(`   Module: ${lesson.academy_modules.title} (${lesson.academy_modules.slug})`);
      console.log('');
    });

    // Check specifically for "De Basis van Discipline"
    console.log('🔍 Looking for "De Basis van Discipline"...');
    const disciplineLessons = lessons?.filter(l => 
      l.title.toLowerCase().includes('discipline') || 
      l.title.toLowerCase().includes('basis')
    );

    if (disciplineLessons && disciplineLessons.length > 0) {
      console.log(`✅ Found ${disciplineLessons.length} discipline-related lessons:`);
      disciplineLessons.forEach(lesson => {
        console.log(`   - ${lesson.title} (ID: ${lesson.id}, Order: ${lesson.order_index})`);
      });
    } else {
      console.log('❌ No discipline-related lessons found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAcademyLessons();
