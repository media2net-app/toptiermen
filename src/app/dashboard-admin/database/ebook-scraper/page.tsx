"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type EbookItem = { url: string; module: string };

type SaveResult = {
  url: string;
  ok: boolean;
  id?: string;
  error?: string;
  found?: boolean;
  title?: string;
};

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

const MODULES: Record<string, string[]> = {
  "MODULE 1: Testosteron": [
    "/ebooks/wat-is-testosteron.html",
    "/ebooks/de-kracht-van-hoog-testosteron.html",
    "/ebooks/testosteron-killers-wat-moet-je-elimineren.html",
    "/ebooks/de-waarheid-over-testosteron-doping.html",
    "/ebooks/trt-en-mijn-visie.html",
  ],
  "MODULE 2: Discipline & Identiteit": [
    "/ebooks/de-basis-van-discipline.html",
    "/ebooks/militaire-discipline.html",
    "/ebooks/discipline-van-korte-termijn-naar-een-levensstijl.html",
    "/ebooks/wat-is-identiteit-en-waarom-zijn-kernwaarden-essentieel.html",
    "/ebooks/ontdek-je-kernwaarden-en-bouw-je-top-tier-identiteit.html",
  ],
  "MODULE 3: Fysieke Dominantie": [
    "/ebooks/waarom-is-fysieke-dominantie-zo-belangrijk.html",
    "/ebooks/het-belang-van-kracht-spiermassa-en-conditie.html",
    "/ebooks/status-zelfrespect-en-aantrekkingskracht.html",
    "/ebooks/vitaliteit-en-levensduur.html",
    "/ebooks/embrace-the-suck.html",
  ],
  "MODULE 4: Mentale Kracht & Weerbaarheid": [
    "/ebooks/wat-is-mentale-kracht.html",
    "/ebooks/een-onbreekbare-mindset.html",
    "/ebooks/mentale-weerbaarheid-in-de-praktijk.html",
    "/ebooks/wordt-een-onbreekbare-man.html",
  ],
  "MODULE 5: Business & Finance": [
    "/ebooks/de-financile-mindset.html",
    "/ebooks/grip-op-je-geld.html",
    "/ebooks/van-werknemer-naar-eigen-verdienmodellen.html",
    "/ebooks/vermogen-opbouwen-begin-met-investeren.html",
    "/ebooks/financile-vrijheid-en-legacy.html",
  ],
  "MODULE 6: Brotherhood": [
    "/ebooks/waarom-een-brotherhood.html",
    "/ebooks/eer-en-loyaliteit.html",
    "/ebooks/bouw-de-juiste-kring.html",
    "/ebooks/cut-the-weak.html",
    "/ebooks/hoe-je-je-broeders-versterkt-en-samen-groeit.html",
  ],
  "MODULE 7: Voeding & Gezondheid": [
    "/ebooks/de-basisprincipes-van-voeding.html",
    "/ebooks/hydratatie-en-water-inname.html",
    "/ebooks/slaap-de-vergeten-superkracht.html",
    "/ebooks/energie-en-focus.html",
    "/ebooks/gezondheid-als-fundament.html",
  ],
};

