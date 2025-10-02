import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const V2_DIR = path.join(process.cwd(), 'public', 'ebooksv2');
const LEGACY_BOOKS_DIR = path.join(process.cwd(), 'public', 'books');
const EXCLUDE = new Set<string>(['_template.html']);

function stripHtml(s: string): string {
  return s.replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeTitle(s: string) {
  return stripHtml(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ') 
    .trim();
}

function similarity(a: string, b: string) {
  const wa = new Set(a.split(' '));
  const wb = new Set(b.split(' '));
  const inter = [...wa].filter(w => wb.has(w)).length;
  const union = new Set([...wa, ...wb]).size;
  return union ? inter / union : 0;
}

type LegacyMeta = { title: string; moduleLabel: string; lesLabel: string; backLink?: string; file: string };

async function scanLegacyBooks(): Promise<LegacyMeta[]> {
  try {
    const files = await fs.readdir(LEGACY_BOOKS_DIR);
    const htmlFiles = files.filter(f => f.endsWith('.html'));
    const metas: LegacyMeta[] = [];
    for (const name of htmlFiles) {
      const p = path.join(LEGACY_BOOKS_DIR, name);
      const html = await fs.readFile(p, 'utf8');
      const h1 = stripHtml((/<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1]) || '');
      let moduleLabel = '';
      let lesLabel = '';
      const moduleInfo = stripHtml((/<div class=\"module-info\">([\s\S]*?)<\/div>/i.exec(html)?.[1]) || '');
      if (moduleInfo) {
        moduleLabel = moduleInfo.split('|')[0]?.trim() || '';
        lesLabel = moduleInfo.split('|')[1]?.trim() || '';
      } else {
        // Try subtitle form: <p class="subtitle">Module 2 - Les 5: ...</p>
        const sub = stripHtml((/<p class=\"subtitle\">([\s\S]*?)<\/p>/i.exec(html)?.[1]) || '');
        const m = /module\s*(\d+)[^\d]+les\s*(\d+)/i.exec(sub);
        if (m) {
          const modNum = m[1].padStart(2, '0');
          const lesNum = m[2].padStart(2, '0');
          moduleLabel = `Module ${modNum}: Onbekend`;
          lesLabel = `Les ${lesNum}: ${h1 || 'Onbekend'}`;
        }
      }
      const backLink = (/<a[^>]*class=\"sticky-back-btn\"[^>]*href=\"([^\"]+)\"/i.exec(html)?.[1]) || undefined;
      if (h1) {
        metas.push({ title: h1, moduleLabel, lesLabel, backLink, file: name });
      }
    }
    return metas;
  } catch {
    return [];
  }
}

type LessonFlat = { module_id: string; lesson_id: string; module_title: string; lesson_title: string; order_index: number; url: string };
type ModuleMeta = { id: string; title: string; order_index: number };
async function fetchAllLessons(): Promise<{ lessons: LessonFlat[]; modules: ModuleMeta[] }> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/list-academy-lessons`, { cache: 'no-store' });
    if (!res.ok) return { lessons: [], modules: [] };
    const data = await res.json();
    return { lessons: (data?.lessons || []) as LessonFlat[], modules: (data?.modules || []) as ModuleMeta[] };
  } catch {
    return { lessons: [], modules: [] };
  }
}

async function loadTemplate() {
  const file = path.join(process.cwd(), 'public', 'ebooksv2', '_template.html');
  return fs.readFile(file, 'utf8');
}

function findInner(html: string, id: string): string | null {
  const re = new RegExp(`(<div class=\\"section\\" id=\\"${id}\\">)([\\s\\S]*?)(<\\/div>)`, 'i');
  const m = re.exec(html);
  if (!m) return null;
  return m[2].trim();
}

function dedupeSummaryHeading(inner: string): string {
  // Remove duplicated H2 summary title if present inside inner
  return inner.replace(/<h2[^>]*>\s*[^<]*Uitgebreide\s+Samenvatting[^<]*<\/h2>/gi, '').trim();
}

function fillTemplate(tpl: string, params: { lesnaam: string; subtitle: string; moduleLabel: string; lesLabel: string; backLink: string; summaryHtml: string; checklistHtml?: string; reflectieHtml?: string; huiswerkHtml?: string; actionPlanHtml?: string; }): string {
  let out = tpl;
  out = out.replace(/<!-- LESNAAM -->/g, params.lesnaam || '');
  out = out.replace(/<!-- SUBTITLE\/KORTE CLAIM -->/g, params.subtitle || '');
  out = out.replace(/<!-- MODULE_LABEL -->/g, params.moduleLabel || '');
  out = out.replace(/<!-- LES_LABEL -->/g, params.lesLabel || '');
  out = out.replace('<!-- TERUG_LINK_NAAR_LES -->', params.backLink || '#');
  out = out.replace(
    /(<div class="section" id="samenvatting">[\s\S]*?<h2>[^<]*<\/h2>)([\s\S]*?)(<\/div>)/,
    (_m, p1, _p2, p3) => `${p1}\n${params.summaryHtml}\n${p3}`
  );
  if (params.huiswerkHtml) {
    out = out.replace(/(<div class="section" id="huiswerk">)[\s\S]*?(<\/div>)/, (_m, p1, p2) => `${p1}\n${params.huiswerkHtml}\n${p2}`);
  }
  if (params.checklistHtml) {
    out = out.replace(/(<div class="section" id="checklists">)[\s\S]*?(<\/div>)/, (_m, p1, p2) => `${p1}\n${params.checklistHtml}\n${p2}`);
  }
  if (params.reflectieHtml) {
    out = out.replace(/(<div class="section" id="reflectie">)[\s\S]*?(<\/div>)/, (_m, p1, p2) => `${p1}\n${params.reflectieHtml}\n${p2}`);
  }
  if (params.actionPlanHtml) {
    out = out.replace(/(<div class="section action-plan" id="actieplan">)[\s\S]*?(<\/div>)/, (_m, p1, p2) => `${p1}\n${params.actionPlanHtml}\n${p2}`);
  }
  return out;
}

function ensureChecklistContent(existing: string | null): string {
  const text = stripHtml(existing || '').toLowerCase();
  const hasPlaceholder = /voorbeeld\s*checklist\s*item/.test(text) || text.length < 80;
  if (!existing || hasPlaceholder) {
    return [
      '<h2>✅ Checklists</h2>',
      '<h3>Implementatie deze week</h3>',
      '<div class="checklist">',
      '<div class="checklist-item"><input type="checkbox" id="chk-1"><label for="chk-1">Plan 3 vaste momenten in je agenda voor toepassing van 1 lesprincipe</label></div>',
      '<div class="checklist-item"><input type="checkbox" id="chk-2"><label for="chk-2">Verwijder 2 afleidingen uit je omgeving</label></div>',
      '<div class="checklist-item"><input type="checkbox" id="chk-3"><label for="chk-3">Voeg 2 hulpbronnen toe (notitiekaart, checklist, reminder)</label></div>',
      '<div class="checklist-item"><input type="checkbox" id="chk-4"><label for="chk-4">Kies 1 accountability-partner en deel je doel</label></div>',
      '<div class="checklist-item"><input type="checkbox" id="chk-5"><label for="chk-5">Plan 1 evaluatiemoment en noteer 1 aanpassing</label></div>',
      '</div>'
    ].join('\n');
  }
  return existing!;
}

function ensureReflectieContent(existing: string | null): string {
  const text = stripHtml(existing || '');
  if (!existing || text.length < 200) {
    return [
      '<h2>🤔 Reflectie Vragen</h2>',
      '<div class="reflection-question"><h4>Toepassing komende week</h4><p>Welke keuze uit deze les pas je komende week toe en waarom? Beschrijf concreet hoe je dit uitvoert.</p></div>',
      '<div class="reflection-question"><h4>Obstakels en eerste stap</h4><p>Waar loop je nu tegenaan en wat is je eerste kleine stap om dit te doorbreken? Noem tijd en plaats.</p></div>',
      '<div class="reflection-question"><h4>Gedachte → Actie</h4><p>Welke belemmerende gedachte vervang je door een actie? Schrijf de nieuwe gedachte en de actie op.</p></div>',
      '<div class="reflection-question"><h4>Accountability</h4><p>Welke persoon uit je omgeving kan je hierbij accountable houden en hoe informeer je hem/haar?</p></div>',
      '<div class="reflection-question"><h4>Evaluatiemoment</h4><p>Wat is je evaluatiemoment en welk resultaat verwacht je te zien na 7 dagen?</p></div>'
    ].join('\n');
  }
  return existing!;
}

function ensureHuiswerkContent(existing: string | null): string {
  const text = stripHtml(existing || '');
  const hasDoelActie = /\bdoel\s*:/i.test(existing || '') && /\bactie\s*:/i.test(existing || '');
  if (!existing || text.length < 200 || !hasDoelActie) {
    return [
      '<h2>📝 Huiswerk Opdrachten</h2>',
      '<div class="exercise-box"><h4>Opdracht 1: Zelfreflectie en Toepassing</h4><p><strong>Doel:</strong> 1 concreet principe uit de les toepassen in je week.</p><p><strong>Actie:</strong> Plan 3 momenten (datum/tijd) in je agenda en voer ze 7 dagen uit. Schrijf elke dag 2 regels wat je hebt gedaan en wat werkte/niet.</p></div>',
      '<div class="exercise-box"><h4>Opdracht 2: Omgevings-check</h4><p><strong>Doel:</strong> Je omgeving optimaliseren om consistentie te ondersteunen.</p><p><strong>Actie:</strong> Verwijder 2 afleidingen en voeg 2 hulpbronnen toe (bv. notitiekaart, checklist). Maak een foto of korte notitie als bewijs.</p></div>',
      '<div class="exercise-box"><h4>Opdracht 3: Weekevaluatie</h4><p><strong>Doel:</strong> Reflecteren en bijsturen.</p><p><strong>Actie:</strong> Plan aan het einde van de week 10 minuten reflectie. Noteer: (1) wat werkte, (2) wat niet, (3) 1 aanpassing voor de volgende week.</p></div>'
    ].join('\n');
  }
  return existing!;
}

export async function POST() {
  try {
    const tpl = await loadTemplate();
  const legacy = await scanLegacyBooks();
  const { lessons: lessonsIndex, modules: modulesIndex } = await fetchAllLessons();
    const files = await fs.readdir(V2_DIR);
    const targets = files.filter(f => f.endsWith('.html') && !EXCLUDE.has(f));

    const results: any[] = [];
    for (const name of targets) {
      const filePath = path.join(V2_DIR, name);
      const html = await fs.readFile(filePath, 'utf8');

      const h1Match = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
      const derivedFromName = name.replace(/\.html$/i,'').replace(/-/g,' ').replace(/\b\w/g, c => c.toUpperCase());
      const lesnaam = (h1Match ? stripHtml(h1Match[1]) : derivedFromName).trim();
      const subtitleMatch = /<p class=\"subtitle\">([\s\S]*?)<\/p>/i.exec(html);
      const subtitle = (subtitleMatch ? stripHtml(subtitleMatch[1]) : '').trim();
      const moduleInfoMatch = /<div class=\"module-info\">([\s\S]*?)<\/div>/i.exec(html);
      const moduleInfo = moduleInfoMatch ? stripHtml(moduleInfoMatch[1]) : '';
      let moduleLabel = moduleInfo.includes('|') ? moduleInfo.split('|')[0].trim() : moduleInfo;
      let lesLabel = moduleInfo.includes('|') ? moduleInfo.split('|')[1].trim() : '';
      let backLink = (/<a[^>]*class=\"sticky-back-btn\"[^>]*href=\"([^\"]+)\"/i.exec(html)?.[1]) || '';

      // Try to map against legacy books to get authoritative labels and backlink
      const key = normalizeTitle(lesnaam);
      let best: LegacyMeta | undefined;
      let bestScore = 0;
      for (const m of legacy) {
        const s = similarity(key, normalizeTitle(m.title));
        if (s > bestScore) { bestScore = s; best = m; }
      }
      if (best && bestScore >= 0.25) {
        moduleLabel = best.moduleLabel || moduleLabel;
        lesLabel = best.lesLabel || lesLabel;
        if (best.backLink) backLink = best.backLink;
        // Try number-based mapping when labels contain numbers
        const modNumMatch = /module\s*(\d{1,2})/i.exec(best.moduleLabel || '');
        const lesNumMatch = /les\s*(\d{1,2})/i.exec(best.lesLabel || '');
        if (modNumMatch && lesNumMatch && modulesIndex.length && lessonsIndex.length) {
          const modIdx = parseInt(modNumMatch[1], 10);
          const lesIdx = parseInt(lesNumMatch[1], 10);
          const mod = modulesIndex.find(m => m.order_index === modIdx);
          if (mod) {
            const lesson = lessonsIndex.find(L => L.module_id === mod.id && L.order_index === lesIdx);
            if (lesson) {
              const modNum = String(mod.order_index).padStart(2,'0');
              const lesNum = String(lesson.order_index).padStart(2,'0');
              moduleLabel = `Module ${modNum}: ${mod.title}`;
              lesLabel = `Les ${lesNum}: ${lesson.lesson_title}`;
              backLink = lesson.url;
            }
          }
        }
      }

      // Always try to map against lessons index using the current best title we have (legacy h1 or v2 h1)
      if (lessonsIndex.length) {
        const keyToMap = normalizeTitle(lesnaam);
        let bestL: LessonFlat | undefined; let scoreL = 0;
        for (const L of lessonsIndex) {
          const s = similarity(keyToMap, normalizeTitle(L.lesson_title));
          if (s > scoreL) { scoreL = s; bestL = L; }
        }
        if (bestL && scoreL >= 0.25) {
          backLink = bestL.url || backLink;
          const mod = modulesIndex.find(m => m.id === bestL!.module_id);
          const modNum = String(mod?.order_index ?? 0).padStart(2,'0');
          const lesNum = String(bestL.order_index ?? 0).padStart(2,'0');
          moduleLabel = `Module ${modNum}: ${mod?.title || bestL.module_title}`;
          lesLabel = `Les ${lesNum}: ${bestL.lesson_title}`;
        }
      }

      if (!moduleLabel) moduleLabel = 'Module 00: Onbekend';
      if (!/^module\s*\d{2}:/i.test(moduleLabel)) moduleLabel = `Module 00: ${moduleLabel || 'Onbekend'}`;
      if (!lesLabel) lesLabel = `Les 00: ${lesnaam}`;
      if (!/^les\s*\d{2}:/i.test(lesLabel)) lesLabel = `Les 00: ${lesLabel.replace(/^les\s*/i,'').trim() || lesnaam}`;
      if (!backLink) backLink = '/dashboard/academy';

      let samenvattingInner = findInner(html, 'samenvatting') || '';
      samenvattingInner = dedupeSummaryHeading(samenvattingInner);
      const checklistInner = ensureChecklistContent(findInner(html, 'checklists'));
      const reflectieInner = ensureReflectieContent(findInner(html, 'reflectie'));
      const huiswerkInner = ensureHuiswerkContent(findInner(html, 'huiswerk'));
      const actionPlanInner = findInner(html, 'actieplan') || '';

      let out = fillTemplate(tpl, {
        lesnaam, subtitle, moduleLabel, lesLabel, backLink,
        summaryHtml: samenvattingInner,
        checklistHtml: checklistInner,
        reflectieHtml: reflectieInner,
        huiswerkHtml: huiswerkInner,
        actionPlanHtml: actionPlanInner,
      });

      // Remove the optional Actieplan section entirely for all ebooks
      out = out.replace(/\n?\s*<div class=\"section action-plan\" id=\"actieplan\">[\s\S]*?<\/div>/i, '');

      const updated = out !== html;
      if (updated) await fs.writeFile(filePath, out, 'utf8');
      results.push({ name, updated });
    }

    const summary = {
      total: targets.length,
      updated: results.filter(r => r.updated).length,
    };

    return NextResponse.json({ success: true, summary, results });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || String(e) }, { status: 500 });
  }
}
