const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Create Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateRickPassword() {
  try {
    console.log('🔍 Searching for user Rick...');
    
    // First, find Rick's user ID by email
    const { data: users, error: searchError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .or('email.ilike.%rick%,full_name.ilike.%rick%')
      .limit(10);

    if (searchError) {
      console.error('❌ Error searching for Rick:', searchError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('❌ No users found matching "Rick"');
      return;
    }

    console.log('📋 Found users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}, Email: ${user.email}, Name: ${user.full_name}`);
    });

    // Find Rick specifically
    const rick = users.find(user => 
      user.email?.toLowerCase().includes('rick') || 
      user.full_name?.toLowerCase().includes('rick')
    );

    if (!rick) {
      console.log('❌ Could not find Rick specifically');
      return;
    }

    console.log(`✅ Found Rick: ID ${rick.id}, Email: ${rick.email}, Name: ${rick.full_name}`);

    // Update Rick's password
    console.log('🔐 Updating Rick\'s password to: Carnivoor123!');
    
    const { data, error } = await supabase.auth.admin.updateUserById(
      rick.id,
      { password: 'Carnivoor123!' }
    );

    if (error) {
      console.error('❌ Error updating password:', error);
      return;
    }

    console.log('✅ Password updated successfully!');
    console.log('📧 Rick can now log in with:');
    console.log(`   Email: ${rick.email}`);
    console.log(`   Password: Carnivoor123!`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
updateRickPassword();
