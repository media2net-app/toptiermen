import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to get today's date
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Helper function to get yesterday's date
function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('🔧 Fixing streak for user:', userId);

    // Check if user has any completed missions from yesterday
    const yesterday = getYesterdayDate();
    
    const { data: yesterdayMissions, error: missionsError } = await supabase
      .from('user_missions')
      .select('*')
      .eq('user_id', userId)
      .eq('frequency_type', 'daily')
      .not('last_completion_date', 'is', null);

    if (missionsError) {
      console.error('❌ Error fetching missions:', missionsError);
      return NextResponse.json({ error: 'Failed to fetch missions' }, { status: 500 });
    }

    // Check if user had completed missions yesterday
    const hadCompletedYesterday = yesterdayMissions?.some(mission => 
      mission.last_completion_date === yesterday
    );

    if (hadCompletedYesterday) {
      // Restore streak to 1 (since they completed yesterday)
      const { error: streakError } = await supabase
        .from('user_daily_streaks')
        .upsert({
          user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_completion_date: yesterday,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (streakError) {
        console.error('❌ Error fixing streak:', streakError);
        return NextResponse.json({ error: 'Failed to fix streak' }, { status: 500 });
      }

      console.log('✅ Streak fixed: restored to 1 day');
      return NextResponse.json({ 
        success: true,
        message: 'Streak hersteld naar 1 dag!',
        streak: 1
      });
    } else {
      // Check if user has any completed missions today
      const today = getTodayDate();
      const hasCompletedToday = yesterdayMissions?.some(mission => 
        mission.last_completion_date === today
      );

      if (hasCompletedToday) {
        // Set streak to 1 for today's completion
        const { error: streakError } = await supabase
          .from('user_daily_streaks')
          .upsert({
            user_id: userId,
            current_streak: 1,
            longest_streak: 1,
            last_completion_date: today,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (streakError) {
          console.error('❌ Error fixing streak:', streakError);
          return NextResponse.json({ error: 'Failed to fix streak' }, { status: 500 });
        }

        console.log('✅ Streak fixed: set to 1 day for today');
        return NextResponse.json({ 
          success: true,
          message: 'Streak ingesteld op 1 dag voor vandaag!',
          streak: 1
        });
      } else {
        // No recent completions, set streak to 0
        const { error: streakError } = await supabase
          .from('user_daily_streaks')
          .upsert({
            user_id: userId,
            current_streak: 0,
            longest_streak: 0,
            last_completion_date: null,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (streakError) {
          console.error('❌ Error fixing streak:', streakError);
          return NextResponse.json({ error: 'Failed to fix streak' }, { status: 500 });
        }

        console.log('✅ Streak fixed: set to 0 (no recent completions)');
        return NextResponse.json({ 
          success: true,
          message: 'Streak ingesteld op 0 (geen recente voltooiingen)',
          streak: 0
        });
      }
    }

  } catch (error) {
    console.error('❌ Error in fix-user-streak:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 