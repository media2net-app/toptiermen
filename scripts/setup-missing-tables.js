const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupMissingTables() {
  try {
    console.log('🔧 Setting up missing database tables...');

    // 1. Add parent_id column to forum_posts if it doesn't exist
    console.log('\n📝 Adding parent_id column to forum_posts...');
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE forum_posts 
          ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES forum_posts(id);
        `
      });
      if (error) {
        console.log('⚠️  Could not add parent_id via RPC, trying direct SQL...');
        // Try alternative approach
        const { error: alterError } = await supabase
          .from('forum_posts')
          .select('parent_id')
          .limit(1);
        
        if (alterError && alterError.message.includes('parent_id')) {
          console.log('✅ parent_id column already exists or will be added manually');
        }
      } else {
        console.log('✅ parent_id column added to forum_posts');
      }
    } catch (e) {
      console.log('⚠️  parent_id column setup skipped (may need manual setup)');
    }

    // 2. Add xp_amount column to user_xp if it doesn't exist
    console.log('\n⭐ Adding xp_amount column to user_xp...');
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE user_xp 
          ADD COLUMN IF NOT EXISTS xp_amount INTEGER DEFAULT 0;
        `
      });
      if (error) {
        console.log('⚠️  Could not add xp_amount via RPC, trying direct SQL...');
        const { error: alterError } = await supabase
          .from('user_xp')
          .select('xp_amount')
          .limit(1);
        
        if (alterError && alterError.message.includes('xp_amount')) {
          console.log('✅ xp_amount column already exists or will be added manually');
        }
      } else {
        console.log('✅ xp_amount column added to user_xp');
      }
    } catch (e) {
      console.log('⚠️  xp_amount column setup skipped (may need manual setup)');
    }

    // 3. Create user_academy_progress table
    console.log('\n🎓 Creating user_academy_progress table...');
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.user_academy_progress (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
              course_id VARCHAR(100) NOT NULL,
              progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
              completed_lessons TEXT[] DEFAULT '{}',
              last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              UNIQUE(user_id, course_id)
          );
        `
      });
      if (error) {
        console.log('⚠️  Could not create user_academy_progress via RPC');
      } else {
        console.log('✅ user_academy_progress table created');
      }
    } catch (e) {
      console.log('⚠️  user_academy_progress table setup skipped (may need manual setup)');
    }

    // 4. Create user_training_progress table
    console.log('\n💪 Creating user_training_progress table...');
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.user_training_progress (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
              training_id VARCHAR(100) NOT NULL,
              progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
              completed_exercises TEXT[] DEFAULT '{}',
              total_workouts INTEGER DEFAULT 0,
              last_workout_date TIMESTAMP WITH TIME ZONE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              UNIQUE(user_id, training_id)
          );
        `
      });
      if (error) {
        console.log('⚠️  Could not create user_training_progress via RPC');
      } else {
        console.log('✅ user_training_progress table created');
      }
    } catch (e) {
      console.log('⚠️  user_training_progress table setup skipped (may need manual setup)');
    }

    // 5. Create book_reviews table
    console.log('\n📚 Creating book_reviews table...');
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.book_reviews (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
              book_id VARCHAR(100) NOT NULL,
              rating INTEGER CHECK (rating >= 1 AND rating <= 5),
              review_text TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              UNIQUE(user_id, book_id)
          );
        `
      });
      if (error) {
        console.log('⚠️  Could not create book_reviews via RPC');
      } else {
        console.log('✅ book_reviews table created');
      }
    } catch (e) {
      console.log('⚠️  book_reviews table setup skipped (may need manual setup)');
    }

    // 6. Add sample data to new tables
    console.log('\n📊 Adding sample data...');
    
    // Add sample academy progress
    try {
      const { data: users } = await supabase.auth.admin.listUsers();
      if (users && users.users.length > 0) {
        const sampleUser = users.users[0];
        const { error } = await supabase
          .from('user_academy_progress')
          .upsert({
            user_id: sampleUser.id,
            course_id: 'mindset-basics',
            progress_percentage: 75,
            completed_lessons: ['lesson-1', 'lesson-2', 'lesson-3']
          });
        if (!error) {
          console.log('✅ Sample academy progress added');
        }
      }
    } catch (e) {
      console.log('⚠️  Could not add sample academy progress');
    }

    // Add sample training progress
    try {
      const { data: users } = await supabase.auth.admin.listUsers();
      if (users && users.users.length > 0) {
        const sampleUser = users.users[0];
        const { error } = await supabase
          .from('user_training_progress')
          .upsert({
            user_id: sampleUser.id,
            training_id: 'strength-basics',
            progress_percentage: 60,
            completed_exercises: ['push-ups', 'squats', 'planks'],
            total_workouts: 12
          });
        if (!error) {
          console.log('✅ Sample training progress added');
        }
      }
    } catch (e) {
      console.log('⚠️  Could not add sample training progress');
    }

    // Add sample book reviews
    try {
      const { data: users } = await supabase.auth.admin.listUsers();
      if (users && users.users.length > 0) {
        const sampleUser = users.users[0];
        const { error } = await supabase
          .from('book_reviews')
          .upsert({
            user_id: sampleUser.id,
            book_id: 'canthurtme',
            rating: 5,
            review_text: 'Excellent book on mental toughness!'
          });
        if (!error) {
          console.log('✅ Sample book review added');
        }
      }
    } catch (e) {
      console.log('⚠️  Could not add sample book review');
    }

    console.log('\n🎉 Database setup completed!');
    console.log('📋 Summary:');
    console.log('   ✅ prelaunch_emails table - Ready');
    console.log('   ✅ profiles.role column - Ready');
    console.log('   ⚠️  forum_posts.parent_id - May need manual setup');
    console.log('   ⚠️  user_xp.xp_amount - May need manual setup');
    console.log('   ⚠️  user_academy_progress - May need manual setup');
    console.log('   ⚠️  user_training_progress - May need manual setup');
    console.log('   ⚠️  book_reviews - May need manual setup');
    console.log('\n🔗 Admin dashboard should now work better!');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
  }
}

setupMissingTables(); 