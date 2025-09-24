const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixDatabasePathsToEbooks() {
  console.log('🔧 FIXING DATABASE PATHS TO /ebooks/...');
  console.log('📋 This will update all ebook paths from /books/ to /ebooks/');
  console.log('');
  
  try {
    // Get all ebooks from database
    const { data: ebooks, error } = await supabase
      .from('academy_ebooks')
      .select('*')
      .eq('status', 'active');

    if (error) {
      console.error('❌ Error fetching ebooks:', error);
      return;
    }

    console.log(`📊 Found ${ebooks.length} active ebooks in database`);
    console.log('');

    // Check what files actually exist in /ebooks/
    const ebooksDir = 'public/ebooks/';
    const existingEbooks = fs.readdirSync(ebooksDir).filter(file => file.endsWith('.html'));
    
    console.log(`📁 Found ${existingEbooks.length} files in /ebooks/ directory`);
    console.log('');

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const ebook of ebooks) {
      console.log(`📖 Processing: ${ebook.title}`);
      console.log(`🆔 ID: ${ebook.id}`);
      console.log(`📁 Current path: ${ebook.path}`);
      
      // Extract filename from current path
      const currentFilename = ebook.path.split('/').pop();
      console.log(`📄 Current filename: ${currentFilename}`);
      
      // Check if this file exists in /ebooks/
      if (existingEbooks.includes(currentFilename)) {
        const newPath = `/ebooks/${currentFilename}`;
        console.log(`✅ Found in /ebooks/: ${currentFilename}`);
        console.log(`🔄 Updating path to: ${newPath}`);
        
        // Update the database
        const { error: updateError } = await supabase
          .from('academy_ebooks')
          .update({ path: newPath })
          .eq('id', ebook.id);
        
        if (updateError) {
          console.log(`❌ Error updating ${ebook.title}: ${updateError.message}`);
        } else {
          console.log(`✅ Successfully updated ${ebook.title}`);
          updatedCount++;
        }
      } else {
        console.log(`❌ File not found in /ebooks/: ${currentFilename}`);
        notFoundCount++;
        
        // Try to find a similar file
        const similarFiles = existingEbooks.filter(file => 
          file.toLowerCase().includes(ebook.title.toLowerCase().split(' ')[0].toLowerCase()) ||
          file.toLowerCase().includes(ebook.module.toLowerCase().split(' ')[0].toLowerCase())
        );
        
        if (similarFiles.length > 0) {
          console.log(`🔍 Similar files found: ${similarFiles.join(', ')}`);
        }
      }
      
      console.log('---');
      console.log('');
    }
    
    console.log('📊 UPDATE SUMMARY:');
    console.log(`✅ Successfully updated: ${updatedCount}`);
    console.log(`❌ Not found in /ebooks/: ${notFoundCount}`);
    console.log(`📊 Total processed: ${ebooks.length}`);
    console.log('');
    
    if (updatedCount > 0) {
      console.log('🎉 SUCCESS! Database paths updated to /ebooks/');
      console.log('📋 You can now test the ebook links');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixDatabasePathsToEbooks();
