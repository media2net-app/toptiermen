const fetch = require('node-fetch');

async function testDashboardFlickering() {
  console.log('🧪 Testing Dashboard Flickering Issue...\n');

  try {
    // Test 1: Check if dashboard loads
    console.log('1️⃣ Testing Dashboard Page Loading...');
    const response = await fetch('http://localhost:3000/dashboard');
    const html = await response.text();
    
    console.log('   📊 Response status:', response.status);
    console.log('   📊 Content length:', html.length);
    
    // Check for loading indicators
    const hasLoadingText = html.includes('Laden...');
    const hasLoadingSpinner = html.includes('animate-spin');
    const hasDashboardContent = html.includes('Dashboard') || html.includes('dashboard');
    const hasBodyContent = html.includes('<body') && html.includes('</body>');
    
    console.log('   📊 Content analysis:');
    console.log(`      - Loading text: ${hasLoadingText ? '❌ FOUND' : '✅ NOT FOUND'}`);
    console.log(`      - Loading spinner: ${hasLoadingSpinner ? '❌ FOUND' : '✅ NOT FOUND'}`);
    console.log(`      - Dashboard content: ${hasDashboardContent ? '✅ FOUND' : '❌ NOT FOUND'}`);
    console.log(`      - Body content: ${hasBodyContent ? '✅ FOUND' : '❌ NOT FOUND'}`);
    
    // Check for specific dashboard elements
    const hasSidebar = html.includes('sidebar') || html.includes('menu');
    const hasMainContent = html.includes('main') || html.includes('content');
    
    console.log(`      - Sidebar: ${hasSidebar ? '✅ FOUND' : '❌ NOT FOUND'}`);
    console.log(`      - Main content: ${hasMainContent ? '✅ FOUND' : '❌ NOT FOUND'}`);
    
    // Test 2: Check authentication status
    console.log('\n2️⃣ Testing Authentication Status...');
    const authResponse = await fetch('http://localhost:3000/api/auth/status');
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('   📊 Auth status:', authData);
    } else {
      console.log('   ❌ Auth status endpoint not available');
    }
    
    // Test 3: Check if user is logged in
    console.log('\n3️⃣ Testing User Session...');
    const sessionResponse = await fetch('http://localhost:3000/api/auth/session');
    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json();
      console.log('   📊 Session data:', sessionData);
    } else {
      console.log('   ❌ Session endpoint not available');
    }
    
    // Test 4: Check for JavaScript errors
    console.log('\n4️⃣ Checking for JavaScript Issues...');
    const hasScriptErrors = html.includes('error') || html.includes('Error');
    const hasConsoleErrors = html.includes('console.error') || html.includes('console.log');
    
    console.log(`   📊 JavaScript analysis:`);
    console.log(`      - Script errors: ${hasScriptErrors ? '❌ FOUND' : '✅ NOT FOUND'}`);
    console.log(`      - Console logs: ${hasConsoleErrors ? '⚠️ FOUND' : '✅ NOT FOUND'}`);
    
    // Summary
    console.log('\n🎯 Dashboard Flickering Test Summary:');
    if (hasLoadingText || hasLoadingSpinner) {
      console.log('   ❌ Loading indicators found - potential flickering issue');
    } else if (!hasDashboardContent) {
      console.log('   ❌ No dashboard content found - rendering issue');
    } else {
      console.log('   ✅ Dashboard appears to be loading correctly');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDashboardFlickering();
