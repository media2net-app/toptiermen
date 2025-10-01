import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Safety: require an admin key header to execute destructive reset
const ADMIN_KEY = process.env.ADMIN_BULK_RESET_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const dryRun = body?.dryRun !== false; // default true
    const excludeEmails: string[] = (body?.excludeEmails || [
      'chiel@media2net.nl',
      'rick@toptiermen.eu',
    ]).map((e: string) => e.toLowerCase());

    const providedKey = req.headers.get('x-admin-key') || '';
    if (!ADMIN_KEY || providedKey !== ADMIN_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized: missing or invalid x-admin-key',
      }, { status: 401 });
    }

    // 1) Collect user IDs to reset (all except excluded emails)
    const { data: profiles, error: profErr } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .neq('email', null);
    if (profErr) throw profErr;

    const targets = (profiles || []).filter(p => !excludeEmails.includes(String(p.email).toLowerCase()));
    const targetIds = targets.map(p => p.id);

    if (targetIds.length === 0) {
      return NextResponse.json({ success: true, message: 'No users to reset', counts: { users: 0 } });
    }

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        message: 'This is a dry run. No data was modified.',
        sample: targets.slice(0, 25),
        counts: { users: targetIds.length },
      });
    }

    const results: any = {};
    const nowIso = new Date().toISOString();

    // 2) Nullify selected schema on profiles
    const { error: updProfErr } = await supabaseAdmin
      .from('profiles')
      .update({ selected_schema_id: null, updated_at: nowIso })
      .in('id', targetIds);
    if (updProfErr) throw updProfErr;
    results.profilesUpdated = targetIds.length;

    // 3) Delete user training schema progress
    const { error: delProgErr } = await supabaseAdmin
      .from('user_training_schema_progress')
      .delete()
      .in('user_id', targetIds);
    if (delProgErr) throw delProgErr;
    results.progressDeleted = true;

    // 4) Delete user training schemas (assigned schemas mapping)
    const { error: delSchemasErr } = await supabaseAdmin
      .from('user_training_schemas')
      .delete()
      .in('user_id', targetIds);
    if (delSchemasErr) {
      // Not fatal if table does not exist in current schema
      console.warn('user_training_schemas delete warning:', delSchemasErr);
    } else {
      results.userTrainingSchemasDeleted = true;
    }

    // 5) Optionally clear any period tables if they exist
    try {
      const { error: delPeriodsErr } = await supabaseAdmin
        .from('training_schema_periods')
        .delete()
        .in('user_id', targetIds);
      if (!delPeriodsErr) results.schemaPeriodsDeleted = true;
    } catch (e) {
      // ignore if table missing
    }

    return NextResponse.json({ success: true, results, counts: { users: targetIds.length } });
  } catch (e: any) {
    console.error('bulk-reset-schemas error', e);
    return NextResponse.json({ success: false, error: e?.message || 'Internal error' }, { status: 500 });
  }
}
