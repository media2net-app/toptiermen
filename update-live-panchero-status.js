require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateLivePancheroStatus() {
  console.log('🔍 Updating Panchero de kort payment status on LIVE database...');
  
  try {
    // First, check if Panchero exists in the database
    const { data: existingData, error: fetchError } = await supabase
      .from('prelaunch_packages')
      .select('*')
      .eq('email', 'p.d.kort@rodekruis.nl')
      .eq('mollie_payment_id', 'tr_7BdZYHY4K6FcpbFUkeyDJ');

    if (fetchError) {
      console.error('❌ Error fetching Panchero data:', fetchError);
      return;
    }

    if (!existingData || existingData.length === 0) {
      console.log('❌ Panchero de kort not found in database');
      return;
    }

    console.log('✅ Found Panchero in database:');
    console.log(`   Current status: ${existingData[0].payment_status}`);
    console.log(`   Amount: €${existingData[0].discounted_price}`);
    console.log(`   Created: ${existingData[0].created_at}`);

    // Update status to paid
    const { data, error } = await supabase
      .from('prelaunch_packages')
      .update({ 
        payment_status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('email', 'p.d.kort@rodekruis.nl')
      .eq('mollie_payment_id', 'tr_7BdZYHY4K6FcpbFUkeyDJ')
      .select();

    if (error) {
      console.error('❌ Error updating status:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Successfully updated Panchero payment status:');
      console.log(`   Name: ${data[0].full_name}`);
      console.log(`   Email: ${data[0].email}`);
      console.log(`   Status: ${data[0].payment_status}`);
      console.log(`   Amount: €${data[0].discounted_price}`);
      console.log(`   Mollie ID: ${data[0].mollie_payment_id}`);
      console.log(`   Updated: ${data[0].updated_at}`);
    } else {
      console.log('❌ No records updated');
    }

    // Verify the update by fetching all packages
    console.log('\n🔍 Verifying update by fetching all packages...');
    const { data: allPackages, error: allError } = await supabase
      .from('prelaunch_packages')
      .select('*')
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('❌ Error fetching all packages:', allError);
      return;
    }

    console.log(`📊 Total packages in database: ${allPackages?.length || 0}`);
    
    const paidPackages = allPackages?.filter(pkg => pkg.payment_status === 'paid') || [];
    console.log(`✅ Paid packages: ${paidPackages.length}`);
    
    if (paidPackages.length > 0) {
      console.log('\n📋 Paid packages:');
      paidPackages.forEach((pkg, index) => {
        console.log(`${index + 1}. ${pkg.full_name} (${pkg.email})`);
        console.log(`   Amount: €${pkg.discounted_price}`);
        console.log(`   Status: ${pkg.payment_status}`);
        console.log(`   Updated: ${pkg.updated_at}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

updateLivePancheroStatus();
