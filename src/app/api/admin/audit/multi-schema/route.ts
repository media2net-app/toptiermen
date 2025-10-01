import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/admin/audit/multi-schema
// Optional: ?selectedOnly=true -> still returns users with >1 progress rows but includes only selected schema detail
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const selectedOnly = searchParams.get('selectedOnly') === 'true';

    // 1) Fetch all progress rows (user_id, schema_id)
    const { data: progress, error: progErr } = await supabaseAdmin
      .from('user_training_schema_progress')
      .select('user_id, schema_id, completed_days, total_days, completed_at');
    if (progErr) return NextResponse.json({ error: progErr.message }, { status: 500 });

    const map: Record<string, any[]> = {};
    for (const p of (progress || [])) {
      if (!p.user_id) continue;
      if (!map[p.user_id]) map[p.user_id] = [];
      map[p.user_id].push(p);
    }

    // 2) Users with >1 distinct schema_ids
    const userIds = Object.keys(map);
    const offenders: string[] = [];
    const distinctSchemasByUser: Record<string, string[]> = {};
    for (const uid of userIds) {
      const distinct = Array.from(new Set((map[uid] || []).map(r => r.schema_id).filter(Boolean)));
      distinctSchemasByUser[uid] = distinct as string[];
      if (distinct.length > 1) offenders.push(uid);
    }

    if (offenders.length === 0) {
      return NextResponse.json({ success: true, count: 0, rows: [] });
    }

    // 3) Fetch profile info for offenders
    const { data: profiles, error: profErr } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, selected_schema_id')
      .in('id', offenders as any);
    if (profErr) return NextResponse.json({ error: profErr.message }, { status: 500 });

    // 4) Fetch involved schemas for offenders for light metadata
    const allSchemaIds = Array.from(new Set(offenders.flatMap(uid => distinctSchemasByUser[uid])));
    let schemaMap: Record<string, any> = {};
    if (allSchemaIds.length > 0) {
      const { data: schemas, error: schErr } = await supabaseAdmin
        .from('training_schemas')
        .select('id, name, schema_nummer, training_goal, equipment_type')
        .in('id', allSchemaIds as any);
      if (!schErr && schemas) {
        schemaMap = (schemas as any[]).reduce((acc: any, s: any) => { acc[s.id] = s; return acc; }, {});
      }
    }

    // 5) Build rows
    const rows = (profiles || []).map((p: any) => {
      const ids = distinctSchemasByUser[p.id] || [];
      const schemas = ids.map(id => ({
        id,
        meta: schemaMap[id] || null,
      }));

      const selectedOnlySchemas = p.selected_schema_id ? ids.filter(id => id === p.selected_schema_id) : ids;

      return {
        userId: p.id,
        email: p.email,
        fullName: p.full_name,
        selectedSchemaId: p.selected_schema_id,
        schemaIds: selectedOnly ? selectedOnlySchemas : ids,
        schemas: selectedOnly ? schemas.filter(s => s.id === p.selected_schema_id) : schemas,
      };
    });

    return NextResponse.json({ success: true, count: rows.length, rows });
  } catch (e: any) {
    console.error('multi-schema audit error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
