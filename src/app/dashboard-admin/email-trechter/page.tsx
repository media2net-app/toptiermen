'use client';

import { useState, useEffect } from 'react';
import { ChevronRightIcon, PlusIcon, XMarkIcon, EyeIcon, PencilIcon, PlayIcon, PauseIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import AdminButton from '@/components/admin/AdminButton';
import AdminCard from '@/components/admin/AdminCard';
import UnifiedEmailBuilder from '@/components/admin/UnifiedEmailBuilder';
import EmailBuilder from '@/components/admin/EmailBuilder';
import SimpleEmailEditor from '@/components/admin/SimpleEmailEditor';

interface EmailStep {
  id: string;
  stepNumber: number;
  name: string;
  subject: string;
  content: string;
  delayDays: number;
  status: 'active' | 'paused' | 'draft';
  sentCount: number;
  openRate: number;
  design?: any;
}

interface EmailCampaign {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft';
  totalEmails: number;
  totalOpens: number;
  totalClicks: number;
  steps: EmailStep[];
}

interface Campaign {
  id: string;
  name: string;
  totalEmails: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

interface CampaignStats {
  totalSent: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

export default function EmailTrechter() {
  const [emailSteps, setEmailSteps] = useState<EmailStep[]>([
    {
      id: '1',
      stepNumber: 1,
      name: 'Welkom & Introductie',
      subject: '🎯 Welkom bij TopTierMen - Jouw reis naar excellentie begint nu',
      content: `Beste {{name}},

Welkom bij TopTierMen! 🚀

We zijn verheugd dat je interesse hebt getoond in onze exclusieve broederschap van top performers. Je hebt de eerste stap gezet naar een leven van buitengewone prestaties en persoonlijke transformatie.

**Wat maakt TopTierMen uniek?**

🏆 **De Broederschap**: Word onderdeel van een exclusieve community van gelijkgestemden die elkaar naar succes duwen
🎯 **Wekelijkse Video Calls**: Elke week evalueren we samen je voortgang met alle broeders
💪 **Persoonlijke Transformatie**: Ontwikkel jezelf tot een echte Top Tier Man
📈 **Bewezen Methoden**: Strategieën die al honderden mensen naar succes hebben geleid
⚡ **24/7 Brotherhood Support**: Altijd toegang tot je broeders en coaches

Met broederlijke groeten,
Het TopTierMen Team`,
      delayDays: 0,
      status: 'active',
      sentCount: 0,
      openRate: 0
    },
    {
      id: '2',
      stepNumber: 2,
      name: 'Waarde & Validatie',
      subject: '💪 Dit is waarom TopTierMen anders is dan de rest',
      content: `Beste {{name}},

Gisteren stuurde ik je mijn welkomstmail, en vandaag wil ik je laten zien waarom TopTierMen fundamenteel anders is dan elke andere "self-help" cursus of community die je misschien hebt geprobeerd.

**Het probleem met de meeste programma's:**
❌ Ze geven je alleen informatie, maar geen echte verantwoordelijkheid
❌ Je bent alleen in je reis - geen echte broederschap
❌ Geen wekelijkse check-ins of accountability

**Hoe TopTierMen dit oplost:**
✅ **Echte Broederschap**: Je wordt onderdeel van een hechte groep mannen die samen groeien
✅ **Wekelijkse Accountability**: Elke week video calls waar we je voortgang bespreken
✅ **Bewezen Track Record**: Al 300+ mannen geholpen hun leven te transformeren

Tot morgen,
Het TopTierMen Team`,
      delayDays: 1,
      status: 'active',
      sentCount: 0,
      openRate: 0
    },
    {
      id: '3',
      stepNumber: 3,
      name: 'Call-to-Action',
      subject: '🚀 Klaar voor je transformatie? Hier is je next step...',
      content: `Beste {{name}},

De afgelopen 2 dagen heb je een inkijkje gekregen in wat TopTierMen is en waarom we anders zijn. Vandaag is het tijd voor actie.

**Je hebt 3 opties:**

**Optie 1: Niets doen** 
Je sluit deze email, gaat verder met je huidige leven, en over een jaar ben je nog steeds op dezelfde plek.

**Optie 2: Het alleen proberen**
Je koopt nog een cursus, leest nog een boek, kijkt nog meer YouTube video's. Zonder accountability en broederschap is duurzame verandering bijna onmogelijk.

**Optie 3: Jezelf committeren aan echte groei**
Je neemt de stap en wordt onderdeel van een broederschap van mannen die net zo serieus zijn over hun ontwikkeling als jij.

[🚀 JA, IK BEN KLAAR VOOR MIJN TRANSFORMATIE]

Tot snel in de broederschap,
Het TopTierMen Team`,
      delayDays: 3,
      status: 'active',
      sentCount: 0,
      openRate: 0
    }
  ]);

  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'Welkom Funnel',
      totalEmails: 1247,
      openRate: 68.2,
      clickRate: 12.4,
      conversionRate: 3.8
    },
    {
      id: '2', 
      name: 'Re-engagement',
      totalEmails: 856,
      openRate: 45.1,
      clickRate: 8.9,
      conversionRate: 2.1
    }
  ]);

  const [campaignStats, setCampaignStats] = useState<CampaignStats>({
    totalSent: 4444,
    openRate: 62.1,
    clickRate: 12.2,
    conversionRate: 3.7
  });

  const [showPreview, setShowPreview] = useState(false);
  const [selectedStep, setSelectedStep] = useState<EmailStep | null>(null);
  const [showUnifiedBuilder, setShowUnifiedBuilder] = useState(false);
  const [showEmailBuilder, setShowEmailBuilder] = useState(false);
  const [showSimpleEditor, setShowSimpleEditor] = useState(false);
  const [selectedStepForEdit, setSelectedStepForEdit] = useState<EmailStep | null>(null);

  const handleStepStatusToggle = (stepId: string) => {
    setEmailSteps(steps => 
      steps.map(step => {
        if (step.id === stepId) {
          return {
            ...step,
            status: step.status === 'active' ? 'paused' : 'active'
          };
        }
        return step;
      })
    );
  };

  const handlePreview = (step: EmailStep) => {
    setSelectedStep(step);
    setShowPreview(true);
  };

  const handleEdit = (step: EmailStep, editorType: 'unified' | 'advanced' | 'simple') => {
    setSelectedStepForEdit(step);
    if (editorType === 'unified') {
      setShowUnifiedBuilder(true);
    } else if (editorType === 'advanced') {
      setShowEmailBuilder(true);
    } else {
      setShowSimpleEditor(true);
    }
  };

  const handleSaveUnifiedEmail = (content: any) => {
    if (selectedStepForEdit) {
      setEmailSteps(steps =>
        steps.map(step =>
          step.id === selectedStepForEdit.id
            ? { ...step, design: content }
            : step
        )
      );
    }
    setShowUnifiedBuilder(false);
    setSelectedStepForEdit(null);
  };

  const handleSaveAdvancedEmail = (content: any) => {
    if (selectedStepForEdit) {
      setEmailSteps(steps =>
        steps.map(step =>
          step.id === selectedStepForEdit.id
            ? { ...step, design: content }
            : step
        )
      );
    }
    setShowEmailBuilder(false);
    setSelectedStepForEdit(null);
  };

  const handleSaveSimpleEmail = (content: string) => {
    if (selectedStepForEdit) {
      setEmailSteps(steps =>
        steps.map(step =>
          step.id === selectedStepForEdit.id
            ? { ...step, content }
            : step
        )
      );
    }
    setShowSimpleEditor(false);
    setSelectedStepForEdit(null);
  };

  const handleDuplicate = (step: EmailStep) => {
    const newStep: EmailStep = {
      ...step,
      id: `${step.id}_copy_${Date.now()}`,
      name: `${step.name} (Kopie)`,
      status: 'draft'
    };
    setEmailSteps(steps => [...steps, newStep]);
  };

  const addNewStep = () => {
    const newStep: EmailStep = {
      id: `step_${Date.now()}`,
      stepNumber: emailSteps.length + 1,
      name: 'Nieuwe Email',
      subject: 'Nieuwe email onderwerp',
      content: 'Nieuwe email content...',
      delayDays: emailSteps.length,
      status: 'draft',
      sentCount: 0,
      openRate: 0
    };
    setEmailSteps([...emailSteps, newStep]);
  };

  return (
    <div className="p-6 bg-[#0F1419] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#F3F3F1] mb-2">Email Marketing</h1>
          <p className="text-[#8BAE5A]">Beheer de 3-email campagne voor nieuwe leads</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <AdminCard>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#8BAE5A] mb-1">{campaignStats.totalSent.toLocaleString()}</div>
              <div className="text-sm text-[#8A9BA8]">Totaal Leads</div>
            </div>
          </AdminCard>
          
          <AdminCard>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#FFD700] mb-1">{campaignStats.openRate}%</div>
              <div className="text-sm text-[#8A9BA8]">Open Rate</div>
            </div>
          </AdminCard>
          
          <AdminCard>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#FF6B6B] mb-1">{campaignStats.clickRate}%</div>
              <div className="text-sm text-[#8A9BA8]">Total Clicks</div>
            </div>
          </AdminCard>
          
          <AdminCard>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#4ECDC4] mb-1">{campaignStats.conversionRate}%</div>
              <div className="text-sm text-[#8A9BA8]">Conversie Rate</div>
            </div>
          </AdminCard>
        </div>

        {/* Email Trechter */}
        <AdminCard className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#F3F3F1]">Email Trechter</h2>
            <AdminButton 
              onClick={addNewStep}
              className="bg-[#8BAE5A] hover:bg-[#B6C948] text-[#0F1419]"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Nieuwe Email
            </AdminButton>
          </div>

          <div className="space-y-4">
            {emailSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex-1">
                  <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-6 hover:border-[#8BAE5A] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-8 h-8 bg-[#8BAE5A] text-[#0F1419] rounded-full flex items-center justify-center font-bold">
                            {step.stepNumber}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-[#F3F3F1] text-lg">{step.name}</h3>
                            <p className="text-[#8BAE5A] text-sm">{step.subject}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              step.status === 'active' ? 'bg-[#8BAE5A] text-[#0F1419]' :
                              step.status === 'paused' ? 'bg-[#FFD700] text-[#0F1419]' :
                              'bg-[#8A9BA8] text-white'
                            }`}>
                              {step.status === 'active' ? 'Actief' : 
                               step.status === 'paused' ? 'Gepauzeerd' : 'Concept'}
                            </span>
                            <div className="text-right text-sm text-[#8A9BA8]">
                              <div>Verzonden na: {step.delayDays === 0 ? 'Direct' : `${step.delayDays} dagen`}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <AdminButton
                              onClick={() => handlePreview(step)}
                              size="sm"
                              variant="outline"
                            >
                              <EyeIcon className="w-4 h-4 mr-1" />
                              Bekijk
                            </AdminButton>
                            
                            <AdminButton
                              onClick={() => handleEdit(step, 'simple')}
                              size="sm"
                              variant="outline"
                            >
                              <PencilIcon className="w-4 h-4 mr-1" />
                              Bewerk
                            </AdminButton>
                            
                            <AdminButton
                              onClick={() => handleEdit(step, 'unified')}
                              size="sm"
                              className="bg-[#8BAE5A] hover:bg-[#B6C948] text-[#0F1419]"
                            >
                              🎨 Design
                            </AdminButton>
                            
                            <AdminButton
                              onClick={() => handleDuplicate(step)}
                              size="sm"
                              variant="outline"
                            >
                              <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
                              Kopieer
                            </AdminButton>
                            
                            <AdminButton
                              onClick={() => handleStepStatusToggle(step.id)}
                              size="sm"
                              variant={step.status === 'active' ? 'danger' : 'primary'}
                            >
                              {step.status === 'active' ? (
                                <>
                                  <PauseIcon className="w-4 h-4 mr-1" />
                                  Pauzeer
                                </>
                              ) : (
                                <>
                                  <PlayIcon className="w-4 h-4 mr-1" />
                                  Start
                                </>
                              )}
                            </AdminButton>
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm text-[#8A9BA8]">
                            <div>
                              <span className="text-[#F3F3F1] font-medium">{step.sentCount}</span> verzonden
                            </div>
                            <div>
                              <span className="text-[#F3F3F1] font-medium">{step.openRate}%</span> geopend
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {index < emailSteps.length - 1 && (
                  <div className="flex flex-col items-center mx-4">
                    <ChevronRightIcon className="w-6 h-6 text-[#8BAE5A]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </AdminCard>

        {/* Campaigns Overview */}
        <AdminCard>
          <h2 className="text-xl font-semibold text-[#F3F3F1] mb-6">Campagne Overzicht</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#3A4D23]">
                  <th className="text-left py-3 px-4 text-[#8A9BA8] font-medium">Campagne</th>
                  <th className="text-left py-3 px-4 text-[#8A9BA8] font-medium">Emails</th>
                  <th className="text-left py-3 px-4 text-[#8A9BA8] font-medium">Open Rate</th>
                  <th className="text-left py-3 px-4 text-[#8A9BA8] font-medium">Click Rate</th>
                  <th className="text-left py-3 px-4 text-[#8A9BA8] font-medium">Conversie</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-[#3A4D23] hover:bg-[#232D1A]/50">
                    <td className="py-3 px-4 text-[#F3F3F1] font-medium">{campaign.name}</td>
                    <td className="py-3 px-4 text-[#8A9BA8]">{campaign.totalEmails.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className="text-[#8BAE5A] font-medium">{campaign.openRate}%</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[#FFD700] font-medium">{campaign.clickRate}%</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[#4ECDC4] font-medium">{campaign.conversionRate}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      </div>

      {/* Email Preview Modal */}
      {showPreview && selectedStep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#232D1A] p-6 rounded-xl border border-[#3A4D23] w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#8BAE5A]">
                Email Preview: {selectedStep.name}
              </h2>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setSelectedStep(null);
                }}
                className="text-[#B6C948] hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="bg-[#141A15] text-white rounded-lg shadow-lg overflow-hidden border border-[#8BAE5A]">
              {/* Email Header */}
              <div className="bg-gradient-to-r from-[#1a2e1a] to-[#3a5f3a] p-4 text-white border-b border-[#8BAE5A]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] rounded-lg flex items-center justify-center">
                      <span className="text-xl font-bold text-[#141A15]">T</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">TopTierMen</h3>
                      <p className="text-sm text-[#B6C948]">Broederschap van Top Performers</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-[#B6C948]">Verzonden na:</div>
                    <div className="font-semibold text-white">{selectedStep.delayDays === 0 ? 'Direct' : `${selectedStep.delayDays} dagen`}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-[#B6C948] mb-1">Onderwerp:</div>
                    <div className="font-semibold text-lg text-white">{selectedStep.subject}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedStep.status === 'active' ? 'bg-[#8BAE5A] text-[#141A15]' :
                    selectedStep.status === 'paused' ? 'bg-[#B6C948] text-[#141A15]' :
                    'bg-gray-500 text-white'
                  }`}>
                    {selectedStep.status === 'active' ? 'Actief' : 
                     selectedStep.status === 'paused' ? 'Gepauzeerd' : 'Concept'}
                  </span>
                </div>
              </div>
              
              {/* Email Content */}
              <div className="p-6 bg-[#141A15]">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-[#1F2D17] to-[#2A3D1A] rounded-xl p-8 mb-6 text-white border-2 border-[#8BAE5A]">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] rounded-lg flex items-center justify-center mx-auto mb-6">
                      <span className="text-3xl font-bold text-[#141A15]">T</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-3 text-white">🚀 Welkom bij de Broederschap</h1>
                    <p className="text-[#8BAE5A] text-xl font-semibold uppercase tracking-wide">Jouw reis naar excellentie begint nu</p>
                  </div>
                </div>

                {/* Main Content */}
                <div className="space-y-6">
                  {/* Greeting */}
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-[#F3F3F1] mb-4">Beste John Doe,</h2>
                  </div>

                  {/* Content */}
                  <div className="bg-gradient-to-br from-[#1F2D17] to-[#2A3D1A] p-6 rounded-lg border-2 border-[#8BAE5A]">
                    <div className="text-[#B6C948] leading-relaxed whitespace-pre-wrap">
                      {selectedStep.content.replace(/\{\{name\}\}/g, 'John Doe')}
                    </div>
                  </div>

                  {/* CTA Section */}
                  <div className="text-center p-8 bg-[#141A15] border-3 border-[#8BAE5A] rounded-lg">
                    <h3 className="text-2xl font-bold text-[#F3F3F1] mb-4 uppercase tracking-wide">🎯 Klaar om te beginnen?</h3>
                    <p className="text-[#B6C948] mb-6 font-medium">Word onderdeel van de broederschap</p>
                    
                    <div className="inline-block bg-[#8BAE5A] text-[#141A15] px-10 py-4 rounded-lg font-bold text-lg uppercase tracking-wide border-3 border-[#8BAE5A] shadow-lg hover:bg-[#B6C948] transition-colors">
                      Start je Journey
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-8 bg-gradient-to-r from-[#232D1A] to-[#1F2D17] p-6 rounded-lg border-t border-[#8BAE5A] text-center">
                  <p className="text-[#F3F3F1] font-bold mb-2">Met broederlijke groeten,</p>
                  <p className="text-[#8BAE5A] font-semibold">Het TopTierMen Team</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unified Email Builder Modal */}
      <UnifiedEmailBuilder
        isOpen={showUnifiedBuilder}
        onClose={() => {
          setShowUnifiedBuilder(false);
          setSelectedStepForEdit(null);
        }}
        onSave={handleSaveUnifiedEmail}
        initialContent={selectedStepForEdit?.design}
        emailName={selectedStepForEdit?.name || 'Nieuwe Email'}
      />

      {/* Email Builder Modal */}
      <EmailBuilder
        isOpen={showEmailBuilder}
        onClose={() => {
          setShowEmailBuilder(false);
          setSelectedStepForEdit(null);
        }}
        onSave={handleSaveAdvancedEmail}
        initialContent={selectedStepForEdit?.design}
        emailName={selectedStepForEdit?.name || 'Nieuwe Email'}
      />

      {/* Simple Email Editor Modal */}
      <SimpleEmailEditor
        isOpen={showSimpleEditor}
        onClose={() => {
          setShowSimpleEditor(false);
          setSelectedStepForEdit(null);
        }}
        onSave={handleSaveSimpleEmail}
        initialContent={selectedStepForEdit?.content}
        emailName={selectedStepForEdit?.name || 'Email Bewerken'}
      />
    </div>
  );
}