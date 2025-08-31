-- Finance & Business Database Tables
-- This script creates the necessary tables for the Finance & Business module

-- User Financial Profiles
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

-- Financial Goals
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

-- Financial Transactions
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_financial_profiles_user_id ON user_financial_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id ON financial_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_goals_status ON financial_goals(status);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_user_id ON financial_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON financial_transactions(type);

-- Enable Row Level Security (RLS)
ALTER TABLE user_financial_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own financial profile" ON user_financial_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial profile" ON user_financial_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial profile" ON user_financial_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own financial goals" ON financial_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial goals" ON financial_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial goals" ON financial_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own financial goals" ON financial_goals
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own financial transactions" ON financial_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial transactions" ON financial_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial transactions" ON financial_transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own financial transactions" ON financial_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_financial_profiles_updated_at 
  BEFORE UPDATE ON user_financial_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_goals_updated_at 
  BEFORE UPDATE ON financial_goals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional)
-- INSERT INTO user_financial_profiles (user_id, net_worth, monthly_income, monthly_expenses, savings_rate_percentage, passive_income_goal, risk_tolerance, investment_categories)
-- VALUES 
--   ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', 50000, 5000, 3000, 40, 2000, 'medium', ARRAY['Aandelen', 'ETF''s', 'Vastgoed']);

-- INSERT INTO financial_goals (user_id, title, target_amount, target_date, category)
-- VALUES 
--   ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', 'Noodfonds', 10000, '2025-12-31', 'sparen'),
--   ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', 'Huis kopen', 500000, '2027-06-30', 'investeren');

COMMIT;
