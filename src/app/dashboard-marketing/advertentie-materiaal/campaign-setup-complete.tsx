'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  GlobeAltIcon,
  HeartIcon,
  BrainIcon,
  EyeIcon,
  LinkIcon,
  PlayIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface CampaignSetupCompleteProps {
  video: any;
  onClose: () => void;
  onSuccess: (campaignData: any) => void;
}

interface Interest {
  id: string;
  name: string;
  audience_size: number;
  path: string[];
}

interface Behavior {
  id: string;
  name: string;
  audience_size: number;
  path: string[];
}

interface TargetingData {
  age_min: number;
  age_max: number;
  genders: string[];
  locations: string[];
  interests: string[];
  behaviors: string[];
  demographics?: {
    education_statuses?: string[];
    relationship_statuses?: string[];
  };
  exclusions?: {
    interests?: string[];
    behaviors?: string[];
  };
  languages?: string[];
  radius?: number;
}

const OBJECTIVES = [
  { value: 'AWARENESS', label: 'Bewustwording', description: 'Bereik en frequentie' },
  { value: 'CONSIDERATION', label: 'Overweging', description: 'Traffic, engagement, app installs' },
  { value: 'CONVERSIONS', label: 'Conversies', description: 'Conversies, catalog sales, store traffic' },
  { value: 'ENGAGEMENT', label: 'Engagement', description: 'Post engagement, video views' },
  { value: 'LEADS', label: 'Leads', description: 'Lead generatie' },
  { value: 'SALES', label: 'Verkoop', description: 'Conversies en verkoop' },
  { value: 'TRAFFIC', label: 'Verkeer', description: 'Website verkeer' }
];

const CALL_TO_ACTIONS = [
  { value: 'LEARN_MORE', label: 'Meer informatie' },
  { value: 'SIGN_UP', label: 'Aanmelden' },
  { value: 'SHOP_NOW', label: 'Nu kopen' },
  { value: 'CONTACT_US', label: 'Contact opnemen' },
  { value: 'DOWNLOAD', label: 'Downloaden' },
  { value: 'GET_QUOTE', label: 'Offerte aanvragen' },
  { value: 'APPLY_NOW', label: 'Nu solliciteren' },
  { value: 'BOOK_NOW', label: 'Nu boeken' }
];

const TARGET_AUDIENCE_PRESETS = {
  'Algemeen': {
    age_min: 18,
    age_max: 65,
    genders: ['all'],
    interests: ['Fitness', 'Gezondheid', 'Lifestyle'],
    behaviors: ['Frequent travelers', 'Early adopters']
  },
  'Vaders': {
    age_min: 30,
    age_max: 50,
    genders: ['men'],
    interests: ['Vaderschap', 'Gezin', 'Fitness', 'Onderhoud'],
    behaviors: ['Parents', 'Homeowners']
  },
  'Jongeren': {
    age_min: 18,
    age_max: 25,
    genders: ['all'],
    interests: ['Fitness', 'Social media', 'Gaming', 'Muziek'],
    behaviors: ['Mobile users', 'Early adopters']
  },
  'Zakelijk': {
    age_min: 25,
    age_max: 55,
    genders: ['all'],
    interests: ['Ondernemerschap', 'Business', 'Networking', 'Professional development'],
    behaviors: ['Business travelers', 'High income']
  }
};

