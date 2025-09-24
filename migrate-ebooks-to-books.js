const fs = require('fs');
const path = require('path');

async function migrateEbooksToBooks() {
  console.log('🔄 MIGRATING EBOOKS FROM /ebooks/ TO /books/...');
  
  try {
    // Read all files from /ebooks/ directory
    const ebooksDir = 'public/ebooks/';
    const booksDir = 'public/books/';
    
    const files = fs.readdirSync(ebooksDir);
    console.log(`📁 Found ${files.length} files in /ebooks/`);
    
    let migrated = 0;
    let errors = 0;
    
    for (const file of files) {
      if (file.endsWith('.html')) {
        try {
          const sourcePath = path.join(ebooksDir, file);
          const targetPath = path.join(booksDir, file);
          
          // Read the updated content
          const content = fs.readFileSync(sourcePath, 'utf8');
          
          // Check if it has "Uitgebreide Samenvatting"
          if (content.includes('📚 Uitgebreide Samenvatting van de Les')) {
            // Copy to /books/ directory
            fs.writeFileSync(targetPath, content);
            console.log(`✅ Migrated: ${file}`);
            migrated++;
          } else {
            console.log(`⚠️ Skipped ${file} (no summary section)`);
          }
        } catch (error) {
          console.log(`❌ Error migrating ${file}: ${error.message}`);
          errors++;
        }
      }
    }
    
    console.log('');
    console.log('📊 MIGRATION SUMMARY:');
    console.log(`✅ Successfully migrated: ${migrated} files`);
    console.log(`❌ Errors: ${errors} files`);
    console.log(`📁 Total files processed: ${files.length}`);
    
    if (migrated > 0) {
      console.log('');
      console.log('🎉 MIGRATION COMPLETE!');
      console.log('📋 Next steps:');
      console.log('1. Run the audit again to verify');
      console.log('2. Test the Academy lessons');
      console.log('3. Verify all ebooks have "Uitgebreide Samenvatting"');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

migrateEbooksToBooks();
