const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkModule7History() {
  try {
    console.log('🔍 Module 7 geschiedenis controleren...\n');
    
    const { data: module7 } = await supabase
      .from('academy_modules')
      .select('*')
      .eq('order_index', 7)
      .single();
    
    console.log(`📚 Module 7: ${module7.title}`);
    console.log(`Beschrijving: ${module7.description}`);
    console.log(`Aangemaakt: ${module7.created_at}`);
    console.log(`Laatst bijgewerkt: ${module7.updated_at}\n`);
    
    const { data: lessons } = await supabase
      .from('academy_lessons')
      .select('id, title, order_index, content, created_at, updated_at')
      .eq('module_id', module7.id)
      .order('order_index');
    
    console.log('📚 Huidige Module 7 lessen:');
    lessons.forEach(lesson => {
      console.log(`\n--- Les ${lesson.order_index}: ${lesson.title} ---`);
      console.log(`ID: ${lesson.id}`);
      console.log(`Aangemaakt: ${lesson.created_at}`);
      console.log(`Laatst bijgewerkt: ${lesson.updated_at}`);
      console.log(`Content lengte: ${lesson.content ? lesson.content.length : 0} karakters`);
    });
    
    console.log('\n🔍 Zoeken naar mogelijke titel wijzigingen...');
    
    // Controleer of er recente wijzigingen zijn geweest
    const recentLessons = lessons.filter(lesson => {
      const updatedDate = new Date(lesson.updated_at);
      const mayDate = new Date('2024-05-01');
      const juneDate = new Date('2024-06-30');
      return updatedDate >= mayDate && updatedDate <= juneDate;
    });
    
    if (recentLessons.length > 0) {
      console.log('\n⚠️  Lessen met recente wijzigingen (mei/juni 2024):');
      recentLessons.forEach(lesson => {
        console.log(`   Les ${lesson.order_index}: ${lesson.title} (bijgewerkt: ${lesson.updated_at})`);
      });
    } else {
      console.log('\n✅ Geen lessen gevonden met wijzigingen in mei/juni 2024');
    }
    
    // Controleer of er mogelijk andere titels waren
    console.log('\n🔍 Mogelijke oude titels controleren...');
    
    // Zoek naar patronen die kunnen duiden op oude titels
    const possibleOldTitles = [
      'Voeding & Gezondheid',
      'Voeding',
      'Gezondheid',
      'Nutrition',
      'Health',
      'Voedingsleer',
      'Gezondheidsleer'
    ];
    
    console.log('Mogelijke oude titels die je bedoelde:');
    possibleOldTitles.forEach(title => {
      console.log(`   - ${title}`);
    });
    
    console.log('\n💡 Als je specifieke oude titels weet, kun je ze hier delen zodat ik kan helpen zoeken.');
    
  } catch (error) {
    console.error('❌ Fout:', error);
  }
}

checkModule7History();
