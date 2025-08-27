require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupForumModerationDatabase() {
  try {
    console.log('🔧 Setting up forum moderation database...\n');

    // 1. Create forum_reports table
    console.log('📋 Step 1: Creating forum_reports table...');
    const { error: reportsTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS forum_reports (
          id SERIAL PRIMARY KEY,
          reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
          comment_id INTEGER,
          report_type VARCHAR(50) NOT NULL,
          reason TEXT NOT NULL,
          description TEXT,
          status VARCHAR(20) DEFAULT 'pending',
          moderator_id UUID REFERENCES auth.users(id),
          moderator_notes TEXT,
          resolution_action VARCHAR(50),
          resolution_duration INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          resolved_at TIMESTAMP WITH TIME ZONE
        );
      `
    });

    if (reportsTableError) {
      console.log('⚠️ Forum reports table might already exist:', reportsTableError.message);
    } else {
      console.log('✅ Forum reports table created');
    }

    // 2. Create forum_moderation_logs table
    console.log('\n📋 Step 2: Creating forum_moderation_logs table...');
    const { error: logsTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS forum_moderation_logs (
          id SERIAL PRIMARY KEY,
          moderator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          action_type VARCHAR(50) NOT NULL,
          target_type VARCHAR(20) NOT NULL,
          target_id INTEGER,
          reason TEXT NOT NULL,
          duration INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (logsTableError) {
      console.log('⚠️ Forum moderation logs table might already exist:', logsTableError.message);
    } else {
      console.log('✅ Forum moderation logs table created');
    }

    // 3. Create forum_post_flags table
    console.log('\n📋 Step 3: Creating forum_post_flags table...');
    const { error: flagsTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS forum_post_flags (
          id SERIAL PRIMARY KEY,
          post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
          flagger_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          flag_type VARCHAR(50) NOT NULL,
          reason TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (flagsTableError) {
      console.log('⚠️ Forum post flags table might already exist:', flagsTableError.message);
    } else {
      console.log('✅ Forum post flags table created');
    }

    // 4. Get existing users and posts for sample data
    console.log('\n👥 Step 4: Getting existing users and posts...');
    const { data: users } = await supabase
      .from('profiles')
      .select('id, full_name')
      .limit(5);

    const { data: posts } = await supabase
      .from('forum_posts')
      .select('id, content')
      .limit(5);

    console.log(`✅ Found ${users?.length || 0} users and ${posts?.length || 0} posts`);

    // 5. Create sample forum reports
    console.log('\n🚨 Step 5: Creating sample forum reports...');
    if (users && posts && users.length > 0 && posts.length > 0) {
      const sampleReports = [
        {
          reporter_id: users[0].id,
          reported_user_id: users[1]?.id || users[0].id,
          post_id: posts[0].id,
          report_type: 'spam',
          reason: 'Spam - Dit lijkt op spam content',
          description: 'Deze post bevat ongewenste commerciële content',
          status: 'pending'
        },
        {
          reporter_id: users[1]?.id || users[0].id,
          reported_user_id: users[2]?.id || users[0].id,
          post_id: posts[1]?.id || posts[0].id,
          report_type: 'inappropriate',
          reason: 'Inappropriate Content - Ongepaste taal en inhoud',
          description: 'Deze post bevat ongepaste taal',
          status: 'investigating'
        },
        {
          reporter_id: users[2]?.id || users[0].id,
          reported_user_id: users[3]?.id || users[0].id,
          post_id: posts[2]?.id || posts[0].id,
          report_type: 'harassment',
          reason: 'Harassment - Pesterij van andere gebruiker',
          description: 'Deze gebruiker pest andere leden',
          status: 'resolved'
        }
      ];

      for (const report of sampleReports) {
        const { error: insertError } = await supabase
          .from('forum_reports')
          .insert(report);

        if (insertError) {
          console.log('⚠️ Error inserting report:', insertError.message);
        } else {
          console.log('✅ Sample report created');
        }
      }
    }

    // 6. Create sample moderation logs
    console.log('\n📝 Step 6: Creating sample moderation logs...');
    if (users && users.length > 0) {
      const sampleLogs = [
        {
          moderator_id: users[0].id,
          target_user_id: users[1]?.id || users[0].id,
          action_type: 'warning',
          target_type: 'user',
          reason: 'Spam gedrag gedetecteerd',
          duration: null
        },
        {
          moderator_id: users[0].id,
          target_user_id: users[2]?.id || users[0].id,
          action_type: 'suspension',
          target_type: 'user',
          reason: 'Ongepast gedrag in forum',
          duration: 7
        }
      ];

      for (const log of sampleLogs) {
        const { error: insertError } = await supabase
          .from('forum_moderation_logs')
          .insert(log);

        if (insertError) {
          console.log('⚠️ Error inserting log:', insertError.message);
        } else {
          console.log('✅ Sample moderation log created');
        }
      }
    }

    // 7. Create sample post flags
    console.log('\n🚩 Step 7: Creating sample post flags...');
    if (users && posts && users.length > 0 && posts.length > 0) {
      const sampleFlags = [
        {
          post_id: posts[0].id,
          flagger_id: users[0].id,
          flag_type: 'spam',
          reason: 'Commerciële content zonder toestemming'
        },
        {
          post_id: posts[1]?.id || posts[0].id,
          flagger_id: users[1]?.id || users[0].id,
          flag_type: 'inappropriate',
          reason: 'Ongepaste taal gebruikt'
        }
      ];

      for (const flag of sampleFlags) {
        const { error: insertError } = await supabase
          .from('forum_post_flags')
          .insert(flag);

        if (insertError) {
          console.log('⚠️ Error inserting flag:', insertError.message);
        } else {
          console.log('✅ Sample post flag created');
        }
      }
    }

    // 8. Verify the data
    console.log('\n🔍 Step 8: Verifying data...');
    const { count: reportsCount } = await supabase
      .from('forum_reports')
      .select('*', { count: 'exact', head: true });

    const { count: logsCount } = await supabase
      .from('forum_moderation_logs')
      .select('*', { count: 'exact', head: true });

    const { count: flagsCount } = await supabase
      .from('forum_post_flags')
      .select('*', { count: 'exact', head: true });

    console.log('\n🎉 Forum Moderation Database Setup Complete!');
    console.log('='.repeat(60));
    console.log(`✅ Forum Reports: ${reportsCount || 0}`);
    console.log(`✅ Moderation Logs: ${logsCount || 0}`);
    console.log(`✅ Post Flags: ${flagsCount || 0}`);
    console.log('');
    console.log('💡 Next steps:');
    console.log('1. Update admin dashboard to use real data');
    console.log('2. Test forum moderation functionality');
    console.log('3. Implement real-time moderation features');

  } catch (error) {
    console.error('❌ Error setting up forum moderation database:', error);
  }
}

setupForumModerationDatabase();
