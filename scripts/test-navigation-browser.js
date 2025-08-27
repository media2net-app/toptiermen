// Browser Navigation Test Script
// Run with: node scripts/test-navigation-browser.js

const puppeteer = require('puppeteer');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  testPages: [
    '/dashboard',
    '/dashboard/mijn-profiel',
    '/dashboard/inbox',
    '/dashboard/mijn-missies',
    '/dashboard/challenges',
    '/dashboard/mijn-trainingen',
    '/dashboard/voedingsplannen',
    '/dashboard/finance-en-business',
    '/dashboard/academy',
    '/dashboard/trainingscentrum',
    '/dashboard/mind-en-focus',
    '/dashboard/brotherhood',
    '/dashboard/boekenkamer',
    '/dashboard/badges-en-rangen',
    '/dashboard/producten',
    '/dashboard/mentorship-en-coaching'
  ]
};

// Test results
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// Test navigation in browser
async function testNavigation() {
  console.log('🚀 Browser Navigation Test Suite\n');
  console.log('=' .repeat(50));
  
  let browser;
  try {
    // Launch browser
    console.log('🔍 Launching browser...');
    browser = await puppeteer.launch({ 
      headless: false, // Show browser for debugging
      slowMo: 1000, // Slow down for visibility
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 720 });
    
    // Navigate to dashboard
    console.log('🔍 Navigating to dashboard...');
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`, { waitUntil: 'networkidle2' });
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Test each page
    for (const testPage of TEST_CONFIG.testPages) {
      try {
        console.log(`🔍 Testing navigation to: ${testPage}`);
        
        // Navigate to the page
        await page.goto(`${TEST_CONFIG.baseUrl}${testPage}`, { waitUntil: 'networkidle2' });
        
        // Wait for content to load
        await page.waitForTimeout(2000);
        
        // Check if page loaded correctly
        const pageTitle = await page.title();
        const hasContent = await page.evaluate(() => {
          return document.body.textContent.includes('Top Tier Men');
        });
        
        const success = pageTitle.includes('Top Tier Men') && hasContent;
        
        console.log(`${success ? '✅' : '❌'} ${testPage}: ${pageTitle}`);
        
        if (success) {
          testResults.passed++;
        } else {
          testResults.failed++;
          testResults.errors.push(`${testPage}: Title: ${pageTitle}, Has content: ${hasContent}`);
        }
        
        testResults.total++;
        
        // Take screenshot for debugging
        await page.screenshot({ 
          path: `test-screenshots${testPage.replace(/\//g, '-')}.png`,
          fullPage: true 
        });
        
      } catch (error) {
        console.log(`❌ ${testPage}: Error - ${error.message}`);
        testResults.failed++;
        testResults.errors.push(`${testPage}: ${error.message}`);
        testResults.total++;
      }
    }
    
    // Test sidebar navigation
    console.log('\n🔍 Testing sidebar navigation...');
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    // Test clicking on a sidebar link
    try {
      await page.click('a[href="/dashboard/trainingscentrum"]');
      await page.waitForTimeout(3000);
      
      const currentUrl = page.url();
      const success = currentUrl.includes('/dashboard/trainingscentrum');
      
      console.log(`${success ? '✅' : '❌'} Sidebar navigation: ${currentUrl}`);
      
      if (success) {
        testResults.passed++;
      } else {
        testResults.failed++;
        testResults.errors.push(`Sidebar navigation: Expected /dashboard/trainingscentrum, got ${currentUrl}`);
      }
      
      testResults.total++;
      
    } catch (error) {
      console.log(`❌ Sidebar navigation: Error - ${error.message}`);
      testResults.failed++;
      testResults.errors.push(`Sidebar navigation: ${error.message}`);
      testResults.total++;
    }
    
  } catch (error) {
    console.error('❌ Browser test failed:', error);
    testResults.failed++;
    testResults.errors.push(`Browser test: ${error.message}`);
    testResults.total++;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  // Print results
  console.log('\n' + '=' .repeat(50));
  console.log('📊 Test Results:');
  console.log(`Total: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ Errors:');
    testResults.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  console.log('\n🎯 Next Steps:');
  if (testResults.failed > 0) {
    console.log('1. Check the screenshots in test-screenshots/ for visual debugging');
    console.log('2. Review the errors above');
    console.log('3. Fix the navigation issues');
    console.log('4. Run this test again');
  } else {
    console.log('1. ✅ All navigation tests passed!');
    console.log('2. Navigation is working correctly in the browser');
    console.log('3. Check the screenshots to verify visual appearance');
  }
}

// Run the test
testNavigation().catch(console.error);

