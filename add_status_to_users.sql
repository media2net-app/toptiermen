-- Add status column to users table and create last login tracking
-- Run this SQL in your Supabase SQL editor

-- 1. Add status column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));

-- 2. Update existing users to have 'active' status
UPDATE users 
SET status = 'active' 
WHERE status IS NULL;

-- 3. Create function to update last_login when user signs in
CREATE OR REPLACE FUNCTION update_user_last_login()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the last_login timestamp in the users table
  UPDATE users 
  SET last_login = NOW() 
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create trigger to automatically update last_login on sign in
DROP TRIGGER IF EXISTS on_auth_user_sign_in ON auth.users;
CREATE TRIGGER on_auth_user_sign_in
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION update_user_last_login();

-- 5. Add index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

-- 6. Add comments for documentation
COMMENT ON COLUMN users.status IS 'User account status: active, inactive, or suspended';
COMMENT ON COLUMN users.last_login IS 'Timestamp of the user''s last login to the application'; 