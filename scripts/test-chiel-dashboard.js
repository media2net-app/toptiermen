const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testChielDashboard() {
  console.log('🧪 Testing Chiel Dashboard Access...\\n');

  try {
    // Test 1: Check Chiel's profile
    console.log('1️⃣ Checking Chiel\'s Profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'chiel@toptiermen.com')
      .single();

    if (profileError) {
      console.log('❌ Chiel not found in database');
      return;
    } else {
      console.log('✅ Chiel found:', profile.email, 'Role:', profile.role);
    }

    // Test 2: Check dashboard page
    console.log('\\n2️⃣ Testing Dashboard Page...');
    const response = await fetch('http://localhost:3000/dashboard');
    const html = await response.text();
    
    console.log('   📊 Response status:', response.status);
    console.log('   📊 Content length:', html.length);
    
    // Check for specific content
    const hasChielName = html.includes('Chiel');
    const hasDashboardContent = html.includes('Mijn Missies') || html.includes('Challenges') || html.includes('Mijn Trainingen');
    const hasLoadingText = html.includes('Laden...');
    const hasError = html.includes('error') || html.includes('Error');
    
    console.log('   📊 Contains Chiel name:', hasChielName);
    console.log('   📊 Contains dashboard content:', hasDashboardContent);
    console.log('   📊 Contains loading text:', hasLoadingText);
    console.log('   📊 Contains error:', hasError);

    // Test 3: Check dashboard API
    console.log('\\n3️⃣ Testing Dashboard API...');
    const apiResponse = await fetch('http://localhost:3000/api/dashboard-stats');
    const apiData = await apiResponse.json();
    
    console.log('   📊 API status:', apiResponse.status);
    console.log('   📊 API data keys:', Object.keys(apiData || {}));

    // Test 4: Check onboarding status
    console.log('\\n4️⃣ Testing Onboarding Status...');
    const { data: onboarding, error: onboardingError } = await supabase
      .from('onboarding_status')
      .select('*')
      .eq('user_id', profile.id)
      .single();

    if (onboardingError) {
      console.log('❌ No onboarding status found for Chiel');
    } else {
      console.log('✅ Onboarding status:', {
        completed: onboarding.onboarding_completed,
        current_step: onboarding.current_step
      });
    }

    console.log('\\n📋 SUMMARY:');
    console.log('✅ Chiel profile exists');
    console.log('✅ Dashboard API works');
    console.log('❌ Dashboard content not rendering');
    console.log('❌ Need to fix dashboard component rendering');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testChielDashboard();
