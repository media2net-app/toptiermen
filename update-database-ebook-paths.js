const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateDatabaseEbookPaths() {
  console.log('🔄 UPDATING DATABASE EBOOK PATHS...');
  
  try {
    // Get all ebooks from database
    const { data: ebooks, error } = await supabase
      .from('academy_ebooks')
      .select('*');

    if (error) {
      console.error('❌ Error fetching ebooks:', error);
      return;
    }

    console.log(`📊 Found ${ebooks.length} ebooks in database`);
    
    let updated = 0;
    let errors = 0;
    
    for (const ebook of ebooks) {
      try {
        // Extract the base filename from the current path
        const currentPath = ebook.path;
        const currentFilename = currentPath.split('/').pop();
        
        // Create new path with updated filename (remove -ebook suffix if present)
        let newFilename = currentFilename;
        if (newFilename.includes('-ebook.html')) {
          newFilename = newFilename.replace('-ebook.html', '.html');
        }
        
        const newPath = `/books/${newFilename}`;
        
        console.log(`📖 ${ebook.title}`);
        console.log(`   Old: ${currentPath}`);
        console.log(`   New: ${newPath}`);
        
        // Update the database
        const { error: updateError } = await supabase
          .from('academy_ebooks')
          .update({ path: newPath })
          .eq('id', ebook.id);
        
        if (updateError) {
          console.log(`   ❌ Error: ${updateError.message}`);
          errors++;
        } else {
          console.log(`   ✅ Updated successfully`);
          updated++;
        }
        
        console.log('---');
        
      } catch (error) {
        console.log(`❌ Error processing ${ebook.title}: ${error.message}`);
        errors++;
      }
    }
    
    console.log('');
    console.log('📊 UPDATE SUMMARY:');
    console.log(`✅ Successfully updated: ${updated} ebooks`);
    console.log(`❌ Errors: ${errors} ebooks`);
    console.log(`📁 Total processed: ${ebooks.length} ebooks`);
    
    if (updated > 0) {
      console.log('');
      console.log('🎉 DATABASE UPDATE COMPLETE!');
      console.log('📋 Next steps:');
      console.log('1. Run the audit again to verify');
      console.log('2. Test the Academy lessons');
      console.log('3. Verify all ebooks now have "Uitgebreide Samenvatting"');
    }
    
  } catch (error) {
    console.error('❌ Update failed:', error);
  }
}

updateDatabaseEbookPaths();
