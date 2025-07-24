const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createUserPreferencesTable() {
  try {
    console.log('🔧 Creating user_preferences table...');

    // Create table
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS user_preferences (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          preference_key VARCHAR(100) NOT NULL,
          preference_value TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, preference_key)
        );
      `
    });

    if (createError) {
      console.log('❌ Error creating table:', createError.message);
      return;
    }

    console.log('✅ Table created successfully');

    // Create indexes
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON user_preferences(preference_key);
      `
    });

    if (indexError) {
      console.log('❌ Error creating indexes:', indexError.message);
    } else {
      console.log('✅ Indexes created successfully');
    }

    // Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql_query: `ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;`
    });

    if (rlsError) {
      console.log('❌ Error enabling RLS:', rlsError.message);
    } else {
      console.log('✅ RLS enabled successfully');
    }

    // Create policies
    const policies = [
      {
        name: 'Users can view own preferences',
        sql: `CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);`
      },
      {
        name: 'Users can insert own preferences',
        sql: `CREATE POLICY "Users can insert own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);`
      },
      {
        name: 'Users can update own preferences',
        sql: `CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);`
      },
      {
        name: 'Users can delete own preferences',
        sql: `CREATE POLICY "Users can delete own preferences" ON user_preferences FOR DELETE USING (auth.uid() = user_id);`
      }
    ];

    for (const policy of policies) {
      const { error } = await supabase.rpc('exec_sql', { sql_query: policy.sql });
      if (error) {
        console.log(`❌ Error creating policy "${policy.name}":`, error.message);
      } else {
        console.log(`✅ Policy "${policy.name}" created successfully`);
      }
    }

    // Insert default preferences for existing users
    const { error: insertError } = await supabase.rpc('exec_sql', {
      sql_query: `
        INSERT INTO user_preferences (user_id, preference_key, preference_value)
        SELECT 
          id as user_id,
          'daily_completion_dismissed' as preference_key,
          'false' as preference_value
        FROM users
        ON CONFLICT (user_id, preference_key) DO NOTHING;
      `
    });

    if (insertError) {
      console.log('❌ Error inserting default preferences:', insertError.message);
    } else {
      console.log('✅ Default preferences inserted successfully');
    }

    const { error: insertError2 } = await supabase.rpc('exec_sql', {
      sql_query: `
        INSERT INTO user_preferences (user_id, preference_key, preference_value)
        SELECT 
          id as user_id,
          'almost_completed_dismissed' as preference_key,
          'false' as preference_value
        FROM users
        ON CONFLICT (user_id, preference_key) DO NOTHING;
      `
    });

    if (insertError2) {
      console.log('❌ Error inserting almost completed preferences:', insertError2.message);
    } else {
      console.log('✅ Almost completed preferences inserted successfully');
    }

    const { error: insertError3 } = await supabase.rpc('exec_sql', {
      sql_query: `
        INSERT INTO user_preferences (user_id, preference_key, preference_value)
        SELECT 
          id as user_id,
          'last_dismiss_date' as preference_key,
          '2024-01-01' as preference_value
        FROM users
        ON CONFLICT (user_id, preference_key) DO NOTHING;
      `
    });

    if (insertError3) {
      console.log('❌ Error inserting last dismiss date preferences:', insertError3.message);
    } else {
      console.log('✅ Last dismiss date preferences inserted successfully');
    }

    console.log('🎉 User preferences table setup completed!');

  } catch (error) {
    console.error('❌ Error in createUserPreferencesTable:', error);
  }
}

createUserPreferencesTable(); 