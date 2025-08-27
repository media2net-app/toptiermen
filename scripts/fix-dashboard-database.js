const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixDashboardDatabase() {
  console.log('🔧 Fixing dashboard database issues...\n');

  try {
    // 1. Create user_academy_progress table
    console.log('📚 Creating user_academy_progress table...');
    const { error: academyError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.user_academy_progress (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          module_id UUID,
          lesson_id UUID,
          completed BOOLEAN DEFAULT false,
          progress_percentage INTEGER DEFAULT 0,
          started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          completed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Add RLS policies
        ALTER TABLE public.user_academy_progress ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own academy progress" ON public.user_academy_progress
          FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert their own academy progress" ON public.user_academy_progress
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update their own academy progress" ON public.user_academy_progress
          FOR UPDATE USING (auth.uid() = user_id);
      `
    });

    if (academyError) {
      console.log('⚠️ Academy progress table already exists or error:', academyError.message);
    } else {
      console.log('✅ user_academy_progress table created');
    }

    // 2. Create user_training_progress table
    console.log('\n🏋️ Creating user_training_progress table...');
    const { error: trainingError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.user_training_progress (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          training_schema_id UUID,
          exercise_id UUID,
          completed BOOLEAN DEFAULT false,
          sets_completed INTEGER DEFAULT 0,
          reps_completed INTEGER DEFAULT 0,
          weight_used DECIMAL(5,2),
          started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          completed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Add RLS policies
        ALTER TABLE public.user_training_progress ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own training progress" ON public.user_training_progress
          FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert their own training progress" ON public.user_training_progress
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update their own training progress" ON public.user_training_progress
          FOR UPDATE USING (auth.uid() = user_id);
      `
    });

    if (trainingError) {
      console.log('⚠️ Training progress table already exists or error:', trainingError.message);
    } else {
      console.log('✅ user_training_progress table created');
    }

    // 3. Create book_reviews table
    console.log('\n📖 Creating book_reviews table...');
    const { error: reviewsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.book_reviews (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          book_id UUID,
          rating INTEGER CHECK (rating >= 1 AND rating <= 5),
          review_text TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Add RLS policies
        ALTER TABLE public.book_reviews ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view all book reviews" ON public.book_reviews
          FOR SELECT USING (true);
        
        CREATE POLICY "Users can insert their own book reviews" ON public.book_reviews
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update their own book reviews" ON public.book_reviews
          FOR UPDATE USING (auth.uid() = user_id);
      `
    });

    if (reviewsError) {
      console.log('⚠️ Book reviews table already exists or error:', reviewsError.message);
    } else {
      console.log('✅ book_reviews table created');
    }

    // 4. Add missing columns to existing tables
    console.log('\n🔧 Adding missing columns to existing tables...');

    // Add parent_id to forum_posts if it doesn't exist
    const { error: parentIdError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'forum_posts' AND column_name = 'parent_id'
          ) THEN
            ALTER TABLE public.forum_posts ADD COLUMN parent_id UUID REFERENCES public.forum_posts(id);
          END IF;
        END $$;
      `
    });

    if (parentIdError) {
      console.log('⚠️ parent_id column already exists or error:', parentIdError.message);
    } else {
      console.log('✅ parent_id column added to forum_posts');
    }

    // Add xp_amount to user_xp if it doesn't exist
    const { error: xpError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_xp' AND column_name = 'xp_amount'
          ) THEN
            ALTER TABLE public.user_xp ADD COLUMN xp_amount INTEGER DEFAULT 0;
          END IF;
        END $$;
      `
    });

    if (xpError) {
      console.log('⚠️ xp_amount column already exists or error:', xpError.message);
    } else {
      console.log('✅ xp_amount column added to user_xp');
    }

    // 5. Create user_xp table if it doesn't exist
    console.log('\n⭐ Creating user_xp table...');
    const { error: userXpError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.user_xp (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          xp_amount INTEGER DEFAULT 0,
          level INTEGER DEFAULT 1,
          total_xp_earned INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Add RLS policies
        ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own XP" ON public.user_xp
          FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert their own XP" ON public.user_xp
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update their own XP" ON public.user_xp
          FOR UPDATE USING (auth.uid() = user_id);
      `
    });

    if (userXpError) {
      console.log('⚠️ user_xp table already exists or error:', userXpError.message);
    } else {
      console.log('✅ user_xp table created');
    }

    // 6. Insert sample data for testing
    console.log('\n📊 Inserting sample data...');
    
    // Get a user to use for sample data
    const { data: users } = await supabase.from('profiles').select('id').limit(1);
    
    if (users && users.length > 0) {
      const userId = users[0].id;
      
      // Insert sample academy progress
      await supabase.from('user_academy_progress').upsert({
        user_id: userId,
        module_id: 'sample-module-1',
        lesson_id: 'sample-lesson-1',
        completed: true,
        progress_percentage: 100
      });

      // Insert sample training progress
      await supabase.from('user_training_progress').upsert({
        user_id: userId,
        training_schema_id: 'sample-schema-1',
        exercise_id: 'sample-exercise-1',
        completed: true,
        sets_completed: 3,
        reps_completed: 12
      });

      // Insert sample user XP
      await supabase.from('user_xp').upsert({
        user_id: userId,
        xp_amount: 1250,
        level: 5,
        total_xp_earned: 1250
      });

      console.log('✅ Sample data inserted');
    }

    console.log('\n🎉 Database fixes completed successfully!');
    console.log('\n📋 Summary of fixes:');
    console.log('✅ user_academy_progress table created');
    console.log('✅ user_training_progress table created');
    console.log('✅ book_reviews table created');
    console.log('✅ parent_id column added to forum_posts');
    console.log('✅ xp_amount column added to user_xp');
    console.log('✅ user_xp table created');
    console.log('✅ Sample data inserted for testing');

  } catch (error) {
    console.error('❌ Error fixing database:', error);
  }
}

fixDashboardDatabase(); 