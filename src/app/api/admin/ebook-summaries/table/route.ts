import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || 'placeholder-key'
);

export async function POST(_req: NextRequest) {
  try {
    // Create table if not exists
    const { error: createError } = await supabase.rpc('execute_sql', {
      sql_query: `
      CREATE TABLE IF NOT EXISTS ebooks_v2_summaries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        url TEXT UNIQUE NOT NULL,
        module TEXT,
        title TEXT,
        summary_html TEXT,
        summary_text TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS idx_ebooks_v2_summaries_module ON ebooks_v2_summaries(module);

      -- RLS
      ALTER TABLE ebooks_v2_summaries ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Allow public read summaries" ON ebooks_v2_summaries;
      CREATE POLICY "Allow public read summaries" ON ebooks_v2_summaries
        FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Admins can manage summaries" ON ebooks_v2_summaries;
      DROP POLICY IF EXISTS "Authenticated can manage summaries" ON ebooks_v2_summaries;
      CREATE POLICY "Authenticated can manage summaries" ON ebooks_v2_summaries
        FOR ALL USING (auth.uid() IS NOT NULL);

      -- updated_at trigger
      CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_ebooks_v2_summaries_updated_at ON ebooks_v2_summaries;
      CREATE TRIGGER trg_ebooks_v2_summaries_updated_at
      BEFORE UPDATE ON ebooks_v2_summaries
      FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
      `
    });

    if (createError) {
      console.error('❌ ebooks_v2_summaries create error:', createError);
      return NextResponse.json({ success: false, error: createError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('❌ ebooks_v2_summaries error:', e);
    return NextResponse.json({ success: false, error: e?.message || String(e) }, { status: 500 });
  }
}
