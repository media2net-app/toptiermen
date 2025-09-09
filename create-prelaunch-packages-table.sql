-- Create table for prelaunch package purchases
CREATE TABLE IF NOT EXISTS prelaunch_packages (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  package_id VARCHAR(50) NOT NULL,
  package_name VARCHAR(255) NOT NULL,
  payment_period VARCHAR(50) NOT NULL, -- 'monthly' or 'yearly'
  original_price DECIMAL(10,2) NOT NULL,
  discounted_price DECIMAL(10,2) NOT NULL,
  discount_percentage INTEGER DEFAULT 50,
  payment_method VARCHAR(50) NOT NULL, -- 'monthly' or 'one_time'
  mollie_payment_id VARCHAR(255),
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'cancelled'
  is_test_payment BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prelaunch_packages_email ON prelaunch_packages(email);
CREATE INDEX IF NOT EXISTS idx_prelaunch_packages_package_id ON prelaunch_packages(package_id);
CREATE INDEX IF NOT EXISTS idx_prelaunch_packages_payment_status ON prelaunch_packages(payment_status);
CREATE INDEX IF NOT EXISTS idx_prelaunch_packages_created_at ON prelaunch_packages(created_at);

-- Add RLS policies
ALTER TABLE prelaunch_packages ENABLE ROW LEVEL SECURITY;

-- Policy for admin users to view all records
CREATE POLICY "Admin can view all prelaunch packages" ON prelaunch_packages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Policy for admin users to insert records
CREATE POLICY "Admin can insert prelaunch packages" ON prelaunch_packages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Policy for admin users to update records
CREATE POLICY "Admin can update prelaunch packages" ON prelaunch_packages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
