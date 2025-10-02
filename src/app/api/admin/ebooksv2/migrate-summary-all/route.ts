import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const LEGACY_DIR = path.join(process.cwd(), 'public', 'books');
const V2_DIR = path.join(process.cwd(), 'public', 'ebooksv2');

function stripHtml(s: string): string {
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractLegacySummary(html: string): string | null {
  const h2Regex = /<h2[^>]*>\s*[^<]*uitgebreide\s+samenvatting[^<]*<\/h2>/i;
  const h2Match = h2Regex.exec(html);
  if (!h2Match) return null;
  const h2Start = h2Match.index ?? -1;
  if (h2Start < 0) return null;
  const before = html.slice(0, h2Start);
  const openIdx = before.toLowerCase().lastIndexOf('<div class="section"');
  if (openIdx === -1) return null;
  const rest = html.slice(openIdx);
  let idx = 0; let depth = 0; let endRel = -1; const lower = rest.toLowerCase();
  while (idx < rest.length) {
    const nextOpen = lower.indexOf('<div', idx);
    const nextClose = lower.indexOf('</div>', idx);
    if (nextOpen === -1 && nextClose === -1) break;
    if (nextOpen !== -1 && (nextOpen < nextClose || nextClose === -1)) { depth++; idx = nextOpen + 4; continue; }
    if (nextClose !== -1) { depth--; idx = nextClose + 6; if (depth === 0) { endRel = idx; break; } }
  }
  if (endRel === -1) return null;
  const sectionHtml = rest.slice(0, endRel);
  const closingIdx = sectionHtml.toLowerCase().lastIndexOf('</div>');
  const sectionInnerOnly = closingIdx !== -1 ? sectionHtml.slice(0, closingIdx) : sectionHtml;
  const h2EndInSection = sectionInnerOnly.indexOf(h2Match[0]) + (h2Match[0]?.length || 0);
  let inner = sectionInnerOnly.slice(h2EndInSection).trim();
  inner = inner.replace(/<h2[^>]*>[^<]*uitgebreide\s+samenvatting[^<]*<\/h2>/gi, '').trim();
  return inner;
}

function injectV2Summary(v2html: string, summaryHtml: string): string | null {
  const startRegex = /<div\s+class=\"section\"\s+id=\"samenvatting\"\s*>/i;
  const h2Regex = /<h2[^>]*>[\s\S]*?<\/h2>/i;
  const startMatch = startRegex.exec(v2html);
  if (!startMatch) return null;
  const startIdx = startMatch.index ?? -1;
  if (startIdx < 0) return null;
  const afterStart = startIdx + (startMatch[0]?.length || 0);
  const rest = v2html.slice(afterStart);
  let idx = 0; let depth = 1; let endRel = -1; const lower = rest.toLowerCase();
  while (idx < rest.length) {
    const nextOpen = lower.indexOf('<div', idx);
    const nextClose = lower.indexOf('</div>', idx);
    if (nextOpen === -1 && nextClose === -1) break;
    if (nextOpen !== -1 && (nextOpen < nextClose || nextClose === -1)) { depth++; idx = nextOpen + 4; continue; }
    if (nextClose !== -1) { depth--; idx = nextClose + 6; if (depth === 0) { endRel = idx; break; } }
  }
  if (endRel === -1) return null;
  const sectionBody = rest.slice(0, endRel);
  const before = v2html.slice(0, afterStart);
  const after = v2html.slice(afterStart + endRel);
  const h2Match = h2Regex.exec(sectionBody);
  if (!h2Match) return null;
  const h2End = (h2Match.index ?? 0) + (h2Match[0]?.length || 0);
  const rebuiltSection = sectionBody.slice(0, h2End) + '\n' + summaryHtml + '\n';
  return before + rebuiltSection + after;
}

export async function POST() {
  try {
    const files = await fs.readdir(V2_DIR);
    const targets = files.filter(f => f.toLowerCase().endsWith('.html') && f !== '_template.html');
    const results: Array<{ name: string; updated: boolean; chars?: number; error?: string }> = [];

    for (const name of targets) {
      const legacyPath = path.join(LEGACY_DIR, name);
      const v2Path = path.join(V2_DIR, name);
      const v2Exists = await fs.stat(v2Path).then(() => true).catch(() => false);
      if (!v2Exists) { results.push({ name, updated: false, error: 'v2_not_found' }); continue; }
      const legacyExists = await fs.stat(legacyPath).then(() => true).catch(() => false);
      if (!legacyExists) { results.push({ name, updated: false, error: 'legacy_not_found' }); continue; }
      const legacyHtml = await fs.readFile(legacyPath, 'utf8');
      const v2Html = await fs.readFile(v2Path, 'utf8');
      const summaryHtml = extractLegacySummary(legacyHtml);
      if (!summaryHtml) { results.push({ name, updated: false, error: 'summary_not_found_in_legacy' }); continue; }
      const updatedHtml = injectV2Summary(v2Html, summaryHtml);
      if (!updatedHtml) { results.push({ name, updated: false, error: 'samenvatting_section_not_found_in_v2' }); continue; }
      const updated = updatedHtml !== v2Html;
      if (updated) await fs.writeFile(v2Path, updatedHtml, 'utf8');
      results.push({ name, updated, chars: stripHtml(summaryHtml).length });
    }

    const summary = {
      total: targets.length,
      updated: results.filter(r => r.updated).length,
      missingLegacy: results.filter(r => r.error === 'legacy_not_found').length,
      missingSummary: results.filter(r => r.error === 'summary_not_found_in_legacy').length,
      missingV2Section: results.filter(r => r.error === 'samenvatting_section_not_found_in_v2').length,
    };

    return NextResponse.json({ success: true, summary, results });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || String(e) }, { status: 500 });
  }
}
