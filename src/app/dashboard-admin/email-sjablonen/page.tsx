'use client';

import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  description: string;
  process: string;
  enabled: boolean;
  lastUsed?: string;
  usageCount: number;
}

interface EmailTemplateStatus {
  [key: string]: boolean;
}

export default function EmailSjablonenPage() {
  const { user, profile } = useSupabaseAuth();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [templateStatus, setTemplateStatus] = useState<EmailTemplateStatus>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // Check if user is admin
  if (!user || profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Toegang Geweigerd</h1>
          <p className="text-gray-300">Je hebt geen toegang tot deze pagina.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadEmailTemplates();
    loadTemplateStatus();
  }, []);

  const loadEmailTemplates = async () => {
    try {
      // Define all email templates used in the system
      const emailTemplates: EmailTemplate[] = [
        {
          id: 'welcome',
          name: 'Welkom Email',
          subject: '🎯 Welkom bij Top Tier Men - Jouw reis naar excellentie begint hier',
          description: 'Welkom email voor nieuwe gebruikers bij registratie',
          process: 'User Registration',
          enabled: true,
          usageCount: 0
        },
        {
          id: 'password-reset',
          name: 'Wachtwoord Reset',
          subject: '🔐 Je Nieuwe Top Tier Men Wachtwoord - Wachtwoord Reset',
          description: 'Email met nieuw wachtwoord bij wachtwoord reset',
          process: 'Password Reset',
          enabled: true,
          usageCount: 0
        },
        {
          id: 'account-credentials',
          name: 'Account Gegevens',
          subject: '🔐 Je Top Tier Men Account Gegevens',
          description: 'Email met account gegevens voor nieuwe gebruikers',
          process: 'Account Creation',
          enabled: true,
          usageCount: 0
        },
        {
          id: 'sneak-preview',
          name: 'Sneak Preview',
          subject: '🎬 Exclusieve Sneak Preview - Top Tier Men Platform',
          description: 'Sneak preview email voor pre-launch gebruikers',
          process: 'Sneak Preview Campaign',
          enabled: true,
          usageCount: 0
        },
        {
          id: 'onboarding-welcome',
          name: 'Onboarding Welkom',
          subject: '🚀 Welkom in je Onboarding - Top Tier Men',
          description: 'Welkom email bij start van onboarding proces',
          process: 'Onboarding Flow',
          enabled: true,
          usageCount: 0
        },
        {
          id: 'challenge-reminder',
          name: 'Challenge Herinnering',
          subject: '🔥 Dagelijkse Challenge - Top Tier Men',
          description: 'Herinnering voor dagelijkse challenges',
          process: 'Daily Challenges',
          enabled: true,
          usageCount: 0
        },
        {
          id: 'badge-earned',
          name: 'Badge Verdiend',
          subject: '🏆 Nieuwe Badge Verdiend - Top Tier Men',
          description: 'Notificatie wanneer gebruiker een badge verdient',
          process: 'Badge System',
          enabled: true,
          usageCount: 0
        },
        {
          id: 'newsletter',
          name: 'Newsletter',
          subject: '📰 Top Tier Men Newsletter',
          description: 'Maandelijkse newsletter met updates en tips',
          process: 'Newsletter Campaign',
          enabled: true,
          usageCount: 0
        }
      ];

      setTemplates(emailTemplates);
    } catch (error) {
      console.error('Error loading email templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplateStatus = async () => {
    try {
      const response = await fetch('/api/admin/email-template-status');
      if (response.ok) {
        const data = await response.json();
        setTemplateStatus(data.status || {});
      }
    } catch (error) {
      console.error('Error loading template status:', error);
    }
  };

  const toggleTemplateStatus = async (templateId: string) => {
    setSaving(templateId);
    try {
      const newStatus = !templateStatus[templateId];
      
      const response = await fetch('/api/admin/email-template-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId,
          enabled: newStatus
        }),
      });

      if (response.ok) {
        setTemplateStatus(prev => ({
          ...prev,
          [templateId]: newStatus
        }));
      } else {
        console.error('Failed to update template status');
      }
    } catch (error) {
      console.error('Error updating template status:', error);
    } finally {
      setSaving(null);
    }
  };

  const previewTemplate = async (templateId: string) => {
    try {
      const response = await fetch('/api/admin/email-template-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateId }),
      });

      if (response.ok) {
        const data = await response.json();
        // Open preview in new tab
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(data.html);
          newWindow.document.close();
        }
      } else {
        console.error('Failed to generate preview');
      }
    } catch (error) {
      console.error('Error generating preview:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-white mb-2">Email Sjablonen Laden...</h3>
          <p className="text-gray-300">Even geduld, we laden alle email sjablonen</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            📧 Email Sjablonen Beheer
          </h1>
          <p className="text-gray-300 text-lg">
            Beheer alle email sjablonen en hun status in het platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500 rounded-lg">
                <span className="text-2xl">📧</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Totaal Sjablonen</p>
                <p className="text-2xl font-bold text-white">{templates.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-green-500 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Actief</p>
                <p className="text-2xl font-bold text-white">
                  {Object.values(templateStatus).filter(Boolean).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-red-500 rounded-lg">
                <span className="text-2xl">❌</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Uitgeschakeld</p>
                <p className="text-2xl font-bold text-white">
                  {Object.values(templateStatus).filter(status => !status).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-500 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Totaal Verzonden</p>
                <p className="text-2xl font-bold text-white">
                  {templates.reduce((sum, template) => sum + template.usageCount, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Templates Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Email Sjablonen Overzicht</h2>
            <p className="text-gray-400 mt-1">Beheer de status van alle email sjablonen</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Sjabloon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Proces
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Gebruik
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {template.name}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          {template.description}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Subject: {template.subject}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {template.process}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <button
                          onClick={() => toggleTemplateStatus(template.id)}
                          disabled={saving === template.id}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] focus:ring-offset-2 focus:ring-offset-gray-800 ${
                            templateStatus[template.id] !== false ? 'bg-[#8BAE5A]' : 'bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              templateStatus[template.id] !== false ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className={`ml-3 text-sm font-medium ${
                          templateStatus[template.id] !== false ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {templateStatus[template.id] !== false ? 'Actief' : 'Uitgeschakeld'}
                        </span>
                        {saving === template.id && (
                          <div className="ml-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#8BAE5A]"></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300">
                        {template.usageCount} verzonden
                      </div>
                      {template.lastUsed && (
                        <div className="text-xs text-gray-500">
                          Laatst: {new Date(template.lastUsed).toLocaleDateString('nl-NL')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => previewTemplate(template.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-[#8BAE5A] hover:bg-[#7A9E4A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8BAE5A]"
                        >
                          👁️ Preview
                        </button>
                        <button
                          onClick={() => toggleTemplateStatus(template.id)}
                          disabled={saving === template.id}
                          className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md ${
                            templateStatus[template.id] !== false
                              ? 'text-white bg-red-600 hover:bg-red-700'
                              : 'text-white bg-green-600 hover:bg-green-700'
                          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800`}
                        >
                          {templateStatus[template.id] !== false ? '❌ Uitschakelen' : '✅ Inschakelen'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-3">
            ℹ️ Informatie over Email Sjablonen
          </h3>
          <div className="text-sm text-gray-300 space-y-2">
            <p>
              • <strong>Actief:</strong> Email sjabloon wordt gebruikt wanneer het proces wordt uitgevoerd
            </p>
            <p>
              • <strong>Uitgeschakeld:</strong> Email sjabloon wordt overgeslagen, proces gaat door zonder email
            </p>
            <p>
              • <strong>Preview:</strong> Bekijk hoe de email eruit ziet in een nieuw tabblad
            </p>
            <p>
              • <strong>Status wijzigingen</strong> worden direct opgeslagen en zijn meteen actief
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
