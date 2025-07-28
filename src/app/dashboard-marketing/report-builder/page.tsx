'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  DocumentTextIcon,
  ChartBarIcon,
  TableCellsIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  TrashIcon,
  CogIcon,
  EyeIcon,
  PencilIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  StarIcon,
  FireIcon,
  BoltIcon,
  GlobeAltIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface ReportComponent {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'text' | 'image';
  title: string;
  config: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'executive' | 'operational' | 'competitive' | 'custom';
  components: ReportComponent[];
  createdAt: string;
  lastModified: string;
}

interface KPIDefinition {
  id: string;
  name: string;
  description: string;
  formula: string;
  category: 'performance' | 'financial' | 'competitive' | 'custom';
  unit: string;
  target?: number;
  currentValue?: number;
}

export default function ReportBuilderPage() {
  const [components, setComponents] = useState<ReportComponent[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [kpis, setKpis] = useState<KPIDefinition[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showKPIModal, setShowKPIModal] = useState(false);
  const [dragMode, setDragMode] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'powerpoint'>('pdf');

  // Mock data
  useEffect(() => {
    const mockTemplates: ReportTemplate[] = [
      {
        id: '1',
        name: 'Executive Competitive Overview',
        description: 'High-level competitive intelligence for C-suite',
        category: 'executive',
        components: [
          {
            id: '1',
            type: 'metric',
            title: 'Market Share',
            config: { value: 30.5, change: 18.3, format: 'percentage' },
            position: { x: 0, y: 0 },
            size: { width: 200, height: 100 }
          },
          {
            id: '2',
            type: 'chart',
            title: 'Competitive Performance',
            config: { chartType: 'radar', data: 'competitor_performance' },
            position: { x: 220, y: 0 },
            size: { width: 300, height: 200 }
          }
        ],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Operational Competitive Analysis',
        description: 'Detailed competitive analysis for marketing teams',
        category: 'operational',
        components: [
          {
            id: '3',
            type: 'table',
            title: 'Competitor Ad Spend',
            config: { dataSource: 'competitor_spend', columns: ['competitor', 'spend', 'change'] },
            position: { x: 0, y: 0 },
            size: { width: 400, height: 250 }
          }
        ],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
    ];

    const mockKPIs: KPIDefinition[] = [
      {
        id: '1',
        name: 'Competitive Market Share',
        description: 'Our market share relative to top competitors',
        formula: 'our_spend / total_market_spend * 100',
        category: 'competitive',
        unit: '%',
        target: 35,
        currentValue: 30.5
      },
      {
        id: '2',
        name: 'Competitive Performance Index',
        description: 'Overall performance score vs competitors',
        formula: 'avg(ctr, engagement, conversion) / industry_avg * 100',
        category: 'performance',
        unit: 'score',
        target: 110,
        currentValue: 105.2
      },
      {
        id: '3',
        name: 'Competitive Threat Level',
        description: 'Aggregated threat assessment from all competitors',
        formula: 'weighted_avg(threat_scores)',
        category: 'competitive',
        unit: 'level',
        target: 2,
        currentValue: 2.3
      }
    ];

    setTemplates(mockTemplates);
    setKpis(mockKPIs);
  }, []);

  const availableComponents = [
    {
      type: 'metric',
      name: 'KPI Metric',
      icon: ArrowTrendingUpIcon,
      description: 'Display key performance indicators'
    },
    {
      type: 'chart',
      name: 'Chart',
      icon: ChartBarIcon,
      description: 'Visualize data with charts and graphs'
    },
    {
      type: 'table',
      name: 'Data Table',
      icon: TableCellsIcon,
      description: 'Show detailed data in table format'
    },
    {
      type: 'text',
      name: 'Text Block',
      icon: DocumentTextIcon,
      description: 'Add explanatory text or insights'
    },
    {
      type: 'image',
      name: 'Image',
      icon: PhotoIcon,
      description: 'Include images or screenshots'
    }
  ];

  const addComponent = (type: string) => {
    const newComponent: ReportComponent = {
      id: `comp-${Date.now()}`,
      type: type as any,
      title: `New ${type}`,
      config: {},
      position: { x: Math.random() * 200, y: Math.random() * 200 },
      size: { width: 200, height: 150 }
    };
    setComponents([...components, newComponent]);
  };

  const removeComponent = (id: string) => {
    setComponents(components.filter(comp => comp.id !== id));
  };

  const updateComponent = (id: string, updates: Partial<ReportComponent>) => {
    setComponents(components.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    ));
  };

  const saveTemplate = () => {
    const newTemplate: ReportTemplate = {
      id: `template-${Date.now()}`,
      name: 'New Report Template',
      description: 'Custom report template',
      category: 'custom',
      components: [...components],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    setTemplates([...templates, newTemplate]);
    setShowTemplateModal(false);
  };

  const loadTemplate = (template: ReportTemplate) => {
    setComponents([...template.components]);
    setSelectedTemplate(template);
  };

  const exportReport = async (format: string) => {
    // Simulate export process
    console.log(`Exporting report as ${format}...`);
    
    // Mock export delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `competitive-report.${format}`;
    link.click();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'executive': return <StarIcon className="w-4 h-4" />;
      case 'operational': return <CogIcon className="w-4 h-4" />;
      case 'competitive': return <UserGroupIcon className="w-4 h-4" />;
      case 'custom': return <DocumentTextIcon className="w-4 h-4" />;
      default: return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'metric': return <ArrowTrendingUpIcon className="w-4 h-4" />;
      case 'chart': return <ChartBarIcon className="w-4 h-4" />;
      case 'table': return <TableCellsIcon className="w-4 h-4" />;
      case 'text': return <DocumentTextIcon className="w-4 h-4" />;
      case 'image': return <PhotoIcon className="w-4 h-4" />;
      default: return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Custom Report Builder</h1>
          <p className="text-gray-400 mt-1">Create professional competitive intelligence reports</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="bg-[#3A4D23] hover:bg-[#4A5D33] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Save Template
          </button>
          <button
            onClick={() => exportReport(exportFormat)}
            className="bg-[#8BAE5A] hover:bg-[#7A9D49] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Component Library */}
        <div className="lg:col-span-1">
          <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Component Library</h3>
            <div className="space-y-3">
              {availableComponents.map((component) => (
                <motion.div
                  key={component.type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-3 bg-[#2D3748] rounded-lg cursor-pointer hover:bg-[#374151] transition-colors"
                  onClick={() => addComponent(component.type)}
                >
                  <div className="flex items-center gap-3">
                    <component.icon className="w-5 h-5 text-[#8BAE5A]" />
                    <div>
                      <p className="text-white text-sm font-medium">{component.name}</p>
                      <p className="text-gray-400 text-xs">{component.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* KPI Definitions */}
          <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">KPI Definitions</h3>
              <button
                onClick={() => setShowKPIModal(true)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {kpis.map((kpi) => (
                <div key={kpi.id} className="p-3 bg-[#2D3748] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white text-sm font-medium">{kpi.name}</p>
                    <span className="text-gray-400 text-xs">{kpi.unit}</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-2">{kpi.description}</p>
                  {kpi.currentValue && (
                    <div className="flex items-center gap-2">
                      <span className="text-[#8BAE5A] font-semibold">{kpi.currentValue}</span>
                      {kpi.target && (
                        <span className="text-gray-400 text-xs">/ {kpi.target}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Report Canvas */}
        <div className="lg:col-span-2">
          <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Report Canvas</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDragMode(!dragMode)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    dragMode 
                      ? 'bg-[#8BAE5A] text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {dragMode ? 'Exit Drag Mode' : 'Drag Mode'}
                </button>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="bg-[#2D3748] border border-[#4A5568] text-white rounded px-2 py-1 text-sm"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="powerpoint">PowerPoint</option>
                </select>
              </div>
            </div>

            <div className="relative min-h-[600px] bg-white rounded-lg p-4">
              {components.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <DocumentTextIcon className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Empty Report Canvas</p>
                    <p className="text-sm">Drag components from the library to start building your report</p>
                  </div>
                </div>
              ) : (
                <Reorder.Group axis="y" values={components} onReorder={setComponents}>
                  {components.map((component) => (
                    <Reorder.Item key={component.id} value={component}>
                      <motion.div
                        layout
                        className="relative mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#8BAE5A] transition-colors"
                        style={{
                          width: component.size.width,
                          height: component.size.height
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getComponentIcon(component.type)}
                            <span className="text-sm font-medium text-gray-700">{component.title}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateComponent(component.id, { title: 'Updated Title' })}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <PencilIcon className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeComponent(component.id)}
                              className="p-1 text-red-400 hover:text-red-600 transition-colors"
                            >
                              <TrashIcon className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Component Preview */}
                        <div className="flex items-center justify-center h-full text-gray-500">
                          {component.type === 'metric' && (
                            <div className="text-center">
                              <div className="text-2xl font-bold text-[#8BAE5A]">30.5%</div>
                              <div className="text-sm text-gray-400">Market Share</div>
                            </div>
                          )}
                          {component.type === 'chart' && (
                            <div className="text-center">
                              <ChartBarIcon className="w-8 h-8 mx-auto mb-2" />
                              <div className="text-sm">Chart Component</div>
                            </div>
                          )}
                          {component.type === 'table' && (
                            <div className="text-center">
                              <TableCellsIcon className="w-8 h-8 mx-auto mb-2" />
                              <div className="text-sm">Table Component</div>
                            </div>
                          )}
                          {component.type === 'text' && (
                            <div className="text-center">
                              <DocumentTextIcon className="w-8 h-8 mx-auto mb-2" />
                              <div className="text-sm">Text Component</div>
                            </div>
                          )}
                          {component.type === 'image' && (
                            <div className="text-center">
                              <PhotoIcon className="w-8 h-8 mx-auto mb-2" />
                              <div className="text-sm">Image Component</div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              )}
            </div>
          </div>
        </div>

        {/* Templates & Export Options */}
        <div className="lg:col-span-1">
          <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Report Templates</h3>
            <div className="space-y-3">
              {templates.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate?.id === template.id 
                      ? 'bg-[#8BAE5A]/20 border border-[#8BAE5A]' 
                      : 'bg-[#2D3748] hover:bg-[#374151]'
                  }`}
                  onClick={() => loadTemplate(template)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(template.category)}
                    <span className="text-white text-sm font-medium">{template.name}</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-2">{template.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{template.components.length} components</span>
                    <span>{new Date(template.lastModified).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4 mt-4">
            <h3 className="text-lg font-semibold text-white mb-4">Export Options</h3>
            <div className="space-y-3">
              <div className="p-3 bg-[#2D3748] rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <DocumentArrowDownIcon className="w-5 h-5 text-blue-400" />
                  <span className="text-white text-sm font-medium">PDF Report</span>
                </div>
                <p className="text-gray-400 text-xs mb-2">Professional PDF format with charts and tables</p>
                <button
                  onClick={() => exportReport('pdf')}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Export PDF
                </button>
              </div>

              <div className="p-3 bg-[#2D3748] rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <TableCellsIcon className="w-5 h-5 text-green-400" />
                  <span className="text-white text-sm font-medium">Excel Spreadsheet</span>
                </div>
                <p className="text-gray-400 text-xs mb-2">Data tables and metrics in Excel format</p>
                <button
                  onClick={() => exportReport('excel')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Export Excel
                </button>
              </div>

              <div className="p-3 bg-[#2D3748] rounded-lg">
                                  <div className="flex items-center gap-3 mb-2">
                    <DocumentTextIcon className="w-5 h-5 text-orange-400" />
                    <span className="text-white text-sm font-medium">PowerPoint</span>
                  </div>
                <p className="text-gray-400 text-xs mb-2">Presentation-ready slides with charts</p>
                <button
                  onClick={() => exportReport('powerpoint')}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Export PPT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Template Modal */}
      <AnimatePresence>
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1A1F2E] rounded-xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Save Report Template</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Template Name</label>
                  <input
                    type="text"
                    className="w-full bg-[#2D3748] border border-[#4A5568] text-white rounded-lg px-3 py-2"
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Description</label>
                  <textarea
                    className="w-full bg-[#2D3748] border border-[#4A5568] text-white rounded-lg px-3 py-2"
                    rows={3}
                    placeholder="Enter template description"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Category</label>
                  <select className="w-full bg-[#2D3748] border border-[#4A5568] text-white rounded-lg px-3 py-2">
                    <option value="executive">Executive</option>
                    <option value="operational">Operational</option>
                    <option value="competitive">Competitive</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={saveTemplate}
                  className="flex-1 bg-[#8BAE5A] hover:bg-[#7A9D49] text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Save Template
                </button>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
} 