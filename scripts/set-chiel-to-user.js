const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setChielToUser() {
  console.log('🔧 Setting Chiel\'s role from ADMIN to USER...\n');

  try {
    // First check current role
    const { data: currentProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('email', 'chiel@media2net.nl')
      .single();

    if (checkError) {
      console.error('❌ Error checking current role:', checkError);
      return;
    }

    if (!currentProfile) {
      console.error('❌ No profile found for chiel@media2net.nl');
      return;
    }

    console.log(`📊 Current role: ${currentProfile.role}`);
    
    if (currentProfile.role === 'user') {
      console.log('✅ Chiel already has USER role - no change needed!');
      return;
    }

    // Update role to 'user'
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        role: 'user',
        updated_at: new Date().toISOString()
      })
      .eq('email', 'chiel@media2net.nl')
      .select('id, email, role, updated_at')
      .single();

    if (updateError) {
      console.error('❌ Error updating role:', updateError);
      return;
    }

    console.log('✅ Successfully updated Chiel\'s role!');
    console.log(`📊 New role: ${updatedProfile.role}`);
    console.log(`📅 Updated at: ${updatedProfile.updated_at}`);

    // Verify the change
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('email', 'chiel@media2net.nl')
      .single();

    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError);
      return;
    }

    console.log('\n🔍 Verification:');
    console.log(`  - Email: ${verifyProfile.email}`);
    console.log(`  - Role: ${verifyProfile.role}`);
    
    if (verifyProfile.role === 'user') {
      console.log('✅ SUCCESS: Chiel now has USER role!');
      console.log('   This means he will no longer have admin access.');
    } else {
      console.log('❌ ERROR: Role update failed!');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

setChielToUser();
