'use client';

import { useState } from 'react';
import { 
  PlusIcon,
  TrashIcon,
  EyeIcon,
  PlayIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface TargetingOption {
  id: string;
  name: string;
  type: 'interest' | 'behavior' | 'demographic';
}

interface FormData {
  campaign: {
    name: string;
    objective: string;
    dailyBudget: number;
    status: string;
  };
  adSet: {
    name: string;
    dailyBudget: number;
    ageMin: number;
    ageMax: number;
    genders: string[];
    countries: string[];
    interests: string[];
    behaviors: string[];
    optimizationGoal: string;
  };
  ad: {
    name: string;
    title: string;
    body: string;
    link: string;
    message: string;
    status: string;
  };
}

const CAMPAIGN_OBJECTIVES = [
  { value: 'OUTCOME_LEADS', label: 'Lead Generatie' },
  { value: 'OUTCOME_TRAFFIC', label: 'Website Verkeer' },
  { value: 'OUTCOME_ENGAGEMENT', label: 'Betrokkenheid' },
  { value: 'OUTCOME_AWARENESS', label: 'Bewustwording' },
  { value: 'OUTCOME_SALES', label: 'Verkoop' }
];

const OPTIMIZATION_GOALS = [
  { value: 'LEADS', label: 'Leads' },
  { value: 'LINK_CLICKS', label: 'Link Clicks' },
  { value: 'POST_ENGAGEMENT', label: 'Post Engagement' },
  { value: 'REACH', label: 'Reach' },
  { value: 'CONVERSIONS', label: 'Conversions' }
];

const COUNTRIES = [
  { value: 'NL', label: 'Nederland' },
  { value: 'BE', label: 'België' },
  { value: 'DE', label: 'Duitsland' },
  { value: 'FR', label: 'Frankrijk' },
  { value: 'GB', label: 'Verenigd Koninkrijk' }
];

const INTERESTS: TargetingOption[] = [
  { id: '6002714396372', name: 'Fitness', type: 'interest' },
  { id: '6002714396373', name: 'Personal Development', type: 'interest' },
  { id: '6002714396374', name: 'Business', type: 'interest' },
  { id: '6002714396375', name: 'Entrepreneurship', type: 'interest' },
  { id: '6002714396376', name: 'Health & Wellness', type: 'interest' },
  { id: '6002714396377', name: 'Self Improvement', type: 'interest' },
  { id: '6002714396378', name: 'Leadership', type: 'interest' },
  { id: '6002714396379', name: 'Mindfulness', type: 'interest' },
  { id: '6002714396380', name: 'Productivity', type: 'interest' },
  { id: '6002714396381', name: 'Financial Planning', type: 'interest' }
];

const BEHAVIORS: TargetingOption[] = [
  { id: '6002714396382', name: 'High Income', type: 'behavior' },
  { id: '6002714396383', name: 'Business Travelers', type: 'behavior' },
  { id: '6002714396384', name: 'Frequent International Travelers', type: 'behavior' },
  { id: '6002714396385', name: 'Luxury Buyers', type: 'behavior' },
  { id: '6002714396386', name: 'Early Adopters', type: 'behavior' }
];

export default function ApiAdForm() {
  const [formData, setFormData] = useState<FormData>({
    campaign: {
      name: 'TTM - API Campagne',
      objective: 'OUTCOME_LEADS',
      dailyBudget: 50,
      status: 'PAUSED'
    },
    adSet: {
      name: 'TTM - API Ad Set',
      dailyBudget: 50,
      ageMin: 25,
      ageMax: 45,
      genders: ['1'], // Alleen mannen
      countries: ['NL'],
      interests: [],
      behaviors: [],
      optimizationGoal: 'LEADS'
    },
    ad: {
      name: 'TTM - API Ad',
      title: 'Word een Top Tier Man',
      body: 'Fysiek sterker, mentaal onbreekbaar en financieel onafhankelijk. Met mariniersdiscipline word jij een Top Tier Men.',
      link: 'https://platform.toptiermen.eu/prelaunch',
      message: 'Schrijf je in voor de wachtlijst van Top Tier Men',
      status: 'PAUSED'
    }
  });

  const [activeStep, setActiveStep] = useState<'campaign' | 'adSet' | 'ad' | 'preview'>('campaign');
  const [generatedScript, setGeneratedScript] = useState('');
  const [copied, setCopied] = useState(false);

  const updateFormData = (section: keyof FormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const toggleArrayField = (section: keyof FormData, field: string, value: string) => {
    const currentArray = formData[section][field as keyof typeof formData[typeof section]] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFormData(section, field, newArray);
  };

  const generateScript = () => {
    const script = `require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
  console.error('❌ Missing Facebook credentials in .env.local');
  process.exit(1);
}

async function createCompleteAdWorkflow() {
  try {
    console.log('🚀 Creating complete Facebook Ad workflow...\\n');
    
    // Step 1: Create Campaign
    console.log('📋 Step 1: Creating Campaign...');
    const campaignData = {
      name: '${formData.campaign.name}',
      objective: '${formData.campaign.objective}',
      status: '${formData.campaign.status}',
      special_ad_categories: [],
      daily_budget: ${formData.campaign.dailyBudget * 100},
      bid_strategy: 'LOWEST_COST_WITHOUT_CAP'
    };

    const campaignResponse = await fetch(
      \`https://graph.facebook.com/v19.0/\${FACEBOOK_AD_ACCOUNT_ID}/campaigns\`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: FACEBOOK_ACCESS_TOKEN,
          ...campaignData
        })
      }
    );

    if (!campaignResponse.ok) {
      throw new Error(\`Campaign creation failed: \${await campaignResponse.text()}\`);
    }

    const campaign = await campaignResponse.json();
    console.log('✅ Campaign created:', campaign.id);

    // Step 2: Create Ad Set
    console.log('\\n📋 Step 2: Creating Ad Set...');
    const adSetData = {
      name: '${formData.adSet.name}',
      campaign_id: campaign.id,
      status: '${formData.adSet.status || 'PAUSED'}',
      daily_budget: ${formData.adSet.dailyBudget * 100},
      billing_event: 'IMPRESSIONS',
      optimization_goal: '${formData.adSet.optimizationGoal}',
      bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
      targeting: {
        age_min: ${formData.adSet.ageMin},
        age_max: ${formData.adSet.ageMax},
        genders: [1], // Alleen mannen - Top Tier Men richt zich exclusief op mannen
        geo_locations: {
          countries: [${formData.adSet.countries.map(c => `'${c}'`).join(', ')}],
          location_types: ['home']
        }${formData.adSet.interests.length > 0 ? `,
        interests: [
          ${formData.adSet.interests.map(id => {
            const interest = INTERESTS.find(i => i.id === id);
            return `{ id: '${id}', name: '${interest?.name || 'Unknown'}' }`;
          }).join(',\n          ')}
        ]` : ''}${formData.adSet.behaviors.length > 0 ? `,
        behaviors: [
          ${formData.adSet.behaviors.map(id => {
            const behavior = BEHAVIORS.find(b => b.id === id);
            return `{ id: '${id}', name: '${behavior?.name || 'Unknown'}' }`;
          }).join(',\n          ')}
        ]` : ''}
      }
    };

    const adSetResponse = await fetch(
      \`https://graph.facebook.com/v19.0/\${FACEBOOK_AD_ACCOUNT_ID}/adsets\`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: FACEBOOK_ACCESS_TOKEN,
          ...adSetData
        })
      }
    );

    if (!adSetResponse.ok) {
      throw new Error(\`Ad Set creation failed: \${await adSetResponse.text()}\`);
    }

    const adSet = await adSetResponse.json();
    console.log('✅ Ad Set created:', adSet.id);

    // Step 3: Create Ad Creative
    console.log('\\n📋 Step 3: Creating Ad Creative...');
    const creativeData = {
      name: '${formData.ad.name} - Creative',
      title: '${formData.ad.title}',
      body: '${formData.ad.body}',
      object_story_spec: {
        page_id: 'YOUR_PAGE_ID', // Replace with actual page ID
        link_data: {
          link: '${formData.ad.link}',
          message: '${formData.ad.message}'
        }
      }
    };

    const creativeResponse = await fetch(
      \`https://graph.facebook.com/v19.0/\${FACEBOOK_AD_ACCOUNT_ID}/adcreatives\`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: FACEBOOK_ACCESS_TOKEN,
          ...creativeData
        })
      }
    );

    if (!creativeResponse.ok) {
      throw new Error(\`Creative creation failed: \${await creativeResponse.text()}\`);
    }

    const creative = await creativeResponse.json();
    console.log('✅ Ad Creative created:', creative.id);

    // Step 4: Create Ad
    console.log('\\n📋 Step 4: Creating Ad...');
    const adData = {
      name: '${formData.ad.name}',
      adset_id: adSet.id,
      creative: { creative_id: creative.id },
      status: '${formData.ad.status}'
    };

    const adResponse = await fetch(
      \`https://graph.facebook.com/v19.0/\${FACEBOOK_AD_ACCOUNT_ID}/ads\`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: FACEBOOK_ACCESS_TOKEN,
          ...adData
        })
      }
    );

    if (!adResponse.ok) {
      throw new Error(\`Ad creation failed: \${await adResponse.text()}\`);
    }

    const ad = await adResponse.json();
    console.log('✅ Ad created:', ad.id);

    // Summary
    console.log('\\n🎉 Complete workflow created successfully!');
    console.log('==============================');
    console.log(\`Campaign ID: \${campaign.id}\`);
    console.log(\`Ad Set ID: \${adSet.id}\`);
    console.log(\`Creative ID: \${creative.id}\`);
    console.log(\`Ad ID: \${ad.id}\`);
    console.log('\\n🔗 View in Facebook Ads Manager:');
    console.log(\`https://business.facebook.com/adsmanager/manage/campaigns/\${campaign.id}\`);

  } catch (error) {
    console.error('❌ Error in complete workflow:', error);
  }
}

createCompleteAdWorkflow().catch(console.error);`;

    setGeneratedScript(script);
    setActiveStep('preview');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Step Navigation */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'campaign', label: 'Campagne', icon: '📋' },
          { id: 'adSet', label: 'Advertentieset', icon: '🎯' },
          { id: 'ad', label: 'Advertentie', icon: '📢' },
          { id: 'preview', label: 'Script', icon: '💻' }
        ].map((step) => (
          <button
            key={step.id}
            onClick={() => setActiveStep(step.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeStep === step.id
                ? 'bg-[#8BAE5A] text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <span>{step.icon}</span>
            <span>{step.label}</span>
          </button>
        ))}
      </div>

      {/* Campaign Form */}
      {activeStep === 'campaign' && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-[#8BAE5A] mb-4">📋 Campagne Configuratie</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Campagne Naam</label>
              <input
                type="text"
                value={formData.campaign.name}
                onChange={(e) => updateFormData('campaign', 'name', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="TTM - API Campagne"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Doel</label>
              <select
                value={formData.campaign.objective}
                onChange={(e) => updateFormData('campaign', 'objective', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                {CAMPAIGN_OBJECTIVES.map(obj => (
                  <option key={obj.value} value={obj.value}>{obj.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Dagelijks Budget (€)</label>
              <input
                type="number"
                value={formData.campaign.dailyBudget}
                onChange={(e) => updateFormData('campaign', 'dailyBudget', Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                min="1"
                max="1000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={formData.campaign.status}
                onChange={(e) => updateFormData('campaign', 'status', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="PAUSED">Gepauzeerd</option>
                <option value="ACTIVE">Actief</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setActiveStep('adSet')}
              className="bg-[#8BAE5A] hover:bg-[#7A9F4A] text-white px-6 py-2 rounded-lg flex items-center space-x-2"
            >
              <span>Volgende</span>
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Ad Set Form */}
      {activeStep === 'adSet' && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-[#8BAE5A] mb-4">🎯 Advertentieset Configuratie</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Ad Set Naam</label>
              <input
                type="text"
                value={formData.adSet.name}
                onChange={(e) => updateFormData('adSet', 'name', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="TTM - API Ad Set"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Dagelijks Budget (€)</label>
              <input
                type="number"
                value={formData.adSet.dailyBudget}
                onChange={(e) => updateFormData('adSet', 'dailyBudget', Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                min="1"
                max="1000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Leeftijd Min</label>
              <input
                type="number"
                value={formData.adSet.ageMin}
                onChange={(e) => updateFormData('adSet', 'ageMin', Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                min="13"
                max="65"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Leeftijd Max</label>
              <input
                type="number"
                value={formData.adSet.ageMax}
                onChange={(e) => updateFormData('adSet', 'ageMax', Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                min="13"
                max="65"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Geslacht</label>
              <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled={true}
                    className="text-[#8BAE5A] bg-gray-700 border-gray-600 rounded"
                  />
                  <span className="text-blue-400 font-medium">Mannen (Vast)</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Top Tier Men richt zich exclusief op mannen
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Landen</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {COUNTRIES.map(country => (
                  <label key={country.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.adSet.countries.includes(country.value)}
                      onChange={() => toggleArrayField('adSet', 'countries', country.value)}
                      className="text-[#8BAE5A] bg-gray-700 border-gray-600 rounded"
                    />
                    <span className="text-gray-300">{country.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Optimalisatie Doel</label>
              <select
                value={formData.adSet.optimizationGoal}
                onChange={(e) => updateFormData('adSet', 'optimizationGoal', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                {OPTIMIZATION_GOALS.map(goal => (
                  <option key={goal.value} value={goal.value}>{goal.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Interests */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">Interesses</label>
            <div className="grid md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {INTERESTS.map(interest => (
                <label key={interest.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.adSet.interests.includes(interest.id)}
                    onChange={() => toggleArrayField('adSet', 'interests', interest.id)}
                    className="text-[#8BAE5A] bg-gray-700 border-gray-600 rounded"
                  />
                  <span className="text-gray-300">{interest.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Behaviors */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">Gedrag</label>
            <div className="grid md:grid-cols-2 gap-2">
              {BEHAVIORS.map(behavior => (
                <label key={behavior.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.adSet.behaviors.includes(behavior.id)}
                    onChange={() => toggleArrayField('adSet', 'behaviors', behavior.id)}
                    className="text-[#8BAE5A] bg-gray-700 border-gray-600 rounded"
                  />
                  <span className="text-gray-300">{behavior.name}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setActiveStep('campaign')}
              className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg"
            >
              Terug
            </button>
            <button
              onClick={() => setActiveStep('ad')}
              className="bg-[#8BAE5A] hover:bg-[#7A9F4A] text-white px-6 py-2 rounded-lg flex items-center space-x-2"
            >
              <span>Volgende</span>
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Ad Form */}
      {activeStep === 'ad' && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-[#8BAE5A] mb-4">📢 Advertentie Configuratie</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Advertentie Naam</label>
              <input
                type="text"
                value={formData.ad.name}
                onChange={(e) => updateFormData('ad', 'name', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="TTM - API Ad"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={formData.ad.status}
                onChange={(e) => updateFormData('ad', 'status', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="PAUSED">Gepauzeerd</option>
                <option value="ACTIVE">Actief</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Titel</label>
              <input
                type="text"
                value={formData.ad.title}
                onChange={(e) => updateFormData('ad', 'title', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="Word een Top Tier Man"
                maxLength={40}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Body Text</label>
              <textarea
                value={formData.ad.body}
                onChange={(e) => updateFormData('ad', 'body', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                rows={3}
                placeholder="Fysiek sterker, mentaal onbreekbaar en financieel onafhankelijk..."
                maxLength={125}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Link</label>
              <input
                type="url"
                value={formData.ad.link}
                onChange={(e) => updateFormData('ad', 'link', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="https://platform.toptiermen.eu/prelaunch"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
              <textarea
                value={formData.ad.message}
                onChange={(e) => updateFormData('ad', 'message', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                rows={2}
                placeholder="Schrijf je in voor de wachtlijst van Top Tier Men"
                maxLength={2000}
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setActiveStep('adSet')}
              className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg"
            >
              Terug
            </button>
            <button
              onClick={generateScript}
              className="bg-[#8BAE5A] hover:bg-[#7A9F4A] text-white px-6 py-2 rounded-lg flex items-center space-x-2"
            >
              <PlayIcon className="w-4 h-4" />
              <span>Script Genereren</span>
            </button>
          </div>
        </div>
      )}

      {/* Script Preview */}
      {activeStep === 'preview' && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-[#8BAE5A] mb-4">💻 Gegenereerde Script</h3>
          
          <div className="bg-gray-700 p-4 rounded-lg mb-4">
            <p className="text-gray-300 mb-4">
              Dit script maakt een complete advertentie workflow aan met jouw configuratie.
            </p>
            <button
              onClick={copyToClipboard}
              className="bg-[#8BAE5A] hover:bg-[#7A9F4A] text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <ClipboardDocumentIcon className="w-5 h-5" />
              <span>
                {copied ? (
                  <>
                    <CheckCircleIcon className="w-5 h-5 inline mr-1" />
                    Gekopieerd!
                  </>
                ) : (
                  'Kopieer Script'
                )}
              </span>
            </button>
          </div>
          
          <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm text-gray-300">{generatedScript}</pre>
          </div>
          
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setActiveStep('ad')}
              className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg"
            >
              Terug
            </button>
            <button
              onClick={() => setActiveStep('campaign')}
              className="bg-[#8BAE5A] hover:bg-[#7A9F4A] text-white px-6 py-2 rounded-lg flex items-center space-x-2"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Nieuwe Campagne</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
