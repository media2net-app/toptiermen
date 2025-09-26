import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for server-side operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('🎓 Fetching academy progress for user:', userId);

    // Add timeout wrapper for better reliability
    const fetchWithTimeout = async (promise: Promise<any>, timeoutMs: number = 25000) => {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
      );
      return Promise.race([promise, timeoutPromise]);
    };

    // Fetch all academy data in parallel with timeout protection
    const [
      { data: modulesData, error: modulesError },
      { data: lessonsData, error: lessonsError },
      { data: lessonProgressData, error: lessonProgressError },
      { data: academyCompletionsData, error: academyCompletionsError },
      { data: moduleCompletionsData, error: moduleCompletionsError },
      { data: unlocksData, error: unlocksError }
    ] = await fetchWithTimeout(Promise.all([
      supabaseAdmin
        .from('academy_modules')
        .select('*')
        .order('order_index', { ascending: true }),
      
      supabaseAdmin
        .from('academy_lessons')
        .select('*')
        .order('order_index', { ascending: true }),
      
      supabaseAdmin
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId),
      
      supabaseAdmin
        .from('academy_lesson_completions')
        .select('*')
        .eq('user_id', userId),
      
      supabaseAdmin
        .from('academy_module_completions')
        .select('*')
        .eq('user_id', userId),
      
      supabaseAdmin
        .from('user_module_unlocks')
        .select('*')
        .eq('user_id', userId)
    ]), 25000);

    // Handle errors
    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError);
      return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 });
    }

    if (lessonsError) {
      console.error('❌ Error fetching lessons:', lessonsError);
      return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
    }

    if (lessonProgressError) {
      console.error('❌ Error fetching lesson progress:', lessonProgressError);
      return NextResponse.json({ error: 'Failed to fetch lesson progress' }, { status: 500 });
    }

    if (academyCompletionsError) {
      console.error('❌ Error fetching academy completions:', academyCompletionsError);
      return NextResponse.json({ error: 'Failed to fetch academy completions' }, { status: 500 });
    }

    // Warn about optional data
    if (moduleCompletionsError) {
      console.warn('⚠️ Warning fetching module completions:', moduleCompletionsError);
    }

    if (unlocksError) {
      console.warn('⚠️ Warning fetching unlocks:', unlocksError);
    }

    // Process the data
    const processedModules = modulesData || [];
    const processedLessons = lessonsData || [];
    
    // Create progress map
    const progressMap: Record<string, any> = {};
    
    // Process module completions
    moduleCompletionsData?.forEach((completion: any) => {
      progressMap[completion.module_id] = {
        completed: true,
        progress_percentage: 100,
        completed_lessons: completion.completed_lessons || 0,
        total_lessons: completion.total_lessons || 0
      };
    });

    // Process lesson progress from both tables
    const lessonProgressMap: Record<string, any> = {};
    
    // First, add from user_lesson_progress
    lessonProgressData?.forEach((progress: any) => {
      lessonProgressMap[progress.lesson_id] = {
        completed: progress.completed || false,
        time_spent: progress.time_spent || 0
      };
    });

    // Then, add from academy_lesson_completions (overwrites if exists)
    academyCompletionsData?.forEach((completion: any) => {
      lessonProgressMap[completion.lesson_id] = {
        completed: true, // If in completions table, it's completed
        time_spent: completion.time_spent || 0
      };
    });

    // Process unlocks
    const unlocksMap: Record<string, any> = {};
    unlocksData?.forEach((unlock: any) => {
      unlocksMap[unlock.module_id] = {
        unlocked_at: unlock.unlocked_at,
        opened_at: unlock.opened_at
      };
    });

    // Check if academy is completed
    const totalLessons = processedLessons.length;
    const completedLessons = Object.values(lessonProgressMap).filter(p => p.completed).length;
    const isAcademyCompleted = totalLessons > 0 && completedLessons === totalLessons;

    // Check and award Academy Master badge if academy is completed
    let academyBadgeData: any[] | null = null;
    let badgeAwarded = false;
    
    if (isAcademyCompleted) {
      try {
        // First check if user already has the Academy Master badge
        const { data: existingBadge, error: existingError } = await supabaseAdmin
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
          .eq('user_id', userId)
          .eq('badges.title', 'Academy Master')
          .single();

        if (!existingError && existingBadge) {
          // User already has the badge
          academyBadgeData = [existingBadge.badges];
          console.log('✅ User already has Academy Master badge');
        } else {
          // User doesn't have the badge yet, award it
          console.log('🏆 Awarding Academy Master badge to user...');
          
          // First, get the Academy Master badge from badges table
          const { data: academyBadge, error: badgeError } = await supabaseAdmin
            .from('badges')
            .select('*')
            .eq('title', 'Academy Master')
            .single();

          if (!badgeError && academyBadge) {
            // Award the badge to the user
            const { data: newUserBadge, error: awardError } = await supabaseAdmin
              .from('user_badges')
              .insert({
                user_id: userId,
                badge_id: academyBadge.id,
                unlocked_at: new Date().toISOString()
              })
              .select()
              .single();

            if (!awardError) {
              academyBadgeData = academyBadge;
              badgeAwarded = true;
              console.log('✅ Academy Master badge awarded successfully!');
            } else {
              console.error('❌ Error awarding badge:', awardError);
            }
          } else {
            console.warn('⚠️ Academy Master badge not found in badges table');
          }
        }
      } catch (badgeError) {
        console.warn('⚠️ Error handling academy badge:', badgeError);
      }
    }

    console.log('✅ Academy data processed successfully:', {
      modules: processedModules.length,
      lessons: processedLessons.length,
      progressData: Object.keys(progressMap).length,
      lessonProgress: Object.keys(lessonProgressMap).length,
      unlocks: Object.keys(unlocksMap).length,
      academyCompleted: isAcademyCompleted,
      hasAcademyBadge: !!academyBadgeData,
      badgeAwarded: badgeAwarded,
      completedLessons,
      totalLessons
    });

    return NextResponse.json({
      success: true,
      data: {
        modules: processedModules,
        lessons: processedLessons,
        progressData: progressMap,
        lessonProgress: lessonProgressMap,
        unlocks: unlocksMap,
        academyCompleted: isAcademyCompleted,
        academyBadge: academyBadgeData,
        badgeAwarded: badgeAwarded,
        stats: {
          totalLessons,
          completedLessons,
          progressPercentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
        }
      }
    });

  } catch (error) {
    console.error('❌ Error in academy progress API:', error);
    
    // Handle timeout errors specifically
    if (error instanceof Error && error.message === 'Request timeout') {
      console.error('⏰ Academy API timeout - returning timeout error');
      return NextResponse.json({ 
        error: 'Timeout bij het laden van academy data. Probeer opnieuw.' 
      }, { status: 408 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
