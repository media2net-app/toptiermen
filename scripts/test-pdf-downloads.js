const http = require('http');

async function testPDFDownloads() {
  try {
    console.log('🧪 Testing PDF downloads for Testosteron ebooks...\n');

    const pdfFiles = [
      '/books/testosteron-basis-ebook.pdf',
      '/books/testosteron-kracht-ebook.pdf',
      '/books/testosteron-killers-ebook.pdf',
      '/books/testosteron-trt-ebook.pdf',
      '/books/testosteron-doping-ebook.pdf'
    ];

    for (const pdfFile of pdfFiles) {
      console.log(`📄 Testing: ${pdfFile}`);
      
      try {
        const result = await makeRequest(pdfFile, 'GET');
        
        if (result.statusCode === 200) {
          console.log(`   ✅ Success: ${pdfFile} is accessible`);
          console.log(`   📊 File size: ${result.data.length} bytes`);
        } else {
          console.log(`   ❌ Failed: HTTP ${result.statusCode}`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
      
      console.log('');
    }

    // Test a known working PDF for comparison
    console.log('🔍 Testing known working PDF for comparison...');
    try {
      const disciplineResult = await makeRequest('/books/discipline-basis-ebook.pdf', 'GET');
      if (disciplineResult.statusCode === 200) {
        console.log('   ✅ Discipline PDF works (for comparison)');
        console.log(`   📊 File size: ${disciplineResult.data.length} bytes`);
      }
    } catch (error) {
      console.log(`   ❌ Discipline PDF error: ${error.message}`);
    }

    console.log('\n🎉 PDF download test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

function makeRequest(path, method) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Accept': 'application/pdf'
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData
        });
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

testPDFDownloads();
