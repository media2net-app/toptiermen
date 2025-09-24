const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function showEbooksPerModule() {
  console.log('🔍 SHOWING EBOOKS PER MODULE...');
  console.log('📋 This will show all ebooks organized by module');
  console.log('');
  
  try {
    // Get all ebooks
    const { data: ebooks, error } = await supabase
      .from('academy_ebooks')
      .select('*')
      .eq('status', 'active')
      .order('module')
      .order('title');

    if (error) {
      console.error('❌ Error fetching ebooks:', error);
      return;
    }

    console.log(`📊 Found ${ebooks.length} active ebooks`);
    console.log('');

    // Group by module
    const ebooksByModule = {};
    for (const ebook of ebooks) {
      if (!ebooksByModule[ebook.module]) {
        ebooksByModule[ebook.module] = [];
      }
      ebooksByModule[ebook.module].push(ebook);
    }

    // Display by module
    for (const [moduleName, moduleEbooks] of Object.entries(ebooksByModule)) {
      console.log(`📚 MODULE: ${moduleName}`);
      console.log(`📖 Ebooks: ${moduleEbooks.length}`);
      console.log('');

      for (const ebook of moduleEbooks) {
        console.log(`  📝 ${ebook.title}`);
        console.log(`  🆔 ID: ${ebook.id}`);
        console.log(`  📁 Filename: ${ebook.filename}`);
        console.log(`  🔗 Path: ${ebook.path}`);
        console.log(`  🌐 Full URL: https://platform.toptiermen.eu${ebook.path}`);
        console.log(`  📊 Status: ${ebook.status}`);
        console.log(`  🎨 Style: ${ebook.style_type}`);
        console.log('');
      }
      
      console.log('---');
      console.log('');
    }
    
    // Summary
    console.log('📊 SUMMARY:');
    console.log(`• Total modules: ${Object.keys(ebooksByModule).length}`);
    console.log(`• Total ebooks: ${ebooks.length}`);
    console.log('');
    
    // Check path distribution
    const ebookPaths = ebooks.filter(e => e.path.startsWith('/ebooks/')).length;
    const booksPaths = ebooks.filter(e => e.path.startsWith('/books/')).length;
    
    console.log('🔍 PATH DISTRIBUTION:');
    console.log(`• /ebooks/ paths: ${ebookPaths}`);
    console.log(`• /books/ paths: ${booksPaths}`);
    console.log('');
    
    if (ebookPaths > 0) {
      console.log('📁 EBOOKS PATHS:');
      ebooks.filter(e => e.path.startsWith('/ebooks/')).forEach(ebook => {
        console.log(`  ${ebook.module} - ${ebook.title}: ${ebook.path}`);
      });
      console.log('');
    }
    
    if (booksPaths > 0) {
      console.log('📁 BOOKS PATHS:');
      ebooks.filter(e => e.path.startsWith('/books/')).forEach(ebook => {
        console.log(`  ${ebook.module} - ${ebook.title}: ${ebook.path}`);
      });
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

showEbooksPerModule();
