const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkChielAcademy() {
  try {
    // Find Chiel's user ID
    const { data: chielUser, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', 'chiel@media2net.nl')
      .single();
    
    if (userError) {
      console.error('❌ Error finding Chiel:', userError.message);
      return;
    }
    
    console.log('👤 Found Chiel:', chielUser.email, chielUser.id);
    
    // Check if academy_lesson_completions table exists
    const { data: lessonCompletions, error: lessonError } = await supabase
      .from('academy_lesson_completions')
      .select('*')
      .eq('user_id', chielUser.id);
    
    if (lessonError) {
      console.error('❌ Error fetching lesson completions:', lessonError.message);
      console.log('📋 This means the academy_lesson_completions table does not exist');
    } else {
      console.log(`✅ Chiel has ${lessonCompletions?.length || 0} lesson completions`);
    }
    
    // Check if academy_module_completions table exists
    const { data: moduleCompletions, error: moduleError } = await supabase
      .from('academy_module_completions')
      .select('*')
      .eq('user_id', chielUser.id);
    
    if (moduleError) {
      console.error('❌ Error fetching module completions:', moduleError.message);
      console.log('📋 This means the academy_module_completions table does not exist');
    } else {
      console.log(`✅ Chiel has ${moduleCompletions?.length || 0} module completions`);
    }
    
    // Check what tables do exist with "academy" in the name
    console.log('\n🔍 Checking existing Academy-related tables...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .like('table_name', '%academy%');
    
    if (tablesError) {
      console.error('❌ Error fetching tables:', tablesError.message);
    } else {
      console.log('📋 Academy-related tables found:');
      tables?.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking Chiel Academy:', error);
  }
}

checkChielAcademy();
