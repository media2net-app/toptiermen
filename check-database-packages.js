require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabasePackages() {
  console.log('🔍 Checking prelaunch_packages table...');
  
  try {
    // Try to access the table directly to see if it exists
    console.log('🔍 Checking if prelaunch_packages table exists...');

    // Get count
    const { count, error: countError } = await supabase
      .from('prelaunch_packages')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error getting count:', countError);
      return;
    }

    console.log('📊 Total records:', count);

    // Get all data
    const { data: packages, error: dataError } = await supabase
      .from('prelaunch_packages')
      .select('*')
      .order('created_at', { ascending: false });

    if (dataError) {
      console.error('❌ Error fetching data:', dataError);
      return;
    }

    console.log('✅ Successfully fetched packages:', packages?.length || 0);
    
    if (packages && packages.length > 0) {
      console.log('\n📋 Package details:');
      packages.forEach((pkg, index) => {
        console.log(`${index + 1}. ${pkg.full_name} (${pkg.email})`);
        console.log(`   Package: ${pkg.package_name}`);
        console.log(`   Status: ${pkg.payment_status}`);
        console.log(`   Price: €${pkg.discounted_price}`);
        console.log(`   Date: ${pkg.created_at}`);
        console.log(`   Test: ${pkg.is_test_payment ? 'Yes' : 'No'}`);
        console.log('');
      });
    } else {
      console.log('❌ No packages found in database');
    }

    // Check for any other tables that might contain payment data
    console.log('\n🔍 Checking for other payment-related tables...');
    
    // Try to access common table names
    const commonTables = ['payments', 'mollie_payments', 'purchases', 'orders', 'transactions'];
    
    for (const tableName of commonTables) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          console.log(`✅ Table ${tableName} exists with ${count} records`);
        }
      } catch (err) {
        // Table doesn't exist, which is fine
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkDatabasePackages();
