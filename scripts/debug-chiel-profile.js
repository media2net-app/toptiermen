const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugChielProfile() {
  console.log('🔍 Debugging Chiel\'s Profile Issue...\n');

  const chielUserId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e';

  try {
    // Check Chiel's profile in profiles table
    console.log('👤 Checking Chiel\'s profile in profiles table...');
    const { data: chielProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', chielUserId)
      .single();

    if (profileError) {
      console.error('❌ Error fetching Chiel\'s profile:', profileError);
    } else {
      console.log('✅ Chiel\'s profile:', chielProfile);
    }

    // Check Chiel's data in users table
    console.log('\n👤 Checking Chiel\'s data in users table...');
    const { data: chielUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', chielUserId)
      .single();

    if (userError) {
      console.error('❌ Error fetching Chiel\'s user data:', userError);
    } else {
      console.log('✅ Chiel\'s user data:', chielUser);
    }

    // Check auth.users for Chiel
    console.log('\n🔐 Checking Chiel\'s auth.users data...');
    const { data: chielAuth, error: authError } = await supabase.auth.admin.getUserById(chielUserId);

    if (authError) {
      console.error('❌ Error fetching Chiel\'s auth data:', authError);
    } else {
      console.log('✅ Chiel\'s auth data:', chielAuth);
    }

    // Check if there are multiple profiles for this user
    console.log('\n🔍 Checking for duplicate profiles...');
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', chielUserId);

    if (allProfilesError) {
      console.error('❌ Error checking all profiles:', allProfilesError);
    } else {
      console.log('✅ All profiles for Chiel:', allProfiles);
    }

    // Check what the profile page query would return
    console.log('\n🔍 Testing profile page query...');
    const { data: profilePageData, error: profilePageError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', chielUserId)
      .single();

    if (profilePageError) {
      console.error('❌ Error with profile page query:', profilePageError);
    } else {
      console.log('✅ Profile page query result:', profilePageData);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugChielProfile(); 