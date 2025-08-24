const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generatePDF() {
  try {
    console.log('🔄 Starting PDF generation...');
    
    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Read the HTML file
    const htmlPath = path.join(__dirname, '../public/books/discipline-basis-ebook.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Set content and wait for fonts to load
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });
    
    // Wait a bit for fonts to load (using setTimeout instead of waitForTimeout)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate PDF
    const pdfPath = path.join(__dirname, '../public/books/discipline-basis-ebook.pdf');
    
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
    
    console.log('✅ PDF generated successfully!');
    console.log(`📄 PDF saved to: ${pdfPath}`);
    
    // Get file size
    const stats = fs.statSync(pdfPath);
    const fileSizeInBytes = stats.size;
    const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
    
    console.log(`📊 File size: ${fileSizeInMB} MB`);
    
    await browser.close();
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
  }
}

generatePDF();
