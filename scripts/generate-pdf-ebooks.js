const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function generatePDFEbooks() {
  try {
    console.log('🚀 GENERATING PDF EBOOKS FOR MODULE 1');
    console.log('=====================================\n');

    // Check if public/books directory exists
    const booksDir = path.join(process.cwd(), 'public', 'books');
    if (!fs.existsSync(booksDir)) {
      console.error('❌ Books directory not found. Please run create-enhanced-ebooks.js first.');
      return;
    }

    // Get all HTML files for Module 1
    const htmlFiles = fs.readdirSync(booksDir)
      .filter(file => file.endsWith('.html') && file.includes('testosteron'))
      .map(file => ({
        filename: file,
        path: path.join(booksDir, file),
        pdfName: file.replace('.html', '.pdf')
      }));

    if (htmlFiles.length === 0) {
      console.error('❌ No HTML ebooks found for Module 1. Please run create-enhanced-ebooks.js first.');
      return;
    }

    console.log(`📚 Found ${htmlFiles.length} HTML ebooks for Module 1:`);
    htmlFiles.forEach(file => console.log(`   - ${file.filename}`));
    console.log('');

    // Launch browser
    console.log('🌐 Launching browser...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    let successCount = 0;
    let errorCount = 0;

    // Process each HTML file
    for (const file of htmlFiles) {
      try {
        console.log(`📖 Converting: ${file.filename}`);
        
        const page = await browser.newPage();
        
        // Set viewport for consistent rendering
        await page.setViewport({
          width: 1200,
          height: 1600,
          deviceScaleFactor: 2
        });

        // Load the HTML file
        const htmlContent = fs.readFileSync(file.path, 'utf8');
        await page.setContent(htmlContent, {
          waitUntil: 'networkidle0'
        });

        // Wait for content to render
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generate PDF
        const pdfPath = path.join(booksDir, file.pdfName);
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
          displayHeaderFooter: false
        });

        await page.close();

        console.log(`   ✅ PDF generated: ${file.pdfName}`);
        successCount++;

      } catch (error) {
        console.error(`   ❌ Error converting ${file.filename}:`, error.message);
        errorCount++;
      }
    }

    await browser.close();

    // Summary
    console.log('\n📊 PDF GENERATION SUMMARY');
    console.log('==========================');
    console.log(`Total PDFs generated: ${successCount}`);
    console.log(`Errors encountered: ${errorCount}`);
    console.log(`Success rate: ${successCount > 0 ? Math.round((successCount / (successCount + errorCount)) * 100) : 0}%`);

    if (successCount > 0) {
      console.log('\n🎯 PDF FEATURES:');
      console.log('==================');
      console.log('✅ High-quality A4 format');
      console.log('✅ Preserved styling and layout');
      console.log('✅ Print-friendly margins');
      console.log('✅ High-resolution rendering');
      console.log('✅ Ready for printing and sharing');
    }

    console.log('\n✅ PDF generation completed');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
generatePDFEbooks();
