require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAllMollieStatuses() {
  console.log('🔍 Checking all Mollie payment statuses...');
  
  try {
    // Get all packages with pending or in behandeling status
    const { data: packages, error } = await supabase
      .from('prelaunch_packages')
      .select('*')
      .in('payment_status', ['pending', 'in_behandeling'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching packages:', error);
      return;
    }

    console.log(`📊 Found ${packages?.length || 0} packages to check`);
    
    if (packages && packages.length > 0) {
      console.log('\n📋 Checking Mollie statuses:');
      
      for (const pkg of packages) {
        console.log(`\n🔍 Checking: ${pkg.full_name} (${pkg.email})`);
        console.log(`   Amount: €${pkg.discounted_price}`);
        console.log(`   Current Status: ${pkg.payment_status}`);
        console.log(`   Mollie ID: ${pkg.mollie_payment_id}`);
        
        if (pkg.mollie_payment_id && pkg.mollie_payment_id !== 'test_direct_insert') {
          try {
            // Check with Mollie API
            const mollieLiveKey = process.env.MOLLIE_LIVE_KEY;
            const mollieTestKey = process.env.MOLLIE_TEST_KEY;
            
            const keys = [
              { key: mollieLiveKey, type: 'LIVE' },
              { key: mollieTestKey, type: 'TEST' }
            ].filter(k => k.key);

            let mollieStatus = null;
            let molliePaidAt = null;

            for (const { key, type } of keys) {
              try {
                const response = await fetch(`https://api.mollie.com/v2/payments/${pkg.mollie_payment_id}`, {
                  headers: {
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json'
                  }
                });

                if (response.ok) {
                  const payment = await response.json();
                  mollieStatus = payment.status;
                  molliePaidAt = payment.paidAt;
                  console.log(`   ✅ Mollie ${type} Status: ${mollieStatus}`);
                  if (molliePaidAt) {
                    console.log(`   💰 Paid at: ${molliePaidAt}`);
                  }
                  break;
                }
              } catch (error) {
                // Try next key
              }
            }

            // Update database if status changed
            if (mollieStatus && mollieStatus !== pkg.payment_status) {
              let newStatus = pkg.payment_status;
              
              if (mollieStatus === 'paid') {
                newStatus = 'paid';
              } else if (mollieStatus === 'expired') {
                newStatus = 'expired';
              } else if (mollieStatus === 'pending') {
                newStatus = 'pending';
              }

              if (newStatus !== pkg.payment_status) {
                console.log(`   🔄 Updating status: ${pkg.payment_status} → ${newStatus}`);
                
                const { error: updateError } = await supabase
                  .from('prelaunch_packages')
                  .update({ 
                    payment_status: newStatus,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', pkg.id);

                if (updateError) {
                  console.error(`   ❌ Update error:`, updateError);
                } else {
                  console.log(`   ✅ Status updated successfully`);
                }
              }
            } else if (mollieStatus === pkg.payment_status) {
              console.log(`   ✅ Status already correct: ${mollieStatus}`);
            }

          } catch (error) {
            console.error(`   ❌ Error checking Mollie:`, error.message);
          }
        } else {
          console.log(`   ⚠️ No valid Mollie ID (test payment)`);
        }
      }
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

checkAllMollieStatuses();
