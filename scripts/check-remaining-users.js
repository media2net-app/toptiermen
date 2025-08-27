require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Checking Remaining Users Table Data...');
console.log('============================================================');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRemainingUsers() {
  console.log('📋 Checking Users Table Data');
  console.log('----------------------------------------');
  
  try {
    // Get all remaining users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
      return;
    }

    console.log(`📊 Found ${users.length} users in users table:`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.id}) - Role: ${user.role}`);
    });

    // Check which ones exist in profiles
    console.log('\n📋 Checking Profiles Table for these users...');
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email');

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError.message);
      return;
    }

    const profileIds = new Set(profiles.map(p => p.id));
    const profileEmails = new Set(profiles.map(p => p.email));

    console.log('\n📊 Analysis:');
    users.forEach(user => {
      const hasProfile = profileIds.has(user.id);
      const hasEmail = profileEmails.has(user.email);
      
      if (hasProfile) {
        console.log(`✅ ${user.email} - EXISTS in profiles (same ID)`);
      } else if (hasEmail) {
        console.log(`⚠️ ${user.email} - Email exists in profiles but different ID`);
      } else {
        console.log(`❌ ${user.email} - NOT in profiles table`);
      }
    });

    // Count categories
    const existingInProfiles = users.filter(u => profileIds.has(u.id)).length;
    const emailExistsButDifferentId = users.filter(u => !profileIds.has(u.id) && profileEmails.has(u.email)).length;
    const notInProfiles = users.filter(u => !profileIds.has(u.id) && !profileEmails.has(u.email)).length;

    console.log('\n📊 Summary:');
    console.log(`   - Users with profiles (same ID): ${existingInProfiles}`);
    console.log(`   - Users with email conflict: ${emailExistsButDifferentId}`);
    console.log(`   - Users not in profiles: ${notInProfiles}`);

    if (notInProfiles > 0) {
      console.log('\n⚠️ RECOMMENDATION:');
      console.log('   - These users need to be migrated to profiles table');
      console.log('   - Or they are test data that can be deleted');
    }

  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

async function main() {
  try {
    await checkRemainingUsers();
  } catch (error) {
    console.error('❌ Process failed:', error.message);
  }
}

main();
