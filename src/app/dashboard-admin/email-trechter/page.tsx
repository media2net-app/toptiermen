'use client';
import { useState, useEffect } from 'react';
import { 
  EnvelopeIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  ArrowRightIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentTextIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { AdminCard, AdminStatsCard, AdminButton } from '@/components/admin';

interface EmailStep {
  id: string;
  stepNumber: number;
  name: string;
  subject: string;
  content: string;
  delayDays: number;
  status: 'draft' | 'active' | 'paused' | 'completed';
  sentCount: number;
  openRate: number;
  clickRate: number;
  scheduledDate?: Date;
}

interface CampaignStats {
  totalLeads: number;
  activeLeads: number;
  emailsSent: number;
  totalOpens: number;
  totalClicks: number;
  conversionRate: number;
}

export default function EmailTrechter() {
  const [emailSteps, setEmailSteps] = useState<EmailStep[]>([
    {
      id: '1',
      stepNumber: 1,
      name: 'Welkom & Introductie',
      subject: '🎯 Welkom bij Toptiermen - Jouw reis naar succes begint hier',
      content: `Beste {{name}},

Welkom bij Toptiermen! 🚀

We zijn verheugd dat je interesse hebt getoond in onze exclusieve broederschap van top performers. Je hebt de eerste stap gezet naar een leven van buitengewone prestaties en persoonlijke transformatie.

**Wat maakt Toptiermen uniek?**

🏆 **De Broederschap**: Word onderdeel van een exclusieve community van gelijkgestemden die elkaar naar succes duwen
🎯 **Wekelijkse Video Calls**: Elke week evalueren we samen je voortgang met alle broeders
💪 **Persoonlijke Transformatie**: Ontwikkel jezelf tot een echte Top Tier Man
📈 **Bewezen Methoden**: Strategieën die al honderden mensen naar succes hebben geleid
⚡ **24/7 Brotherhood Support**: Altijd toegang tot je broeders en coaches

**Wat je de komende 6 maanden kunt verwachten:**

**Maand 1-2: Foundation**
• Toegang tot alle academy modules en training content
• Persoonlijke voedingsplannen en trainingsschema's
• Introductie in de broederschap community
• Eerste wekelijkse video call met alle broeders

**Maand 3-4: Growth**
• Diepgaande coaching sessies
• Community challenges en accountability
• Wekelijkse evaluaties en voortgang tracking
• Netwerken met gelijkgestemden

**Maand 5-6: Mastery**
• Advanced strategieën en technieken
• Leadership development binnen de broederschap
• Voorbereiding op je Top Tier Man titel
• Levensveranderende resultaten

**De echte waarde:**
Dit is niet alleen content consumeren - dit is een complete levensstijl transformatie. Je wordt onderdeel van een broederschap die elkaar naar succes duwt, wekelijks samen evalueert, en uiteindelijk de prestigieuze titel "Top Tier Man" behaalt.

**Interesse niveau: {{interestLevel}}**

We hebben je geregistreerd met interesse niveau: {{interestLevel}}. Dit helpt ons om je de meest relevante informatie te sturen.

Binnenkort ontvang je meer details over hoe we jou kunnen helpen je doelen te bereiken.

Met vriendelijke groet,
Het Toptiermen Team

---
*"Succes is niet toevallig. Het is een keuze, een gewoonte, een levensstijl."*`,
      delayDays: 0,
      status: 'active',
      sentCount: 0,
      openRate: 0,
      clickRate: 0
    },
    {
      id: '2',
      stepNumber: 2,
      name: 'Waarde & Voordelen',
      subject: '💎 Ontdek hoe Toptiermen jouw leven kan veranderen',
      content: `Beste {{name}},

Hopelijk heb je onze eerste email kunnen lezen. Vandaag delen we wat het betekent om een echte Top Tier Man te worden en hoe de broederschap je leven gaat veranderen.

**Het Toptiermen verschil - De echte waarde:**

🔥 **1. De Broederschap**
Dit is geen gewone community - dit is een broederschap van gelijkgestemden die elkaar naar succes duwen. Elke week evalueren we samen je voortgang in video calls met alle broeders.

💪 **2. Persoonlijke Transformatie**
Je wordt niet alleen beter, je wordt een Top Tier Man. Dit is een complete identiteit transformatie die je leven fundamenteel verandert.

🎯 **3. Accountability & Support**
De broederschap houdt je accountable. Als je achterblijft, zijn er broeders die je weer op het juiste pad krijgen. Als je excellenteert, wordt je gevierd.

🤝 **4. Netwerk van Winners**
Je netwerk wordt je nettowaarde. De broeders in Toptiermen zijn allemaal mensen die net als jij naar het volgende niveau willen.

📊 **5. Meetbare Resultaten**
Elke week tracken we je voortgang. Niet alleen in fitness, maar in alle levensgebieden: carrière, relaties, mindset, en persoonlijke groei.

**Wat onze broeders zeggen:**
*"De wekelijkse video calls met alle broeders hebben mijn leven veranderd. Ik voel me eindelijk begrepen en gesteund."* - Mark, CEO
*"Dit is geen gewone community - dit is een broederschap die elkaar naar succes duwt. De accountability is goud waard."* - Thomas, Entrepreneur
*"De titel Top Tier Man behalen was het moment dat ik besefte dat ik echt veranderd was. Mijn leven is fundamenteel anders."* - Alex, Business Owner

**Wat je de komende 6 maanden kunt verwachten:**

**Maand 1-2: Foundation**
• Toegang tot alle academy modules en training content
• Persoonlijke voedingsplannen en trainingsschema's
• Introductie in de broederschap community
• Eerste wekelijkse video call met alle broeders

**Maand 3-4: Growth**
• Diepgaande coaching sessies
• Community challenges en accountability
• Wekelijkse evaluaties en voortgang tracking
• Netwerken met gelijkgestemden

**Maand 5-6: Mastery**
• Advanced strategieën en technieken
• Leadership development binnen de broederschap
• Voorbereiding op je Top Tier Man titel
• Levensveranderende resultaten

**Interesse niveau: {{interestLevel}}**

Als {{interestLevel}} lid krijg je toegang tot:
• Exclusieve masterclasses
• Persoonlijke coaching sessies
• Premium broederschap features
• Vroegtijdige toegang tot nieuwe content
• Prioriteit bij wekelijkse video calls

Binnenkort ontvang je je persoonlijke inschrijflink voor de lancering op 10 september.

Met vriendelijke groet,
Het Toptiermen Team

---
*"Alleen ga je sneller, samen kom je verder. In de broederschap kom je het verst."*`,
      delayDays: 3,
      status: 'active',
      sentCount: 0,
      openRate: 0,
      clickRate: 0
    },
    {
      id: '3',
      stepNumber: 3,
      name: 'Call-to-Action',
              subject: '⏰ Beperkte tijd: Schrijf je nu in voor 10 september',
      content: `Beste {{name}},

**⏰ WAARSCHUWING: Dit is je laatste kans om een Top Tier Man te worden!**

De lancering van Toptiermen op 10 september nadert snel, en we hebben nog slechts **24 uur** om je inschrijving te verwerken.

**Waarom een 6-maand of 12-maand commitment?**

🎯 **De echte transformatie duurt tijd**
Een Top Tier Man word je niet in een maand. Het duurt 6 maanden om je identiteit fundamenteel te veranderen. De broederschap en wekelijkse video calls zorgen ervoor dat je consistent blijft groeien.

🤝 **De broederschap heeft tijd nodig**
Echte connecties en accountability bouw je op over tijd. Na 6 maanden ken je alle broeders, vertrouw je elkaar, en duwen jullie elkaar naar het volgende niveau.

📈 **Meetbare resultaten in alle levensgebieden**
• Maand 1-2: Foundation en introductie in de broederschap
• Maand 3-4: Growth en diepgaande coaching
• Maand 5-6: Mastery en voorbereiding op je Top Tier Man titel

**Waarom NU actie ondernemen?**

🚨 **Beperkte beschikbaarheid**: Slechts 50 plekken beschikbaar
💰 **Early Bird voordelen**: 50% korting op 6-maand of 12-maand lidmaatschap
🎁 **Exclusieve bonussen**: 
   - Persoonlijke coaching sessie (waarde €500)
   - Premium broederschap toegang
   - Exclusieve masterclass toegang
   - 30-dagen geld-terug garantie
   - Wekelijkse video calls met alle broeders

⚡ **Directe toegang**: Start direct met alle features
🎯 **Persoonlijke aandacht**: Garantie van 1-op-1 begeleiding

**Interesse niveau: {{interestLevel}}**

Als {{interestLevel}} lid krijg je:
• Prioriteit bij inschrijving
• Extra coaching sessies
• Vroegtijdige toegang tot nieuwe features
• Directe toegang tot de broederschap

**🎯 ACTIE NU:**

[INSCHRIJF HIER VOOR 10 SEPTEMBER - 6 MAAND OF 12 MAAND]

**Wat gebeurt er als je wacht?**
• Je mist de early bird korting
• Je komt op de wachtlijst
• Je betaalt de volledige prijs
• Je mist exclusieve bonussen
• Je mist de eerste wekelijkse video calls

**De echte waarde van een 6-maand commitment:**
Dit is niet alleen content consumeren - dit is een complete levensstijl transformatie. Je wordt onderdeel van een broederschap die elkaar naar succes duwt, wekelijks samen evalueert, en uiteindelijk de prestigieuze titel "Top Tier Man" behaalt.

**Deze kans komt niet meer terug.**

Maak vandaag nog de beslissing die je leven kan veranderen. Word onderdeel van de broederschap die je naar succes duwt.

**Of bel ons direct:**
📞 +31 6 12345678

        **Deadline: 10 september 2025**

Na deze datum sluiten we de inschrijvingen voor de komende maand.

Met vriendelijke groet,
Het Toptiermen Team

---
*"De beste tijd om te planten was 20 jaar geleden. De tweede beste tijd is nu."*`,
      delayDays: 7,
      status: 'active',
      sentCount: 0,
      openRate: 0,
      clickRate: 0
    }
  ]);

  const [campaignStats, setCampaignStats] = useState<CampaignStats>({
    totalLeads: 0,
    activeLeads: 0,
    emailsSent: 0,
    totalOpens: 0,
    totalClicks: 0,
    conversionRate: 0
  });

  const [selectedStep, setSelectedStep] = useState<EmailStep | null>(null);
  const [showEmailEditor, setShowEmailEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [campaignStatus, setCampaignStatus] = useState<'draft' | 'active' | 'paused'>('draft');

  // Fetch campaign data
  useEffect(() => {
    fetchCampaignData();
  }, []);

  const fetchCampaignData = async () => {
    try {
      // Fetch leads count
      const leadsResponse = await fetch('/api/admin/prelaunch-emails');
      const leadsData = await leadsResponse.json();
      
      if (leadsData.success) {
        const totalLeads = leadsData.emails.length;
        const activeLeads = leadsData.emails.filter((email: any) => email.status === 'active').length;
        
        setCampaignStats(prev => ({
          ...prev,
          totalLeads,
          activeLeads
        }));
      }

      // Fetch email steps
      const stepsResponse = await fetch('/api/admin/email-campaign');
      const stepsData = await stepsResponse.json();
      
      if (stepsData.success && stepsData.steps.length > 0) {
        const formattedSteps = stepsData.steps.map((step: any) => ({
          id: step.id,
          stepNumber: step.step_number,
          name: step.name,
          subject: step.subject,
          content: step.content,
          delayDays: step.delay_days,
          status: step.status,
          sentCount: step.sent_count || 0,
          openRate: step.open_rate || 0,
          clickRate: step.click_rate || 0
        }));
        setEmailSteps(formattedSteps);
      }
    } catch (error) {
      console.error('Error fetching campaign data:', error);
    }
  };

  const updateEmailStep = (stepId: string, updates: Partial<EmailStep>) => {
    setEmailSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const toggleStepStatus = (stepId: string) => {
    setEmailSteps(prev => prev.map(step => {
      if (step.id === stepId) {
        const newStatus = step.status === 'active' ? 'paused' : 'active';
        return { ...step, status: newStatus };
      }
      return step;
    }));
  };

  const saveEmailStep = async (step: EmailStep) => {
    try {
      const response = await fetch('/api/admin/email-campaign', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: step.id,
          stepNumber: step.stepNumber,
          name: step.name,
          subject: step.subject,
          content: step.content,
          delayDays: step.delayDays,
          status: step.status
        })
      });

      const data = await response.json();
      if (data.success) {
        // Update local state
        setEmailSteps(prev => prev.map(s => 
          s.id === step.id ? { ...step } : s
        ));
        toast.success(`Email stap ${step.stepNumber} opgeslagen`);
        setShowEmailEditor(false);
        setSelectedStep(null);
      } else {
        toast.error(data.error || 'Fout bij opslaan van email stap');
      }
    } catch (error) {
      console.error('Error saving email step:', error);
      toast.error('Fout bij opslaan van email stap');
    }
  };

  const startCampaign = async () => {
    try {
      setCampaignStatus('active');
      toast.success('Email campagne gestart!');
    } catch (error) {
      toast.error('Fout bij starten van campagne');
    }
  };

  const pauseCampaign = async () => {
    try {
      setCampaignStatus('paused');
      toast.success('Email campagne gepauzeerd');
    } catch (error) {
      toast.error('Fout bij pauzeren van campagne');
    }
  };

  const sendTestEmail = async (stepId: string) => {
    try {
      const response = await fetch('/api/admin/send-email-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId, action: 'send_test' })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Test email voorbereid: ${data.step.name}`);
      } else {
        toast.error(data.error || 'Fout bij verzenden test email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Fout bij verzenden test email');
    }
  };

  const sendToLeads = async (stepId: string) => {
    try {
      const response = await fetch('/api/admin/send-email-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId, action: 'send_to_leads' })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Email campagne voorbereid voor ${data.sentCount} leads`);
        // Refresh campaign data
        fetchCampaignData();
      } else {
        toast.error(data.error || 'Fout bij verzenden naar leads');
      }
    } catch (error) {
      console.error('Error sending to leads:', error);
      toast.error('Fout bij verzenden naar leads');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'paused': return 'text-yellow-400';
      case 'completed': return 'text-blue-400';
      case 'draft': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <PlayIcon className="w-4 h-4" />;
      case 'paused': return <PauseIcon className="w-4 h-4" />;
      case 'completed': return <CheckCircleIcon className="w-4 h-4" />;
      case 'draft': return <DocumentTextIcon className="w-4 h-4" />;
      default: return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A]">Email Marketing Trechter</h1>
          <p className="text-[#B6C948] mt-2">Beheer de 3-email campagne voor lead warming en conversie</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#8BAE5A] font-semibold">
            Campagne Status: 
            <span className={`ml-2 ${getStatusColor(campaignStatus)}`}>
              {campaignStatus === 'active' ? 'Actief' : campaignStatus === 'paused' ? 'Gepauzeerd' : 'Concept'}
            </span>
          </span>
          {campaignStatus === 'draft' && (
            <AdminButton
              onClick={startCampaign}
              icon={<PlayIcon className="w-4 h-4" />}
            >
              Start Campagne
            </AdminButton>
          )}
          {campaignStatus === 'active' && (
            <AdminButton
              variant="secondary"
              onClick={pauseCampaign}
              icon={<PauseIcon className="w-4 h-4" />}
            >
              Pauzeer Campagne
            </AdminButton>
          )}
        </div>
      </div>

      {/* Campaign Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <AdminStatsCard
          title="Totaal Leads"
          value={campaignStats.totalLeads}
          icon={<UserGroupIcon className="w-6 h-6" />}
          color="blue"
        />
        <AdminStatsCard
          title="Actieve Leads"
          value={campaignStats.activeLeads}
          icon={<CheckCircleIcon className="w-6 h-6" />}
          color="green"
        />
        <AdminStatsCard
          title="Emails Verzonden"
          value={campaignStats.emailsSent}
          icon={<EnvelopeIcon className="w-6 h-6" />}
          color="purple"
        />
        <AdminStatsCard
          title="Totaal Opens"
          value={campaignStats.totalOpens}
          icon={<EyeIcon className="w-6 h-6" />}
          color="orange"
        />
        <AdminStatsCard
          title="Totaal Clicks"
          value={campaignStats.totalClicks}
          icon={<ChartBarIcon className="w-6 h-6" />}
          color="red"
        />
        <AdminStatsCard
          title="Conversie Rate"
          value={`${campaignStats.conversionRate}%`}
          icon={<ArrowRightIcon className="w-6 h-6" />}
          color="green"
        />
      </div>

      {/* Email Funnel Steps */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#8BAE5A]">Email Trechter Stappen</h2>
        
        {emailSteps.map((step, index) => (
          <AdminCard key={step.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Step Number */}
                <div className="w-12 h-12 bg-[#8BAE5A] rounded-full flex items-center justify-center text-[#181F17] font-bold text-lg">
                  {step.stepNumber}
                </div>
                
                {/* Step Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-[#8BAE5A]">{step.name}</h3>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(step.status)}`}>
                      {getStatusIcon(step.status)}
                      {step.status === 'active' ? 'Actief' : 
                       step.status === 'paused' ? 'Gepauzeerd' : 
                       step.status === 'completed' ? 'Voltooid' : 'Concept'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-[#B6C948]">
                    <div>
                      <span className="font-medium">Onderwerp:</span> {step.subject}
                    </div>
                    <div>
                      <span className="font-medium">Vertraging:</span> {step.delayDays} dagen
                    </div>
                    <div>
                      <span className="font-medium">Verzonden:</span> {step.sentCount}
                    </div>
                    <div>
                      <span className="font-medium">Open Rate:</span> {step.openRate}%
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2 h-9">
                <AdminButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedStep(step);
                    setShowPreview(true);
                  }}
                  icon={<EyeIcon className="w-4 h-4" />}
                >
                  Preview
                </AdminButton>
                
                <AdminButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedStep(step);
                    setShowEmailEditor(true);
                  }}
                  icon={<PencilIcon className="w-4 h-4" />}
                >
                  Bewerken
                </AdminButton>
                
                {step.status === 'active' && (
                  <>
                    <AdminButton
                      variant="secondary"
                      size="sm"
                      onClick={() => sendTestEmail(step.id)}
                      icon={<EnvelopeIcon className="w-4 h-4" />}
                    >
                      Test Email
                    </AdminButton>
                    
                    <AdminButton
                      variant="primary"
                      size="sm"
                      onClick={() => sendToLeads(step.id)}
                      icon={<UserGroupIcon className="w-4 h-4" />}
                    >
                      Verzend naar Leads
                    </AdminButton>
                  </>
                )}
                
                {step.status !== 'completed' && (
                  <AdminButton
                    variant={step.status === 'active' ? 'danger' : 'primary'}
                    size="sm"
                    onClick={() => toggleStepStatus(step.id)}
                    icon={step.status === 'active' ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                  >
                    {step.status === 'active' ? 'Pauzeren' : 'Activeren'}
                  </AdminButton>
                )}
              </div>
            </div>
          </AdminCard>
        ))}
      </div>

      {/* Campaign Timeline */}
      <AdminCard>
        <h3 className="text-xl font-semibold mb-4 text-[#8BAE5A]">Campagne Timeline</h3>
        <div className="space-y-4">
          {emailSteps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.status === 'completed' ? 'bg-green-500' : 
                  step.status === 'active' ? 'bg-[#8BAE5A]' : 
                  'bg-gray-500'
                }`}>
                  {step.status === 'completed' ? (
                    <CheckCircleIcon className="w-5 h-5 text-white" />
                  ) : (
                    <span className="text-white font-bold text-sm">{step.stepNumber}</span>
                  )}
                </div>
                <div>
                  <div className="font-medium text-[#8BAE5A]">{step.name}</div>
                  <div className="text-sm text-[#B6C948]">
                    {step.delayDays === 0 ? 'Direct' : `Na ${step.delayDays} dagen`}
                  </div>
                </div>
              </div>
              
              {index < emailSteps.length - 1 && (
                <ArrowRightIcon className="w-6 h-6 text-[#3A4D23]" />
              )}
            </div>
          ))}
        </div>
      </AdminCard>

      {/* Email Editor Modal */}
      {showEmailEditor && selectedStep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#232D1A] p-6 rounded-xl border border-[#3A4D23] w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-[#8BAE5A]">
              Email Bewerken: {selectedStep.name}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-2">Onderwerp *</label>
                <input
                  type="text"
                  value={selectedStep.subject}
                  onChange={(e) => setSelectedStep({...selectedStep, subject: e.target.value})}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-2">Vertraging (dagen)</label>
                <input
                  type="number"
                  value={selectedStep.delayDays}
                  onChange={(e) => setSelectedStep({...selectedStep, delayDays: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-2">Email Content *</label>
                <textarea
                  value={selectedStep.content}
                  onChange={(e) => setSelectedStep({...selectedStep, content: e.target.value})}
                  rows={15}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  placeholder="Schrijf hier je email content...&#10;&#10;Beschikbare variabelen:&#10;{{name}} - Naam van de lead&#10;{{email}} - Email adres&#10;{{interestLevel}} - Interesse niveau"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <AdminButton
                onClick={() => saveEmailStep(selectedStep)}
                className="flex-1"
              >
                Opslaan
              </AdminButton>
              <AdminButton
                variant="secondary"
                onClick={() => {
                  setShowEmailEditor(false);
                  setSelectedStep(null);
                }}
                className="flex-1"
              >
                Annuleren
              </AdminButton>
            </div>
          </div>
        </div>
      )}

      {/* Email Preview Modal */}
      {showPreview && selectedStep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#232D1A] p-6 rounded-xl border border-[#3A4D23] w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-[#8BAE5A]">
              Email Preview: {selectedStep.name}
            </h2>
            
            <div className="bg-white text-black p-6 rounded-lg shadow-lg">
              {/* Email Header */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="mb-2">
                  <strong className="text-gray-700">Onderwerp:</strong> {selectedStep.subject}
                </div>
                <div className="mb-2">
                  <strong className="text-gray-700">Verzonden na:</strong> {selectedStep.delayDays === 0 ? 'Direct' : `${selectedStep.delayDays} dagen`}
                </div>
                <div>
                  <strong className="text-gray-700">Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    selectedStep.status === 'active' ? 'bg-green-100 text-green-800' :
                    selectedStep.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedStep.status === 'active' ? 'Actief' : 
                     selectedStep.status === 'paused' ? 'Gepauzeerd' : 'Concept'}
                  </span>
                </div>
              </div>
              
              {/* Email Content */}
              <div className="prose prose-sm max-w-none">
                <div 
                  className="whitespace-pre-wrap text-gray-800 leading-relaxed"
                  style={{
                    fontFamily: 'Arial, sans-serif',
                    lineHeight: '1.6'
                  }}
                >
                  {selectedStep.content ? (
                    selectedStep.content
                      .replace(/\{\{name\}\}/g, 'John Doe')
                      .replace(/\{\{email\}\}/g, 'john.doe@example.com')
                      .replace(/\{\{interestLevel\}\}/g, 'Hoog')
                  ) : (
                    <div className="text-gray-500 italic">Nog geen content ingevuld...</div>
                  )}
                </div>
              </div>
              
              {/* Email Footer */}
              <div className="border-t border-gray-200 pt-4 mt-6 text-xs text-gray-500">
                <p>Dit is een preview van de e-mail. Variabelen zijn vervangen door voorbeeldwaarden.</p>
                <p>Beschikbare variabelen: {'{{name}}'}, {'{{email}}'}, {'{{interestLevel}}'}</p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <AdminButton
                onClick={() => {
                  setShowPreview(false);
                  setSelectedStep(null);
                }}
                className="flex-1"
              >
                Sluiten
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 