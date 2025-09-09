-- Fix RLS policies to allow inserts without authentication
-- This is needed for the payment API to work

-- Drop existing policies
DROP POLICY IF EXISTS "Admin can view all prelaunch packages" ON prelaunch_packages;
DROP POLICY IF EXISTS "Admin can insert prelaunch packages" ON prelaunch_packages;
DROP POLICY IF EXISTS "Admin can update prelaunch packages" ON prelaunch_packages;

-- Create new policies that allow inserts without authentication
CREATE POLICY "Allow inserts for payment API" ON prelaunch_packages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view all prelaunch packages" ON prelaunch_packages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can update prelaunch packages" ON prelaunch_packages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
