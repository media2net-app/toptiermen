const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixChielPackage() {
  try {
    console.log('🔧 Fixing Chiel\'s package mismatch...');

    // Find Chiel's user ID
    const { data: chielUser, error: userError } = await supabase
      .from('profiles')
      .select('id, email, full_name, package_type, subscription_tier')
      .eq('email', 'chielvanderzee@gmail.com')
      .single();

    if (userError || !chielUser) {
      console.error('❌ Chiel not found in users table:', userError?.message);
      return;
    }

    console.log('✅ Found Chiel:', {
      id: chielUser.id,
      email: chielUser.email,
      package_type: chielUser.package_type,
      subscription_tier: chielUser.subscription_tier
    });

    // Fix the mismatch - set subscription_tier to match package_type
    let subscriptionTier = 'basic';
    if (chielUser.package_type === 'Premium Tier') {
      subscriptionTier = 'premium';
    } else if (chielUser.package_type === 'Lifetime Tier') {
      subscriptionTier = 'lifetime';
    }

    console.log('🔧 Updating subscription_tier to:', subscriptionTier);

    // Update the subscription_tier to match package_type
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_tier: subscriptionTier
      })
      .eq('id', chielUser.id);

    if (updateError) {
      console.error('❌ Error updating subscription_tier:', updateError.message);
      return;
    }

    console.log('✅ Successfully updated Chiel\'s subscription_tier!');
    console.log('📊 New status:');
    console.log('   - package_type:', chielUser.package_type);
    console.log('   - subscription_tier:', subscriptionTier);
    console.log('   - Access to training:', subscriptionTier === 'premium' || subscriptionTier === 'lifetime');
    console.log('   - Access to nutrition:', subscriptionTier === 'premium' || subscriptionTier === 'lifetime');

  } catch (error) {
    console.error('❌ Error fixing Chiel\'s package:', error);
  }
}

fixChielPackage();
