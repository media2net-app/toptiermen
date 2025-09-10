require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkMolliePayments() {
  console.log('🔍 Checking Mollie payments for €426 Premium Tier...');
  
  try {
    // Get all packages with €426 price
    const { data: packages, error } = await supabase
      .from('prelaunch_packages')
      .select('*')
      .eq('discounted_price', 426)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching packages:', error);
      return;
    }

    console.log(`📊 Found ${packages?.length || 0} packages with €426 price`);
    
    if (packages && packages.length > 0) {
      console.log('\n📋 €426 Premium Tier packages:');
      packages.forEach((pkg, index) => {
        console.log(`${index + 1}. ${pkg.full_name} (${pkg.email})`);
        console.log(`   Status: ${pkg.payment_status}`);
        console.log(`   Mollie ID: ${pkg.mollie_payment_id || 'N/A'}`);
        console.log(`   Date: ${pkg.created_at}`);
        console.log(`   Test: ${pkg.is_test_payment ? 'Yes' : 'No'}`);
        console.log('');
      });

      // Check Mollie payments table if it exists
      console.log('\n🔍 Checking mollie_payments table...');
      const { data: molliePayments, error: mollieError } = await supabase
        .from('mollie_payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (mollieError) {
        console.log('❌ mollie_payments table error:', mollieError.message);
      } else {
        console.log(`📊 Found ${molliePayments?.length || 0} Mollie payments`);
        
        if (molliePayments && molliePayments.length > 0) {
          console.log('\n📋 Recent Mollie payments:');
          molliePayments.slice(0, 5).forEach((payment, index) => {
            console.log(`${index + 1}. ${payment.email || 'N/A'}`);
            console.log(`   Amount: €${payment.amount || 'N/A'}`);
            console.log(`   Status: ${payment.status || 'N/A'}`);
            console.log(`   Mollie ID: ${payment.mollie_payment_id || 'N/A'}`);
            console.log(`   Date: ${payment.created_at || 'N/A'}`);
            console.log('');
          });
        }
      }

      // Look for payments around 23:02 on 2025-09-09
      console.log('\n🔍 Looking for payments around 23:02 on 2025-09-09...');
      const targetDate = '2025-09-09';
      const targetTime = '23:02';
      
      const recentPackages = packages.filter(pkg => {
        const date = new Date(pkg.created_at);
        const dateStr = date.toISOString().split('T')[0];
        const timeStr = date.toTimeString().split(' ')[0].substring(0, 5);
        
        return dateStr === targetDate && (
          timeStr === targetTime || 
          timeStr === '23:01' || 
          timeStr === '23:03' ||
          timeStr === '23:00' ||
          timeStr === '23:04'
        );
      });

      if (recentPackages.length > 0) {
        console.log('✅ Found packages around 23:02:');
        recentPackages.forEach((pkg, index) => {
          console.log(`${index + 1}. ${pkg.full_name} (${pkg.email})`);
          console.log(`   Status: ${pkg.payment_status}`);
          console.log(`   Mollie ID: ${pkg.mollie_payment_id || 'N/A'}`);
          console.log(`   Exact time: ${pkg.created_at}`);
        });
      } else {
        console.log('❌ No packages found around 23:02 on 2025-09-09');
        console.log('📋 All €426 packages:');
        packages.forEach((pkg, index) => {
          const date = new Date(pkg.created_at);
          const timeStr = date.toTimeString().split(' ')[0].substring(0, 5);
          console.log(`   ${pkg.full_name} (${pkg.email}) - ${timeStr} - Status: ${pkg.payment_status}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkMolliePayments();
