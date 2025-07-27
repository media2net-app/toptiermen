'use client';

import { useState, useEffect } from 'react';
import { 
  EyeIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CursorArrowRaysIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// Types
interface Report {
  id: string;
  name: string;
  type: 'performance' | 'conversion' | 'audience' | 'budget' | 'custom';
  status: 'generating' | 'completed' | 'failed';
  dateRange: string;
  createdAt: string;
  completedAt?: string;
  fileSize?: string;
  downloadUrl?: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'performance' | 'conversion' | 'audience' | 'budget' | 'custom';
  metrics: string[];
  schedule?: 'daily' | 'weekly' | 'monthly';
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);

  // Mock data
  useEffect(() => {
    const mockReports: Report[] = [
      {
        id: "1",
        name: "Marketing Performance Report - Juli 2025",
        type: "performance",
        status: "completed",
        dateRange: "2025-07-01 - 2025-07-31",
        createdAt: "2025-07-27T10:00:00Z",
        completedAt: "2025-07-27T10:05:00Z",
        fileSize: "2.4 MB",
        downloadUrl: "/reports/performance-july-2025.pdf"
      },
      {
        id: "2",
        name: "Conversie Analyse - Juli 2025",
        type: "conversion",
        status: "completed",
        dateRange: "2025-07-01 - 2025-07-31",
        createdAt: "2025-07-26T15:30:00Z",
        completedAt: "2025-07-26T15:35:00Z",
        fileSize: "1.8 MB",
        downloadUrl: "/reports/conversion-july-2025.pdf"
      },
      {
        id: "3",
        name: "Audience Insights - Juli 2025",
        type: "audience",
        status: "completed",
        dateRange: "2025-07-01 - 2025-07-31",
        createdAt: "2025-07-25T09:15:00Z",
        completedAt: "2025-07-25T09:20:00Z",
        fileSize: "3.1 MB",
        downloadUrl: "/reports/audience-july-2025.pdf"
      },
      {
        id: "4",
        name: "Budget Rapport - Juli 2025",
        type: "budget",
        status: "generating",
        dateRange: "2025-07-01 - 2025-07-31",
        createdAt: "2025-07-27T14:00:00Z"
      },
      {
        id: "5",
        name: "Custom Campaign Analysis",
        type: "custom",
        status: "failed",
        dateRange: "2025-07-15 - 2025-07-27",
        createdAt: "2025-07-27T11:00:00Z"
      }
    ];

    const mockTemplates: ReportTemplate[] = [
      {
        id: "1",
        name: "Marketing Performance Report",
        description: "Compleet overzicht van alle marketing prestaties inclusief impressions, clicks, conversies en ROAS",
        type: "performance",
        metrics: ["Impressions", "Clicks", "CTR", "Conversions", "Conversion Rate", "ROAS", "CPC", "CPA"],
        schedule: "weekly"
      },
      {
        id: "2",
        name: "Conversie Funnel Analysis",
        description: "Gedetailleerde analyse van de conversie funnel en drop-off punten",
        type: "conversion",
        metrics: ["Funnel Steps", "Drop-off Rates", "Conversion Rates", "Revenue", "Cost", "ROAS"],
        schedule: "monthly"
      },
      {
        id: "3",
        name: "Audience Demographics Report",
        description: "Uitgebreide audience inzichten en demografische data",
        type: "audience",
        metrics: ["Age Groups", "Gender", "Geographic", "Interests", "Device Usage", "Behavior"],
        schedule: "monthly"
      },
      {
        id: "4",
        name: "Budget & Spending Report",
        description: "Budget tracking en uitgaven analyse per campagne en platform",
        type: "budget",
        metrics: ["Budget Allocation", "Spending Trends", "Budget Utilization", "ROI", "Cost Analysis"],
        schedule: "weekly"
      },
      {
        id: "5",
        name: "Custom Report Builder",
        description: "Bouw je eigen rapport met specifieke metrics en filters",
        type: "custom",
        metrics: ["Custom Selection"]
      }
    ];

    setReports(mockReports);
    setTemplates(mockTemplates);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-900/20';
      case 'generating': return 'text-yellow-400 bg-yellow-900/20';
      case 'failed': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return <ChartBarIcon className="w-5 h-5" />;
      case 'conversion': return <CursorArrowRaysIcon className="w-5 h-5" />;
      case 'audience': return <UserGroupIcon className="w-5 h-5" />;
      case 'budget': return <CurrencyDollarIcon className="w-5 h-5" />;
      case 'custom': return <EyeIcon className="w-5 h-5" />;
      default: return <ChartBarIcon className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'performance': return 'text-blue-400';
      case 'conversion': return 'text-green-400';
      case 'audience': return 'text-purple-400';
      case 'budget': return 'text-yellow-400';
      case 'custom': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Rapporten</h1>
          <p className="text-gray-400 mt-1">Genereer en beheer marketing rapporten</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-[#3A4D23] hover:bg-[#4A5D33] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Nieuw Rapport</span>
        </button>
      </div>

      {/* Report Templates */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Rapport Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="border border-[#2D3748] rounded-lg p-4 hover:border-[#8BAE5A] transition-colors">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-2 rounded-lg ${getTypeColor(template.type)} bg-opacity-20`}>
                  {getTypeIcon(template.type)}
                </div>
                <div>
                  <h3 className="font-medium text-white">{template.name}</h3>
                  {template.schedule && (
                    <p className="text-gray-400 text-sm">{template.schedule}</p>
                  )}
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-3">{template.description}</p>
              <div className="space-y-2">
                <p className="text-gray-300 text-sm font-medium">Inclusief metrics:</p>
                <div className="flex flex-wrap gap-1">
                  {template.metrics.slice(0, 3).map((metric, index) => (
                    <span key={index} className="px-2 py-1 bg-[#2D3748] rounded text-xs text-gray-300">
                      {metric}
                    </span>
                  ))}
                  {template.metrics.length > 3 && (
                    <span className="px-2 py-1 bg-[#2D3748] rounded text-xs text-gray-300">
                      +{template.metrics.length - 3} meer
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setSelectedTemplate(template)}
                className="w-full mt-4 bg-[#3A4D23] hover:bg-[#4A5D33] text-white px-4 py-2 rounded-lg transition-colors"
              >
                Gebruik Template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recente Rapporten</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#2D3748]">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Rapport</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Datum Bereik</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Gemaakt</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Grootte</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D3748]">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-[#2D3748] transition-colors">
                  <td className="px-4 py-2 text-sm font-medium text-white">{report.name}</td>
                  <td className="px-4 py-2 text-sm">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(report.type)}
                      <span className={getTypeColor(report.type)}>{report.type}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status === 'generating' && <ClockIcon className="w-3 h-3 inline mr-1" />}
                      {report.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">{report.dateRange}</td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">{report.fileSize || '-'}</td>
                  <td className="px-4 py-2 text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {report.status === 'completed' && (
                        <button className="text-[#8BAE5A] hover:text-[#9BBE6A]">
                          <DocumentArrowDownIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button className="text-blue-400 hover:text-blue-300">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button className="text-red-400 hover:text-red-300">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4">
          <p className="text-gray-400 text-sm">Totaal Rapporten</p>
          <p className="text-2xl font-bold text-white">{reports.length}</p>
        </div>
        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4">
          <p className="text-gray-400 text-sm">Voltooid</p>
          <p className="text-2xl font-bold text-white">{reports.filter(r => r.status === 'completed').length}</p>
        </div>
        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4">
          <p className="text-gray-400 text-sm">In Generatie</p>
          <p className="text-2xl font-bold text-white">{reports.filter(r => r.status === 'generating').length}</p>
        </div>
        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4">
          <p className="text-gray-400 text-sm">Templates</p>
          <p className="text-2xl font-bold text-white">{templates.length}</p>
        </div>
      </div>

      {/* Scheduled Reports */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Geplande Rapporten</h2>
        <div className="space-y-4">
          {templates.filter(t => t.schedule).map((template) => (
            <div key={template.id} className="flex items-center justify-between p-4 border border-[#2D3748] rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getTypeColor(template.type)} bg-opacity-20`}>
                  {getTypeIcon(template.type)}
                </div>
                <div>
                  <h3 className="font-medium text-white">{template.name}</h3>
                  <p className="text-gray-400 text-sm">{template.schedule} rapport</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="text-blue-400 hover:text-blue-300">
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button className="text-red-400 hover:text-red-300">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {templates.filter(t => t.schedule).length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">Geen geplande rapporten</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 