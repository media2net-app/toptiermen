'use client';

import { useState } from 'react';
import { 
  EnvelopeIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  ctaText: string;
  ctaUrl: string;
  description: string;
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'new-campaign',
    name: 'Nieuwe Campagne Aankondiging',
    subject: 'Nieuwe Top Tier Men Campagne - Ontdek je potentieel',
    content: 'We hebben een nieuwe campagne gelanceerd die perfect bij jou past. Ontdek hoe je jezelf kunt transformeren tot een echte Top Tier Man met onze bewezen methoden en exclusieve community.',
    ctaText: 'Bekijk de Campagne',
    ctaUrl: 'https://platform.toptiermen.eu/prelaunch',
    description: 'Aankondiging van nieuwe campagnes en programma\'s'
  },
  {
    id: 'brotherhood-invite',
    name: 'Broederschap Uitnodiging',
    subject: 'Exclusieve uitnodiging: Word onderdeel van de Top Tier Men Broederschap',
    content: 'Je bent geselecteerd voor een exclusieve uitnodiging tot de Top Tier Men Broederschap. Word onderdeel van een community van gelijkgestemden die elkaar naar succes duwen.',
    ctaText: 'Accepteer Uitnodiging',
    ctaUrl: 'https://platform.toptiermen.eu/dashboard',
    description: 'Uitnodiging voor exclusieve broederschap'
  },
  {
    id: 'training-reminder',
    name: 'Training Herinnering',
    subject: 'Je training wacht - Blijf consistent voor resultaten',
    content: 'Consistentie is de sleutel tot succes. Je training schema is klaar en wacht op je. Blijf op koers en zie de resultaten die je verdient.',
    ctaText: 'Start Training',
    ctaUrl: 'https://platform.toptiermen.eu/dashboard/training',
    description: 'Herinnering voor training en consistentie'
  },
  {
    id: 'nutrition-update',
    name: 'Voeding Update',
    subject: 'Nieuw voedingsplan beschikbaar - Optimaliseer je prestaties',
    content: 'We hebben je voedingsplan geüpdatet op basis van je voortgang. Ontdek nieuwe recepten en strategieën om je prestaties te maximaliseren.',
    ctaText: 'Bekijk Plan',
    ctaUrl: 'https://platform.toptiermen.eu/dashboard/voeding',
    description: 'Updates over voedingsplannen en recepten'
  },
  {
    id: 'community-event',
    name: 'Community Event',
    subject: 'Exclusief event: Ontmoet je broeders live',
    content: 'We organiseren een exclusief live event waar je je broeders kunt ontmoeten. Een unieke kans om te netwerken en je reis te versnellen.',
    ctaText: 'Schrijf je in',
    ctaUrl: 'https://platform.toptiermen.eu/events',
    description: 'Aankondiging van live events en meetups'
  }
];

