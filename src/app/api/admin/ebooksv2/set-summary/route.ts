import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const V2_DIR = path.join(process.cwd(), 'public', 'ebooksv2');

function injectV2Summary(v2html: string, summaryHtml: string): string | null {
  // Depth-accurate replace inside <div class="section" id="samenvatting"> ... </div>
  // Match the samenvatting section regardless of attribute order/spacing
  const startRegex = /<div[^>]*id=\"samenvatting\"[^>]*>/i;
  const h2Regex = /<h2[^>]*>[\s\S]*?<\/h2>/i;
  const startMatch = startRegex.exec(v2html);
  if (!startMatch) return null;
  const startIdx = startMatch.index ?? -1;
  if (startIdx < 0) return null;
  const afterStart = startIdx + (startMatch[0]?.length || 0);
  const rest = v2html.slice(afterStart);
  // Find matching closing </div> using depth
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
  const rebuiltSection = sectionBody.slice(0, h2End) + '\n' + summaryHtml + '\n';
  return before + rebuiltSection + after;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = (body?.name as string) || '';
    const summaryHtml = (body?.summaryHtml as string) || '';
    if (!name || !name.toLowerCase().endsWith('.html')) {
      return NextResponse.json({ success: false, error: 'name must be an .html filename' }, { status: 400 });
    }
    if (!summaryHtml) {
      return NextResponse.json({ success: false, error: 'summaryHtml required' }, { status: 400 });
    }

    const v2Path = path.join(V2_DIR, name);
    const v2Exists = await fs.stat(v2Path).then(() => true).catch(() => false);
    if (!v2Exists) return NextResponse.json({ success: false, error: 'v2_not_found' }, { status: 404 });

    const v2Html = await fs.readFile(v2Path, 'utf8');
    const updatedHtml = injectV2Summary(v2Html, summaryHtml);
    if (!updatedHtml) return NextResponse.json({ success: false, error: 'samenvatting_section_not_found_in_v2' }, { status: 400 });

    if (updatedHtml !== v2Html) await fs.writeFile(v2Path, updatedHtml, 'utf8');

    return NextResponse.json({ success: true, name, bytes: Buffer.byteLength(summaryHtml, 'utf8') });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || String(e) }, { status: 500 });
  }
}
