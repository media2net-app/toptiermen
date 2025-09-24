const fs = require('fs');
const path = require('path');

async function auditLocalEbooks() {
  console.log('🔍 AUDITING LOCAL EBOOKS...');
  console.log('📋 Checking files in public/books/ directory');
  console.log('');
  
  try {
    const booksDir = 'public/books/';
    const files = fs.readdirSync(booksDir);
    const htmlFiles = files.filter(file => file.endsWith('.html'));
    
    console.log(`📊 Found ${htmlFiles.length} HTML files in /books/`);
    console.log('');
    
    const results = [];
    
    for (const file of htmlFiles) {
      const filePath = path.join(booksDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check if it has "Uitgebreide Samenvatting"
      if (content.includes('📚 Uitgebreide Samenvatting van de Les')) {
        // Find the summary section
        const summaryMatch = content.match(/📚 Uitgebreide Samenvatting van de Les[\s\S]*?(?=<div class="action-plan"|<\/div>|$)/);
        
        if (summaryMatch) {
          const summaryContent = summaryMatch[0];
          const lines = summaryContent.split('\n').length;
          const characters = summaryContent.length;
          
          const status = characters >= 21000 ? '✅ COMPLETE' : '❌ NEEDS EXPANSION';
          
          results.push({
            file: file,
            lines: lines,
            characters: characters,
            status: status,
            needsExpansion: characters < 21000
          });
          
          console.log(`📖 ${file}`);
          console.log(`📊 Lines: ${lines}, Characters: ${characters}`);
          console.log(`🎯 Status: ${status}`);
          console.log('');
        } else {
          console.log(`📖 ${file} - Has summary section but couldn't extract content`);
          results.push({
            file: file,
            lines: 0,
            characters: 0,
            status: '❌ EXTRACTION ERROR',
            needsExpansion: true
          });
        }
      } else {
        console.log(`📖 ${file} - No summary section found`);
        results.push({
          file: file,
          lines: 0,
          characters: 0,
          status: '❌ NO SUMMARY SECTION',
          needsExpansion: true
        });
      }
    }
    
    // Summary
    console.log('');
    console.log('📊 LOCAL AUDIT SUMMARY:');
    console.log(`Total files: ${results.length}`);
    
    const complete = results.filter(r => r.status === '✅ COMPLETE').length;
    const needsExpansion = results.filter(r => r.needsExpansion).length;
    
    console.log(`✅ Complete (21,000+ chars): ${complete}`);
    console.log(`❌ Need expansion: ${needsExpansion}`);
    console.log('');
    
    if (complete > 0) {
      console.log('📋 COMPLETE EBOOKS:');
      results.filter(r => r.status === '✅ COMPLETE').forEach(ebook => {
        console.log(`• ${ebook.file} (${ebook.characters} characters)`);
      });
      console.log('');
    }
    
    if (needsExpansion > 0) {
      console.log('📋 EBOOKS THAT NEED EXPANSION:');
      results.filter(r => r.needsExpansion).forEach(ebook => {
        console.log(`• ${ebook.file} (${ebook.characters} characters, target: 21,000+)`);
      });
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Local audit failed:', error);
  }
}

auditLocalEbooks();
