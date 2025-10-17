import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    let { userId, email } = body as { userId?: string; email?: string };

    if (!userId && !email) {
      return NextResponse.json({ error: 'userId or email is required' }, { status: 400 });
    }

    // Resolve email to UUID if needed (via profiles)
    let actualUserId = userId || '';
    if (!actualUserId && email) {
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      if (profileErr || !profile?.id) {
        return NextResponse.json({ error: 'User not found for email' }, { status: 404 });
      }
      actualUserId = profile.id as string;
    }

    // Safety: ensure we have an ID now
    if (!actualUserId) {
      return NextResponse.json({ error: 'Could not resolve userId' }, { status: 400 });
    }

    // 1) Delete all training progress rows
    const { error: delProgressErr } = await supabase
      .from('user_training_schema_progress')
      .delete()
      .eq('user_id', actualUserId);
    if (delProgressErr) {
      console.error('❌ Error deleting progress:', delProgressErr);
      return NextResponse.json({ error: 'Failed to delete training progress' }, { status: 500 });
    }

    // 2) Delete all schema periods for the user (active/completed)
    const { error: delPeriodsErr } = await supabase
      .from('user_schema_periods')
      .delete()
      .eq('user_id', actualUserId);
    if (delPeriodsErr) {
      console.error('❌ Error deleting schema periods:', delPeriodsErr);
      return NextResponse.json({ error: 'Failed to delete schema periods' }, { status: 500 });
    }

    // 3) Unset selected schema on profile
    const { error: updProfileErr } = await supabase
      .from('profiles')
      .update({ selected_schema_id: null })
      .eq('id', actualUserId);
    if (updProfileErr) {
      console.error('❌ Error updating profile:', updProfileErr);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // 4) Optional: if you track completion in another table, clear it here
    // (Completion is derived from user_training_schema_progress.completed_at in current code.)

    return NextResponse.json({
      success: true,
      message: 'Training progress and periods reset. Profile deselected from schema.',
      userId: actualUserId
    });
  } catch (error) {
    console.error('❌ Error in reset-user-training:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
