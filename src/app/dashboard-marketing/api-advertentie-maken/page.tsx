'use client';

import { useState } from 'react';
import { 
  CodeBracketIcon,
  PlayIcon,
  DocumentTextIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import ApiAdForm from '@/components/ApiAdForm';

export default function ApiAdvertentieMakenPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedScript, setCopiedScript] = useState('');

  const copyToClipboard = async (text: string, scriptName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedScript(scriptName);
      setTimeout(() => setCopiedScript(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const campaignConfig = {
    name: 'TTM - API Test Campagne',
    objective: 'OUTCOME_LEADS',
    status: 'PAUSED',
    special_ad_categories: [],
    daily_budget: 5000, // €50
    bid_strategy: 'LOWEST_COST_WITHOUT_CAP'
  };

           const adSetConfig = {
           name: 'TTM - API Test Ad Set',
           status: 'PAUSED',
           daily_budget: 5000,
           billing_event: 'IMPRESSIONS',
           optimization_goal: 'LEADS',
           bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
           targeting: {
             age_min: 25,
             age_max: 45,
             genders: [1], // 1 = male (Top Tier Men richt zich exclusief op mannen)
      geo_locations: {
        countries: ['NL'],
        location_types: ['home']
      },
      interests: [
        { id: '6002714396372', name: 'Fitness' },
        { id: '6002714396373', name: 'Personal development' },
        { id: '6002714396374', name: 'Business' }
      ],
      behaviors: [
        { id: '6002714396375', name: 'High income' }
      ]
    }
  };

  const adConfig = {
    name: 'TTM - API Test Ad',
    status: 'PAUSED',
    creative: {
      name: 'TTM - API Test Creative',
      title: 'Word een Top Tier Man',
      body: 'Fysiek sterker, mentaal onbreekbaar en financieel onafhankelijk. Met mariniersdiscipline word jij een Top Tier Men.',
      object_story_spec: {
        page_id: 'YOUR_PAGE_ID',
        link_data: {
          link: 'https://platform.toptiermen.eu/prelaunch',
          message: 'Schrijf je in voor de wachtlijst van Top Tier Men'
        }
      }
    }
  };

  const createCampaignScript = `require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
  console.error('❌ Missing Facebook credentials in .env.local');
  process.exit(1);
}

async function createCampaign() {
  try {
    console.log('🎯 Creating Facebook Campaign...');
    
    const campaignData = {
      name: 'TTM - API Test Campagne',
      objective: 'OUTCOME_LEADS',
      status: 'PAUSED',
      special_ad_categories: [],
      daily_budget: 5000, // €50
      bid_strategy: 'LOWEST_COST_WITHOUT_CAP'
    };

    const response = await fetch(
      \`https://graph.facebook.com/v19.0/\${FACEBOOK_AD_ACCOUNT_ID}/campaigns\`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: FACEBOOK_ACCESS_TOKEN,
          ...campaignData
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to create campaign:', errorText);
      return null;
    }

    const data = await response.json();
    console.log('✅ Campaign created successfully!');
    console.log('📋 Campaign ID:', data.id);
    console.log('📋 Campaign name:', data.name);
    
    return data;

  } catch (error) {
    console.error('❌ Error creating campaign:', error);
    return null;
  }
}

createCampaign().catch(console.error);`;

  const createAdSetScript = `require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

async function createAdSet(campaignId) {
  try {
    console.log('🎯 Creating Facebook Ad Set...');
    
    const adSetData = {
      name: 'TTM - API Test Ad Set',
      campaign_id: campaignId,
      status: 'PAUSED',
      daily_budget: 5000,
      billing_event: 'IMPRESSIONS',
      optimization_goal: 'LEADS',
      bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
      targeting: {
        age_min: 25,
        age_max: 45,
        genders: [1, 2],
        geo_locations: {
          countries: ['NL'],
          location_types: ['home']
        },
        interests: [
          { id: '6002714396372', name: 'Fitness' },
          { id: '6002714396373', name: 'Personal development' },
          { id: '6002714396374', name: 'Business' }
        ],
        behaviors: [
          { id: '6002714396375', name: 'High income' }
        ]
      }
    };

    const response = await fetch(
      \`https://graph.facebook.com/v19.0/\${FACEBOOK_AD_ACCOUNT_ID}/adsets\`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: FACEBOOK_ACCESS_TOKEN,
          ...adSetData
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to create ad set:', errorText);
      return null;
    }

    const data = await response.json();
    console.log('✅ Ad Set created successfully!');
    console.log('📋 Ad Set ID:', data.id);
    console.log('📋 Ad Set name:', data.name);
    
    return data;

  } catch (error) {
    console.error('❌ Error creating ad set:', error);
    return null;
  }
}

// Usage: createAdSet('CAMPAIGN_ID_HERE').catch(console.error);`;

  const createAdScript = `require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

async function createAd(adSetId) {
  try {
    console.log('🎯 Creating Facebook Ad...');
    
    // Step 1: Create ad creative
    const creativeData = {
      name: 'TTM - API Test Creative',
      title: 'Word een Top Tier Man',
      body: 'Fysiek sterker, mentaal onbreekbaar en financieel onafhankelijk. Met mariniersdiscipline word jij een Top Tier Men.',
      object_story_spec: {
        page_id: 'YOUR_PAGE_ID', // Replace with actual page ID
        link_data: {
          link: 'https://platform.toptiermen.eu/prelaunch',
          message: 'Schrijf je in voor de wachtlijst van Top Tier Men'
        }
      }
    };

    const creativeResponse = await fetch(
      \`https://graph.facebook.com/v19.0/\${FACEBOOK_AD_ACCOUNT_ID}/adcreatives\`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: FACEBOOK_ACCESS_TOKEN,
          ...creativeData
        })
      }
    );

    if (!creativeResponse.ok) {
      const errorText = await creativeResponse.text();
      console.error('❌ Failed to create ad creative:', errorText);
      return null;
    }

    const creative = await creativeResponse.json();
    console.log('✅ Ad Creative created successfully!');
    console.log('📋 Creative ID:', creative.id);

    // Step 2: Create ad
    const adData = {
      name: 'TTM - API Test Ad',
      adset_id: adSetId,
      creative: { creative_id: creative.id },
      status: 'PAUSED'
    };

    const adResponse = await fetch(
      \`https://graph.facebook.com/v19.0/\${FACEBOOK_AD_ACCOUNT_ID}/ads\`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: FACEBOOK_ACCESS_TOKEN,
          ...adData
        })
      }
    );

    if (!adResponse.ok) {
      const errorText = await adResponse.text();
      console.error('❌ Failed to create ad:', errorText);
      return null;
    }

    const ad = await adResponse.json();
    console.log('✅ Ad created successfully!');
    console.log('📋 Ad ID:', ad.id);
    console.log('📋 Ad name:', ad.name);
    
    return ad;

  } catch (error) {
    console.error('❌ Error creating ad:', error);
    return null;
  }
}

// Usage: createAd('ADSET_ID_HERE').catch(console.error);`;

  const completeWorkflowScript = `require('dotenv').config({ path: '.env.local' });

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
      name: 'TTM - Complete API Workflow',
      objective: 'OUTCOME_LEADS',
      status: 'PAUSED',
      special_ad_categories: [],
      daily_budget: 5000,
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
      name: 'TTM - Complete API Ad Set',
      campaign_id: campaign.id,
      status: 'PAUSED',
      daily_budget: 5000,
      billing_event: 'IMPRESSIONS',
      optimization_goal: 'LEADS',
      bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
      targeting: {
        age_min: 25,
        age_max: 45,
        genders: [1, 2],
        geo_locations: {
          countries: ['NL'],
          location_types: ['home']
        },
        interests: [
          { id: '6002714396372', name: 'Fitness' },
          { id: '6002714396373', name: 'Personal development' }
        ]
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
      name: 'TTM - Complete API Creative',
      title: 'Word een Top Tier Man',
      body: 'Fysiek sterker, mentaal onbreekbaar en financieel onafhankelijk.',
      object_story_spec: {
        page_id: 'YOUR_PAGE_ID', // Replace with actual page ID
        link_data: {
          link: 'https://platform.toptiermen.eu/prelaunch',
          message: 'Schrijf je in voor de wachtlijst'
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
      name: 'TTM - Complete API Ad',
      adset_id: adSet.id,
      creative: { creative_id: creative.id },
      status: 'PAUSED'
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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#8BAE5A] mb-4">
            API Advertentie Maken
          </h1>
          <p className="text-gray-300 text-lg">
            Complete handleiding voor het maken van Facebook advertenties via de API
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg mb-8">
          {[
            { id: 'overview', label: 'Overzicht', icon: InformationCircleIcon },
            { id: 'form', label: 'Advertentie Formulier', icon: PlusIcon },
            { id: 'campaign', label: 'Campagne', icon: DocumentTextIcon },
            { id: 'adset', label: 'Advertentieset', icon: DocumentTextIcon },
            { id: 'ad', label: 'Advertentie', icon: DocumentTextIcon },
            { id: 'workflow', label: 'Complete Workflow', icon: PlayIcon },
            { id: 'scripts', label: 'Scripts', icon: CodeBracketIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#8BAE5A] text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Form Tab */}
          {activeTab === 'form' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#8BAE5A] mb-4">
                <PlusIcon className="w-6 h-6 inline mr-2" />
                Interactief Advertentie Formulier
              </h2>
              <p className="text-gray-300 mb-6">
                Vul de onderstaande velden in om een complete Facebook advertentie workflow te genereren. 
                Het formulier genereert automatisch een werkend script dat je kunt uitvoeren.
              </p>
              <ApiAdForm />
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#8BAE5A] mb-4">
                <InformationCircleIcon className="w-6 h-6 inline mr-2" />
                API Advertentie Workflow
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-[#8BAE5A] mb-2">1. Campagne</h3>
                  <p className="text-gray-300 text-sm">
                    Maak eerst een campagne aan met het juiste doel (LEADS, TRAFFIC, etc.)
                  </p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-[#8BAE5A] mb-2">2. Advertentieset</h3>
                  <p className="text-gray-300 text-sm">
                    Configureer targeting, budget en optimalisatie instellingen
                  </p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-[#8BAE5A] mb-2">3. Advertentie</h3>
                  <p className="text-gray-300 text-sm">
                    Maak de creatieve content en koppel aan de advertentieset
                  </p>
                </div>
              </div>

                             <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                 <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                   <ExclamationTriangleIcon className="w-5 h-5 inline mr-2" />
                   Belangrijke Vereisten
                 </h3>
                 <ul className="text-gray-300 space-y-2">
                   <li>• Facebook Access Token met <code className="bg-gray-700 px-1 rounded">ads_management</code> permissie</li>
                   <li>• Facebook Ad Account ID</li>
                   <li>• Facebook Page ID voor creatives</li>
                   <li>• Lead Form ID voor LEADS campagnes</li>
                 </ul>
               </div>

               <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mt-4">
                 <h3 className="text-lg font-semibold text-blue-400 mb-2">
                   <InformationCircleIcon className="w-5 h-5 inline mr-2" />
                   Doelgroep Specificatie
                 </h3>
                 <ul className="text-gray-300 space-y-2">
                   <li>• <strong>Geslacht:</strong> Alleen mannen (Top Tier Men richt zich exclusief op mannen)</li>
                   <li>• <strong>Leeftijd:</strong> 25-45 jaar (aanpasbaar in formulier)</li>
                   <li>• <strong>Landen:</strong> Nederland, België, Duitsland, etc. (selecteerbaar)</li>
                   <li>• <strong>Interesses:</strong> Fitness, Personal Development, Business, etc.</li>
                 </ul>
               </div>

              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mt-4">
                <h3 className="text-lg font-semibold text-green-400 mb-2">
                  <PlusIcon className="w-5 h-5 inline mr-2" />
                  Snelle Start
                </h3>
                <p className="text-gray-300 mb-3">
                  Gebruik het <strong>Advertentie Formulier</strong> tab om eenvoudig campagnes aan te maken met echte Facebook targeting opties.
                </p>
                <button
                  onClick={() => setActiveTab('form')}
                  className="bg-[#8BAE5A] hover:bg-[#7A9F4A] text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Start Advertentie Formulier</span>
                </button>
              </div>
            </div>
          )}

          {/* Campaign Tab */}
          {activeTab === 'campaign' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#8BAE5A] mb-4">
                <DocumentTextIcon className="w-6 h-6 inline mr-2" />
                Campagne Configuratie
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Campagne Instellingen</h3>
                  <div className="bg-gray-700 p-4 rounded-lg space-y-2">
                    <div><strong>Naam:</strong> {campaignConfig.name}</div>
                    <div><strong>Doel:</strong> {campaignConfig.objective}</div>
                    <div><strong>Status:</strong> {campaignConfig.status}</div>
                    <div><strong>Dagelijks Budget:</strong> €{campaignConfig.daily_budget / 100}</div>
                    <div><strong>Biedstrategie:</strong> {campaignConfig.bid_strategy}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Beschikbare Doelen</h3>
                  <div className="bg-gray-700 p-4 rounded-lg space-y-2 text-sm">
                    <div><code className="bg-gray-600 px-1 rounded">OUTCOME_LEADS</code> - Lead generatie</div>
                    <div><code className="bg-gray-600 px-1 rounded">OUTCOME_TRAFFIC</code> - Website verkeer</div>
                    <div><code className="bg-gray-600 px-1 rounded">OUTCOME_ENGAGEMENT</code> - Betrokkenheid</div>
                    <div><code className="bg-gray-600 px-1 rounded">OUTCOME_AWARENESS</code> - Bewustwording</div>
                    <div><code className="bg-gray-600 px-1 rounded">OUTCOME_SALES</code> - Verkoop</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ad Set Tab */}
          {activeTab === 'adset' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#8BAE5A] mb-4">
                <DocumentTextIcon className="w-6 h-6 inline mr-2" />
                Advertentieset Configuratie
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Basis Instellingen</h3>
                  <div className="bg-gray-700 p-4 rounded-lg space-y-2">
                    <div><strong>Naam:</strong> {adSetConfig.name}</div>
                    <div><strong>Status:</strong> {adSetConfig.status}</div>
                    <div><strong>Dagelijks Budget:</strong> €{adSetConfig.daily_budget / 100}</div>
                    <div><strong>Facturering:</strong> {adSetConfig.billing_event}</div>
                    <div><strong>Optimalisatie:</strong> {adSetConfig.optimization_goal}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Targeting Instellingen</h3>
                  <div className="bg-gray-700 p-4 rounded-lg space-y-2 text-sm">
                    <div><strong>Leeftijd:</strong> {adSetConfig.targeting.age_min}-{adSetConfig.targeting.age_max}</div>
                    <div><strong>Land:</strong> {adSetConfig.targeting.geo_locations.countries.join(', ')}</div>
                    <div><strong>Interesses:</strong> {adSetConfig.targeting.interests.map(i => i.name).join(', ')}</div>
                    <div><strong>Gedrag:</strong> {adSetConfig.targeting.behaviors.map(b => b.name).join(', ')}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ad Tab */}
          {activeTab === 'ad' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#8BAE5A] mb-4">
                <DocumentTextIcon className="w-6 h-6 inline mr-2" />
                Advertentie Configuratie
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Advertentie Instellingen</h3>
                  <div className="bg-gray-700 p-4 rounded-lg space-y-2">
                    <div><strong>Naam:</strong> {adConfig.name}</div>
                    <div><strong>Status:</strong> {adConfig.status}</div>
                    <div><strong>Creative Naam:</strong> {adConfig.creative.name}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Creative Content</h3>
                  <div className="bg-gray-700 p-4 rounded-lg space-y-2">
                    <div><strong>Titel:</strong> {adConfig.creative.title}</div>
                    <div><strong>Body:</strong> {adConfig.creative.body}</div>
                    <div><strong>Link:</strong> {adConfig.creative.object_story_spec.link_data.link}</div>
                    <div><strong>Message:</strong> {adConfig.creative.object_story_spec.link_data.message}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Complete Workflow Tab */}
          {activeTab === 'workflow' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#8BAE5A] mb-4">
                <PlayIcon className="w-6 h-6 inline mr-2" />
                Complete Workflow Script
              </h2>
              
              <div className="bg-gray-700 p-4 rounded-lg mb-4">
                <p className="text-gray-300 mb-4">
                  Dit script maakt een complete advertentie workflow aan: Campagne → Advertentieset → Creative → Advertentie
                </p>
                <button
                  onClick={() => copyToClipboard(completeWorkflowScript, 'workflow')}
                  className="bg-[#8BAE5A] hover:bg-[#7A9F4A] text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <ClipboardDocumentIcon className="w-5 h-5" />
                  <span>
                    {copiedScript === 'workflow' ? (
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
                <pre className="text-sm text-gray-300">{completeWorkflowScript}</pre>
              </div>
            </div>
          )}

          {/* Scripts Tab */}
          {activeTab === 'scripts' && (
            <div className="space-y-6">
              {/* Campaign Script */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-[#8BAE5A] mb-4">
                  <CodeBracketIcon className="w-6 h-6 inline mr-2" />
                  Campagne Script
                </h3>
                <div className="bg-gray-700 p-4 rounded-lg mb-4">
                  <p className="text-gray-300 mb-4">
                    Script voor het aanmaken van een Facebook campagne
                  </p>
                  <button
                    onClick={() => copyToClipboard(createCampaignScript, 'campaign')}
                    className="bg-[#8BAE5A] hover:bg-[#7A9F4A] text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <ClipboardDocumentIcon className="w-5 h-5" />
                    <span>
                      {copiedScript === 'campaign' ? (
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
                  <pre className="text-sm text-gray-300">{createCampaignScript}</pre>
                </div>
              </div>

              {/* Ad Set Script */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-[#8BAE5A] mb-4">
                  <CodeBracketIcon className="w-6 h-6 inline mr-2" />
                  Advertentieset Script
                </h3>
                <div className="bg-gray-700 p-4 rounded-lg mb-4">
                  <p className="text-gray-300 mb-4">
                    Script voor het aanmaken van een Facebook advertentieset
                  </p>
                  <button
                    onClick={() => copyToClipboard(createAdSetScript, 'adset')}
                    className="bg-[#8BAE5A] hover:bg-[#7A9F4A] text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <ClipboardDocumentIcon className="w-5 h-5" />
                    <span>
                      {copiedScript === 'adset' ? (
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
                  <pre className="text-sm text-gray-300">{createAdSetScript}</pre>
                </div>
              </div>

              {/* Ad Script */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-[#8BAE5A] mb-4">
                  <CodeBracketIcon className="w-6 h-6 inline mr-2" />
                  Advertentie Script
                </h3>
                <div className="bg-gray-700 p-4 rounded-lg mb-4">
                  <p className="text-gray-300 mb-4">
                    Script voor het aanmaken van een Facebook advertentie
                  </p>
                  <button
                    onClick={() => copyToClipboard(createAdScript, 'ad')}
                    className="bg-[#8BAE5A] hover:bg-[#7A9F4A] text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <ClipboardDocumentIcon className="w-5 h-5" />
                    <span>
                      {copiedScript === 'ad' ? (
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
                  <pre className="text-sm text-gray-300">{createAdScript}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
