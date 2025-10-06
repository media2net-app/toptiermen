import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { userId, lessonId, answers, score, totalQuestions, passed } = await request.json();

    if (!userId || !lessonId || typeof score !== 'number' || typeof totalQuestions !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('user_exam_results')
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        answers: answers ?? null,
        score: score,
        total_questions: totalQuestions,
        passed: !!passed,
        submitted_at: new Date().toISOString(),
      });

    if (error) {
      console.error('save-exam-result upsert error', error);
      return NextResponse.json({ error: 'Failed to save exam result' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('save-exam-result route error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
