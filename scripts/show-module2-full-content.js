const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function showModule2FullContent() {
  try {
    console.log('🔍 Volledige content van Module 2 lessen 1 en 3...\n');
    
    const { data: module2 } = await supabase
      .from('academy_modules')
      .select('*')
      .eq('order_index', 2)
      .single();
    
    console.log(`📚 Module 2: ${module2.title}\n`);
    
    // Haal lessen 1 en 3 op
    const { data: lessons } = await supabase
      .from('academy_lessons')
      .select('id, title, order_index, content')
      .eq('module_id', module2.id)
      .in('order_index', [1, 3])
      .order('order_index');
    
    lessons.forEach(lesson => {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`LES ${lesson.order_index}: ${lesson.title}`);
      console.log(`${'='.repeat(80)}`);
      
      if (lesson.content) {
        console.log(lesson.content);
      } else {
        console.log('❌ Geen content gevonden');
      }
      
      console.log(`\n${'='.repeat(80)}\n`);
    });
    
  } catch (error) {
    console.error('❌ Fout:', error);
  }
}

showModule2FullContent();
