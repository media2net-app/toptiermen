import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Setting up Challenges & Brotherhood database...');

    // Create challenges table
    const { error: challengesError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS challenges (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          type VARCHAR(100) NOT NULL,
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'paused')),
          progress INTEGER DEFAULT 0,
          total_days INTEGER NOT NULL,
          current_day INTEGER DEFAULT 0,
          icon VARCHAR(10),
          badge VARCHAR(100),
          difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
          shared BOOLEAN DEFAULT false,
          accountability_partner VARCHAR(100),
          start_date DATE DEFAULT CURRENT_DATE,
          end_date DATE,
          streak INTEGER DEFAULT 0,
          description TEXT,
          category VARCHAR(100),
          is_public BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (challengesError) {
      console.log('Challenges table error:', challengesError.message);
    } else {
      console.log('✅ Challenges table created');
    }

    // Create challenge_categories table
    const { error: categoriesError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS challenge_categories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          icon VARCHAR(10),
          color VARCHAR(20),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (categoriesError) {
      console.log('Challenge categories table error:', categoriesError.message);
    } else {
      console.log('✅ Challenge categories table created');
    }

    // Create brotherhood_groups table
    const { error: groupsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS brotherhood_groups (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100),
          member_count INTEGER DEFAULT 0,
          max_members INTEGER DEFAULT 50,
          is_public BOOLEAN DEFAULT true,
          is_active BOOLEAN DEFAULT true,
          created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (groupsError) {
      console.log('Brotherhood groups table error:', groupsError.message);
    } else {
      console.log('✅ Brotherhood groups table created');
    }

    // Create brotherhood_events table
    const { error: eventsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS brotherhood_events (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL,
          type VARCHAR(100) NOT NULL,
          date DATE NOT NULL,
          time VARCHAR(20),
          location VARCHAR(255),
          description TEXT,
          host VARCHAR(255),
          host_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
          max_attendees INTEGER DEFAULT 20,
          current_attendees INTEGER DEFAULT 0,
          status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
          group_id UUID REFERENCES brotherhood_groups(id) ON DELETE SET NULL,
          is_public BOOLEAN DEFAULT true,
          agenda TEXT[],
          doelgroep TEXT,
          leerdoelen TEXT[],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (eventsError) {
      console.log('Brotherhood events table error:', eventsError.message);
    } else {
      console.log('✅ Brotherhood events table created');
    }

    // Insert sample challenge categories
    const { error: insertCategoriesError } = await supabaseAdmin
      .from('challenge_categories')
      .upsert([
        { name: 'Fysieke Uitdagingen', description: 'Challenges gericht op fysieke gezondheid en fitness', icon: '💪', color: '#8BAE5A' },
        { name: 'Mentale Uitdagingen', description: 'Challenges voor mentale gezondheid en focus', icon: '🧘‍♂️', color: '#4A90E2' },
        { name: 'Financiële Uitdagingen', description: 'Challenges voor financiële discipline en groei', icon: '💰', color: '#F5A623' },
        { name: 'Productiviteit', description: 'Challenges voor betere gewoontes en productiviteit', icon: '⚡', color: '#7B68EE' },
        { name: 'Sociale Uitdagingen', description: 'Challenges voor sociale vaardigheden en netwerken', icon: '🤝', color: '#FF6B6B' }
      ], { onConflict: 'name' });

    if (insertCategoriesError) {
      console.log('Insert categories error:', insertCategoriesError.message);
    } else {
      console.log('✅ Challenge categories inserted');
    }

    // Insert sample brotherhood groups
    const { error: insertGroupsError } = await supabaseAdmin
      .from('brotherhood_groups')
      .upsert([
        { 
          name: 'Crypto & DeFi Pioniers', 
          description: 'Voor mannen die de toekomst van financiën willen vormgeven', 
          category: 'Financiën', 
          member_count: 8, 
          max_members: 25, 
          is_public: true 
        },
        { 
          name: 'Vaders & Leiders', 
          description: 'Een plek voor vaders om te groeien als leiders', 
          category: 'Leiderschap', 
          member_count: 3, 
          max_members: 20, 
          is_public: true 
        },
        { 
          name: 'Fitness Warriors', 
          description: 'Voor mannen die hun fysieke grenzen willen verleggen', 
          category: 'Fitness', 
          member_count: 12, 
          max_members: 30, 
          is_public: true 
        },
        { 
          name: 'Ondernemers Hub', 
          description: 'Voor mannen die hun eigen bedrijf willen starten of uitbreiden', 
          category: 'Ondernemerschap', 
          member_count: 15, 
          max_members: 25, 
          is_public: true 
        }
      ], { onConflict: 'name' });

    if (insertGroupsError) {
      console.log('Insert groups error:', insertGroupsError.message);
    } else {
      console.log('✅ Brotherhood groups inserted');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Challenges & Brotherhood database setup completed',
      tables: ['challenges', 'challenge_categories', 'brotherhood_groups', 'brotherhood_events'],
      sampleData: {
        challengeCategories: insertCategoriesError ? 'Failed' : 'Inserted',
        brotherhoodGroups: insertGroupsError ? 'Failed' : 'Inserted'
      }
    });

  } catch (error) {
    console.error('❌ Error setting up Challenges & Brotherhood:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to setup database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
