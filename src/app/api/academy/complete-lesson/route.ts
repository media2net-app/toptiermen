import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { userId, lessonId, score = 100, timeSpent = 300 } = await request.json();

    if (!userId || !lessonId) {
      return NextResponse.json({ error: 'User ID and Lesson ID are required' }, { status: 400 });
    }

    console.log('🎯 Completing lesson:', lessonId, 'for user:', userId);

    // Complete lesson in academy_lesson_completions table
    const { error: academyError } = await supabaseAdmin
      .from('academy_lesson_completions')
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        completed_at: new Date().toISOString(),
        score: score,
        time_spent: timeSpent
      }, { onConflict: 'user_id,lesson_id' });

    if (academyError) {
      console.error('❌ Error completing lesson in academy_lesson_completions:', academyError);
      return NextResponse.json({ 
        error: 'Failed to complete lesson', 
        details: academyError.message,
        code: academyError.code 
      }, { status: 500 });
    }

    // Also complete in user_lesson_progress table for compatibility
    const { error: progressError } = await supabaseAdmin
      .from('user_lesson_progress')
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString()
      }, { onConflict: 'user_id,lesson_id' });

    if (progressError) {
      console.log('⚠️ Warning: Could not update user_lesson_progress:', progressError.message);
      // Don't fail the request if this table doesn't exist or has issues
    }

    // Check if this completes a module
    const { data: lesson } = await supabaseAdmin
      .from('academy_lessons')
      .select('module_id')
      .eq('id', lessonId)
      .single();

    if (lesson) {
      // Count total lessons in module
      const { count: totalLessons } = await supabaseAdmin
        .from('academy_lessons')
        .select('*', { count: 'exact', head: true })
        .eq('module_id', lesson.module_id);

      // Count completed lessons in module
      const { count: completedLessons } = await supabaseAdmin
        .from('academy_lesson_completions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .in('lesson_id', 
          await supabaseAdmin
            .from('academy_lessons')
            .select('id')
            .eq('module_id', lesson.module_id)
            .then(result => result.data?.map(l => l.id) || [])
        );

      // If all lessons in module are completed, mark module as completed
      if (totalLessons && completedLessons && totalLessons === completedLessons) {
        await supabaseAdmin
          .from('academy_module_completions')
          .upsert({
            user_id: userId,
            module_id: lesson.module_id,
            completed_at: new Date().toISOString(),
            total_lessons: totalLessons,
            completed_lessons: completedLessons
          }, { onConflict: 'user_id,module_id' });

        console.log('✅ Module completed:', lesson.module_id);
      }
    }

    console.log('✅ Lesson completed successfully:', lessonId);
    return NextResponse.json({
      success: true,
      message: 'Lesson completed successfully',
      lessonId: lessonId,
      completedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in complete-lesson API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
