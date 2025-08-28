const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const fysiekeDominantieEbooks = [
  {
    htmlFile: 'fysieke-dominantie-waarom-is-fysieke-dominantie-zo-belangrijk--ebook.html',
    pdfFile: 'fysieke-dominantie-waarom-is-fysieke-dominantie-zo-belangrijk--ebook.pdf',
    title: 'Waarom is fysieke dominantie zo belangrijk?',
    subtitle: 'Module 3 - Les 1: Top Tier Men Academy'
  },
  {
    htmlFile: 'fysieke-dominantie-het-belang-van-kracht--spiermassa-en-conditie-ebook.html',
    pdfFile: 'fysieke-dominantie-het-belang-van-kracht--spiermassa-en-conditie-ebook.pdf',
    title: 'Het belang van kracht, spiermassa en conditie',
    subtitle: 'Module 3 - Les 2: Top Tier Men Academy'
  },
  {
    htmlFile: 'fysieke-dominantie--status--zelfrespect-en-aantrekkingskracht-ebook.html',
    pdfFile: 'fysieke-dominantie--status--zelfrespect-en-aantrekkingskracht-ebook.pdf',
    title: 'Status, Zelfrespect en Aantrekkingskracht',
    subtitle: 'Module 3 - Les 3: Top Tier Men Academy'
  },
  {
    htmlFile: 'fysieke-dominantie-vitaliteit-en-levensduur-ebook.html',
    pdfFile: 'fysieke-dominantie-vitaliteit-en-levensduur-ebook.pdf',
    title: 'Vitaliteit en Levensduur',
    subtitle: 'Module 3 - Les 4: Top Tier Men Academy'
  },
  {
    htmlFile: 'fysieke-dominantie-embrace-the-suck-ebook.html',
    pdfFile: 'fysieke-dominantie-embrace-the-suck-ebook.pdf',
    title: 'Embrace the Suck',
    subtitle: 'Module 3 - Les 5: Top Tier Men Academy'
  }
];

async function convertFysiekeDominantieToPDF() {
  try {
    console.log('📚 CONVERTING FYSIEKE DOMINANTIE EBOOKS TO PDF');
    console.log('==============================================\n');
    
    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const booksDir = path.join(__dirname, '../public/books');
    let successCount = 0;
    let errorCount = 0;
    
    console.log(`📖 Processing ${fysiekeDominantieEbooks.length} ebooks...\n`);
    
    for (const ebook of fysiekeDominantieEbooks) {
      try {
        console.log(`📄 Converting: ${ebook.title}`);
        
        const htmlPath = path.join(booksDir, ebook.htmlFile);
        const pdfPath = path.join(booksDir, ebook.pdfFile);
        
        // Check if HTML file exists
        if (!fs.existsSync(htmlPath)) {
          console.log(`   ❌ HTML file not found: ${ebook.htmlFile}`);
          errorCount++;
          continue;
        }
        
        const page = await browser.newPage();
        
        // Read the HTML file
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        // Set content and wait for fonts to load
        await page.setContent(htmlContent, {
          waitUntil: 'networkidle0'
        });
        
        // Wait for fonts to load
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Generate PDF with proper styling
        await page.pdf({
          path: pdfPath,
          format: 'A4',
          printBackground: true,
          margin: {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm'
          },
          displayHeaderFooter: false,
          preferCSSPageSize: true
        });
        
        // Get file size
        const stats = fs.statSync(pdfPath);
        const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        
        console.log(`   ✅ Generated: ${ebook.pdfFile} (${fileSizeInMB} MB)`);
        successCount++;
        
        await page.close();
        
      } catch (error) {
        console.error(`   ❌ Error converting ${ebook.title}:`, error.message);
        errorCount++;
      }
    }
    
    await browser.close();
    
    // Summary
    console.log('\n📊 CONVERSION SUMMARY');
    console.log('=====================');
    console.log(`📚 Total ebooks: ${fysiekeDominantieEbooks.length}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📈 Success rate: ${((successCount / fysiekeDominantieEbooks.length) * 100).toFixed(1)}%`);
    
    if (successCount === fysiekeDominantieEbooks.length) {
      console.log('\n🎉 All Fysieke Dominantie ebooks converted successfully!');
      console.log('✨ PDFs are ready for database update');
    } else {
      console.log('\n⚠️  Some conversions failed. Please check the errors above.');
    }
    
    console.log('\n📋 Generated PDF files:');
    fysiekeDominantieEbooks.forEach(ebook => {
      const pdfPath = path.join(booksDir, ebook.pdfFile);
      const exists = fs.existsSync(pdfPath);
      const status = exists ? '✅' : '❌';
      console.log(`   ${status} ${ebook.pdfFile}`);
    });
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('==============');
    console.log('1. Verify PDF quality and styling');
    console.log('2. Update database records to point to PDF files');
    console.log('3. Test PDF downloads');
    console.log('4. Remove old HTML files (after verification)');
    
  } catch (error) {
    console.error('❌ Error in conversion process:', error);
  }
}

// Run the conversion
convertFysiekeDominantieToPDF();
