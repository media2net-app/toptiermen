const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function cleanModule2Lessons() {
  try {
    console.log('🧹 Module 2 lessen 1 en 3 opschonen...\n');
    
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
    
    const updatedLessons = [];
    
    for (const lesson of lessons) {
      console.log(`\n--- Les ${lesson.order_index}: ${lesson.title} ---`);
      
      if (lesson.content) {
        let cleanedContent = lesson.content;
        let changesMade = [];
        
        // Verwijder de checklist sectie uit Les 1
        if (lesson.order_index === 1) {
          const checklistPattern = /## Dagelijkse discipline checklist:[\s\S]*?(?=\n\n|$)/;
          if (checklistPattern.test(cleanedContent)) {
            cleanedContent = cleanedContent.replace(checklistPattern, '');
            changesMade.push('Dagelijkse discipline checklist verwijderd');
          }
        }
        
        // Verwijder de routine sectie uit Les 3
        if (lesson.order_index === 3) {
          const routinePattern = /## Dagelijkse routine voor discipline:[\s\S]*?(?=\n\n|$)/;
          if (routinePattern.test(cleanedContent)) {
            cleanedContent = cleanedContent.replace(routinePattern, '');
            changesMade.push('Dagelijkse routine voor discipline verwijderd');
          }
        }
        
        // Verwijder alle bullet point lijsten (- item)
        const bulletPattern = /- [^\n]+/g;
        if (bulletPattern.test(cleanedContent)) {
          const bulletMatches = cleanedContent.match(bulletPattern);
          cleanedContent = cleanedContent.replace(bulletPattern, '');
          changesMade.push(`${bulletMatches.length} bullet points verwijderd`);
        }
        
        // Verwijder alle genummerde lijsten (1. item, 2. item, etc.)
        const numberedPattern = /\d+\. [^\n]+/g;
        if (numberedPattern.test(cleanedContent)) {
          const numberedMatches = cleanedContent.match(numberedPattern);
          cleanedContent = cleanedContent.replace(numberedPattern, '');
          changesMade.push(`${numberedMatches.length} genummerde items verwijderd`);
        }
        
        // Verwijder dubbele witregels en trim
        cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
        
        if (changesMade.length > 0) {
          console.log(`   ✅ Wijzigingen: ${changesMade.join(', ')}`);
          console.log(`   📏 Content lengte: ${lesson.content.length} → ${cleanedContent.length} karakters`);
          
          // Update de database
          const { error } = await supabase
            .from('academy_lessons')
            .update({
              content: cleanedContent,
              updated_at: new Date().toISOString()
            })
            .eq('id', lesson.id);
          
          if (error) {
            console.error(`   ❌ Fout bij updaten:`, error);
          } else {
            console.log(`   💾 Database bijgewerkt`);
            updatedLessons.push({
              lessonNumber: lesson.order_index,
              title: lesson.title,
              changes: changesMade,
              originalLength: lesson.content.length,
              cleanedLength: cleanedContent.length
            });
          }
        } else {
          console.log(`   ✅ Geen wijzigingen nodig`);
        }
        
        // Toon een preview van de opgeschoonde content
        console.log(`\n   Opgeschoonde content preview:`);
        console.log(`   ${cleanedContent.substring(0, 200)}...`);
        
      } else {
        console.log(`   ❌ Geen content gevonden`);
      }
    }
    
    console.log(`\n📊 SAMENVATTING:`);
    console.log(`================`);
    if (updatedLessons.length > 0) {
      updatedLessons.forEach(lesson => {
        console.log(`   Les ${lesson.lessonNumber}: ${lesson.title}`);
        console.log(`      Wijzigingen: ${lesson.changes.join(', ')}`);
        console.log(`      Karakters: ${lesson.originalLength} → ${lesson.cleanedLength}`);
      });
    } else {
      console.log(`   ✅ Geen lessen bijgewerkt`);
    }
    
  } catch (error) {
    console.error('❌ Fout:', error);
  }
}

cleanModule2Lessons();
