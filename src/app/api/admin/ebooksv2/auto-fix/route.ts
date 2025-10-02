import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Thresholds
const MIN_SECTION_CHARS = 200;

const EXCLUDE_NAMES = new Set<string>([
  '.tmp_eer_loyaliteit_summary.html',
  '_template.html',
]);

const V2_DIR = path.join(process.cwd(), 'public', 'ebooksv2');

function stripHtml(s: string): string {
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function ensureChecklist(): { heading: string; html: string } {
  const heading = '✅ Checklists';
  const html = `
    <section class="ttm-checklist p-4 sm:p-6 bg-[#121812] rounded-xl border border-[#2a3a22]">
      <h2 class="text-xl font-bold text-[#B6C948] mb-3">✅ Checklists</h2>
      <div class="checklist">
        <div class="checklist-item"><input type="checkbox" id="cl-1"><label for="cl-1">Plan 3 vaste momenten voor toepassing van deze les (agenda blokken)</label></div>
        <div class="checklist-item"><input type="checkbox" id="cl-2"><label for="cl-2">Verwijder 2 afleidingen en voeg 2 hulpbronnen toe</label></div>
        <div class="checklist-item"><input type="checkbox" id="cl-3"><label for="cl-3">Voer 7 dagen de gekozen actie uit en noteer kort resultaat</label></div>
        <div class="checklist-item"><input type="checkbox" id="cl-4"><label for="cl-4">Kies een accountability-partner en deel je doel</label></div>
        <div class="checklist-item"><input type="checkbox" id="cl-5"><label for="cl-5">Plan een evaluatiemoment en stuur 1 ding bij</label></div>
      </div>
    </section>`;
  return { heading, html };
}

function ensureBlock(name: 'reflectie' | 'huiswerk'): { heading: string; html: string } {
  if (name === 'reflectie') {
    const heading = '🤔 Reflectie Vragen';
    const html = `
      <section class="ttm-reflectie p-4 sm:p-6 bg-[#121812] rounded-xl border border-[#2a3a22]">
        <h2 class="text-xl font-bold text-[#B6C948] mb-2">🤔 Reflectie Vragen</h2>
        <ol class="list-decimal pl-6 space-y-2 text-[#d6e3c3]">
          <li>Welke keuze uit deze les pas je komende week toe en waarom? Beschrijf concreet hoe je dit uitvoert.</li>
          <li>Waar loop je nu tegenaan en wat is je eerste kleine stap om dit te doorbreken? Noem tijd en plaats.</li>
          <li>Welke belemmerende gedachte vervang je door een actie? Schrijf de nieuwe gedachte en de actie op.</li>
          <li>Welke persoon uit je omgeving kan je hierbij accountable houden en hoe informeer je hem/haar?</li>
          <li>Wat is je evaluatiemoment en welk resultaat verwacht je te zien na 7 dagen?</li>
        </ol>
      </section>`;
    return { heading, html };
  } else {
    const heading = '📝 Huiswerk Opdrachten';
    const html = `
      <section class="ttm-huiswerk p-4 sm:p-6 bg-[#121812] rounded-xl border border-[#2a3a22]">
        <h2 class="text-xl font-bold text-[#B6C948] mb-4">📝 Huiswerk Opdrachten</h2>
        <div class="space-y-4">
          <div class="p-4 rounded-lg bg-[#1a2316] border border-[#33472a]">
            <h3 class="font-semibold text-[#9fbd62] mb-2">Opdracht 1</h3>
            <p><strong>Doel:</strong> Toepassen van 1 concreet principe uit de les in je week.</p>
            <p><strong>Actie:</strong> Plan 3 momenten (datum/tijd) in je agenda en voer ze 7 dagen uit. Schrijf elke dag 2 regels wat je hebt gedaan en wat werkte/niet.</p>
          </div>
          <div class="p-4 rounded-lg bg-[#1a2316] border border-[#33472a]">
            <h3 class="font-semibold text-[#9fbd62] mb-2">Opdracht 2</h3>
            <p><strong>Doel:</strong> Optimaliseren van je omgeving om consistentie te ondersteunen.</p>
            <p><strong>Actie:</strong> Verwijder 2 afleidingen en voeg 2 hulpbronnen toe (bijv. notitiekaart, checklist). Maak een foto of korte notitie als bewijs.</p>
          </div>
          <div class="p-4 rounded-lg bg-[#1a2316] border border-[#33472a]">
            <h3 class="font-semibold text-[#9fbd62] mb-2">Opdracht 3</h3>
            <p><strong>Doel:</strong> Reflectie en bijsturen.</p>
            <p><strong>Actie:</strong> Plan aan het eind van de week 10 minuten reflectie. Noteer: (1) wat werkte, (2) wat niet, (3) 1 aanpassing voor de volgende week.</p>
          </div>
        </div>
      </section>`;
    return { heading, html };
  }
}

// Build comment ranges to detect if a match is inside an HTML comment
function getCommentRanges(html: string): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = [];
  let idx = 0;
  while (idx < html.length) {
    const open = html.indexOf('<!--', idx);
    if (open === -1) break;
    const close = html.indexOf('-->', open + 4);
    const end = close === -1 ? html.length : close + 3;
    ranges.push({ start: open, end });
    idx = end;
  }
  return ranges;
}

