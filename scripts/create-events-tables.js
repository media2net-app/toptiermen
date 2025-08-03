const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createEventsTables() {
  console.log('🚀 Creating events tables...');

  try {
    // Create event_categories table
    const { error: categoriesError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS event_categories (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          color VARCHAR(7) DEFAULT '#8BAE5A',
          icon VARCHAR(50),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (categoriesError) {
      console.error('❌ Error creating event_categories table:', categoriesError);
    } else {
      console.log('✅ event_categories table created');
    }

    // Create events table
    const { error: eventsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS events (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title VARCHAR(200) NOT NULL,
          description TEXT,
          category_id UUID REFERENCES event_categories(id) ON DELETE SET NULL,
          organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          location VARCHAR(500),
          start_date TIMESTAMP WITH TIME ZONE NOT NULL,
          end_date TIMESTAMP WITH TIME ZONE NOT NULL,
          max_participants INTEGER,
          current_participants INTEGER DEFAULT 0,
          status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'upcoming', 'ongoing', 'completed', 'cancelled')),
          is_featured BOOLEAN DEFAULT false,
          is_public BOOLEAN DEFAULT true,
          registration_deadline TIMESTAMP WITH TIME ZONE,
          cover_image_url TEXT,
          event_type VARCHAR(50) DEFAULT 'in_person' CHECK (event_type IN ('in_person', 'online', 'hybrid')),
          meeting_url TEXT,
          price DECIMAL(10,2) DEFAULT 0,
          currency VARCHAR(3) DEFAULT 'EUR',
          tags TEXT[],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (eventsError) {
      console.error('❌ Error creating events table:', eventsError);
    } else {
      console.log('✅ events table created');
    }

    // Create event_participants table
    const { error: participantsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS event_participants (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'waitlist', 'cancelled', 'attended')),
          registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          attended_at TIMESTAMP WITH TIME ZONE,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(event_id, user_id)
        );
      `
    });

    if (participantsError) {
      console.error('❌ Error creating event_participants table:', participantsError);
    } else {
      console.log('✅ event_participants table created');
    }

    // Create event_notifications table
    const { error: notificationsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS event_notifications (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL CHECK (type IN ('reminder', 'update', 'cancellation', 'reminder')),
          title VARCHAR(200) NOT NULL,
          message TEXT NOT NULL,
          sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          recipients_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (notificationsError) {
      console.error('❌ Error creating event_notifications table:', notificationsError);
    } else {
      console.log('✅ event_notifications table created');
    }

    // Insert sample event categories
    const { error: sampleCategoriesError } = await supabase.rpc('exec_sql', {
      sql_query: `
        INSERT INTO event_categories (name, description, color, icon) VALUES
        ('Brotherhood Meetup', 'Brotherhood bijeenkomsten en meetups', '#8BAE5A', 'users'),
        ('Training', 'Training sessies en workouts', '#FF6B6B', 'dumbbell'),
        ('Workshop', 'Workshops en leermomenten', '#4ECDC4', 'lightbulb'),
        ('Social', 'Sociale evenementen en netwerken', '#45B7D1', 'chat'),
        ('Challenge', 'Challenges en competities', '#FFA07A', 'trophy')
        ON CONFLICT (name) DO NOTHING;
      `
    });

    if (sampleCategoriesError) {
      console.error('❌ Error inserting sample categories:', sampleCategoriesError);
    } else {
      console.log('✅ Sample event categories inserted');
    }

    // Insert sample events
    const { error: sampleEventsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        INSERT INTO events (title, description, category_id, organizer_id, location, start_date, end_date, max_participants, status, is_featured, is_public) VALUES
        ('Brotherhood Meetup Amsterdam', 'Maandelijkse meetup voor alle Brotherhood leden in Amsterdam', 
         (SELECT id FROM event_categories WHERE name = 'Brotherhood Meetup' LIMIT 1),
         '14d7c55b-4ccd-453f-b79f-403f306f1efb',
         'Amsterdam Centrum', 
         NOW() + INTERVAL '7 days', 
         NOW() + INTERVAL '7 days' + INTERVAL '3 hours',
         50, 'upcoming', true, true),
        
        ('Fitness Challenge 2024', 'Jaarlijkse fitness challenge voor alle leden',
         (SELECT id FROM event_categories WHERE name = 'Challenge' LIMIT 1),
         '14d7c55b-4ccd-453f-b79f-403f306f1efb',
         'Online',
         NOW() + INTERVAL '14 days',
         NOW() + INTERVAL '21 days',
         100, 'upcoming', true, true),
        
        ('Mindset Workshop', 'Workshop over mindset en persoonlijke ontwikkeling',
         (SELECT id FROM event_categories WHERE name = 'Workshop' LIMIT 1),
         '14d7c55b-4ccd-453f-b79f-403f306f1efb',
         'Rotterdam',
         NOW() + INTERVAL '30 days',
         NOW() + INTERVAL '30 days' + INTERVAL '4 hours',
         25, 'upcoming', false, true)
        ON CONFLICT DO NOTHING;
      `
    });

    if (sampleEventsError) {
      console.error('❌ Error inserting sample events:', sampleEventsError);
    } else {
      console.log('✅ Sample events inserted');
    }

    console.log('🎉 Events tables setup completed successfully!');

  } catch (error) {
    console.error('❌ Error setting up events tables:', error);
  }
}

createEventsTables(); 