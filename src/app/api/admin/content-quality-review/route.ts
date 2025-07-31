import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Starting content quality review...');

    // Fetch all modules and lessons
    const { data: modules, error: modulesError } = await supabaseAdmin
      .from('academy_modules')
      .select('*')
      .eq('status', 'published')
      .order('order_index');

    if (modulesError) {
      throw new Error(`Failed to fetch modules: ${modulesError.message}`);
    }

    const { data: lessons, error: lessonsError } = await supabaseAdmin
      .from('academy_lessons')
      .select('*')
      .eq('status', 'published')
      .order('order_index');

    if (lessonsError) {
      throw new Error(`Failed to fetch lessons: ${lessonsError.message}`);
    }

    // Analyze content quality
    const analysis = analyzeContentQuality(modules || [], lessons || []);

    console.log('✅ Content quality review completed');
    return NextResponse.json({
      success: true,
      analysis,
      summary: {
        total_modules: modules?.length || 0,
        total_lessons: lessons?.length || 0,
        average_lesson_length: analysis.averageLessonLength,
        modules_with_issues: analysis.modulesWithIssues.length,
        lessons_with_issues: analysis.lessonsWithIssues.length
      }
    });

  } catch (error) {
    console.error('❌ Error in content quality review:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to review content: ${error}` 
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, moduleId, lessonId, updates } = body;

    console.log(`🔄 Performing content quality action: ${action}`);

    switch (action) {
      case 'update_lesson_content':
        if (!lessonId || !updates) {
          return NextResponse.json({ 
            success: false, 
            error: 'Lesson ID and updates are required' 
          });
        }

        const { data: updatedLesson, error: updateError } = await supabaseAdmin
          .from('academy_lessons')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', lessonId)
          .select()
          .single();

        if (updateError) {
          throw new Error(`Failed to update lesson: ${updateError.message}`);
        }

        return NextResponse.json({
          success: true,
          message: 'Lesson content updated successfully',
          lesson: updatedLesson
        });

      case 'optimize_module_structure':
        if (!moduleId) {
          return NextResponse.json({ 
            success: false, 
            error: 'Module ID is required' 
          });
        }

        // Get module lessons and optimize their order
        const { data: moduleLessons, error: lessonsError } = await supabaseAdmin
          .from('academy_lessons')
          .select('*')
          .eq('module_id', moduleId)
          .order('order_index');

        if (lessonsError) {
          throw new Error(`Failed to fetch module lessons: ${lessonsError.message}`);
        }

        // Optimize lesson order based on content length and complexity
        const optimizedLessons = optimizeLessonOrder(moduleLessons || []);

        // Update lesson order
        for (let i = 0; i < optimizedLessons.length; i++) {
          const { error: updateError } = await supabaseAdmin
            .from('academy_lessons')
            .update({ order_index: i + 1 })
            .eq('id', optimizedLessons[i].id);

          if (updateError) {
            console.warn(`Failed to update lesson order for ${optimizedLessons[i].id}:`, updateError);
          }
        }

        return NextResponse.json({
          success: true,
          message: 'Module structure optimized successfully',
          optimized_lessons: optimizedLessons.length
        });

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action specified' 
        });
    }

  } catch (error) {
    console.error('❌ Error in content quality action:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to perform action: ${error}` 
    });
  }
}

