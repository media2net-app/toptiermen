const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkEbookUrls() {
  try {
    console.log('🔍 Ebook URLs controleren in de database...\n');
    
    // Controleer of er een academy_ebooks tabel bestaat
    const { data: ebookTable, error: tableError } = await supabase
      .from('academy_ebooks')
      .select('*')
      .limit(5);
    
    if (tableError) {
      console.log('❌ academy_ebooks tabel niet gevonden of geen toegang');
      console.log('   Error:', tableError.message);
    } else {
      console.log('✅ academy_ebooks tabel gevonden');
      console.log(`   Aantal ebooks: ${ebookTable.length}`);
      
      if (ebookTable.length > 0) {
        console.log('\n📚 Voorbeeld ebooks:');
        ebookTable.forEach((ebook, index) => {
          console.log(`   ${index + 1}. ${ebook.title || 'Geen titel'}`);
          console.log(`      URL: ${ebook.file_url || 'Geen URL'}`);
          console.log(`      Les ID: ${ebook.lesson_id || 'Geen les ID'}`);
        });
      }
    }
    
    console.log('\n🔍 Controleer academy_lessons tabel voor ebook velden...');
    
    // Controleer of er ebook-gerelateerde velden zijn in academy_lessons
    const { data: lessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select('id, title, order_index, module_id, attachments, worksheet_url')
      .limit(10);
    
    if (lessonsError) {
      console.log('❌ Fout bij ophalen lessen:', lessonsError.message);
    } else {
      console.log(`✅ ${lessons.length} lessen gevonden`);
      
      console.log('\n📝 Voorbeeld lessen met mogelijke ebook velden:');
      lessons.forEach((lesson, index) => {
        console.log(`   ${index + 1}. ${lesson.title}`);
        console.log(`      Attachments: ${lesson.attachments ? JSON.stringify(lesson.attachments) : 'Geen'}`);
        console.log(`      Worksheet URL: ${lesson.worksheet_url || 'Geen'}`);
      });
    }
    
    console.log('\n🔍 Controleer academy_ebook_files tabel...');
    
    // Controleer of er een academy_ebook_files tabel bestaat
    const { data: ebookFiles, error: filesError } = await supabase
      .from('academy_ebook_files')
      .select('*')
      .limit(5);
    
    if (filesError) {
      console.log('❌ academy_ebook_files tabel niet gevonden of geen toegang');
      console.log('   Error:', filesError.message);
    } else {
      console.log('✅ academy_ebook_files tabel gevonden');
      console.log(`   Aantal ebook bestanden: ${ebookFiles.length}`);
      
      if (ebookFiles.length > 0) {
        console.log('\n📚 Voorbeeld ebook bestanden:');
        ebookFiles.forEach((file, index) => {
          console.log(`   ${index + 1}. ${file.filename || 'Geen bestandsnaam'}`);
          console.log(`      Pad: ${file.path || 'Geen pad'}`);
          console.log(`      Stijl: ${file.style_type || 'Geen stijl'}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Fout:', error);
  }
}

checkEbookUrls();
