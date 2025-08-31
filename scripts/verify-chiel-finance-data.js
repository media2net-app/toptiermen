const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyChielFinanceData() {
  console.log('🔍 Verifying Chiel\'s Finance & Business data...\n');

  try {
    // Get Chiel's user ID
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', 'chiel@media2net.nl')
      .single();

    if (userError) {
      console.error('❌ Error fetching user:', userError);
      return;
    }

    console.log('👤 User found:', {
      id: user.id,
      email: user.email,
      name: user.full_name
    });

    // Check financial profile
    console.log('\n📊 Checking Financial Profile...');
    const { data: profile, error: profileError } = await supabase
      .from('user_financial_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Error fetching financial profile:', profileError);
    } else {
      console.log('✅ Financial Profile found:');
      console.log('   - Net Worth:', profile.net_worth);
      console.log('   - Monthly Income:', profile.monthly_income);
      console.log('   - Monthly Expenses:', profile.monthly_expenses);
      console.log('   - Savings Rate:', profile.savings_rate_percentage + '%');
      console.log('   - Passive Income Goal:', profile.passive_income_goal);
      console.log('   - Risk Tolerance:', profile.risk_tolerance);
      console.log('   - Investment Categories:', profile.investment_categories);
    }

    // Check financial goals
    console.log('\n🎯 Checking Financial Goals...');
    const { data: goals, error: goalsError } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (goalsError) {
      console.error('❌ Error fetching financial goals:', goalsError);
    } else {
      console.log(`✅ Found ${goals.length} financial goals:`);
      goals.forEach((goal, index) => {
        console.log(`   ${index + 1}. ${goal.title}`);
        console.log(`      - Category: ${goal.category}`);
        console.log(`      - Target Amount: €${goal.target_amount}`);
        console.log(`      - Current Amount: €${goal.current_amount}`);
        console.log(`      - Target Date: ${goal.target_date}`);
        console.log(`      - Days Remaining: ${Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24))}`);
      });
    }

    // Check financial transactions
    console.log('\n💰 Checking Financial Transactions...');
    const { data: transactions, error: transactionsError } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(5);

    if (transactionsError) {
      console.error('❌ Error fetching transactions:', transactionsError);
    } else {
      console.log(`✅ Found ${transactions.length} recent transactions`);
      if (transactions.length > 0) {
        transactions.forEach((transaction, index) => {
          console.log(`   ${index + 1}. ${transaction.type} - ${transaction.category}`);
          console.log(`      - Amount: €${transaction.amount}`);
          console.log(`      - Date: ${transaction.date}`);
          console.log(`      - Description: ${transaction.description || 'N/A'}`);
        });
      }
    }

    // Test API endpoint
    console.log('\n🌐 Testing API Endpoint...');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/finance/profile?userId=${user.id}`);
      const apiData = await response.json();
      
      if (response.ok) {
        console.log('✅ API endpoint working correctly');
        console.log('   - Profile data:', apiData.profile ? 'Present' : 'Missing');
        console.log('   - Goals count:', apiData.goals?.length || 0);
        console.log('   - Transactions count:', apiData.transactions?.length || 0);
      } else {
        console.error('❌ API endpoint error:', apiData.error);
      }
    } catch (apiError) {
      console.error('❌ API endpoint test failed:', apiError.message);
    }

    // Summary
    console.log('\n📋 SUMMARY:');
    console.log('   - Financial Profile:', profile ? '✅ Database' : '❌ Missing');
    console.log('   - Financial Goals:', goals?.length > 0 ? `✅ Database (${goals.length} goals)` : '❌ Missing');
    console.log('   - Financial Transactions:', transactions?.length > 0 ? `✅ Database (${transactions.length} transactions)` : '❌ Missing');
    
    const isFullyDatabase = profile && goals?.length > 0;
    console.log(`\n🎯 RESULT: Finance & Business is ${isFullyDatabase ? '✅ 100% DATABASE-DRIVEN' : '❌ NOT FULLY DATABASE-DRIVEN'}`);

  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

verifyChielFinanceData();