export default function CampaignSetupComplete({ video, onClose, onSuccess }: CampaignSetupCompleteProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Campaign basics
  const [campaignName, setCampaignName] = useState('');
  const [objective, setObjective] = useState('TRAFFIC');
  const [status, setStatus] = useState<'ACTIVE' | 'PAUSED'>('PAUSED');
  
  // Budget & timing
  const [dailyBudget, setDailyBudget] = useState(50);
  const [lifetimeBudget, setLifetimeBudget] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Targeting
  const [targeting, setTargeting] = useState<TargetingData>({
    age_min: 18,
    age_max: 65,
    genders: ['all'],
    locations: ['NL'],
    interests: [],
    behaviors: []
  });
  
  // Ad creative
  const [adTitle, setAdTitle] = useState('');
  const [adBody, setAdBody] = useState('');
  const [callToAction, setCallToAction] = useState('LEARN_MORE');
  
  // Targeting search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'interests' | 'behaviors'>('interests');
  const [searchResults, setSearchResults] = useState<Interest[] | Behavior[]>([]);
  const [searching, setSearching] = useState(false);

  // Initialize campaign name and targeting based on video
  useEffect(() => {
    if (video) {
      const baseName = `TTM - ${video.target_audience} - ${video.name}`;
      setCampaignName(baseName);
      
      const preset = TARGET_AUDIENCE_PRESETS[video.target_audience as keyof typeof TARGET_AUDIENCE_PRESETS];
      if (preset) {
        setTargeting(prev => ({
          ...prev,
          ...preset
        }));
      }
    }
  }, [video]);

  // Search interests/behaviors
  const searchTargeting = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const response = await fetch(`/api/facebook/search-targeting?q=${encodeURIComponent(searchQuery)}&type=${searchType}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data.results);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Fout bij zoeken naar targeting opties');
    } finally {
      setSearching(false);
    }
  };

  // Add interest/behavior to targeting
  const addTargeting = (item: Interest | Behavior) => {
    if (searchType === 'interests') {
      setTargeting(prev => ({
        ...prev,
        interests: [...prev.interests, item.id]
      }));
    } else {
      setTargeting(prev => ({
        ...prev,
        behaviors: [...prev.behaviors, item.id]
      }));
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  // Remove interest/behavior from targeting
  const removeTargeting = (id: string, type: 'interests' | 'behaviors') => {
    setTargeting(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item !== id)
    }));
  };

  // Create campaign
  const createCampaign = async () => {
    setLoading(true);
    setError(null);

    try {
      const campaignData = {
        name: campaignName,
        objective,
        status,
        daily_budget: dailyBudget,
        ...(lifetimeBudget > 0 && { lifetime_budget: lifetimeBudget }),
        ...(startDate && { start_time: new Date(startDate).toISOString() }),
        ...(endDate && { stop_time: new Date(endDate).toISOString() }),
        targeting,
        ad_creative: {
          title: adTitle,
          body: adBody,
          link_url: 'https://platform.toptiermen.eu',
          call_to_action_type: callToAction
        },
        video_url: video.file_path,
        video_name: video.name
      };

      const response = await fetch('/api/facebook/create-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      });

      const result = await response.json();

      if (result.success) {
        onSuccess(result.data);
        onClose();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Fout bij aanmaken van campagne');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Facebook Campagne Setup</h2>
              <p className="text-blue-100">Video: {video?.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= stepNumber ? 'bg-white text-blue-600' : 'bg-white/20 text-white/60'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 4 && (
                    <div className={`w-12 h-1 mx-2 ${
                      step > stepNumber ? 'bg-white' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-blue-100">
              {step === 1 && 'Campagne Basis'}
              {step === 2 && 'Budget & Timing'}
              {step === 3 && 'Doelgroep Targeting'}
              {step === 4 && 'Ad Creative'}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Campagne Naam
                  </label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Voer campagne naam in"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Campagne Doel
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {OBJECTIVES.map((obj) => (
                      <button
                        key={obj.value}
                        onClick={() => setObjective(obj.value)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          objective === obj.value
                            ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                            : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        <div className="font-medium">{obj.label}</div>
                        <div className="text-sm text-gray-400">{obj.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setStatus('PAUSED')}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        status === 'PAUSED'
                          ? 'border-yellow-500 bg-yellow-500/10 text-yellow-300'
                          : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      Gepauzeerd (Aanbevolen)
                    </button>
                    <button
                      onClick={() => setStatus('ACTIVE')}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        status === 'ACTIVE'
                          ? 'border-green-500 bg-green-500/10 text-green-300'
                          : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      Actief
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Dagelijks Budget (€)
                    </label>
                    <div className="relative">
                      <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={dailyBudget}
                        onChange={(e) => setDailyBudget(Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        min="1"
                        step="1"
                      />
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Minimaal €1 per dag</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Levensduur Budget (€) - Optioneel
                    </label>
                    <div className="relative">
                      <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={lifetimeBudget}
                        onChange={(e) => setLifetimeBudget(Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        min="0"
                        step="1"
                      />
                    </div>
                    <p className="text-sm text-gray-400 mt-1">0 = geen limiet</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Start Datum
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Leeg = direct starten</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Eind Datum - Optioneel
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Leeg = geen einddatum</p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Leeftijd Min
                    </label>
                    <input
                      type="number"
                      value={targeting.age_min}
                      onChange={(e) => setTargeting(prev => ({ ...prev, age_min: Number(e.target.value) }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      min="13"
                      max="65"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Leeftijd Max
                    </label>
                    <input
                      type="number"
                      value={targeting.age_max}
                      onChange={(e) => setTargeting(prev => ({ ...prev, age_max: Number(e.target.value) }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      min="13"
                      max="65"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Geslacht
                    </label>
                    <select
                      value={targeting.genders[0]}
                      onChange={(e) => setTargeting(prev => ({ ...prev, genders: [e.target.value] }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="all">Alle geslachten</option>
                      <option value="men">Mannen</option>
                      <option value="women">Vrouwen</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Locaties
                  </label>
                  <div className="relative">
                    <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={targeting.locations.join(', ')}
                      onChange={(e) => setTargeting(prev => ({ ...prev, locations: e.target.value.split(',').map(s => s.trim().toUpperCase()) }))}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="NL, BE, DE (landcodes)"
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Landcodes gescheiden door komma's (NL, BE, DE)</p>
                </div>

                {/* Interests & Behaviors Search */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Zoek Interesses & Gedrag
                    </label>
                    <div className="flex space-x-2">
                      <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value as 'interests' | 'behaviors')}
                        className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="interests">Interesses</option>
                        <option value="behaviors">Gedrag</option>
                      </select>
                      <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && searchTargeting()}
                          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                          placeholder={`Zoek ${searchType === 'interests' ? 'interesses' : 'gedrag'}...`}
                        />
                      </div>
                      <button
                        onClick={searchTargeting}
                        disabled={searching || !searchQuery.trim()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {searching ? 'Zoeken...' : 'Zoek'}
                      </button>
                    </div>
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="bg-gray-800 rounded-lg p-4 max-h-48 overflow-y-auto">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">
                        Zoekresultaten ({searchResults.length})
                      </h4>
                      <div className="space-y-2">
                        {searchResults.map((item: any) => (
                          <button
                            key={item.id}
                            onClick={() => addTargeting(item)}
                            className="w-full text-left p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                          >
                            <div className="font-medium text-white">{item.name}</div>
                            <div className="text-sm text-gray-400">
                              {item.audience_size?.toLocaleString()} mensen
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected Interests */}
                  {targeting.interests.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Geselecteerde Interesses ({targeting.interests.length})
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {targeting.interests.map((interestId) => (
                          <span
                            key={interestId}
                            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
                          >
                            {interestId}
                            <button
                              onClick={() => removeTargeting(interestId, 'interests')}
                              className="ml-2 hover:text-red-300"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected Behaviors */}
                  {targeting.behaviors.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Geselecteerd Gedrag ({targeting.behaviors.length})
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {targeting.behaviors.map((behaviorId) => (
                          <span
                            key={behaviorId}
                            className="inline-flex items-center px-3 py-1 bg-purple-600 text-white text-sm rounded-full"
                          >
                            {behaviorId}
                            <button
                              onClick={() => removeTargeting(behaviorId, 'behaviors')}
                              className="ml-2 hover:text-red-300"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ad Titel
                  </label>
                  <input
                    type="text"
                    value={adTitle}
                    onChange={(e) => setAdTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Pakkende titel voor je ad"
                    maxLength={40}
                  />
                  <p className="text-sm text-gray-400 mt-1">{adTitle.length}/40 karakters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ad Tekst
                  </label>
                  <textarea
                    value={adBody}
                    onChange={(e) => setAdBody(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    rows={4}
                    placeholder="Beschrijvende tekst voor je ad"
                    maxLength={125}
                  />
                  <p className="text-sm text-gray-400 mt-1">{adBody.length}/125 karakters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Call-to-Action
                  </label>
                  <select
                    value={callToAction}
                    onChange={(e) => setCallToAction(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    {CALL_TO_ACTIONS.map((cta) => (
                      <option key={cta.value} value={cta.value}>
                        {cta.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preview */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Ad Preview</h4>
                  <div className="bg-white rounded-lg p-4 text-black">
                    <div className="font-bold text-lg mb-2">{adTitle || 'Ad Titel'}</div>
                    <div className="text-gray-600 mb-3">{adBody || 'Ad beschrijving tekst...'}</div>
                    <div className="text-blue-600 font-medium">
                      {CALL_TO_ACTIONS.find(cta => cta.value === callToAction)?.label || 'Call to Action'}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-500 text-red-400 rounded-lg">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                {error}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800 p-6 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Vorige
            </button>

            <div className="text-sm text-gray-400">
              Stap {step} van 4
            </div>

            {step < 4 ? (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Volgende
              </button>
            ) : (
              <button
                onClick={createCampaign}
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Campagne Aanmaken...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4 mr-2" />
                    Campagne Aanmaken
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