function isInsideComment(ranges: Array<{ start: number; end: number }>, pos: number): boolean {
  for (const r of ranges) {
    if (pos >= r.start && pos < r.end) return true;
  }
  return false;
}

function findSectionIndices(html: string, patterns: RegExp[]): { start: number; end: number } | null {
  const commentRanges = getCommentRanges(html);
  for (const pat of patterns) {
    // search all occurrences, not just first
    let lastIndex = 0;
    while (lastIndex < html.length) {
      const m = pat.exec(html.slice(lastIndex));
      if (!m) break;
      const absoluteIndex = lastIndex + (m.index ?? 0);
      // skip matches inside HTML comments
      if (isInsideComment(commentRanges, absoluteIndex)) {
        lastIndex = absoluteIndex + (m[0]?.length || 1);
        continue;
      }
      const start = absoluteIndex;
      const rest = html.slice(start + m[0].length);
      const next = rest.search(/<h[23][^>]*>|<section[^>]*>/i);
      const end = next === -1 ? html.length : start + m[0].length + next;
      return { start, end };
    }
  }
  return null;
}

function getFooterIndex(html: string): number {
  const idx = html.toLowerCase().indexOf('<div class="footer"');
  return idx >= 0 ? idx : -1;
}

async function processFile(filePath: string): Promise<{ updated: boolean; fixes: string[] }> {
  const original = await fs.readFile(filePath, 'utf8');
  let html = original;
  const fixes: string[] = [];

  const strip = (s: string) => stripHtml(s);

  // Reflectie
  {
    const refMatch = findSectionIndices(html, [/reflectie\s*vragen/i, /reflectievragen/i, /<section[^>]*ttm-reflectie/i]);
    const footerIdx = getFooterIndex(html);
    if (refMatch) {
      const block = html.slice(refMatch.start, refMatch.end);
      const chars = strip(block).length;
      if (chars < MIN_SECTION_CHARS || (footerIdx !== -1 && refMatch.start > footerIdx)) {
        const { html: inject } = ensureBlock('reflectie');
        // Remove old and insert before footer if available
        const base = html.slice(0, refMatch.start) + html.slice(refMatch.end);
        if (footerIdx !== -1) {
          const f = getFooterIndex(base);
          html = base.slice(0, f) + inject + base.slice(f);
        } else {
          html = base + inject;
        }
        fixes.push('reflectie_replaced');
      }
    } else {
      const { html: inject } = ensureBlock('reflectie');
      const f = getFooterIndex(html);
      if (f !== -1) html = html.slice(0, f) + inject + html.slice(f);
      else {
        const idx = html.toLowerCase().lastIndexOf('</body>');
        if (idx !== -1) html = html.slice(0, idx) + inject + html.slice(idx);
        else html += inject;
      }
      fixes.push('reflectie_added');
    }
  }

  // Huiswerk
  {
    const hwMatch = findSectionIndices(html, [/huiswerk/i, /opdracht(en)?/i, /<section[^>]*ttm-huiswerk/i]);
    const footerIdx = getFooterIndex(html);
    if (hwMatch) {
      const block = html.slice(hwMatch.start, hwMatch.end);
      const chars = strip(block).length;
      const doel = /\bdoel\s*:/i.test(block);
      const actie = /\bactie\s*:/i.test(block);
      if (chars < MIN_SECTION_CHARS || !(doel && actie) || (footerIdx !== -1 && hwMatch.start > footerIdx)) {
        const { html: inject } = ensureBlock('huiswerk');
        const base = html.slice(0, hwMatch.start) + html.slice(hwMatch.end);
        if (footerIdx !== -1) {
          const f = getFooterIndex(base);
          html = base.slice(0, f) + inject + base.slice(f);
        } else {
          html = base + inject;
        }
        fixes.push('huiswerk_replaced');
      }
    } else {
      const { html: inject } = ensureBlock('huiswerk');
      const f = getFooterIndex(html);
      if (f !== -1) html = html.slice(0, f) + inject + html.slice(f);
      else {
        const idx = html.toLowerCase().lastIndexOf('</body>');
        if (idx !== -1) html = html.slice(0, idx) + inject + html.slice(idx);
        else html += inject;
      }
      fixes.push('huiswerk_added');
    }
  }

  // Deduplicate summary headings (keep first, remove subsequent duplicates)
  {
    const commentRanges = getCommentRanges(html);
    const headingRegex = /<h2[^>]*>\s*[^<]*uitgebreide\s+samenvatting(\s+van\s+de\s+les)?[^<]*<\/h2>/gi;
    let match: RegExpExecArray | null;
    let count = 0;
    const removals: Array<{ start: number; end: number }> = [];
    while ((match = headingRegex.exec(html))) {
      const idx = match.index ?? 0;
      if (isInsideComment(commentRanges, idx)) continue;
      count++;
      if (count > 1) {
        removals.push({ start: idx, end: idx + match[0].length });
      }
    }
    if (removals.length) {
      // Remove from end to start to keep indices valid
      removals.sort((a,b) => b.start - a.start).forEach(r => {
        html = html.slice(0, r.start) + html.slice(r.end);
      });
      fixes.push('summary_headings_deduplicated');
    }
  }

  const updated = html !== original;
  if (updated) await fs.writeFile(filePath, html, 'utf8');
  return { updated, fixes };
}

export async function POST() {
  try {
    const files = await fs.readdir(V2_DIR);
    const targets = files.filter((f) => f.endsWith('.html') && !EXCLUDE_NAMES.has(f));
    const results: any[] = [];
    for (const name of targets) {
      const filePath = path.join(V2_DIR, name);
      const { updated, fixes } = await processFile(filePath);
      results.push({ name, updated, fixes });
    }
    const summary = {
      total: targets.length,
      updated: results.filter(r => r.updated).length,
      reflectie_added: results.filter(r => r.fixes.includes('reflectie_added')).length,
      reflectie_replaced: results.filter(r => r.fixes.includes('reflectie_replaced')).length,
      huiswerk_added: results.filter(r => r.fixes.includes('huiswerk_added')).length,
      huiswerk_replaced: results.filter(r => r.fixes.includes('huiswerk_replaced')).length,
    };
    return NextResponse.json({ success: true, summary, results });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || String(e) }, { status: 500 });
  }
}
