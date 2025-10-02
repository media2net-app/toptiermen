import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type StoredItem = {
  id: string;
  url: string;
  module: string | null;
  title: string | null;
  summary_text: string | null;
  summary_html?: string | null;
  created_at?: string;
  updated_at?: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Supabase-backed implementation

export async function POST(req: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey || !supabase) {
      return NextResponse.json(
        { success: false, error: 'Missing Supabase env vars: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY' },
        { status: 500 }
      );
    }
    const body = await req.json();
    const { url, module, title, summary_html, summary_text } = body || {};
    if (!url || !summary_html) {
      return NextResponse.json({ success: false, error: 'url en summary_html zijn verplicht' }, { status: 400 });
    }

    // Upsert by URL (with fallback create table on 42P01)
    const doUpsert = async () => {
      return await supabase
        .from('ebooks_v2_summaries')
        .upsert({ url, module, title, summary_html, summary_text }, { onConflict: 'url' })
        .select('id')
        .single();
    };

    let { data, error } = await doUpsert();
    if (error && (error as any).code === '42P01') {
      // table does not exist -> try to create via RPC if available
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
          ALTER TABLE ebooks_v2_summaries ENABLE ROW LEVEL SECURITY;
        `,
      });
      if (createError) {
        return NextResponse.json(
          { success: false, error: `Table missing and create failed: ${createError.message}` },
          { status: 500 }
        );
      }
      // retry
      const retry = await doUpsert();
      data = retry.data as any;
      error = retry.error as any;
    }

    if (error) {
      return NextResponse.json({ success: false, error: error.message, code: (error as any).code || null }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (e: any) {
    console.error('❌ ebooks summaries POST error:', e);
    return NextResponse.json({ success: false, error: e?.message || String(e) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey || !supabase) {
      return NextResponse.json(
        { success: false, error: 'Missing Supabase env vars' },
        { status: 500 }
      );
    }
    const { searchParams } = new URL(req.url);
    const includeHtml = searchParams.get('include') === 'html';
    const moduleFilter = searchParams.get('module');
    const urlFilter = searchParams.get('url');

    let query = supabase
      .from('ebooks_v2_summaries')
      .select(
        includeHtml
          ? 'id,url,module,title,summary_text,summary_html,created_at,updated_at'
          : 'id,url,module,title,summary_text,created_at,updated_at'
      )
      .order('module', { ascending: true })
      .order('title', { ascending: true });

    if (moduleFilter) query = query.eq('module', moduleFilter);
    if (urlFilter) query = query.eq('url', urlFilter);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, items: data || [] });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || String(e) }, { status: 500 });
  }
}

