import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to get mission title by ID
function getMissionTitle(missionId: string): string {
  const missionTitles: { [key: string]: string } = {
    '1': '10.000 stappen per dag',
    '2': '30 min lezen',
    '3': '3x sporten',
    '4': '10 min mediteren',
    '5': 'Koud douchen'
  };
  return missionTitles[missionId] || `Missie ${missionId}`;
}

// Helper function to get today's date in YYYY-MM-DD format
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Helper function to check if mission was completed today
function isMissionCompletedToday(completionDate: string | null): boolean {
  if (!completionDate) return false;
  return completionDate === getTodayDate();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('🔍 Fetching missions for user:', userId);

    // Try to get missions from database first
    try {
      const { data: userMissions, error: missionsError } = await supabase
        .from('user_missions')
        .select('*')
        .eq('user_id', userId);

      if (missionsError) {
        console.log('⚠️  Missions table not available, using dummy data');
        throw missionsError;
      }

      // Get user streak
      const { data: streakData, error: streakError } = await supabase
        .from('user_daily_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      const dailyStreak = streakData?.current_streak || 0;

      // If we have missions in database, return them with proper daily tracking
      if (userMissions && userMissions.length > 0) {
        const today = getTodayDate();
        
        const missions = userMissions.map(mission => {
          // For all missions, check if completed based on last_completion_date
          const isCompletedToday = mission.frequency_type === 'daily' 
            ? isMissionCompletedToday(mission.last_completion_date)
            : !!mission.last_completion_date; // For weekly/monthly, just check if it has a completion date

          return {
            id: mission.id,
            title: mission.title,
            type: mission.frequency_type === 'daily' ? 'Dagelijks' : 
                  mission.frequency_type === 'weekly' ? 'Wekelijks' : 'Maandelijks',
            done: isCompletedToday,
            category: mission.category_slug === 'health-fitness' ? 'Gezondheid & Fitness' :
                     mission.category_slug === 'mindset-focus' ? 'Mindset & Focus' : 'Algemeen',
            icon: mission.icon || '🎯',
            badge: mission.badge_name || 'Mission Badge',
            progress: mission.current_progress,
            shared: mission.is_shared || false,
            accountabilityPartner: null,
            xp_reward: mission.xp_reward || 15,
            last_completion_date: mission.last_completion_date
          };
        });

        const completedToday = missions.filter(m => m.done).length;
        const totalToday = missions.filter(m => m.type === 'Dagelijks').length;

        const summary = {
          completedToday,
          totalToday,
          dailyStreak
        };

        console.log('✅ Missions fetched from database with daily tracking');
        return NextResponse.json({
          missions,
          summary
        });
      }
    } catch (error) {
      console.log('⚠️  Database not available, using dummy data');
    }

    // Fallback to dummy data if database is not available
    const dummyMissions = [
      { 
        id: '1', 
        title: '10.000 stappen per dag', 
        type: 'Dagelijks', 
        done: false, 
        category: 'Gezondheid & Fitness',
        icon: '👟',
        badge: 'Step Master',
        progress: 75,
        shared: false,
        accountabilityPartner: null,
        xp_reward: 20,
        last_completion_date: null
      },
      { 
        id: '2', 
        title: '30 min lezen', 
        type: 'Dagelijks', 
        done: false, 
        category: 'Mindset & Focus',
        icon: '📚',
        badge: 'Leesworm',
        progress: 65,
        shared: false,
        accountabilityPartner: null,
        xp_reward: 20,
        last_completion_date: null
      },
      { 
        id: '3', 
        title: '3x sporten', 
        type: 'Wekelijks', 
        done: false, 
        category: 'Gezondheid & Fitness',
        icon: '🏋️‍♂️',
        badge: 'Fitness Warrior',
        progress: 33,
        shared: true,
        accountabilityPartner: 'Mark V.',
        xp_reward: 50,
        last_completion_date: null
      },
      { 
        id: '4', 
        title: '10 min mediteren', 
        type: 'Dagelijks', 
        done: false, 
        category: 'Mindset & Focus',
        icon: '🧘‍♂️',
        badge: 'Mind Master',
        progress: 50,
        shared: false,
        accountabilityPartner: null,
        xp_reward: 25,
        last_completion_date: null
      },
      { 
        id: '5', 
        title: 'Koud douchen', 
        type: 'Dagelijks', 
        done: false, 
        category: 'Gezondheid & Fitness',
        icon: '❄️',
        badge: 'Ice Warrior',
        progress: 0,
        shared: false,
        accountabilityPartner: null,
        xp_reward: 30,
        last_completion_date: null
      },
    ];

    const summary = {
      completedToday: 0,
      totalToday: 4, // Daily missions count
      dailyStreak: 12
    };

    console.log('✅ Missions fetched successfully (dummy data)');
    return NextResponse.json({
      missions: dummyMissions,
      summary
    });

  } catch (error) {
    console.error('❌ Error in missions GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, missionId, title, type } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('📝 Processing mission action:', action, 'for user:', userId);

    if (action === 'toggle') {
      try {
        // First, try to get the mission from database
        const { data: existingMission, error: fetchError } = await supabase
          .from('user_missions')
          .select('*')
          .eq('id', missionId)
          .eq('user_id', userId)
          .single();

        if (fetchError) {
          console.log('⚠️  Mission not found in database, using dummy toggle');
          // Fallback to dummy toggle with daily tracking
          const xpRewards = {
            '1': 20, '2': 20, '3': 50, '4': 25, '5': 30
          };
          const xpEarned = xpRewards[missionId as keyof typeof xpRewards] || 15;
          const missionTitle = getMissionTitle(missionId);
          const today = getTodayDate();
          
          // Add XP to database and log transaction
          try {
            // Update user_xp table
            const { error: xpError } = await supabase
              .rpc('exec_sql', {
                sql_query: `UPDATE user_xp SET total_xp = total_xp + ${xpEarned}, updated_at = NOW() WHERE user_id = '${userId}'`
              });
            
            if (!xpError) {
              console.log('✅ XP added to database:', xpEarned);
              
              // Log XP transaction for history with actual mission title
              const { error: transactionError } = await supabase
                .from('xp_transactions')
                .insert({
                  user_id: userId,
                  xp_amount: xpEarned,
                  source_type: 'mission_completion',
                  source_id: Math.abs(missionId.split('').reduce((a: number, b: string) => a + b.charCodeAt(0), 0)), // Convert UUID to integer
                  description: `Missie voltooid: ${missionTitle}`,
                  created_at: new Date().toISOString()
                });
              
              if (transactionError) {
                console.error('⚠️  Error logging XP transaction:', transactionError);
              } else {
                console.log('✅ XP transaction logged for history');
              }
            }
          } catch (error) {
            console.log('⚠️  XP table not available');
          }

          return NextResponse.json({ 
            success: true,
            completed: true,
            xpEarned: xpEarned,
            message: `Missie voltooid! +${xpEarned} XP verdiend!`,
            completionDate: today
          });
        }

        // Mission exists in database, handle daily completion logic
        const today = getTodayDate();
        const isCompletedToday = isMissionCompletedToday(existingMission.last_completion_date);
        
        let xpEarned = 0;
        let newCompletionDate = null;
        let isNowCompleted = false;

        if (existingMission.frequency_type === 'daily') {
          // Daily mission logic
          if (isCompletedToday) {
            // Already completed today, uncomplete it
            newCompletionDate = null;
            xpEarned = -existingMission.xp_reward;
            isNowCompleted = false;
          } else {
            // Not completed today, complete it
            newCompletionDate = today;
            xpEarned = existingMission.xp_reward;
            isNowCompleted = true;
          }
        } else {
          // Weekly/Monthly mission logic (use last_completion_date for consistency)
          if (existingMission.last_completion_date) {
            // Already completed, uncomplete it
            newCompletionDate = null;
            xpEarned = -existingMission.xp_reward;
            isNowCompleted = false;
          } else {
            // Not completed, complete it
            newCompletionDate = today;
            xpEarned = existingMission.xp_reward;
            isNowCompleted = true;
          }
        }

        // Update mission with new completion date
        const { error: updateError } = await supabase
          .from('user_missions')
          .update({ 
            last_completion_date: newCompletionDate,
            updated_at: new Date().toISOString()
          })
          .eq('id', missionId)
          .eq('user_id', userId);

        if (updateError) {
          console.error('❌ Error updating mission:', updateError);
          return NextResponse.json({ error: 'Failed to update mission' }, { status: 500 });
        }

        // Log the action
        const { error: logError } = await supabase
          .from('user_mission_logs')
          .insert({
            user_id: userId,
            user_mission_id: missionId,
            completed_at: isNowCompleted ? new Date().toISOString() : null,
            xp_earned: xpEarned,
            notes: isNowCompleted ? 'Mission completed' : 'Mission uncompleted'
          });

        if (logError) {
          console.error('⚠️  Error logging mission action:', logError);
        }

        // Update XP in user_xp table and log transaction
        try {
          // Update user_xp table
          const { error: xpError } = await supabase
            .rpc('exec_sql', {
              sql_query: `UPDATE user_xp SET total_xp = total_xp + ${xpEarned}, updated_at = NOW() WHERE user_id = '${userId}'`
            });

          if (xpError) {
            console.error('⚠️  Error updating XP:', xpError);
          } else {
            console.log('✅ XP updated in database:', xpEarned);
            
            // Log XP transaction for history with actual mission title
            const { error: transactionError } = await supabase
              .from('xp_transactions')
              .insert({
                user_id: userId,
                xp_amount: xpEarned,
                source_type: isNowCompleted ? 'mission_completion' : 'mission_uncompletion',
                source_id: Math.abs(missionId.split('').reduce((a: number, b: string) => a + b.charCodeAt(0), 0)), // Convert UUID to integer
                description: isNowCompleted 
                  ? `Missie voltooid: ${existingMission.title}` 
                  : `Missie ongedaan gemaakt: ${existingMission.title}`,
                created_at: new Date().toISOString()
              });
            
            if (transactionError) {
              console.error('⚠️  Error logging XP transaction:', transactionError);
            } else {
              console.log('✅ XP transaction logged for history');
            }
          }
        } catch (error) {
          console.log('⚠️  XP table not available');
        }

        // Check if all daily missions are completed today
        if (isNowCompleted && existingMission.frequency_type === 'daily') {
          const { data: dailyMissions, error: dailyError } = await supabase
            .from('user_missions')
            .select('*')
            .eq('user_id', userId)
            .eq('frequency_type', 'daily');

          if (!dailyError && dailyMissions) {
            const allDailyCompleted = dailyMissions.every(mission => 
              isMissionCompletedToday(mission.last_completion_date)
            );

            if (allDailyCompleted) {
              // All daily missions completed today, update streak
              const { error: streakError } = await supabase
                .from('user_daily_streaks')
                .upsert({
                  user_id: userId,
                  current_streak: 1, // This logic needs refinement for actual streak increment
                  longest_streak: 1, // This logic needs refinement
                  last_completion_date: today,
                  updated_at: new Date().toISOString()
                }, {
                  onConflict: 'user_id'
                });

              if (!streakError) {
                console.log('✅ Daily streak updated');
              }
            }
          }
        }

        return NextResponse.json({ 
          success: true,
          completed: isNowCompleted,
          xpEarned: xpEarned,
          completionDate: newCompletionDate,
          allDailyCompleted: false
        });

      } catch (error) {
        console.error('❌ Error in database toggle:', error);
        // Fallback to dummy toggle
        const xpRewards = { '1': 20, '2': 20, '3': 50, '4': 25, '5': 30 };
        const xpEarned = xpRewards[missionId as keyof typeof xpRewards] || 15;
        const missionTitle = getMissionTitle(missionId);
        const today = getTodayDate();
        
        return NextResponse.json({ 
          success: true,
          completed: true,
          xpEarned: xpEarned,
          message: `Missie voltooid! +${xpEarned} XP verdiend!`,
          completionDate: today
        });
      }
    }

    if (action === 'create') {
      try {
        // Try to create mission in database
        const { data: newMission, error: createError } = await supabase
          .from('user_missions')
          .insert({
            user_id: userId,
            title: title,
            description: title,
            frequency_type: type === 'Dagelijks' ? 'daily' : type === 'Wekelijks' ? 'weekly' : 'monthly',
            difficulty_level: 'medium',
            xp_reward: 15,
            status: 'active',
            category_slug: 'general',
            icon: '🎯',
            badge_name: 'Custom Badge',
            current_progress: 0,
            is_shared: false,
            last_completion_date: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.log('⚠️  Error creating mission in database, using dummy create');
          throw createError;
        }

        console.log('✅ Mission created in database:', newMission);
        return NextResponse.json({ 
          success: true, 
          mission: newMission,
          message: 'Missie aangemaakt!' 
        });

      } catch (error) {
        console.log('⚠️  Database not available, using dummy create');
        // Fallback to dummy create
        const dummyMission = {
          id: Date.now().toString(),
          title: title,
          type: type,
          done: false,
          category: 'Algemeen',
          icon: '🎯',
          badge: 'Custom Badge',
          progress: 0,
          shared: false,
          accountabilityPartner: null,
          xp_reward: 15,
          last_completion_date: null
        };

        return NextResponse.json({ 
          success: true, 
          mission: dummyMission,
          message: 'Missie aangemaakt!' 
        });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('❌ Error in missions POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}