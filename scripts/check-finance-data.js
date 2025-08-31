const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkFinanceData() {
  console.log('🔍 Checking Finance & Business data...\n');

  try {
    // Get user ID for Chiel
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', 'chiel@media2net.nl');

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.error('❌ User Chiel not found');
      return;
    }

    const userId = profiles[0].id;
    console.log(`👤 Found user: ${profiles[0].full_name} (${profiles[0].email})`);
    console.log(`🆔 User ID: ${userId}\n`);

    // Check financial profile
    console.log('📊 FINANCIAL PROFILE:');
    const { data: financialProfile, error: profileError } = await supabase
      .from('user_financial_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('❌ Error fetching financial profile:', profileError);
    } else if (financialProfile) {
      console.log('✅ Financial profile found:');
      console.log(`   Net Worth: €${financialProfile.net_worth?.toLocaleString() || 0}`);
      console.log(`   Monthly Income: €${financialProfile.monthly_income?.toLocaleString() || 0}`);
      console.log(`   Monthly Expenses: €${financialProfile.monthly_expenses?.toLocaleString() || 0}`);
      console.log(`   Savings Rate: ${financialProfile.savings_rate || 0}%`);
      console.log(`   Passive Income Goal: €${financialProfile.passive_income_goal?.toLocaleString() || 0}`);
      console.log(`   Risk Tolerance: ${financialProfile.risk_tolerance || 'N/A'}`);
      console.log(`   Investment Categories: ${financialProfile.investment_categories?.join(', ') || 'None'}`);
      console.log(`   Created: ${financialProfile.created_at}`);
    } else {
      console.log('❌ No financial profile found');
    }

    // Check financial goals
    console.log('\n🎯 FINANCIAL GOALS:');
    const { data: goals, error: goalsError } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', userId);

    if (goalsError) {
      console.error('❌ Error fetching goals:', goalsError);
    } else if (goals && goals.length > 0) {
      console.log(`✅ Found ${goals.length} goal(s):`);
      goals.forEach((goal, index) => {
        console.log(`   ${index + 1}. ${goal.title}`);
        console.log(`      Amount: €${goal.target_amount?.toLocaleString() || 0}`);
        console.log(`      Target Date: ${goal.target_date || 'N/A'}`);
        console.log(`      Category: ${goal.category || 'N/A'}`);
        console.log(`      Created: ${goal.created_at}`);
        console.log('');
      });
    } else {
      console.log('❌ No financial goals found');
    }

    // Check financial transactions
    console.log('💰 FINANCIAL TRANSACTIONS:');
    const { data: transactions, error: transactionsError } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('user_id', userId);

    if (transactionsError) {
      console.error('❌ Error fetching transactions:', transactionsError);
    } else if (transactions && transactions.length > 0) {
      console.log(`✅ Found ${transactions.length} transaction(s):`);
      transactions.forEach((transaction, index) => {
        console.log(`   ${index + 1}. ${transaction.description}`);
        console.log(`      Amount: €${transaction.amount?.toLocaleString() || 0}`);
        console.log(`      Type: ${transaction.type || 'N/A'}`);
        console.log(`      Category: ${transaction.category || 'N/A'}`);
        console.log(`      Date: ${transaction.transaction_date || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ No financial transactions found');
    }

    // Check if data is being displayed correctly on the frontend
    console.log('🌐 FRONTEND DATA CHECK:');
    console.log('   Checking if the Finance & Business page is using the correct data...');
    
    // Test the API endpoint
    const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/finance/profile?userId=${userId}`);
    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      console.log('✅ API endpoint working');
      console.log(`   Profile data available: ${!!apiData.profile}`);
      console.log(`   Goals count: ${apiData.goals?.length || 0}`);
      console.log(`   Transactions count: ${apiData.transactions?.length || 0}`);
    } else {
      console.log('❌ API endpoint not working');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkFinanceData();
