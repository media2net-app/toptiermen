#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAuthFlow() {
  console.log('🔍 V3.0 AUTH SYSTEM DEBUG');
  console.log('=========================\n');

  // 1. Test Supabase connection
  console.log('📡 Step 1: Test Supabase Connection');
  try {
    const { data, error } = await supabase.from('profiles').select('count').single();
    if (error) {
      console.log('❌ Supabase connection failed:', error.message);
    } else {
      console.log('✅ Supabase connection successful');
    }
  } catch (e) {
    console.log('❌ Supabase connection error:', e.message);
  }

  // 2. Check profiles table structure
  console.log('\n📊 Step 2: Check Profiles Table Structure');
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at')
      .limit(3);
    
    if (error) {
      console.log('❌ Profiles query failed:', error.message);
    } else {
      console.log('✅ Profiles table accessible');
      console.log('📋 Sample data:', JSON.stringify(profiles, null, 2));
    }
  } catch (e) {
    console.log('❌ Profiles query error:', e.message);
  }

  // 3. Check users table structure
  console.log('\n👥 Step 3: Check Users Table Structure');
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, created_at')
      .limit(3);
    
    if (error) {
      console.log('❌ Users query failed:', error.message);
    } else {
      console.log('✅ Users table accessible');
      console.log('📋 Sample data:', JSON.stringify(users, null, 2));
    }
  } catch (e) {
    console.log('❌ Users query error:', e.message);
  }

  // 4. Check auth.users access
  console.log('\n🔐 Step 4: Check Auth.Users Access');
  try {
    const { data: authUsers, error } = await supabase
      .from('auth.users')
      .select('id, email')
      .limit(3);
    
    if (error) {
      console.log('❌ Auth.users query failed:', error.message);
      console.log('   This is expected - direct access to auth.users is restricted');
    } else {
      console.log('✅ Auth.users accessible:', authUsers.length, 'users');
    }
  } catch (e) {
    console.log('❌ Auth.users error:', e.message);
  }

  // 5. Test login with real credentials (without password)
  console.log('\n🔓 Step 5: Test Auth Session');
  try {
    const { data: session, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('❌ Session check failed:', error.message);
    } else {
      console.log('✅ Session check successful');
      console.log('📋 Current session:', session.session ? 'Active' : 'None');
    }
  } catch (e) {
    console.log('❌ Session error:', e.message);
  }

  // 6. Check table permissions
  console.log('\n🛡️ Step 6: Check Table Permissions');
  
  // Test RLS policies
  const testTables = ['profiles', 'users', 'user_badges', 'ranks'];
  
  for (const tableName of testTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`);
      } else {
        console.log(`✅ ${tableName}: Accessible (${data.length} records)`);
      }
    } catch (e) {
      console.log(`❌ ${tableName}: ${e.message}`);
    }
  }

  console.log('\n🎯 DIAGNOSIS COMPLETE');
  console.log('====================');
  console.log('Please check the results above to identify the issue.');
}

debugAuthFlow().catch(console.error);
