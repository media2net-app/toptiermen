-- Finance & Business Database Tables - Simple Version
-- Run this in Supabase SQL Editor

-- 1. Create user_financial_profiles table
CREATE TABLE IF NOT EXISTS user_financial_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  net_worth DECIMAL(15,2) DEFAULT 0,
  monthly_income DECIMAL(10,2) DEFAULT 0,
  monthly_expenses DECIMAL(10,2) DEFAULT 0,
  savings_rate_percentage DECIMAL(5,2) DEFAULT 0,
  passive_income_goal DECIMAL(10,2) DEFAULT 0,
  risk_tolerance VARCHAR(20) DEFAULT 'medium',
  investment_categories TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create financial_goals table
CREATE TABLE IF NOT EXISTS financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  target_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0,
  target_date DATE,
  category VARCHAR(50) DEFAULT 'sparen',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create financial_transactions table
CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  category VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add unique constraints
ALTER TABLE user_financial_profiles ADD CONSTRAINT IF NOT EXISTS unique_user_financial_profile UNIQUE (user_id);
ALTER TABLE financial_goals ADD CONSTRAINT IF NOT EXISTS unique_user_goal UNIQUE (user_id, title);

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_user_financial_profiles_user_id ON user_financial_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id ON financial_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_goals_status ON financial_goals(status);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_user_id ON financial_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON financial_transactions(type);

-- 6. Enable Row Level Security
ALTER TABLE user_financial_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for user_financial_profiles
CREATE POLICY "Users can view own financial profile" ON user_financial_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial profile" ON user_financial_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial profile" ON user_financial_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- 8. Create RLS policies for financial_goals
CREATE POLICY "Users can view own financial goals" ON financial_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial goals" ON financial_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial goals" ON financial_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own financial goals" ON financial_goals
  FOR DELETE USING (auth.uid() = user_id);

-- 9. Create RLS policies for financial_transactions
CREATE POLICY "Users can view own financial transactions" ON financial_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial transactions" ON financial_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial transactions" ON financial_transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own financial transactions" ON financial_transactions
  FOR DELETE USING (auth.uid() = user_id);
