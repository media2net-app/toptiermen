const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupUserPresence() {
  console.log('🔧 Setting up user presence system...\n');

  try {
    // Create user_presence table
    console.log('📊 Creating user_presence table...');
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS user_presence (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          is_online BOOLEAN DEFAULT false,
          last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (tableError) {
      console.error('❌ Error creating table:', tableError);
      return;
    }

    // Create indexes
    console.log('🔍 Creating indexes...');
    const indexes = [
      'CREATE UNIQUE INDEX IF NOT EXISTS user_presence_user_id_idx ON user_presence(user_id);',
      'CREATE INDEX IF NOT EXISTS user_presence_is_online_idx ON user_presence(is_online);',
      'CREATE INDEX IF NOT EXISTS user_presence_last_seen_idx ON user_presence(last_seen);'
    ];

    for (const index of indexes) {
      const { error } = await supabase.rpc('exec_sql', { sql_query: index });
      if (error) {
        console.error('❌ Error creating index:', error);
      }
    }

    // Enable RLS
    console.log('🔒 Enabling RLS...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql_query: 'ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;'
    });

    if (rlsError) {
      console.error('❌ Error enabling RLS:', rlsError);
    }

    // Create RLS policies
    console.log('📋 Creating RLS policies...');
    const policies = [
      `CREATE POLICY "Users can read all presence data" ON user_presence
       FOR SELECT USING (true);`,
      `CREATE POLICY "Users can update own presence" ON user_presence
       FOR UPDATE USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can insert own presence" ON user_presence
       FOR INSERT WITH CHECK (auth.uid() = user_id);`
    ];

    for (const policy of policies) {
      const { error } = await supabase.rpc('exec_sql', { sql_query: policy });
      if (error) {
        console.error('❌ Error creating policy:', error);
      }
    }

    // Create functions
    console.log('⚙️ Creating functions...');
    const functions = [
      `CREATE OR REPLACE FUNCTION update_user_presence(is_online_status BOOLEAN)
       RETURNS void AS $$
       BEGIN
         INSERT INTO user_presence (user_id, is_online, last_seen)
         VALUES (auth.uid(), is_online_status, NOW())
         ON CONFLICT (user_id)
         DO UPDATE SET 
           is_online = EXCLUDED.is_online,
           last_seen = EXCLUDED.last_seen,
           updated_at = NOW();
       END;
       $$ LANGUAGE plpgsql SECURITY DEFINER;`,
      `CREATE OR REPLACE FUNCTION mark_user_online()
       RETURNS void AS $$
       BEGIN
         PERFORM update_user_presence(true);
       END;
       $$ LANGUAGE plpgsql SECURITY DEFINER;`,
      `CREATE OR REPLACE FUNCTION mark_user_offline()
       RETURNS void AS $$
       BEGIN
         PERFORM update_user_presence(false);
       END;
       $$ LANGUAGE plpgsql SECURITY DEFINER;`
    ];

    for (const func of functions) {
      const { error } = await supabase.rpc('exec_sql', { sql_query: func });
      if (error) {
        console.error('❌ Error creating function:', error);
      }
    }

    // Enable realtime
    console.log('📡 Enabling realtime...');
    const { error: realtimeError } = await supabase.rpc('exec_sql', {
      sql_query: 'ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;'
    });

    if (realtimeError) {
      console.error('❌ Error enabling realtime:', realtimeError);
    }

    // Insert initial presence records
    console.log('👥 Creating initial presence records...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
    } else {
      console.log(`📊 Found ${users.users?.length || 0} users`);
      if (users.users && users.users.length > 0) {
        for (const user of users.users) {
          const { error } = await supabase.rpc('exec_sql', {
            sql_query: `
              INSERT INTO user_presence (user_id, is_online, last_seen)
              VALUES ('${user.id}', false, NOW() - INTERVAL '1 hour')
              ON CONFLICT (user_id) DO NOTHING;
            `
          });
          if (error) {
            console.error(`❌ Error creating presence for user ${user.id}:`, error);
          } else {
            console.log(`✅ Created presence record for user ${user.id}`);
          }
        }
      }
    }

    console.log('\n✅ User presence system setup complete!');
    console.log('🟢 Users can now mark themselves as online/offline');
    console.log('📡 Real-time updates are enabled');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

setupUserPresence(); 