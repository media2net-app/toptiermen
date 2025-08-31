const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function comprehensiveDashboardTest() {
  console.log('🔍 COMPREHENSIVE DASHBOARD TEST\n');

  try {
    // Test 1: Check authentication
    console.log('1️⃣ Testing Authentication...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'rick@toptiermen.com')
      .single();

    if (profileError) {
      console.log('❌ Rick not found in database');
      return;
    } else {
      console.log('✅ Rick found:', profile.email, 'Role:', profile.role);
    }

    // Test 2: Check dashboard HTML response
    console.log('\n2️⃣ Testing Dashboard Response...');
    const dashboardResponse = await fetch('http://localhost:3000/dashboard');
    const dashboardHtml = await dashboardResponse.text();
    
    console.log('   Status:', dashboardResponse.status);
    console.log('   Content-Length:', dashboardHtml.length);
    
    // Check for specific content
    const hasHTML = dashboardHtml.includes('<html');
    const hasBody = dashboardHtml.includes('<body');
    const hasScripts = dashboardHtml.includes('<script');
    const hasContent = dashboardHtml.includes('Mijn Missies') || dashboardHtml.includes('Dashboard');
    const hasLoadingText = dashboardHtml.includes('Laden...');
    const hasError = dashboardHtml.includes('Error') || dashboardHtml.includes('error');
    
    console.log('   Has HTML:', hasHTML ? '✅' : '❌');
    console.log('   Has Body:', hasBody ? '✅' : '❌');
    console.log('   Has Scripts:', hasScripts ? '✅' : '❌');
    console.log('   Has Content:', hasContent ? '✅' : '❌');
    console.log('   Has Loading Text:', hasLoadingText ? '❌' : '✅');
    console.log('   Has Errors:', hasError ? '❌' : '✅');

    // Test 3: Check API endpoints
    console.log('\n3️⃣ Testing Dashboard API...');
    try {
      const apiResponse = await fetch('http://localhost:3000/api/dashboard-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id })
      });
      
      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        console.log('✅ Dashboard Stats API working');
        console.log('   Stats available:', !!apiData.stats);
      } else {
        console.log('❌ Dashboard Stats API failed:', apiResponse.status);
      }
    } catch (error) {
      console.log('❌ Dashboard Stats API error:', error.message);
    }

    // Test 4: Check login page for comparison
    console.log('\n4️⃣ Testing Login Page (for comparison)...');
    const loginResponse = await fetch('http://localhost:3000/login');
    const loginHtml = await loginResponse.text();
    
    const loginHasContent = loginHtml.includes('Log in op je dashboard');
    const loginHasForm = loginHtml.includes('<form');
    
    console.log('   Login Status:', loginResponse.status);
    console.log('   Login Has Content:', loginHasContent ? '✅' : '❌');
    console.log('   Login Has Form:', loginHasForm ? '✅' : '❌');

    // Test 5: Check middleware
    console.log('\n5️⃣ Testing Middleware...');
    const middlewareTest = await fetch('http://localhost:3000/dashboard', {
      headers: {
        'User-Agent': 'Test-Client'
      }
    });
    
    console.log('   Middleware Status:', middlewareTest.status);
    console.log('   Response Headers:', Object.keys(middlewareTest.headers.raw()));

    // Summary
    console.log('\n🎯 DIAGNOSIS:');
    if (!hasContent) {
      console.log('❌ PROBLEM: Dashboard content is not rendering');
      console.log('   Possible causes:');
      console.log('   - JavaScript errors blocking rendering');
      console.log('   - Authentication issues');
      console.log('   - Component loading failures');
      console.log('   - Next.js SSR issues');
    } else {
      console.log('✅ Dashboard content is rendering correctly');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

comprehensiveDashboardTest();
