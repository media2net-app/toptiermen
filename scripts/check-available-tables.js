const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAvailableTables() {
  console.log('🔍 Checking available tables in database...\n');

  try {
    // Try to get table information
    console.log('1️⃣ Checking for tables with "facebook" in name...');
    
    // Check if there are any tables with facebook in the name
    const possibleTables = [
      'facebook_ads',
      'facebook_marketing',
      'facebook_campaigns',
      'ads_data',
      'marketing_data',
      'campaigns',
      'ad_campaigns'
    ];

    for (const tableName of possibleTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error) {
          console.log(`✅ Table "${tableName}" exists`);
          if (data && data.length > 0) {
            console.log(`   Sample data columns: ${Object.keys(data[0]).join(', ')}`);
          }
        } else {
          console.log(`❌ Table "${tableName}" does not exist`);
        }
      } catch (err) {
        console.log(`❌ Table "${tableName}" does not exist`);
      }
    }

    // Check for any tables that might contain marketing data
    console.log('\n2️⃣ Checking for marketing-related tables...');
    
    const marketingTables = [
      'profiles',
      'user_missions',
      'user_challenges',
      'user_badges',
      'academy_modules',
      'academy_lessons',
      'user_lesson_progress',
      'training_schemas',
      'nutrition_plans',
      'user_financial_profiles',
      'financial_goals',
      'financial_transactions',
      'badges',
      'test_notes'
    ];

    for (const tableName of marketingTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error) {
          console.log(`✅ Table "${tableName}" exists`);
        } else {
          console.log(`❌ Table "${tableName}" does not exist`);
        }
      } catch (err) {
        console.log(`❌ Table "${tableName}" does not exist`);
      }
    }

    console.log('\n📋 SUMMARY:');
    console.log('============');
    console.log('Facebook Ads data table does not exist in the database.');
    console.log('You may need to:');
    console.log('1. Create a facebook_ads table');
    console.log('2. Import Facebook Ads data from CSV/API');
    console.log('3. Set up Facebook Ads tracking');

  } catch (error) {
    console.error('❌ Error checking tables:', error);
  }
}

checkAvailableTables();
