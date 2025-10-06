import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const lessonId = searchParams.get('lessonId');

    if (!userId || !lessonId) {
      return NextResponse.json({ error: 'Missing userId or lessonId' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('user_exam_results')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .order('submitted_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('get-exam-result error', error);
      return NextResponse.json({ error: 'Failed to fetch exam result' }, { status: 500 });
    }

    const result = (data && data.length > 0) ? data[0] : null;
    return NextResponse.json({ success: true, result });
  } catch (e) {
    console.error('get-exam-result route error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
