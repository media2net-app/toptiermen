const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkChielRole() {
  console.log('🔍 Checking Chiel\'s role in database...\n');

  try {
    // Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, role, created_at, updated_at')
      .eq('email', 'chiel@media2net.nl');

    if (profilesError) {
      console.error('❌ Error fetching from profiles table:', profilesError);
      return;
    }

    console.log('📊 PROFILES TABLE:');
    if (profiles && profiles.length > 0) {
      profiles.forEach(profile => {
        console.log(`  - Email: ${profile.email}`);
        console.log(`  - Role: ${profile.role || 'null'}`);
        console.log(`  - Created: ${profile.created_at}`);
        console.log(`  - Updated: ${profile.updated_at}`);
        console.log('');
      });
    } else {
      console.log('  ❌ No profile found for chiel@media2net.nl');
    }

    // Check auth.users table
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching from auth.users:', authError);
      return;
    }

    console.log('🔐 AUTH.USERS TABLE:');
    const chielAuth = authUsers.users.find(user => user.email === 'chiel@media2net.nl');
    if (chielAuth) {
      console.log(`  - Email: ${chielAuth.email}`);
      console.log(`  - ID: ${chielAuth.id}`);
      console.log(`  - Created: ${chielAuth.created_at}`);
      console.log(`  - Last Sign In: ${chielAuth.last_sign_in_at}`);
      console.log(`  - Confirmed: ${chielAuth.email_confirmed_at ? 'Yes' : 'No'}`);
      console.log('');
    } else {
      console.log('  ❌ No auth user found for chiel@media2net.nl');
    }

    // Check if role needs to be updated
    if (profiles && profiles.length > 0) {
      const profile = profiles[0];
      if (profile.role === 'admin') {
        console.log('⚠️  WARNING: Chiel still has ADMIN role!');
        console.log('   To change to LID, run: node scripts/set-chiel-to-lid.js');
      } else if (profile.role === 'lid') {
        console.log('✅ Chiel has LID role - correct!');
      } else {
        console.log(`ℹ️  Chiel has role: ${profile.role || 'null'}`);
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkChielRole();
