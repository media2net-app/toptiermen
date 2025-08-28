const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const businessFinanceEbooks = [
  {
    htmlFile: 'business-and-finance--de-financi-le-mindset--ebook.html',
    pdfFile: 'business-and-finance--de-financi-le-mindset--ebook.pdf',
    title: 'De Financiële Mindset',
    subtitle: 'Module 5 - Les 1: Top Tier Men Academy'
  },
  {
    htmlFile: 'business-and-finance--grip-op-je-geld-ebook.html',
    pdfFile: 'business-and-finance--grip-op-je-geld-ebook.pdf',
    title: 'Grip op je geld',
    subtitle: 'Module 5 - Les 2: Top Tier Men Academy'
  },
  {
    htmlFile: 'business-and-finance--van-werknemer-naar-eigen-verdienmodellen-ebook.html',
    pdfFile: 'business-and-finance--van-werknemer-naar-eigen-verdienmodellen-ebook.pdf',
    title: 'Van Werknemer naar eigen Verdienmodellen',
    subtitle: 'Module 5 - Les 3: Top Tier Men Academy'
  },
  {
    htmlFile: 'business-and-finance--vermogen-opbouwen-begin-met-investeren-ebook.html',
    pdfFile: 'business-and-finance--vermogen-opbouwen-begin-met-investeren-ebook.pdf',
    title: 'Vermogen Opbouwen Begin met Investeren',
    subtitle: 'Module 5 - Les 4: Top Tier Men Academy'
  },
  {
    htmlFile: 'business-and-finance--financi-le-vrijheid-en-legacy--ebook.html',
    pdfFile: 'business-and-finance--financi-le-vrijheid-en-legacy--ebook.pdf',
    title: 'Financiële Vrijheid en Legacy',
    subtitle: 'Module 5 - Les 5: Top Tier Men Academy'
  }
];

async function convertBusinessFinanceToPDF() {
  try {
    console.log('📚 CONVERTING BUSINESS AND FINANCE EBOOKS TO PDF');
    console.log('================================================\n');
    
    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const booksDir = path.join(__dirname, '../public/books');
    let successCount = 0;
    let errorCount = 0;
    
    console.log(`📖 Processing ${businessFinanceEbooks.length} ebooks...\n`);
    
    for (const ebook of businessFinanceEbooks) {
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
    console.log(`📚 Total ebooks: ${businessFinanceEbooks.length}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📈 Success rate: ${((successCount / businessFinanceEbooks.length) * 100).toFixed(1)}%`);
    
    if (successCount === businessFinanceEbooks.length) {
      console.log('\n🎉 All Business and Finance ebooks converted successfully!');
      console.log('✨ PDFs are ready for database update');
    } else {
      console.log('\n⚠️  Some conversions failed. Please check the errors above.');
    }
    
    console.log('\n📋 Generated PDF files:');
    businessFinanceEbooks.forEach(ebook => {
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
convertBusinessFinanceToPDF();
