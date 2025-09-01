#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testLoginFlow() {
  console.log('🧪 V3.0 LOGIN FLOW TEST');
  console.log('=======================\n');

  // Test credentials (use real ones from your system)
  const testCredentials = [
    { email: 'joost@media2net.nl', name: 'Joost (existing user)' },
    { email: 'rob@media2net.nl', name: 'Rob (existing user)' },
    { email: 'admin@toptiermen.com', name: 'Admin (may not exist)' }
  ];

  for (const cred of testCredentials) {
    console.log(`🔍 Testing: ${cred.name}`);
    console.log(`📧 Email: ${cred.email}`);
    
    // Check if user exists in profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('email', cred.email)
      .single();
    
    if (profile) {
      console.log(`✅ Profile exists: ${profile.full_name} (${profile.role})`);
    } else {
      console.log(`❌ No profile found`);
    }
    
    console.log(''); // spacing
  }

  // Test session management  
  console.log('🔓 Testing Session Management');
  console.log('-----------------------------');
  
  try {
    // Get current session
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('Current session:', sessionData.session ? '✅ Active' : '❌ None');
    
    // Test auth state change listener
    console.log('Setting up auth state listener...');
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event);
      console.log('👤 Session user:', session?.user?.email || 'None');
    });
    
  } catch (error) {
    console.log('❌ Session test failed:', error.message);
  }

  console.log('\n🎯 RECOMMENDATION');
  console.log('==================');
  console.log('1. Try login with existing user: joost@media2net.nl');
  console.log('2. Check browser console for any JavaScript errors');
  console.log('3. Verify password is correct for existing users');
  console.log('4. Look for auth state change events in optimal auth hook');
  
  console.log('\n📋 NEXT STEPS');
  console.log('==============');
  console.log('1. Open browser to: http://localhost:3000/login');
  console.log('2. Open browser devtools (F12)');
  console.log('3. Try login with: joost@media2net.nl');
  console.log('4. Watch console for auth debug messages');
  console.log('5. Look for "🚀 Optimal Auth:" messages');
}

testLoginFlow().catch(console.error);
