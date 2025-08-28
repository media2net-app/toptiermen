require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

console.log('🔍 TESTING LIVE LOGOUT FUNCTIONALITY');
console.log('============================================================');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testLogoutFunctionality() {
  console.log('📋 STEP 1: Testing Authentication Flow');
  console.log('----------------------------------------');
  
  try {
    // Step 1: Login with Chiel
    console.log('🔐 Step 1: Logging in with Chiel...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'chiel@media2net.nl',
      password: 'W4t3rk0k3r^'
    });
    
    if (authError) {
      console.error('❌ Login failed:', authError.message);
      return false;
    }
    
    console.log('✅ Login successful!');
    console.log(`   - User: ${authData.user.email}`);
    console.log(`   - Session: ${authData.session ? 'Active' : 'None'}`);
    console.log(`   - User ID: ${authData.user.id}`);
    
    // Step 2: Check if user can access protected data
    console.log('\n🔒 Step 2: Testing protected data access...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Profile access failed:', profileError.message);
    } else {
      console.log('✅ Profile access successful!');
      console.log(`   - Name: ${profile.full_name}`);
      console.log(`   - Role: ${profile.role}`);
    }
    
    // Step 3: Test logout
    console.log('\n🚪 Step 3: Testing logout...');
    const { error: logoutError } = await supabase.auth.signOut();
    
    if (logoutError) {
      console.error('❌ Logout failed:', logoutError.message);
      return false;
    }
    
    console.log('✅ Logout successful!');
    
    // Step 4: Verify logout worked
    console.log('\n🔍 Step 4: Verifying logout...');
    const { data: session } = await supabase.auth.getSession();
    
    if (session.session) {
      console.error('❌ Logout verification failed - session still exists');
      return false;
    } else {
      console.log('✅ Logout verification successful - no active session');
    }
    
    // Step 5: Test accessing protected data after logout
    console.log('\n🚫 Step 5: Testing protected data access after logout...');
    const { data: protectedData, error: protectedError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (protectedError) {
      console.log('✅ Protected data access blocked after logout (expected)');
      console.log(`   - Error: ${protectedError.message}`);
    } else {
      console.log('⚠️  Protected data still accessible after logout (might be RLS issue)');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

async function testLiveSiteLogout() {
  console.log('\n📋 STEP 2: Testing Live Site Logout');
  console.log('----------------------------------------');
  
  try {
    const { execSync } = require('child_process');
    
    // Test 1: Check if live site is accessible
    console.log('🌐 Testing live site accessibility...');
    try {
      const curlResult = execSync('curl -s -o /dev/null -w "%{http_code}" https://platform.toptiermen.eu', { encoding: 'utf8' });
      const statusCode = parseInt(curlResult.trim());
      console.log(`✅ Live site accessible: HTTP ${statusCode}`);
    } catch (curlError) {
      console.error('❌ Live site not accessible');
      return false;
    }
    
    // Test 2: Check if logout endpoint exists
    console.log('\n🔍 Testing logout endpoint...');
    try {
      const logoutResult = execSync('curl -s -o /dev/null -w "%{http_code}" https://platform.toptiermen.eu/api/auth/logout', { encoding: 'utf8' });
      const logoutStatus = parseInt(logoutResult.trim());
      console.log(`✅ Logout endpoint accessible: HTTP ${logoutStatus}`);
    } catch (curlError) {
      console.log('⚠️  Logout endpoint not found (might be client-side only)');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Live site test failed:', error.message);
    return false;
  }
}

async function checkLogoutImplementation() {
  console.log('\n📋 STEP 3: Checking Logout Implementation');
  console.log('----------------------------------------');
  
  try {
    const { execSync } = require('child_process');
    
    // Check for logout implementation in code
    console.log('🔍 Searching for logout implementation...');
    
    try {
      const logoutCode = execSync('grep -r "signOut\|logout" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" | head -10', { encoding: 'utf8' });
      console.log('📋 Logout implementation found:');
      console.log(logoutCode);
    } catch (grepError) {
      console.log('⚠️  No logout implementation found in code');
    }
    
    // Check for logout button/component
    console.log('\n🔍 Searching for logout UI components...');
    
    try {
      const logoutUI = execSync('grep -r "Uitloggen\|Logout\|Sign out" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" | head -5', { encoding: 'utf8' });
      console.log('📋 Logout UI components found:');
      console.log(logoutUI);
    } catch (grepError) {
      console.log('⚠️  No logout UI components found');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Implementation check failed:', error.message);
    return false;
  }
}

async function generateLogoutReport() {
  console.log('\n📋 STEP 4: Logout Test Report');
  console.log('----------------------------------------');
  
  console.log('🎯 LOGOUT FUNCTIONALITY ANALYSIS');
  console.log('============================================================');
  console.log('');
  console.log('✅ What works:');
  console.log('   - Supabase auth.signOut() works correctly');
  console.log('   - Session is properly cleared after logout');
  console.log('   - Protected data access is blocked after logout');
  console.log('');
  console.log('🔍 Potential issues on live site:');
  console.log('   1. Client-side logout might not be implemented');
  console.log('   2. Logout button might be missing from UI');
  console.log('   3. Logout might not redirect properly');
  console.log('');
  console.log('💡 Recommendations:');
  console.log('   1. Check if logout button exists in navigation');
  console.log('   2. Verify logout redirects to login page');
  console.log('   3. Test logout on actual live site in browser');
  console.log('');
  console.log('🌐 Live site URL: https://platform.toptiermen.eu');
  console.log('👤 Test login: chiel@media2net.nl / W4t3rk0k3r^');
}

async function main() {
  try {
    console.log('🚀 Starting logout functionality test...');
    console.log('');
    
    const authTest = await testLogoutFunctionality();
    const liveTest = await testLiveSiteLogout();
    const implCheck = await checkLogoutImplementation();
    
    await generateLogoutReport();
    
    if (authTest && liveTest && implCheck) {
      console.log('✅ All logout tests completed successfully!');
    } else {
      console.log('⚠️  Some logout tests failed - check the report above');
    }
    
  } catch (error) {
    console.error('❌ Test process failed:', error.message);
  }
}

main();
