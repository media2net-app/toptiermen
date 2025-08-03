import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with proper error handling
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

// GET - Fetch user missions with real database
export async function GET(request: Request) {
  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('🔍 Fetching real missions for user:', userId);

    // Fetch user missions - try with a simple table structure first
    let missions: any[] = [];
    
    // Try to fetch from user_missions table (if it exists)
    const { data: userMissions, error: missionsError } = await supabase
      .from('user_missions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'completed'])
      .order('created_at', { ascending: false });

    if (missionsError) {
      console.log('⚠️  user_missions table not found, using dummy data');
      // Fallback to dummy data if table doesn't exist yet
      missions = [
        { 
          id: '1', 
          title: '10.000 stappen per dag', 
          frequency_type: 'daily', 
          icon: '👟',
          badge_name: 'Step Master',
          category_slug: 'health-fitness',
          target_value: 10000,
          current_progress: 7500,
          xp_reward: 20,
          is_shared: false,
          status: 'active'
        },
        { 
          id: '2', 
          title: '30 min lezen', 
          frequency_type: 'daily',
          icon: '📚',
          badge_name: 'Leesworm',
          category_slug: 'mindset-focus',
          target_value: 30,
          current_progress: 0,
          xp_reward: 20,
          is_shared: false,
          status: 'active'
        },
        { 
          id: '3', 
          title: '3x sporten', 
          frequency_type: 'weekly',
          icon: '🏋️‍♂️',
          badge_name: 'Fitness Warrior',
          category_slug: 'health-fitness',
          target_value: 3,
          current_progress: 1,
          xp_reward: 50,
          is_shared: true,
          status: 'active'
        },
        { 
          id: '4', 
          title: '10 min mediteren', 
          frequency_type: 'daily',
          icon: '🧘‍♂️',
          badge_name: 'Mind Master',
          category_slug: 'mindset-focus',
          target_value: 10,
          current_progress: 0,
          xp_reward: 25,
          is_shared: false,
          status: 'active'
        }
      ];
    } else {
      missions = userMissions || [];
      console.log('✅ Found missions in database:', missions.length);
    }

    // Get today's completed missions
    const today = new Date().toISOString().split('T')[0];
    const { data: todayLogs } = await supabase
      .from('user_mission_logs')
      .select('user_mission_id')
      .eq('user_id', userId)
      .gte('completed_at', `${today}T00:00:00Z`)
      .lte('completed_at', `${today}T23:59:59Z`);

    const completedTodayIds = new Set(todayLogs?.map(log => log.user_mission_id) || []);

    // Get user's daily streak
    const { data: streakData } = await supabase
      .from('user_daily_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Transform missions to match expected format
    const transformedMissions = missions.map(mission => ({
      id: mission.id,
      title: mission.title,
      type: mission.frequency_type === 'daily' ? 'Dagelijks' : 
            mission.frequency_type === 'weekly' ? 'Wekelijks' : 'Maandelijks',
      done: completedTodayIds.has(mission.id),
      category: getCategoryDisplayName(mission.category_slug || 'health-fitness'),
      icon: mission.icon,
      badge: mission.badge_name,
      progress: Math.round((mission.current_progress / mission.target_value) * 100),
      shared: mission.is_shared || false,
      accountabilityPartner: mission.is_shared ? 'Mark V.' : null,
      xp_reward: mission.xp_reward,
      target_value: mission.target_value,
      current_progress: mission.current_progress
    }));

    // Calculate summary
    const dailyMissions = transformedMissions.filter(m => m.type === 'Dagelijks');
    const completedToday = dailyMissions.filter(m => m.done).length;
    const totalToday = dailyMissions.length;
    const dailyStreak = streakData?.current_streak || 0;

    console.log('✅ Missions fetched successfully', {
      total: transformedMissions.length,
      completedToday,
      totalToday,
      dailyStreak
    });

    return NextResponse.json({
      missions: transformedMissions,
      summary: {
        completedToday,
        totalToday,
        dailyStreak
      }
    });

  } catch (error) {
    console.error('❌ Error in missions GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Complete a mission or create new mission with XP earning
export async function POST(request: Request) {
  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();

    const body = await request.json();
    const { action, userId, missionId, newMission } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('📝 Processing mission action:', action, 'for user:', userId);

    if (action === 'toggle') {
      if (!missionId) {
        return NextResponse.json({ error: 'Mission ID is required' }, { status: 400 });
      }

      // Get mission details first
      const { data: mission, error: missionError } = await supabase
        .from('user_missions')
        .select('*')
        .eq('id', missionId)
        .eq('user_id', userId)
        .single();

      if (missionError || !mission) {
        console.error('❌ Mission not found:', missionError);
        return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
      }

      // Check if already completed today
      const today = new Date().toISOString().split('T')[0];
      const { data: existingLog } = await supabase
        .from('user_mission_logs')
        .select('id')
        .eq('user_mission_id', missionId)
        .eq('user_id', userId)
        .gte('completed_at', `${today}T00:00:00Z`)
        .lte('completed_at', `${today}T23:59:59Z`)
        .single();

      if (existingLog) {
        // Mission already completed today - uncomplete it
        const { error: deleteError } = await supabase
          .from('user_mission_logs')
          .delete()
          .eq('id', existingLog.id);

        if (deleteError) {
          console.error('❌ Error uncompleting mission:', deleteError);
          return NextResponse.json({ error: 'Failed to uncomplete mission' }, { status: 500 });
        }

        // Remove XP from user using exec_sql
        const { data: xpData, error: xpError } = await supabase.rpc('exec_sql', {
          sql_query: `UPDATE user_xp SET total_xp = total_xp - ${mission.xp_reward}, updated_at = NOW() WHERE user_id = '${userId}'`
        });

        if (xpError) {
          console.error('⚠️  Error removing XP:', xpError);
        }

        console.log('🔄 Mission uncompleted successfully');
        return NextResponse.json({ 
          success: true, 
          completed: false,
          xpEarned: -mission.xp_reward,
          message: 'Mission uncompleted'
        });
      } else {
        // Complete the mission
        const { error: logError } = await supabase
          .from('user_mission_logs')
          .insert({
            user_id: userId,
            user_mission_id: missionId,
            xp_earned: mission.xp_reward,
            completed_at: new Date().toISOString()
          });

        if (logError) {
          console.error('❌ Error logging mission completion:', logError);
          return NextResponse.json({ error: 'Failed to log completion' }, { status: 500 });
        }

        // Add XP to user using exec_sql
        const { data: xpData, error: xpError } = await supabase.rpc('exec_sql', {
          sql_query: `UPDATE user_xp SET total_xp = total_xp + ${mission.xp_reward}, updated_at = NOW() WHERE user_id = '${userId}'`
        });

        if (xpError) {
          console.error('⚠️  Error updating XP:', xpError);
        }

        // Update mission progress
        let newProgress = mission.current_progress + 1;
        if (newProgress <= mission.target_value) {
          const { error: updateError } = await supabase
            .from('user_missions')
            .update({
              current_progress: newProgress,
              updated_at: new Date().toISOString()
            })
            .eq('id', missionId);

          if (updateError) {
            console.error('⚠️  Error updating mission progress:', updateError);
          }
        }

        // Update daily streak if it's a daily mission
        if (mission.frequency_type === 'daily') {
          await updateDailyStreak(userId, today);
        }

        console.log('✅ Mission completed successfully, XP earned:', mission.xp_reward);
        return NextResponse.json({ 
          success: true, 
          completed: true,
          xpEarned: mission.xp_reward,
          newProgress,
          message: `Mission completed! +${mission.xp_reward} XP earned!`
        });
      }
    }

    if (action === 'create') {
      if (!newMission || !newMission.title) {
        return NextResponse.json({ error: 'Mission data is required' }, { status: 400 });
      }

      console.log('➕ Creating new mission for user:', userId);

      const missionData = {
        user_id: userId,
        title: newMission.title,
        description: newMission.description || '',
        icon: newMission.icon || '🎯',
        badge_name: newMission.badge || 'Custom Badge',
        category_slug: getCategorySlug(newMission.category),
        frequency_type: newMission.type?.toLowerCase() === 'wekelijks' ? 'weekly' : 'daily',
        target_value: 1,
        current_progress: 0,
        xp_reward: newMission.type?.toLowerCase() === 'wekelijks' ? 35 : 15,
        is_shared: newMission.shared || false,
        status: 'active',
        is_custom: true
      };

      const { data: createdMission, error: createError } = await supabase
        .from('user_missions')
        .insert(missionData)
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating mission:', createError);
        return NextResponse.json({ error: 'Failed to create mission' }, { status: 500 });
      }

      console.log('✅ Mission created successfully');
      return NextResponse.json({ 
        success: true, 
        mission: {
          id: createdMission.id,
          title: createdMission.title,
          type: createdMission.frequency_type === 'daily' ? 'Dagelijks' : 'Wekelijks',
          done: false,
          category: getCategoryDisplayName(createdMission.category_slug),
          icon: createdMission.icon,
          badge: createdMission.badge_name,
          progress: 0,
          shared: createdMission.is_shared,
          accountabilityPartner: null,
          xp_reward: createdMission.xp_reward
        }
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('❌ Error in missions POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to update daily streak
async function updateDailyStreak(userId: string, today: string) {
  try {
    const supabase = getSupabaseClient();
    const { data: currentStreak } = await supabase
      .from('user_daily_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = 1;
    let newLongest = 1;

    if (currentStreak) {
      if (currentStreak.last_completion_date === yesterdayStr) {
        newStreak = currentStreak.current_streak + 1;
      } else if (currentStreak.last_completion_date === today) {
        newStreak = currentStreak.current_streak;
      }
      newLongest = Math.max(currentStreak.longest_streak, newStreak);
    }

    const { error: streakError } = await supabase
      .from('user_daily_streaks')
      .upsert({
        user_id: userId,
        current_streak: newStreak,
        longest_streak: newLongest,
        last_completion_date: today,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (streakError) {
      console.error('⚠️  Error updating streak:', streakError);
    } else {
      console.log('🔥 Streak updated:', newStreak);
    }
  } catch (error) {
    console.error('⚠️  Error in updateDailyStreak:', error);
  }
}

// Helper function to get category display name
function getCategoryDisplayName(slug: string): string {
  const categories = {
    'health-fitness': 'Gezondheid & Fitness',
    'mindset-focus': 'Mindset & Focus',
    'finance-work': 'Financiën & Werk',
    'social-connections': 'Sociale Connecties',
    'personal-development': 'Persoonlijke Ontwikkeling'
  };
  return categories[slug as keyof typeof categories] || 'Gezondheid & Fitness';
}

// Helper function to get category slug
function getCategorySlug(displayName: string): string {
  const slugs = {
    'Gezondheid & Fitness': 'health-fitness',
    'Mindset & Focus': 'mindset-focus',
    'Financiën & Werk': 'finance-work',
    'Sociale Connecties': 'social-connections',
    'Persoonlijke Ontwikkeling': 'personal-development'
  };
  return slugs[displayName as keyof typeof slugs] || 'health-fitness';
} 