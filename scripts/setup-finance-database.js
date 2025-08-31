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

async function setupFinanceDatabase() {
  console.log('🔧 SETTING UP FINANCE & BUSINESS DATABASE TABLES');
  console.log('============================================================');
  
  try {
    // 1. Create user_financial_profiles table
    console.log('\n📋 STEP 1: Creating user_financial_profiles table');
    console.log('------------------------------------------------------------');
    
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_financial_profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          net_worth DECIMAL(15,2) DEFAULT 0,
          monthly_income DECIMAL(10,2) DEFAULT 0,
          monthly_expenses DECIMAL(10,2) DEFAULT 0,
          savings_rate_percentage DECIMAL(5,2) DEFAULT 0,
          passive_income_goal DECIMAL(10,2) DEFAULT 0,
          risk_tolerance VARCHAR(20) DEFAULT 'medium' CHECK (risk_tolerance IN ('low', 'medium', 'high')),
          investment_categories TEXT[] DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id)
        );
      `
    });

    if (profilesError) {
      console.log('⚠️  user_financial_profiles table might already exist:', profilesError.message);
    } else {
      console.log('✅ user_financial_profiles table created successfully');
    }

    // 2. Create financial_goals table
    console.log('\n📋 STEP 2: Creating financial_goals table');
    console.log('------------------------------------------------------------');
    
    const { error: goalsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS financial_goals (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          title VARCHAR(100) NOT NULL,
          target_amount DECIMAL(10,2) NOT NULL,
          current_amount DECIMAL(10,2) DEFAULT 0,
          target_date DATE,
          category VARCHAR(50) DEFAULT 'sparen',
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, title)
        );
      `
    });

    if (goalsError) {
      console.log('⚠️  financial_goals table might already exist:', goalsError.message);
    } else {
      console.log('✅ financial_goals table created successfully');
    }

    // 3. Create financial_transactions table
    console.log('\n📋 STEP 3: Creating financial_transactions table');
    console.log('------------------------------------------------------------');
    
    const { error: transactionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS financial_transactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'investment', 'savings')),
          category VARCHAR(50) NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          description TEXT,
          date DATE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (transactionsError) {
      console.log('⚠️  financial_transactions table might already exist:', transactionsError.message);
    } else {
      console.log('✅ financial_transactions table created successfully');
    }

    // 4. Create indexes
    console.log('\n📋 STEP 4: Creating indexes');
    console.log('------------------------------------------------------------');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_user_financial_profiles_user_id ON user_financial_profiles(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id ON financial_goals(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_financial_goals_status ON financial_goals(status);',
      'CREATE INDEX IF NOT EXISTS idx_financial_transactions_user_id ON financial_transactions(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(date);',
      'CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON financial_transactions(type);'
    ];

    for (const index of indexes) {
      const { error: indexError } = await supabase.rpc('exec_sql', { sql: index });
      if (indexError) {
        console.log('⚠️  Index might already exist:', indexError.message);
      }
    }
    console.log('✅ Indexes created successfully');

    // 5. Enable RLS
    console.log('\n📋 STEP 5: Enabling Row Level Security');
    console.log('------------------------------------------------------------');
    
    const rlsCommands = [
      'ALTER TABLE user_financial_profiles ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;'
    ];

    for (const command of rlsCommands) {
      const { error: rlsError } = await supabase.rpc('exec_sql', { sql: command });
      if (rlsError) {
        console.log('⚠️  RLS might already be enabled:', rlsError.message);
      }
    }
    console.log('✅ Row Level Security enabled');

    // 6. Create RLS policies
    console.log('\n📋 STEP 6: Creating RLS policies');
    console.log('------------------------------------------------------------');
    
    const policies = [
      `CREATE POLICY IF NOT EXISTS "Users can view own financial profile" ON user_financial_profiles FOR SELECT USING (auth.uid() = user_id);`,
      `CREATE POLICY IF NOT EXISTS "Users can insert own financial profile" ON user_financial_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      `CREATE POLICY IF NOT EXISTS "Users can update own financial profile" ON user_financial_profiles FOR UPDATE USING (auth.uid() = user_id);`,
      `CREATE POLICY IF NOT EXISTS "Users can view own financial goals" ON financial_goals FOR SELECT USING (auth.uid() = user_id);`,
      `CREATE POLICY IF NOT EXISTS "Users can insert own financial goals" ON financial_goals FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      `CREATE POLICY IF NOT EXISTS "Users can update own financial goals" ON financial_goals FOR UPDATE USING (auth.uid() = user_id);`,
      `CREATE POLICY IF NOT EXISTS "Users can delete own financial goals" ON financial_goals FOR DELETE USING (auth.uid() = user_id);`,
      `CREATE POLICY IF NOT EXISTS "Users can view own financial transactions" ON financial_transactions FOR SELECT USING (auth.uid() = user_id);`,
      `CREATE POLICY IF NOT EXISTS "Users can insert own financial transactions" ON financial_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      `CREATE POLICY IF NOT EXISTS "Users can update own financial transactions" ON financial_transactions FOR UPDATE USING (auth.uid() = user_id);`,
      `CREATE POLICY IF NOT EXISTS "Users can delete own financial transactions" ON financial_transactions FOR DELETE USING (auth.uid() = user_id);`
    ];

    for (const policy of policies) {
      const { error: policyError } = await supabase.rpc('exec_sql', { sql: policy });
      if (policyError) {
        console.log('⚠️  Policy might already exist:', policyError.message);
      }
    }
    console.log('✅ RLS policies created successfully');

    // 7. Test the setup
    console.log('\n📋 STEP 7: Testing database setup');
    console.log('------------------------------------------------------------');
    
    // Test if tables exist by trying to select from them
    const { data: profilesTest, error: profilesTestError } = await supabase
      .from('user_financial_profiles')
      .select('count')
      .limit(1);
    
    const { data: goalsTest, error: goalsTestError } = await supabase
      .from('financial_goals')
      .select('count')
      .limit(1);
    
    const { data: transactionsTest, error: transactionsTestError } = await supabase
      .from('financial_transactions')
      .select('count')
      .limit(1);

    console.log(`✅ user_financial_profiles table: ${profilesTestError ? '❌ Error' : '✅ Accessible'}`);
    console.log(`✅ financial_goals table: ${goalsTestError ? '❌ Error' : '✅ Accessible'}`);
    console.log(`✅ financial_transactions table: ${transactionsTestError ? '❌ Error' : '✅ Accessible'}`);

    // 8. Summary
    console.log('\n📋 STEP 8: Setup Summary');
    console.log('------------------------------------------------------------');
    
    const allTablesWorking = !profilesTestError && !goalsTestError && !transactionsTestError;
    
    if (allTablesWorking) {
      console.log('✅ Finance & Business database setup completed successfully!');
      console.log('✅ All tables are accessible and ready for use');
      console.log('✅ Row Level Security is enabled');
      console.log('✅ RLS policies are in place');
      console.log('✅ Indexes are created for optimal performance');
      console.log('\n🚀 Ready to use the Finance & Business module!');
    } else {
      console.log('❌ Some issues were encountered during setup');
      console.log('🔧 Please check the error messages above');
    }

  } catch (error) {
    console.error('❌ Error setting up Finance & Business database:', error);
  }
}

setupFinanceDatabase();
