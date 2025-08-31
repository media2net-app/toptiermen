const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupFacebookAds() {
  console.log('🔧 Setting up Facebook Ads table and data...\n');

  try {
    // 1. Read the SQL file
    console.log('1️⃣ Reading SQL setup file...');
    const sqlPath = path.join(__dirname, 'create-facebook-ads-table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`✅ Found ${statements.length} SQL statements to execute`);

    // 2. Execute each statement
    console.log('\n2️⃣ Executing SQL statements...');
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`   Executing statement ${i + 1}/${statements.length}...`);
          
          // Use RPC to execute SQL
          const { data, error } = await supabase.rpc('exec_sql', {
            sql: statement
          });

          if (error) {
            console.log(`   ⚠️  Statement ${i + 1} had an issue (this might be expected):`, error.message);
          } else {
            console.log(`   ✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.log(`   ⚠️  Statement ${i + 1} failed (this might be expected):`, err.message);
        }
      }
    }

    // 3. Verify the table was created
    console.log('\n3️⃣ Verifying table creation...');
    try {
      const { data: tableCheck, error: tableError } = await supabase
        .from('facebook_ads')
        .select('*')
        .limit(1);

      if (tableError) {
        console.error('❌ Table verification failed:', tableError);
        return;
      }

      console.log('✅ Facebook Ads table exists and is accessible');
    } catch (err) {
      console.error('❌ Table verification failed:', err.message);
      return;
    }

    // 4. Check the data
    console.log('\n4️⃣ Checking imported data...');
    const { data: adsData, error: adsError } = await supabase
      .from('facebook_ads')
      .select('*')
      .order('date', { ascending: false });

    if (adsError) {
      console.error('❌ Error fetching ads data:', adsError);
      return;
    }

    console.log(`✅ Found ${adsData?.length || 0} Facebook Ads records`);

    // 5. Display summary
    if (adsData && adsData.length > 0) {
      console.log('\n📊 FACEBOOK ADS DATA SUMMARY:');
      console.log('==============================');
      
      let totalSpent = 0;
      let totalLeads = 0;
      let totalClicks = 0;
      let totalImpressions = 0;
      const campaigns = {};

      adsData.forEach(ad => {
        totalSpent += parseFloat(ad.spent || 0);
        totalLeads += parseInt(ad.leads || 0);
        totalClicks += parseInt(ad.clicks || 0);
        totalImpressions += parseInt(ad.impressions || 0);

        if (!campaigns[ad.campaign_name]) {
          campaigns[ad.campaign_name] = {
            spent: 0,
            leads: 0,
            clicks: 0,
            impressions: 0
          };
        }

        campaigns[ad.campaign_name].spent += parseFloat(ad.spent || 0);
        campaigns[ad.campaign_name].leads += parseInt(ad.leads || 0);
        campaigns[ad.campaign_name].clicks += parseInt(ad.clicks || 0);
        campaigns[ad.campaign_name].impressions += parseInt(ad.impressions || 0);
      });

      console.log(`💰 Total Spent: €${totalSpent.toFixed(2)}`);
      console.log(`🎯 Total Leads: ${totalLeads}`);
      console.log(`🖱️  Total Clicks: ${totalClicks}`);
      console.log(`👁️  Total Impressions: ${totalImpressions.toLocaleString()}`);
      console.log(`📊 Cost per Lead: €${totalLeads > 0 ? (totalSpent / totalLeads).toFixed(2) : 'N/A'}`);

      console.log('\n🎯 CAMPAIGN BREAKDOWN:');
      Object.keys(campaigns).forEach(campaign => {
        const stats = campaigns[campaign];
        const costPerLead = stats.leads > 0 ? (stats.spent / stats.leads) : 0;
        console.log(`   📋 ${campaign}:`);
        console.log(`      💰 Spent: €${stats.spent.toFixed(2)}`);
        console.log(`      🎯 Leads: ${stats.leads}`);
        console.log(`      📊 Cost per Lead: €${costPerLead.toFixed(2)}`);
      });

      // 6. Budget status
      const budgetLimit = 500;
      const remainingBudget = budgetLimit - totalSpent;
      const budgetPercentage = (totalSpent / budgetLimit) * 100;

      console.log('\n💰 BUDGET STATUS:');
      console.log('=================');
      console.log(`📋 Budget Limit: €${budgetLimit}`);
      console.log(`💸 Total Spent: €${totalSpent.toFixed(2)}`);
      console.log(`💳 Remaining Budget: €${remainingBudget.toFixed(2)}`);
      console.log(`📊 Budget Used: ${budgetPercentage.toFixed(1)}%`);

      if (budgetPercentage >= 90) {
        console.log('⚠️  WARNING: Budget is almost depleted!');
      } else if (budgetPercentage >= 75) {
        console.log('⚠️  WARNING: Budget is 75%+ used');
      } else if (budgetPercentage >= 50) {
        console.log('ℹ️  INFO: Budget is 50%+ used');
      } else {
        console.log('✅ Budget is still available');
      }
    }

    console.log('\n🎉 Facebook Ads setup completed successfully!');
    console.log('You can now run the check-facebook-ads-status.js script to get detailed analytics.');

  } catch (error) {
    console.error('❌ Error in Facebook Ads setup:', error);
  }
}

setupFacebookAds();
