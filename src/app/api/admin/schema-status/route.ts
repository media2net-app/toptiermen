import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Admin: Inspect a user's schema progress by email
// GET /api/admin/schema-status?email=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const selectedOnly = searchParams.get('selectedOnly') === 'true';
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

    // lookup user id and selected schema
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, selected_schema_id')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = profile.id;

    // fetch training frequency from user_training_profiles (fallback 7)
    let trainingFrequency = 7;
    {
      const { data: up, error: upErr } = await supabaseAdmin
        .from('user_training_profiles')
        .select('training_frequency')
        .eq('user_id', userId)
        .maybeSingle();
      if (!upErr && up && typeof up.training_frequency === 'number') {
        trainingFrequency = Math.max(1, up.training_frequency);
      }
    }

    // fetch all progress rows (no join to avoid ambiguity)
    const { data: progressData, error: progressError } = await supabaseAdmin
      .from('user_training_schema_progress')
      .select(
        'schema_id, completed_days, current_day, started_at, completed_at'
      )
      .eq('user_id', userId);

    if (progressError) {
      return NextResponse.json({ error: progressError.message }, { status: 500 });
    }

    // Optionally filter to selected schema only
    let filteredProgress = (progressData || []) as any[];
    if (selectedOnly && profile.selected_schema_id) {
      filteredProgress = filteredProgress.filter((p: any) => p.schema_id === profile.selected_schema_id);
    }

    // fetch schemas for involved schema_ids
    const schemaIds = Array.from(new Set((filteredProgress || []).map((p: any) => p.schema_id))).filter(Boolean);
    let schemaMap: Record<string, any> = {};
    if (schemaIds.length > 0) {
      const { data: schemas, error: schemasError } = await supabaseAdmin
        .from('training_schemas')
        .select('id, name, schema_nummer, training_goal, equipment_type, status')
        .in('id', schemaIds);
      if (schemasError) {
        return NextResponse.json({ error: schemasError.message }, { status: 500 });
      }
      schemaMap = (schemas || []).reduce((acc: any, s: any) => { acc[s.id] = s; return acc; }, {});
    }

    // derive simple status
    const sorted = (filteredProgress || []).sort((a: any, b: any) => {
      const an = schemaMap[a.schema_id]?.schema_nummer ?? 0;
      const bn = schemaMap[b.schema_id]?.schema_nummer ?? 0;
      return an - bn;
    });

    const statuses = sorted.map((p: any) => {
      const total = (p.completed_days ?? 0) as number;
      const weeks = p.completed_at ? 8 : Math.floor(total / trainingFrequency);
      return {
        schemaId: p.schema_id,
        schemaName: schemaMap[p.schema_id]?.name,
        schemaNumber: schemaMap[p.schema_id]?.schema_nummer,
        totalDaysCompleted: total,
        weeksCompleted: weeks,
        completedAt: p.completed_at,
        isCompleted8Weeks: weeks >= 8,
      };
    });

    return NextResponse.json({
      success: true,
      email,
      userId,
      selectedSchemaId: profile.selected_schema_id,
      progress: statuses,
    });
  } catch (e: any) {
    console.error('schema-status error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
