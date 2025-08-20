'use client';

import { useState } from 'react';

interface CampaignSetupProps {
  selectedVideo: {
    id: string;
    name: string;
    campaignStatus: 'active' | 'inactive';
  } | null;
  onClose: () => void;
  onSave: (campaign: CampaignData) => void;
}

interface CampaignData {
  id: string;
  name: string;
  videoId: string;
  videoName: string;
  objective: 'AWARENESS' | 'CONSIDERATION' | 'CONVERSIONS';
  budget: {
    amount: number;
    currency: 'EUR';
    type: 'DAILY' | 'LIFETIME';
  };
  targeting: {
    ageMin: number;
    ageMax: number;
    gender: 'ALL' | 'MEN' | 'WOMEN';
    locations: string[];
    languages: string[];
    interests: string[];
    behaviors: string[];
    exclusions: string[];
  };
  placements: {
    facebook: boolean;
    instagram: boolean;
    audienceNetwork: boolean;
    messenger: boolean;
  };
  adFormat: 'VIDEO' | 'CAROUSEL' | 'STORY';
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED';
}

export default function CampaignSetup({ selectedVideo, onClose, onSave }: CampaignSetupProps) {
  const [campaign, setCampaign] = useState<CampaignData>({
    id: `campaign-${Date.now()}`,
    name: '',
    videoId: selectedVideo?.id || '',
    videoName: selectedVideo?.name || '',
    objective: 'CONSIDERATION',
    budget: {
      amount: 5,
      currency: 'EUR',
      type: 'DAILY'
    },
    targeting: {
      ageMin: 25,
      ageMax: 45,
      gender: 'MEN',
      locations: ['Nederland'],
      languages: ['Nederlands'],
      interests: [
        'Fitness',
        'Personal Training',
        'Gezonde Voeding',
        'Motivatie',
        'Ondernemerschap'
      ],
      behaviors: [
        'Frequent gym bezoekers',
        'Online fitness content consumers'
      ],
      exclusions: []
    },
    placements: {
      facebook: true,
      instagram: true,
      audienceNetwork: false,
      messenger: false
    },
    adFormat: 'VIDEO',
    status: 'DRAFT'
  });

  const [step, setStep] = useState(1);

  const handleSave = async () => {
    try {
      console.log('🎯 Saving campaign to database:', campaign);
      
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaign),
      });

      const result = await response.json();

      if (!result.success) {
        console.error('Failed to save campaign:', result.error);
        alert(`Fout bij opslaan: ${result.error}`);
        return;
      }

      console.log('✅ Campaign saved successfully:', result.campaign);
      onSave(result.campaign);
      onClose();
    } catch (error) {
      console.error('Error saving campaign:', error);
      alert('Er is een fout opgetreden bij het opslaan van de campagne');
    }
  };

  if (!selectedVideo) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Campagne Opzetten</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center mb-6">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-400'
              }`}>
                {stepNumber}
              </div>
              {stepNumber < 4 && (
                <div className={`w-16 h-1 mx-2 ${
                  step > stepNumber ? 'bg-blue-600' : 'bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Campaign Basics */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Campagne Basis</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Campagne Naam
              </label>
              <input
                type="text"
                value={campaign.name}
                onChange={(e) => setCampaign({...campaign, name: e.target.value})}
                placeholder="Bijv: TTM Het Merk - Q4 2024"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Video
              </label>
              <div className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300">
                {selectedVideo.name}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Doelstelling
              </label>
              <select
                value={campaign.objective}
                onChange={(e) => setCampaign({...campaign, objective: e.target.value as any})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="AWARENESS">Bewustwording (Bekendheid)</option>
                <option value="CONSIDERATION">Overweging (Video Views)</option>
                <option value="CONVERSIONS">Conversies (Website Bezoeken)</option>
              </select>
            </div>

            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Dagelijks Budget (€)
                </label>
                <input
                  type="number"
                  value={campaign.budget.amount}
                  onChange={(e) => setCampaign({
                    ...campaign, 
                    budget: {...campaign.budget, amount: Number(e.target.value)}
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Budget Type
                </label>
                <select
                  value={campaign.budget.type}
                  onChange={(e) => setCampaign({
                    ...campaign, 
                    budget: {...campaign.budget, type: e.target.value as any}
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="DAILY">Dagelijks</option>
                  <option value="LIFETIME">Totaal</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Targeting */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Doelgroep Targeting</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Leeftijd Van
                </label>
                <input
                  type="number"
                  value={campaign.targeting.ageMin}
                  onChange={(e) => setCampaign({
                    ...campaign, 
                    targeting: {...campaign.targeting, ageMin: Number(e.target.value)}
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Leeftijd Tot
                </label>
                <input
                  type="number"
                  value={campaign.targeting.ageMax}
                  onChange={(e) => setCampaign({
                    ...campaign, 
                    targeting: {...campaign.targeting, ageMax: Number(e.target.value)}
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Geslacht
              </label>
              <select
                value={campaign.targeting.gender}
                onChange={(e) => setCampaign({
                  ...campaign, 
                  targeting: {...campaign.targeting, gender: e.target.value as any}
                })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">Alle geslachten</option>
                <option value="MEN">Alleen mannen</option>
                <option value="WOMEN">Alleen vrouwen</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Locaties
              </label>
              <div className="space-y-2">
                {['Nederland', 'België', 'Duitsland'].map((location) => (
                  <label key={location} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={campaign.targeting.locations.includes(location)}
                      onChange={(e) => {
                        const newLocations = e.target.checked
                          ? [...campaign.targeting.locations, location]
                          : campaign.targeting.locations.filter(l => l !== location);
                        setCampaign({
                          ...campaign,
                          targeting: {...campaign.targeting, locations: newLocations}
                        });
                      }}
                      className="mr-2"
                    />
                    <span className="text-gray-300">{location}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Interesses
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Fitness', 'Personal Training', 'Gezonde Voeding', 'Motivatie',
                  'Ondernemerschap', 'Business', 'Mindset', 'Discipline',
                  'Gym', 'Sport', 'Gezondheid', 'Persoonlijke Ontwikkeling'
                ].map((interest) => (
                  <label key={interest} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={campaign.targeting.interests.includes(interest)}
                      onChange={(e) => {
                        const newInterests = e.target.checked
                          ? [...campaign.targeting.interests, interest]
                          : campaign.targeting.interests.filter(i => i !== interest);
                        setCampaign({
                          ...campaign,
                          targeting: {...campaign.targeting, interests: newInterests}
                        });
                      }}
                      className="mr-2"
                    />
                    <span className="text-gray-300 text-sm">{interest}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Placements */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Plaatsingen</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-white">Facebook</h4>
                  <p className="text-sm text-gray-400">News Feed, Stories, Reels</p>
                </div>
                <input
                  type="checkbox"
                  checked={campaign.placements.facebook}
                  onChange={(e) => setCampaign({
                    ...campaign,
                    placements: {...campaign.placements, facebook: e.target.checked}
                  })}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-white">Instagram</h4>
                  <p className="text-sm text-gray-400">Feed, Stories, Reels, Explore</p>
                </div>
                <input
                  type="checkbox"
                  checked={campaign.placements.instagram}
                  onChange={(e) => setCampaign({
                    ...campaign,
                    placements: {...campaign.placements, instagram: e.target.checked}
                  })}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-white">Audience Network</h4>
                  <p className="text-sm text-gray-400">Externe apps en websites</p>
                </div>
                <input
                  type="checkbox"
                  checked={campaign.placements.audienceNetwork}
                  onChange={(e) => setCampaign({
                    ...campaign,
                    placements: {...campaign.placements, audienceNetwork: e.target.checked}
                  })}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-white">Messenger</h4>
                  <p className="text-sm text-gray-400">Messenger Stories</p>
                </div>
                <input
                  type="checkbox"
                  checked={campaign.placements.messenger}
                  onChange={(e) => setCampaign({
                    ...campaign,
                    placements: {...campaign.placements, messenger: e.target.checked}
                  })}
                  className="w-4 h-4"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Campagne Overzicht</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-white mb-2">Campagne Details</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p><strong>Naam:</strong> {campaign.name}</p>
                    <p><strong>Video:</strong> {campaign.videoName}</p>
                    <p><strong>Doelstelling:</strong> {campaign.objective}</p>
                    <p><strong>Budget:</strong> €{campaign.budget.amount} {campaign.budget.type === 'DAILY' ? 'per dag' : 'totaal'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Targeting</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p><strong>Leeftijd:</strong> {campaign.targeting.ageMin}-{campaign.targeting.ageMax} jaar</p>
                    <p><strong>Geslacht:</strong> {campaign.targeting.gender}</p>
                    <p><strong>Locaties:</strong> {campaign.targeting.locations.join(', ')}</p>
                    <p><strong>Interesses:</strong> {campaign.targeting.interests.slice(0, 3).join(', ')}...</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-white mb-2">Geschatte Resultaten</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><strong>Bereik:</strong> 10,000 - 25,000 mensen</p>
                  <p><strong>Video Views:</strong> 2,000 - 5,000 views</p>
                  <p><strong>CPV:</strong> €0.01 - €0.03 per view</p>
                  <p><strong>CTR:</strong> 1.5% - 3%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-700">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
          >
            Vorige
          </button>
          
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Annuleren
            </button>
            
            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Volgende
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Campagne Activeren
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
