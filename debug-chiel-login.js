#!/usr/bin/env node

/**
 * Debug Chiel Login - Live Environment
 * Tests the login flow for chiel@media2net.nl on platform.toptiermen.eu
 */

const https = require('https');
const { createClient } = require('@supabase/supabase-js');

// Live environment variables
const SUPABASE_URL = 'https://qjqjqjqjqjqjqjqj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcWpxanFqcWpxanFqcWpxanFqcWoiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5MzQ4MjQwMCwiZXhwIjoyMDA5MDU4NDAwfQ.example';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Debug Chiel Login - Live Environment');
console.log('=====================================');

async function testSupabaseConnection() {
  console.log('\n1. Testing Supabase Connection...');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.log('❌ Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (err) {
    console.log('❌ Supabase connection error:', err.message);
    return false;
  }
}

async function testChielUserExists() {
  console.log('\n2. Testing if Chiel user exists...');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'chiel@media2net.nl')
      .single();
    
    if (error) {
      console.log('❌ Chiel user not found:', error.message);
      return null;
    }
    
    console.log('✅ Chiel user found:');
    console.log('   ID:', data.id);
    console.log('   Email:', data.email);
    console.log('   Role:', data.role);
    console.log('   Full Name:', data.full_name);
    console.log('   Created:', data.created_at);
    
    return data;
  } catch (err) {
    console.log('❌ Error checking Chiel user:', err.message);
    return null;
  }
}

async function testLoginCredentials() {
  console.log('\n3. Testing login credentials...');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log('🔐 Attempting login with chiel@media2net.nl...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'chiel@media2net.nl',
      password: 'W4t3rk0k3r^'
    });
    
    if (error) {
      console.log('❌ Login failed:', error.message);
      console.log('   Error code:', error.status);
      return false;
    }
    
    console.log('✅ Login successful!');
    console.log('   User ID:', data.user.id);
    console.log('   Email:', data.user.email);
    console.log('   Session:', data.session ? 'Active' : 'None');
    
    return true;
  } catch (err) {
    console.log('❌ Login error:', err.message);
    return false;
  }
}

async function testLoginDataAPI() {
  console.log('\n4. Testing login-data API endpoint...');
  
  try {
    // First get user ID
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data: userData } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'chiel@media2net.nl')
      .single();
    
    if (!userData) {
      console.log('❌ Cannot test API - user not found');
      return false;
    }
    
    // Test the API endpoint
    const response = await fetch(`https://platform.toptiermen.eu/api/auth/login-data?userId=${userData.id}`);
    const result = await response.json();
    
    if (!response.ok) {
      console.log('❌ Login-data API failed:', result.error);
      return false;
    }
    
    console.log('✅ Login-data API successful');
    console.log('   Profile loaded:', result.data.profile.email);
    console.log('   Admin status:', result.data.profile.role === 'admin');
    
    return true;
  } catch (err) {
    console.log('❌ Login-data API error:', err.message);
    return false;
  }
}

async function testOnboardingStatus() {
  console.log('\n5. Testing onboarding status...');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    const { data, error } = await supabase
      .from('user_onboarding_status')
      .select('*')
      .eq('user_id', '061e43d5-c89a-42bb-8a4c-04be2ce99a7e')
      .single();
    
    if (error) {
      console.log('❌ Onboarding status not found:', error.message);
      return false;
    }
    
    console.log('✅ Onboarding status found:');
    console.log('   Completed:', data.onboarding_completed);
    console.log('   Current Step:', data.current_step);
    console.log('   Welcome Video:', data.welcome_video_shown);
    console.log('   Goal Set:', data.goal_set);
    
    return true;
  } catch (err) {
    console.log('❌ Onboarding status error:', err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Chiel login debug...\n');
  
  const results = {
    supabaseConnection: await testSupabaseConnection(),
    chielUserExists: await testChielUserExists(),
    loginCredentials: await testLoginCredentials(),
    loginDataAPI: await testLoginDataAPI(),
    onboardingStatus: await testOnboardingStatus()
  };
  
  console.log('\n📊 Debug Results Summary:');
  console.log('========================');
  console.log('Supabase Connection:', results.supabaseConnection ? '✅' : '❌');
  console.log('Chiel User Exists:', results.chielUserExists ? '✅' : '❌');
  console.log('Login Credentials:', results.loginCredentials ? '✅' : '❌');
  console.log('Login Data API:', results.loginDataAPI ? '✅' : '❌');
  console.log('Onboarding Status:', results.onboardingStatus ? '✅' : '❌');
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Login should work.');
  } else {
    console.log('\n⚠️ Some tests failed. This explains the login hanging issue.');
    
    if (!results.supabaseConnection) {
      console.log('🔧 Fix: Check Supabase URL and keys');
    }
    if (!results.chielUserExists) {
      console.log('🔧 Fix: Create or restore Chiel user account');
    }
    if (!results.loginCredentials) {
      console.log('🔧 Fix: Reset Chiel password');
    }
    if (!results.loginDataAPI) {
      console.log('🔧 Fix: Check login-data API endpoint');
    }
    if (!results.onboardingStatus) {
      console.log('🔧 Fix: Create onboarding status for Chiel');
    }
  }
}

// Run the debug
main().catch(console.error);
