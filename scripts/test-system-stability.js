#!/usr/bin/env node

/**
 * 🧪 System Stability Test Script - Platform 2.0.3
 * Tests all critical functionality from login to logout
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🧪 Starting System Stability Test - Platform 2.0.3\n');

async function testDatabaseConnection() {
  console.log('📊 Testing Database Connection...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function testAuthSystem() {
  console.log('\n🔐 Testing Authentication System...');
  try {
    // Test user login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test.user.1756630044380@toptiermen.test',
      password: 'test123456'
    });
    
    if (error) throw error;
    console.log('✅ User authentication successful');
    
    // Test user profile fetch
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (profileError) throw profileError;
    console.log('✅ User profile fetch successful');
    
    // Test logout
    const { error: logoutError } = await supabase.auth.signOut();
    if (logoutError) throw logoutError;
    console.log('✅ User logout successful');
    
    return true;
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    return false;
  }
}

async function testOnboardingSystem() {
  console.log('\n🎯 Testing Onboarding System...');
  try {
    const { data, error } = await supabase
      .from('onboarding_status')
      .select('*')
      .eq('user_id', '061e43d5-c89a-42bb-8a4c-04be2ce99a7e')
      .single();
    
    if (error) throw error;
    console.log('✅ Onboarding status fetch successful');
    console.log(`   - User: ${data.user_id}`);
    console.log(`   - Completed: ${data.onboarding_completed}`);
    console.log(`   - Current Step: ${data.current_step}`);
    
    return true;
  } catch (error) {
    console.error('❌ Onboarding test failed:', error.message);
    return false;
  }
}

async function testLeadManagement() {
  console.log('\n📧 Testing Lead Management...');
  try {
    const { data, error } = await supabase
      .from('prelaunch_emails')
      .select('count')
      .eq('status', 'active');
    
    if (error) throw error;
    console.log('✅ Lead management system accessible');
    
    // Get total leads
    const { count, error: countError } = await supabase
      .from('prelaunch_emails')
      .select('*', { count: 'exact', head: true });
    
    if (countError) throw countError;
    console.log(`   - Total leads: ${count}`);
    
    return true;
  } catch (error) {
    console.error('❌ Lead management test failed:', error.message);
    return false;
  }
}

async function testAdminSystem() {
  console.log('\n👑 Testing Admin System...');
  try {
    // Test admin user
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'chiel@media2net.nl',
      password: process.env.ADMIN_PASSWORD || 'admin123'
    });
    
    if (error) throw error;
    console.log('✅ Admin authentication successful');
    
    // Test admin profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (profileError) throw profileError;
    console.log(`   - Admin role: ${profile.role}`);
    
    // Test logout
    await supabase.auth.signOut();
    console.log('✅ Admin logout successful');
    
    return true;
  } catch (error) {
    console.error('❌ Admin system test failed:', error.message);
    return false;
  }
}

async function testAPIEndpoints() {
  console.log('\n🌐 Testing API Endpoints...');
  
  const endpoints = [
    '/api/check-supabase-status',
    '/api/admin/prelaunch-emails',
    '/api/onboarding'
  ];
  
  let successCount = 0;
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:3000${endpoint}`);
      if (response.ok) {
        console.log(`✅ ${endpoint} - OK`);
        successCount++;
      } else {
        console.log(`⚠️  ${endpoint} - ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Failed`);
    }
  }
  
  return successCount === endpoints.length;
}

async function runAllTests() {
  const tests = [
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'Authentication System', fn: testAuthSystem },
    { name: 'Onboarding System', fn: testOnboardingSystem },
    { name: 'Lead Management', fn: testLeadManagement },
    { name: 'Admin System', fn: testAdminSystem },
    { name: 'API Endpoints', fn: testAPIEndpoints }
  ];
  
  const results = [];
  
  for (const test of tests) {
    const startTime = Date.now();
    const success = await test.fn();
    const duration = Date.now() - startTime;
    
    results.push({
      name: test.name,
      success,
      duration
    });
  }
  
  // Print summary
  console.log('\n📋 Test Summary:');
  console.log('================');
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name} (${result.duration}ms)`);
  });
  
  console.log(`\n🎯 Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Platform 2.0.3 is stable.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please check the issues above.');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});
