'use client';

import { useState, useEffect } from 'react';
import { 
  Cog6ToothIcon,
  ShieldCheckIcon,
  TrophyIcon,
  UserGroupIcon,
  EnvelopeIcon,
  KeyIcon,
  PhotoIcon,
  WrenchScrewdriverIcon,
  StarIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

// Types
interface PlatformSettings {
  general: {
    platformName: string;
    logoUrl: string;
    maintenanceMode: boolean;
  };
  gamification: {
    xpSystemEnabled: boolean;
    xpDailyMission: number;
    xpAcademyLesson: number;
    xpForumPost: number;
    xpReceivedBoks: number;
    streakBonusDays: number;
    streakBonusXp: number;
  };
  community: {
    manualApprovalRequired: boolean;
    wordFilter: string;
    forumRules: string;
  };
  email: {
    senderName: string;
    senderEmail: string;
    templates: {
      welcome: { subject: string; content: string };
      passwordReset: { subject: string; content: string };
      weeklyReminder: { subject: string; content: string };
    };
  };
  integrations: {
    googleAnalyticsId: string;
    mailProviderApiKey: string;
    paymentProviderApiKey: string;
  };
}

// State for database settings
const [settings, setSettings] = useState<PlatformSettings | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [saving, setSaving] = useState(false);

// Fetch settings from database
const fetchSettings = async () => {
  setLoading(true);
  try {
    console.log('🔄 Fetching platform settings from database...');
    
    const response = await fetch('/api/admin/platform-settings');
    if (response.ok) {
      const data = await response.json();
      const settingsData = data.settings;
      
      // Convert database format to component format
      const convertedSettings: PlatformSettings = {
        general: settingsData.general || {
          platformName: 'Top Tier Men',
          logoUrl: '/logo.svg',
          maintenanceMode: false
        },
        gamification: settingsData.gamification || {
          xpSystemEnabled: true,
          xpDailyMission: 10,
          xpAcademyLesson: 25,
          xpForumPost: 5,
          xpReceivedBoks: 1,
          streakBonusDays: 7,
          streakBonusXp: 100
        },
        community: settingsData.community || {
          manualApprovalRequired: false,
          wordFilter: 'spam,scam,verkoop,reclame',
          forumRules: 'Welkom bij de Top Tier Men Brotherhood!'
        },
        email: settingsData.email || {
          senderName: 'Rick Cuijpers',
          senderEmail: 'rick@toptiermen.app',
          templates: {
            welcome: { subject: 'Welkom', content: 'Beste [Naam]' },
            passwordReset: { subject: 'Wachtwoord reset', content: 'Beste [Naam]' },
            weeklyReminder: { subject: 'Wekelijkse update', content: 'Beste [Naam]' }
          }
        },
        integrations: settingsData.integrations || {
          googleAnalyticsId: '',
          mailProviderApiKey: '',
          paymentProviderApiKey: ''
        }
      };
      
      setSettings(convertedSettings);
      setError(null);
    } else {
      throw new Error('Failed to fetch settings');
    }
  } catch (err) {
    console.error('❌ Error fetching platform settings:', err);
    setError('Fout bij het laden van instellingen');
  } finally {
    setLoading(false);
  }
};

// Save settings to database
const saveSettings = async (settingKey: string, settingValue: any) => {
  setSaving(true);
  try {
    console.log('💾 Saving platform setting:', settingKey);
    
    const response = await fetch('/api/admin/platform-settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        settingKey,
        settingValue
      })
    });

    if (response.ok) {
      console.log('✅ Setting saved successfully:', settingKey);
      // Refresh settings to get updated data
      await fetchSettings();
    } else {
      throw new Error('Failed to save setting');
    }
  } catch (err) {
    console.error('❌ Error saving platform setting:', err);
    setError('Fout bij het opslaan van instelling');
  } finally {
    setSaving(false);
  }
};

