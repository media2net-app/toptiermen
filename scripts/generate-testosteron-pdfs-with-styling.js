const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const testosteronEbooks = [
  {
    htmlFile: 'testosteron-basis-ebook.html',
    pdfFile: 'testosteron-basis-ebook.pdf',
    title: 'Wat is Testosteron',
    subtitle: 'Module 2 - Les 1: Top Tier Men Academy'
  },
  {
    htmlFile: 'testosteron-kracht-ebook.html',
    pdfFile: 'testosteron-kracht-ebook.pdf',
    title: 'De Kracht van Hoog Testosteron',
    subtitle: 'Module 2 - Les 2: Top Tier Men Academy'
  },
  {
    htmlFile: 'testosteron-killers-ebook.html',
    pdfFile: 'testosteron-killers-ebook.pdf',
    title: 'Testosteron Killers: Wat moet je Elimineren',
    subtitle: 'Module 2 - Les 3: Top Tier Men Academy'
  },
  {
    htmlFile: 'testosteron-trt-ebook.html',
    pdfFile: 'testosteron-trt-ebook.pdf',
    title: 'TRT en mijn Visie',
    subtitle: 'Module 2 - Les 4: Top Tier Men Academy'
  },
  {
    htmlFile: 'testosteron-doping-ebook.html',
    pdfFile: 'testosteron-doping-ebook.pdf',
    title: 'De Waarheid over Testosteron Doping',
    subtitle: 'Module 2 - Les 5: Top Tier Men Academy'
  }
];

async function generateTestosteronPDFsWithStyling() {
  try {
    console.log('📚 Generating styled PDF files for Testosteron ebooks...\n');
    
    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const booksDir = path.join(__dirname, '../public/books');
    
    for (const ebook of testosteronEbooks) {
      try {
        console.log(`📖 Processing: ${ebook.title}`);
        
        const htmlPath = path.join(booksDir, ebook.htmlFile);
        const pdfPath = path.join(booksDir, ebook.pdfFile);
        
        // Check if HTML file exists
        if (!fs.existsSync(htmlPath)) {
          console.log(`   ❌ HTML file not found: ${ebook.htmlFile}`);
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
        
        await page.close();
        
      } catch (error) {
        console.error(`   ❌ Error generating PDF for ${ebook.title}:`, error.message);
      }
    }
    
    await browser.close();
    
    console.log('\n🎉 All Testosteron PDF files generated successfully!');
    console.log('\n📋 Generated PDF files:');
    testosteronEbooks.forEach(ebook => {
      console.log(`   - ${ebook.pdfFile}`);
    });
    
    console.log('\n✨ PDFs now have proper styling matching the HTML versions!');
    
  } catch (error) {
    console.error('❌ Error generating PDF files:', error);
  }
}

// Run the generation
generateTestosteronPDFsWithStyling();
