import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/admin/database/academy-progress
// Returns academy progress data for all users
export async function GET(_req: NextRequest) {
  try {
    // 1) Fetch profiles with basic data
    const { data: profiles, error: profErr } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, main_goal')
      .order('email', { ascending: true });

    if (profErr) {
      return NextResponse.json({ error: profErr.message }, { status: 500 });
    }

    const users = profiles || [];
    const userIds = users.map(u => u.id);

    // 2) Fetch academy modules and lessons for reference
    const { data: modules, error: modErr } = await supabaseAdmin
      .from('academy_modules')
      .select('id, title, order_index')
      .order('order_index', { ascending: true });
    if (modErr) {
      console.log('Academy modules table not found, continuing without it');
    }

    const { data: lessons, error: lessErr } = await supabaseAdmin
      .from('academy_lessons')
      .select('id, title, module_id, order_index')
      .order('order_index', { ascending: true });
    if (lessErr) {
      console.log('Academy lessons table not found, continuing without it');
    }

    // 3) Fetch user lesson progress
    let lessonProgressByUser: Record<string, any[]> = {};
    if (userIds.length > 0) {
      const { data: lessonProgress, error: progErr } = await supabaseAdmin
        .from('user_lesson_progress')
        .select('user_id, lesson_id, completed, watched_duration, exam_score, completed_at');
      if (progErr) {
        console.log('User lesson progress table not found, continuing without it');
      } else {
        for (const lp of (lessonProgress || [])) {
          if (!lessonProgressByUser[lp.user_id]) lessonProgressByUser[lp.user_id] = [];
          lessonProgressByUser[lp.user_id].push(lp);
        }
      }
    }

    // 4) Fetch academy lesson completions
    let lessonCompletionsByUser: Record<string, any[]> = {};
    if (userIds.length > 0) {
      const { data: lessonCompletions, error: compErr } = await supabaseAdmin
        .from('academy_lesson_completions')
        .select('user_id, lesson_id, completed_at, completion_percentage, time_spent_minutes');
      if (compErr) {
        console.log('Academy lesson completions table not found, continuing without it');
      } else {
        for (const lc of (lessonCompletions || [])) {
          if (!lessonCompletionsByUser[lc.user_id]) lessonCompletionsByUser[lc.user_id] = [];
          lessonCompletionsByUser[lc.user_id].push(lc);
        }
      }
    }

    // 5) Fetch academy module completions
    let moduleCompletionsByUser: Record<string, any[]> = {};
    if (userIds.length > 0) {
      const { data: moduleCompletions, error: modCompErr } = await supabaseAdmin
        .from('academy_module_completions')
        .select('user_id, module_id, completed_at, completion_percentage, total_lessons, completed_lessons');
      if (modCompErr) {
        console.log('Academy module completions table not found, continuing without it');
      } else {
        for (const mc of (moduleCompletions || [])) {
          if (!moduleCompletionsByUser[mc.user_id]) moduleCompletionsByUser[mc.user_id] = [];
          moduleCompletionsByUser[mc.user_id].push(mc);
        }
      }
    }

    // 6) Fetch user module unlocks
    let moduleUnlocksByUser: Record<string, any[]> = {};
    if (userIds.length > 0) {
      const { data: moduleUnlocks, error: unlockErr } = await supabaseAdmin
        .from('user_module_unlocks')
        .select('user_id, module_id, unlocked_at, opened_at');
      if (unlockErr) {
        console.log('User module unlocks table not found, continuing without it');
      } else {
        for (const mu of (moduleUnlocks || [])) {
          if (!moduleUnlocksByUser[mu.user_id]) moduleUnlocksByUser[mu.user_id] = [];
          moduleUnlocksByUser[mu.user_id].push(mu);
        }
      }
    }

    const rows = users.map(u => {
      const userLessonProgress = lessonProgressByUser[u.id] || [];
      const userLessonCompletions = lessonCompletionsByUser[u.id] || [];
      const userModuleCompletions = moduleCompletionsByUser[u.id] || [];
      const userModuleUnlocks = moduleUnlocksByUser[u.id] || [];
      
      // Calculate academy statistics
      const totalLessons = lessons?.length || 0;
      const completedLessons = userLessonProgress.filter(lp => lp.completed).length;
      const completionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      
      // Calculate total time spent
      const totalTimeSpent = userLessonCompletions.reduce((sum, lc) => sum + (lc.time_spent_minutes || 0), 0);
      
      // Calculate average exam score
      const examScores = userLessonProgress.filter(lp => lp.exam_score !== null).map(lp => lp.exam_score);
      const averageExamScore = examScores.length > 0 ? Math.round(examScores.reduce((sum, score) => sum + score, 0) / examScores.length) : 0;
      
      // Calculate module progress
      const totalModules = modules?.length || 0;
      const completedModules = userModuleCompletions.filter(mc => mc.completion_percentage >= 100).length;
      const moduleProgressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
      
      // Find last activity
      const lastLessonCompletion = userLessonCompletions.length > 0 
        ? new Date(Math.max(...userLessonCompletions.map(lc => new Date(lc.completed_at).getTime())))
        : null;
      
      // Calculate days since last activity
      const daysSinceLastActivity = lastLessonCompletion 
        ? Math.floor((Date.now() - lastLessonCompletion.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        userId: u.id,
        email: u.email,
        fullName: u.full_name,
        mainGoal: u.main_goal,
        totalLessons,
        completedLessons,
        completionPercentage,
        totalModules,
        completedModules,
        moduleProgressPercentage,
        totalTimeSpent,
        averageExamScore,
        daysSinceLastActivity,
        lastActivity: lastLessonCompletion?.toISOString() || null,
        hasProgress: userLessonProgress.length > 0,
        hasCompletions: userLessonCompletions.length > 0,
        unlockedModules: userModuleUnlocks.length,
      };
    });

    return NextResponse.json({ success: true, count: rows.length, rows });
  } catch (e: any) {
    console.error('academy progress list error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
