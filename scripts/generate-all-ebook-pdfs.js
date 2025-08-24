const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ebooks = [
  'discipline-basis-ebook.html',
  'identiteit-definieren-ebook.html',
  'discipline-levensstijl-ebook.html',
  'identiteit-kernwaarden-ebook.html',
  'kernwaarden-top-tier-ebook.html'
];

async function generateAllPDFs() {
  try {
    console.log('🔄 Starting PDF generation for all ebooks...');
    
    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    for (const htmlFile of ebooks) {
      try {
        console.log(`📚 Generating PDF for: ${htmlFile}`);
        
        const page = await browser.newPage();
        
        // Read the HTML file
        const htmlPath = path.join(__dirname, '../public/books', htmlFile);
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        // Set content and wait for fonts to load
        await page.setContent(htmlContent, {
          waitUntil: 'networkidle0'
        });
        
        // Wait a bit for fonts to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate PDF
        const pdfFileName = htmlFile.replace('.html', '.pdf');
        const pdfPath = path.join(__dirname, '../public/books', pdfFileName);
        
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
        
        console.log(`✅ Generated: ${pdfFileName} (${fileSizeInMB} MB)`);
        
        await page.close();
        
      } catch (error) {
        console.error(`❌ Error generating PDF for ${htmlFile}:`, error.message);
      }
    }
    
    await browser.close();
    
    console.log('\n🎉 All PDFs generated successfully!');
    
    // List all generated PDFs
    console.log('\n📄 Generated PDFs:');
    const pdfFiles = fs.readdirSync(path.join(__dirname, '../public/books'))
      .filter(file => file.endsWith('.pdf'))
      .sort();
    
    pdfFiles.forEach(file => {
      const stats = fs.statSync(path.join(__dirname, '../public/books', file));
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`   - ${file} (${fileSizeInMB} MB)`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

generateAllPDFs();
