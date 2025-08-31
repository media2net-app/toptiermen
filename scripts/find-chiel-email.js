const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findChielEmail() {
  console.log('🔍 Finding Chiel\'s email...\n');

  try {
    // Search for users with 'chiel' in their name or email
    console.log('1️⃣ Searching for users with "chiel" in name or email...');
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .or('full_name.ilike.%chiel%,email.ilike.%chiel%')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('❌ Error searching for users:', usersError);
      return;
    }

    console.log(`✅ Found ${users?.length || 0} users with "chiel":`);
    users?.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.full_name} (${user.email}) - Created: ${user.created_at}`);
    });

    // Also search for recent users
    console.log('\n2️⃣ Searching for recent users...');
    const { data: recentUsers, error: recentError } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) {
      console.error('❌ Error searching for recent users:', recentError);
      return;
    }

    console.log(`✅ Found ${recentUsers?.length || 0} recent users:`);
    recentUsers?.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.full_name} (${user.email}) - Created: ${user.created_at}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

findChielEmail();
