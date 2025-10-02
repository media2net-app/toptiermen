import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const V2_DIR = path.join(process.cwd(), 'public', 'ebooksv2');

function extractBetween(html: string, startMarker: string, endMarker: string): string | null {
  const s = html.indexOf(startMarker);
  if (s === -1) return null;
  const e = html.indexOf(endMarker, s + startMarker.length);
  if (e === -1) return null;
  return html.slice(s + startMarker.length, e);
}

function stripHtml(s: string): string {
  return s.replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

async function loadTemplate(): Promise<string> {
  const file = path.join(V2_DIR, '_template.html');
  return await fs.readFile(file, 'utf8');
}

function fillTemplate(tpl: string, params: { lesnaam: string; subtitle: string; moduleLabel: string; lesLabel: string; backLink: string; summaryHtml: string; checklistHtml?: string; reflectieHtml?: string; huiswerkHtml?: string; actionPlanHtml?: string; }): string {
  let out = tpl;
  out = out.replace(/<!-- LESNAAM -->/g, params.lesnaam || '');
  out = out.replace(/<!-- SUBTITLE\/KORTE CLAIM -->/g, params.subtitle || '');
  out = out.replace(/<!-- MODULE_LABEL -->/g, params.moduleLabel || '');
  out = out.replace(/<!-- LES_LABEL -->/g, params.lesLabel || '');
  out = out.replace('<!-- TERUG_LINK_NAAR_LES -->', params.backLink || '#');
  // Inject summary into #samenvatting
  out = out.replace(
    /(<div class="section" id="samenvatting">[\s\S]*?<h2>[^<]*<\/h2>)([\s\S]*?)(<\/div>)/,
    (_m, p1, _p2, p3) => `${p1}\n${params.summaryHtml}\n${p3}`
  );
  // Optional overrides
  if (params.huiswerkHtml) {
    out = out.replace(
      /(<div class="section" id="huiswerk">)[\s\S]*?(<\/div>)/,
      (_m, p1, p2) => `${p1}\n${params.huiswerkHtml}\n${p2}`
    );
  }
  if (params.checklistHtml) {
    out = out.replace(
      /(<div class="section" id="checklists">)[\s\S]*?(<\/div>)/,
      (_m, p1, p2) => `${p1}\n${params.checklistHtml}\n${p2}`
    );
  }
  if (params.reflectieHtml) {
    out = out.replace(
      /(<div class="section" id="reflectie">)[\s\S]*?(<\/div>)/,
      (_m, p1, p2) => `${p1}\n${params.reflectieHtml}\n${p2}`
    );
  }
  if (params.actionPlanHtml) {
    out = out.replace(
      /(<div class="section action-plan" id="actieplan">)[\s\S]*?(<\/div>)/,
      (_m, p1, p2) => `${p1}\n${params.actionPlanHtml}\n${p2}`
    );
  }
  return out;
}

function findInner(html: string, id: string): string | null {
  const re = new RegExp(`(<div class=\\"section\\" id=\\"${id}\\">)([\\s\\S]*?)(<\\/div>)`, 'i');
  const m = re.exec(html);
  if (!m) return null;
  // strip outer structure, return inner content excluding <h2> if present for summary
  return m[2].trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = (body?.name as string) || '';
    if (!name.endsWith('.html')) {
      return NextResponse.json({ success: false, error: 'name must be an .html filename' }, { status: 400 });
    }
    const filePath = path.join(V2_DIR, name);
    const exists = await fs.stat(filePath).then(() => true).catch(() => false);
    if (!exists) return NextResponse.json({ success: false, error: 'file_not_found' }, { status: 404 });

    const tpl = await loadTemplate();
    const html = await fs.readFile(filePath, 'utf8');

    // Extract data from existing file
    const h1Match = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
    const lesnaam = h1Match ? stripHtml(h1Match[1]) : name.replace(/\.html$/, '').replace(/-/g, ' ');
    const subtitleMatch = /<p class=\"subtitle\">([\s\S]*?)<\/p>/i.exec(html);
    const subtitle = subtitleMatch ? stripHtml(subtitleMatch[1]) : '';
    const moduleInfoMatch = /<div class=\"module-info\">([\s\S]*?)<\/div>/i.exec(html);
    const moduleInfo = moduleInfoMatch ? stripHtml(moduleInfoMatch[1]) : '';
    // Split module/les if pipe present
    let moduleLabel = moduleInfo.includes('|') ? moduleInfo.split('|')[0].trim() : moduleInfo;
    let lesLabel = moduleInfo.includes('|') ? moduleInfo.split('|')[1].trim() : '';
    const backMatch = /<a[^>]*class=\"sticky-back-btn\"[^>]*href=\"([^\"]+)\"/i.exec(html);
    const backLink = backMatch ? backMatch[1] : '#';

    // Extract existing sections
    const samenvattingInner = findInner(html, 'samenvatting') || '';
    const checklistInner = findInner(html, 'checklists') || '';
    const reflectieInner = findInner(html, 'reflectie') || '';
    const huiswerkInner = findInner(html, 'huiswerk') || '';
    const actionPlanInner = findInner(html, 'actieplan') || '';

    // Build new HTML based on template
    const out = fillTemplate(tpl, {
      lesnaam,
      subtitle,
      moduleLabel,
      lesLabel,
      backLink,
      summaryHtml: samenvattingInner,
      checklistHtml: checklistInner,
      reflectieHtml: reflectieInner,
      huiswerkHtml: huiswerkInner,
      actionPlanHtml: actionPlanInner,
    });

    await fs.writeFile(filePath, out, 'utf8');
    return NextResponse.json({ success: true, name });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || String(e) }, { status: 500 });
  }
}