export default function EbookScraperPage() {
  const allItems = useMemo<EbookItem[]>(() => {
    const items: EbookItem[] = [];
    Object.entries(MODULES).forEach(([module, urls]) => {
      urls.forEach((u) => items.push({ url: u, module }));
    });
    return items;
  }, []);

  // Core state
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SaveResult[]>([]);
  const [stored, setStored] = useState<Record<string, StoredItem>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [v2files, setV2files] = useState<{name: string; url: string}[]>([]);
  const [v2Compliance, setV2Compliance] = useState<Record<string, { ok: boolean; layout: boolean; parts: { summary: boolean; checklist: boolean; huiswerk: boolean; reflectie: boolean }; details: string }>>({});
  // Final check state for V2 ebooks
  const [finalChecking, setFinalChecking] = useState(false);
  const [finalCheckResults, setFinalCheckResults] = useState<Record<string, {
    summaryOk: boolean;
    nlOk: boolean;
    simpleOk: boolean;
    checklistOk: boolean;
    reflectOk: boolean;
    homeworkOk: boolean;
    duplicateTitle: boolean;
    templateOk?: boolean;
    backLinkOk?: boolean;
    backHref?: string;
    headerOk?: boolean;
    headerInfo?: { h1?: string; module?: string; les?: string };
  }>>({});

  // ===== Final Check Helpers (V2 ebooks) =====
  const isLikelyDutch = (text: string) => {
    const common = ['de','het','een','en','van','te','ik','je','jij','we','wij','niet','met','voor','naar','zijn','hebben','dit','dat','om','als','ook','maar','dan','wat','hoe','waar','zijn','worden','doel'];
    const words = text.toLowerCase().match(/[a-zà-ÿ']+/g) || [];
    if (words.length < 50) return false;
    const hits = words.filter(w => common.includes(w)).length;
    return hits / words.length > 0.04;
  };

  const isSimpleText = (text: string) => {
    const sentences = text.split(/[.!?]\s+/).filter(Boolean);
    if (sentences.length === 0) return false;
    const words = text.split(/\s+/).filter(Boolean);
    const avgLen = words.length / sentences.length;
    const complex = words.filter(w => w.replace(/[^a-zA-Zà-ÿ']/g,'').length >= 13).length;
    const complexRatio = complex / Math.max(words.length, 1);
    return avgLen <= 18 && complexRatio <= 0.12;
  };

  const extractSection = (html: string, headingRegex: RegExp) => {
    const text = html.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'');
    const plain = text.replace(/<[^>]+>/g, '\n');
    const lines = plain.split(/\n+/).map(l => l.trim()).filter(Boolean);
    let idx = lines.findIndex(l => headingRegex.test(l));
    if (idx === -1) return '';
    const out: string[] = [];
    for (let i = idx + 1; i < lines.length; i++) {
      const l = lines[i];
      if (/^(inleiding|hoofdstuk|samenvatting|reflectie|reflectievragen|checklist|huiswerk|opdrachten|conclusie)\b/i.test(l)) break;
      out.push(l);
      if (out.join(' ').length > 12000) break;
    }
    return out.join('\n');
  };

  const countListItems = (html: string, sectionRegex: RegExp) => {
    const section = extractSection(html, sectionRegex) || '';
    const items1 = (section.match(/<li[\s\S]*?<\/li>/gi) || []).map(s => s.replace(/<[^>]+>/g,'').trim()).filter(Boolean);
    const items2 = section.split(/\n+/).filter(l => /^(\-|\*|\d+\.|Stap\s+\d+)/i.test(l.trim()));
    const combined = [...items1, ...items2].map(s => s.trim()).filter(Boolean);
    const placeholderRegex = /^(Stap\s*1|Opdracht\s*1|Reflectievraag\s*1)$/i;
    const exampleRegex = /voor(b| )?beeld\s*checklist\s*item/i;
    const nonTrivialItems = combined.filter(s => s.length >= 30 && !placeholderRegex.test(s) && !exampleRegex.test(s));
    const totalChars = (nonTrivialItems.join(' ').trim()).length;
    const plainSection = section.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
    const doelCount = (plainSection.match(/\bdoel\s*:/gi) || []).length;
    const actieCount = (plainSection.match(/\bactie\s*:/gi) || []).length;
    return { total: combined.length, nonTrivial: nonTrivialItems.length, chars: totalChars, sectionChars: plainSection.length, doelCount, actieCount };
  };

  const analyzeHtml = (html: string) => {
    const plain = html.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ');
    const plainCollapsed = plain.replace(/\s+/g,' ').trim();
    const summaryText = extractSection(html, /samenvatting|uitgebreide\s+samenvatting/i);
    // V2 ebooks hoeven GEEN ~10k samenvatting te hebben. Markeer als OK zodra er
    // een samenvattingssectie aanwezig is met minimale inhoud.
    const summaryOk = (summaryText || '').trim().length >= 30;
    const nlOk = isLikelyDutch(plainCollapsed);
    const simpleOk = isSimpleText(plainCollapsed);
    const checklistInfo = countListItems(html, /checklist/i);
    const checklistOk = checklistInfo.nonTrivial >= 1 && (checklistInfo.sectionChars >= 200 || checklistInfo.chars >= 200);
    const reflectText = extractSection(html, /reflectievragen|reflectie/i);
    const reflectOk = reflectText.length >= 200 && ((reflectText.match(/\?/g) || []).length >= 2);
    const homeworkInfo = countListItems(html, /huiswerk|opdracht/i);
    const hwSectionLen = extractSection(html, /huiswerk|opdracht/i).length;
    const doelActiePairs = Math.min(homeworkInfo.doelCount || 0, homeworkInfo.actieCount || 0);
    const homeworkOk = (homeworkInfo.sectionChars >= 200 || hwSectionLen >= 200) && (homeworkInfo.nonTrivial >= 1 || doelActiePairs >= 1);
    // Duplicate title check for the summary heading
    let duplicateTitle = false;
    // Template checks
    let templateOk = false;
    let backLinkOk = false;
    let backHref: string | undefined = undefined;
    let headerOk = false;
    let headerInfo: { h1?: string; module?: string; les?: string } = {};
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const headingPattern = /uitgebreide\s+samenvatting(\s+van\s+de\s+les)?/i;
      const headings = Array.from(doc.querySelectorAll('h1, h2, h3'))
        .map(h => (h.textContent || '').trim())
        .filter(t => headingPattern.test(t));
      duplicateTitle = headings.length >= 2;

      const hasHeader = !!doc.querySelector('.header, header');
      const hasFooter = !!doc.querySelector('.footer, footer');
      const backEl = doc.querySelector('a.sticky-back-btn') as HTMLAnchorElement | null;
      backHref = (backEl?.getAttribute('href') || '').trim();
      const hasBack = !!backEl || Array.from(doc.querySelectorAll('a, button')).some(el => /terug|back/i.test(el.textContent || ''));
      const hasSections = ['samenvatting','huiswerk','checklists','reflectie'].every(id => !!doc.querySelector(`#${id}`));
      const hasMarkers = /<!--\s*Uitgebreide Samenvatting:\s*1:1 OVERNEMEN\s*\(NIET WIJZIGEN\)\s*-->/.test(html) &&
                         /<!--\s*Markeer deze sectie exact en wijzig de tekst niet\./i.test(html);
      // Header content validation
      const h1 = (doc.querySelector('.header h1, header h1')?.textContent || '').trim();
      const modInfo = (doc.querySelector('.header .module-info, header .module-info')?.textContent || '').trim();
      const parts = modInfo.split('|').map(p => p.trim());
      const moduleLabel = parts[0] || '';
      const lesLabel = parts[1] || '';
      headerInfo = { h1, module: moduleLabel, les: lesLabel };
      const modFmt = /^Module\s+\d{2}:\s+.+/i.test(moduleLabel) && !/n\.b\./i.test(moduleLabel);
      const lesFmt = /^Les\s+\d{2}:\s+.+/i.test(lesLabel) && !/n\.b\./i.test(lesLabel);
      headerOk = h1.length >= 5 && modFmt && lesFmt;

      templateOk = hasHeader && hasFooter && hasBack && hasSections && hasMarkers && headerOk;
      // Back-link rule: must not be '#' and must start with /dashboard/academy/
      backLinkOk = !!backHref && backHref !== '#' && /^\/dashboard\/academy\//.test(backHref);
    } catch {}
    return { summaryOk, nlOk, simpleOk, checklistOk, reflectOk, homeworkOk, duplicateTitle, templateOk, backLinkOk, backHref, headerOk, headerInfo };
  };

  const runFinalCheck = async () => {
    if (!v2FilesForFinalCheck.length) return;
    setFinalChecking(true);
    try {
      const results: Record<string, any> = {};
      const batch = 8;
      for (let i = 0; i < v2FilesForFinalCheck.length; i += batch) {
        const slice = v2FilesForFinalCheck.slice(i, i + batch);
        const fetched = await Promise.allSettled(slice.map(async (f) => {
          const res = await fetch(f.url, { cache: 'no-store' });
          const html = await res.text();
          return { url: f.url, checks: analyzeHtml(html) };
        }));
        fetched.forEach(item => {
          if (item.status === 'fulfilled') results[item.value.url] = item.value.checks;
        });
        setFinalCheckResults(prev => ({ ...prev, ...results }));
      }
    } finally {
      setFinalChecking(false);
    }
  };

  const v2FilesForFinalCheck = useMemo(() => {
    const exclude = [/^\.?tmp_eer_loyaliteit_summary\.html$/i, /^_template\.html$/i];
    return v2files.filter(f => !exclude.some(rx => rx.test(f.name)));
  }, [v2files]);

  const finalStats = useMemo(() => {
    const urls = v2FilesForFinalCheck.map(f => f.url);
    let processed = 0, summaryOk = 0, nlOk = 0, simpleOk = 0, checklistOk = 0, reflectOk = 0, homeworkOk = 0, fullyOk = 0;
    urls.forEach(u => {
      const r = finalCheckResults[u];
      if (!r) return;
      processed++;
      if (r.summaryOk) summaryOk++;
      if (r.nlOk) nlOk++;
      if (r.simpleOk) simpleOk++;
      if (r.checklistOk) checklistOk++;
      if (r.reflectOk) reflectOk++;
      if (r.homeworkOk) homeworkOk++;
      if (r.summaryOk && r.nlOk && r.simpleOk && r.checklistOk && r.reflectOk && r.homeworkOk) fullyOk++;
    });
    return { total: urls.length, processed, summaryOk, nlOk, simpleOk, checklistOk, reflectOk, homeworkOk, fullyOk };
  }, [v2FilesForFinalCheck, finalCheckResults]);

  // Basic fuzzy matching helpers (ensure declared before usage)
  const normalizeSlug = (s: string) => s
    .toLowerCase()
    .replace(/\.html$/i, '')
    .replace(/[^a-z0-9\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$|_/g, '');

  const tokenize = (s: string) => {
    const stop = new Set(['de','het','een','en','of','voor','met','naar','van','in','op','tot','aan','door','te','mijn','jouw','kort','korte','termijn','levensstijl','deze']);
    return normalizeSlug(s)
      .split('-')
      .filter(t => t && !stop.has(t) && t.length > 1);
  };

  const jaccard = (a: string[] | string, b: string[] | string) => {
    const A = Array.isArray(a) ? a : tokenize(a);
    const B = Array.isArray(b) ? b : tokenize(b);
    const setA = new Set(A);
    const setB = new Set(B);
    const inter = [...setA].filter(x => setB.has(x)).length;
    const uni = new Set([...A, ...B]).size;
    return uni === 0 ? 0 : inter / uni;
  };

  // Helper to extract slug/filename (used by module matching)
  const getSlug = (url: string) => {
    try {
      const u = new URL(url, window.location.origin);
      const parts = u.pathname.split('/');
      const file = parts[parts.length - 1];
      return file.replace(/\.html$/i, '');
    } catch {
      const path = url.split('?')[0];
      const parts = path.split('/');
      const file = parts[parts.length - 1];
      return file.replace(/\.html$/i, '');
    }
  };

  // Group V2 files by module using fuzzy matching against MODULES definitions
  const getBestModuleForV2 = (v2name: string): { module: string | null, score: number } => {
    const v2tokens = tokenize(v2name.replace(/\.html$/i, ''));
    let best: { module: string | null, score: number } = { module: null, score: 0 };
    for (const [module, urls] of Object.entries(MODULES)) {
      for (const u of urls) {
        const slug = getSlug(u);
        const score = jaccard(v2tokens, tokenize(slug));
        if (score > best.score) best = { module, score };
      }
    }
    return best;
  };

  const groupedV2 = useMemo(() => {
    const order = Object.keys(MODULES);
    const map: Record<string, { name: string, items: {name: string; url: string}[] }> = {};
    order.forEach(m => { map[m] = { name: m, items: [] }; });
    const other: {name: string; url: string}[] = [];
    v2FilesForFinalCheck.forEach(f => {
      const best = getBestModuleForV2(f.name);
      if (best.module && best.score >= 0.35) map[best.module].items.push(f);
      else other.push(f);
    });
    return { order, groups: map, other };
  }, [v2FilesForFinalCheck]);

  

  const charCount = (url: string) => {
    const s = stored[url];
    if (!s) return 0;
    return (s.summary_text || '')?.length || 0;
  };

  // (moved) useEffect is defined later after helpers

  // Helpers to map /ebooks/ to /ebooksv2/

  const v2BySlug = useMemo(() => {
    const map: Record<string, string> = {};
    v2files.forEach(f => {
      const slug = f.name.replace(/\.html$/i, '');
      map[slug] = f.url;
    });
    return map;
  }, [v2files]);

  // Check if a given V2 ebook page follows the template and has content sections filled
  const checkV2Template = async (url: string) => {
    if (!url || v2Compliance[url]) return; // cached
    try {
      const res = await fetch(url, { cache: 'no-store' });
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Layout checks
      const headerPresent = !!doc.querySelector('header, .header, .ttm-header');
      const footerPresent = !!doc.querySelector('footer, .footer, .ttm-footer');
      const backBtn = Array.from(doc.querySelectorAll('a, button')).some(el => /terug|back/i.test(el.textContent || ''));

      // Section helpers
      const getSectionContentLength = (pattern: RegExp) => {
        const h2 = Array.from(doc.querySelectorAll('h2, h3')).find(h => pattern.test((h.textContent || '').toLowerCase()));
        if (!h2) return 0;
        // Try next sibling or parent section
        let container: Element | null = h2.nextElementSibling as Element | null;
        if (!container || container.tagName.toLowerCase() === 'h2' || container.tagName.toLowerCase() === 'h3') {
          container = h2.parentElement;
        }
        const text = (container?.textContent || '').trim();
        return text.length;
      };

      const summaryLen = getSectionContentLength(/uitgebreide\s+samenvatting/);
      const checklistLen = getSectionContentLength(/checklist/);
      const huiswerkLen = getSectionContentLength(/huiswerk/);
      const reflectieLen = getSectionContentLength(/reflectie\s*vragen|reflectievragen|reflectie/);

      const parts = {
        summary: summaryLen > 30,
        checklist: checklistLen > 10,
        huiswerk: huiswerkLen > 10,
        reflectie: reflectieLen > 10,
      };

      const layout = headerPresent && footerPresent && backBtn;
      const ok = layout && parts.summary && parts.checklist && parts.huiswerk && parts.reflectie;
      const missing: string[] = [];
      if (!headerPresent) missing.push('header');
      if (!footerPresent) missing.push('footer');
      if (!backBtn) missing.push('terug-knop');
      if (!parts.summary) missing.push('samenvatting');
      if (!parts.checklist) missing.push('checklist');
      if (!parts.huiswerk) missing.push('huiswerk');
      if (!parts.reflectie) missing.push('reflectie');

      setV2Compliance(prev => ({
        ...prev,
        [url]: {
          ok,
          layout,
          parts,
          details: missing.length ? `Ontbreekt: ${missing.join(', ')}` : 'OK'
        }
      }));
    } catch (e: any) {
      setV2Compliance(prev => ({
        ...prev,
        [url]: { ok: false, layout: false, parts: { summary: false, checklist: false, huiswerk: false, reflectie: false }, details: e?.message || 'check failed' }
      }));
    }
  };

  // match stats will be computed after maps/functions are defined

  const findFuzzyV2 = (ebookUrl: string): { url: string; score: number } | null => {
    const slug = getSlug(ebookUrl);
    const exact = v2BySlug[slug];
    if (exact) return { url: exact, score: 1 };
    const a = tokenize(slug);
    let best: { url: string; score: number } | null = null;
    for (const f of v2files) {
      const b = tokenize(f.name.replace(/\.html$/i, ''));
      const score = jaccard(a, b);
      if (!best || score > best.score) best = { url: f.url, score };
    }
    if (best && best.score >= 0.35) return best; // threshold
    return null;
  };

  // Now safe to compute match stats (after v2BySlug and findFuzzyV2 are defined)
  const allEbookUrls = useMemo(() => Object.values(MODULES).flat(), []);
  const isMatched = (u: string) => {
    const slug = getSlug(u);
    if (v2BySlug[slug]) return true;
    const f = findFuzzyV2(u);
    return !!f;
  };
  const matchedCount = useMemo(
    () => allEbookUrls.filter((u) => isMatched(u)).length,
    [allEbookUrls, v2BySlug, v2files]
  );

  const createTable = async () => {
    const res = await fetch("/api/admin/ebook-summaries/table", { method: "POST" });
    const json = await res.json();
    alert(json.success ? "Tabel aangemaakt/gecontroleerd" : `Fout: ${json.error}`);
  };

  const fetchStored = async () => {
    try {
      const res = await fetch("/api/admin/ebook-summaries?include=html", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        const map: Record<string, StoredItem> = {};
        (json.items as StoredItem[]).forEach((it) => {
          map[it.url] = it;
        });
        setStored(map);
      }
    } catch (e) {
      console.warn("Fetch stored summaries failed", e);
    }
  };

  useEffect(() => {
    fetchStored();
    // fetch ebooksv2 directory listing
    (async () => {
      try {
        const res = await fetch('/api/admin/ebooksv2/list');
        const json = await res.json();
        if (json.success) setV2files(json.items || []);
      } catch {}
    })();
  }, []);

  const scrapeOne = async (item: EbookItem): Promise<SaveResult> => {
    try {
      const res = await fetch(item.url, { cache: "no-store" });
      const html = await res.text();

      // Parse HTML in browser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const title = doc.querySelector("h1")?.textContent?.trim() || "";

      // Prefer #samenvatting block if present
      const summarySection = doc.querySelector("#samenvatting") ||
        Array.from(doc.querySelectorAll("h2")).find(h2 => h2.textContent?.includes("📚 Uitgebreide Samenvatting"))?.parentElement;

      if (!summarySection) {
        return { url: item.url, ok: false, error: "Samenvatting sectie niet gevonden", title };
      }

      const summaryHtml = summarySection.innerHTML.trim();
      const summaryText = summarySection.textContent?.trim() || "";

      const save = await fetch("/api/admin/ebook-summaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: item.url,
          module: item.module,
          title,
          summary_html: summaryHtml,
          summary_text: summaryText,
        }),
      });
      const saveJson = await save.json();
      if (!save.ok || !saveJson.success) {
        return { url: item.url, ok: false, error: saveJson.error || String(save.status), title };
      }
      return { url: item.url, ok: true, id: saveJson.id, title, found: true };
    } catch (e: any) {
      return { url: item.url, ok: false, error: e?.message || String(e) };
    }
  };

  const runAll = async () => {
    setIsRunning(true);
    setResults([]);
    const out: SaveResult[] = [];
    for (const item of allItems) {
      // eslint-disable-next-line no-await-in-loop
      const r = await scrapeOne(item);
      out.push(r);
      setResults([...out]);
    }
    setIsRunning(false);
    // refresh stored after scraping
    fetchStored();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#8BAE5A]">Ebook Scraper</h1>
        <div className="flex gap-2">
          <button
            onClick={createTable}
            className="px-3 py-2 rounded bg-[#232D1A] border border-[#3A4D23] text-[#B6C948] hover:bg-[#2A2A2A]"
          >
            Maak/controleer tabel
          </button>
          <button
            onClick={runAll}
            disabled={isRunning}
            className="px-3 py-2 rounded bg-[#8BAE5A] text-[#181F17] hover:bg-[#B6C948] disabled:opacity-50"
          >
            {isRunning ? "Bezig..." : "Scrape Alle"}
          </button>
        </div>
      </div>

      {/* Final Check Dashboard (V2) */}
      <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[#8BAE5A]">Final check – overzicht (V2)</h2>
          <button
            onClick={runFinalCheck}
            disabled={finalChecking || v2files.length === 0}
            className="px-3 py-2 rounded bg-[#B6C948] text-[#181F17] hover:bg-[#8BAE5A] disabled:opacity-50"
          >
            {finalChecking ? 'Bezig…' : 'Ververs status'}
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="bg-[#0F1419] border border-[#3A4D23] rounded-md p-3 text-center">
            <div className="text-xs text-[#B6C948]">Totaal</div>
            <div className="text-lg font-semibold text-white">{finalStats.total}</div>
          </div>
          <div className="bg-[#0F1419] border border-[#3A4D23] rounded-md p-3 text-center">
            <div className="text-xs text-[#B6C948]">Verwerkt</div>
            <div className="text-lg font-semibold text-white">{finalStats.processed}</div>
          </div>
          <div className="bg-[#0F1419] border border-[#3A4D23] rounded-md p-3 text-center">
            <div className="text-xs text-[#B6C948]">Volledig OK</div>
            <div className="text-lg font-semibold text-green-400">{finalStats.fullyOk}</div>
          </div>
          <div className="bg-[#0F1419] border border-[#3A4D23] rounded-md p-3 text-center">
            <div className="text-xs text-[#B6C948]">Samenvatting OK</div>
            <div className="text-lg font-semibold text-white">{finalStats.summaryOk}</div>
          </div>
          <div className="bg-[#0F1419] border border-[#3A4D23] rounded-md p-3 text-center">
            <div className="text-xs text-[#B6C948]">Nederlands OK</div>
            <div className="text-lg font-semibold text-white">{finalStats.nlOk}</div>
          </div>
          <div className="bg-[#0F1419] border border-[#3A4D23] rounded-md p-3 text-center">
            <div className="text-xs text-[#B6C948]">Simpel OK</div>
            <div className="text-lg font-semibold text-white">{finalStats.simpleOk}</div>
          </div>
          <div className="bg-[#0F1419] border border-[#3A4D23] rounded-md p-3 text-center">
            <div className="text-xs text-[#B6C948]">Checklist OK</div>
            <div className="text-lg font-semibold text-white">{finalStats.checklistOk}</div>
          </div>
          <div className="bg-[#0F1419] border border-[#3A4D23] rounded-md p-3 text-center">
            <div className="text-xs text-[#B6C948]">Reflectie / Huiswerk</div>
            <div className="text-lg font-semibold text-white">{finalStats.reflectOk}/{finalStats.homeworkOk}</div>
          </div>
        </div>
      </div>

      {/* Final Check Table (V2) */}
      <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-4 overflow-x-auto">
        <h3 className="text-md font-semibold text-[#B6C948] mb-2">Final check per ebook (V2)</h3>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-[#B6C948]">
              <th className="p-2">Ebook (url)</th>
              <th className="p-2">Samenvatting sectie</th>
              <th className="p-2">Nederlands</th>
              <th className="p-2">Simpel/Doelgericht</th>
              <th className="p-2">Checklist inhoud</th>
              <th className="p-2">Reflectie inhoud</th>
              <th className="p-2">Huiswerk inhoud</th>
              <th className="p-2">Dubbele titel</th>
              <th className="p-2">Template</th>
              <th className="p-2">Terug-link</th>
              <th className="p-2">Header</th>
            </tr>
          </thead>
          <tbody>
            {/* Render per module in the defined order */}
            {groupedV2.order.map(module => (
              <React.Fragment key={`hdr-${module}`}>
                {groupedV2.groups[module].items.length > 0 && (
                  <tr className="bg-[#0F1419]">
                    <td className="p-2 text-[#B6C948] font-semibold" colSpan={11}>{module}</td>
                  </tr>
                )}
                {groupedV2.groups[module].items.map(f => {
                  const r = finalCheckResults[f.url];
                  const Cell = ({ ok }: { ok: boolean | undefined }) => (
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${ok === true ? 'bg-green-100 text-green-800' : ok === false ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                      {ok === true ? '✓' : ok === false ? '✕' : '…'}
                    </span>
                  );
                  return (
                    <tr key={f.url} className="border-t border-[#232D1A]">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Link href={f.url} target="_blank" className="text-[#8BAE5A] hover:underline break-all">{f.url}</Link>
                          <a href={f.url} target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 rounded border border-[#3A4D23] bg-[#232D1A] hover:bg-[#2A2A2A] text-xs text-[#B6C948] whitespace-nowrap" title="Open preview in nieuw tabblad">Preview</a>
                        </div>
                      </td>
                      <td className="p-2"><Cell ok={r?.summaryOk} /></td>
                      <td className="p-2"><Cell ok={r?.nlOk} /></td>
                      <td className="p-2"><Cell ok={r?.simpleOk} /></td>
                      <td className="p-2"><Cell ok={r?.checklistOk} /></td>
                      <td className="p-2"><Cell ok={r?.reflectOk} /></td>
                      <td className="p-2"><Cell ok={r?.homeworkOk} /></td>
                      <td className="p-2"><Cell ok={r?.duplicateTitle === false} /></td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Cell ok={r?.templateOk} />
                          {r && r.templateOk === false && (
                            <span className="text-[10px] text-gray-400" title="Moet de exacte _template.html structuur + markers bevatten">details</span>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <span title={r?.backHref || ''}>
                          <Cell ok={r?.backLinkOk} />
                        </span>
                      </td>
                      <td className="p-2">
                        <span title={`h1: ${r?.headerInfo?.h1 || ''}\n${r?.headerInfo?.module || ''} | ${r?.headerInfo?.les || ''}`}>
                          <Cell ok={r?.headerOk} />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
            {/* Render unmatched as Overig */}
            {groupedV2.other.length > 0 && (
              <tr className="bg-[#0F1419]"><td className="p-2 text-[#B6C948] font-semibold" colSpan={11}>Overig</td></tr>
            )}
            {groupedV2.other.map(f => {
              const r = finalCheckResults[f.url];
              const Cell = ({ ok }: { ok: boolean | undefined }) => (
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${ok === true ? 'bg-green-100 text-green-800' : ok === false ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                  {ok === true ? '✓' : ok === false ? '✕' : '…'}
                </span>
              );
              return (
                <tr key={f.url} className="border-t border-[#232D1A]">
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <Link href={f.url} target="_blank" className="text-[#8BAE5A] hover:underline break-all">{f.url}</Link>
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 rounded border border-[#3A4D23] bg-[#232D1A] hover:bg-[#2A2A2A] text-xs text-[#B6C948] whitespace-nowrap"
                        title="Open preview in nieuw tabblad"
                      >
                        Preview
                      </a>
                    </div>
                  </td>
                  <td className="p-2"><Cell ok={r?.summaryOk} /></td>
                  <td className="p-2"><Cell ok={r?.nlOk} /></td>
                  <td className="p-2"><Cell ok={r?.simpleOk} /></td>
                  <td className="p-2"><Cell ok={r?.checklistOk} /></td>
                  <td className="p-2"><Cell ok={r?.reflectOk} /></td>
                  <td className="p-2"><Cell ok={r?.homeworkOk} /></td>
                  <td className="p-2"><Cell ok={r?.duplicateTitle === false} /></td>
                  <td className="p-2"><Cell ok={r?.templateOk} /></td>
                  <td className="p-2"><span title={r?.backHref || ''}><Cell ok={r?.backLinkOk} /></span></td>
                  <td className="p-2"><span title={`h1: ${r?.headerInfo?.h1 || ''}\n${r?.headerInfo?.module || ''} | ${r?.headerInfo?.les || ''}`}><Cell ok={r?.headerOk} /></span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="text-sm text-gray-300 space-y-1">
        <div>Validatie: controleert of een <code>📚 Uitgebreide Samenvatting van de Les</code> sectie aanwezig is (geen ~10k-tekens meer vereist).</div>
        <div>Status: groene ✅ betekent dat de sectie en overige onderdelen voldoen; klik "Preview" voor weergave.</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(MODULES).map(([module, urls]) => (
          <div key={module} className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
            <h2 className="text-lg font-semibold text-[#B6C948] mb-2">{module}</h2>
            <ul className="space-y-2 text-sm">
              {urls.map((u) => {
                const r = results.find((x) => x.url === u);
                const s = stored[u];
                return (
                  <li key={u} className="flex items-center justify-between gap-2">
                    <Link href={u} target="_blank" className="text-[#8BAE5A] hover:underline break-all">
                      {u}
                    </Link>
                    <div className="flex items-center gap-3 text-xs">
                      <span>
                        {r ? (r.ok ? "✅ scrape" : "❌ scrape") : "⏳ scrape"}
                        {r?.title ? ` • ${r.title}` : ""}
                        {r?.error ? ` • ${r.error}` : ""}
                      </span>
                      <span className={s ? "text-[#8BAE5A]" : "text-red-400"}>
                        {s ? `✅ opgeslagen • ${charCount(u)} tekens` : "— niet in DB"}
                      </span>
                      {s && (
                        <button
                          onClick={() => setPreviewUrl(u)}
                          className="px-2 py-1 rounded border border-[#3A4D23] bg-[#232D1A] hover:bg-[#2A2A2A]"
                        >
                          Preview
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewUrl && stored[previewUrl] && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <div className="bg-[#181F17] border border-[#3A4D23] rounded-xl max-w-4xl w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-[#3A4D23] flex items-center justify-between">
              <div className="text-[#B6C948] font-semibold">{stored[previewUrl].title || previewUrl}</div>
              <button className="text-gray-300 hover:text-white" onClick={() => setPreviewUrl(null)}>✕</button>
            </div>
            <div className="p-4 prose prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: stored[previewUrl].summary_html || '' }} />
            </div>
          </div>
        </div>
      )}

      {/* EBOOKSV2 SECTION */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-[#8BAE5A] mb-3">Ebooks V2 (public/ebooksv2)</h2>
        <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
          {v2files.length === 0 ? (
            <div className="text-sm text-gray-400">Geen HTML bestanden gevonden in <code>/public/ebooksv2/</code>.</div>
          ) : (
            <ul className="space-y-2 text-sm">
              {v2files.map((f) => {
                const s = stored[f.url];
                return (
                  <li key={f.url} className="flex items-center justify-between gap-2">
                    <Link href={f.url} target="_blank" className="text-[#8BAE5A] hover:underline break-all">
                      {f.url}
                    </Link>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={async () => {
                          // scrape single v2 file using same logic
                          const r = await scrapeOne({ url: f.url, module: 'Ebooks V2' });
                          setResults((prev) => {
                            const next = prev.filter(x => x.url !== f.url);
                            return [...next, r];
                          });
                          fetchStored();
                        }}
                        className="px-2 py-1 rounded bg-[#232D1A] border border-[#3A4D23] hover:bg-[#2A2A2A] text-xs"
                      >
                        Scrape
                      </button>
                      <span className={`text-xs ${s ? 'text-[#8BAE5A]' : 'text-red-400'}`}>
                        {s ? `✅ opgeslagen • ${charCount(f.url)} tekens` : '— niet in DB'}
                      </span>
                      {s && (
                        <button
                          onClick={() => setPreviewUrl(f.url)}
                          className="px-2 py-1 rounded border border-[#3A4D23] bg-[#232D1A] hover:bg-[#2A2A2A] text-xs"
                        >
                          Preview
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* MATCH TABLE SECTION */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-[#8BAE5A] mb-1">Match ebook</h2>
        <div className="text-xs text-gray-300 mb-2">Matches: {matchedCount} / {allEbookUrls.length} • Missing: {allEbookUrls.length - matchedCount}</div>
        <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-[#B6C948]">
                <th className="p-2">Module</th>
                <th className="p-2">/ebooks/</th>
                <th className="p-2">/ebooksv2/</th>
                <th className="p-2">Status</th>
                <th className="p-2">V2 Template</th>
                <th className="p-2">Verschil (tekens)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(MODULES).map(([module, urls]) => (
                urls.map((u) => {
                  const slug = getSlug(u);
                  const exact = v2BySlug[slug];
                  const fuzzy = exact ? null : findFuzzyV2(u);
                  const v2 = exact || fuzzy?.url;
                  const c1 = charCount(u);
                  const c2 = v2 ? charCount(v2) : 0;
                  const diff = c2 - c1;
                  const matched = !!v2;
                  const status = matched ? '✅ Match' : '❌ Geen match';
                  const diffClass = matched ? (diff >= 0 ? 'text-green-400' : 'text-red-400') : 'text-gray-400';
                  // Trigger template check if not yet cached
                  if (v2 && !v2Compliance[v2]) {
                    void checkV2Template(v2);
                  }
                  const comp = v2 ? v2Compliance[v2] : undefined;
                  return (
                    <tr key={`${module}-${u}`} className={matched ? "border-t border-[#232D1A]" : "bg-red-900/20 border-t border-[#5b1f1f]"}>
                      <td className="p-2 text-[#8BAE5A] whitespace-nowrap">{module}</td>
                      <td className="p-2">
                        <Link href={u} target="_blank" className="text-[#8BAE5A] hover:underline break-all">{u}</Link>
                        <span className="ml-2 text-xs text-gray-400">({c1} tekens)</span>
                      </td>
                      <td className="p-2">
                        {matched ? (
                          <>
                            <Link href={v2!} target="_blank" className="text-[#8BAE5A] hover:underline break-all">{v2}</Link>
                            <span className="ml-2 text-xs text-gray-400">({c2} tekens{fuzzy ? ` • score ${fuzzy.score.toFixed(2)}` : ''})</span>
                          </>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-2">
                        <span className={matched ? 'text-green-400' : 'text-red-400'}>{status}</span>
                      </td>
                      <td className="p-2">
                        {matched ? (
                          comp ? (
                            <span className={`${comp.ok ? 'text-green-400' : 'text-red-400'}`} title={comp.details}>
                              {comp.ok ? '✔︎ OK' : '✖︎ Niet volledig'}
                            </span>
                          ) : (
                            <span className="text-gray-400">controleren...</span>
                          )
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className={`p-2 font-semibold ${diffClass}`}>
                        {matched ? (diff >= 0 ? `+${diff}` : `${diff}`) : '—'}
                      </td>
                    </tr>
                  );
                })
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
