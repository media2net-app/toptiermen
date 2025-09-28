import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Force dynamic
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function safeDelete(table: string, column: string, userId: string) {
  try {
    const { error } = await supabaseAdmin.from(table).delete().eq(column, userId);
    if (error) {
      // Log but do not fail the entire operation
      console.warn(`⚠️ Delete warning: ${table}.${column} for ${userId}:`, error.message);
    } else {
      console.log(`✅ Deleted from ${table} where ${column} = ${userId}`);
    }
  } catch (e: any) {
    console.warn(`⚠️ Delete exception on ${table}:`, e?.message || e);
  }
}

async function handleDelete(req: NextRequest) {
  try {
    let userId: string | undefined;
    // Some environments strip bodies from DELETE; try both body and searchParams
    try {
      const body = await req.json();
      userId = body?.userId;
    } catch {}
    if (!userId) {
      const sp = req.nextUrl.searchParams;
      userId = sp.get('userId') || undefined;
    }
    if (!userId) {
      return NextResponse.json({ error: 'userId is verplicht (body JSON of query param ?userId=...)' }, { status: 400 });
    }

    // First: delete the auth user (primary source of truth)
    const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authErr) {
      console.error('❌ Auth delete error:', authErr.message);
      return NextResponse.json({ error: authErr.message || 'Fout bij verwijderen van auth gebruiker' }, { status: 400 });
    }

    // Then best-effort: delete related data in DB (ignore failures per table)
    // Keep child tables first, profiles last among DB tables
    const relatedDeletes: Array<[string, string]> = [
      // Core
      // Activity/logs/features possibly referencing user
      ['workout_sessions', 'user_id'],
      ['user_challenges', 'user_id'],
      ['challenge_completions', 'user_id'],
      ['forum_posts', 'author_id'],
      ['forum_topics', 'author_id'],
      ['user_preferences', 'user_id'],
      ['badges_awarded', 'user_id'],
      ['user_stats', 'user_id'],
      ['nutrition_profiles', 'user_id'],
      ['user_nutrition_plans', 'user_id'],
      ['email_logs', 'user_id'],

      // Training-related additional tables
      ['training_profiles', 'user_id'],
      ['training_schema_periods', 'user_id'],
      ['schema_completions', 'user_id'],
      ['training_progress', 'user_id'],

      // Brotherhood/community extras (if exist)
      ['forum_replies', 'author_id'],
      ['forum_votes', 'user_id'],

      // Mind & Focus or other features (best effort; ignore if not exist)
      ['mind_focus_intake', 'user_id'],
      ['mind_focus_sessions', 'user_id'],

      // Finally remove profile record (often the parent row referenced elsewhere)
      ['profiles', 'id'],
      ['onboarding_status', 'user_id'],
    ];

    const perTableErrors: { table: string; error: string }[] = [];
    for (const [table, column] of relatedDeletes) {
      try {
        const { error } = await supabaseAdmin.from(table).delete().eq(column, userId);
        if (error) {
          console.warn(`⚠️ Delete warning: ${table}.${column} for ${userId}:`, error.message);
          perTableErrors.push({ table, error: error.message });
        } else {
          console.log(`✅ Deleted from ${table} where ${column} = ${userId}`);
        }
      } catch (e: any) {
        const message = e?.message || String(e);
        console.warn(`⚠️ Delete exception on ${table}:`, message);
        perTableErrors.push({ table, error: message });
      }
    }

    // Auth deletion succeeded, return success regardless of per-table DB cleanup issues
    return NextResponse.json({ success: true, message: 'Gebruiker permanent verwijderd', details: { perTableErrors } });
  } catch (e: any) {
    console.error('❌ delete-user route error:', e?.message || e);
    return NextResponse.json({ error: 'Er is een fout opgetreden bij het verwijderen', details: e?.message || String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  return handleDelete(req);
}

// Some proxies disallow DELETE bodies; allow POST to the same endpoint as a fallback
export async function POST(req: NextRequest) {
  return handleDelete(req);
}
