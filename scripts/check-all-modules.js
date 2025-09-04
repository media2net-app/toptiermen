const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkAllModules() {
  try {
    console.log('🔍 Alle Academy modules controleren...\n');
    
    const { data: modules } = await supabase
      .from('academy_modules')
      .select('*')
      .order('order_index');
    
    console.log('📚 Alle Academy modules:');
    modules.forEach(module => {
      console.log(`\n--- Module ${module.order_index}: ${module.title} ---`);
      console.log(`ID: ${module.id}`);
      console.log(`Beschrijving: ${module.description}`);
      console.log(`Aangemaakt: ${module.created_at}`);
      console.log(`Laatst bijgewerkt: ${module.updated_at}`);
      
      // Haal lessen op voor deze module
      supabase
        .from('academy_lessons')
        .select('id, title, order_index, created_at')
        .eq('module_id', module.id)
        .order('order_index')
        .then(({ data: lessons }) => {
          if (lessons && lessons.length > 0) {
            console.log(`📖 ${lessons.length} lessen:`);
            lessons.forEach(lesson => {
              console.log(`   ${lesson.order_index}. ${lesson.title}`);
            });
          } else {
            console.log(`📖 Geen lessen gevonden`);
          }
        });
    });
    
    console.log('\n🔍 Zoeken naar mogelijke oude module structuur...');
    
    // Controleer of er modules zijn die in mei/juni 2024 zijn aangemaakt
    const oldModules = modules.filter(module => {
      const createdDate = new Date(module.created_at);
      const mayDate = new Date('2024-05-01');
      const juneDate = new Date('2024-06-30');
      return createdDate >= mayDate && createdDate <= juneDate;
    });
    
    if (oldModules.length > 0) {
      console.log('\n⚠️  Modules aangemaakt in mei/juni 2024:');
      oldModules.forEach(module => {
        console.log(`   Module ${module.order_index}: ${module.title} (aangemaakt: ${module.created_at})`);
      });
    } else {
      console.log('\n✅ Geen modules gevonden die in mei/juni 2024 zijn aangemaakt');
    }
    
    // Controleer of er een module is met voeding/gezondheid thema
    const nutritionModules = modules.filter(module => {
      const title = module.title.toLowerCase();
      const description = module.description.toLowerCase();
      return title.includes('voeding') || title.includes('gezondheid') || 
             title.includes('nutrition') || title.includes('health') ||
             description.includes('voeding') || description.includes('gezondheid');
    });
    
    if (nutritionModules.length > 0) {
      console.log('\n🍎 Modules met voeding/gezondheid thema:');
      nutritionModules.forEach(module => {
        console.log(`   Module ${module.order_index}: ${module.title}`);
      });
    } else {
      console.log('\n❌ Geen modules gevonden met voeding/gezondheid thema');
    }
    
  } catch (error) {
    console.error('❌ Fout:', error);
  }
}

checkAllModules();
