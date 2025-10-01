import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    return await fetchDashboardStats(userId);
  } catch (error) {
    console.error('❌ Error in GET dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    return await fetchDashboardStats(userId);
  } catch (error) {
    console.error('❌ Error in POST dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}

async function fetchDashboardStats(userId: string) {

    console.log('📊 Fetching dashboard stats for user:', userId);

    // Fetch all stats in parallel
    const [
      missionsStats,
      challengesStats,
      trainingStats,
      mindFocusStats,
      boekenkamerStats,
      financeStats,
      brotherhoodStats,
      academyStats,
      xpStats,
      userBadges
    ] = await Promise.all([
      // Missions stats
      fetchMissionsStats(userId),
      // Challenges stats
      fetchChallengesStats(userId),
      // Training stats
      fetchTrainingStats(userId),
      // Mind & Focus stats
      fetchMindFocusStats(userId),
      // Boekenkamer stats
      fetchBoekenkamerStats(userId),
      // Finance & Business stats
      fetchFinanceStats(userId),
      // Brotherhood stats
      fetchBrotherhoodStats(userId),
      // Academy stats
      fetchAcademyStats(userId),
      // XP and rank stats
      fetchXPStats(userId),
      // User badges
      fetchUserBadges(userId)
    ]);

    const stats = {
      missions: missionsStats,
      challenges: challengesStats,
      training: trainingStats,
      mindFocus: mindFocusStats,
      boekenkamer: boekenkamerStats,
      finance: financeStats,
      brotherhood: brotherhoodStats,
      academy: academyStats,
      xp: xpStats,
      summary: {
        totalProgress: calculateTotalProgress(missionsStats, trainingStats, mindFocusStats, boekenkamerStats, financeStats, brotherhoodStats, academyStats)
      }
    };

    console.log('✅ Dashboard stats fetched successfully');

    return NextResponse.json({
      stats,
      userBadges
    });
  }

async function fetchMissionsStats(userId: string) {
  try {
    // Get missions from the user_missions table
    const { data: missions, error: missionsError } = await supabaseAdmin
      .from('user_missions')
      .select('id, title, status, last_completion_date, points, xp_reward')
      .eq('user_id', userId);

    // Get challenges from the user_challenges table
    const { data: challenges, error: challengesError } = await supabaseAdmin
      .from('user_challenges')
      .select(`
        id, 
        challenge_id,
        status,
        progress_percentage,
        current_streak,
        start_date,
        completion_date,
        challenges (
          id,
          title,
          xp_reward
        )
      `)
      .eq('user_id', userId);

    if (missionsError) {
      console.error('Error fetching missions:', missionsError);
    }
    
    if (challengesError) {
      console.error('Error fetching challenges:', challengesError);
    }

    // Process missions
    const missionsTotal = missions?.length || 0;
    const today = new Date().toISOString().split('T')[0];
    const completedMissionsToday = missions?.filter(mission => 
      mission.last_completion_date === today
    ) || [];
    const completedMissions = missions?.filter(mission => mission.last_completion_date) || [];

    // Process challenges
    const challengesTotal = challenges?.length || 0;
    const activeChallenges = challenges?.filter(challenge => challenge.status === 'active') || [];
    const completedChallenges = challenges?.filter(challenge => challenge.completion_date) || [];
    
    // Count challenges completed today
    const completedChallengesToday = challenges?.filter(challenge => {
      if (!challenge.completion_date) return false;
      const completionDate = new Date(challenge.completion_date).toISOString().split('T')[0];
      return completionDate === today;
    }) || [];

    // Use only challenges for the challenge count (not missions)
    const total = challengesTotal;
    const completedToday = completedChallengesToday.length;
    const completedThisWeek = completedChallenges.length;
    const progress = total > 0 ? Math.round((completedThisWeek / total) * 100) : 0;

    console.log(`📊 Challenge stats for user ${userId}: ${completedThisWeek}/${total} completed (${progress}%), ${completedToday} today`);
    console.log(`   Challenges: ${completedChallenges.length}/${challengesTotal}, Missions: ${completedMissions.length}/${missionsTotal} (not counted)`);

    return {
      total,
      completedToday,
      completedThisWeek,
      progress
    };
  } catch (error) {
    console.error('Error fetching missions stats:', error);
    return { total: 0, completedToday: 0, completedThisWeek: 0, progress: 0 };
  }
}

async function fetchChallengesStats(userId: string) {
  try {
    console.log('🏆 Fetching challenges stats for user:', userId);
    
    // Get challenges from the user_challenges table
    const { data: challenges, error: challengesError } = await supabaseAdmin
      .from('user_challenges')
      .select(`
        id, 
        challenge_id,
        status,
        progress_percentage,
        current_streak,
        start_date,
        completion_date,
        challenges (
          id,
          title,
          xp_reward
        )
      `)
      .eq('user_id', userId);

    if (challengesError) {
      console.log('⚠️ Error fetching challenges:', challengesError);
      return {
        total: 0,
        completedToday: 0,
        completedThisWeek: 0,
        progress: 0
      };
    }

    // Process challenges
    const challengesTotal = challenges?.length || 0;
    const activeChallenges = challenges?.filter(challenge => challenge.status === 'active') || [];
    const completedChallenges = challenges?.filter(challenge => challenge.completion_date) || [];
    
    // Count challenges completed today
    const today = new Date().toISOString().split('T')[0];
    const completedChallengesToday = challenges?.filter(challenge => {
      if (!challenge.completion_date) return false;
      const completionDate = new Date(challenge.completion_date).toISOString().split('T')[0];
      return completionDate === today;
    }) || [];

    // Count challenges completed this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];
    
    const completedChallengesThisWeek = challenges?.filter(challenge => {
      if (!challenge.completion_date) return false;
      const completionDate = new Date(challenge.completion_date).toISOString().split('T')[0];
      return completionDate >= weekStartStr;
    }) || [];

    // Calculate progress
    const progress = challengesTotal > 0 ? Math.round((completedChallenges.length / challengesTotal) * 100) : 0;

    console.log('✅ Challenges stats calculated:', {
      total: challengesTotal,
      completedToday: completedChallengesToday.length,
      completedThisWeek: completedChallengesThisWeek.length,
      progress
    });

    return {
      total: challengesTotal,
      completedToday: completedChallengesToday.length,
      completedThisWeek: completedChallengesThisWeek.length,
      progress
    };
  } catch (error) {
    console.error('❌ Error fetching challenges stats:', error);
    return { 
      total: 0, 
      completedToday: 0, 
      completedThisWeek: 0, 
      progress: 0 
    };
  }
}

async function fetchTrainingStats(userId: string) {
  try {
    console.log('📊 Fetching training stats for user:', userId);
    
    // Get current active schema period from user_schema_periods table
    const { data: schemaPeriods, error: periodError } = await supabaseAdmin
      .from('user_schema_periods')
      .select(`
        id,
        training_schema_id,
        start_date,
        end_date,
        status,
        training_schemas (
          id,
          name,
          description,
          difficulty,
          schema_nummer
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('start_date', { ascending: false })
      .limit(1);

    const schemaPeriod = Array.isArray(schemaPeriods) ? schemaPeriods[0] : schemaPeriods as any;

    if (periodError || !schemaPeriod) {
      console.log('⚠️ No active schema period found for user:', periodError?.message || 'No data');
      return {
        hasActiveSchema: false,
        currentDay: 0,
        totalDays: 0,
        weeklySessions: 0,
        progress: 0,
        schemaName: undefined,
        completedDaysThisWeek: 0,
        currentWeek: 0,
        totalWeeks: 8
      };
    }

    const schema = schemaPeriod.training_schemas as any;
    if (!schema || !schema.name) {
      console.log('⚠️ No schema data found in period');
      return {
        hasActiveSchema: false,
        currentDay: 0,
        totalDays: 0,
        weeklySessions: 0,
        progress: 0,
        schemaName: undefined,
        completedDaysThisWeek: 0,
        currentWeek: 0,
        totalWeeks: 8
      };
    }

    // Get training schema days to calculate weekly sessions
    const { data: schemaDays, error: daysError } = await supabaseAdmin
      .from('training_schema_days')
      .select('id, day_number, name')
      .eq('schema_id', schemaPeriod.training_schema_id)
      .order('day_number');

    if (daysError) {
      console.log('⚠️ Error fetching schema days:', daysError);
      return {
        hasActiveSchema: false,
        currentDay: 0,
        totalDays: 0,
        weeklySessions: 0,
        progress: 0,
        schemaName: undefined,
        completedDaysThisWeek: 0,
        currentWeek: 0,
        totalWeeks: 8
      };
    }

    const weeklySessions = schemaDays?.length || 0;
    const totalDays = 56; // 8 weeks standard

    console.log('✅ Active schema found:', {
      schemaName: schema.name,
      weeklySessions,
      totalDays,
      schemaDaysCount: schemaDays?.length || 0
    });

    // Calculate current day and progress based on schema period start date
    const startDate = new Date(schemaPeriod.start_date);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const currentDay = Math.min(Math.max(daysDiff + 1, 1), totalDays);
    const progress = Math.round((currentDay / totalDays) * 100);

    // Calculate current week (1-8)
    const currentWeek = Math.ceil(currentDay / 7);
    const totalWeeks = 8;
    
    // Calculate completed days this week
    const daysInCurrentWeek = Math.min(7, totalDays - (currentWeek - 1) * 7);
    const completedDaysThisWeek = Math.min(currentDay - (currentWeek - 1) * 7, daysInCurrentWeek);

    return {
      hasActiveSchema: true,
      currentDay,
      totalDays,
      weeklySessions,
      progress: Math.min(progress, 100),
      schemaName: schema.name,
      completedDaysThisWeek: Math.max(0, completedDaysThisWeek),
      currentWeek: Math.min(currentWeek, totalWeeks),
      totalWeeks
    };
  } catch (error) {
    console.error('❌ Error fetching training stats:', error);
    return {
      hasActiveSchema: false,
      currentDay: 0,
      totalDays: 0,
      weeklySessions: 0,
      progress: 0,
      schemaName: undefined,
      completedDaysThisWeek: 0,
      currentWeek: 0,
      totalWeeks: 8
    };
  }
}

async function fetchMindFocusStats(userId: string) {
  try {
    console.log('🧘 Fetching mind focus stats for user:', userId);
    
    // Check if user has a mind profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_mind_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.log('⚠️ Error fetching mind profile:', profileError);
      return {
        total: 0,
        completedToday: 0,
        progress: 0,
        hasProfile: false,
        stressLevel: 0,
        personalGoals: [],
        currentStreak: 0
      };
    }

    // If no profile exists, return default values
    if (!profile) {
      console.log('📝 No mind profile found for user');
      return {
        total: 0,
        completedToday: 0,
        progress: 0,
        hasProfile: false,
        stressLevel: 0,
        personalGoals: [],
        currentStreak: 0
      };
    }

    // Get recent sessions for progress calculation
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from('mind_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (sessionsError) {
      console.log('⚠️ Error fetching sessions:', sessionsError);
    }

    // Calculate stats
    const totalSessions = sessions?.length || 0;
    const completedSessions = sessions?.filter(s => s.completed).length || 0;
    const progress = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    // Calculate today's sessions
    const today = new Date().toISOString().split('T')[0];
    const completedToday = sessions?.filter(s => 
      s.created_at.startsWith(today) && s.completed
    ).length || 0;

    // Get current stress level from latest session or profile
    let currentStressLevel = 0;
    if (sessions && sessions.length > 0) {
      const latestSession = sessions.find(s => s.stress_after);
      currentStressLevel = latestSession?.stress_after || 0;
    } else if (profile.stress_assessment) {
      // Use initial stress assessment if no sessions yet
      const stressAssessment = profile.stress_assessment;
      currentStressLevel = stressAssessment.workStress || 0;
    }

    // Get personal goals
    const personalGoals = profile.personal_goals || [];

    // Calculate current streak
    const currentStreak = calculateMindFocusStreak(sessions || []);

    console.log('✅ Mind focus stats calculated:', {
      hasProfile: true,
      totalSessions,
      completedToday,
      currentStressLevel,
      personalGoals: personalGoals.length,
      currentStreak
    });

    return {
      total: totalSessions,
      completedToday,
      progress,
      hasProfile: true,
      stressLevel: currentStressLevel,
      personalGoals,
      currentStreak
    };

  } catch (error) {
    console.error('❌ Error fetching mind focus stats:', error);
    return { 
      total: 0, 
      completedToday: 0, 
      progress: 0,
      hasProfile: false,
      stressLevel: 0,
      personalGoals: [],
      currentStreak: 0
    };
  }
}

function calculateMindFocusStreak(sessions: any[]): number {
  if (!sessions || sessions.length === 0) return 0;
  
  const today = new Date();
  let streak = 0;
  
  for (let i = 0; i < 30; i++) { // Check last 30 days
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    
    const daySessions = sessions.filter(s => 
      s.created_at.startsWith(dateStr) && s.completed
    );
    
    if (daySessions.length > 0) {
      streak++;
    } else if (i > 0) { // Don't break streak on first day
      break;
    }
  }
  
  return streak;
}

async function fetchBoekenkamerStats(userId: string) {
  try {
    console.log('📚 Fetching boekenkamer stats for user:', userId);
    
    // Prefer the same source as Boekenkamer page for consistency
    let totalBooks = 0;
    try {
      const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const resp = await fetch(`${base}/api/books`, { cache: 'no-store' });
      if (resp.ok) {
        const json = await resp.json();
        totalBooks = Array.isArray(json?.books) ? json.books.length : 0; // currently 12
      }
    } catch (e) {
      console.log('⚠️ Fallback to DB for books count due to fetch error');
    }
    // Fallback to DB count if API not available
    if (!totalBooks) {
      const { data: allBooks, error: allBooksError } = await supabaseAdmin
        .from('books')
        .select('id')
        .eq('status', 'published');
      if (!allBooksError) totalBooks = allBooks?.length || 0;
      else console.log('⚠️ Error fetching total books:', allBooksError);
    }

    // Get books read by user
    const { data: readBooks, error: readBooksError } = await supabaseAdmin
      .from('book_reviews')
      .select('id, book_id')
      .eq('user_id', userId);

    if (readBooksError) {
      console.log('⚠️ Error fetching read books:', readBooksError);
    }

    // Get books completed today
    const today = new Date().toISOString().split('T')[0];
    const { data: completedToday, error: todayError } = await supabaseAdmin
      .from('book_reviews')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`);

    if (todayError) {
      console.log('⚠️ Error fetching today\'s completed books:', todayError);
    }

    const readBooksCount = readBooks?.length || 0;
    const completedTodayCount = completedToday?.length || 0;
    
    // Calculate progress based on read books vs total available books
    const progress = totalBooks > 0 ? Math.round((readBooksCount / totalBooks) * 100) : 0;

    console.log('✅ Boekenkamer stats calculated:', {
      totalBooks,
      readBooksCount,
      completedTodayCount,
      progress
    });

    return {
      total: readBooksCount, // For backward compatibility
      completedToday: completedTodayCount,
      progress,
      totalBooks,
      readBooks: readBooksCount
    };
  } catch (error) {
    console.error('❌ Error fetching boekenkamer stats:', error);
    return { 
      total: 0, 
      completedToday: 0, 
      progress: 0,
      totalBooks: 0,
      readBooks: 0
    };
  }
}

async function fetchXPStats(userId: string) {
  try {
    // Get user's XP from completed missions in user_missions table
    const { data: missions, error: missionsError } = await supabaseAdmin
      .from('user_missions')
      .select('points, xp_reward, last_completion_date')
      .eq('user_id', userId)
      .not('last_completion_date', 'is', null);

    // Get user's XP from completed challenges in user_challenges table
    const { data: challenges, error: challengesError } = await supabaseAdmin
      .from('user_challenges')
      .select(`
        id,
        completion_date,
        challenges (
          id,
          title,
          xp_reward
        )
      `)
      .eq('user_id', userId)
      .not('completion_date', 'is', null);

    if (missionsError) {
      console.error('Error fetching missions for XP:', missionsError);
    }
    
    if (challengesError) {
      console.error('Error fetching challenges for XP:', challengesError);
    }

    // Calculate total XP from completed missions
    const missionsXP = missions?.reduce((sum, mission) => sum + (mission.points || mission.xp_reward || 0), 0) || 0;
    
    // Calculate total XP from completed challenges
    const challengesXP = challenges?.reduce((sum, challenge) => {
      const challengeData = challenge.challenges as any;
      return sum + (challengeData?.xp_reward || 0);
    }, 0) || 0;

    const totalXP = missionsXP + challengesXP;
    const level = Math.floor(totalXP / 100) + 1; // Simple level calculation
    
    // Determine rank based on XP
    let rank = 'Beginner';
    if (totalXP >= 500) rank = 'Expert';
    else if (totalXP >= 200) rank = 'Advanced';
    else if (totalXP >= 50) rank = 'Intermediate';

    // Calculate next level requirements
    const currentLevelXP = (level - 1) * 100;
    const nextLevelXP = level * 100;
    const xpNeeded = nextLevelXP - totalXP;

    // Get user's current badges count
    const { data: badges, error: badgesError } = await supabaseAdmin
      .from('user_badges')
      .select('id')
      .eq('user_id', userId);

    const currentBadges = badges?.length || 0;
    const badgesNeeded = Math.max(0, level - currentBadges);

    // Get user's completed academy modules
    const { data: academyProgress, error: academyError } = await supabaseAdmin
      .from('user_lesson_progress')
      .select('lesson_id, completed')
      .eq('user_id', userId)
      .eq('completed', true);

    const completedLessons = academyProgress?.length || 0;
    const academyModulesNeeded = Math.max(0, Math.ceil(level / 2) - Math.floor(completedLessons / 3));

    // Calculate total challenges and missions for requirements
    const totalMissionsAndChallenges = (missions?.length || 0) + (challenges?.length || 0);

    const nextLevelRequirements = {
      xpNeeded: Math.max(0, xpNeeded),
      badgesNeeded: Math.max(0, badgesNeeded),
      challengesNeeded: Math.max(0, level * 2 - totalMissionsAndChallenges),
      academyModulesNeeded: Math.max(0, academyModulesNeeded)
    };

    console.log(`📊 XP stats for user ${userId}: ${totalXP} XP (${missionsXP} from missions, ${challengesXP} from challenges), Level ${level}, Rank ${rank}`);

    return {
      total: totalXP,
      rank,
      level,
      nextLevelRequirements
    };
  } catch (error) {
    console.error('Error fetching XP stats:', error);
    return {
      total: 0,
      rank: 'Beginner',
      level: 1,
      nextLevelRequirements: {
        xpNeeded: 100,
        badgesNeeded: 1,
        challengesNeeded: 5,
        academyModulesNeeded: 1
      }
    };
  }
}

async function fetchUserBadges(userId: string) {
  try {
    const { data: badges, error } = await supabaseAdmin
      .from('user_badges')
      .select(`
        id,
        badge_id,
        unlocked_at,
        badges (
          id,
          title,
          description,
          icon_name,
          image_url,
          rarity_level,
          xp_reward
        )
      `)
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }

    return badges?.map(userBadge => {
      const badge = userBadge.badges as any; // Type assertion to handle the embedded object
      return {
        id: userBadge.id,
        title: badge?.title || 'Unknown Badge',
        description: badge?.description || '',
        icon_name: badge?.icon_name || 'star',
        image_url: badge?.image_url,
        rarity_level: badge?.rarity_level || 'common',
        xp_reward: badge?.xp_reward || 0,
        unlocked_at: userBadge.unlocked_at
      };
    }) || [];
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return [];
  }
}

async function fetchFinanceStats(userId: string) {
  try {
    console.log('💰 Fetching finance stats for user:', userId);

    // Get user's financial profile
    const { data: financialProfile, error: profileError } = await supabaseAdmin
      .from('user_financial_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.log('⚠️ Error fetching financial profile:', profileError);
      return {
        netWorth: 0,
        monthlyIncome: 0,
        savings: 0,
        investments: 0,
        progress: 0,
        hasProfile: false
      };
    }

    // If no financial profile exists, return default values
    if (!financialProfile) {
      console.log('📝 No financial profile found for user');
      return {
        netWorth: 0,
        monthlyIncome: 0,
        savings: 0,
        investments: 0,
        progress: 0,
        hasProfile: false
      };
    }

    // Get financial goals to calculate progress
    const { data: goals, error: goalsError } = await supabaseAdmin
      .from('financial_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (goalsError) {
      console.log('⚠️ Error fetching financial goals:', goalsError);
    }

    // Calculate progress based on goals
    let progress = 0;
    if (goals && goals.length > 0) {
      const totalProgress = goals.reduce((sum, goal) => {
        const goalProgress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
        return sum + Math.min(goalProgress, 100);
      }, 0);
      progress = Math.round(totalProgress / goals.length);
    }

    console.log('✅ Finance stats calculated:', {
      netWorth: financialProfile.net_worth,
      monthlyIncome: financialProfile.monthly_income,
      progress,
      goalsCount: goals?.length || 0
    });

    return {
      netWorth: financialProfile.net_worth || 0,
      monthlyIncome: financialProfile.monthly_income || 0,
      savings: financialProfile.savings_rate_percentage || 0,
      investments: financialProfile.passive_income_goal || 0,
      progress,
      hasProfile: true
    };
  } catch (error) {
    console.error('❌ Error fetching finance stats:', error);
    return {
      netWorth: 0,
      monthlyIncome: 0,
      savings: 0,
      investments: 0,
      progress: 0,
      hasProfile: false
    };
  }
}

async function fetchBrotherhoodStats(userId: string) {
  try {
    // Get total users in the platform
    const { count: totalUsers, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      return {
        totalMembers: 0,
        activeMembers: 0,
        communityScore: 0,
        progress: 0
      };
    }

    // Get user's forum activity
    const { data: forumPosts, error: postsError } = await supabaseAdmin
      .from('forum_posts')
      .select('id')
      .eq('user_id', userId);

    const { data: forumComments, error: commentsError } = await supabaseAdmin
      .from('forum_comments')
      .select('id')
      .eq('user_id', userId);

    const totalActivity = (forumPosts?.length || 0) + (forumComments?.length || 0);
    const communityScore = Math.min(totalActivity * 10, 100);
    const progress = Math.min(Math.round((totalUsers || 0) / 100 * 100), 100);

    return {
      totalMembers: totalUsers || 0,
      activeMembers: Math.round((totalUsers || 0) * 0.7), // Assume 70% active
      communityScore,
      progress
    };
  } catch (error) {
    console.error('Error fetching brotherhood stats:', error);
    return {
      totalMembers: 0,
      activeMembers: 0,
      communityScore: 0,
      progress: 0
    };
  }
}

async function fetchAcademyStats(userId: string) {
  try {
    // Get total academy modules
    const { data: modules, error: modulesError } = await supabaseAdmin
      .from('academy_modules')
      .select('id, title')
      .eq('status', 'published')
      .order('order_index');

    // Get user's lesson progress (new system)
    const { data: lessonProgress, error: lessonProgressError } = await supabaseAdmin
      .from('user_lesson_progress')
      .select('lesson_id, completed')
      .eq('user_id', userId)
      .eq('completed', true);

    if (lessonProgressError) {
      console.error('Error fetching lesson progress:', lessonProgressError);
      return {
        totalCourses: 0,
        completedCourses: 0,
        learningProgress: 0,
        progress: 0
      };
    }

    // Get lesson details separately
    const lessonIds = lessonProgress?.map(p => p.lesson_id) || [];
    const { data: lessonDetails, error: lessonDetailsError } = await supabaseAdmin
      .from('academy_lessons')
      .select('id, module_id, title')
      .in('id', lessonIds);

    if (lessonDetailsError) {
      console.error('Error fetching lesson details:', lessonDetailsError);
      return {
        totalCourses: 0,
        completedCourses: 0,
        learningProgress: 0,
        progress: 0
      };
    }

    const totalModules = modules?.length || 0;
    
    // Create a map of lesson_id to lesson details
    const lessonDetailsMap = {};
    lessonDetails?.forEach(lesson => {
      lessonDetailsMap[lesson.id] = lesson;
    });

    // Calculate completed modules based on lesson completion
    const completedModules = new Set();
    lessonProgress?.forEach(progress => {
      const lessonDetail = lessonDetailsMap[progress.lesson_id];
      if (lessonDetail?.module_id) {
        completedModules.add(lessonDetail.module_id);
      }
    });
    
    const completedModulesCount = completedModules.size;
    
    // Calculate overall progress based on module completion
    const learningProgress = totalModules > 0 ? Math.round((completedModulesCount / totalModules) * 100) : 0;

    console.log(`Academy Stats for user ${userId}: ${completedModulesCount}/${totalModules} modules completed (${learningProgress}%)`);

    return {
      totalCourses: totalModules,
      completedCourses: completedModulesCount,
      learningProgress,
      progress: learningProgress
    };
  } catch (error) {
    console.error('Error fetching academy stats:', error);
    return {
      totalCourses: 0,
      completedCourses: 0,
      learningProgress: 0,
      progress: 0
    };
  }
}

function calculateTotalProgress(missions: any, training: any, mindFocus: any, boekenkamer: any, finance: any, brotherhood: any, academy: any) {
  const progressValues = [
    missions.progress,
    training.progress,
    mindFocus.progress,
    boekenkamer.progress,
    finance.progress,
    brotherhood.progress,
    academy.progress
  ].filter(progress => progress !== undefined);

  if (progressValues.length === 0) return 0;

  return Math.round(progressValues.reduce((sum, progress) => sum + progress, 0) / progressValues.length);
} 