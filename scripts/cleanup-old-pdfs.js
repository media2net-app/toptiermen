const fs = require('fs');
const path = require('path');

// Files to keep (the new properly styled ones)
const filesToKeep = [
  'testosteron-basis-ebook.pdf',
  'testosteron-kracht-ebook.pdf',
  'testosteron-killers-ebook.pdf',
  'testosteron-trt-ebook.pdf',
  'testosteron-doping-ebook.pdf'
];

// Files to remove (old simple PDFs)
const filesToRemove = [
  'testosteron-basis-ebook-old.pdf',
  'testosteron-kracht-ebook-old.pdf',
  'testosteron-killers-ebook-old.pdf',
  'testosteron-trt-ebook-old.pdf',
  'testosteron-doping-ebook-old.pdf'
];

function cleanupOldPDFs() {
  try {
    console.log('🧹 Cleaning up old PDF files...\n');
    
    const booksDir = path.join(__dirname, '../public/books');
    
    // First, backup old files by renaming them
    console.log('📋 Backing up old files...');
    for (const oldFile of filesToRemove) {
      const oldPath = path.join(booksDir, oldFile);
      const backupPath = path.join(booksDir, oldFile.replace('.pdf', '-backup.pdf'));
      
      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, backupPath);
        console.log(`   ✅ Backed up: ${oldFile} → ${oldFile.replace('.pdf', '-backup.pdf')}`);
      }
    }
    
    // Verify new files exist
    console.log('\n📋 Verifying new styled PDFs...');
    let allNewFilesExist = true;
    
    for (const newFile of filesToKeep) {
      const newPath = path.join(booksDir, newFile);
      
      if (fs.existsSync(newPath)) {
        const stats = fs.statSync(newPath);
        const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`   ✅ ${newFile} (${fileSizeInMB} MB)`);
      } else {
        console.log(`   ❌ ${newFile} - MISSING!`);
        allNewFilesExist = false;
      }
    }
    
    if (allNewFilesExist) {
      console.log('\n🎉 All new styled PDFs are present!');
      console.log('✨ The cleanup is complete.');
      
      console.log('\n📊 SUMMARY:');
      console.log('===========');
      console.log(`📁 New files: ${filesToKeep.length}`);
      console.log(`🗑️  Old files backed up: ${filesToRemove.length}`);
      console.log(`✅ All new files present: Yes`);
      
      console.log('\n💡 Next steps:');
      console.log('   1. Test the PDFs in the academy to ensure they load correctly');
      console.log('   2. Verify the styling matches the HTML versions');
      console.log('   3. Check that users can download the properly styled PDFs');
      
    } else {
      console.log('\n❌ Some new files are missing. Please regenerate them first.');
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
  }
}

// Run the cleanup
cleanupOldPDFs();
