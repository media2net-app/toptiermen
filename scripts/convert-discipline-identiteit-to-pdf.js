const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const disciplineIdentiteitEbooks = [
  {
    htmlFile: 'identiteit-definieren-ebook.html',
    pdfFile: 'identiteit-definieren-ebook.pdf',
    title: 'Je Identiteit Definiëren',
    subtitle: 'Module 2 - Les 2: Top Tier Men Academy'
  },
  {
    htmlFile: 'discipline-levensstijl-ebook.html',
    pdfFile: 'discipline-levensstijl-ebook.pdf',
    title: 'Discipline van korte termijn naar een levensstijl',
    subtitle: 'Module 2 - Les 3: Top Tier Men Academy'
  },
  {
    htmlFile: 'identiteit-kernwaarden-ebook.html',
    pdfFile: 'identiteit-kernwaarden-ebook.pdf',
    title: 'Wat is Identiteit en Waarom zijn Kernwaarden Essentieel?',
    subtitle: 'Module 2 - Les 4: Top Tier Men Academy'
  },
  {
    htmlFile: 'kernwaarden-top-tier-ebook.html',
    pdfFile: 'kernwaarden-top-tier-ebook.pdf',
    title: 'Ontdek je kernwaarden en bouw je Top Tier identiteit',
    subtitle: 'Module 2 - Les 5: Top Tier Men Academy'
  }
];

async function convertDisciplineIdentiteitToPDF() {
  try {
    console.log('📚 CONVERTING DISCIPLINE & IDENTITEIT EBOOKS TO PDF');
    console.log('==================================================\n');
    
    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const booksDir = path.join(__dirname, '../public/books');
    let successCount = 0;
    let errorCount = 0;
    
    console.log(`📖 Processing ${disciplineIdentiteitEbooks.length} ebooks...\n`);
    
    for (const ebook of disciplineIdentiteitEbooks) {
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
    console.log(`📚 Total ebooks: ${disciplineIdentiteitEbooks.length}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📈 Success rate: ${((successCount / disciplineIdentiteitEbooks.length) * 100).toFixed(1)}%`);
    
    if (successCount === disciplineIdentiteitEbooks.length) {
      console.log('\n🎉 All Discipline & Identiteit ebooks converted successfully!');
      console.log('✨ PDFs are ready for database update');
    } else {
      console.log('\n⚠️  Some conversions failed. Please check the errors above.');
    }
    
    console.log('\n📋 Generated PDF files:');
    disciplineIdentiteitEbooks.forEach(ebook => {
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
convertDisciplineIdentiteitToPDF();
