const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function manualEbookMapping() {
  console.log('🔧 MANUAL EBOOK MAPPING...');
  console.log('📋 Manually mapping remaining ebooks to correct /ebooks/ files');
  console.log('');
  
  // Manual mapping based on the analysis
  const mappings = [
    {
      id: 'b286d1d3-0e6b-4a7f-a4eb-fadfdaacc69c',
      title: 'Wat is Discipline en waarom is dit Essentieel',
      currentPath: '/books/discipline-identiteit-wat-is-discipline-en-waarom-is-dit-essentieel.html',
      newPath: '/ebooks/de-basis-van-discipline.html'
    },
    {
      id: 'a58c29a3-7d78-4c1a-b073-edac5d36a0da',
      title: 'Waarom is fysieke dominantie zo belangrijk?',
      currentPath: '/books/fysieke-dominantie-waarom-is-fysieke-dominantie-zo-belangrijk-.html',
      newPath: '/ebooks/waarom-is-fysieke-dominantie-zo-belangrijk.html'
    },
    {
      id: '8413aa3a-fb45-49fc-b4b2-5c99d82eb50a',
      title: 'Waarom een Brotherhood',
      currentPath: '/books/brotherhood-waarom-een-brotherhood.html',
      newPath: '/ebooks/waarom-een-brotherhood.html'
    },
    {
      id: '62520505-4274-435f-9a4e-3545b6f8fa3a',
      title: 'De Financiële Mindset',
      currentPath: '/books/business-and-finance--de-financi-le-mindset-.html',
      newPath: '/ebooks/de-financile-mindset.html'
    },
    {
      id: '2e3bf8a6-8b69-4311-b30f-7562c6101454',
      title: 'Wat is mentale kracht',
      currentPath: '/books/mentale-kracht-weerbaarheid-wat-is-mentale-kracht.html',
      newPath: '/ebooks/wat-is-mentale-kracht.html'
    },
    {
      id: '1ff675df-405c-4484-8c3a-52f32f362142',
      title: 'Cut The Weak - Brotherhood',
      currentPath: '/books/cut-the-weak-enhanced.html',
      newPath: '/ebooks/cut-the-weak.html'
    },
    {
      id: 'eed761c9-2416-44b3-982f-529f1aa277d8',
      title: 'De Basisprincipes van Voeding',
      currentPath: '/books/de-basisprincipes-van-voeding-enhanced.html',
      newPath: '/ebooks/de-basisprincipes-van-voeding.html'
    },
    {
      id: 'f082f9fb-c8c3-40e6-9e3f-d7fdd63441ab',
      title: 'De Waarheid over Testosteron Doping',
      currentPath: '/books/testosteron-doping-enhanced.html',
      newPath: '/ebooks/de-waarheid-over-testosteron-doping.html'
    },
    {
      id: 'dc2ac0d8-c573-46ea-b765-d7effd19b654',
      title: 'Wat is Testosteron - Basis',
      currentPath: '/books/testosteron-basis.html',
      newPath: '/ebooks/wat-is-testosteron.html' // Using the main testosteron file
    },
    {
      id: 'f5438a52-39c9-4fa2-b510-264cd010300d',
      title: 'De Basis van Discipline',
      currentPath: '/books/discipline-basis.html',
      newPath: '/ebooks/de-basis-van-discipline.html'
    }
  ];
  
  try {
    console.log(`📊 Processing ${mappings.length} manual mappings...`);
    console.log('');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const mapping of mappings) {
      console.log(`📖 Processing: ${mapping.title}`);
      console.log(`🆔 ID: ${mapping.id}`);
      console.log(`📁 Current: ${mapping.currentPath}`);
      console.log(`🔄 New: ${mapping.newPath}`);
      
      // Update the database
      const { error: updateError } = await supabase
        .from('academy_ebooks')
        .update({ path: mapping.newPath })
        .eq('id', mapping.id);
      
      if (updateError) {
        console.log(`❌ Error updating ${mapping.title}: ${updateError.message}`);
        errorCount++;
      } else {
        console.log(`✅ Successfully updated ${mapping.title}`);
        successCount++;
      }
      
      console.log('---');
      console.log('');
    }
    
    console.log('📊 MANUAL MAPPING SUMMARY:');
    console.log(`✅ Successfully updated: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total processed: ${mappings.length}`);
    console.log('');
    
    if (successCount > 0) {
      console.log('🎉 SUCCESS! All ebook paths updated to /ebooks/');
      console.log('📋 You can now test all ebook links');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

manualEbookMapping();
