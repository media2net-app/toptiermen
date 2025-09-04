const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function verifyModule2Cleaning() {
  try {
    console.log('🔍 Verificatie van Module 2 lessen 1 en 3 opschoning...\n');
    
    const { data: module2 } = await supabase
      .from('academy_modules')
      .select('*')
      .eq('order_index', 2)
      .single();
    
    console.log(`📚 Module 2: ${module2.title}\n`);
    
    // Haal lessen 1 en 3 op
    const { data: lessons } = await supabase
      .from('academy_lessons')
      .select('id, title, order_index, content, updated_at')
      .eq('module_id', module2.id)
      .in('order_index', [1, 3])
      .order('order_index');
    
    lessons.forEach(lesson => {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`LES ${lesson.order_index}: ${lesson.title}`);
      console.log(`${'='.repeat(80)}`);
      console.log(`Laatst bijgewerkt: ${lesson.updated_at}`);
      console.log(`Content lengte: ${lesson.content ? lesson.content.length : 0} karakters`);
      
      if (lesson.content) {
        // Controleer of er nog steeds checklists of lijsten zijn
        const hasChecklist = lesson.content.includes('checklist') || lesson.content.includes('Checklist');
        const hasTodo = lesson.content.includes('to-do') || lesson.content.includes('To-do') || lesson.content.includes('todo');
        const hasBulletPoints = lesson.content.includes('•') || lesson.content.includes('- ');
        const hasNumbers = lesson.content.includes('1.') || lesson.content.includes('2.') || lesson.content.includes('3.');
        
        console.log(`\n🔍 CONTROLE:`);
        console.log(`   Checklist gevonden: ${hasChecklist ? '❌ JA' : '✅ NEE'}`);
        console.log(`   To-do lijst gevonden: ${hasTodo ? '❌ JA' : '✅ NEE'}`);
        console.log(`   Bullet points gevonden: ${hasBulletPoints ? '❌ JA' : '✅ NEE'}`);
        console.log(`   Genummerde lijst gevonden: ${hasNumbers ? '❌ JA' : '✅ NEE'}`);
        
        console.log(`\n📝 OPGESCHOONDE CONTENT:`);
        console.log(lesson.content);
      } else {
        console.log('❌ Geen content gevonden');
      }
      
      console.log(`\n${'='.repeat(80)}\n`);
    });
    
    console.log('✅ Verificatie voltooid!');
    
  } catch (error) {
    console.error('❌ Fout:', error);
  }
}

verifyModule2Cleaning();
