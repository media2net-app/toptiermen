import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all published modules with their lessons
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select(`
        id, 
        title,
        academy_lessons (
          id,
          title,
          status
        )
      `)
      .eq('status', 'published')
      .order('order_index');

    if (modulesError) {
      console.error('Error fetching modules:', modulesError);
      return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 });
    }

    // Get user's lesson progress
    const { data: lessonProgress, error: progressError } = await supabase
      .from('user_lesson_progress')
      .select(`
        lesson_id,
        completed,
        academy_lessons!inner(
          id,
          module_id,
          status
        )
      `)
      .eq('user_id', user.id)
      .eq('completed', true);

    if (progressError) {
      console.error('Error fetching lesson progress:', progressError);
      return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
    }

    // Count completed lessons per module
    const moduleCompletion: any = {};
    lessonProgress?.forEach((progress: any) => {
      const moduleId = progress.academy_lessons.module_id;
      moduleCompletion[moduleId] = (moduleCompletion[moduleId] || 0) + 1;
    });

    // Check if user has completed ALL lessons in ALL modules
    const allModulesCompleted = modules?.every(module => {
      const publishedLessons = module.academy_lessons?.filter(l => l.status === 'published') || [];
      const completedLessons = moduleCompletion[module.id] || 0;
      const isCompleted = completedLessons === publishedLessons.length && publishedLessons.length > 0;
      
      console.log(`Module ${module.title}: ${completedLessons}/${publishedLessons.length} lessons completed - ${isCompleted ? '✅' : '❌'}`);
      
      return isCompleted;
    });

    if (!allModulesCompleted) {
      return NextResponse.json({ 
        completed: false,
        message: 'Academy not yet completed'
      });
    }

    // Check if user already has the Academy Master badge
    const { data: existingBadge, error: badgeError } = await supabase
      .from('user_badges')
      .select(`
        id,
        unlocked_at,
        badges!inner(
          id,
          title,
          description,
          icon_name,
          rarity_level,
          xp_reward
        )
      `)
      .eq('user_id', user.id)
      .eq('badges.title', 'Academy Master')
      .single();

    if (badgeError && badgeError.code !== 'PGRST116') {
      console.error('Error checking existing badge:', badgeError);
      return NextResponse.json({ error: 'Failed to check badge status' }, { status: 500 });
    }

    // If user already has the badge, return that info
    if (existingBadge) {
      return NextResponse.json({
        completed: true,
        alreadyUnlocked: true,
        badge: existingBadge.badges,
        unlockedAt: existingBadge.unlocked_at
      });
    }

    // Award the badge
    const { data: newUserBadge, error: awardError } = await supabase
      .from('user_badges')
      .insert({
        user_id: user.id,
        badge_id: 16, // Academy Master badge ID
        unlocked_at: new Date().toISOString(),
        status: 'unlocked'
      })
      .select(`
        id,
        unlocked_at,
        badges!inner(
          id,
          title,
          description,
          icon_name,
          rarity_level,
          xp_reward
        )
      `)
      .single();

    if (awardError) {
      console.error('Error awarding badge:', awardError);
      return NextResponse.json({ error: 'Failed to award badge' }, { status: 500 });
    }

    return NextResponse.json({
      completed: true,
      newlyUnlocked: true,
      badge: newUserBadge.badges,
      unlockedAt: newUserBadge.unlocked_at
    });

  } catch (error) {
    console.error('Error in check-academy-completion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
