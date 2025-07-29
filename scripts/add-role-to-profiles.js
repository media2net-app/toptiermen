const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addRoleToProfiles() {
  try {
    console.log('🔧 Adding role column to profiles table...');

    // First check if role column already exists
    const { data: existingData, error: checkError } = await supabase
      .from('profiles')
      .select('role')
      .limit(1);

    if (!checkError && existingData && existingData.length > 0 && 'role' in existingData[0]) {
      console.log('✅ Role column already exists in profiles table');
      
      // Show current roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .order('role', { ascending: true });

      if (!profilesError && profiles) {
        console.log('📋 Current profiles and roles:');
        profiles.forEach(profile => {
          console.log(`   - ${profile.full_name} (${profile.email}): ${profile.role}`);
        });
      }
      
      return;
    }

    console.log('⚠️ Role column does not exist, adding it...');

    // Since we can't use exec_sql directly, we'll need to use a different approach
    // Let's try to update the table structure by inserting a test record
    console.log('📝 Attempting to add role column...');

    // Try to get current table structure
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profilesError) {
      console.error('❌ Error accessing profiles table:', profilesError);
      return;
    }

    console.log('📋 Current profiles table columns:', Object.keys(profiles[0] || {}));

    // Since we can't add columns via Supabase client, we need to provide manual instructions
    console.log('\n🔧 MANUAL SETUP REQUIRED:');
    console.log('Please run the following SQL in your Supabase SQL Editor:');
    console.log('');
    console.log('-- Add role column to profiles table');
    console.log('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT \'user\' CHECK (role IN (\'user\', \'admin\'));');
    console.log('');
    console.log('-- Create index for better performance');
    console.log('CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);');
    console.log('');
    console.log('-- Update existing profiles to have user role');
    console.log('UPDATE profiles SET role = \'user\' WHERE role IS NULL;');
    console.log('');
    console.log('-- Set specific users as admin');
    console.log('UPDATE profiles SET role = \'admin\' WHERE id IN (\'9d6aa8ba-58ab-4188-9a9f-09380a67eb0c\', \'061e43d5-c89a-42bb-8a4c-04be2ce99a7e\');');
    console.log('');
    console.log('-- Verify the changes');
    console.log('SELECT id, full_name, email, role FROM profiles ORDER BY role, full_name;');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addRoleToProfiles(); 