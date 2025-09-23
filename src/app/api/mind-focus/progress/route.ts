import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const period = searchParams.get('period') || 'week';

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get sessions data
    const { data: sessions, error: sessionsError } = await supabase
      .from('mind_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    // Get journal entries
    const { data: journalEntries, error: journalError } = await supabase
      .from('mind_journal_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (journalError) {
      console.error('Error fetching journal entries:', journalError);
      return NextResponse.json({ error: 'Failed to fetch journal entries' }, { status: 500 });
    }

    // Calculate progress metrics
    const totalSessions = sessions?.length || 0;
    const completedSessions = sessions?.filter(s => s.completed).length || 0;
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
    
    // Calculate average stress levels
    const stressLevels = sessions?.map(s => s.stress_after).filter(Boolean) || [];
    const avgStressLevel = stressLevels.length > 0 
      ? stressLevels.reduce((a, b) => a + b, 0) / stressLevels.length 
      : 0;

    // Calculate mood improvement
    const moodData = sessions?.filter(s => s.mood_before && s.mood_after) || [];
    const moodImprovement = moodData.length > 0
      ? moodData.reduce((sum, s) => sum + (s.mood_after - s.mood_before), 0) / moodData.length
      : 0;

    // Calculate streak
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const todaySessions = sessions?.filter(s => 
      s.created_at.startsWith(today) && s.completed
    ).length || 0;
    
    const yesterdaySessions = sessions?.filter(s => 
      s.created_at.startsWith(yesterday) && s.completed
    ).length || 0;

    const currentStreak = todaySessions > 0 ? (yesterdaySessions > 0 ? 2 : 1) : 0;

    // Group sessions by type
    const sessionsByType = sessions?.reduce((acc, session) => {
      acc[session.type] = (acc[session.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Calculate weekly goals progress
    const weeklyGoals = {
      focusSessions: sessionsByType.focus || 0,
      stressSessions: sessionsByType.stress || 0,
      recoverySessions: sessionsByType.recovery || 0,
      totalSessions: totalSessions
    };

    const progressData = {
      totalSessions,
      completedSessions,
      completionRate,
      avgStressLevel,
      moodImprovement,
      currentStreak,
      sessionsByType,
      weeklyGoals,
      journalEntries: journalEntries?.length || 0,
      period
    };

    return NextResponse.json({ 
      success: true, 
      progress: progressData 
    });

  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
