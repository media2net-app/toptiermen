'use client';

import { useState, useEffect } from 'react';
import { 
  UserGroupIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ChartBarIcon,
  MapPinIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';

// Types
interface AudienceData {
  totalAudience: number;
  activeAudience: number;
  newAudience: number;
  returningAudience: number;
  engagementRate: number;
}

interface Demographics {
  ageGroup: string;
  gender?: string; // Optional since we only target men
  count: number;
  percentage: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

interface GeographicData {
  country: string;
  city: string;
  count: number;
  percentage: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

interface DeviceData {
  device: string;
  count: number;
  percentage: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

interface InterestData {
  interest: string;
  count: number;
  percentage: number;
  relevance: number;
}

export default function AudiencePage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [audienceData, setAudienceData] = useState<AudienceData | null>(null);
  const [demographics, setDemographics] = useState<Demographics[]>([]);
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [interestData, setInterestData] = useState<InterestData[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data
  useEffect(() => {
    const mockAudienceData: AudienceData = {
      totalAudience: 1250000,
      activeAudience: 45000,
      newAudience: 8500,
      returningAudience: 36500,
      engagementRate: 3.6
    };

    const mockDemographics: Demographics[] = [
      { ageGroup: "18-24", gender: "Male", count: 300000, percentage: 24.0, impressions: 300000, clicks: 10500, conversions: 525 },
      { ageGroup: "25-34", gender: "Male", count: 520000, percentage: 41.6, impressions: 520000, clicks: 18200, conversions: 910 },
      { ageGroup: "35-44", gender: "Male", count: 280000, percentage: 22.4, impressions: 280000, clicks: 9800, conversions: 490 },
      { ageGroup: "45-54", gender: "Male", count: 150000, percentage: 12.0, impressions: 150000, clicks: 5250, conversions: 263 }
    ];

    const mockGeographicData: GeographicData[] = [
      { country: "Nederland", city: "Amsterdam", count: 250000, percentage: 20.0, impressions: 250000, clicks: 8750, conversions: 438 },
      { country: "Nederland", city: "Rotterdam", count: 150000, percentage: 12.0, impressions: 150000, clicks: 5250, conversions: 263 },
      { country: "Nederland", city: "Den Haag", count: 100000, percentage: 8.0, impressions: 100000, clicks: 3500, conversions: 175 },
      { country: "België", city: "Brussel", count: 80000, percentage: 6.4, impressions: 80000, clicks: 2800, conversions: 140 },
      { country: "Duitsland", city: "Berlijn", count: 60000, percentage: 4.8, impressions: 60000, clicks: 2100, conversions: 105 }
    ];

    const mockDeviceData: DeviceData[] = [
      { device: "Mobile", count: 750000, percentage: 60.0, impressions: 750000, clicks: 26250, conversions: 1313 },
      { device: "Desktop", count: 375000, percentage: 30.0, impressions: 375000, clicks: 13125, conversions: 656 },
      { device: "Tablet", count: 125000, percentage: 10.0, impressions: 125000, clicks: 4375, conversions: 219 }
    ];

    const mockInterestData: InterestData[] = [
      { interest: "Fitness & Krachttraining", count: 500000, percentage: 40.0, relevance: 95 },
      { interest: "Persoonlijke Ontwikkeling", count: 375000, percentage: 30.0, relevance: 90 },
      { interest: "Ondernemerschap & Business", count: 250000, percentage: 20.0, relevance: 85 },
      { interest: "Mindset & Discipline", count: 125000, percentage: 10.0, relevance: 80 }
    ];

    setAudienceData(mockAudienceData);
    setDemographics(mockDemographics);
    setGeographicData(mockGeographicData);
    setDeviceData(mockDeviceData);
    setInterestData(mockInterestData);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading audience data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Audience</h1>
          <p className="text-gray-400 mt-1">Audience inzichten en demografie</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-[#2D3748] border border-[#4A5568] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
          >
            <option value="7d">Laatste 7 dagen</option>
            <option value="30d">Laatste 30 dagen</option>
            <option value="90d">Laatste 90 dagen</option>
            <option value="1y">Laatste jaar</option>
          </select>
        </div>
      </div>

      {/* Audience Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Totaal Audience</p>
              <p className="text-2xl font-bold text-white">
                {audienceData?.totalAudience.toLocaleString()}
              </p>
            </div>
            <UserGroupIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
        </div>

        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Actieve Audience</p>
              <p className="text-2xl font-bold text-white">
                {audienceData?.activeAudience.toLocaleString()}
              </p>
            </div>
            <FireIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
        </div>

        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Nieuwe Audience</p>
              <p className="text-2xl font-bold text-white">
                {audienceData?.newAudience.toLocaleString()}
              </p>
            </div>
            <UserGroupIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
        </div>

        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Engagement Rate</p>
              <p className="text-2xl font-bold text-white">
                {audienceData?.engagementRate}%
              </p>
            </div>
            <CursorArrowRaysIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
        </div>
      </div>

      {/* Demographics */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Demografie</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-md font-medium text-white mb-3">Leeftijdsgroepen</h3>
            <div className="space-y-3">
              {demographics.map((demo, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-[#2D3748] rounded-lg">
                  <div>
                    <p className="text-white font-medium">{demo.ageGroup}</p>
                    <p className="text-gray-400 text-sm">{demo.count.toLocaleString()} mannen</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{demo.percentage}%</p>
                    <p className="text-gray-400 text-sm">{demo.conversions} conversies</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-md font-medium text-white mb-3">Geografische Verdeling</h3>
            <div className="space-y-3">
              {geographicData.map((geo, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-[#2D3748] rounded-lg">
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="w-4 h-4 text-[#8BAE5A]" />
                    <div>
                      <p className="text-white font-medium">{geo.city}, {geo.country}</p>
                      <p className="text-gray-400 text-sm">{geo.count.toLocaleString()} mensen</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{geo.percentage}%</p>
                    <p className="text-gray-400 text-sm">{geo.conversions} conversies</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Device Usage */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Apparaat Gebruik</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {deviceData.map((device, index) => (
            <div key={index} className="border border-[#2D3748] rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                {device.device === "Mobile" && <DevicePhoneMobileIcon className="w-6 h-6 text-[#8BAE5A]" />}
                {device.device === "Desktop" && <ComputerDesktopIcon className="w-6 h-6 text-[#8BAE5A]" />}
                {device.device === "Tablet" && <DevicePhoneMobileIcon className="w-6 h-6 text-[#8BAE5A]" />}
                <h3 className="font-medium text-white">{device.device}</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Gebruikers</span>
                  <span className="text-white font-medium">{device.count.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Percentage</span>
                  <span className="text-white font-medium">{device.percentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Conversies</span>
                  <span className="text-white font-medium">{device.conversions.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Interesses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {interestData.map((interest, index) => (
            <div key={index} className="border border-[#2D3748] rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-white">{interest.interest}</h3>
                <span className="text-sm text-gray-400">{interest.relevance}% relevant</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Gebruikers</span>
                  <span className="text-white font-medium">{interest.count.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Percentage</span>
                  <span className="text-white font-medium">{interest.percentage}%</span>
                </div>
                <div className="w-full bg-[#2D3748] rounded-full h-2">
                  <div 
                    className="bg-[#8BAE5A] h-2 rounded-full" 
                    style={{ width: `${interest.relevance}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audience Behavior */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Audience Gedrag</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-[#2D3748] rounded-lg">
              <div className="flex items-center space-x-3">
                <ClockIcon className="w-5 h-5 text-[#8BAE5A]" />
                <div>
                  <p className="text-white font-medium">Gemiddelde Sessie Duur</p>
                  <p className="text-gray-400 text-sm">Tijd op platform</p>
                </div>
              </div>
              <span className="text-white font-medium">4m 32s</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-[#2D3748] rounded-lg">
              <div className="flex items-center space-x-3">
                <EyeIcon className="w-5 h-5 text-[#8BAE5A]" />
                <div>
                  <p className="text-white font-medium">Pagina's per Sessie</p>
                  <p className="text-gray-400 text-sm">Gemiddeld aantal</p>
                </div>
              </div>
              <span className="text-white font-medium">3.2</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-[#2D3748] rounded-lg">
              <div className="flex items-center space-x-3">
                <GlobeAltIcon className="w-5 h-5 text-[#8BAE5A]" />
                <div>
                  <p className="text-white font-medium">Bounce Rate</p>
                  <p className="text-gray-400 text-sm">Percentage</p>
                </div>
              </div>
              <span className="text-white font-medium">42%</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Top Locaties</h2>
          <div className="space-y-4">
            {geographicData.slice(0, 5).map((geo, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-[#2D3748] rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#3A4D23] rounded-full flex items-center justify-center">
                    <span className="text-[#8BAE5A] font-medium text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{geo.city}</p>
                    <p className="text-gray-400 text-sm">{geo.country}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{geo.count.toLocaleString()}</p>
                  <p className="text-gray-400 text-sm">{geo.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 