const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ebooks = [
  {
    htmlFile: 'discipline-basis-ebook.html',
    title: 'Wat is Discipline en waarom is dit Essentieel',
    subtitle: 'Module 1 - Les 1: Top Tier Men Academy'
  },
  {
    htmlFile: 'identiteit-definieren-ebook.html',
    title: 'Je Identiteit Definiëren',
    subtitle: 'Module 1 - Les 2: Top Tier Men Academy'
  },
  {
    htmlFile: 'discipline-levensstijl-ebook.html',
    title: 'Discipline van korte termijn naar een levensstijl',
    subtitle: 'Module 1 - Les 3: Top Tier Men Academy'
  },
  {
    htmlFile: 'identiteit-kernwaarden-ebook.html',
    title: 'Wat is Identiteit en Waarom zijn Kernwaarden Essentieel?',
    subtitle: 'Module 1 - Les 4: Top Tier Men Academy'
  },
  {
    htmlFile: 'kernwaarden-top-tier-ebook.html',
    title: 'Ontdek je kernwaarden en bouw je Top Tier identiteit',
    subtitle: 'Module 1 - Les 5: Top Tier Men Academy'
  }
];

function createCoverPageHTML(ebook) {
  return `
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${ebook.title} - Voorblad</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background-color: #232D1A;
            color: white;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 40px;
        }
        
        .cover-container {
            max-width: 800px;
            width: 100%;
        }
        
        .logo {
            margin-bottom: 60px;
        }
        
        .logo img {
            height: 120px;
            width: auto;
            max-width: 100%;
        }
        
        .title {
            font-size: 2.5rem;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 20px;
            color: #B6C948;
        }
        
        .subtitle {
            font-size: 1.2rem;
            font-weight: 400;
            color: #8BAE5A;
            margin-bottom: 40px;
        }
        
        .academy-info {
            font-size: 1rem;
            color: #B6C948;
            font-weight: 500;
            margin-top: 60px;
        }
        
        .date {
            font-size: 0.9rem;
            color: #8BAE5A;
            margin-top: 10px;
        }
        
        @media print {
            body {
                height: 100vh;
                page-break-after: always;
            }
        }
    </style>
</head>
<body>
    <div class="cover-container">
        <div class="logo">
            <img src="/logo_white-full.svg" alt="Top Tier Men Logo" />
        </div>
        
        <h1 class="title">${ebook.title}</h1>
        
        <p class="subtitle">${ebook.subtitle}</p>
        
        <div class="academy-info">
            Top Tier Men Academy
        </div>
        
        <div class="date">
            ${new Date().toLocaleDateString('nl-NL', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}
        </div>
    </div>
</body>
</html>
  `;
}

async function addCoverPageToPDF(ebook) {
  try {
    console.log(`📚 Adding cover page to: ${ebook.htmlFile}`);
    
    // Create cover page HTML
    const coverHTML = createCoverPageHTML(ebook);
    const coverPath = path.join(__dirname, '../public/books', `cover-${ebook.htmlFile.replace('.html', '')}.html`);
    fs.writeFileSync(coverPath, coverHTML);
    
    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Read the original HTML file
    const htmlPath = path.join(__dirname, '../public/books', ebook.htmlFile);
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Combine cover page with original content
    const combinedHTML = coverHTML + '\n' + htmlContent;
    
    // Set content and wait for fonts to load
    await page.setContent(combinedHTML, {
      waitUntil: 'networkidle0'
    });
    
    // Wait a bit for fonts to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate PDF with cover page
    const pdfFileName = ebook.htmlFile.replace('.html', '-with-cover.pdf');
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
    
    // Clean up cover HTML file
    fs.unlinkSync(coverPath);
    
    await browser.close();
    
    return pdfFileName;
    
  } catch (error) {
    console.error(`❌ Error adding cover page to ${ebook.htmlFile}:`, error.message);
    return null;
  }
}

async function addCoverPagesToAllPDFs() {
  try {
    console.log('🔄 Adding cover pages to all ebooks...');
    
    const generatedFiles = [];
    
    for (const ebook of ebooks) {
      const pdfFileName = await addCoverPageToPDF(ebook);
      if (pdfFileName) {
        generatedFiles.push(pdfFileName);
      }
    }
    
    console.log('\n🎉 All PDFs with cover pages generated successfully!');
    
    // List all generated PDFs
    console.log('\n📄 Generated PDFs with cover pages:');
    generatedFiles.forEach(file => {
      const stats = fs.statSync(path.join(__dirname, '../public/books', file));
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`   - ${file} (${fileSizeInMB} MB)`);
    });
    
    // Optionally replace original PDFs
    console.log('\n🔄 Replacing original PDFs with cover page versions...');
    for (const ebook of ebooks) {
      const originalPDF = ebook.htmlFile.replace('.html', '.pdf');
      const coverPDF = ebook.htmlFile.replace('.html', '-with-cover.pdf');
      
      const originalPath = path.join(__dirname, '../public/books', originalPDF);
      const coverPath = path.join(__dirname, '../public/books', coverPDF);
      
      if (fs.existsSync(coverPath)) {
        // Backup original
        const backupPath = path.join(__dirname, '../public/books', originalPDF.replace('.pdf', '-backup.pdf'));
        if (fs.existsSync(originalPath)) {
          fs.copyFileSync(originalPath, backupPath);
          console.log(`   📦 Backed up: ${originalPDF}`);
        }
        
        // Replace with cover version
        fs.copyFileSync(coverPath, originalPath);
        fs.unlinkSync(coverPath);
        console.log(`   ✅ Replaced: ${originalPDF}`);
      }
    }
    
    console.log('\n✅ All original PDFs have been updated with cover pages!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addCoverPagesToAllPDFs();
