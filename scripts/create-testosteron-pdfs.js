const fs = require('fs');
const path = require('path');

// Function to create a simple PDF content from HTML
function createPDFContent(title, content) {
  return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
/F2 6 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length ${content.length + 500}
>>
stream
BT
/F1 16 Tf
72 720 Td
(${title}) Tj
0 -30 Td
/F2 12 Tf
(Top Tier Men Academy) Tj
0 -30 Td
() Tj
0 -20 Td
${content}
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica-Bold
>>
endobj

6 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
0000000304 00000 n 
0000000404 00000 n 
trailer
<<
/Size 7
/Root 1 0 R
>>
startxref
${content.length + 600}
%%EOF`;
}

// Function to extract text content from HTML
function extractTextFromHTML(htmlContent) {
  // Remove HTML tags and extract text
  let text = htmlContent
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Split into lines and format for PDF
  const lines = text.split(' ').reduce((acc, word) => {
    if (acc.length === 0 || acc[acc.length - 1].length + word.length > 60) {
      acc.push(word);
    } else {
      acc[acc.length - 1] += ' ' + word;
    }
    return acc;
  }, []);
  
  return lines.map(line => `(${line}) Tj\n0 -20 Td`).join('\n');
}

async function createTestosteronPDFs() {
  try {
    console.log('📚 Creating PDF files for Testosteron ebooks...\n');

    const ebooks = [
      {
        htmlFile: 'testosteron-basis-ebook.html',
        pdfFile: 'testosteron-basis-ebook.pdf',
        title: 'Wat is Testosteron'
      },
      {
        htmlFile: 'testosteron-kracht-ebook.html',
        pdfFile: 'testosteron-kracht-ebook.pdf',
        title: 'De Kracht van Hoog Testosteron'
      },
      {
        htmlFile: 'testosteron-killers-ebook.html',
        pdfFile: 'testosteron-killers-ebook.pdf',
        title: 'Testosteron Killers: Wat moet je Elimineren'
      },
      {
        htmlFile: 'testosteron-trt-ebook.html',
        pdfFile: 'testosteron-trt-ebook.pdf',
        title: 'TRT en mijn Visie'
      },
      {
        htmlFile: 'testosteron-doping-ebook.html',
        pdfFile: 'testosteron-doping-ebook.pdf',
        title: 'De Waarheid over Testosteron Doping'
      }
    ];

    const booksDir = path.join(__dirname, '../public/books');

    for (const ebook of ebooks) {
      console.log(`📖 Processing: ${ebook.title}`);
      
      const htmlPath = path.join(booksDir, ebook.htmlFile);
      const pdfPath = path.join(booksDir, ebook.pdfFile);
      
      // Check if HTML file exists
      if (!fs.existsSync(htmlPath)) {
        console.log(`   ❌ HTML file not found: ${ebook.htmlFile}`);
        continue;
      }
      
      // Read HTML content
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      
      // Extract text content
      const textContent = extractTextFromHTML(htmlContent);
      
      // Create PDF content
      const pdfContent = createPDFContent(ebook.title, textContent);
      
      // Write PDF file
      fs.writeFileSync(pdfPath, pdfContent);
      
      console.log(`   ✅ Created: ${ebook.pdfFile}`);
    }

    console.log('\n🎉 All Testosteron PDF files created successfully!');
    console.log('\n📋 Created PDF files:');
    ebooks.forEach(ebook => {
      console.log(`   - ${ebook.pdfFile}`);
    });

  } catch (error) {
    console.error('❌ Error creating PDF files:', error);
  }
}

createTestosteronPDFs();
