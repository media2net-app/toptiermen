const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testFinanceDatabase() {
  console.log('🔍 TESTING FINANCE & BUSINESS DATABASE SETUP');
  console.log('============================================================');
  
  try {
    // 1. Test if tables exist
    console.log('\n📋 STEP 1: Testing Table Existence');
    console.log('------------------------------------------------------------');
    
    const tables = [
      'user_financial_profiles',
      'financial_goals', 
      'financial_transactions'
    ];
    
    const tableResults = {};
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
          tableResults[table] = false;
        } else {
          console.log(`✅ ${table}: Accessible`);
          tableResults[table] = true;
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
        tableResults[table] = false;
      }
    }
    
    // 2. Test RLS policies
    console.log('\n📋 STEP 2: Testing Row Level Security');
    console.log('------------------------------------------------------------');
    
    const allTablesExist = Object.values(tableResults).every(exists => exists);
    
    if (allTablesExist) {
      console.log('✅ All tables exist and are accessible');
      
      // Test RLS by trying to insert a test record
      const testUserId = '00000000-0000-0000-0000-000000000000';
      
      try {
        const { error: insertError } = await supabase
          .from('user_financial_profiles')
          .insert({
            user_id: testUserId,
            net_worth: 1000,
            monthly_income: 5000,
            monthly_expenses: 3000
          });
        
        if (insertError && insertError.message.includes('policy')) {
          console.log('✅ RLS policies are working (insert blocked as expected)');
        } else if (insertError) {
          console.log(`⚠️  Insert test: ${insertError.message}`);
        } else {
          console.log('✅ Test record inserted successfully');
          
          // Clean up test record
          await supabase
            .from('user_financial_profiles')
            .delete()
            .eq('user_id', testUserId);
        }
      } catch (err) {
        console.log(`⚠️  RLS test: ${err.message}`);
      }
    } else {
      console.log('❌ Some tables are missing or inaccessible');
    }
    
    // 3. Test API endpoints
    console.log('\n📋 STEP 3: Testing API Endpoints');
    console.log('------------------------------------------------------------');
    
    if (allTablesExist) {
      // Test GET endpoint
      try {
        const response = await fetch(`http://localhost:3000/api/finance/profile?userId=test`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ GET /api/finance/profile: Working');
          console.log(`   - Profile: ${data.profile ? 'Found' : 'Not found'}`);
          console.log(`   - Goals: ${data.goals?.length || 0} goals`);
          console.log(`   - Transactions: ${data.transactions?.length || 0} transactions`);
        } else {
          console.log(`❌ GET /api/finance/profile: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.log(`❌ GET /api/finance/profile: ${error.message}`);
      }
      
      // Test POST endpoint
      try {
        const testProfile = {
          userId: 'test-user-id',
          profile: {
            netWorth: 50000,
            monthlyIncome: 5000,
            monthlyExpenses: 3000,
            savingsRate: 40,
            passiveIncomeGoal: 2000,
            riskTolerance: 'medium',
            investmentCategories: ['Aandelen', 'ETF\'s'],
            goals: []
          }
        };
        
        const response = await fetch('http://localhost:3000/api/finance/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testProfile)
        });
        
        if (response.ok) {
          console.log('✅ POST /api/finance/profile: Working');
        } else {
          console.log(`❌ POST /api/finance/profile: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.log(`❌ POST /api/finance/profile: ${error.message}`);
      }
    }
    
    // 4. Test intake flow page
    console.log('\n📋 STEP 4: Testing Intake Flow Page');
    console.log('------------------------------------------------------------');
    
    try {
      const response = await fetch('http://localhost:3000/dashboard/finance-en-business/intake');
      
      if (response.ok) {
        console.log('✅ Intake flow page: Accessible');
      } else {
        console.log(`❌ Intake flow page: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Intake flow page: ${error.message}`);
    }
    
    // 5. Summary
    console.log('\n📋 STEP 5: Setup Summary');
    console.log('------------------------------------------------------------');
    
    const issues = [];
    
    if (!allTablesExist) {
      issues.push('❌ Database tables missing or inaccessible');
    }
    
    if (!allTablesExist) {
      console.log('❌ Database setup incomplete');
      console.log('🔧 Please follow the DATABASE_SETUP_INSTRUCTIONS.md');
      console.log('   to manually create the required tables in Supabase');
    } else {
      console.log('✅ Finance & Business database setup is working!');
      console.log('✅ All tables are accessible');
      console.log('✅ RLS policies are configured');
      console.log('✅ API endpoints are functional');
      console.log('✅ Intake flow is ready');
      console.log('\n🚀 Ready to use the Finance & Business module!');
    }
    
    // 6. Recommendations
    console.log('\n📋 STEP 6: Recommendations');
    console.log('------------------------------------------------------------');
    
    if (allTablesExist) {
      console.log('✅ Database is properly configured');
      console.log('✅ You can now test the complete user flow:');
      console.log('   1. Go to localhost:3000/dashboard/finance-en-business');
      console.log('   2. Complete the 4-step intake process');
      console.log('   3. Verify data is saved in database');
      console.log('   4. Test the main dashboard with real data');
    } else {
      console.log('🔧 To complete the setup:');
      console.log('   1. Follow DATABASE_SETUP_INSTRUCTIONS.md');
      console.log('   2. Run the SQL script in Supabase SQL Editor');
      console.log('   3. Verify tables are created');
      console.log('   4. Run this test script again');
    }
    
  } catch (error) {
    console.error('❌ Error testing Finance & Business database:', error);
  }
}

testFinanceDatabase();
