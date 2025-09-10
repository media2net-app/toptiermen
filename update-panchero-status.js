require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updatePancheroStatus() {
  console.log('🔍 Updating Panchero de kort payment status...');
  
  try {
    // Update Panchero's payment status from pending to paid
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

    // Also check if there are any other payments that should be updated
    console.log('\n🔍 Checking for other payments that might need status updates...');
    
    const { data: allPackages, error: fetchError } = await supabase
      .from('prelaunch_packages')
      .select('*')
      .eq('payment_status', 'pending')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching pending packages:', fetchError);
      return;
    }

    console.log(`📊 Found ${allPackages?.length || 0} packages with pending status:`);
    
    if (allPackages && allPackages.length > 0) {
      allPackages.forEach((pkg, index) => {
        console.log(`${index + 1}. ${pkg.full_name} (${pkg.email})`);
        console.log(`   Amount: €${pkg.discounted_price}`);
        console.log(`   Mollie ID: ${pkg.mollie_payment_id}`);
        console.log(`   Created: ${pkg.created_at}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

updatePancheroStatus();
