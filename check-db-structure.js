const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabaseStructure() {
  console.log('🔍 CHECKING DATABASE STRUCTURE...');
  
  try {
    // Check if academy_ebooks table exists
    const { data: ebooks, error: ebooksError } = await supabase
      .from('academy_ebooks')
      .select('*')
      .limit(1);

    if (ebooksError) {
      console.log('❌ academy_ebooks table error:', ebooksError.message);
    } else {
      console.log('✅ academy_ebooks table exists');
      console.log('📊 Sample ebook:', ebooks[0]);
    }

    // Check academy_lessons table
    const { data: lessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select('*')
      .limit(1);

    if (lessonsError) {
      console.log('❌ academy_lessons table error:', lessonsError.message);
    } else {
      console.log('✅ academy_lessons table exists');
      console.log('📊 Sample lesson:', lessons[0]);
    }

    // Check academy_modules table
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('*')
      .limit(1);

    if (modulesError) {
      console.log('❌ academy_modules table error:', modulesError.message);
    } else {
      console.log('✅ academy_modules table exists');
      console.log('📊 Sample module:', modules[0]);
    }

  } catch (error) {
    console.error('❌ Error checking database:', error);
  }
}

checkDatabaseStructure();
