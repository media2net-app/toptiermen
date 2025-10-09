import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/admin/academy-hls-audit
// Scans lessons and reports presence of HLS manifests in public/hls/
export async function GET(_req: NextRequest) {
  try {
    // In production on Vercel this endpoint is disabled to keep the function bundle small
    // and avoid tracing the large public/hls directory. Use locally only.
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({
        disabled: true,
        reason: 'HLS audit is dev-only and disabled in production to keep function size small.',
      });
    }

    // Dynamically import Node modules only in non-production
    const path = (await import('path')).default;
    const fs = (await import('fs/promises')).default;
    // Fetch lessons
    const { data: lessons, error } = await supabaseAdmin
      .from('academy_lessons')
      .select('id, module_id, title, video_url, order_index')
      .order('module_id', { ascending: true })
      .order('order_index', { ascending: true });

    if (error) {
      console.error('HLS audit: failed to fetch lessons', error);
      return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
    }

    const projectRoot = process.cwd();
    const publicDir = path.join(projectRoot, 'public');
    const hlsRoot = path.join(publicDir, 'hls');

    // Helper: check if file exists
    const exists = async (p: string) => {
      try {
        const st = await fs.stat(p);
        return st.isFile();
      } catch {
        return false;
      }
    };

    // For each lesson, check preferred and legacy HLS paths
    const results: Array<{
      moduleId: string;
      lessonId: string;
      title?: string | null;
      hasPreferred: boolean;
      hasLegacy: boolean;
      preferredPath: string;
      legacyPath: string;
      chosen: 'preferred' | 'legacy' | 'none';
      videoUrl?: string | null;
      notes?: string[];
    }> = [];

    for (const lesson of lessons || []) {
      const moduleId = String(lesson.module_id);
      const lessonId = String(lesson.id);

      const preferred = path.join(hlsRoot, moduleId, lessonId, 'master.m3u8');
      const legacy = path.join(hlsRoot, lessonId, 'master.m3u8');

      const [hasPreferred, hasLegacy] = await Promise.all([
        exists(preferred),
        exists(legacy),
      ]);

      let chosen: 'preferred' | 'legacy' | 'none' = 'none';
      if (hasPreferred) chosen = 'preferred';
      else if (hasLegacy) chosen = 'legacy';

      const notes: string[] = [];
      if (!hasPreferred && !hasLegacy) {
        // If a partially generated folder exists (e.g., only .ts segments), add a hint
        const candidateDirPreferred = path.join(hlsRoot, moduleId, lessonId);
        const candidateDirLegacy = path.join(hlsRoot, lessonId);
        try {
          const dir = hasPreferred ? candidateDirPreferred : candidateDirPreferred;
          const files = await fs.readdir(dir).catch(() => []);
          const hasTs = files.some(f => f.endsWith('.ts'));
          const hasAnyM3u8 = files.some(f => f.endsWith('.m3u8'));
          if (hasTs && !hasAnyM3u8) {
            notes.push('Found TS segments without m3u8 manifest (incomplete HLS).');
          }
        } catch {
          // ignore
        }
        try {
          const filesLegacy = await fs.readdir(candidateDirLegacy).catch(() => []);
          const hasTsLegacy = filesLegacy.some(f => f.endsWith('.ts'));
          const hasAnyM3u8Legacy = filesLegacy.some(f => f.endsWith('.m3u8'));
          if (hasTsLegacy && !hasAnyM3u8Legacy) {
            notes.push('Legacy folder contains TS segments without m3u8 manifest.');
          }
        } catch {
          // ignore
        }
      }

      results.push({
        moduleId,
        lessonId,
        title: lesson.title,
        hasPreferred,
        hasLegacy,
        preferredPath: path.relative(projectRoot, preferred),
        legacyPath: path.relative(projectRoot, legacy),
        chosen,
        videoUrl: lesson.video_url,
        notes: notes.length ? notes : undefined,
      });
    }

    const summary = {
      totalLessons: results.length,
      withPreferred: results.filter(r => r.hasPreferred).length,
      withLegacy: results.filter(r => !r.hasPreferred && r.hasLegacy).length,
      missing: results.filter(r => !r.hasPreferred && !r.hasLegacy).length,
    };

    return NextResponse.json({ summary, results });
  } catch (e: any) {
    console.error('HLS audit: unexpected error', e);
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
