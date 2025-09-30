import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const moduleId = searchParams.get('moduleId');

    if (!userId || !moduleId) {
      return NextResponse.json({ error: 'User ID and Module ID are required' }, { status: 400 });
    }

    console.log('🎓 Fetching module data:', { userId, moduleId });

    // Fetch module data with timeout protection
    const fetchWithTimeout = async (promise: Promise<any>, timeoutMs: number = 20000) => {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
      );
      return Promise.race([promise, timeoutPromise]);
    };

    // Fetch all required data in parallel
    const [
      { data: moduleData, error: moduleError },
      { data: lessonsData, error: lessonsError },
      { data: progressData, error: progressError },
      { data: allModulesData, error: allModulesError }
    ] = await fetchWithTimeout(Promise.all([
      supabaseAdmin
        .from('academy_modules')
        .select('*')
        .eq('id', moduleId)
        .single(),
      
      supabaseAdmin
        .from('academy_lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true }),
      
      supabaseAdmin
        .from('user_lesson_progress')
        .select('lesson_id')
        .eq('user_id', userId)
        .eq('completed', true),
      
      supabaseAdmin
        .from('academy_modules')
        .select('*')
        .order('order_index', { ascending: true })
    ]), 20000);

    // Handle errors
    if (moduleError) {
      console.error('❌ Module error:', moduleError);
      return NextResponse.json({ error: 'Module niet gevonden' }, { status: 404 });
    }

    if (lessonsError) {
      console.error('❌ Lessons error:', lessonsError);
      return NextResponse.json({ error: 'Lessen niet gevonden' }, { status: 500 });
    }

    if (progressError) {
      console.error('❌ Progress error:', progressError);
      // Don't fail on progress error, just use empty array
    }

    if (allModulesError) {
      console.error('❌ All modules error:', allModulesError);
      // Don't fail on all modules error, just use empty array
    }

    // Determine previous and next modules
    let previousModule = null;
    let nextModule = null;
    
    if (allModulesData && allModulesData.length > 0) {
      const currentIndex = allModulesData.findIndex(m => m.id === moduleId);
      if (currentIndex > 0) {
        previousModule = allModulesData[currentIndex - 1];
      }
      if (currentIndex < allModulesData.length - 1) {
        nextModule = allModulesData[currentIndex + 1];
      }
    }

    const completedLessonIds = progressData?.map(p => p.lesson_id) || [];

    console.log('✅ Module data fetched successfully:', {
      module: moduleData.title,
      lessonsCount: lessonsData?.length || 0,
      completedLessons: completedLessonIds.length
    });

    return NextResponse.json({
      module: moduleData,
      lessons: lessonsData || [],
      completedLessonIds,
      previousModule,
      nextModule,
      allModules: allModulesData || []
    });

  } catch (error) {
    console.error('❌ Error in module data API:', error);
    
    if (error instanceof Error && error.message === 'Request timeout') {
      return NextResponse.json({ 
        error: 'Timeout bij het laden van module data. Probeer opnieuw.' 
      }, { status: 408 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
