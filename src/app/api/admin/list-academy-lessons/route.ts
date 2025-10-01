import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Always return fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_req: NextRequest) {
  try {
    // Fetch modules and lessons in parallel
    const [modulesRes, lessonsRes] = await Promise.all([
      supabaseAdmin.from('academy_modules').select('id,title,order_index').order('order_index', { ascending: true }),
      supabaseAdmin.from('academy_lessons').select('id,title,module_id,order_index').order('order_index', { ascending: true })
    ]);

    if (modulesRes.error) {
      return NextResponse.json({ error: modulesRes.error.message }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
    }
    if (lessonsRes.error) {
      return NextResponse.json({ error: lessonsRes.error.message }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
    }

    const modules = modulesRes.data || [];
    const lessons = lessonsRes.data || [];

    const byModule: Record<string, { id: string; title: string; order_index: number; lessons: any[] }> = {};
    modules.forEach((m: any) => {
      byModule[m.id] = { id: m.id, title: m.title, order_index: m.order_index, lessons: [] };
    });
    lessons.forEach((l: any) => {
      if (!byModule[l.module_id]) {
        byModule[l.module_id] = { id: l.module_id, title: 'UNKNOWN', order_index: 999, lessons: [] };
      }
      byModule[l.module_id].lessons.push(l);
    });

    const flat = lessons.map((l: any) => ({
      module_id: l.module_id,
      lesson_id: l.id,
      module_title: byModule[l.module_id]?.title || 'UNKNOWN',
      lesson_title: l.title,
      order_index: l.order_index,
      url: `/dashboard/academy/${l.module_id}/${l.id}`,
    }));

    return NextResponse.json({ modules: Object.values(byModule), lessons: flat }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
