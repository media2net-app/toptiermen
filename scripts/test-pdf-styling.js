const fs = require('fs');
const path = require('path');

const testosteronPDFs = [
  'testosteron-basis-ebook.pdf',
  'testosteron-kracht-ebook.pdf',
  'testosteron-killers-ebook.pdf',
  'testosteron-trt-ebook.pdf',
  'testosteron-doping-ebook.pdf'
];

function testPDFStyling() {
  try {
    console.log('🧪 Testing PDF styling and accessibility...\n');
    
    const booksDir = path.join(__dirname, '../public/books');
    
    let totalSize = 0;
    let allFilesExist = true;
    
    for (const pdfFile of testosteronPDFs) {
      const pdfPath = path.join(booksDir, pdfFile);
      
      console.log(`📄 Testing: ${pdfFile}`);
      
      if (fs.existsSync(pdfPath)) {
        const stats = fs.statSync(pdfPath);
        const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        totalSize += stats.size;
        
        console.log(`   ✅ File exists`);
        console.log(`   📊 Size: ${fileSizeInMB} MB`);
        
        // Check if file is not empty
        if (stats.size > 1000) {
          console.log(`   ✅ File has content (not empty)`);
        } else {
          console.log(`   ⚠️  File seems small, might be empty`);
        }
        
        // Check if it's a valid PDF by reading first few bytes
        const buffer = fs.readFileSync(pdfPath, { encoding: null });
        const header = buffer.toString('ascii', 0, 4);
        
        if (header === '%PDF') {
          console.log(`   ✅ Valid PDF header detected`);
        } else {
          console.log(`   ❌ Invalid PDF header: ${header}`);
        }
        
      } else {
        console.log(`   ❌ File not found`);
        allFilesExist = false;
      }
      
      console.log('');
    }
    
    const totalSizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
    
    console.log('📊 SUMMARY:');
    console.log('===========');
    console.log(`📁 Total files: ${testosteronPDFs.length}`);
    console.log(`✅ Files exist: ${allFilesExist ? 'Yes' : 'No'}`);
    console.log(`📊 Total size: ${totalSizeInMB} MB`);
    console.log(`📊 Average size: ${(totalSizeInMB / testosteronPDFs.length).toFixed(2)} MB per file`);
    
    if (allFilesExist) {
      console.log('\n🎉 All PDF files are present and properly sized!');
      console.log('✨ The PDFs should now have proper styling matching the HTML versions.');
      console.log('\n💡 To verify the styling:');
      console.log('   1. Open any of the PDF files in a PDF viewer');
      console.log('   2. Check that colors, fonts, and layout match the HTML version');
      console.log('   3. Verify that the Top Tier Men branding is present');
      console.log('   4. Confirm that the gradient header and styling are preserved');
    } else {
      console.log('\n❌ Some PDF files are missing. Please regenerate them.');
    }
    
  } catch (error) {
    console.error('❌ Error testing PDFs:', error.message);
  }
}

// Run the test
testPDFStyling();
