import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/admin/database/trainingschemas
// Returns a list of users (profiles) with their selected schema and progress summary
export async function GET(_req: NextRequest) {
  try {
    // 1) Fetch profiles with selected schema
    const { data: profiles, error: profErr } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, selected_schema_id')
      .order('email', { ascending: true });

    if (profErr) {
      return NextResponse.json({ error: profErr.message }, { status: 500 });
    }

    const users = profiles || [];
    const schemaIds = Array.from(new Set(users.map(u => u.selected_schema_id).filter(Boolean))) as string[];
    const userIds = users.map(u => u.id);

    // 2) Map schema details
    let schemaMap: Record<string, any> = {};
    if (schemaIds.length > 0) {
      const { data: schemas, error: schErr } = await supabaseAdmin
        .from('training_schemas')
        .select('id, name, schema_nummer, training_goal, equipment_type')
        .in('id', schemaIds);
      if (schErr) return NextResponse.json({ error: schErr.message }, { status: 500 });
      schemaMap = (schemas || []).reduce((acc: any, s: any) => { acc[s.id] = s; return acc; }, {});
    }

    // 3) Fetch training profiles for frequency
    let freqMap: Record<string, number> = {};
    if (userIds.length > 0) {
      const { data: tps, error: tpErr } = await supabaseAdmin
        .from('user_training_profiles')
        .select('user_id, training_frequency');
      if (!tpErr) {
        for (const tp of (tps || [])) {
          if (tp.user_id) freqMap[tp.user_id] = Math.max(1, tp.training_frequency || 7);
        }
      }
    }

    // 4) Fetch progress rows per user
    let progressByUser: Record<string, any[]> = {};
    if (userIds.length > 0) {
      const { data: progress, error: progErr } = await supabaseAdmin
        .from('user_training_schema_progress')
        .select('user_id, schema_id, completed_days, total_days, completed_at, started_at, current_day');
      if (progErr) return NextResponse.json({ error: progErr.message }, { status: 500 });
      for (const p of (progress || [])) {
        if (!progressByUser[p.user_id]) progressByUser[p.user_id] = [];
        progressByUser[p.user_id].push(p);
      }
    }

    const rows = users.map(u => {
      const selectedSchema = u.selected_schema_id ? schemaMap[u.selected_schema_id] : null;
      // Derive frequency: training profile > schema days > 7
      const derivedDaysPerWeek = selectedSchema ? 1 : 1; // safe default 1
      const freq = Math.max(1, freqMap[u.id] ?? derivedDaysPerWeek ?? 7);
      const pList = progressByUser[u.id] || [];
      const pForSelected = pList.find(p => p.schema_id === u.selected_schema_id) || null;
      const completedDays = pForSelected ? (pForSelected.completed_days ?? 0) : 0;
      const weeks = pForSelected?.completed_at ? 8 : Math.floor(completedDays / freq);
      return {
        userId: u.id,
        email: u.email,
        fullName: u.full_name,
        selectedSchemaId: u.selected_schema_id,
        selectedSchemaName: selectedSchema?.name || null,
        selectedSchemaNumber: selectedSchema?.schema_nummer || null,
        trainingFrequency: freq,
        totalDaysCompleted: completedDays,
        weeksCompleted: weeks,
        completedAt: pForSelected?.completed_at || null,
      };
    });

    return NextResponse.json({ success: true, count: rows.length, rows });
  } catch (e: any) {
    console.error('trainingschemas list error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
