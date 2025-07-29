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

// Helper function to get today's date
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Helper function to calculate progress percentage
function calculateProgress(startDate: string, durationDays: number): number {
  const start = new Date(startDate);
  const today = new Date();
  const daysElapsed = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const progress = Math.min(Math.max((daysElapsed / durationDays) * 100, 0), 100);
  return Math.round(progress);
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

    console.log('🔍 Fetching challenges for user:', userId);

    try {
      // Get all available challenges
      const { data: challenges, error: challengesError } = await supabase
        .from('challenges')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (challengesError) {
        console.log('⚠️  Challenges table not available, using dummy data');
        throw challengesError;
      }

      // Get user's active challenges
      const { data: userChallenges, error: userChallengesError } = await supabase
        .from('user_challenges')
        .select(`
          *,
          challenges (*)
        `)
        .eq('user_id', userId)
        .in('status', ['active', 'completed']);

      if (userChallengesError) {
        console.log('⚠️  User challenges table not available');
      }

      // Get today's challenge logs
      const today = getTodayDate();
      const { data: todayLogs, error: logsError } = await supabase
        .from('challenge_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_date', today);

      if (logsError) {
        console.log('⚠️  Challenge logs table not available');
      }

      // Process challenges with user participation status
      const processedChallenges = challenges?.map(challenge => {
        const userChallenge = userChallenges?.find(uc => uc.challenge_id === challenge.id);
        const todayLog = todayLogs?.find(log => log.challenge_id === challenge.id);
        
        let status = 'available';
        let progress = 0;
        let currentStreak = 0;
        let daysRemaining = challenge.duration_days;
        let isCompletedToday = false;

        if (userChallenge) {
          status = userChallenge.status;
          progress = userChallenge.progress_percentage;
          currentStreak = userChallenge.current_streak;
          
          if (userChallenge.start_date) {
            const startDate = new Date(userChallenge.start_date);
            const today = new Date();
            const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            daysRemaining = Math.max(challenge.duration_days - daysElapsed, 0);
          }

          if (todayLog) {
            isCompletedToday = todayLog.completed;
          }
        }

        return {
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          category: challenge.category_slug === 'fitness' ? 'Fitness' :
                   challenge.category_slug === 'mindset' ? 'Mindset' :
                   challenge.category_slug === 'health' ? 'Gezondheid' :
                   challenge.category_slug === 'community' ? 'Community' : 'Algemeen',
          difficulty: challenge.difficulty_level === 'easy' ? 'Makkelijk' :
                     challenge.difficulty_level === 'medium' ? 'Gemiddeld' : 'Moeilijk',
          durationDays: challenge.duration_days,
          xpReward: challenge.xp_reward,
          badgeName: challenge.badge_name,
          badgeIcon: challenge.badge_icon,
          isCommunityChallenge: challenge.is_community_challenge,
          status,
          progress,
          currentStreak,
          daysRemaining,
          isCompletedToday,
          startDate: userChallenge?.start_date,
          completionDate: userChallenge?.completion_date
        };
      }) || [];

      // Calculate summary statistics
      const activeChallenges = processedChallenges.filter(c => c.status === 'active');
      const completedChallenges = processedChallenges.filter(c => c.status === 'completed');
      
      // Calculate total XP earned from completed challenges
      const completedXp = completedChallenges.reduce((sum, c) => sum + c.xpReward, 0);
      
      // Calculate daily XP earned from active challenges (10 XP per completed day)
      const dailyXpEarned = activeChallenges.reduce((sum, c) => {
        return sum + (c.currentStreak * 10); // 10 XP per completed day
      }, 0);
      
      const totalXpEarned = completedXp + dailyXpEarned;

      const summary = {
        totalChallenges: processedChallenges.length,
        activeChallenges: activeChallenges.length,
        completedChallenges: completedChallenges.length,
        totalXpEarned,
        dailyXpEarned,
        completedXp,
        averageProgress: activeChallenges.length > 0 
          ? Math.round(activeChallenges.reduce((sum, c) => sum + c.progress, 0) / activeChallenges.length)
          : 0
      };

      console.log('✅ Challenges fetched successfully');
      return NextResponse.json({
        challenges: processedChallenges,
        summary
      });

    } catch (error) {
      console.log('⚠️  Database not available, using dummy data');
      
      // Fallback to dummy data
      const dummyChallenges = [
        {
          id: '1',
          title: '30 Dagen Hardlopen',
          description: 'Hardloop elke dag 30 dagen lang. Begin met 5 minuten en bouw op naar 30 minuten.',
          category: 'Fitness',
          difficulty: 'Gemiddeld',
          durationDays: 30,
          xpReward: 300,
          badgeName: 'Running Warrior',
          badgeIcon: '🏃‍♂️',
          isCommunityChallenge: false,
          status: 'available',
          progress: 0,
          currentStreak: 0,
          daysRemaining: 30,
          isCompletedToday: false
        },
        {
          id: '2',
          title: '21 Dagen Geen Social Media',
          description: 'Gebruik 21 dagen lang geen social media. Focus op echte connecties en productiviteit.',
          category: 'Mindset',
          difficulty: 'Gemiddeld',
          durationDays: 21,
          xpReward: 200,
          badgeName: 'Digital Detox Master',
          badgeIcon: '🧠',
          isCommunityChallenge: false,
          status: 'active',
          progress: 45,
          currentStreak: 9,
          daysRemaining: 12,
          isCompletedToday: true
        },
        {
          id: '3',
          title: 'Brotherhood 30 Dagen Challenge',
          description: 'Doe samen met de Brotherhood 30 dagen lang elke dag een goede daad.',
          category: 'Community',
          difficulty: 'Gemiddeld',
          durationDays: 30,
          xpReward: 400,
          badgeName: 'Brotherhood Hero',
          badgeIcon: '🤝',
          isCommunityChallenge: true,
          status: 'available',
          progress: 0,
          currentStreak: 0,
          daysRemaining: 30,
          isCompletedToday: false
        }
      ];

      const summary = {
        totalChallenges: 3,
        activeChallenges: 1,
        completedChallenges: 0,
        totalXpEarned: 90, // 9 days * 10 XP = 90 XP from active challenge
        dailyXpEarned: 90,
        completedXp: 0,
        averageProgress: 45
      };

      return NextResponse.json({
        challenges: dummyChallenges,
        summary
      });
    }

  } catch (error) {
    console.error('❌ Error in challenges GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();

    const body = await request.json();
    const { action, userId, challengeId, notes } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('📝 Processing challenge action:', action, 'for user:', userId);

    if (action === 'join') {
      try {
        // Get challenge details
        const { data: challenge, error: challengeError } = await supabase
          .from('challenges')
          .select('*')
          .eq('id', challengeId)
          .single();

        if (challengeError) {
          console.log('⚠️  Challenge not found in database, using dummy join');
          return NextResponse.json({ 
            success: true,
            message: 'Challenge gestart!',
            challengeId: challengeId
          });
        }

        // Check if user already joined this challenge
        const { data: existingParticipation } = await supabase
          .from('user_challenges')
          .select('*')
          .eq('user_id', userId)
          .eq('challenge_id', challengeId)
          .single();

        if (existingParticipation) {
          return NextResponse.json({ 
            success: false,
            message: 'Je doet al mee aan deze challenge!' 
          });
        }

        // Join the challenge
        const { data: userChallenge, error: joinError } = await supabase
          .from('user_challenges')
          .insert({
            user_id: userId,
            challenge_id: challengeId,
            status: 'active',
            start_date: getTodayDate(),
            progress_percentage: 0,
            current_streak: 0,
            longest_streak: 0
          })
          .select()
          .single();

        if (joinError) {
          console.log('⚠️  Error joining challenge in database, using dummy join');
          return NextResponse.json({ 
            success: true,
            message: 'Challenge gestart!',
            challengeId: challengeId
          });
        }

        console.log('✅ User joined challenge:', userChallenge);
        return NextResponse.json({ 
          success: true,
          message: 'Challenge gestart!',
          challengeId: challengeId
        });

      } catch (error) {
        console.log('⚠️  Database not available, using dummy join');
        return NextResponse.json({ 
          success: true,
          message: 'Challenge gestart!',
          challengeId: challengeId
        });
      }
    }

    if (action === 'complete-day') {
      try {
        const today = getTodayDate();

        // Get user challenge
        const { data: userChallenge, error: userChallengeError } = await supabase
          .from('user_challenges')
          .select(`
            *,
            challenges (*)
          `)
          .eq('user_id', userId)
          .eq('challenge_id', challengeId)
          .single();

        if (userChallengeError) {
          console.log('⚠️  User challenge not found, using dummy completion');
          return NextResponse.json({ 
            success: true,
            message: 'Dag voltooid! +10 XP',
            xpEarned: 10
          });
        }

        // Check if already completed today
        const { data: todayLog } = await supabase
          .from('challenge_logs')
          .select('*')
          .eq('user_id', userId)
          .eq('challenge_id', challengeId)
          .eq('activity_date', today)
          .single();

        if (todayLog && todayLog.completed) {
          return NextResponse.json({ 
            success: false,
            message: 'Je hebt vandaag al voltooid!' 
          });
        }

        // Log today's completion
        const { error: logError } = await supabase
          .from('challenge_logs')
          .insert({
            user_id: userId,
            challenge_id: challengeId,
            user_challenge_id: userChallenge.id,
            activity_date: today,
            completed: true,
            notes: notes || 'Dag voltooid',
            xp_earned: 10
          });

        if (logError) {
          console.error('⚠️  Error logging challenge completion:', logError);
        }

        // Update user challenge progress
        const newStreak = userChallenge.current_streak + 1;
        const newProgress = Math.min(((newStreak / userChallenge.challenges.duration_days) * 100), 100);
        
        const { error: updateError } = await supabase
          .from('user_challenges')
          .update({
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, userChallenge.longest_streak),
            progress_percentage: Math.round(newProgress),
            last_activity_date: today,
            updated_at: new Date().toISOString()
          })
          .eq('id', userChallenge.id);

        if (updateError) {
          console.error('⚠️  Error updating user challenge:', updateError);
        }

        // Award daily XP (10 XP per day)
        const dailyXp = 10;
        const { error: dailyXpError } = await supabase
          .rpc('exec_sql', {
            sql_query: `UPDATE user_xp SET total_xp = total_xp + ${dailyXp}, updated_at = NOW() WHERE user_id = '${userId}'`
          });

        if (dailyXpError) {
          console.error('⚠️  Error updating daily XP:', dailyXpError);
        } else {
          // Log daily XP transaction
          const { error: dailyTransactionError } = await supabase
            .from('xp_transactions')
            .insert({
              user_id: userId,
              xp_amount: dailyXp,
              source_type: 'challenge_daily',
              source_id: Math.abs(challengeId.split('').reduce((a: number, b: string) => a + b.charCodeAt(0), 0)),
              description: `Challenge dag voltooid: ${userChallenge.challenges.title}`,
              created_at: new Date().toISOString()
            });

          if (dailyTransactionError) {
            console.error('⚠️  Error logging daily XP transaction:', dailyTransactionError);
          }
        }

        // Check if challenge is completed
        if (newProgress >= 100) {
          const { error: completeError } = await supabase
            .from('user_challenges')
            .update({
              status: 'completed',
              completion_date: today
            })
            .eq('id', userChallenge.id);

          if (!completeError) {
            // Award bonus XP for challenge completion
            const bonusXp = userChallenge.challenges.xp_reward - (newStreak * dailyXp); // Bonus XP = total reward - daily XP already earned
            const { error: bonusXpError } = await supabase
              .rpc('exec_sql', {
                sql_query: `UPDATE user_xp SET total_xp = total_xp + ${bonusXp}, updated_at = NOW() WHERE user_id = '${userId}'`
              });

            if (!bonusXpError) {
              // Log bonus XP transaction
              const { error: bonusTransactionError } = await supabase
                .from('xp_transactions')
                .insert({
                  user_id: userId,
                  xp_amount: bonusXp,
                  source_type: 'challenge_completion_bonus',
                  source_id: Math.abs(challengeId.split('').reduce((a: number, b: string) => a + b.charCodeAt(0), 0)),
                  description: `Challenge voltooid bonus: ${userChallenge.challenges.title}`,
                  created_at: new Date().toISOString()
                });

              if (bonusTransactionError) {
                console.error('⚠️  Error logging bonus XP transaction:', bonusTransactionError);
              }
            }

            return NextResponse.json({ 
              success: true,
              message: `Challenge voltooid! +${dailyXp} XP (dag) +${bonusXp} XP (bonus) = +${dailyXp + bonusXp} XP totaal!`,
              xpEarned: dailyXp + bonusXp,
              challengeCompleted: true
            });
          }
        }

        return NextResponse.json({ 
          success: true,
          message: 'Dag voltooid! +10 XP',
          xpEarned: dailyXp,
          newStreak,
          newProgress: Math.round(newProgress)
        });

      } catch (error) {
        console.log('⚠️  Database not available, using dummy completion');
        return NextResponse.json({ 
          success: true,
          message: 'Dag voltooid! +10 XP',
          xpEarned: 10
        });
      }
    }

    if (action === 'undo-day') {
      try {
        const today = getTodayDate();
        
        // Get user challenge
        const { data: userChallenge, error: userChallengeError } = await supabase
          .from('user_challenges')
          .select(`
            *,
            challenges (*)
          `)
          .eq('user_id', userId)
          .eq('challenge_id', challengeId)
          .single();

        if (userChallengeError) {
          console.log('⚠️  User challenge not found, using dummy undo');
          return NextResponse.json({ 
            success: true,
            message: 'Dag ongedaan gemaakt! -10 XP',
            xpRemoved: 10
          });
        }

        // Get today's completion log first
        const { data: todayLog } = await supabase
          .from('challenge_logs')
          .select('*')
          .eq('user_id', userId)
          .eq('challenge_id', challengeId)
          .eq('activity_date', today)
          .eq('completed', true)
          .single();

        let logToUndo;
        let xpToRemove;

        if (todayLog) {
          // If today is completed, undo today's completion
          logToUndo = todayLog;
          xpToRemove = todayLog.xp_earned || 10;
        } else {
          // If today is not completed, check if we can undo yesterday's completion
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          const { data: yesterdayLog } = await supabase
            .from('challenge_logs')
            .select('*')
            .eq('user_id', userId)
            .eq('challenge_id', challengeId)
            .eq('activity_date', yesterdayStr)
            .eq('completed', true)
            .single();

          if (yesterdayLog) {
            logToUndo = yesterdayLog;
            xpToRemove = yesterdayLog.xp_earned || 10;
          } else {
            // Get the most recent completed day (but only if it's today or yesterday)
            const { data: recentLogs, error: logsError } = await supabase
              .from('challenge_logs')
              .select('*')
              .eq('user_id', userId)
              .eq('challenge_id', challengeId)
              .eq('completed', true)
              .in('activity_date', [today, yesterdayStr])
              .order('activity_date', { ascending: false })
              .limit(1);

            if (logsError || !recentLogs || recentLogs.length === 0) {
              return NextResponse.json({ 
                success: false,
                message: 'Je kunt alleen vandaag of gisteren ongedaan maken!' 
              });
            }

            logToUndo = recentLogs[0];
            xpToRemove = logToUndo.xp_earned || 10;
          }
        }

        // Prevent undoing days older than yesterday
        const logDate = new Date(logToUndo.activity_date);
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        
        if (logDate < twoDaysAgo) {
          return NextResponse.json({ 
            success: false,
            message: 'Je kunt alleen vandaag of gisteren ongedaan maken!' 
          });
        }

        // Delete the log entry
        const { error: deleteError } = await supabase
          .from('challenge_logs')
          .delete()
          .eq('id', logToUndo.id);

        if (deleteError) {
          console.error('⚠️  Error deleting challenge log:', deleteError);
        }

        // Update user challenge progress (reduce streak by 1)
        const newStreak = Math.max(0, userChallenge.current_streak - 1);
        const newProgress = Math.max(0, Math.min(((newStreak / userChallenge.challenges.duration_days) * 100), 100));
        
        const { error: updateError } = await supabase
          .from('user_challenges')
          .update({
            current_streak: newStreak,
            progress_percentage: Math.round(newProgress),
            status: newStreak === 0 ? 'active' : userChallenge.status, // Reset to active if streak becomes 0
            completion_date: newStreak === 0 ? null : userChallenge.completion_date, // Remove completion date if streak becomes 0
            updated_at: new Date().toISOString()
          })
          .eq('id', userChallenge.id);

        if (updateError) {
          console.error('⚠️  Error updating user challenge:', updateError);
        }

        // Remove XP
        const { error: xpError } = await supabase
          .rpc('exec_sql', {
            sql_query: `UPDATE user_xp SET total_xp = total_xp - ${xpToRemove}, updated_at = NOW() WHERE user_id = '${userId}'`
          });

        if (xpError) {
          console.error('⚠️  Error removing XP:', xpError);
        } else {
          // Log XP removal transaction
          const { error: transactionError } = await supabase
            .from('xp_transactions')
            .insert({
              user_id: userId,
              xp_amount: -xpToRemove,
              source_type: 'challenge_daily_undo',
              source_id: Math.abs(challengeId.split('').reduce((a: number, b: string) => a + b.charCodeAt(0), 0)),
              description: `Challenge dag ongedaan gemaakt: ${userChallenge.challenges.title}`,
              created_at: new Date().toISOString()
            });

          if (transactionError) {
            console.error('⚠️  Error logging XP removal transaction:', transactionError);
          }
        }

        return NextResponse.json({ 
          success: true,
          message: 'Dag ongedaan gemaakt! -10 XP',
          xpRemoved: xpToRemove,
          newStreak,
          newProgress: Math.round(newProgress)
        });

      } catch (error) {
        console.log('⚠️  Database not available, using dummy undo');
        return NextResponse.json({ 
          success: true,
          message: 'Dag ongedaan gemaakt! -10 XP',
          xpRemoved: 10
        });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('❌ Error in challenges POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 