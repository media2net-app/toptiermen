'use client';

import { useEffect, useState } from 'react';
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

  // Laad ebooks data
  const fetchEbooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('academy_ebook_files')
        .select('*')
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

  // Test ebook accessibility function
  const testEbookAccess = async (path: string): Promise<boolean> => {
    try {
      const response = await fetch(path, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Error testing ebook access:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchEbooks();
  }, []);

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
                          onClick={async () => {
                            setOpeningEbook(ebook.id);
                            console.log('🔗 Opening ebook:', ebook.path);
                            const fullUrl = window.location.origin + ebook.path;
                            console.log('🌐 Full URL:', fullUrl);
                            
                            try {
                              // Test eerst of de file toegankelijk is
                              const isAccessible = await testEbookAccess(ebook.path);
                              if (!isAccessible) {
                                alert(`⚠️ Ebook niet toegankelijk op pad: ${ebook.path}\n\nControleer of het bestand bestaat in de public/books/ directory.`);
                                return;
                              }

                              const newWindow = window.open(ebook.path, '_blank', 'noopener,noreferrer');
                              if (!newWindow) {
                                // Fallback als popup wordt geblokkeerd
                                console.warn('⚠️ Popup blocked, trying alternative method');
                                alert('Popup geblokkeerd! Open de browser instellingen om popups toe te staan voor deze site, of kopieer de URL handmatig: ' + fullUrl);
                              } else {
                                console.log('✅ Ebook opened successfully');
                              }
                            } catch (error) {
                              console.error('❌ Error opening ebook:', error);
                              alert('Fout bij openen van ebook. Probeer de link handmatig: ' + fullUrl);
                            } finally {
                              // Reset loading state na korte delay
                              setTimeout(() => setOpeningEbook(null), 1000);
                            }
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
