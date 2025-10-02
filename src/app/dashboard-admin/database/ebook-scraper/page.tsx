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

  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SaveResult[]>([]);
  const [stored, setStored] = useState<Record<string, StoredItem>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [v2files, setV2files] = useState<{name: string; url: string}[]>([]);

  const charCount = (url: string) => {
    const s = stored[url];
    if (!s) return 0;
    return (s.summary_text || '')?.length || 0;
  };

  // Helpers to map /ebooks/ to /ebooksv2/
  const getSlug = (url: string) => {
    try {
      const u = new URL(url, window.location.origin);
      const parts = u.pathname.split('/');
      const file = parts[parts.length - 1];
      return file.replace(/\.html$/i, '');
    } catch {
      // fallback for relative
      const path = url.split('?')[0];
      const parts = path.split('/');
      const file = parts[parts.length - 1];
      return file.replace(/\.html$/i, '');
    }
  };

  const v2BySlug = useMemo(() => {
    const map: Record<string, string> = {};
    v2files.forEach(f => {
      const slug = f.name.replace(/\.html$/i, '');
      map[slug] = f.url;
    });
    return map;
  }, [v2files]);

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

      <div className="text-sm text-gray-300 space-y-1">
        <div>Scraped veld: <code>📚 Uitgebreide Samenvatting van de Les</code> uit elke ebook HTML.</div>
        <div>DB status: groene ✅ betekent opgeslagen; klik "Preview" voor weergave.</div>
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
        <h2 className="text-xl font-bold text-[#8BAE5A] mb-3">Match ebook</h2>
        <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-[#B6C948]">
                <th className="p-2">Module</th>
                <th className="p-2">/ebooks/</th>
                <th className="p-2">/ebooksv2/</th>
                <th className="p-2">Status</th>
                <th className="p-2">Verschil (tekens)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(MODULES).map(([module, urls]) => (
                urls.map((u) => {
                  const slug = getSlug(u);
                  const v2 = v2BySlug[slug];
                  const c1 = charCount(u);
                  const c2 = v2 ? charCount(v2) : 0;
                  const diff = c2 - c1;
                  const status = v2 ? '✅ Match' : '❌ Geen match';
                  const diffClass = v2 ? (diff >= 0 ? 'text-green-400' : 'text-red-400') : 'text-gray-400';
                  return (
                    <tr key={`${module}-${u}`} className="border-t border-[#232D1A]">
                      <td className="p-2 text-[#8BAE5A] whitespace-nowrap">{module}</td>
                      <td className="p-2">
                        <Link href={u} target="_blank" className="text-[#8BAE5A] hover:underline break-all">{u}</Link>
                        <span className="ml-2 text-xs text-gray-400">({c1} tekens)</span>
                      </td>
                      <td className="p-2">
                        {v2 ? (
                          <>
                            <Link href={v2} target="_blank" className="text-[#8BAE5A] hover:underline break-all">{v2}</Link>
                            <span className="ml-2 text-xs text-gray-400">({c2} tekens)</span>
                          </>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-2">
                        <span className={v2 ? 'text-green-400' : 'text-red-400'}>{status}</span>
                      </td>
                      <td className={`p-2 font-semibold ${diffClass}`}>
                        {v2 ? (diff >= 0 ? `+${diff}` : `${diff}`) : '—'}
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
