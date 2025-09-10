-- Fix RLS policies for prelaunch_packages table
-- The issue is that the policies are checking for profiles.role = 'admin'
-- but we need to use the service role key for admin operations

-- First, let's check the current policies
SELECT * FROM pg_policies WHERE tablename = 'prelaunch_packages';

-- Drop existing policies
DROP POLICY IF EXISTS "Admin can view all prelaunch packages" ON prelaunch_packages;
DROP POLICY IF EXISTS "Admin can insert prelaunch packages" ON prelaunch_packages;
DROP POLICY IF EXISTS "Admin can update prelaunch packages" ON prelaunch_packages;

-- Create new policies that work with service role
-- Allow service role to do everything (for API endpoints)
CREATE POLICY "Service role can do everything" ON prelaunch_packages
  FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users with admin role to view
CREATE POLICY "Admin users can view all prelaunch packages" ON prelaunch_packages
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow authenticated users with admin role to insert
CREATE POLICY "Admin users can insert prelaunch packages" ON prelaunch_packages
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow authenticated users with admin role to update
CREATE POLICY "Admin users can update prelaunch packages" ON prelaunch_packages
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Also allow service role to bypass RLS entirely for this table
-- This is needed for API endpoints that use service role key
ALTER TABLE prelaunch_packages DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS but with service role bypass
ALTER TABLE prelaunch_packages ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON prelaunch_packages TO service_role;
GRANT ALL ON prelaunch_packages TO authenticated;