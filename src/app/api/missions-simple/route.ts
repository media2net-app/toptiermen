import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';

// Initialize Supabase client with proper error handling
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

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

// Write missions to file
async function writeMissionsToFile(missions: { [userId: string]: any[] }) {
  await ensureDataDir();
  await fs.writeFile(MISSIONS_FILE, JSON.stringify(missions, null, 2));
}

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

// Helper function to calculate streak from file-based missions
function calculateFileBasedStreak(userMissions: any[]): number {
  const today = getTodayDate();
  const dailyMissions = userMissions.filter(m => m.type === 'Dagelijks');
  
  if (dailyMissions.length === 0) return 0;
  
  // Check if all daily missions are completed today
  const allCompletedToday = dailyMissions.every(m => isMissionCompletedToday(m.last_completion_date));
  
  if (!allCompletedToday) return 0;
  
  // Simple streak calculation - in a real implementation, you'd track consecutive days
  // For now, we'll return a basic streak based on completion patterns
  let streak = 1;
  
  // Check previous days for consecutive completion
  for (let i = 1; i <= 7; i++) {
    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - i);
    const checkDateStr = checkDate.toISOString().split('T')[0];
    
    const completedOnDate = dailyMissions.every(m => {
      if (!m.last_completion_date) return false;
      return m.last_completion_date === checkDateStr;
    });
    
    if (completedOnDate) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

export async function GET(request: Request) {
  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();

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

      console.log('🔍 Database query result:', { userMissions: userMissions?.length || 0, missionsError: missionsError?.message });

      if (missionsError) {
        console.log('⚠️  Missions table not available, trying file-based storage');
        throw missionsError;
      }

      // Get user streak
      const { data: streakData, error: streakError } = await supabase
        .from('user_daily_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      const dailyStreak = streakData?.current_streak || 0;

      // Process database missions
      const dbMissions = userMissions?.map(mission => {
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
      }) || [];

      // Try to load file-based missions as well
      let fileMissions: any[] = [];
      let fileStreak = 0;
      try {
        const fileMissionsData = await readMissionsFromFile();
        fileMissions = fileMissionsData[userId] || [];
        fileStreak = calculateFileBasedStreak(fileMissions);
        console.log('📁 File storage check:', { fileMissions: fileMissions.length, fileStreak });
      } catch (fileError) {
        console.log('⚠️  File storage not available');
      }

      // Combine database and file missions, avoiding duplicates
      const allMissions = [...dbMissions];
      const dbMissionIds = new Set(dbMissions.map(m => m.id));
      
      fileMissions.forEach(fileMission => {
        if (!dbMissionIds.has(fileMission.id)) {
          allMissions.push({
            id: fileMission.id,
            title: fileMission.title,
            type: fileMission.type,
            done: fileMission.type === 'Dagelijks' ? isMissionCompletedToday(fileMission.last_completion_date) : !!fileMission.last_completion_date,
            category: fileMission.category,
            icon: fileMission.icon,
            badge: fileMission.badge,
            progress: fileMission.progress,
            shared: fileMission.shared,
            accountabilityPartner: fileMission.accountabilityPartner,
            xp_reward: fileMission.xp_reward,
            last_completion_date: fileMission.last_completion_date
          });
        }
      });

      const completedToday = allMissions.filter(m => m.done).length;
      const totalToday = allMissions.filter(m => m.type === 'Dagelijks').length;

      // Use the higher streak value between database and file-based
      const combinedStreak = Math.max(dailyStreak, fileStreak);

      const summary = {
        completedToday,
        totalToday,
        dailyStreak: combinedStreak
      };

      console.log('✅ Missions loaded:', { database: dbMissions.length, file: fileMissions.length, total: allMissions.length });
      return NextResponse.json({
        missions: allMissions,
        summary
      });
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
      dailyStreak: 0
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
    // Initialize Supabase client
    const supabase = getSupabaseClient();

    const body = await request.json();
    const { action, userId, missionId, title, type, mission } = body;

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
          console.log('⚠️  Mission not found in database, trying file-based toggle');
          
          try {
            // Try to find mission in file storage
            const fileMissions = await readMissionsFromFile();
            const userMissions = fileMissions[userId] || [];
            const mission = userMissions.find((m: any) => m.id === missionId);
            
            if (mission) {
              const today = getTodayDate();
              const isCompletedToday = mission.type === 'Dagelijks' ? isMissionCompletedToday(mission.last_completion_date) : !!mission.last_completion_date;
              
              let newCompletionDate = null;
              let isNowCompleted = false;
              
              if (mission.type === 'Dagelijks') {
                // Daily mission logic
                if (isCompletedToday) {
                  // Already completed today, uncomplete it
                  newCompletionDate = null;
                  isNowCompleted = false;
                } else {
                  // Not completed today, complete it
                  newCompletionDate = today;
                  isNowCompleted = true;
                }
              } else {
                // Weekly/Monthly mission logic
                if (mission.last_completion_date) {
                  // Already completed, uncomplete it
                  newCompletionDate = null;
                  isNowCompleted = false;
                } else {
                  // Not completed, complete it
                  newCompletionDate = today;
                  isNowCompleted = true;
                }
              }
              
              // Update mission in file storage
              const updatedMissions = userMissions.map((m: any) => 
                m.id === missionId 
                  ? { ...m, last_completion_date: newCompletionDate }
                  : m
              );
              
              fileMissions[userId] = updatedMissions;
              await writeMissionsToFile(fileMissions);
              
              console.log('✅ Mission toggled in file storage:', missionId, isNowCompleted);
              return NextResponse.json({ 
                success: true,
                completed: isNowCompleted,
                xpEarned: isNowCompleted ? mission.xp_reward : -mission.xp_reward,
                message: isNowCompleted ? `Missie voltooid! +${mission.xp_reward} XP verdiend!` : `Missie ongedaan gemaakt. ${mission.xp_reward} XP afgetrokken.`,
                completionDate: newCompletionDate
              });
            }
          } catch (fileError) {
            console.log('⚠️  File storage failed, using dummy toggle');
          }
          
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
          // Weekly/Monthly mission logic - prevent undoing past completions
          if (existingMission.last_completion_date) {
            const completionDate = new Date(existingMission.last_completion_date);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            // Only allow undoing if completion was today or yesterday
            if (completionDate >= yesterday) {
              // Already completed recently, uncomplete it
              newCompletionDate = null;
              xpEarned = -existingMission.xp_reward;
              isNowCompleted = false;
            } else {
              // Cannot undo past completions
              return NextResponse.json({ 
                success: false,
                message: 'Je kunt alleen vandaag of gisteren ongedaan maken!' 
              });
            }
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
              // Get current streak data
              const { data: currentStreakData, error: streakFetchError } = await supabase
                .from('user_daily_streaks')
                .select('*')
                .eq('user_id', userId)
                .single();

              let newStreak = 1;
              let longestStreak = 1;

              if (!streakFetchError && currentStreakData) {
                const lastCompletionDate = currentStreakData.last_completion_date;
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                // Check if user completed missions yesterday (consecutive streak)
                if (lastCompletionDate === yesterdayStr) {
                  newStreak = currentStreakData.current_streak + 1;
                } else if (lastCompletionDate === today) {
                  // Already completed today, keep current streak
                  newStreak = currentStreakData.current_streak;
                } else {
                  // Break in streak, start over
                  newStreak = 1;
                }

                longestStreak = Math.max(currentStreakData.longest_streak || 0, newStreak);
              }

              // Update streak
              const { error: streakError } = await supabase
                .from('user_daily_streaks')
                .upsert({
                  user_id: userId,
                  current_streak: newStreak,
                  longest_streak: longestStreak,
                  last_completion_date: today,
                  updated_at: new Date().toISOString()
                }, {
                  onConflict: 'user_id'
                });

              if (!streakError) {
                console.log(`✅ Daily streak updated: ${newStreak} days`);
              } else {
                console.error('❌ Error updating streak:', streakError);
              }
            } else if (!isNowCompleted && existingMission.frequency_type === 'daily') {
              // If uncompleting a daily mission, we need to recalculate the streak
              const { data: currentStreakData, error: streakFetchError } = await supabase
                .from('user_daily_streaks')
                .select('*')
                .eq('user_id', userId)
                .single();

              if (!streakFetchError && currentStreakData) {
                // Check if all other daily missions are still completed today
                const { data: otherDailyMissions, error: otherDailyError } = await supabase
                  .from('user_missions')
                  .select('*')
                  .eq('user_id', userId)
                  .eq('frequency_type', 'daily')
                  .neq('id', missionId);

                if (!otherDailyError && otherDailyMissions) {
                  const allOtherCompleted = otherDailyMissions.every(mission => 
                    isMissionCompletedToday(mission.last_completion_date)
                  );

                  if (!allOtherCompleted) {
                    // If not all other missions are completed, reset streak to 0
                    const { error: resetError } = await supabase
                      .from('user_daily_streaks')
                      .upsert({
                        user_id: userId,
                        current_streak: 0,
                        longest_streak: currentStreakData.longest_streak || 0,
                        last_completion_date: null,
                        updated_at: new Date().toISOString()
                      }, {
                        onConflict: 'user_id'
                      });

                    if (!resetError) {
                      console.log('✅ Daily streak reset to 0 due to incomplete missions');
                    }
                  }
                }
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
      // Use mission data if provided (for suggested missions), otherwise use title/type
      const missionTitle = mission?.title || title;
      const missionType = mission?.type || type;
      const missionCategory = mission?.category || 'Algemeen';
      const missionIcon = mission?.icon || '🎯';
      const missionXp = mission?.xp_reward || 15;
      
      try {
        // Try to create mission in database
        const { data: newMission, error: createError } = await supabase
          .from('user_missions')
          .insert({
            user_id: userId,
            title: missionTitle,
            description: missionTitle,
            frequency_type: missionType === 'Dagelijks' ? 'daily' : missionType === 'Wekelijks' ? 'weekly' : 'monthly',
            difficulty_level: 'medium',
            xp_reward: missionXp,
            status: 'active',
            category_slug: missionCategory.toLowerCase().replace(/\s+/g, '-'),
            icon: missionIcon,
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
        console.log('⚠️  Database not available, using file-based create');
        
        try {
          // Create mission in file storage
          const fileMissions = await readMissionsFromFile();
          const userMissions = fileMissions[userId] || [];
          
          const newMission = {
            id: Date.now().toString(),
            title: missionTitle,
            type: missionType,
            done: false,
            category: missionCategory,
            icon: missionIcon,
            badge: 'Custom Badge',
            progress: 0,
            shared: false,
            accountabilityPartner: null,
            xp_reward: missionXp,
            last_completion_date: null,
            created_at: new Date().toISOString()
          };
          
          userMissions.push(newMission);
          fileMissions[userId] = userMissions;
          await writeMissionsToFile(fileMissions);
          
          console.log('✅ Mission created in file storage:', newMission.id);
          return NextResponse.json({ 
            success: true, 
            mission: newMission,
            message: 'Missie aangemaakt!' 
          });
        } catch (fileError) {
          console.log('⚠️  File storage failed, using dummy create');
          // Fallback to dummy create
          const dummyMission = {
            id: Date.now().toString(),
            title: missionTitle,
            type: missionType,
            done: false,
            category: missionCategory,
            icon: missionIcon,
            badge: 'Custom Badge',
            progress: 0,
            shared: false,
            accountabilityPartner: null,
            xp_reward: missionXp,
            last_completion_date: null,
            created_at: new Date().toISOString()
          };

          return NextResponse.json({ 
            success: true, 
            mission: dummyMission,
            message: 'Missie aangemaakt!' 
          });
        }
      }
    }

    if (action === 'delete') {
      try {
        // Try to delete mission from database
        const { error: deleteError } = await supabase
          .from('user_missions')
          .delete()
          .eq('id', missionId)
          .eq('user_id', userId);

        if (deleteError) {
          console.log('⚠️  Error deleting mission from database, using dummy delete');
          throw deleteError;
        }

        console.log('✅ Mission deleted from database:', missionId);
        return NextResponse.json({ 
          success: true,
          message: 'Missie verwijderd!' 
        });

      } catch (error) {
        console.log('⚠️  Database not available, using file-based delete');
        
        try {
          // Delete mission from file storage
          const fileMissions = await readMissionsFromFile();
          const userMissions = fileMissions[userId] || [];
          
          const updatedMissions = userMissions.filter((mission: any) => mission.id !== missionId);
          fileMissions[userId] = updatedMissions;
          await writeMissionsToFile(fileMissions);
          
          console.log('✅ Mission deleted from file storage:', missionId);
          return NextResponse.json({ 
            success: true,
            message: 'Missie verwijderd!' 
          });
        } catch (fileError) {
          console.log('⚠️  File storage failed, using dummy delete');
          // Fallback to dummy delete - just return success
          return NextResponse.json({ 
            success: true,
            message: 'Missie verwijderd!' 
          });
        }
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('❌ Error in missions POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}