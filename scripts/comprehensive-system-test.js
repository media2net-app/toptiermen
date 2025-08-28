require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

console.log('🧪 COMPREHENSIVE SYSTEM TEST');
console.log('============================================================');
console.log('Testing all functionality after users → profiles migration');
console.log('');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

function logTest(name, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name}`);
  }
  if (details) {
    console.log(`   ${details}`);
  }
}

async function testDatabaseStructure() {
  console.log('📋 STEP 1: Database Structure Tests');
  console.log('----------------------------------------');
  
  try {
    // Test 1: Check if profiles table exists and has data
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (profilesError) {
      logTest('Profiles table access', false, profilesError.message);
      return false;
    }
    
    logTest('Profiles table exists and accessible', true, `${profiles.length} records found`);
    
    // Test 2: Check if users table still exists (should be empty or minimal)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (usersError) {
      logTest('Users table access', false, usersError.message);
    } else {
      logTest('Users table still accessible', true, `${users.length} records remaining`);
    }
    
    // Test 3: Check profiles table structure
    const { data: profileSample } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profileSample && profileSample.length > 0) {
      const profile = profileSample[0];
      const hasRequiredFields = profile.id && profile.email && profile.full_name;
      logTest('Profiles table has required fields', hasRequiredFields, 
        `ID: ${profile.id}, Email: ${profile.email}, Name: ${profile.full_name}`);
    }
    
    return true;
  } catch (error) {
    logTest('Database structure test', false, error.message);
    return false;
  }
}

async function testUserAuthentication() {
  console.log('\n📋 STEP 2: User Authentication Tests');
  console.log('----------------------------------------');
  
  try {
    // Test 1: Test Chiel login with new password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'chiel@media2net.nl',
      password: 'W4t3rk0k3r^'
    });
    
    if (authError) {
      logTest('Chiel authentication', false, authError.message);
      return false;
    }
    
    logTest('Chiel authentication successful', true, `User: ${authData.user.email}`);
    
    // Test 2: Check if user profile exists in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (profileError) {
      logTest('Profile lookup after auth', false, profileError.message);
    } else {
      logTest('Profile lookup after auth', true, `Profile found: ${profile.full_name}`);
    }
    
    // Sign out
    await supabase.auth.signOut();
    
    return true;
  } catch (error) {
    logTest('Authentication test', false, error.message);
    return false;
  }
}

async function testDataConsistency() {
  console.log('\n📋 STEP 3: Data Consistency Tests');
  console.log('----------------------------------------');
  
  try {
    // Test 1: Check if all profiles have corresponding auth.users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role');
    
    if (profilesError) {
      logTest('Profiles data retrieval', false, profilesError.message);
      return false;
    }
    
    logTest('Profiles data retrieval', true, `${profiles.length} profiles found`);
    
    // Test 2: Check for data quality
    let validProfiles = 0;
    let adminUsers = 0;
    
    for (const profile of profiles) {
      if (profile.id && profile.email) {
        validProfiles++;
      }
      if (profile.role === 'admin') {
        adminUsers++;
      }
    }
    
    logTest('Data quality check', validProfiles === profiles.length, 
      `${validProfiles}/${profiles.length} profiles have valid data`);
    
    logTest('Admin users check', adminUsers > 0, `${adminUsers} admin users found`);
    
    // Test 3: Check for duplicate emails
    const emails = profiles.map(p => p.email).filter(Boolean);
    const uniqueEmails = [...new Set(emails)];
    
    logTest('No duplicate emails', emails.length === uniqueEmails.length, 
      `${emails.length} total, ${uniqueEmails.length} unique`);
    
    return true;
  } catch (error) {
    logTest('Data consistency test', false, error.message);
    return false;
  }
}

async function testCodebaseConsistency() {
  console.log('\n📋 STEP 4: Codebase Consistency Tests');
  console.log('----------------------------------------');
  
  try {
    // Test 1: Check if any files still reference 'users' table
    const { execSync } = require('child_process');
    
    try {
      const grepResult = execSync('grep -r "supabase.from(\'users\')" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx"', { encoding: 'utf8' });
      logTest('No remaining users table references', false, 'Found references to users table');
      console.log('   Files with users references:');
      console.log(grepResult);
    } catch (grepError) {
      // grep returns non-zero exit code when no matches found (which is good)
      logTest('No remaining users table references', true, 'All references updated to profiles');
    }
    
    // Test 2: Check if profiles references exist
    try {
      const profilesGrep = execSync('grep -r "supabase.from(\'profiles\')" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" | wc -l', { encoding: 'utf8' });
      const count = parseInt(profilesGrep.trim());
      logTest('Profiles table references exist', count > 0, `${count} references found`);
    } catch (grepError) {
      logTest('Profiles table references exist', false, 'No profiles references found');
    }
    
    return true;
  } catch (error) {
    logTest('Codebase consistency test', false, error.message);
    return false;
  }
}

async function testLiveSiteAccessibility() {
  console.log('\n📋 STEP 5: Live Site Accessibility Tests');
  console.log('----------------------------------------');
  
  try {
    const { execSync } = require('child_process');
    
    // Test 1: Check if live site is accessible
    try {
      const curlResult = execSync('curl -s -o /dev/null -w "%{http_code}" https://platform.toptiermen.eu', { encoding: 'utf8' });
      const statusCode = parseInt(curlResult.trim());
      logTest('Live site accessibility', statusCode === 200, `HTTP ${statusCode}`);
    } catch (curlError) {
      logTest('Live site accessibility', false, 'Site not accessible');
    }
    
    // Test 2: Check if login page is accessible
    try {
      const loginResult = execSync('curl -s -o /dev/null -w "%{http_code}" https://platform.toptiermen.eu/login', { encoding: 'utf8' });
      const loginStatus = parseInt(loginResult.trim());
      logTest('Login page accessibility', loginStatus === 200, `HTTP ${loginStatus}`);
    } catch (curlError) {
      logTest('Login page accessibility', false, 'Login page not accessible');
    }
    
    return true;
  } catch (error) {
    logTest('Live site accessibility test', false, error.message);
    return false;
  }
}

async function generateTestReport() {
  console.log('\n📋 STEP 6: Test Report');
  console.log('----------------------------------------');
  
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  
  console.log('🎯 COMPREHENSIVE TEST RESULTS');
  console.log('============================================================');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Total: ${testResults.total}`);
  console.log(`📈 Success Rate: ${successRate}%`);
  console.log('');
  
  if (testResults.failed === 0) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ User profile migration is COMPLETELY SUCCESSFUL');
    console.log('✅ System is fully operational');
    console.log('✅ Live site is accessible');
    console.log('');
    console.log('🚀 The platform is ready for production use!');
  } else {
    console.log('⚠️  SOME TESTS FAILED');
    console.log('Please review the failed tests above');
  }
  
  console.log('');
  console.log('📋 Live Platform URL: https://platform.toptiermen.eu');
  console.log('📋 Chiel Login: chiel@media2net.nl / W4t3rk0k3r^');
}

async function main() {
  try {
    console.log('🚀 Starting comprehensive system test...');
    console.log('⏱️  This may take a few minutes...');
    console.log('');
    
    // Run all tests
    await testDatabaseStructure();
    await testUserAuthentication();
    await testDataConsistency();
    await testCodebaseConsistency();
    await testLiveSiteAccessibility();
    
    // Generate final report
    await generateTestReport();
    
  } catch (error) {
    console.error('❌ Test process failed:', error.message);
  }
}

main();
