require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabaseSchema() {
  try {
    console.log('🔍 Checking complete database schema...\n');
    
    const tables = [
      'profiles',
      'onboarding_status',
      'user_badges',
      'user_missions',
      'user_nutrition_plans',
      'user_goals',
      'user_habits',
      'user_habit_logs',
      'user_daily_progress',
      'forum_posts',
      'academy_progress',
      'user_challenges',
      'user_progress',
      'badges'
    ];
    
    const schemaInfo = {};
    
    for (const table of tables) {
      console.log(`📋 Checking table: ${table}`);
      
      try {
        // Try to get one record to check if table exists and get column info
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          if (error.code === '42P01') {
            console.log(`   ❌ Table ${table} does not exist`);
            schemaInfo[table] = { exists: false, columns: [] };
          } else {
            console.log(`   ⚠️ Error accessing ${table}:`, error.message);
            schemaInfo[table] = { exists: true, error: error.message, columns: [] };
          }
        } else {
          console.log(`   ✅ Table ${table} exists`);
          
          // Get column information by trying to insert a test record
          const testRecord = {};
          const sampleData = {
            profiles: { email: 'test@test.com' },
            onboarding_status: { user_id: '00000000-0000-0000-0000-000000000000' },
            user_badges: { user_id: '00000000-0000-0000-0000-000000000000', badge_id: '00000000-0000-0000-0000-000000000000' },
            user_missions: { user_id: '00000000-0000-0000-0000-000000000000', title: 'Test Mission' },
            user_nutrition_plans: { user_id: '00000000-0000-0000-0000-000000000000', plan_type: 'test' },
            user_goals: { user_id: '00000000-0000-0000-0000-000000000000', title: 'Test Goal' },
            user_habits: { user_id: '00000000-0000-0000-0000-000000000000', title: 'Test Habit' },
            user_habit_logs: { user_id: '00000000-0000-0000-0000-000000000000', habit_id: '00000000-0000-0000-0000-000000000000' },
            user_daily_progress: { user_id: '00000000-0000-0000-0000-000000000000', date: '2025-01-01' },
            forum_posts: { user_id: '00000000-0000-0000-0000-000000000000', title: 'Test Post' },
            academy_progress: { user_id: '00000000-0000-0000-0000-000000000000', lesson_title: 'Test Lesson' },
            user_challenges: { user_id: '00000000-0000-0000-0000-000000000000', challenge_name: 'Test Challenge' },
            user_progress: { user_id: '00000000-0000-0000-0000-000000000000' },
            badges: { title: 'Test Badge' }
          };
          
          // Try to get column info by attempting an insert with minimal data
          try {
            const { error: insertError } = await supabase
              .from(table)
              .insert(sampleData[table] || {});
            
            if (insertError) {
              // Parse the error to understand what columns are expected
              const errorMessage = insertError.message;
              console.log(`   📝 Expected columns from error: ${errorMessage}`);
              
              // Extract column names from error message
              const columnMatches = errorMessage.match(/column "([^"]+)"/g);
              const columns = columnMatches ? columnMatches.map(match => match.replace('column "', '').replace('"', '')) : [];
              
              schemaInfo[table] = { 
                exists: true, 
                columns: columns,
                error: errorMessage 
              };
            } else {
              schemaInfo[table] = { exists: true, columns: ['basic structure exists'] };
            }
          } catch (insertError) {
            schemaInfo[table] = { exists: true, columns: [], error: insertError.message };
          }
        }
        
      } catch (error) {
        console.log(`   ❌ Error checking ${table}:`, error.message);
        schemaInfo[table] = { exists: false, error: error.message, columns: [] };
      }
    }
    
    console.log('\n📊 Database Schema Summary:');
    console.log('='.repeat(50));
    
    Object.entries(schemaInfo).forEach(([table, info]) => {
      if (info.exists) {
        console.log(`✅ ${table}: ${info.columns.length > 0 ? info.columns.join(', ') : 'Structure exists'}`);
        if (info.error) {
          console.log(`   ⚠️ Note: ${info.error}`);
        }
      } else {
        console.log(`❌ ${table}: Table missing`);
      }
    });
    
    console.log('\n💡 Schema Analysis:');
    console.log('==================');
    
    const existingTables = Object.entries(schemaInfo).filter(([_, info]) => info.exists);
    const missingTables = Object.entries(schemaInfo).filter(([_, info]) => !info.exists);
    
    console.log(`✅ Existing tables: ${existingTables.length}`);
    console.log(`❌ Missing tables: ${missingTables.length}`);
    
    if (missingTables.length > 0) {
      console.log('\n🔧 Missing tables that need to be created:');
      missingTables.forEach(([table, _]) => {
        console.log(`   - ${table}`);
      });
    }
    
    console.log('\n🎯 Ready for test user creation with current schema!');
    
  } catch (error) {
    console.error('❌ Error checking database schema:', error);
  }
}

checkDatabaseSchema();
