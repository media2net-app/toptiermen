const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function addEbookColumns() {
  try {
    console.log('🔧 Ontbrekende kolommen toevoegen aan academy_ebooks tabel...\n');
    
    // Voeg html_url kolom toe
    console.log('📝 html_url kolom toevoegen...');
    const { error: htmlError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE academy_ebooks ADD COLUMN IF NOT EXISTS html_url TEXT;'
    });
    
    if (htmlError) {
      console.log('   ⚠️  html_url kolom kon niet worden toegevoegd (mogelijk bestaat al):', htmlError.message);
    } else {
      console.log('   ✅ html_url kolom toegevoegd');
    }
    
    // Voeg pdf_url kolom toe
    console.log('📝 pdf_url kolom toevoegen...');
    const { error: pdfError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE academy_ebooks ADD COLUMN IF NOT EXISTS pdf_url TEXT;'
    });
    
    if (pdfError) {
      console.log('   ⚠️  pdf_url kolom kon niet worden toegevoegd (mogelijk bestaat al):', pdfError.message);
    } else {
      console.log('   ✅ pdf_url kolom toegevoegd');
    }
    
    // Voeg lesson_id kolom toe
    console.log('📝 lesson_id kolom toevoegen...');
    const { error: lessonError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE academy_ebooks ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES academy_lessons(id);'
    });
    
    if (lessonError) {
      console.log('   ⚠️  lesson_id kolom kon niet worden toegevoegd (mogelijk bestaat al):', lessonError.message);
    } else {
      console.log('   ✅ lesson_id kolom toegevoegd');
    }
    
    // Controleer de nieuwe tabel structuur
    console.log('\n🔍 Nieuwe tabel structuur controleren...');
    const { data: columns, error: columnsError } = await supabase
      .from('academy_ebooks')
      .select('*')
      .limit(1);
    
    if (columnsError) {
      console.log('❌ Fout bij controleren tabel structuur:', columnsError.message);
    } else if (columns && columns.length > 0) {
      const firstRecord = columns[0];
      console.log('📊 Beschikbare kolommen:');
      Object.keys(firstRecord).forEach(key => {
        console.log(`   ✅ ${key}: ${typeof firstRecord[key]}`);
      });
    }
    
    console.log('\n✅ Kolommen toegevoegd!');
    
  } catch (error) {
    console.error('❌ Fout:', error);
  }
}

addEbookColumns();
