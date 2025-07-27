const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSocialFeedTables() {
  console.log('🚀 Creating social feed tables...');

  try {
    // Create social_feed_posts table
    const { error: postsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS social_feed_posts (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          content TEXT NOT NULL,
          author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          media_url TEXT,
          media_type VARCHAR(10) CHECK (media_type IN ('image', 'video')),
          likes_count INTEGER DEFAULT 0,
          comments_count INTEGER DEFAULT 0,
          is_pinned BOOLEAN DEFAULT false,
          is_post_of_the_week BOOLEAN DEFAULT false,
          is_hidden BOOLEAN DEFAULT false,
          is_announcement BOOLEAN DEFAULT false,
          cta_button_text VARCHAR(100),
          cta_button_link TEXT,
          reach_count INTEGER DEFAULT 0,
          impressions_count INTEGER DEFAULT 0,
          click_rate DECIMAL(5,2) DEFAULT 0,
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'removed', 'pending')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (postsError) {
      console.error('❌ Error creating social_feed_posts table:', postsError);
    } else {
      console.log('✅ social_feed_posts table created');
    }

    // Create social_feed_reports table
    const { error: reportsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS social_feed_reports (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          post_id UUID REFERENCES social_feed_posts(id) ON DELETE CASCADE,
          reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          reason VARCHAR(100) NOT NULL,
          description TEXT,
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
          priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
          moderator_id UUID REFERENCES auth.users(id),
          moderator_notes TEXT,
          resolved_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (reportsError) {
      console.error('❌ Error creating social_feed_reports table:', reportsError);
    } else {
      console.log('✅ social_feed_reports table created');
    }

    // Create social_feed_notifications table
    const { error: notificationsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS social_feed_notifications (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          type VARCHAR(20) NOT NULL CHECK (type IN ('report', 'spam', 'engagement', 'system')),
          message TEXT NOT NULL,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          is_read BOOLEAN DEFAULT false,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (notificationsError) {
      console.error('❌ Error creating social_feed_notifications table:', notificationsError);
    } else {
      console.log('✅ social_feed_notifications table created');
    }

    // Insert sample data
    const { error: sampleDataError } = await supabase.rpc('exec_sql', {
      sql_query: `
        INSERT INTO social_feed_posts (content, author_id, likes_count, comments_count, is_announcement) VALUES
        ('Welkom bij Top Tier Men! Laten we samen groeien en onze doelen bereiken. 💪', (SELECT id FROM auth.users LIMIT 1), 15, 8, true),
        ('Net mijn workout afgerond. Discipline is de sleutel tot succes! 🔥', (SELECT id FROM auth.users LIMIT 1), 23, 12, false),
        ('Tips voor een gezonde levensstijl: consistentie boven perfectie!', (SELECT id FROM auth.users LIMIT 1), 18, 6, false)
        ON CONFLICT DO NOTHING;
      `
    });

    if (sampleDataError) {
      console.error('❌ Error inserting sample data:', sampleDataError);
    } else {
      console.log('✅ Sample data inserted');
    }

    console.log('🎉 Social feed tables setup completed!');

  } catch (error) {
    console.error('❌ Error creating social feed tables:', error);
  }
}

createSocialFeedTables(); 