import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    const { lessonId, userId } = await request.json();

    if (!lessonId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Mark lesson as completed
    const { error } = await supabaseAdmin
      .from('academy_lesson_completions')
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        completed_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error completing lesson:', error);
      return NextResponse.json({ error: 'Failed to complete lesson' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in complete-lesson API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}