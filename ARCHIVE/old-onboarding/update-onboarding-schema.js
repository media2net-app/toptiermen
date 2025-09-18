const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateOnboardingSchema() {
  try {
    console.log('🔧 Updating database schema for interactive onboarding...');

    // 1. Add main_goal column to profiles table
    console.log('📝 Adding main_goal to profiles table...');
    const { error: profileError } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE profiles 
        ADD COLUMN IF NOT EXISTS main_goal TEXT;
      `
    });

    if (profileError) {
      console.log('⚠️ Profile update error:', profileError.message);
    } else {
      console.log('✅ Main goal column added to profiles');
    }

    // 2. Add selected_nutrition_plan and selected_challenge to user_preferences
    console.log('📝 Adding nutrition and challenge preferences...');
    const { error: prefError } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE user_preferences 
        ADD COLUMN IF NOT EXISTS selected_nutrition_plan TEXT,
        ADD COLUMN IF NOT EXISTS selected_challenge TEXT;
      `
    });

    if (prefError) {
      console.log('⚠️ Preferences update error:', prefError.message);
    } else {
      console.log('✅ Nutrition and challenge preferences added');
    }

    // 3. Add selected_schema_id to user_training_progress
    console.log('📝 Adding selected_schema_id to user_training_progress...');
    const { error: trainingError } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE user_training_progress 
        ADD COLUMN IF NOT EXISTS selected_schema_id UUID REFERENCES training_schemas(id);
      `
    });

    if (trainingError) {
      console.log('⚠️ Training progress update error:', trainingError.message);
    } else {
      console.log('✅ Selected schema ID added to training progress');
    }

    // 4. Create forum_posts table if it doesn't exist
    console.log('📝 Creating forum_posts table...');
    const { error: forumError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS forum_posts (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          category TEXT NOT NULL DEFAULT 'general',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (forumError) {
      console.log('⚠️ Forum posts table error:', forumError.message);
    } else {
      console.log('✅ Forum posts table created');
    }

    // 5. Add RLS policies for forum_posts
    console.log('📝 Adding RLS policies for forum_posts...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Users can view all forum posts" ON forum_posts
          FOR SELECT USING (true);
          
        CREATE POLICY IF NOT EXISTS "Users can create forum posts" ON forum_posts
          FOR INSERT WITH CHECK (auth.uid() = author_id);
          
        CREATE POLICY IF NOT EXISTS "Users can update their own forum posts" ON forum_posts
          FOR UPDATE USING (auth.uid() = author_id);
          
        CREATE POLICY IF NOT EXISTS "Users can delete their own forum posts" ON forum_posts
          FOR DELETE USING (auth.uid() = author_id);
      `
    });

    if (rlsError) {
      console.log('⚠️ RLS policies error:', rlsError.message);
    } else {
      console.log('✅ RLS policies added for forum_posts');
    }

    // 6. Create sample missions table if it doesn't exist
    console.log('📝 Creating sample missions table...');
    const { error: missionsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS sample_missions (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          category TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (missionsError) {
      console.log('⚠️ Sample missions table error:', missionsError.message);
    } else {
      console.log('✅ Sample missions table created');
    }

    // 7. Insert sample missions
    console.log('📝 Inserting sample missions...');
    const sampleMissions = [
      { id: '1', title: '10.000 stappen per dag', description: 'Beweeg meer en verbeter je conditie', category: 'fitness' },
      { id: '2', title: '30 minuten lezen', description: 'Ontwikkel je kennis en focus', category: 'mindset' },
      { id: '3', title: '€50 sparen', description: 'Bouw je financiële toekomst op', category: 'finance' },
      { id: '4', title: '3 liter water drinken', description: 'Blijf gehydrateerd en gezond', category: 'health' },
      { id: '5', title: '20 minuten mediteren', description: 'Verbeter je mentale welzijn', category: 'mindset' },
      { id: '6', title: 'Gratis workout doen', description: 'Blijf in vorm zonder kosten', category: 'fitness' }
    ];

    for (const mission of sampleMissions) {
      const { error: insertError } = await supabase
        .from('sample_missions')
        .upsert(mission, { onConflict: 'id' });

      if (insertError) {
        console.log(`⚠️ Error inserting mission ${mission.id}:`, insertError.message);
      }
    }

    console.log('✅ Sample missions inserted');

    console.log('🎉 Database schema update completed!');

  } catch (error) {
    console.error('❌ Error updating schema:', error);
  }
}

updateOnboardingSchema(); 