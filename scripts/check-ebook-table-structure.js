const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkEbookTableStructure() {
  try {
    console.log('🔍 Academy ebooks tabel structuur controleren...\n');
    
    // Probeer alle kolommen op te halen
    const { data: ebooks, error } = await supabase
      .from('academy_ebooks')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Fout bij ophalen ebooks:', error.message);
      
      // Probeer de tabel structuur te achterhalen
      console.log('\n🔍 Probeer tabel informatie op te halen...');
      
      // Test verschillende kolom namen
      const testColumns = [
        'id', 'title', 'description', 'file_url', 'lesson_id', 
        'module_id', 'status', 'created_at', 'updated_at'
      ];
      
      for (const column of testColumns) {
        try {
          const { data, error: colError } = await supabase
            .from('academy_ebooks')
            .select(column)
            .limit(1);
          
          if (colError) {
            console.log(`   ❌ Kolom '${column}' bestaat niet`);
          } else {
            console.log(`   ✅ Kolom '${column}' bestaat`);
          }
        } catch (e) {
          console.log(`   ❌ Kolom '${column}' bestaat niet`);
        }
      }
      
    } else {
      console.log('✅ Ebooks tabel toegankelijk');
      
      if (ebooks && ebooks.length > 0) {
        const firstEbook = ebooks[0];
        console.log('\n📊 Beschikbare kolommen:');
        Object.keys(firstEbook).forEach(key => {
          console.log(`   ✅ ${key}: ${typeof firstEbook[key]}`);
        });
        
        console.log('\n📝 Voorbeeld ebook data:');
        console.log(JSON.stringify(firstEbook, null, 2));
      } else {
        console.log('   📝 Geen ebooks in de tabel');
      }
    }
    
  } catch (error) {
    console.error('❌ Fout:', error);
  }
}

checkEbookTableStructure();
