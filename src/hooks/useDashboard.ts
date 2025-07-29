import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export interface DashboardData {
  // User profile data
  profile: any;
  
  // Goals
  goals: any[];
  primaryGoal: any;
  
  // Missions
  missions: any[];
  completedMissions: any[];
  pendingMissions: any[];
  
  // Habits
  habits: any[];
  habitLogs: any[];
  
  // Progress
  dailyProgress: any;
  weeklyStats: any[];
  
  // Achievements
  achievements: any[];
  
  // Challenges
  challenges: any[];
  
  // Onboarding
  onboardingStatus: any;
  
  // Loading states
  loading: boolean;
  error: string | null;
}

export function useDashboard() {
  const { user } = useSupabaseAuth();
  const [data, setData] = useState<DashboardData>({
    profile: null,
    goals: [],
    primaryGoal: null,
    missions: [],
    completedMissions: [],
    pendingMissions: [],
    habits: [],
    habitLogs: [],
    dailyProgress: null,
    weeklyStats: [],
    achievements: [],
    challenges: [],
    onboardingStatus: null,
    loading: true,
    error: null
  });

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch user goals
      const { data: goals, error: goalsError } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('is_primary', { ascending: false });

      if (goalsError) throw goalsError;

      // Fetch user missions
      const { data: missions, error: missionsError } = await supabase
        .from('user_missions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (missionsError) throw missionsError;

      // Fetch user habits
      const { data: habits, error: habitsError } = await supabase
        .from('user_habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (habitsError) throw habitsError;

      // Fetch habit logs for last 7 days
      const { data: habitLogs, error: habitLogsError } = await supabase
        .from('user_habit_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('completed_at', { ascending: false });

      if (habitLogsError) throw habitLogsError;

      // Fetch today's progress
      const today = new Date().toISOString().split('T')[0];
      const { data: dailyProgress, error: dailyProgressError } = await supabase
        .from('user_daily_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (dailyProgressError && dailyProgressError.code !== 'PGRST116') {
        throw dailyProgressError;
      }

      // Fetch weekly stats
      const { data: weeklyStats, error: weeklyStatsError } = await supabase
        .from('user_weekly_stats')
        .select('*')
        .eq('user_id', user.id)
        .order('week_start_date', { ascending: false })
        .limit(4);

      if (weeklyStatsError) throw weeklyStatsError;

      // Fetch achievements
      const { data: achievements, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false })
        .limit(10);

      if (achievementsError) throw achievementsError;

      // Fetch challenges
      const { data: challenges, error: challengesError } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('start_date', { ascending: false });

      if (challengesError) throw challengesError;

      // Fetch onboarding status
      const { data: onboardingStatus, error: onboardingError } = await supabase
        .from('user_onboarding_status')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (onboardingError && onboardingError.code !== 'PGRST116') {
        throw onboardingError;
      }

      // Process data
      const primaryGoal = goals?.find(goal => goal.is_primary) || null;
      const completedMissions = missions?.filter(mission => mission.status === 'completed') || [];
      const pendingMissions = missions?.filter(mission => mission.status === 'pending') || [];

      setData({
        profile,
        goals: goals || [],
        primaryGoal,
        missions: missions || [],
        completedMissions,
        pendingMissions,
        habits: habits || [],
        habitLogs: habitLogs || [],
        dailyProgress,
        weeklyStats: weeklyStats || [],
        achievements: achievements || [],
        challenges: challenges || [],
        onboardingStatus,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  const updateMissionStatus = async (missionId: string, status: 'completed' | 'failed' | 'skipped') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_missions')
        .update({ 
          status,
          completed_at: status === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', missionId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh data
      await fetchDashboardData();

    } catch (error) {
      console.error('Error updating mission status:', error);
      throw error;
    }
  };

  const logHabitCompletion = async (habitId: string, notes?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_habit_logs')
        .insert({
          user_id: user.id,
          habit_id: habitId,
          notes
        });

      if (error) throw error;

      // Refresh data
      await fetchDashboardData();

    } catch (error) {
      console.error('Error logging habit completion:', error);
      throw error;
    }
  };

  const updateDailyProgress = async (updates: any) => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('user_daily_progress')
        .upsert({
          user_id: user.id,
          date: today,
          ...updates
        });

      if (error) throw error;

      // Refresh data
      await fetchDashboardData();

    } catch (error) {
      console.error('Error updating daily progress:', error);
      throw error;
    }
  };

  const createGoal = async (goalData: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_goals')
        .insert({
          user_id: user.id,
          ...goalData
        });

      if (error) throw error;

      // Refresh data
      await fetchDashboardData();

    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  };

  const createMission = async (missionData: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_missions')
        .insert({
          user_id: user.id,
          ...missionData
        });

      if (error) throw error;

      // Refresh data
      await fetchDashboardData();

    } catch (error) {
      console.error('Error creating mission:', error);
      throw error;
    }
  };

  const updateOnboardingStatus = async (updates: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_onboarding_status')
        .upsert({
          user_id: user.id,
          ...updates
        });

      if (error) throw error;

      // Refresh data
      await fetchDashboardData();

    } catch (error) {
      console.error('Error updating onboarding status:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  return {
    ...data,
    refresh: fetchDashboardData,
    updateMissionStatus,
    logHabitCompletion,
    updateDailyProgress,
    createGoal,
    createMission,
    updateOnboardingStatus
  };
} 