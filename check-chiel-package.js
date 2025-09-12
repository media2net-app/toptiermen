const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkChielPackage() {
  try {
    console.log('🔍 Checking Chiel\'s package status...');

    // Find Chiel's user ID
    const { data: chielUser, error: userError } = await supabase
      .from('profiles')
      .select('id, email, full_name, package_type, subscription_tier, subscription_status, role')
      .eq('email', 'chielvanderzee@gmail.com')
      .single();

    if (userError || !chielUser) {
      console.error('❌ Chiel not found in users table:', userError?.message);
      return;
    }

    console.log('✅ Found Chiel:', {
      id: chielUser.id,
      email: chielUser.email,
      full_name: chielUser.full_name,
      package_type: chielUser.package_type,
      subscription_tier: chielUser.subscription_tier,
      subscription_status: chielUser.subscription_status,
      role: chielUser.role
    });

    // Check what the useSubscription hook would see
    const tier = chielUser.subscription_tier || 'basic';
    const hasTrainingAccess = tier === 'premium' || tier === 'lifetime';
    const hasNutritionAccess = tier === 'premium' || tier === 'lifetime';

    console.log('\n📊 Access Analysis:');
    console.log('   - subscription_tier (used by onboarding):', tier);
    console.log('   - package_type (used by ledenbeheer):', chielUser.package_type);
    console.log('   - hasTrainingAccess:', hasTrainingAccess);
    console.log('   - hasNutritionAccess:', hasNutritionAccess);

    // Check if there's a mismatch
    if (chielUser.package_type === 'Premium Tier' && chielUser.subscription_tier !== 'premium') {
      console.log('\n⚠️  MISMATCH DETECTED!');
      console.log('   - package_type says: Premium Tier');
      console.log('   - subscription_tier says:', chielUser.subscription_tier);
      console.log('   - This causes onboarding to show Basic tier');
    }

  } catch (error) {
    console.error('❌ Error checking Chiel\'s package:', error);
  }
}

checkChielPackage();
