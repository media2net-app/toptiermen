import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// File-based storage for missions when database is not available
const MISSIONS_FILE = path.join(process.cwd(), 'data', 'missions.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(MISSIONS_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Read missions from file
async function readMissionsFromFile(): Promise<{ [userId: string]: any[] }> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(MISSIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('📊 Fetching dashboard stats for user:', userId);

    // Get current date for daily tracking
    const today = new Date().toISOString().split('T')[0];

    try {
      // 1. Missions Statistics
      const { data: missionsData, error: missionsError } = await supabase
        .from('user_missions')
        .select('*')
        .eq('user_id', userId);

      if (missionsError) {
        console.log('❌ Error fetching missions:', missionsError.message);
      }

      // Helper function to check if mission was completed today
      const isMissionCompletedToday = (completionDate: string | null): boolean => {
        if (!completionDate) return false;
        return completionDate === today;
      };

      // Calculate mission stats - database only
      const dailyMissions = missionsData?.filter(mission => mission.frequency_type === 'daily') || [];
      const completedToday = dailyMissions.filter(mission => 
        isMissionCompletedToday(mission.last_completion_date)
      ).length;
      const totalToday = dailyMissions.length;

      // Try to load file-based missions as well
      let fileMissions: any[] = [];
      try {
        const fileMissionsData = await readMissionsFromFile();
        fileMissions = fileMissionsData[userId] || [];
        console.log('📊 Dashboard: File storage check:', { fileMissions: fileMissions.length });
      } catch (fileError) {
        console.log('⚠️  Dashboard: File storage not available');
      }

      // Combine database and file missions for dashboard stats
      const allDailyMissions = [...dailyMissions];
      const dbMissionIds = new Set(dailyMissions.map(m => m.id));
      
      fileMissions.forEach(fileMission => {
        if (!dbMissionIds.has(fileMission.id) && fileMission.type === 'Dagelijks') {
          allDailyMissions.push({
            id: fileMission.id,
            frequency_type: 'daily',
            last_completion_date: fileMission.last_completion_date
          });
        }
      });

      const allCompletedToday = allDailyMissions.filter(mission => 
        isMissionCompletedToday(mission.last_completion_date)
      ).length;
      const allTotalToday = allDailyMissions.length;

      // 2. Challenges Statistics
      const { data: challengesData, error: challengesError } = await supabase
        .from('user_challenges')
        .select(`
          *,
          challenges (*)
        `)
        .eq('user_id', userId);

      if (challengesError) {
        console.log('❌ Error fetching challenges:', challengesError.message);
      }

      // Calculate challenge stats
      const activeChallenges = challengesData?.filter(c => c.status === 'active').length || 0;
      const completedChallenges = challengesData?.filter(c => c.status === 'completed').length || 0;
      const totalChallengeDays = challengesData?.reduce((sum, c) => sum + (c.current_streak || 0), 0) || 0;

      // 3. Training Statistics
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('selected_schema_id')
        .eq('id', userId)
        .single();

      let trainingStats = {
        hasActiveSchema: false,
        currentDay: 0,
        totalDays: 0,
        weeklySessions: 0
      };

      if (!userError && userData?.selected_schema_id) {
        // Get training schema details
        const { data: schemaData, error: schemaError } = await supabase
          .from('training_schemas')
          .select('*')
          .eq('id', userData.selected_schema_id)
          .single();

        if (!schemaError && schemaData) {
          // Get training days
          const { data: daysData, error: daysError } = await supabase
            .from('training_schema_days')
            .select('*')
            .eq('schema_id', userData.selected_schema_id)
            .order('day_number', { ascending: true });

          if (!daysError && daysData) {
            trainingStats = {
              hasActiveSchema: true,
              currentDay: 0, // This would need to be tracked separately
              totalDays: daysData.length,
              weeklySessions: Math.min(5, daysData.length) // Assume 5 sessions per week
            };
          }
        }
      }

      // 4. Mind & Focus Statistics (from missions)
      const mindFocusMissions = missionsData?.filter(mission => 
        mission.category_slug === 'mindset-focus' || 
        mission.title.toLowerCase().includes('meditatie') ||
        mission.title.toLowerCase().includes('focus')
      ) || [];

      const mindFocusCompleted = mindFocusMissions.filter(mission => {
        if (mission.frequency_type === 'daily') {
          return isMissionCompletedToday(mission.last_completion_date);
        }
        return mission.status === 'completed';
      }).length;

      // 5. Boekenkamer Statistics (from missions)
      const readingMissions = missionsData?.filter(mission => 
        mission.category_slug === 'mindset-focus' || 
        mission.title.toLowerCase().includes('lezen') ||
        mission.title.toLowerCase().includes('boek')
      ) || [];

      const readingCompleted = readingMissions.filter(mission => {
        if (mission.frequency_type === 'daily') {
          return isMissionCompletedToday(mission.last_completion_date);
        }
        return mission.status === 'completed';
      }).length;

      // 6. XP Statistics
      const { data: xpData, error: xpError } = await supabase
        .from('user_xp')
        .select('total_xp, current_rank_id')
        .eq('user_id', userId)
        .single();

      let rankData = null;
      if (!xpError && xpData?.current_rank_id) {
        const { data: rank, error: rankError } = await supabase
          .from('ranks')
          .select('*')
          .eq('id', xpData.current_rank_id)
          .single();

        if (!rankError && rank) {
          rankData = rank;
        }
      }

      // 7. Weekly Progress (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];

      // Calculate weekly completed missions based on last_completion_date
      const weeklyCompleted = missionsData?.filter(mission => {
        if (!mission.last_completion_date) return false;
        const completionDate = new Date(mission.last_completion_date);
        const weekAgoDate = new Date(weekAgoStr);
        return completionDate >= weekAgoDate;
      }).length || 0;

      // Calculate daily missions for progress calculation
      const dailyMissionsForProgress = missionsData?.filter(mission => mission.frequency_type === 'daily') || [];
      const dailyMissionsCompletedToday = dailyMissionsForProgress.filter(mission => 
        isMissionCompletedToday(mission.last_completion_date)
      ).length;

      // Compile dashboard statistics
      const dashboardStats = {
        missions: {
          total: allTotalToday, // Use combined total
          completedToday: allCompletedToday, // Use combined completed
          completedThisWeek: weeklyCompleted,
          progress: allTotalToday > 0 ? Math.round((allCompletedToday / allTotalToday) * 100) : 0
        },
        challenges: {
          active: activeChallenges,
          completed: completedChallenges,
          totalDays: totalChallengeDays,
          progress: activeChallenges > 0 ? Math.round((totalChallengeDays / (activeChallenges * 30)) * 100) : 0 // Assume 30 days per challenge
        },
        training: {
          hasActiveSchema: trainingStats.hasActiveSchema,
          currentDay: trainingStats.currentDay,
          totalDays: trainingStats.totalDays,
          weeklySessions: trainingStats.weeklySessions,
          progress: trainingStats.totalDays > 0 ? Math.round((trainingStats.currentDay / trainingStats.totalDays) * 100) : 0
        },
        mindFocus: {
          total: mindFocusMissions.filter(m => m.frequency_type === 'daily').length,
          completedToday: mindFocusCompleted,
          progress: mindFocusMissions.filter(m => m.frequency_type === 'daily').length > 0 ? Math.round((mindFocusCompleted / mindFocusMissions.filter(m => m.frequency_type === 'daily').length) * 100) : 0
        },
        boekenkamer: {
          total: readingMissions.filter(m => m.frequency_type === 'daily').length,
          completedToday: readingCompleted,
          progress: readingMissions.filter(m => m.frequency_type === 'daily').length > 0 ? Math.round((readingCompleted / readingMissions.filter(m => m.frequency_type === 'daily').length) * 100) : 0
        },
        xp: {
          total: xpData?.total_xp || 0,
          rank: rankData,
          level: rankData?.rank_order || 1
        },
        summary: {
          totalProgress: Math.round((
            (dailyMissionsCompletedToday / Math.max(dailyMissions.length, 1)) * 0.4 +
            (totalChallengeDays / Math.max(activeChallenges * 30, 1)) * 0.2 +
            (trainingStats.currentDay / Math.max(trainingStats.totalDays, 1)) * 0.2 +
            (mindFocusCompleted / Math.max(mindFocusMissions.filter(m => m.frequency_type === 'daily').length, 1)) * 0.1 +
            (readingCompleted / Math.max(readingMissions.filter(m => m.frequency_type === 'daily').length, 1)) * 0.1
          ) * 100)
        }
      };

      console.log('✅ Dashboard stats fetched successfully');

      return NextResponse.json({
        success: true,
        stats: dashboardStats
      });

    } catch (error) {
      console.log('❌ Error in database operations:', error);
      return NextResponse.json({ 
        error: 'Database operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.log('❌ Error in dashboard stats API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 