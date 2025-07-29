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

// GET - Fetch user missions
export async function GET(request: Request) {
  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const filter = searchParams.get('filter') || 'deze week';

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('🔍 Fetching missions for user:', userId);

    // Fetch user missions with categories
    const { data: missions, error: missionsError } = await supabase
      .from('user_missions')
      .select(`
        *,
        category:mission_categories(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (missionsError) {
      console.error('❌ Error fetching missions:', missionsError);
      return NextResponse.json({ error: 'Failed to fetch missions' }, { status: 500 });
    }

    // Fetch user streaks
    const { data: streaks, error: streaksError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId);

    if (streaksError) {
      console.error('❌ Error fetching streaks:', streaksError);
    }

    // Get today's completion logs
    const today = new Date().toISOString().split('T')[0];
    const { data: todayLogs, error: logsError } = await supabase
      .from('user_mission_logs')
      .select('user_mission_id')
      .eq('user_id', userId)
      .gte('completed_at', `${today}T00:00:00Z`)
      .lte('completed_at', `${today}T23:59:59Z`);

    if (logsError) {
      console.error('❌ Error fetching today logs:', logsError);
    }

    // Mark missions as completed today
    const completedTodayIds = new Set(todayLogs?.map(log => log.user_mission_id) || []);
    const enrichedMissions = missions?.map(mission => ({
      ...mission,
      done: completedTodayIds.has(mission.id),
      progress: Math.round((mission.current_progress / mission.target_value) * 100)
    })) || [];

    // Calculate summary
    const dailyMissions = enrichedMissions.filter(m => m.frequency_type === 'daily');
    const completedToday = dailyMissions.filter(m => m.done).length;
    const totalToday = dailyMissions.length;
    const dailyStreak = streaks?.find(s => s.streak_type === 'daily_missions')?.current_streak || 0;

    console.log('✅ Missions fetched successfully', {
      total: enrichedMissions.length,
      completedToday,
      totalToday,
      dailyStreak
    });

    return NextResponse.json({
      missions: enrichedMissions,
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

// POST - Complete a mission or create new mission
export async function POST(request: Request) {
  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();

    const body = await request.json();
    const { action, userId, missionId, newMission } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (action === 'complete') {
      // Complete a mission
      if (!missionId) {
        return NextResponse.json({ error: 'Mission ID is required' }, { status: 400 });
      }

      console.log('✅ Completing mission:', missionId, 'for user:', userId);

      // Get mission details
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
        return NextResponse.json({ error: 'Mission already completed today' }, { status: 400 });
      }

      // Log the completion
      const { error: logError } = await supabase
        .from('user_mission_logs')
        .insert({
          user_id: userId,
          user_mission_id: missionId,
          progress_value: 1,
          xp_earned: mission.xp_reward,
          completed_at: new Date().toISOString()
        });

      if (logError) {
        console.error('❌ Error logging mission completion:', logError);
        return NextResponse.json({ error: 'Failed to log completion' }, { status: 500 });
      }

      // Update XP using exec_sql
      const { data: xpData, error: xpError } = await supabase.rpc('exec_sql', {
        sql_query: `UPDATE user_xp SET total_xp = total_xp + ${mission.xp_reward}, updated_at = NOW() WHERE user_id = '${userId}'`
      });

      if (xpError) {
        console.error('⚠️  Error updating XP:', xpError);
      }

      // Update mission progress
      let newProgress = mission.current_progress + 1;
      let newStatus = mission.status;
      
      if (newProgress >= mission.target_value) {
        newStatus = 'completed';
      }

      const { error: updateError } = await supabase
        .from('user_missions')
        .update({
          current_progress: newProgress,
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', missionId);

      if (updateError) {
        console.error('⚠️  Error updating mission progress:', updateError);
      }

      // Update daily streak if it's a daily mission
      if (mission.frequency_type === 'daily') {
        const { data: currentStreak } = await supabase
          .from('user_streaks')
          .select('*')
          .eq('user_id', userId)
          .eq('streak_type', 'daily_missions')
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
          .from('user_streaks')
          .upsert({
            user_id: userId,
            streak_type: 'daily_missions',
            current_streak: newStreak,
            longest_streak: newLongest,
            last_completion_date: today,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,streak_type' });

        if (streakError) {
          console.error('⚠️  Error updating streak:', streakError);
        }
      }

      console.log('✅ Mission completed successfully');
      return NextResponse.json({ 
        success: true, 
        xpEarned: mission.xp_reward,
        newProgress,
        completed: newStatus === 'completed'
      });

    } else if (action === 'create') {
      // Create new mission
      if (!newMission) {
        return NextResponse.json({ error: 'Mission data is required' }, { status: 400 });
      }

      console.log('➕ Creating new mission for user:', userId);

      // Get category ID
      const { data: category } = await supabase
        .from('mission_categories')
        .select('id')
        .eq('slug', newMission.category?.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-'))
        .single();

      const { data: createdMission, error: createError } = await supabase
        .from('user_missions')
        .insert({
          user_id: userId,
          title: newMission.title,
          description: newMission.description || '',
          icon: newMission.icon || '🎯',
          badge_name: newMission.badge || 'Custom Badge',
          category_id: category?.id,
          frequency_type: newMission.type?.toLowerCase() === 'wekelijks' ? 'weekly' : 'daily',
          target_value: 1,
          target_unit: 'completion',
          xp_reward: newMission.type?.toLowerCase() === 'wekelijks' ? 35 : 15,
          is_shared: newMission.shared || false,
          is_custom: true,
          status: 'active'
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating mission:', createError);
        return NextResponse.json({ error: 'Failed to create mission' }, { status: 500 });
      }

      console.log('✅ Mission created successfully');
      return NextResponse.json({ success: true, mission: createdMission });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('❌ Error in missions POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET mission categories and templates
export async function PUT(request: Request) {
  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();

    console.log('📝 Fetching mission categories and templates...');

    const { data: categories, error: categoriesError } = await supabase
      .from('mission_categories')
      .select('*')
      .eq('is_active', true)
      .order('order_index');

    if (categoriesError) {
      console.error('❌ Error fetching categories:', categoriesError);
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }

    const { data: templates, error: templatesError } = await supabase
      .from('mission_templates')
      .select(`
        *,
        category:mission_categories(*)
      `)
      .eq('is_active', true)
      .order('title');

    if (templatesError) {
      console.error('❌ Error fetching templates:', templatesError);
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }

    console.log('✅ Categories and templates fetched successfully');
    return NextResponse.json({ categories, templates });

  } catch (error) {
    console.error('❌ Error in missions PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 