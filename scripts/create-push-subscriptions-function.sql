-- Create function to get push subscriptions with user details
-- Execute this in Supabase Dashboard > SQL Editor

-- Create function to get push subscriptions with user details
CREATE OR REPLACE FUNCTION get_push_subscriptions_with_users()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  endpoint TEXT,
  p256dh_key TEXT,
  auth_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  user_full_name TEXT,
  user_email TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.id,
    ps.user_id,
    ps.endpoint,
    ps.p256dh_key,
    ps.auth_key,
    ps.created_at,
    ps.updated_at,
    p.full_name as user_full_name,
    p.email as user_email
  FROM push_subscriptions ps
  LEFT JOIN profiles p ON ps.user_id = p.id
  ORDER BY ps.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_push_subscriptions_with_users() TO authenticated;

-- Test the function
SELECT * FROM get_push_subscriptions_with_users() LIMIT 5;
