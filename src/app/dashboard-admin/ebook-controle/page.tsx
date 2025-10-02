'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabase';
import { 
  BookOpenIcon, 
  EyeIcon, 
  PencilIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface EbookRecord {
  id: string;
  filename: string;
  path: string;
  title: string;
  module: string;
  style_type: string;
  style_description: string;
  has_inter_font: boolean;
  has_segoe_ui: boolean;
  has_ebook_container: boolean;
  has_module_badge: boolean;
  has_enhanced_styling: boolean;
  has_table_of_contents: boolean;
  has_reflection_section: boolean;
  has_action_items: boolean;
  file_size: number;
  last_modified: string;
  status: string;
  needs_update: boolean;
  priority: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export default function EbookControlePage() {
  const { user } = useSupabaseAuth();
  const [ebooks, setEbooks] = useState<EbookRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openingEbook, setOpeningEbook] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [scanning, setScanning] = useState(false);
  // Final check state
  const [finalChecking, setFinalChecking] = useState(false);
  const [finalCheckResults, setFinalCheckResults] = useState<Record<string, {
    summaryOk: boolean;
    nlOk: boolean;
    simpleOk: boolean;
    checklistOk: boolean;
    reflectOk: boolean;
    homeworkOk: boolean;
  }>>({});

  // Laad ebooks data
  const fetchEbooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('academy_ebook_files')
        .select('*')
        .eq('status', 'active')
        .neq('style_type', 'legacy') // Hide old ebooks
        .order('priority', { ascending: false })
        .order('module')
        .order('title');

      if (error) throw error;
      setEbooks(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  

  // Removed testEbookAccess function - direct links are more reliable

  useEffect(() => {
    fetchEbooks();
  }, []);

  // ---------- Final Check Logic ----------
  const isLikelyDutch = (text: string) => {
    const common = ['de','het','een','en','van','te','ik','je','jij','we','wij','niet','met','voor','naar','zijn','hebben','dit','dat','om','als','ook','maar','dan','wat','hoe','waar','zijn','worden','doel'];
    const words = text.toLowerCase().match(/[a-zà-ÿ']+/g) || [];
    if (words.length < 50) return false;
    const hits = words.filter(w => common.includes(w)).length;
    return hits / words.length > 0.04; // 4% common-word ratio
  };

  const isSimpleText = (text: string) => {
    const sentences = text.split(/[.!?]\s+/).filter(Boolean);
    if (sentences.length === 0) return false;
    const words = text.split(/\s+/).filter(Boolean);
    const avgLen = words.length / sentences.length; // words per sentence
    const complex = words.filter(w => w.replace(/[^a-zA-Zà-ÿ']/g,'').length >= 13).length;
    const complexRatio = complex / Math.max(words.length, 1);
    return avgLen <= 18 && complexRatio <= 0.12;
  };

  const extractSection = (html: string, headingRegex: RegExp) => {
    // crude text extraction between heading and next heading
    const text = html.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'');
    const plain = text.replace(/<[^>]+>/g, '\n');
    const lines = plain.split(/\n+/).map(l => l.trim()).filter(Boolean);
    let idx = lines.findIndex(l => headingRegex.test(l));
    if (idx === -1) return '';
    let buf: string[] = [];
    for (let i = idx + 1; i < lines.length; i++) {
      const l = lines[i];
      if (/^(#{1,6}|\d+\.|\*|\-|=|\w+:?\s*)$/i.test(l)) { /* ignore minimal markers */ }
      if (/^(inleiding|hoofdstuk|samenvatting|reflectie|reflectievragen|checklist|huiswerk|opdrachten|conclusie)\b/i.test(l)) break;
      buf.push(l);
      if (buf.join(' ').length > 12000) break; // cap buffer
    }
    return buf.join('\n');
  };

  const countListItems = (html: string, sectionRegex: RegExp) => {
    const section = extractSection(html, sectionRegex) || '';
    const items1 = (section.match(/<li[\s\S]*?<\/li>/gi) || []).map(s => s.replace(/<[^>]+>/g,'').trim()).filter(Boolean);
    const items2 = section.split(/\n+/).filter(l => /^(\-|\*|\d+\.|Stap\s+\d+)/i.test(l.trim()));
    const combined = [...items1, ...items2].map(s => s.trim()).filter(Boolean);
    const nonTrivial = combined.filter(s => s.length > 20 && !/^Stap\s*1\b/i.test(s));
    return { total: combined.length, nonTrivial: nonTrivial.length };
  };

  const analyzeHtml = (html: string) => {
    const plain = html.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ');
    const plainCollapsed = plain.replace(/\s+/g,' ').trim();

    const summaryText = extractSection(html, /samenvatting|uitgebreide\s+samenvatting/i);
    const summaryLen = (summaryText || '').length;
    const summaryOk = summaryLen >= 9000; // ~10k chars target

    const nlOk = isLikelyDutch(plainCollapsed);
    const simpleOk = isSimpleText(plainCollapsed);

    const checklist = countListItems(html, /checklist/i);
    const checklistOk = checklist.nonTrivial >= 1; // at least more than just Stap 1

    const reflectText = extractSection(html, /reflectievragen|reflectie/i);
    const reflectQuestions = (reflectText.match(/\?/g) || []).length;
    const reflectOk = reflectText.length > 80 && reflectQuestions >= 2; // ensure content and multiple questions

    const homework = countListItems(html, /huiswerk|opdracht/i);
    const homeworkOk = homework.nonTrivial >= 2 || extractSection(html, /huiswerk|opdracht/i).length > 120;

    return { summaryOk, nlOk, simpleOk, checklistOk, reflectOk, homeworkOk };
  };

  const runFinalCheck = async () => {
    if (!ebooks.length) return;
    setFinalChecking(true);
    try {
      const results: Record<string, any> = {};
      const batchSize = 8;
      for (let i = 0; i < ebooks.length; i += batchSize) {
        const slice = ebooks.slice(i, i + batchSize);
        const fetched = await Promise.allSettled(slice.map(async (eb) => {
          const res = await fetch(eb.path, { cache: 'no-store' });
          const html = await res.text();
          return { id: eb.id, checks: analyzeHtml(html) };
        }));
        fetched.forEach(item => {
          if (item.status === 'fulfilled') {
            results[item.value.id] = item.value.checks;
          }
        });
        setFinalCheckResults(prev => ({ ...prev, ...results })); // progressive updates
      }
      setError(null);
    } catch (e: any) {
      setError('Final check fout: ' + (e?.message || String(e)));
    } finally {
      setFinalChecking(false);
    }
  };

  // Scan ebooks functie
  const scanEbooks = async () => {
    setScanning(true);
    try {
      const { populateEbooksDatabase } = await import('./scan-logic');
      const result = await populateEbooksDatabase();
      
      if (result.success) {
        await fetchEbooks();
        setError(null);
      } else {
        setError(result.error || 'Onbekende fout bij scannen');
      }
    } catch (err: any) {
      setError('Fout bij scannen: ' + err.message);
    } finally {
      setScanning(false);
    }
  };

  // Filter ebooks
  const filteredEbooks = ebooks.filter(ebook => {
    const matchesStyle = selectedStyle === 'all' || ebook.style_type === selectedStyle;
    const matchesModule = selectedModule === 'all' || ebook.module === selectedModule;
    const matchesSearch = searchTerm === '' || 
      ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ebook.filename.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStyle && matchesModule && matchesSearch;
  });

  // Aggregated dashboard stats for Final Check (depends on filteredEbooks)
  const finalStats = useMemo(() => {
    const ids = filteredEbooks.map(e => e.id);
    let processed = 0;
    let summaryOk = 0, nlOk = 0, simpleOk = 0, checklistOk = 0, reflectOk = 0, homeworkOk = 0, fullyOk = 0;
    ids.forEach(id => {
      const r = finalCheckResults[id];
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
    return { processed, summaryOk, nlOk, simpleOk, checklistOk, reflectOk, homeworkOk, fullyOk, total: ids.length };
  }, [finalCheckResults, filteredEbooks]);

  // Statistieken
  const stats = {
    total: ebooks.length,
    modern: ebooks.filter(e => e.style_type === 'modern').length,
    enhanced: ebooks.filter(e => e.style_type === 'enhanced').length,
    badge: ebooks.filter(e => e.style_type === 'badge').length,
    basic: ebooks.filter(e => e.style_type === 'basic').length,
    needsUpdate: ebooks.filter(e => e.needs_update).length
  };

  const getStyleBadgeColor = (styleType: string) => {
    switch (styleType) {
      case 'modern': return 'bg-green-100 text-green-800';
      case 'enhanced': return 'bg-blue-100 text-blue-800';
      case 'badge': return 'bg-yellow-100 text-yellow-800';
      case 'basic': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: number) => {
    if (priority >= 3) return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
    if (priority >= 2) return <ClockIcon className="h-4 w-4 text-yellow-500" />;
    return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto"></div>
          <p className="mt-4 text-[#8BAE5A]">Laden van ebook data...</p>
        </div>

        {/* Final Check Dashboard Stats */}
        <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#8BAE5A]">Final check – overzicht</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={runFinalCheck}
                disabled={finalChecking}
                className="px-3 py-2 rounded-md font-semibold bg-[#B6C948] text-[#181F17] hover:bg-[#8BAE5A] disabled:opacity-50"
                title="Herbereken status"
              >
                {finalChecking ? 'Bezig…' : 'Ververs status'}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="bg-[#181F17] border border-[#3A4D23] rounded-md p-3 text-center">
              <div className="text-xs text-[#B6C948]">Totaal</div>
              <div className="text-lg font-semibold text-white">{finalStats.total}</div>
            </div>
            <div className="bg-[#181F17] border border-[#3A4D23] rounded-md p-3 text-center">
              <div className="text-xs text-[#B6C948]">Verwerkt</div>
              <div className="text-lg font-semibold text-white">{finalStats.processed}</div>
            </div>
            <div className="bg-[#181F17] border border-[#3A4D23] rounded-md p-3 text-center">
              <div className="text-xs text-[#B6C948]">Volledig OK</div>
              <div className="text-lg font-semibold text-green-400">{finalStats.fullyOk}</div>
            </div>
            <div className="bg-[#181F17] border border-[#3A4D23] rounded-md p-3 text-center">
              <div className="text-xs text-[#B6C948]">Samenvatting OK</div>
              <div className="text-lg font-semibold text-white">{finalStats.summaryOk}</div>
            </div>
            <div className="bg-[#181F17] border border-[#3A4D23] rounded-md p-3 text-center">
              <div className="text-xs text-[#B6C948]">Nederlands OK</div>
              <div className="text-lg font-semibold text-white">{finalStats.nlOk}</div>
            </div>
            <div className="bg-[#181F17] border border-[#3A4D23] rounded-md p-3 text-center">
              <div className="text-xs text-[#B6C948]">Simpel OK</div>
              <div className="text-lg font-semibold text-white">{finalStats.simpleOk}</div>
            </div>
            <div className="bg-[#181F17] border border-[#3A4D23] rounded-md p-3 text-center">
              <div className="text-xs text-[#B6C948]">Checklist OK</div>
              <div className="text-lg font-semibold text-white">{finalStats.checklistOk}</div>
            </div>
            <div className="bg-[#181F17] border border-[#3A4D23] rounded-md p-3 text-center">
              <div className="text-xs text-[#B6C948]">Reflectie / Huiswerk</div>
              <div className="text-lg font-semibold text-white">{finalStats.reflectOk}/{finalStats.homeworkOk}</div>
            </div>
          </div>
          <p className="text-xs text-[#B6C948] mt-2">Tip: klik op "Ververs status" om tussendoor de actuele voortgang te herberekenen.</p>
        </div>

        {/* Final check */}
        <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#8BAE5A]">Final check</h2>
            <button
              onClick={runFinalCheck}
              disabled={finalChecking}
              className="bg-[#B6C948] text-[#181F17] px-3 py-2 rounded-md hover:bg-[#8BAE5A] disabled:opacity-50 font-semibold"
            >
              {finalChecking ? 'Bezig met controleren…' : 'Controleer alle v2 ebooks'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#3A4D23]">
              <thead className="bg-[#181F17]">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[#B6C948] uppercase">Ebook</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[#B6C948] uppercase">Uitgebreide samenvatting (~10k)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[#B6C948] uppercase">Nederlands</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[#B6C948] uppercase">Simpel/Doelgericht</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[#B6C948] uppercase">Checklist inhoud</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[#B6C948] uppercase">Reflectievragen inhoud</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[#B6C948] uppercase">Huiswerk inhoud</th>
                </tr>
              </thead>
              <tbody className="bg-[#232D1A] divide-y divide-[#3A4D23]">
                {filteredEbooks.map(ebook => {
                  const r = finalCheckResults[ebook.id];
                  const Cell = ({ ok }: { ok: boolean | undefined }) => (
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${ok === true ? 'bg-green-100 text-green-800' : ok === false ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                      {ok === true ? '✓' : ok === false ? '✕' : '…'}
                    </span>
                  );
                  return (
                    <tr key={ebook.id}>
                      <td className="px-4 py-2 text-sm text-white whitespace-nowrap max-w-[240px] truncate" title={ebook.title}>{ebook.title}</td>
                      <td className="px-4 py-2"><Cell ok={r?.summaryOk} /></td>
                      <td className="px-4 py-2"><Cell ok={r?.nlOk} /></td>
                      <td className="px-4 py-2"><Cell ok={r?.simpleOk} /></td>
                      <td className="px-4 py-2"><Cell ok={r?.checklistOk} /></td>
                      <td className="px-4 py-2"><Cell ok={r?.reflectOk} /></td>
                      <td className="px-4 py-2"><Cell ok={r?.homeworkOk} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#B6C948] mt-2">Heuristieken: taalcheck via veelvoorkomende NL-woorden, eenvoud via gemiddelde zinslengte en complexe-woorden ratio, secties via headings Regex (Checklist/Reflectie/Huiswerk). Samenvatting zoekt (Uitgebreide) Samenvatting en controleert lengte.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181F17] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#8BAE5A] flex items-center">
                <BookOpenIcon className="h-8 w-8 text-[#8BAE5A] mr-3" />
                E-book Controle
              </h1>
              <p className="text-[#B6C948] mt-1">
                Beheer en analyseer alle Academy ebooks
              </p>
            </div>
            <button
              onClick={scanEbooks}
              disabled={scanning}
              className="bg-[#B6C948] text-[#181F17] px-4 py-2 rounded-lg hover:bg-[#8BAE5A] disabled:opacity-50 flex items-center font-semibold"
            >
              {scanning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#181F17] mr-2"></div>
                  Scannen...
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                  Opnieuw Scannen
                </>
              )}
            </button>
          </div>
        </div>

        {/* Statistieken */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4">
            <div className="flex items-center">
              <ChartBarIcon className="h-6 w-6 text-[#8BAE5A]" />
              <div className="ml-3">
                <p className="text-sm font-medium text-[#B6C948]">Totaal</p>
                <p className="text-xl font-semibold text-[#8BAE5A]">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-[#B6C948]">Modern</p>
                <p className="text-xl font-semibold text-green-400">{stats.modern}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4">
            <div className="flex items-center">
              <div className="h-6 w-6 bg-blue-500 rounded"></div>
              <div className="ml-3">
                <p className="text-sm font-medium text-[#B6C948]">Enhanced</p>
                <p className="text-xl font-semibold text-blue-400">{stats.enhanced}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4">
            <div className="flex items-center">
              <div className="h-6 w-6 bg-yellow-500 rounded"></div>
              <div className="ml-3">
                <p className="text-sm font-medium text-[#B6C948]">Badge</p>
                <p className="text-xl font-semibold text-yellow-400">{stats.badge}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4">
            <div className="flex items-center">
              <div className="h-6 w-6 bg-red-500 rounded"></div>
              <div className="ml-3">
                <p className="text-sm font-medium text-[#B6C948]">Basic</p>
                <p className="text-xl font-semibold text-red-400">{stats.basic}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-[#B6C948]">Needs Update</p>
                <p className="text-xl font-semibold text-orange-400">{stats.needsUpdate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                Zoeken
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 text-[#B6C948] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Zoek ebooks..."
                  className="pl-10 pr-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg w-full focus:ring-2 focus:ring-[#8BAE5A] focus:border-[#8BAE5A] text-white placeholder-[#B6C948]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                Stijl Type
              </label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg focus:ring-2 focus:ring-[#8BAE5A] focus:border-[#8BAE5A] text-white"
              >
                <option value="all">Alle stijlen</option>
                <option value="modern">Modern (Inter font)</option>
                <option value="enhanced">Enhanced</option>
                <option value="badge">Badge</option>
                <option value="basic">Basic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                Module
              </label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg focus:ring-2 focus:ring-[#8BAE5A] focus:border-[#8BAE5A] text-white"
              >
                <option value="all">Alle modules</option>
                {Array.from(new Set(ebooks.map(e => e.module))).sort().map(module => (
                  <option key={module} value={module}>{module}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedStyle('all');
                  setSelectedModule('all');
                  setSearchTerm('');
                }}
                className="w-full px-4 py-2 border border-[#3A4D23] rounded-lg hover:bg-[#3A4D23] flex items-center justify-center text-[#8BAE5A]"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Ebook lijst */}
        <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-[#3A4D23]">
            <h2 className="text-lg font-medium text-[#8BAE5A]">
              Ebooks ({filteredEbooks.length})
            </h2>
          </div>
          
          {error && (
            <div className="p-4 bg-red-900/20 border-l-4 border-red-400">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#3A4D23]">
              <thead className="bg-[#181F17]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#B6C948] uppercase tracking-wider">
                    Ebook
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#B6C948] uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#B6C948] uppercase tracking-wider">
                    Stijl Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#B6C948] uppercase tracking-wider">
                    Features
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#B6C948] uppercase tracking-wider">
                    Prioriteit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#B6C948] uppercase tracking-wider">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#232D1A] divide-y divide-[#3A4D23]">
                {filteredEbooks.map((ebook) => (
                  <tr key={ebook.id} className="hover:bg-[#3A4D23]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <BookOpenIcon className="h-5 w-5 text-[#8BAE5A] mr-3" />
                        <div>
                          <div className="text-sm font-medium text-white">{ebook.title}</div>
                          <div className="text-sm text-[#B6C948]">{ebook.filename}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#3A4D23] text-[#B6C948]">
                        {ebook.module}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStyleBadgeColor(ebook.style_type)}`}>
                        {ebook.style_type}
                      </span>
                      <div className="text-xs text-[#B6C948] mt-1">{ebook.style_description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {ebook.has_inter_font && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                            Inter Font
                          </span>
                        )}
                        {ebook.has_module_badge && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                            Module Badge
                          </span>
                        )}
                        {ebook.has_table_of_contents && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                            TOC
                          </span>
                        )}
                        {ebook.has_action_items && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-orange-100 text-orange-800">
                            Action Items
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getPriorityIcon(ebook.priority)}
                        <span className="ml-2 text-sm text-[#B6C948]">
                          {ebook.needs_update ? 'Needs Update' : 'OK'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            setOpeningEbook(ebook.id);
                            const fullUrl = window.location.origin + ebook.path;
                            console.log('🔗 Opening ebook:', fullUrl);
                            
                            // Direct open without testing - more reliable
                            const newWindow = window.open(ebook.path, '_blank', 'noopener,noreferrer');
                            
                            if (!newWindow) {
                              // Copy URL to clipboard as fallback
                              navigator.clipboard.writeText(fullUrl).then(() => {
                                alert(`🔗 URL gekopieerd naar klembord!\n\n${fullUrl}\n\nPlak deze URL in een nieuw browser tabblad.`);
                              }).catch(() => {
                                // Final fallback - show URL
                                prompt('Kopieer deze URL en plak in nieuw tabblad:', fullUrl);
                              });
                            } else {
                              console.log('✅ Ebook opened successfully');
                            }
                            
                            // Reset loading state
                            setTimeout(() => setOpeningEbook(null), 500);
                          }}
                          disabled={openingEbook === ebook.id}
                          className="inline-flex items-center px-3 py-1.5 bg-[#8BAE5A] text-[#181F17] rounded-md hover:bg-[#B6C948] transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] focus:ring-offset-2 focus:ring-offset-[#232D1A] disabled:opacity-50"
                          title={`Open ${ebook.title} in nieuw tabblad`}
                        >
                          {openingEbook === ebook.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#181F17] mr-1.5"></div>
                              Openen...
                            </>
                          ) : (
                            <>
                              <EyeIcon className="h-4 w-4 mr-1.5" />
                              Bekijk
                            </>
                          )}
                        </button>
                        
                        {/* Direct link knop als backup */}
                        <a
                          href={ebook.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 bg-[#3A4D23] text-[#B6C948] rounded-md hover:bg-[#8BAE5A] hover:text-[#181F17] transition-colors font-medium"
                          title={`Direct link naar ${ebook.title}`}
                        >
                          <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Link
                        </a>
                        
                        <button 
                          className="inline-flex items-center px-3 py-1.5 border border-[#3A4D23] text-[#B6C948] rounded-md hover:bg-[#3A4D23] hover:text-[#8BAE5A] transition-colors font-medium"
                          title="Bewerk ebook eigenschappen"
                        >
                          <PencilIcon className="h-4 w-4 mr-1.5" />
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEbooks.length === 0 && !loading && (
            <div className="text-center py-12">
              <BookOpenIcon className="mx-auto h-12 w-12 text-[#8BAE5A]" />
              <h3 className="mt-2 text-sm font-medium text-white">Geen ebooks gevonden</h3>
              <p className="mt-1 text-sm text-[#B6C948]">
                Probeer andere filters of scan opnieuw.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
