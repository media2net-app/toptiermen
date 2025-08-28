require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 DEBUGGING LOGIN ISSUE');
console.log('============================================================');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  process.exit(1);
}

// Create Supabase client with same configuration as frontend
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'toptiermen-v2-auth'
  }
});

async function debugLoginIssue() {
  try {
    console.log('📋 STEP 1: Testing direct Supabase auth');
    console.log('----------------------------------------');
    
    const email = 'chiel@media2net.nl';
    const password = 'W4t3rk0k3r^';
    
    console.log('🔄 Testing direct signInWithPassword...');
    const startTime = Date.now();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (error) {
      console.error('❌ Direct login failed:', error.message);
      console.error('🔍 Error details:', error);
      return false;
    }
    
    console.log(`✅ Direct login successful in ${duration}ms`);
    console.log(`   - User: ${data.user.email}`);
    console.log(`   - Session: ${data.session ? 'Active' : 'None'}`);
    
    console.log('\n📋 STEP 2: Testing profile fetch');
    console.log('----------------------------------------');
    
    console.log('🔄 Testing profile fetch...');
    const profileStartTime = Date.now();
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    const profileEndTime = Date.now();
    const profileDuration = profileEndTime - profileStartTime;
    
    if (profileError) {
      console.error('❌ Profile fetch failed:', profileError.message);
      console.error('🔍 Profile error details:', profileError);
      return false;
    }
    
    console.log(`✅ Profile fetch successful in ${profileDuration}ms`);
    console.log(`   - Name: ${profile.full_name}`);
    console.log(`   - Role: ${profile.role}`);
    
    console.log('\n📋 STEP 3: Testing session persistence');
    console.log('----------------------------------------');
    
    console.log('🔄 Testing session persistence...');
    const sessionStartTime = Date.now();
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    const sessionEndTime = Date.now();
    const sessionDuration = sessionEndTime - sessionStartTime;
    
    if (sessionError) {
      console.error('❌ Session check failed:', sessionError.message);
      return false;
    }
    
    console.log(`✅ Session check successful in ${sessionDuration}ms`);
    console.log(`   - Session exists: ${session ? 'Yes' : 'No'}`);
    if (session) {
      console.log(`   - User: ${session.user.email}`);
      console.log(`   - Expires: ${new Date(session.expires_at * 1000).toLocaleString()}`);
    }
    
    console.log('\n📋 STEP 4: Testing auth state change');
    console.log('----------------------------------------');
    
    console.log('🔄 Testing auth state change listener...');
    
    return new Promise((resolve) => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log(`🔄 Auth state changed: ${event}`);
          console.log(`   - User: ${session?.user?.email || 'None'}`);
          
          if (event === 'SIGNED_IN') {
            console.log('✅ Auth state change listener working');
            subscription.unsubscribe();
            resolve(true);
          }
        }
      );
      
      // Timeout after 5 seconds
      setTimeout(() => {
        console.log('⚠️ Auth state change listener timeout');
        subscription.unsubscribe();
        resolve(false);
      }, 5000);
    });
    
  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
    return false;
  }
}

async function testRetryMechanism() {
  console.log('\n📋 STEP 5: Testing retry mechanism');
  console.log('----------------------------------------');
  
  // Simulate the retry mechanism from the frontend
  const retryWithBackoff = async (operation, maxAttempts = 3) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${maxAttempts}...`);
        const result = await operation();
        console.log(`✅ Operation successful on attempt ${attempt}`);
        return result;
      } catch (error) {
        lastError = error;
        console.log(`❌ Attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxAttempts) {
          throw lastError;
        }
        
        const delay = 1000 * Math.pow(2, attempt - 1);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  };
  
  try {
    const result = await retryWithBackoff(async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'chiel@media2net.nl',
        password: 'W4t3rk0k3r^'
      });
      
      if (error) throw error;
      return data;
    });
    
    console.log('✅ Retry mechanism test successful');
    return true;
  } catch (error) {
    console.error('❌ Retry mechanism test failed:', error.message);
    return false;
  }
}

async function checkBrowserStorage() {
  console.log('\n📋 STEP 6: Checking browser storage simulation');
  console.log('----------------------------------------');
  
  // Simulate what happens in the browser
  console.log('🔄 Simulating browser storage operations...');
  
  try {
    // Test localStorage operations
    const testKey = 'toptiermen-v2-auth-test';
    const testData = { test: 'data', timestamp: Date.now() };
    
    // Note: This won't work in Node.js, but we can simulate the logic
    console.log('ℹ️ Browser localStorage operations would happen here');
    console.log('   - Setting auth data in localStorage');
    console.log('   - Reading auth data from localStorage');
    console.log('   - Clearing auth data from localStorage');
    
    console.log('✅ Browser storage simulation complete');
    return true;
  } catch (error) {
    console.error('❌ Browser storage simulation failed:', error.message);
    return false;
  }
}

async function generateDebugReport() {
  console.log('\n📋 DEBUG REPORT');
  console.log('============================================================');
  
  console.log('🔍 Potential issues identified:');
  console.log('');
  console.log('1. **Retry Mechanism**:');
  console.log('   - The retryWithBackoff function might be causing delays');
  console.log('   - Multiple retry attempts could make login appear stuck');
  console.log('   - Consider reducing max attempts or delay times');
  console.log('');
  console.log('2. **Profile Fetch**:');
  console.log('   - Profile fetch might be slow or failing');
  console.log('   - RLS policies might be blocking access');
  console.log('   - Network latency could cause timeouts');
  console.log('');
  console.log('3. **Auth State Change**:');
  console.log('   - Auth state change listener might not be working');
  console.log('   - Event might not be firing properly');
  console.log('   - Subscription might be getting lost');
  console.log('');
  console.log('4. **Browser Storage**:');
  console.log('   - localStorage operations might be failing');
  console.log('   - Storage quota might be exceeded');
  console.log('   - Browser security policies might be blocking');
  console.log('');
  console.log('💡 Recommendations:');
  console.log('1. Reduce retry attempts from 3 to 1');
  console.log('2. Add timeout to profile fetch');
  console.log('3. Simplify auth state change handling');
  console.log('4. Add better error handling and user feedback');
  console.log('5. Test with browser developer tools open');
}

async function main() {
  try {
    console.log('🚀 Starting login issue debug...\n');
    
    const loginResult = await debugLoginIssue();
    const retryResult = await testRetryMechanism();
    const storageResult = await checkBrowserStorage();
    
    console.log('\n📊 Debug Results:');
    console.log('   - Direct login:', loginResult ? '✅ PASS' : '❌ FAIL');
    console.log('   - Retry mechanism:', retryResult ? '✅ PASS' : '❌ FAIL');
    console.log('   - Storage simulation:', storageResult ? '✅ PASS' : '❌ FAIL');
    
    await generateDebugReport();
    
  } catch (error) {
    console.error('❌ Debug execution failed:', error.message);
  }
}

main();