// Use default settings as fallback
const defaultSettings: PlatformSettings = {
  general: {
    platformName: 'Top Tier Men',
    logoUrl: '/logo.svg',
    maintenanceMode: false
  },
  gamification: {
    xpSystemEnabled: true,
    xpDailyMission: 10,
    xpAcademyLesson: 25,
    xpForumPost: 5,
    xpReceivedBoks: 1,
    streakBonusDays: 7,
    streakBonusXp: 100
  },
  community: {
    manualApprovalRequired: false,
    wordFilter: 'spam,scam,verkoop,reclame',
    forumRules: 'Welkom bij de Top Tier Men Brotherhood!'
  },
  email: {
    senderName: 'Rick Cuijpers',
    senderEmail: 'rick@toptiermen.app',
    templates: {
      welcome: { subject: 'Welkom', content: 'Beste [Naam]' },
      passwordReset: { subject: 'Wachtwoord reset', content: 'Beste [Naam]' },
      weeklyReminder: { subject: 'Wekelijkse update', content: 'Beste [Naam]' }
    }
  },
  integrations: {
    googleAnalyticsId: '',
    mailProviderApiKey: '',
    paymentProviderApiKey: ''
  }
};

export default function PlatformSettings() {
  const [showPassword, setShowPassword] = useState<{[key: string]: boolean}>({});
  const [showEmailModal, setShowEmailModal] = useState<{type: string; isOpen: boolean}>({type: '', isOpen: false});
  const [editingTemplate, setEditingTemplate] = useState<{type: string; subject: string; content: string}>({type: '', subject: '', content: ''});

  // Load settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  // Use settings from database or fallback to defaults
  const currentSettings = settings || defaultSettings;

  const handleMaintenanceModeToggle = async () => {
    const newValue = !currentSettings.general.maintenanceMode;
    await saveSettings('general', {
      ...currentSettings.general,
      maintenanceMode: newValue
    });
  };

  const handleXpSystemToggle = async () => {
    const newValue = !currentSettings.gamification.xpSystemEnabled;
    await saveSettings('gamification', {
      ...currentSettings.gamification,
      xpSystemEnabled: newValue
    });
  };

  const handleManualApprovalToggle = async () => {
    const newValue = !currentSettings.community.manualApprovalRequired;
    await saveSettings('community', {
      ...currentSettings.community,
      manualApprovalRequired: newValue
    });
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Implement actual file upload logic
      const reader = new FileReader();
      reader.onload = async (e) => {
        await saveSettings('general', {
          ...currentSettings.general,
          logoUrl: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditEmailTemplate = (type: string) => {
    const template = currentSettings.email.templates[type as keyof typeof currentSettings.email.templates];
    setEditingTemplate({
      type,
      subject: template.subject,
      content: template.content
    });
    setShowEmailModal({ type, isOpen: true });
  };

  const handleSaveEmailTemplate = async () => {
    await saveSettings('email', {
      ...currentSettings.email,
      templates: {
        ...currentSettings.email.templates,
        [editingTemplate.type]: {
          subject: editingTemplate.subject,
          content: editingTemplate.content
        }
      }
    });
    setShowEmailModal({ type: '', isOpen: false });
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPassword(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getMaskedValue = (value: string) => {
    return value.replace(/./g, '*');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A] mb-2">Platform Instellingen</h1>
          <p className="text-[#B6C948]">Beheer alle platform configuraties</p>
        </div>
        <div className="text-center py-12">
          <div className="text-[#8BAE5A]">Laden...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A] mb-2">Platform Instellingen</h1>
          <p className="text-[#B6C948]">Beheer alle platform configuraties</p>
        </div>
        <div className="text-center py-12">
          <div className="text-red-400">Fout: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#8BAE5A] mb-2">Platform Instellingen</h1>
        <p className="text-[#B6C948]">Beheer de kernprincipes en het gedrag van het Top Tier Men platform</p>
      </div>

      {/* Section 1: General Platform Settings */}
      <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
        <div className="flex items-center gap-3 mb-6">
          <Cog6ToothIcon className="w-6 h-6 text-[#8BAE5A]" />
          <h2 className="text-xl font-bold text-[#8BAE5A]">Algemene Platforminstellingen</h2>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[#B6C948] text-sm mb-2">Platform Naam</label>
              <input
                type="text"
                value={settings.general.platformName}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  general: { ...prev.general, platformName: e.target.value }
                }))}
                className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
              />
            </div>
            
            <div>
              <label className="block text-[#B6C948] text-sm mb-2">Platform Logo</label>
              <div className="flex items-center gap-4">
                <img 
                  src={settings.general.logoUrl} 
                  alt="Platform Logo" 
                  className="w-12 h-12 rounded-lg"
                />
                <label className="flex items-center gap-2 px-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#B6C948] hover:bg-[#232D1A] transition-colors cursor-pointer">
                  <PhotoIcon className="w-4 h-4" />
                  Huidig logo vervangen
                  <input
                    type="file"
                    accept=".svg,.png,.jpg,.jpeg"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="border-t border-[#3A4D23] pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#8BAE5A] flex items-center gap-2">
                  <WrenchScrewdriverIcon className="w-5 h-5" />
                  Onderhoudsmodus
                </h3>
                <p className="text-[#B6C948] text-sm mt-1">
                  Reguliere gebruikers zien een 'We zijn zo terug'-pagina, admins kunnen normaal blijven werken
                </p>
              </div>
              <button
                onClick={handleMaintenanceModeToggle}
                className={`relative inline-flex h-12 w-24 items-center rounded-full transition-colors ${
                  settings.general.maintenanceMode 
                    ? 'bg-red-600' 
                    : 'bg-[#3A4D23]'
                }`}
              >
                <span
                  className={`inline-block h-8 w-8 transform rounded-full bg-white transition-transform ${
                    settings.general.maintenanceMode ? 'translate-x-12' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {settings.general.maintenanceMode && (
              <div className="mt-4 p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
                <div className="flex items-center gap-2 text-red-400">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  <span className="font-medium">Onderhoudsmodus is actief</span>
                </div>
                <p className="text-red-300 text-sm mt-1">
                  Reguliere gebruikers kunnen het platform niet meer gebruiken totdat onderhoudsmodus wordt uitgeschakeld.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Gamification Settings */}
      <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
        <div className="flex items-center gap-3 mb-6">
          <TrophyIcon className="w-6 h-6 text-[#8BAE5A]" />
          <h2 className="text-xl font-bold text-[#8BAE5A]">Gamification Instellingen</h2>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="flex items-center gap-3 px-4 py-3 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#B6C948] hover:bg-[#232D1A] transition-colors">
              <StarIcon className="w-5 h-5" />
              Rangen Beheren
            </button>
            <button className="flex items-center gap-3 px-4 py-3 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#B6C948] hover:bg-[#232D1A] transition-colors">
              <TrophyIcon className="w-5 h-5" />
              Badges Beheren
            </button>
          </div>

          <div className="border-t border-[#3A4D23] pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[#8BAE5A]">XP Punten Systeem</h3>
                <p className="text-[#B6C948] text-sm">Activeer het beloningssysteem voor gebruikers</p>
              </div>
              <button
                onClick={handleXpSystemToggle}
                className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors ${
                  settings.gamification.xpSystemEnabled 
                    ? 'bg-[#8BAE5A]' 
                    : 'bg-[#3A4D23]'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.gamification.xpSystemEnabled ? 'translate-x-10' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.gamification.xpSystemEnabled && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[#B6C948] text-sm mb-1">XP Dagelijkse Missie</label>
                    <input
                      type="number"
                      value={settings.gamification.xpDailyMission}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        gamification: { ...prev.gamification, xpDailyMission: parseInt(e.target.value) }
                      }))}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#B6C948] text-sm mb-1">XP Academy Les</label>
                    <input
                      type="number"
                      value={settings.gamification.xpAcademyLesson}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        gamification: { ...prev.gamification, xpAcademyLesson: parseInt(e.target.value) }
                      }))}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#B6C948] text-sm mb-1">XP Forum Post</label>
                    <input
                      type="number"
                      value={settings.gamification.xpForumPost}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        gamification: { ...prev.gamification, xpForumPost: parseInt(e.target.value) }
                      }))}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#B6C948] text-sm mb-1">XP Ontvangen Boks 👊</label>
                    <input
                      type="number"
                      value={settings.gamification.xpReceivedBoks}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        gamification: { ...prev.gamification, xpReceivedBoks: parseInt(e.target.value) }
                      }))}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#B6C948] text-sm mb-1">Streak Bonus Dagen</label>
                    <input
                      type="number"
                      value={settings.gamification.streakBonusDays}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        gamification: { ...prev.gamification, streakBonusDays: parseInt(e.target.value) }
                      }))}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#B6C948] text-sm mb-1">Streak Bonus XP</label>
                    <input
                      type="number"
                      value={settings.gamification.streakBonusXp}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        gamification: { ...prev.gamification, streakBonusXp: parseInt(e.target.value) }
                      }))}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Community Settings */}
      <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
        <div className="flex items-center gap-3 mb-6">
          <UserGroupIcon className="w-6 h-6 text-[#8BAE5A]" />
          <h2 className="text-xl font-bold text-[#8BAE5A]">Community Instellingen</h2>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#8BAE5A] flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5" />
                Nieuwe Leden Goedkeuren
              </h3>
              <p className="text-[#B6C948] text-sm mt-1">
                Nieuwe registraties moeten handmatig worden goedgekeurd door een admin
              </p>
            </div>
            <button
              onClick={handleManualApprovalToggle}
              className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors ${
                settings.community.manualApprovalRequired 
                  ? 'bg-[#8BAE5A]' 
                  : 'bg-[#3A4D23]'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  settings.community.manualApprovalRequired ? 'translate-x-10' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-[#B6C948] text-sm mb-2">Forum & Feed Woordfilter</label>
            <textarea
              value={settings.community.wordFilter}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                community: { ...prev.community, wordFilter: e.target.value }
              }))}
              className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] h-24 resize-none"
              placeholder="spam,scam,verkoop,reclame (komma-gescheiden woorden)"
            />
            <p className="text-[#B6C948] text-xs mt-1">
              Deze woorden worden automatisch gecensureerd (****) in alle gebruikerscontent
            </p>
          </div>

          <div>
            <label className="block text-[#B6C948] text-sm mb-2">Standaard Forumregels</label>
            <textarea
              value={settings.community.forumRules}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                community: { ...prev.community, forumRules: e.target.value }
              }))}
              className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] h-32 resize-none"
              placeholder="Voer de algemene forumregels in..."
            />
            <p className="text-[#B6C948] text-xs mt-1">
              Deze regels worden automatisch bovenaan elke forumcategorie 'vastgepind'
            </p>
          </div>
        </div>
      </div>

      {/* Section 4: Email & Notification Settings */}
      <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
        <div className="flex items-center gap-3 mb-6">
          <EnvelopeIcon className="w-6 h-6 text-[#8BAE5A]" />
          <h2 className="text-xl font-bold text-[#8BAE5A]">E-mail & Notificatie Instellingen</h2>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#B6C948] text-sm mb-2">Afzender Naam</label>
              <input
                type="text"
                value={settings.email.senderName}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  email: { ...prev.email, senderName: e.target.value }
                }))}
                className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                placeholder="Rick Cuijpers"
              />
            </div>
            <div>
              <label className="block text-[#B6C948] text-sm mb-2">Afzender E-mailadres</label>
              <input
                type="email"
                value={settings.email.senderEmail}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  email: { ...prev.email, senderEmail: e.target.value }
                }))}
                className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                placeholder="rick@toptiermen.app"
              />
            </div>
          </div>

          <div className="border-t border-[#3A4D23] pt-6">
            <h3 className="text-lg font-semibold text-[#8BAE5A] mb-4">E-mail Template Beheer</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-[#181F17] rounded-lg">
                <div>
                  <div className="font-medium text-white">Welkomstmail na registratie</div>
                  <div className="text-sm text-[#B6C948]">{settings.email.templates.welcome.subject}</div>
                </div>
                <button
                  onClick={() => handleEditEmailTemplate('welcome')}
                  className="flex items-center gap-2 px-3 py-2 bg-[#8BAE5A] text-black rounded-lg hover:bg-[#B6C948] transition-colors text-sm"
                >
                  <PencilIcon className="w-4 h-4" />
                  Bewerk
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-[#181F17] rounded-lg">
                <div>
                  <div className="font-medium text-white">Wachtwoord Reset E-mail</div>
                  <div className="text-sm text-[#B6C948]">{settings.email.templates.passwordReset.subject}</div>
                </div>
                <button
                  onClick={() => handleEditEmailTemplate('passwordReset')}
                  className="flex items-center gap-2 px-3 py-2 bg-[#8BAE5A] text-black rounded-lg hover:bg-[#B6C948] transition-colors text-sm"
                >
                  <PencilIcon className="w-4 h-4" />
                  Bewerk
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-[#181F17] rounded-lg">
                <div>
                  <div className="font-medium text-white">Wekelijkse 'Social Proof' E-mail</div>
                  <div className="text-sm text-[#B6C948]">{settings.email.templates.weeklyReminder.subject}</div>
                </div>
                <button
                  onClick={() => handleEditEmailTemplate('weeklyReminder')}
                  className="flex items-center gap-2 px-3 py-2 bg-[#8BAE5A] text-black rounded-lg hover:bg-[#B6C948] transition-colors text-sm"
                >
                  <PencilIcon className="w-4 h-4" />
                  Bewerk
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Integrations & API Keys */}
      <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
        <div className="flex items-center gap-3 mb-6">
          <KeyIcon className="w-6 h-6 text-[#8BAE5A]" />
          <h2 className="text-xl font-bold text-[#8BAE5A]">Integraties & API Keys</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-[#B6C948] text-sm mb-2">Google Analytics ID</label>
            <input
              type="text"
              value={settings.integrations.googleAnalyticsId}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                integrations: { ...prev.integrations, googleAnalyticsId: e.target.value }
              }))}
              className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
              placeholder="GA-XXXXX-Y"
            />
          </div>
          
          <div>
            <label className="block text-[#B6C948] text-sm mb-2">Mail-provider API Key</label>
            <div className="relative">
              <input
                type={showPassword.mailProvider ? 'text' : 'password'}
                value={showPassword.mailProvider ? settings.integrations.mailProviderApiKey : getMaskedValue(settings.integrations.mailProviderApiKey)}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  integrations: { ...prev.integrations, mailProviderApiKey: e.target.value }
                }))}
                className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                placeholder="****************"
              />
              <button
                onClick={() => togglePasswordVisibility('mailProvider')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#B6C948] hover:text-white transition-colors"
              >
                {showPassword.mailProvider ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-[#B6C948] text-sm mb-2">Betalingsprovider API Key</label>
            <div className="relative">
              <input
                type={showPassword.paymentProvider ? 'text' : 'password'}
                value={showPassword.paymentProvider ? settings.integrations.paymentProviderApiKey : getMaskedValue(settings.integrations.paymentProviderApiKey)}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  integrations: { ...prev.integrations, paymentProviderApiKey: e.target.value }
                }))}
                className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                placeholder="****************"
              />
              <button
                onClick={() => togglePasswordVisibility('paymentProvider')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#B6C948] hover:text-white transition-colors"
              >
                {showPassword.paymentProvider ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-8 py-3 bg-[#8BAE5A] text-black rounded-lg hover:bg-[#B6C948] transition-colors font-semibold">
          <CheckIcon className="w-5 h-5" />
          Instellingen Opslaan
        </button>
      </div>

      {/* Email Template Modal */}
      {showEmailModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#232D1A] rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#8BAE5A]">
                Bewerk E-mail Template: {editingTemplate.type === 'welcome' ? 'Welkomstmail' : 
                                       editingTemplate.type === 'passwordReset' ? 'Wachtwoord Reset' : 
                                       'Wekelijkse Herinnering'}
              </h2>
              <button
                onClick={() => setShowEmailModal({ type: '', isOpen: false })}
                className="text-[#B6C948] hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[#B6C948] text-sm mb-2">Onderwerp</label>
                <input
                  type="text"
                  value={editingTemplate.subject}
                  onChange={(e) => setEditingTemplate(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                />
              </div>
              <div>
                <label className="block text-[#B6C948] text-sm mb-2">Inhoud</label>
                <textarea
                  value={editingTemplate.content}
                  onChange={(e) => setEditingTemplate(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] h-64 resize-none"
                />
              </div>
              <div className="text-sm text-[#B6C948]">
                <p>Beschikbare variabelen:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li><code className="bg-[#181F17] px-2 py-1 rounded">[Naam]</code> - Gebruikersnaam</li>
                  <li><code className="bg-[#181F17] px-2 py-1 rounded">[RESET_LINK]</code> - Wachtwoord reset link</li>
                  <li><code className="bg-[#181F17] px-2 py-1 rounded">[LOGIN_LINK]</code> - Login link</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-[#3A4D23]">
              <button
                onClick={handleSaveEmailTemplate}
                className="flex items-center gap-2 px-6 py-3 bg-[#8BAE5A] text-black rounded-lg hover:bg-[#B6C948] transition-colors font-semibold"
              >
                <CheckIcon className="w-5 h-5" />
                Opslaan
              </button>
              <button
                onClick={() => setShowEmailModal({ type: '', isOpen: false })}
                className="flex items-center gap-2 px-6 py-3 bg-[#181F17] border border-[#3A4D23] text-[#B6C948] rounded-lg hover:bg-[#232D1A] transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 