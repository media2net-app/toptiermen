const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function createLoginLogsTable() {
  console.log('🔧 Creating login_logs table...');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Create the table using raw SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create login_logs table to track all login attempts
        CREATE TABLE IF NOT EXISTS login_logs (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          email VARCHAR(255) NOT NULL,
          success BOOLEAN NOT NULL DEFAULT false,
          error_message TEXT,
          ip_address INET,
          user_agent TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          session_id TEXT,
          login_method VARCHAR(50) DEFAULT 'email_password'
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON login_logs(user_id);
        CREATE INDEX IF NOT EXISTS idx_login_logs_email ON login_logs(email);
        CREATE INDEX IF NOT EXISTS idx_login_logs_created_at ON login_logs(created_at);
        CREATE INDEX IF NOT EXISTS idx_login_logs_success ON login_logs(success);

        -- Enable RLS
        ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies
        CREATE POLICY IF NOT EXISTS "Admins can view all login logs" ON login_logs
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.role = 'admin'
            )
          );

        CREATE POLICY IF NOT EXISTS "Users can view own login logs" ON login_logs
          FOR SELECT USING (user_id = auth.uid());

        CREATE POLICY IF NOT EXISTS "Service role can insert login logs" ON login_logs
          FOR INSERT WITH CHECK (true);

        -- Grant permissions
        GRANT SELECT ON login_logs TO authenticated;
        GRANT INSERT ON login_logs TO service_role;
      `
    });

    if (error) {
      console.error('❌ Error creating login_logs table:', error);
      console.log('📋 Please execute this SQL manually in Supabase dashboard:');
      console.log(`
CREATE TABLE login_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id TEXT,
  login_method VARCHAR(50) DEFAULT 'email_password'
);

CREATE INDEX idx_login_logs_user_id ON login_logs(user_id);
CREATE INDEX idx_login_logs_email ON login_logs(email);
CREATE INDEX idx_login_logs_created_at ON login_logs(created_at);
CREATE INDEX idx_login_logs_success ON login_logs(success);

ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all login logs" ON login_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view own login logs" ON login_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can insert login logs" ON login_logs
  FOR INSERT WITH CHECK (true);

GRANT SELECT ON login_logs TO authenticated;
GRANT INSERT ON login_logs TO service_role;
      `);
    } else {
      console.log('✅ Login_logs table created successfully!');
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createLoginLogsTable();
