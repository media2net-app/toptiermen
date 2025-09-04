const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function updateEbookUrls() {
  try {
    console.log('📚 Ebook URLs bijwerken in de bestaande tabel...\n');
    
    // Haal alle ebooks op uit de database
    const { data: ebooks, error: ebooksError } = await supabase
      .from('academy_ebooks')
      .select('*');
    
    if (ebooksError) {
      console.error('❌ Fout bij ophalen ebooks:', ebooksError);
      return;
    }
    
    console.log(`📚 ${ebooks.length} ebooks gevonden in database\n`);
    
    // Haal alle lessen op uit de database
    const { data: lessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select('id, title, order_index, module_id');
    
    if (lessonsError) {
      console.error('❌ Fout bij ophalen lessen:', lessonsError);
      return;
    }
    
    // Haal alle modules op
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('id, title, order_index');
    
    if (modulesError) {
      console.error('❌ Fout bij ophalen modules:', modulesError);
      return;
    }
    
    console.log('📊 Modules gevonden:');
    modules.forEach(module => {
      console.log(`   ${module.order_index}. ${module.title}`);
    });
    
    let updatedCount = 0;
    
    // Update elke ebook met de juiste URLs
    for (const ebook of ebooks) {
      console.log(`\n--- Ebook: ${ebook.title} ---`);
      
      // Bepaal de juiste URLs
      const htmlUrl = ebook.path;
      const pdfUrl = ebook.path.replace('.html', '.pdf');
      
      // Zoek naar een passende les op basis van titel en module
      let matchingLesson = null;
      
      for (const lesson of lessons) {
        const module = modules.find(m => m.id === lesson.module_id);
        if (!module) continue;
        
        // Controleer of de les bij de juiste module hoort
        if (module.title === ebook.module) {
          // Probeer te matchen op titel
          const lessonTitleLower = lesson.title.toLowerCase();
          const ebookTitleLower = ebook.title.toLowerCase();
          
          // Eenvoudige matching logica
          if (lessonTitleLower.includes(ebookTitleLower.replace(/\s+/g, ' ')) ||
              ebookTitleLower.includes(lessonTitleLower.replace(/\s+/g, ' ')) ||
              lesson.order_index === 1) { // Eerste les van elke module
            matchingLesson = lesson;
            break;
          }
        }
      }
      
      // Update de ebook met URLs
      const updateData = {
        html_url: htmlUrl,
        pdf_url: pdfUrl,
        updated_at: new Date().toISOString()
      };
      
      // Voeg lesson_id toe als er een match is
      if (matchingLesson) {
        updateData.lesson_id = matchingLesson.id;
        console.log(`   ✅ Gekoppeld aan les: ${matchingLesson.title}`);
      } else {
        console.log(`   ⚠️  Geen les match gevonden`);
      }
      
      // Update de database
      const { error: updateError } = await supabase
        .from('academy_ebooks')
        .update(updateData)
        .eq('id', ebook.id);
      
      if (updateError) {
        console.error(`   ❌ Fout bij updaten:`, updateError);
      } else {
        console.log(`   💾 Database bijgewerkt`);
        updatedCount++;
      }
    }
    
    console.log(`\n📊 SAMENVATTING:`);
    console.log(`================`);
    console.log(`   ✅ Ebooks bijgewerkt: ${updatedCount}`);
    console.log(`   📚 Totaal verwerkt: ${ebooks.length}`);
    
  } catch (error) {
    console.error('❌ Fout:', error);
  }
}

updateEbookUrls();
