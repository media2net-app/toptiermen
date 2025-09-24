const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function auditAllEbooks() {
  console.log('🔍 AUDITING ALL ACADEMY EBOOKS...');
  console.log('📋 Fetching all ebook links from database...');
  
  try {
    // Fetch all ebooks from academy_ebooks table
    const { data: ebooks, error } = await supabase
      .from('academy_ebooks')
      .select(`
        id,
        title,
        file_url,
        status,
        lesson_id,
        academy_lessons!inner(
          id,
          title,
          module_id,
          academy_modules!inner(
            id,
            title,
            order_index
          )
        )
      `)
      .eq('status', 'published');

    if (error) {
      console.error('❌ Error fetching ebooks:', error);
      return;
    }

    console.log(`📊 Found ${ebooks.length} published ebooks`);
    console.log('');

    const results = [];
    
    for (const ebook of ebooks) {
      const module = ebook.academy_lessons.academy_modules;
      const lesson = ebook.academy_lessons;
      
      console.log(`📖 ${module.title} - ${lesson.title}`);
      console.log(`🔗 URL: ${ebook.file_url}`);
      
      // Check if file exists and get its length
      try {
        const response = await fetch(ebook.file_url);
        if (response.ok) {
          const content = await response.text();
          
          // Find the "Uitgebreide Samenvatting" section
          const summaryMatch = content.match(/📚 Uitgebreide Samenvatting van de Les[\s\S]*?(?=<div class="action-plan"|<\/div>|$)/);
          
          if (summaryMatch) {
            const summaryContent = summaryMatch[0];
            const lines = summaryContent.split('\n').length;
            const characters = summaryContent.length;
            
            const status = characters >= 21000 ? '✅ COMPLETE' : '❌ NEEDS EXPANSION';
            
            results.push({
              module: module.title,
              lesson: lesson.title,
              url: ebook.file_url,
              lines: lines,
              characters: characters,
              status: status,
              needsExpansion: characters < 21000
            });
            
            console.log(`📊 Lines: ${lines}, Characters: ${characters}`);
            console.log(`🎯 Status: ${status}`);
          } else {
            console.log('❌ No "Uitgebreide Samenvatting" section found');
            results.push({
              module: module.title,
              lesson: lesson.title,
              url: ebook.file_url,
              lines: 0,
              characters: 0,
              status: '❌ NO SUMMARY SECTION',
              needsExpansion: true
            });
          }
        } else {
          console.log(`❌ File not accessible: ${response.status}`);
          results.push({
            module: module.title,
            lesson: lesson.title,
            url: ebook.file_url,
            lines: 0,
            characters: 0,
            status: '❌ FILE NOT ACCESSIBLE',
            needsExpansion: true
          });
        }
      } catch (error) {
        console.log(`❌ Error checking file: ${error.message}`);
        results.push({
          module: module.title,
          lesson: lesson.title,
          url: ebook.file_url,
          lines: 0,
          characters: 0,
          status: '❌ ERROR CHECKING FILE',
          needsExpansion: true
        });
      }
      
      console.log('---');
    }
    
    // Summary
    console.log('');
    console.log('📊 AUDIT SUMMARY:');
    console.log(`Total ebooks: ${results.length}`);
    
    const complete = results.filter(r => r.status === '✅ COMPLETE').length;
    const needsExpansion = results.filter(r => r.needsExpansion).length;
    
    console.log(`✅ Complete (21,000+ chars): ${complete}`);
    console.log(`❌ Need expansion: ${needsExpansion}`);
    console.log('');
    
    if (needsExpansion > 0) {
      console.log('📋 EBOOKS THAT NEED EXPANSION:');
      results.filter(r => r.needsExpansion).forEach(ebook => {
        console.log(`• ${ebook.module} - ${ebook.lesson}`);
        console.log(`  URL: ${ebook.url}`);
        console.log(`  Characters: ${ebook.characters} (target: 21,000+)`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Audit failed:', error);
  }
}

auditAllEbooks();
