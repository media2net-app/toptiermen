import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { userId, moduleId } = await request.json();

    if (!userId || !moduleId) {
      return NextResponse.json({ error: 'Missing userId or moduleId' }, { status: 400 });
    }

    // Get current module and determine the next module
    const { data: currentModule, error: moduleErr } = await supabaseAdmin
      .from('academy_modules')
      .select('*')
      .eq('id', moduleId)
      .single();

    if (moduleErr || !currentModule) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const { data: nextModules, error: nextErr } = await supabaseAdmin
      .from('academy_modules')
      .select('*')
      .gt('order_index', currentModule.order_index)
      .order('order_index', { ascending: true })
      .limit(1);

    const nextModule = nextModules?.[0] || null;

    if (!nextModule) {
      // No next module to unlock
      return NextResponse.json({ success: true, unlocked: false, reason: 'no_next_module' });
    }

    // Fetch all published lessons for this module
    const { data: lessons, error: lessonsErr } = await supabaseAdmin
      .from('academy_lessons')
      .select('id')
      .eq('module_id', moduleId)
      .eq('status', 'published');

    if (lessonsErr) {
      return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
    }

    const lessonIds = (lessons || []).map(l => l.id);
    if (lessonIds.length === 0) {
      return NextResponse.json({ success: false, error: 'Module has no lessons' }, { status: 400 });
    }

    // Get completions from both sources
    const [progressRes, completionsRes] = await Promise.all([
      supabaseAdmin
        .from('user_lesson_progress')
        .select('lesson_id')
        .eq('user_id', userId)
        .eq('completed', true)
        .in('lesson_id', lessonIds),
      supabaseAdmin
        .from('academy_lesson_completions')
        .select('lesson_id')
        .eq('user_id', userId)
        .in('lesson_id', lessonIds)
    ]);

    const fromProgress = progressRes.data?.map(p => p.lesson_id) || [];
    const fromCompletions = completionsRes.data?.map(c => c.lesson_id) || [];
    const completedSet = new Set<string>([...fromProgress, ...fromCompletions]);

    const allCompleted = lessonIds.every(id => completedSet.has(id));

    if (!allCompleted) {
      return NextResponse.json({ success: true, unlocked: false, reason: 'module_not_completed' });
    }

    // Upsert unlock for next module
    // Check if already unlocked
    const { data: existingUnlock, error: unlockFetchErr } = await supabaseAdmin
      .from('user_module_unlocks')
      .select('id')
      .eq('user_id', userId)
      .eq('module_id', nextModule.id)
      .maybeSingle();

    if (!unlockFetchErr && existingUnlock) {
      return NextResponse.json({ success: true, unlocked: false, reason: 'already_unlocked', nextModuleId: nextModule.id });
    }

    const { error: insertErr } = await supabaseAdmin
      .from('user_module_unlocks')
      .insert({
        user_id: userId,
        module_id: nextModule.id,
        unlocked_at: new Date().toISOString(),
      });

    if (insertErr) {
      return NextResponse.json({ success: false, error: 'Failed to unlock next module' }, { status: 500 });
    }

    return NextResponse.json({ success: true, unlocked: true, nextModuleId: nextModule.id });
  } catch (e) {
    console.error('unlock-next-module error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
