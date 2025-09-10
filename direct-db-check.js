require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function directDBCheck() {
  console.log('🔍 Direct database check for Panchero de kort...');
  
  try {
    // Check if Panchero exists
    const { data: pancheroData, error: pancheroError } = await supabase
      .from('prelaunch_packages')
      .select('*')
      .eq('email', 'p.d.kort@rodekruis.nl');

    if (pancheroError) {
      console.error('❌ Error fetching Panchero:', pancheroError);
      return;
    }

    console.log(`📊 Found ${pancheroData?.length || 0} records for Panchero de kort`);
    
    if (pancheroData && pancheroData.length > 0) {
      pancheroData.forEach((record, index) => {
        console.log(`${index + 1}. ${record.full_name}`);
        console.log(`   Email: ${record.email}`);
        console.log(`   Status: ${record.payment_status}`);
        console.log(`   Amount: €${record.discounted_price}`);
        console.log(`   Mollie ID: ${record.mollie_payment_id}`);
        console.log(`   Created: ${record.created_at}`);
        console.log(`   Updated: ${record.updated_at}`);
        console.log('');
      });
    }

    // Check total count
    const { count, error: countError } = await supabase
      .from('prelaunch_packages')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error fetching count:', countError);
    } else {
      console.log(`📊 Total packages in database: ${count}`);
    }

    // Check all packages with paid status
    const { data: paidPackages, error: paidError } = await supabase
      .from('prelaunch_packages')
      .select('*')
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false });

    if (paidError) {
      console.error('❌ Error fetching paid packages:', paidError);
    } else {
      console.log(`✅ Paid packages: ${paidPackages?.length || 0}`);
      
      if (paidPackages && paidPackages.length > 0) {
        console.log('\n📋 All paid packages:');
        paidPackages.forEach((pkg, index) => {
          console.log(`${index + 1}. ${pkg.full_name} (${pkg.email})`);
          console.log(`   Amount: €${pkg.discounted_price}`);
          console.log(`   Status: ${pkg.payment_status}`);
          console.log(`   Updated: ${pkg.updated_at}`);
          console.log('');
        });
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

directDBCheck();
