require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Analyzing Profiles Table Structure...');
console.log('============================================================');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function analyzeProfilesTable() {
  console.log('📋 STEP 1: Profiles Table Structure');
  console.log('----------------------------------------');
  
  try {
    // Get a sample record to see the structure
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error fetching profiles:', error.message);
      return;
    }

    if (profiles && profiles.length > 0) {
      const sampleProfile = profiles[0];
      console.log('✅ Sample profile structure:');
      console.log(JSON.stringify(sampleProfile, null, 2));
      
      console.log('\n📊 Profiles Table Columns:');
      Object.keys(sampleProfile).forEach(key => {
        console.log(`   - ${key}: ${typeof sampleProfile[key]} (${sampleProfile[key]})`);
      });
    } else {
      console.log('ℹ️ No profiles found in table');
    }

  } catch (error) {
    console.error('❌ Error analyzing profiles:', error.message);
  }
}

async function checkUsersTable() {
  console.log('\n📋 STEP 2: Check if Users Table Exists');
  console.log('----------------------------------------');
  
  try {
    // Try to query the profiles table
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Users table does not exist or is not accessible');
      console.log('🔍 Error:', error.message);
    } else {
      console.log('✅ Users table exists!');
      if (users && users.length > 0) {
        console.log('📊 Sample user structure:');
        console.log(JSON.stringify(users[0], null, 2));
      }
    }

  } catch (error) {
    console.log('❌ Users table error:', error.message);
  }
}

async function checkAuthUsers() {
  console.log('\n📋 STEP 3: Check Auth.Users Table');
  console.log('----------------------------------------');
  
  try {
    // Try to query auth.users (Supabase built-in)
    const { data: authUsers, error } = await supabase
      .from('auth.users')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Cannot access auth.users directly');
      console.log('🔍 Error:', error.message);
    } else {
      console.log('✅ Auth.users table accessible');
      if (authUsers && authUsers.length > 0) {
        console.log('📊 Sample auth user structure:');
        console.log(JSON.stringify(authUsers[0], null, 2));
      }
    }

  } catch (error) {
    console.log('❌ Auth.users error:', error.message);
  }
}

async function compareWithSupabaseAuth() {
  console.log('\n📋 STEP 4: Compare with Supabase Auth');
  console.log('----------------------------------------');
  
  try {
    // Get current user from auth
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log('❌ Cannot get auth user:', error.message);
    } else if (user) {
      console.log('✅ Auth user structure:');
      console.log(JSON.stringify(user, null, 2));
      
      // Compare with profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.log('❌ Cannot get profile:', profileError.message);
      } else {
        console.log('\n📊 Comparison: Auth User vs Profile');
        console.log('Auth User ID:', user.id);
        console.log('Profile ID:', profile.id);
        console.log('Auth Email:', user.email);
        console.log('Profile Email:', profile.email);
        console.log('Profile Role:', profile.role);
        console.log('Profile Full Name:', profile.full_name);
      }
    }

  } catch (error) {
    console.log('❌ Auth comparison error:', error.message);
  }
}

async function analyzeTableRelationships() {
  console.log('\n📋 STEP 5: Table Relationships Analysis');
  console.log('----------------------------------------');
  
  console.log('🔍 Understanding the difference:');
  console.log('');
  console.log('📊 Supabase Auth System:');
  console.log('   - auth.users: Built-in Supabase table');
  console.log('   - Contains: id, email, encrypted_password, etc.');
  console.log('   - Purpose: Authentication only');
  console.log('');
  console.log('📊 Custom Profiles Table:');
  console.log('   - profiles: Custom application table');
  console.log('   - Contains: id, email, full_name, role, etc.');
  console.log('   - Purpose: Application-specific user data');
  console.log('');
  console.log('🎯 Why Both Exist:');
  console.log('   - auth.users: Handles authentication (login/logout)');
  console.log('   - profiles: Stores application data (name, role, etc.)');
  console.log('   - This is a common pattern in Supabase applications');
}

async function main() {
  try {
    await analyzeProfilesTable();
    await checkUsersTable();
    await checkAuthUsers();
    await compareWithSupabaseAuth();
    await analyzeTableRelationships();
    
    console.log('\n📋 STEP 6: Recommendations');
    console.log('----------------------------------------');
    console.log('✅ KEEP BOTH TABLES:');
    console.log('   - auth.users: For authentication');
    console.log('   - profiles: For application data');
    console.log('');
    console.log('🔧 FIX THE CODE:');
    console.log('   - Replace all .from("profiles") with .from("profiles")');
    console.log('   - Use auth.users only for auth operations');
    console.log('   - Use profiles for all application data');
    console.log('');
    console.log('💡 BEST PRACTICE:');
    console.log('   - auth.users: Login/logout, password management');
    console.log('   - profiles: User profile, role, application data');
    console.log('   - This separation is intentional and correct');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

main();
