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
  // 1) Find the H2 for the summary
  const h2Regex = /<h2[^>]*>\s*[^<]*uitgebreide\s+samenvatting[^<]*<\/h2>/i;
  const h2Match = h2Regex.exec(html);
  if (!h2Match) return null;
  const h2Start = h2Match.index ?? -1;
  if (h2Start < 0) return null;

  // 2) Walk backwards to find the opening <div class="section"> that contains this H2
  const before = html.slice(0, h2Start);
  const openIdx = before.toLowerCase().lastIndexOf('<div class="section"');
  if (openIdx === -1) return null;

  // 3) From the opening <div>, scan forward counting nested <div> ... </div> to find the matching close
  const rest = html.slice(openIdx);
  let idx = 0;
  let depth = 0;
  let endRel = -1;
  const lower = rest.toLowerCase();
  while (idx < rest.length) {
    const nextOpen = lower.indexOf('<div', idx);
    const nextClose = lower.indexOf('</div>', idx);
    if (nextOpen === -1 && nextClose === -1) break;
    if (nextOpen !== -1 && (nextOpen < nextClose || nextClose === -1)) {
      depth++;
      idx = nextOpen + 4;
      continue;
    }
    if (nextClose !== -1) {
      depth--;
      idx = nextClose + 6;
      if (depth === 0) { endRel = idx; break; }
    }
  }
  if (endRel === -1) return null;
  const sectionHtml = rest.slice(0, endRel);
  // Remove the closing tag of the section itself so we don't inject it
  const closingIdx = sectionHtml.toLowerCase().lastIndexOf('</div>');
  const sectionInnerOnly = closingIdx !== -1 ? sectionHtml.slice(0, closingIdx) : sectionHtml;

  // 4) From end of H2 to before the closing of the section is our inner content
  const h2EndInSection = sectionInnerOnly.indexOf(h2Match[0]) + (h2Match[0]?.length || 0);
  let inner = sectionInnerOnly.slice(h2EndInSection).trim();
  // Clean stray duplicate headings just in case
  inner = inner.replace(/<h2[^>]*>[^<]*uitgebreide\s+samenvatting[^<]*<\/h2>/gi, '').trim();
  return inner;
}

function injectV2Summary(v2html: string, summaryHtml: string): string | null {
  // Depth-accurate replace inside <div class="section" id="samenvatting"> ... </div>
  const startRegex = /<div\s+class=\"section\"\s+id=\"samenvatting\"\s*>/i;
  const h2Regex = /<h2[^>]*>[\s\S]*?<\/h2>/i;
  const startMatch = startRegex.exec(v2html);
  if (!startMatch) return null;
  const startIdx = startMatch.index ?? -1;
  if (startIdx < 0) return null;
  const afterStart = startIdx + (startMatch[0]?.length || 0);
  const rest = v2html.slice(afterStart);
  // Find matching closing </div> from afterStart using depth
  let idx = 0; let depth = 1; let endRel = -1; const lower = rest.toLowerCase();
  while (idx < rest.length) {
    const nextOpen = lower.indexOf('<div', idx);
    const nextClose = lower.indexOf('</div>', idx);
    if (nextOpen === -1 && nextClose === -1) break;
    if (nextOpen !== -1 && (nextOpen < nextClose || nextClose === -1)) { depth++; idx = nextOpen + 4; continue; }
    if (nextClose !== -1) { depth--; idx = nextClose + 6; if (depth === 0) { endRel = idx; break; } }
  }
  if (endRel === -1) return null;
  const sectionBody = rest.slice(0, endRel); // inside the section up to its closing </div>
  const before = v2html.slice(0, afterStart);
  const after = v2html.slice(afterStart + endRel);
  const h2Match = h2Regex.exec(sectionBody);
  if (!h2Match) return null;
  const h2End = (h2Match.index ?? 0) + (h2Match[0]?.length || 0);
  const newSectionBody = sectionBody.slice(0, h2End) + '\n' + summaryHtml + '\n' + sectionBody.slice(h2End).replace(/[\s\S]*$/,'');
  // sectionBody.slice(h2End).replace(/...$/,'') ensures we drop old content after h2 (keep nothing after)
  // Actually, we want only h2 + our summary; closing </div> comes from after concatenation
  const rebuiltSection = sectionBody.slice(0, h2End) + '\n' + summaryHtml + '\n';
  return before + rebuiltSection + after;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = (body?.name as string) || '';
    if (!name || !name.toLowerCase().endsWith('.html')) {
      return NextResponse.json({ success: false, error: 'name must be an .html filename' }, { status: 400 });
    }

    const legacyPath = path.join(LEGACY_DIR, name);
    const v2Path = path.join(V2_DIR, name);

    const legacyExists = await fs.stat(legacyPath).then(() => true).catch(() => false);
    if (!legacyExists) return NextResponse.json({ success: false, error: 'legacy_not_found' }, { status: 404 });
    const v2Exists = await fs.stat(v2Path).then(() => true).catch(() => false);
    if (!v2Exists) return NextResponse.json({ success: false, error: 'v2_not_found' }, { status: 404 });

    const legacyHtml = await fs.readFile(legacyPath, 'utf8');
    const v2Html = await fs.readFile(v2Path, 'utf8');

    const summaryHtml = extractLegacySummary(legacyHtml);
    if (!summaryHtml) {
      return NextResponse.json({ success: false, error: 'summary_not_found_in_legacy' }, { status: 400 });
    }

    const updated = injectV2Summary(v2Html, summaryHtml);
    if (!updated) return NextResponse.json({ success: false, error: 'samenvatting_section_not_found_in_v2' }, { status: 400 });

    if (updated !== v2Html) {
      await fs.writeFile(v2Path, updated, 'utf8');
    }

    return NextResponse.json({ success: true, name, chars: stripHtml(summaryHtml).length });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || String(e) }, { status: 500 });
  }
}
