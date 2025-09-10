require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateFrodoStatus() {
  console.log('🔍 Updating Frodo van Houten payment status...');
  
  try {
    // Update Frodo's payment status from pending to paid
    const { data, error } = await supabase
      .from('prelaunch_packages')
      .update({ 
        payment_status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('email', 'fvanhouten1986@gmail.com')
      .eq('mollie_payment_id', 'tr_Me3SWvZXJYfzSuBEGbzDJ')
      .select();

    if (error) {
      console.error('❌ Error updating status:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Successfully updated Frodo payment status:');
      console.log(`   Name: ${data[0].full_name}`);
      console.log(`   Email: ${data[0].email}`);
      console.log(`   Status: ${data[0].payment_status}`);
      console.log(`   Amount: €${data[0].discounted_price}`);
      console.log(`   Mollie ID: ${data[0].mollie_payment_id}`);
      console.log(`   Updated: ${data[0].updated_at}`);
    } else {
      console.log('❌ No records updated');
    }

    // Show final summary
    console.log('\n📊 Final Summary:');
    const { data: allPackages, error: summaryError } = await supabase
      .from('prelaunch_packages')
      .select('*')
      .order('created_at', { ascending: false });

    if (!summaryError && allPackages) {
      const statusCounts = allPackages.reduce((acc, pkg) => {
        acc[pkg.payment_status] = (acc[pkg.payment_status] || 0) + 1;
        return acc;
      }, {});

      console.log('   Status counts:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   - ${status}: ${count}`);
      });

      const paidPackages = allPackages.filter(pkg => pkg.payment_status === 'paid');
      if (paidPackages.length > 0) {
        console.log('\n   ✅ Paid packages:');
        paidPackages.forEach(pkg => {
          console.log(`   - ${pkg.full_name} (${pkg.email}) - €${pkg.discounted_price}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

updateFrodoStatus();
