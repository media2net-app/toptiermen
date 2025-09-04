const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkModule2Lessons() {
  try {
    console.log('🔍 Module 2 lessen 1 en 3 controleren...\n');
    
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
      console.log(`\n--- Les ${lesson.order_index}: ${lesson.title} ---`);
      console.log(`Content lengte: ${lesson.content ? lesson.content.length : 0} karakters`);
      
      if (lesson.content) {
        // Zoek naar checklists en to-do lijsten
        const hasChecklist = lesson.content.includes('checklist') || lesson.content.includes('Checklist');
        const hasTodo = lesson.content.includes('to-do') || lesson.content.includes('To-do') || lesson.content.includes('todo');
        const hasBulletPoints = lesson.content.includes('•') || lesson.content.includes('- ');
        const hasNumbers = lesson.content.includes('1.') || lesson.content.includes('2.') || lesson.content.includes('3.');
        
        console.log(`   Checklist gevonden: ${hasChecklist ? '❌ JA' : '✅ NEE'}`);
        console.log(`   To-do lijst gevonden: ${hasTodo ? '❌ JA' : '✅ NEE'}`);
        console.log(`   Bullet points gevonden: ${hasBulletPoints ? '❌ JA' : '✅ NEE'}`);
        console.log(`   Genummerde lijst gevonden: ${hasNumbers ? '❌ JA' : '✅ NEE'}`);
        
        // Toon een preview van de content
        console.log(`\n   Content preview (eerste 300 karakters):`);
        console.log(`   ${lesson.content.substring(0, 300)}...`);
      } else {
        console.log(`   ❌ Geen content gevonden`);
      }
    });
    
  } catch (error) {
    console.error('❌ Fout:', error);
  }
}

checkModule2Lessons();
