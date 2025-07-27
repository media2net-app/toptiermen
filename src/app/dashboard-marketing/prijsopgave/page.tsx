'use client';

import { useState } from 'react';
import { 
  CalculatorIcon,
  ClockIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface PricingPhase {
  id: string;
  title: string;
  description: string;
  duration: string;
  hours: number;
  cost: number;
  features: string[];
  priority: 'high' | 'medium' | 'low';
}

interface TotalCost {
  totalHours: number;
  totalCost: number;
  hourlyRate: number;
  timeframe: string;
}

export default function PrijsopgavePage() {
  const [hourlyRate, setHourlyRate] = useState(75);

  const phases: PricingPhase[] = [
    {
      id: '1',
      title: 'Database & Backend Setup',
      description: 'Opzetten van database schema en basis API routes voor marketing data',
      duration: '1-2 weken',
      hours: 40,
      cost: 40 * hourlyRate,
      priority: 'high',
      features: [
        'Supabase schema voor campagnes, ads, analytics',
        'CRUD API routes voor marketing data',
        'Authentication & authorization',
        'Data validation en error handling',
        'Basic testing setup'
      ]
    },
    {
      id: '2',
      title: 'API Integraties',
      description: 'Integratie met Facebook Ads API en Google Ads API voor echte data',
      duration: '2-3 weken',
      hours: 60,
      cost: 60 * hourlyRate,
      priority: 'high',
      features: [
        'Facebook Ads API integratie',
        'Google Ads API integratie',
        'Data synchronization',
        'Error handling en retry logic',
        'Rate limiting en quota management',
        'API key management en security'
      ]
    },
    {
      id: '3',
      title: 'Frontend Campaign Management',
      description: 'Campaign creation wizard en real-time dashboard',
      duration: '2-3 weken',
      hours: 50,
      cost: 50 * hourlyRate,
      priority: 'high',
      features: [
        'Campaign creation wizard',
        'Real-time dashboard met live data',
        'Budget management interface',
        'Ad creative upload en management',
        'A/B testing setup',
        'Mobile responsive design'
      ]
    },
    {
      id: '4',
      title: 'Advanced Analytics & Reporting',
      description: 'Geavanceerde analytics, custom reports en data visualisatie',
      duration: '2-3 weken',
      hours: 45,
      cost: 45 * hourlyRate,
      priority: 'medium',
      features: [
        'Custom analytics dashboards',
        'Advanced data visualisatie',
        'Automated reporting',
        'Performance alerts',
        'Export functionaliteit',
        'Historical data analysis'
      ]
    },
    {
      id: '5',
      title: 'Advanced Features & Optimization',
      description: 'A/B testing, automated optimization en advanced targeting',
      duration: '3-4 weken',
      hours: 70,
      cost: 70 * hourlyRate,
      priority: 'medium',
      features: [
        'A/B testing framework',
        'Automated campaign optimization',
        'Advanced targeting options',
        'Machine learning voor performance',
        'Predictive analytics',
        'ROI optimization algorithms'
      ]
    },
    {
      id: '6',
      title: 'Mobile App & Advanced UI',
      description: 'Mobile app ontwikkeling en geavanceerde UI/UX features',
      duration: '3-4 weken',
      hours: 65,
      cost: 65 * hourlyRate,
      priority: 'low',
      features: [
        'React Native mobile app',
        'Advanced UI components',
        'Dark/light mode toggle',
        'Customizable dashboards',
        'Drag & drop interfaces',
        'Advanced animations'
      ]
    }
  ];

  const totalCost: TotalCost = {
    totalHours: phases.reduce((sum, phase) => sum + phase.hours, 0),
    totalCost: phases.reduce((sum, phase) => sum + phase.cost, 0),
    hourlyRate: hourlyRate,
    timeframe: '12-18 weken'
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'medium': return <ArrowTrendingUpIcon className="w-4 h-4" />;
      case 'low': return <CheckCircleIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Prijsopgave Ontwikkeling</h1>
          <p className="text-gray-400 mt-1">Kosten en tijdsinvestering voor echt Marketing Panel</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CurrencyDollarIcon className="w-5 h-5 text-[#60A5FA]" />
            <span className="text-white">Uurtarief:</span>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              className="w-20 px-2 py-1 bg-[#2D3748] border border-[#4A5568] rounded text-white text-center"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Totaal Uren</p>
              <p className="text-2xl font-bold text-white">{totalCost.totalHours}</p>
            </div>
            <ClockIcon className="w-8 h-8 text-[#60A5FA]" />
          </div>
        </div>

        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Totaal Kosten</p>
              <p className="text-2xl font-bold text-white">€{totalCost.totalCost.toLocaleString()}</p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 text-[#60A5FA]" />
          </div>
        </div>

        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Uurtarief</p>
              <p className="text-2xl font-bold text-white">€{totalCost.hourlyRate}</p>
            </div>
            <CalculatorIcon className="w-8 h-8 text-[#60A5FA]" />
          </div>
        </div>

        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tijdsduur</p>
              <p className="text-2xl font-bold text-white">{totalCost.timeframe}</p>
            </div>
            <WrenchScrewdriverIcon className="w-8 h-8 text-[#60A5FA]" />
          </div>
        </div>
      </div>

      {/* Development Phases */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">Ontwikkelingsfasen</h2>
        
        {phases.map((phase) => (
          <div key={phase.id} className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">{phase.title}</h3>
                  <div className={`flex items-center space-x-1 ${getPriorityColor(phase.priority)}`}>
                    {getPriorityIcon(phase.priority)}
                    <span className="text-sm font-medium capitalize">{phase.priority}</span>
                  </div>
                </div>
                <p className="text-gray-400 mb-3">{phase.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4 text-[#60A5FA]" />
                    <span className="text-white">Duur: {phase.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserGroupIcon className="w-4 h-4 text-[#60A5FA]" />
                    <span className="text-white">Uren: {phase.hours}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CurrencyDollarIcon className="w-4 h-4 text-[#60A5FA]" />
                    <span className="text-white">Kosten: €{phase.cost.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Features:</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {phase.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm text-gray-300">
                    <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Information */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Extra Informatie</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Wat is inbegrepen:</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-400" />
                <span>Volledige ontwikkeling en testing</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-400" />
                <span>Documentatie en handleidingen</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-400" />
                <span>Deployment en hosting setup</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-400" />
                <span>3 maanden support na oplevering</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-400" />
                <span>Training voor het team</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Technische Details:</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center space-x-2">
                <Cog6ToothIcon className="w-4 h-4 text-[#60A5FA]" />
                <span>Next.js 14 met TypeScript</span>
              </li>
              <li className="flex items-center space-x-2">
                <Cog6ToothIcon className="w-4 h-4 text-[#60A5FA]" />
                <span>Supabase database</span>
              </li>
              <li className="flex items-center space-x-2">
                <Cog6ToothIcon className="w-4 h-4 text-[#60A5FA]" />
                <span>Facebook & Google Ads APIs</span>
              </li>
              <li className="flex items-center space-x-2">
                <Cog6ToothIcon className="w-4 h-4 text-[#60A5FA]" />
                <span>Real-time data synchronisatie</span>
              </li>
              <li className="flex items-center space-x-2">
                <Cog6ToothIcon className="w-4 h-4 text-[#60A5FA]" />
                <span>Mobile responsive design</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ROI Analysis */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">ROI Analyse</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">€{totalCost.totalCost.toLocaleString()}</div>
            <div className="text-gray-400">Investering</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">€15.000</div>
            <div className="text-gray-400">Jaarlijkse besparingen</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">5 maanden</div>
            <div className="text-gray-400">Break-even periode</div>
          </div>
        </div>
        <div className="mt-4 p-4 bg-[#2D3748] rounded-lg">
          <p className="text-gray-300 text-sm">
            <strong>Besparingen:</strong> Automatisering van marketing taken, gecentraliseerd management, 
            real-time insights en data-driven beslissingen kunnen leiden tot significante kostenbesparingen 
            en verhoogde marketing effectiviteit.
          </p>
        </div>
      </div>
    </div>
  );
} 