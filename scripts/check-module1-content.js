const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkModule1Content() {
  try {
    console.log('🔍 Module 1 (Testosteron) content controleren...\n');
    
    const { data: module1 } = await supabase
      .from('academy_modules')
      .select('*')
      .eq('order_index', 1)
      .single();
    
    console.log(`📚 Module 1: ${module1.title}`);
    console.log(`Beschrijving: ${module1.description}`);
    console.log(`Aangemaakt: ${module1.created_at}\n`);
    
    const { data: lessons } = await supabase
      .from('academy_lessons')
      .select('id, title, order_index, content, video_url')
      .eq('module_id', module1.id)
      .order('order_index');
    
    console.log('📚 Huidige Module 1 lessen:');
    lessons.forEach(lesson => {
      console.log(`\n--- Les ${lesson.order_index}: ${lesson.title} ---`);
      console.log(`ID: ${lesson.id}`);
      console.log(`Content: ${lesson.content ? lesson.content.substring(0, 100) + '...' : 'GEEN CONTENT'}`);
      console.log(`Content lengte: ${lesson.content ? lesson.content.length : 0} karakters`);
      console.log(`Video URL: ${lesson.video_url || 'Geen video'}`);
    });
    
  } catch (error) {
    console.error('❌ Fout:', error);
  }
}

checkModule1Content();
