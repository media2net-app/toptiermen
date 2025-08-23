'use client';
import { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon, 
  XMarkIcon, 
  ArrowRightIcon,
  ClockIcon,
  LockClosedIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface TrialUpgradePromptProps {
  type: 'trial_expiring' | 'feature_restriction' | 'usage_limit' | 'manual';
  location?: string;
  message?: string;
  daysRemaining?: number;
  featureType?: string;
  onUpgrade?: (plan: string) => void;
  onDismiss?: () => void;
  onPostpone?: () => void;
}

export default function TrialUpgradePrompt({
  type,
  location = 'dashboard',
  message,
  daysRemaining = 0,
  featureType,
  onUpgrade,
  onDismiss,
  onPostpone
}: TrialUpgradePromptProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');

  useEffect(() => {
    // Track upgrade prompt shown
    trackUpgradePrompt('shown');
  }, []);

  const trackUpgradePrompt = async (action: string) => {
    try {
      await fetch('/api/trial/upgrade-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptType: type,
          promptLocation: location,
          userAction: action,
          selectedPlan: action === 'upgraded' ? selectedPlan : null
        })
      });
    } catch (error) {
      console.error('Error tracking upgrade prompt:', error);
    }
  };

  const handleUpgrade = () => {
    trackUpgradePrompt('upgraded');
    setIsVisible(false);
    if (onUpgrade) {
      onUpgrade(selectedPlan);
    } else {
      // Default upgrade flow
      window.location.href = `/prelaunch?plan=${selectedPlan}&period=monthly`;
    }
  };

  const handleDismiss = () => {
    trackUpgradePrompt('dismissed');
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  const handlePostpone = () => {
    trackUpgradePrompt('postponed');
    setIsVisible(false);
    if (onPostpone) {
      onPostpone();
    }
  };

  const getPromptContent = () => {
    switch (type) {
      case 'trial_expiring':
        return {
          title: 'Trial verloopt binnenkort',
          description: `Je hebt nog ${daysRemaining} dag${daysRemaining !== 1 ? 'en' : ''} over in je gratis trial. Upgrade nu om onbeperkte toegang te krijgen.`,
          icon: ClockIcon,
          color: 'yellow'
        };
      case 'feature_restriction':
        return {
          title: 'Functie niet beschikbaar in trial',
          description: `Deze ${featureType} is alleen beschikbaar voor betaalde leden. Upgrade om toegang te krijgen.`,
          icon: LockClosedIcon,
          color: 'red'
        };
      case 'usage_limit':
        return {
          title: 'Trial limiet bereikt',
          description: `Je hebt je trial limiet bereikt voor ${featureType}. Upgrade voor onbeperkte toegang.`,
          icon: ExclamationTriangleIcon,
          color: 'orange'
        };
      case 'manual':
        return {
          title: 'Upgrade naar Pro',
          description: message || 'Ontgrendel alle functies en krijg onbeperkte toegang tot het platform.',
          icon: SparklesIcon,
          color: 'blue'
        };
      default:
        return {
          title: 'Upgrade je account',
          description: 'Ontgrendel alle functies en krijg onbeperkte toegang.',
          icon: SparklesIcon,
          color: 'blue'
        };
    }
  };

  const content = getPromptContent();
  const IconComponent = content.icon;

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-r from-${content.color}-50 to-${content.color}-100 dark:from-${content.color}-900/20 dark:to-${content.color}-800/20 border border-${content.color}-200 dark:border-${content.color}-800 rounded-xl p-6 mb-6`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className={`w-10 h-10 bg-${content.color}-500 rounded-lg flex items-center justify-center flex-shrink-0`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold text-${content.color}-800 dark:text-${content.color}-200 mb-2`}>
              {content.title}
            </h3>
            <p className={`text-${content.color}-700 dark:text-${content.color}-300 mb-4`}>
              {content.description}
            </p>
            
            {/* Plan Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <button
                onClick={() => setSelectedPlan('starter')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedPlan === 'starter'
                    ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                    : 'border-gray-300 dark:border-gray-600 hover:border-[#8BAE5A]'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold text-white">Starter</div>
                  <div className="text-sm text-gray-400">€49/maand</div>
                </div>
              </button>
              
              <button
                onClick={() => setSelectedPlan('pro')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedPlan === 'pro'
                    ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                    : 'border-gray-300 dark:border-gray-600 hover:border-[#8BAE5A]'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold text-white">Pro</div>
                  <div className="text-sm text-gray-400">€99/maand</div>
                  <div className="text-xs text-[#8BAE5A] mt-1">Populair</div>
                </div>
              </button>
              
              <button
                onClick={() => setSelectedPlan('elite')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedPlan === 'elite'
                    ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                    : 'border-gray-300 dark:border-gray-600 hover:border-[#8BAE5A]'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold text-white">Elite</div>
                  <div className="text-sm text-gray-400">€199/maand</div>
                </div>
              </button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleUpgrade}
                className="bg-[#8BAE5A] hover:bg-[#B6C948] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
              >
                Upgrade naar {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}
                <ArrowRightIcon className="w-4 h-4" />
              </button>
              
              {type === 'trial_expiring' && (
                <button
                  onClick={handlePostpone}
                  className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Later herinneren
                </button>
              )}
              
              <button
                onClick={handleDismiss}
                className="text-gray-500 dark:text-gray-400 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
} 