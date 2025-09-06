const { createClient } = require('@supabase/supabase-js');

// Supabase configuratie
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupChallenges() {
  try {
    console.log('🚀 Setting up challenges database...');

    // Check if challenges table exists
    console.log('📋 Checking challenges table...');
    const { data: existingChallenges, error: checkError } = await supabase
      .from('challenges')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === 'PGRST116') {
      console.log('❌ Challenges table does not exist. Please create it manually in Supabase first.');
      console.log('📋 SQL to create challenges table:');
      console.log(`
        CREATE TABLE challenges (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          type VARCHAR(20) NOT NULL CHECK (type IN ('weekly', 'monthly', 'special')),
          difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
          duration_days INTEGER NOT NULL DEFAULT 1,
          points_reward INTEGER NOT NULL DEFAULT 0,
          is_active BOOLEAN NOT NULL DEFAULT true,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          requirements JSONB NOT NULL DEFAULT '[]',
          rewards JSONB NOT NULL DEFAULT '[]',
          participants_count INTEGER NOT NULL DEFAULT 0,
          completion_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      return;
    }

    if (checkError) {
      console.error('❌ Error checking challenges table:', checkError);
      return;
    }

    console.log('✅ Challenges table exists');

    // Insert sample challenges
    console.log('📋 Inserting sample challenges...');
    const sampleChallenges = [
      {
        title: '30-Day Push-up Challenge',
        description: 'Doe elke dag push-ups en bouw je kracht op. Start met 10 en werk toe naar 50 per dag.',
        type: 'monthly',
        difficulty: 'medium',
        duration_days: 30,
        points_reward: 500,
        is_active: true,
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        requirements: ['Dagelijks push-ups doen', 'Foto uploaden van je progressie', 'Log je aantal push-ups'],
        rewards: ['500 punten', 'Push-up Master badge', 'Kracht boost in je profiel']
      },
      {
        title: 'Week van de Gezonde Maaltijden',
        description: 'Eet deze week alleen maar zelfgemaakte, gezonde maaltijden. Geen fastfood of bewerkte voeding.',
        type: 'weekly',
        difficulty: 'easy',
        duration_days: 7,
        points_reward: 150,
        is_active: true,
        start_date: '2024-01-15',
        end_date: '2024-01-22',
        requirements: ['7 dagen gezonde maaltijden', 'Foto van elke maaltijd', 'Recept delen'],
        rewards: ['150 punten', 'Healthy Eater badge', 'Voedingskennis boost']
      },
      {
        title: 'Iron Will Challenge',
        description: 'De ultieme test van discipline: 21 dagen zonder sociale media, suiker en klagen.',
        type: 'special',
        difficulty: 'hard',
        duration_days: 21,
        points_reward: 1000,
        is_active: true,
        start_date: '2024-02-01',
        end_date: '2024-02-22',
        requirements: ['Geen sociale media', 'Geen toegevoegde suikers', 'Geen klagen', 'Dagelijks reflectie'],
        rewards: ['1000 punten', 'Iron Will badge', 'Discipline Master titel', 'Exclusieve content toegang']
      }
    ];

    for (const challenge of sampleChallenges) {
      const { error: insertError } = await supabase
        .from('challenges')
        .insert(challenge);

      if (insertError) {
        console.error('❌ Error inserting challenge:', insertError);
      } else {
        console.log(`✅ Inserted challenge: ${challenge.title}`);
      }
    }
    console.log('✅ Sample challenges inserted successfully');

    console.log('🎯 Challenges database setup completed successfully!');

  } catch (error) {
    console.error('❌ Error in setupChallenges:', error);
  }
}

setupChallenges();