export default function EmailCampagnesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [customSubject, setCustomSubject] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [customCtaText, setCustomCtaText] = useState('');
  const [customCtaUrl, setCustomCtaUrl] = useState('');
  const [recipientList, setRecipientList] = useState('all'); // 'all', 'active', 'inactive', 'custom'
  const [customEmails, setCustomEmails] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setCustomSubject(template.subject);
    setCustomContent(template.content);
    setCustomCtaText(template.ctaText);
    setCustomCtaUrl(template.ctaUrl);
  };

  const handleSendEmail = async () => {
    if (!selectedTemplate && (!customSubject || !customContent)) {
      setSendResult({ success: false, message: 'Vul alle vereiste velden in' });
      return;
    }

    setIsSending(true);
    setSendResult(null);

    try {
      // For now, we'll simulate sending to a test email
      const testEmail = 'test@example.com';
      
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          template: 'marketing',
          variables: {
            name: 'Test User',
            subject: customSubject || selectedTemplate?.subject || '',
            content: customContent || selectedTemplate?.content || '',
            ctaText: customCtaText || selectedTemplate?.ctaText || '',
            ctaUrl: customCtaUrl || selectedTemplate?.ctaUrl || ''
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        setSendResult({ 
          success: true, 
          message: `Email succesvol verzonden naar ${testEmail}`, 
          count: 1 
        });
      } else {
        const error = await response.json();
        setSendResult({ success: false, message: error.error || 'Fout bij verzenden' });
      }
    } catch (error) {
      setSendResult({ success: false, message: 'Netwerkfout bij verzenden' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#8BAE5A] mb-4">
            <EnvelopeIcon className="w-8 h-8 inline mr-3" />
            Email Campagnes
          </h1>
          <p className="text-gray-300 text-lg">
            Verstuur marketing emails naar je community met professionele templates
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Template Selection */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-[#8BAE5A] mb-4">
                <DocumentTextIcon className="w-6 h-6 inline mr-2" />
                Email Templates
              </h2>
              
              <div className="space-y-3">
                {EMAIL_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-700'
                    }`}
                  >
                    <h3 className="font-semibold text-white mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">{template.description}</p>
                    <p className="text-xs text-gray-500">{template.subject}</p>
                  </button>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-400 mb-2">
                  <InformationCircleIcon className="w-4 h-4 inline mr-1" />
                  SMTP Configuratie
                </h3>
                <p className="text-xs text-gray-300">
                  Emails worden verzonden via: <strong>platform@toptiermen.eu</strong>
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  Server: <strong>toptiermen.eu:465</strong> (SSL)
                </p>
              </div>
            </div>
          </div>

          {/* Email Editor */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-[#8BAE5A] mb-4">
                <PaperAirplaneIcon className="w-6 h-6 inline mr-2" />
                Email Editor
              </h2>

              {selectedTemplate && (
                <div className="mb-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <p className="text-sm text-green-400">
                    <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                    Template geselecteerd: <strong>{selectedTemplate.name}</strong>
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Onderwerp</label>
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="Email onderwerp..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
                  <textarea
                    value={customContent}
                    onChange={(e) => setCustomContent(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="Email content..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">CTA Tekst</label>
                    <input
                      type="text"
                      value={customCtaText}
                      onChange={(e) => setCustomCtaText(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      placeholder="Bekijk meer..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">CTA URL</label>
                    <input
                      type="url"
                      value={customCtaUrl}
                      onChange={(e) => setCustomCtaUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Ontvangers</label>
                  <select
                    value={recipientList}
                    onChange={(e) => setRecipientList(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="all">Alle gebruikers</option>
                    <option value="active">Actieve gebruikers</option>
                    <option value="inactive">Inactieve gebruikers</option>
                    <option value="custom">Aangepaste lijst</option>
                  </select>
                </div>

                {recipientList === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Adressen</label>
                    <textarea
                      value={customEmails}
                      onChange={(e) => setCustomEmails(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      placeholder="email1@example.com, email2@example.com..."
                    />
                    <p className="text-xs text-gray-400 mt-1">Scheid email adressen met komma's</p>
                  </div>
                )}

                {sendResult && (
                  <div className={`p-4 rounded-lg ${
                    sendResult.success 
                      ? 'bg-green-900/20 border border-green-500/30' 
                      : 'bg-red-900/20 border border-red-500/30'
                  }`}>
                    <p className={`text-sm ${
                      sendResult.success ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {sendResult.success ? (
                        <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                      ) : (
                        <ExclamationTriangleIcon className="w-4 h-4 inline mr-1" />
                      )}
                      {sendResult.message}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleSendEmail}
                  disabled={isSending}
                  className="w-full bg-[#8BAE5A] hover:bg-[#7A9F4A] disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
                >
                  {isSending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Verzenden...</span>
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="w-5 h-5" />
                      <span>Verstuur Email Campagne</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Email Statistics */}
        <div className="mt-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-[#8BAE5A] mb-4">
              <ChartBarIcon className="w-6 h-6 inline mr-2" />
              Email Statistieken
            </h2>
            
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-white">0</div>
                <div className="text-sm text-gray-400">Verzonden Vandaag</div>
              </div>
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-white">0</div>
                <div className="text-sm text-gray-400">Verzonden Deze Week</div>
              </div>
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-white">0%</div>
                <div className="text-sm text-gray-400">Open Rate</div>
              </div>
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-white">0%</div>
                <div className="text-sm text-gray-400">Click Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
