import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const revalidate = 0;

export async function GET(_req: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('training_schemas')
      .select(`
        id,
        name,
        training_goal,
        equipment_type,
        schema_nummer,
        training_schema_days ( day_number )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map to minimal payload
    const list = (data || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      training_goal: s.training_goal,
      equipment_type: s.equipment_type,
      schema_nummer: s.schema_nummer,
      day_count: Array.isArray(s.training_schema_days) ? s.training_schema_days.length : 0,
    }));

    return NextResponse.json({ schemas: list });
  } catch (e: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
