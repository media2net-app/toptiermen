const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function addEbookUrls() {
  try {
    console.log('📚 Ebook URLs toevoegen aan de database...\n');
    
    // Lees alle ebook bestanden uit de public/books directory
    const booksDir = path.join(process.cwd(), 'public', 'books');
    const files = fs.readdirSync(booksDir);
    
    // Filter alleen HTML bestanden (we gebruiken deze als basis)
    const htmlFiles = files.filter(file => file.endsWith('.html'));
    
    console.log(`📁 ${htmlFiles.length} HTML ebooks gevonden\n`);
    
    // Groepeer ebooks per module
    const moduleEbooks = {
      'discipline': [],
      'fysieke-dominantie': [],
      'mentale-kracht': [],
      'business-and-finance': [],
      'brotherhood': [],
      'testosteron': [],
      'voeding-gezondheid': []
    };
    
    htmlFiles.forEach(file => {
      const filename = file.replace('.html', '');
      
      // Bepaal module op basis van bestandsnaam
      let module = 'other';
      for (const [moduleKey, patterns] of Object.entries(moduleEbooks)) {
        if (filename.includes(moduleKey)) {
          module = moduleKey;
          break;
        }
      }
      
      if (module !== 'other') {
        moduleEbooks[module].push({
          filename,
          htmlPath: `/books/${file}`,
          pdfPath: `/books/${filename}.pdf`
        });
      }
    });
    
    console.log('📊 Ebooks per module:');
    Object.entries(moduleEbooks).forEach(([module, ebooks]) => {
      if (ebooks.length > 0) {
        console.log(`   ${module}: ${ebooks.length} ebooks`);
      }
    });
    
    // Haal alle lessen op uit de database
    const { data: lessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select('id, title, order_index, module_id')
      .order('module_id, order_index');
    
    if (lessonsError) {
      console.error('❌ Fout bij ophalen lessen:', lessonsError);
      return;
    }
    
    console.log(`\n📝 ${lessons.length} lessen gevonden in database\n`);
    
    // Haal alle modules op
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('id, title, order_index, slug')
      .order('order_index');
    
    if (modulesError) {
      console.error('❌ Fout bij ophalen modules:', modulesError);
      return;
    }
    
    console.log('📚 Modules gevonden:');
    modules.forEach(module => {
      console.log(`   ${module.order_index}. ${module.title} (${module.slug})`);
    });
    
    // Maak een mapping van module titels naar module keys
    const moduleMapping = {
      'Discipline & Identiteit': 'discipline',
      'Fysieke Dominantie': 'fysieke-dominantie',
      'Mentale Kracht/Weerbaarheid': 'mentale-kracht',
      'Business and Finance': 'business-and-finance',
      'Brotherhood': 'brotherhood',
      'Testosteron': 'testosteron',
      'Voeding & Gezondheid': 'voeding-gezondheid'
    };
    
    // Voeg ebook URLs toe voor elke les
    let addedCount = 0;
    let updatedCount = 0;
    
    for (const lesson of lessons) {
      // Vind de module voor deze les
      const module = modules.find(m => m.id === lesson.module_id);
      if (!module) continue;
      
      const moduleKey = moduleMapping[module.title];
      if (!moduleKey || !moduleEbooks[moduleKey]) continue;
      
      // Zoek naar een passend ebook voor deze les
      let matchingEbook = null;
      
      // Probeer eerst te matchen op les titel
      for (const ebook of moduleEbooks[moduleKey]) {
        const lessonTitleLower = lesson.title.toLowerCase();
        const ebookFilenameLower = ebook.filename.toLowerCase();
        
        // Eenvoudige matching logica
        if (ebookFilenameLower.includes(lessonTitleLower.replace(/\s+/g, '-')) ||
            lessonTitleLower.includes(ebookFilenameLower.replace(/-/g, ' ')) ||
            ebookFilenameLower.includes(lesson.order_index.toString())) {
          matchingEbook = ebook;
          break;
        }
      }
      
      // Als geen directe match, gebruik de eerste beschikbare ebook voor deze module
      if (!matchingEbook && moduleEbooks[moduleKey].length > 0) {
        matchingEbook = moduleEbooks[moduleKey][0];
      }
      
      if (matchingEbook) {
        // Controleer of er al een ebook record bestaat voor deze les
        const { data: existingEbook, error: checkError } = await supabase
          .from('academy_ebooks')
          .select('id')
          .eq('lesson_id', lesson.id)
          .single();
        
        if (checkError && checkError.code !== 'PGRST116') {
          console.error(`❌ Fout bij controleren ebook voor les ${lesson.title}:`, checkError);
          continue;
        }
        
        if (existingEbook) {
          // Update bestaand record
          const { error: updateError } = await supabase
            .from('academy_ebooks')
            .update({
              title: lesson.title,
              file_url: matchingEbook.htmlPath,
              pdf_url: matchingEbook.pdfPath,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingEbook.id);
          
          if (updateError) {
            console.error(`❌ Fout bij updaten ebook voor les ${lesson.title}:`, updateError);
          } else {
            console.log(`   ✅ Ebook bijgewerkt voor: ${lesson.title}`);
            updatedCount++;
          }
        } else {
          // Voeg nieuw record toe
          const { error: insertError } = await supabase
            .from('academy_ebooks')
            .insert({
              lesson_id: lesson.id,
              title: lesson.title,
              file_url: matchingEbook.htmlPath,
              pdf_url: matchingEbook.pdfPath,
              status: 'published'
            });
          
          if (insertError) {
            console.error(`❌ Fout bij toevoegen ebook voor les ${lesson.title}:`, insertError);
          } else {
            console.log(`   ➕ Ebook toegevoegd voor: ${lesson.title}`);
            addedCount++;
          }
        }
      }
    }
    
    console.log(`\n📊 SAMENVATTING:`);
    console.log(`================`);
    console.log(`   ➕ Nieuwe ebooks toegevoegd: ${addedCount}`);
    console.log(`   ✅ Ebooks bijgewerkt: ${updatedCount}`);
    console.log(`   📚 Totaal verwerkt: ${addedCount + updatedCount}`);
    
  } catch (error) {
    console.error('❌ Fout:', error);
  }
}

addEbookUrls();
