require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupIntroductionForum() {
  console.log('👋 Setting up Introduction Forum Topic...');

  try {
    // 1. Create forum category for introductions
    console.log('📝 Creating forum category...');
    const { data: category, error: categoryError } = await supabase
      .from('forum_categories')
      .upsert({
        name: 'Leden Introducties',
        description: 'Stel je voor aan de community en maak kennis met andere leden',
        emoji: '👋',
        slug: 'leden-introducties',
        order_index: 1
      }, {
        onConflict: 'slug'
      })
      .select()
      .single();

    if (categoryError) {
      console.error('❌ Error creating forum category:', categoryError);
      return;
    }

    console.log('✅ Forum category created:', category.name);

    // 2. Create the main introduction topic
    console.log('📝 Creating introduction topic...');
    const topicContent = `Welkom bij Top Tier Men! 

Dit is de plek waar nieuwe leden zich kunnen voorstellen aan de community. 

**Waarom een introductie?**
- Maak kennis met andere leden
- Deel je doelen en motivatie
- Bouw connecties op
- Word onderdeel van de community

**Wat kun je delen:**
- Je naam en waar je vandaan komt
- Je hoofddoel en motivatie
- Wat je hoopt te bereiken
- Je interesses en passies
- Een korte video introductie (optioneel maar aanbevolen)

**Video introductie tips:**
- Houd het kort (30-60 seconden)
- Wees authentiek en natuurlijk
- Deel je passie en motivatie
- Nodig anderen uit om te reageren

**Voorbeeld introductie:**
"Hallo allemaal! Ik ben [Naam] uit [Plaats]. Mijn hoofddoel is [doel] en ik ben hier omdat [motivatie]. Ik ben vooral geïnteresseerd in [interesses] en hoop hier [wat je wilt bereiken] te bereiken. Ik kijk ernaar uit om jullie allemaal te leren kennen!"

Laten we een sterke, ondersteunende community bouwen! 💪

*Dit topic blijft open voor nieuwe introducties van alle leden.*`;

    const { data: topic, error: topicError } = await supabase
      .from('forum_topics')
      .upsert({
        title: '👋 Welkom! Stel je voor aan de Community',
        content: topicContent,
        category_id: category.id,
        author_id: null, // System topic
        is_pinned: true,
        is_locked: false
      }, {
        onConflict: 'title'
      })
      .select()
      .single();

    if (topicError) {
      console.error('❌ Error creating forum topic:', topicError);
      return;
    }

    console.log('✅ Forum topic created:', topic.title);

    // 3. Create user_introduction_tasks table
    console.log('📝 Creating user_introduction_tasks table...');
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS user_introduction_tasks (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          task_type VARCHAR(50) NOT NULL DEFAULT 'forum_introduction',
          status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
          forum_post_id INTEGER REFERENCES forum_posts(id),
          completed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, task_type)
        );
      `
    });

    if (tableError) {
      console.error('❌ Error creating user_introduction_tasks table:', tableError);
      return;
    }

    console.log('✅ user_introduction_tasks table created');

    // 4. Enable RLS and create policies
    console.log('🔒 Setting up RLS policies...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE user_introduction_tasks ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view their own introduction tasks" ON user_introduction_tasks;
        CREATE POLICY "Users can view their own introduction tasks" ON user_introduction_tasks
          FOR SELECT USING (auth.uid() = user_id);
        
        DROP POLICY IF EXISTS "Users can update their own introduction tasks" ON user_introduction_tasks;
        CREATE POLICY "Users can update their own introduction tasks" ON user_introduction_tasks
          FOR UPDATE USING (auth.uid() = user_id);
        
        DROP POLICY IF EXISTS "Users can insert their own introduction tasks" ON user_introduction_tasks;
        CREATE POLICY "Users can insert their own introduction tasks" ON user_introduction_tasks
          FOR INSERT WITH CHECK (auth.uid() = user_id);
      `
    });

    if (rlsError) {
      console.error('❌ Error setting up RLS policies:', rlsError);
      return;
    }

    console.log('✅ RLS policies created');

    // 5. Create indexes
    console.log('📊 Creating indexes...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE INDEX IF NOT EXISTS idx_user_introduction_tasks_user_id ON user_introduction_tasks(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_introduction_tasks_status ON user_introduction_tasks(status);
      `
    });

    if (indexError) {
      console.error('❌ Error creating indexes:', indexError);
      return;
    }

    console.log('✅ Indexes created');

    // 6. Create trigger for new users
    console.log('🔧 Creating trigger for new users...');
    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION create_introduction_task_for_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO user_introduction_tasks (user_id, task_type, status)
          VALUES (NEW.id, 'forum_introduction', 'pending')
          ON CONFLICT (user_id, task_type) DO NOTHING;
          
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS trigger_create_introduction_task ON auth.users;
        CREATE TRIGGER trigger_create_introduction_task
          AFTER INSERT ON auth.users
          FOR EACH ROW
          EXECUTE FUNCTION create_introduction_task_for_new_user();
      `
    });

    if (triggerError) {
      console.error('❌ Error creating trigger:', triggerError);
      return;
    }

    console.log('✅ Trigger created for new users');

    // 7. Create tasks for existing users
    console.log('👥 Creating tasks for existing users...');
    const { error: taskError } = await supabase.rpc('exec_sql', {
      sql_query: `
        INSERT INTO user_introduction_tasks (user_id, task_type, status)
        SELECT 
          p.id,
          'forum_introduction',
          'pending'
        FROM profiles p
        LEFT JOIN user_introduction_tasks uit ON p.id = uit.user_id AND uit.task_type = 'forum_introduction'
        WHERE uit.id IS NULL
          AND p.created_at > NOW() - INTERVAL '30 days'
        ON CONFLICT (user_id, task_type) DO NOTHING;
      `
    });

    if (taskError) {
      console.error('❌ Error creating tasks for existing users:', taskError);
    } else {
      console.log('✅ Tasks created for existing users');
    }

    // 8. Verify the setup
    console.log('🔍 Verifying setup...');
    
    // Check category
    const { data: categories, error: catError } = await supabase
      .from('forum_categories')
      .select('*')
      .eq('slug', 'leden-introducties');

    if (catError) {
      console.error('❌ Error verifying category:', catError);
    } else {
      console.log('✅ Category verified:', categories[0]?.name);
    }

    // Check topic
    const { data: topics, error: topError } = await supabase
      .from('forum_topics')
      .select('*')
      .eq('title', '👋 Welkom! Stel je voor aan de Community');

    if (topError) {
      console.error('❌ Error verifying topic:', topError);
    } else {
      console.log('✅ Topic verified:', topics[0]?.title);
    }

    // Check tasks
    const { data: tasks, error: taskVerifyError } = await supabase
      .from('user_introduction_tasks')
      .select('*')
      .eq('task_type', 'forum_introduction');

    if (taskVerifyError) {
      console.error('❌ Error verifying tasks:', taskVerifyError);
    } else {
      const pendingTasks = tasks.filter(t => t.status === 'pending');
      const completedTasks = tasks.filter(t => t.status === 'completed');
      console.log(`✅ Tasks verified: ${tasks.length} total, ${pendingTasks.length} pending, ${completedTasks.length} completed`);
    }

    console.log('\n🎉 Introduction forum setup completed successfully!');
    console.log('📋 What was created:');
    console.log('   - Forum category: Leden Introducties');
    console.log('   - Pinned introduction topic');
    console.log('   - user_introduction_tasks table');
    console.log('   - RLS policies and indexes');
    console.log('   - Trigger for new users');
    console.log('   - Tasks for existing users');

  } catch (error) {
    console.error('❌ Error setting up introduction forum:', error);
  }
}

// Run the setup
setupIntroductionForum()
  .then(() => {
    console.log('✅ Setup completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
