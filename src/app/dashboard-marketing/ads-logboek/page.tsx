'use client';

import { useState, useEffect } from 'react';
import { 
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  ChartBarIcon,
  CurrencyEuroIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface LogEntry {
  id: string;
  date: string;
  title: string;
  category: 'strategy' | 'performance' | 'budget' | 'creative' | 'targeting' | 'optimization';
  content: string;
  impact: 'positive' | 'negative' | 'neutral' | 'monitoring';
  tags: string[];
  data?: {
    spend?: number;
    clicks?: number;
    conversions?: number;
    ctr?: number;
    cpc?: number;
  };
}

export default function AdsLogboekPage() {
  const [entries, setEntries] = useState<LogEntry[]>([
    {
      id: '1',
      date: '2025-08-23',
      title: 'Budget Herallocatie - Algemene naar Zakelijk Campagne',
      category: 'budget',
      impact: 'positive',
      content: `Beslissing genomen om budget te heralloceren van Algemene naar Zakelijk campagne op basis van performance data.

ANALYSE:
- TTM - Zakelijk: €8.41 spend, 72 clicks, 3 conversies (4.17% conversie rate)
- TTM - Vaders: €8.45 spend, 96 clicks, 0 conversies (0% conversie rate)
- TTM - Jongeren: €8.22 spend, 69 clicks, 0 conversies (0% conversie rate)
- TTM - Algemene: €21.44 spend, 189 clicks, 0 conversies (0% conversie rate)

BESLISSING:
- Algemene campagne budget verlaagd van €25 naar €5 per dag (80% reductie)
- Zakelijk campagne budget verhoogd van €5 naar €25 per dag (5x verhoging)
- €20 dagelijks budget hergealloceerd naar best presterende campagne

VERWACHTING:
- 6-7 extra leads per dag voor Zakelijk campagne
- ROI verbetering van €2.80 naar €2-3 per lead
- Risico: Laag (bewezen conversie rate)`,
      tags: ['budget', 'roi', 'conversie', 'zakelijk', 'algemeen'],
      data: {
        spend: 46.52,
        clicks: 426,
        conversions: 3,
        ctr: 0.70,
        cpc: 0.11
      }
    },
    {
      id: '2',
      date: '2025-08-23',
      title: 'Performance Analyse - Facebook Ads Manager Data',
      category: 'performance',
      impact: 'neutral',
      content: `Volledige Facebook Ads Manager data geïmplementeerd in dashboard voor accurate tracking.

TOTALE PERFORMANCE:
- Totale spend: €46.52
- Totale clicks: 426
- Totale impressions: 7,461
- Totale reach: 6,820
- Facebook ad leads: 3
- Gemiddelde cost per lead: €15.51
- Conversie rate: 0.70%

CAMPAIGN BREAKDOWN:
1. TTM - Zakelijk: 72 clicks, €8.41, 3 conversies (4.17% conversie rate)
2. TTM - Vaders: 96 clicks, €8.45, 0 conversies (0% conversie rate)
3. TTM - Jongeren: 69 clicks, €8.22, 0 conversies (0% conversie rate)
4. TTM - Algemene: 189 clicks, €21.44, 0 conversies (0% conversie rate)

INSIGHTS:
- Zakelijk campagne toont beste ROI met 3 conversies
- Algemene campagne heeft hoogste volume maar geen conversies
- Vaders en Jongeren campagnes presteren matig zonder conversies`,
      tags: ['data', 'analytics', 'performance', 'facebook', 'campaigns'],
      data: {
        spend: 46.52,
        clicks: 426,
        conversions: 3,
        ctr: 0.70,
        cpc: 0.11
      }
    },
    {
      id: '3',
      date: '2025-08-23',
      title: 'Test Lead Verwijderd - Data Zuivering',
      category: 'optimization',
      impact: 'positive',
      content: `Test lead chiel@media2net.nl verwijderd uit database voor accurate conversie tracking.

ACTIE:
- Test lead gefilterd uit conversie berekeningen
- Data zuivering voor accurate performance metrics
- Conversie rate gecorrigeerd van 1% naar 0.70%

RESULTAAT:
- Echte Facebook ad leads: 3 (exclusief test)
- Organische leads: 18
- Totaal leads: 21 (exclusief test leads)
- Accurate cost per lead berekeningen`,
      tags: ['data', 'cleanup', 'test', 'conversie', 'accuracy'],
      data: {
        spend: 46.52,
        clicks: 426,
        conversions: 3,
        ctr: 0.70,
        cpc: 0.11
      }
    }
  ]);

  const [newEntry, setNewEntry] = useState<Partial<LogEntry>>({
    title: '',
    category: 'strategy',
    content: '',
    impact: 'neutral',
    tags: []
  });

  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterImpact, setFilterImpact] = useState<string>('all');

  const categories = [
    { value: 'strategy', label: 'Strategie', icon: ChartBarIcon },
    { value: 'performance', label: 'Performance', icon: ArrowTrendingUpIcon },
    { value: 'budget', label: 'Budget', icon: CurrencyEuroIcon },
    { value: 'creative', label: 'Creative', icon: DocumentTextIcon },
    { value: 'targeting', label: 'Targeting', icon: UserGroupIcon },
    { value: 'optimization', label: 'Optimalisatie', icon: CheckCircleIcon }
  ];

  const impacts = [
    { value: 'positive', label: 'Positief', icon: ArrowTrendingUpIcon, color: 'text-green-500' },
    { value: 'negative', label: 'Negatief', icon: ArrowTrendingDownIcon, color: 'text-red-500' },
    { value: 'neutral', label: 'Neutraal', icon: ChartBarIcon, color: 'text-gray-500' },
    { value: 'monitoring', label: 'Monitoring', icon: ExclamationTriangleIcon, color: 'text-yellow-500' }
  ];

  const addEntry = () => {
    if (!newEntry.title || !newEntry.content) return;

    const entry: LogEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      title: newEntry.title!,
      category: newEntry.category!,
      content: newEntry.content!,
      impact: newEntry.impact!,
      tags: newEntry.tags || [],
      data: newEntry.data
    };

    setEntries([entry, ...entries]);
    setNewEntry({
      title: '',
      category: 'strategy',
      content: '',
      impact: 'neutral',
      tags: []
    });
    setShowForm(false);
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const filteredEntries = entries.filter(entry => {
    if (filterCategory !== 'all' && entry.category !== filterCategory) return false;
    if (filterImpact !== 'all' && entry.impact !== filterImpact) return false;
    return true;
  });

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.icon : DocumentTextIcon;
  };

  const getImpactIcon = (impact: string) => {
    const imp = impacts.find(i => i.value === impact);
    return imp ? imp.icon : ChartBarIcon;
  };

  const getImpactColor = (impact: string) => {
    const imp = impacts.find(i => i.value === impact);
    return imp ? imp.color : 'text-gray-500';
  };

  return (
    <div className="min-h-screen bg-[#0F1419] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Ads Logboek</h1>
            <p className="text-gray-400">Track je Facebook ad bevindingen en strategische beslissingen</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#8BAE5A] text-white rounded-lg hover:bg-[#7A9F4A] transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Nieuwe Entry
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-black border border-gray-700 rounded-lg text-white"
          >
            <option value="all">Alle Categorieën</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <select
            value={filterImpact}
            onChange={(e) => setFilterImpact(e.target.value)}
            className="px-3 py-2 bg-black border border-gray-700 rounded-lg text-white"
          >
            <option value="all">Alle Impacts</option>
            {impacts.map(imp => (
              <option key={imp.value} value={imp.value}>{imp.label}</option>
            ))}
          </select>
        </div>

        {/* New Entry Form */}
        {showForm && (
          <div className="bg-black/50 border border-gray-800 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Nieuwe Log Entry</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Titel"
                value={newEntry.title}
                onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                className="px-3 py-2 bg-black border border-gray-700 rounded-lg text-white"
              />
              <select
                value={newEntry.category}
                onChange={(e) => setNewEntry({...newEntry, category: e.target.value as any})}
                className="px-3 py-2 bg-black border border-gray-700 rounded-lg text-white"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <select
                value={newEntry.impact}
                onChange={(e) => setNewEntry({...newEntry, impact: e.target.value as any})}
                className="px-3 py-2 bg-black border border-gray-700 rounded-lg text-white"
              >
                {impacts.map(imp => (
                  <option key={imp.value} value={imp.value}>{imp.label}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Tags (komma gescheiden)"
                value={newEntry.tags?.join(', ') || ''}
                onChange={(e) => setNewEntry({...newEntry, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)})}
                className="px-3 py-2 bg-black border border-gray-700 rounded-lg text-white"
              />
            </div>
            <textarea
              placeholder="Beschrijf je bevindingen, beslissingen en resultaten..."
              value={newEntry.content}
              onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
              rows={6}
              className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={addEntry}
                className="px-4 py-2 bg-[#8BAE5A] text-white rounded-lg hover:bg-[#7A9F4A] transition-colors"
              >
                Toevoegen
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Annuleren
              </button>
            </div>
          </div>
        )}

        {/* Entries */}
        <div className="space-y-6">
          {filteredEntries.map(entry => {
            const CategoryIcon = getCategoryIcon(entry.category);
            const ImpactIcon = getImpactIcon(entry.impact);
            const impactColor = getImpactColor(entry.impact);

            return (
              <div key={entry.id} className="bg-black/50 border border-gray-800 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CategoryIcon className="w-6 h-6 text-[#8BAE5A]" />
                    <div>
                      <h3 className="text-xl font-semibold text-white">{entry.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {new Date(entry.date).toLocaleDateString('nl-NL')}
                        </div>
                        <div className="flex items-center gap-1">
                          <ImpactIcon className={`w-4 h-4 ${impactColor}`} />
                          <span className={impactColor}>
                            {impacts.find(i => i.value === entry.impact)?.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="text-red-500 hover:text-red-400 transition-colors"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="prose prose-invert max-w-none mb-4">
                  <div className="whitespace-pre-wrap text-gray-300">{entry.content}</div>
                </div>

                {entry.data && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-900/50 rounded-lg mb-4">
                    {entry.data.spend && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">€{entry.data.spend}</div>
                        <div className="text-sm text-gray-400">Spend</div>
                      </div>
                    )}
                    {entry.data.clicks && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{entry.data.clicks}</div>
                        <div className="text-sm text-gray-400">Clicks</div>
                      </div>
                    )}
                    {entry.data.conversions && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{entry.data.conversions}</div>
                        <div className="text-sm text-gray-400">Conversies</div>
                      </div>
                    )}
                    {entry.data.ctr && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{entry.data.ctr}%</div>
                        <div className="text-sm text-gray-400">CTR</div>
                      </div>
                    )}
                    {entry.data.cpc && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">€{entry.data.cpc}</div>
                        <div className="text-sm text-gray-400">CPC</div>
                      </div>
                    )}
                  </div>
                )}

                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-[#8BAE5A]/20 text-[#8BAE5A] text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Geen log entries gevonden</p>
          </div>
        )}
      </div>
    </div>
  );
}
