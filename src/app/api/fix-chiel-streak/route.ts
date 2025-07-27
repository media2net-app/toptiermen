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
    console.log('🔧 Fixing Chiel\'s streak data...');

    // First, find Chiel's user ID
    const { data: chielUser, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .ilike('full_name', '%chiel%')
      .single();

    if (userError || !chielUser) {
      console.log('❌ Could not find Chiel\'s user profile');
      return NextResponse.json({ 
        error: 'Could not find Chiel\'s user profile',
        details: userError 
      }, { status: 404 });
    }

    const chielUserId = chielUser.id;
    console.log('✅ Found Chiel\'s user ID:', chielUserId);

    // Get yesterday's date (24-07-2025)
    const yesterdayDate = getYesterdayDate();
    console.log('📅 Yesterday\'s date:', yesterdayDate);

    // Check what tables exist first
    const { data: tables, error: tablesError } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE '%streak%' OR table_name LIKE '%challenge%'
        ORDER BY table_name;
      `
    });

    console.log('📋 Available tables:', tables);

    // Check current streak data (try different possible table names)
    let currentStreak = null;
    let streakError = null;

    // Try user_daily_streaks first
    const { data: streak1, error: error1 } = await supabase
      .from('user_daily_streaks')
      .select('*')
      .eq('user_id', chielUserId)
      .single();

    if (!error1) {
      currentStreak = streak1;
    } else {
      console.log('⚠️  user_daily_streaks not found, trying alternatives...');
      
      // Try daily_streaks
      const { data: streak2, error: error2 } = await supabase
        .from('daily_streaks')
        .select('*')
        .eq('user_id', chielUserId)
        .single();

      if (!error2) {
        currentStreak = streak2;
      } else {
        console.log('⚠️  daily_streaks not found either');
        streakError = error2;
      }
    }

    console.log('📊 Current streak data:', currentStreak);

    // Set up the correct streak data
    // Chiel completed challenges yesterday (24-07), so streak should be 1
    const newStreakData = {
      user_id: chielUserId,
      current_streak: 1,
      longest_streak: Math.max(1, currentStreak?.longest_streak || 0),
      last_completion_date: yesterdayDate, // 24-07-2025
      updated_at: new Date().toISOString()
    };

    console.log('🔄 Setting new streak data:', newStreakData);

    // Get Chiel's active challenges
    const { data: userChallenges, error: challengesError } = await supabase
      .from('user_challenges')
      .select(`
        *,
        challenges (*)
      `)
      .eq('user_id', chielUserId)
      .in('status', ['active', 'completed']);

    if (challengesError) {
      console.log('❌ Error fetching user challenges:', challengesError);
      return NextResponse.json({ 
        error: 'Failed to fetch user challenges',
        details: challengesError 
      }, { status: 500 });
    }

    console.log('📋 Chiel\'s active challenges:', userChallenges);

    // Update each active challenge to set streak to 1 and last activity to yesterday
    const updatePromises = userChallenges?.map(async (userChallenge) => {
      const { data: updatedChallenge, error: updateError } = await supabase
        .from('user_challenges')
        .update({
          current_streak: 1,
          longest_streak: Math.max(1, userChallenge.longest_streak || 0),
          last_activity_date: yesterdayDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', userChallenge.id)
        .select()
        .single();

      if (updateError) {
        console.log('❌ Error updating challenge:', updateError);
        return { error: updateError };
      }

      console.log('✅ Updated challenge:', updatedChallenge);
      return { success: updatedChallenge };
    });

    const updateResults = await Promise.all(updatePromises || []);
    const successfulUpdates = updateResults.filter(result => result.success);
    const failedUpdates = updateResults.filter(result => result.error);

    console.log('✅ Successfully updated challenges:', successfulUpdates.length);
    if (failedUpdates.length > 0) {
      console.log('❌ Failed updates:', failedUpdates.length);
    }

    // Also check and fix challenge logs if needed
    const { data: challengeLogs, error: logsError } = await supabase
      .from('challenge_logs')
      .select('*')
      .eq('user_id', chielUserId)
      .eq('completion_date', yesterdayDate);

    console.log('📋 Challenge logs for yesterday:', challengeLogs);

    return NextResponse.json({
      success: true,
      message: 'Chiel\'s streak has been fixed!',
      userId: chielUserId,
      successfulUpdates: successfulUpdates.length,
      failedUpdates: failedUpdates.length,
      yesterdayDate: yesterdayDate,
      challengeLogs: challengeLogs
    });

  } catch (error) {
    console.log('❌ Error fixing Chiel\'s streak:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error 
    }, { status: 500 });
  }
} 