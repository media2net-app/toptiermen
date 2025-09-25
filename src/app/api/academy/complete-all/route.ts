import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('🚀 Completing all Academy lessons for user:', userId);

    // First, create the tables if they don't exist
    try {
      await supabaseAdmin.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS academy_lesson_completions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL,
            lesson_id UUID NOT NULL,
            completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            score INTEGER DEFAULT 0,
            time_spent INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, lesson_id)
          );
        `
      });
    } catch (error) {
      console.log('⚠️  Tables might already exist or exec_sql not available');
    }

    // Get all lessons
    const { data: lessons, error: lessonsError } = await supabaseAdmin
      .from('academy_lessons')
      .select('id, title, module_id')
      .order('module_id', { ascending: true })
      .order('order_index', { ascending: true });

    if (lessonsError) {
      console.error('❌ Error fetching lessons:', lessonsError.message);
      return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
    }

    console.log(`📚 Found ${lessons.length} lessons to complete`);

    // Complete each lesson
    let completedCount = 0;
    for (const lesson of lessons) {
      try {
        const { error: insertError } = await supabaseAdmin
          .from('academy_lesson_completions')
          .upsert({
            user_id: userId,
            lesson_id: lesson.id,
            completed_at: new Date().toISOString(),
            score: 100,
            time_spent: 300
          });

        if (insertError) {
          console.log(`⚠️  Lesson ${lesson.title}: ${insertError.message}`);
        } else {
          console.log(`✅ Completed: ${lesson.title}`);
          completedCount++;
        }
      } catch (error) {
        console.log(`❌ Error with lesson ${lesson.title}:`, error.message);
      }
    }

    // Complete modules
    const { data: modules, error: modulesError } = await supabaseAdmin
      .from('academy_modules')
      .select('id, title')
      .order('positie', { ascending: true });

    if (!modulesError && modules) {
      for (const moduleItem of modules) {
        try {
          // Count lessons in this module
          const { count: lessonCount } = await supabaseAdmin
            .from('academy_lessons')
            .select('*', { count: 'exact', head: true })
            .eq('module_id', moduleItem.id);

          await supabaseAdmin
            .from('academy_module_completions')
            .upsert({
              user_id: userId,
              module_id: moduleItem.id,
              completed_at: new Date().toISOString(),
              total_lessons: lessonCount || 0,
              completed_lessons: lessonCount || 0
            });

          console.log(`✅ Completed module: ${moduleItem.title}`);
        } catch (error) {
          console.log(`❌ Error with module ${moduleItem.title}:`, error.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Completed ${completedCount} out of ${lessons.length} lessons`,
      completedLessons: completedCount,
      totalLessons: lessons.length
    });

  } catch (error) {
    console.error('❌ Error completing Academy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