// Helper function to analyze content quality
function analyzeContentQuality(modules: any[], lessons: any[]) {
  const analysis = {
    modules: [] as any[],
    lessons: [] as any[],
    modulesWithIssues: [] as any[],
    lessonsWithIssues: [] as any[],
    averageLessonLength: 0,
    totalWordCount: 0,
    recommendations: [] as string[]
  };

  // Analyze modules
  modules.forEach(module => {
    const moduleLessons = lessons.filter(l => l.module_id === module.id);
    const moduleAnalysis = {
      id: module.id,
      title: module.title,
      lessonCount: moduleLessons.length,
      totalWordCount: 0,
      averageWordCount: 0,
      hasCoverImage: !!module.cover_image,
      hasShortDescription: !!module.short_description,
      issues: [] as string[],
      score: 0
    };

    // Analyze lessons in this module
    moduleLessons.forEach(lesson => {
      const wordCount = countWords(lesson.content || '');
      moduleAnalysis.totalWordCount += wordCount;

      const lessonAnalysis = {
        id: lesson.id,
        title: lesson.title,
        moduleId: lesson.module_id,
        wordCount,
        hasContent: !!lesson.content && lesson.content.length > 100,
        hasDuration: !!lesson.duration,
        hasType: !!lesson.type,
        issues: [] as string[],
        score: 0
      };

      // Check for lesson issues
      if (!lesson.content || lesson.content.length < 500) {
        lessonAnalysis.issues.push('Insufficient content (less than 500 characters)');
        lessonAnalysis.score -= 20;
      }

      if (!lesson.duration) {
        lessonAnalysis.issues.push('Missing duration information');
        lessonAnalysis.score -= 10;
      }

      if (!lesson.type) {
        lessonAnalysis.issues.push('Missing lesson type');
        lessonAnalysis.score -= 5;
      }

      if (wordCount < 1000) {
        lessonAnalysis.issues.push('Content too short (less than 1000 words)');
        lessonAnalysis.score -= 15;
      }

      lessonAnalysis.score = Math.max(0, lessonAnalysis.score + 50); // Base score
      analysis.lessons.push(lessonAnalysis);

      if (lessonAnalysis.issues.length > 0) {
        analysis.lessonsWithIssues.push(lessonAnalysis);
      }
    });

    // Calculate module averages
    moduleAnalysis.averageWordCount = moduleLessons.length > 0 
      ? Math.round(moduleAnalysis.totalWordCount / moduleLessons.length) 
      : 0;

    // Check for module issues
    if (moduleLessons.length < 3) {
      moduleAnalysis.issues.push('Too few lessons (less than 3)');
      moduleAnalysis.score -= 15;
    }

    if (!module.cover_image) {
      moduleAnalysis.issues.push('Missing cover image');
      moduleAnalysis.score -= 10;
    }

    if (!module.short_description) {
      moduleAnalysis.issues.push('Missing short description');
      moduleAnalysis.score -= 5;
    }

    if (moduleAnalysis.averageWordCount < 1500) {
      moduleAnalysis.issues.push('Average lesson content too short');
      moduleAnalysis.score -= 10;
    }

    moduleAnalysis.score = Math.max(0, moduleAnalysis.score + 50); // Base score
    analysis.modules.push(moduleAnalysis);

    if (moduleAnalysis.issues.length > 0) {
      analysis.modulesWithIssues.push(moduleAnalysis);
    }

    analysis.totalWordCount += moduleAnalysis.totalWordCount;
  });

  // Calculate overall statistics
  analysis.averageLessonLength = lessons.length > 0 
    ? Math.round(analysis.totalWordCount / lessons.length) 
    : 0;

  // Generate recommendations
  if (analysis.modulesWithIssues.length > 0) {
    analysis.recommendations.push(`${analysis.modulesWithIssues.length} modules need attention`);
  }

  if (analysis.lessonsWithIssues.length > 0) {
    analysis.recommendations.push(`${analysis.lessonsWithIssues.length} lessons need improvement`);
  }

  if (analysis.averageLessonLength < 1500) {
    analysis.recommendations.push('Consider expanding lesson content for better engagement');
  }

  const modulesWithoutCover = analysis.modules.filter(m => !m.hasCoverImage).length;
  if (modulesWithoutCover > 0) {
    analysis.recommendations.push(`${modulesWithoutCover} modules are missing cover images`);
  }

  const modulesWithoutShortDesc = analysis.modules.filter(m => !m.hasShortDescription).length;
  if (modulesWithoutShortDesc > 0) {
    analysis.recommendations.push(`${modulesWithoutShortDesc} modules are missing short descriptions`);
  }

  return analysis;
}

// Helper function to count words in text
function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
}

// Helper function to optimize lesson order
function optimizeLessonOrder(lessons: any[]) {
  // Sort lessons by content length (shorter lessons first for better flow)
  return [...lessons].sort((a, b) => {
    const aLength = countWords(a.content || '');
    const bLength = countWords(b.content || '');
    return aLength - bLength;
  });
} 