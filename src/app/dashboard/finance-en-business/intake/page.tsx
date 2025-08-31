'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/auth-systems/optimal/useAuth';
import { CheckIcon, ArrowRightIcon, ArrowLeftIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import Breadcrumb, { createBreadcrumbs } from '@/components/Breadcrumb';

interface FinancialProfile {
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  passiveIncomeGoal: number;
  riskTolerance: 'low' | 'medium' | 'high';
  investmentCategories: string[];
  goals: FinancialGoal[];
}

interface FinancialGoal {
  title: string;
  targetAmount: number;
  targetDate: string;
  category: string;
}

const investmentCategories = [
  'Aandelen',
  'Obligaties',
  'Vastgoed',
  'Cryptocurrency',
  'Goud/Zilver',
  'ETF\'s',
  'Pensioen',
  'Ondernemerschap'
];

// Tooltip component
const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="inline-flex items-center"
      >
        {children}
        <InformationCircleIcon className="w-4 h-4 text-[#8BAE5A] ml-1 cursor-help" />
      </div>
      {showTooltip && (
        <div className="absolute z-50 px-3 py-2 text-sm text-white bg-[#232D1A] border border-[#3A4D23] rounded-lg shadow-lg max-w-xs -top-2 left-full ml-2">
          {content}
          <div className="absolute top-3 -left-1 w-2 h-2 bg-[#232D1A] border-l border-b border-[#3A4D23] transform rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default function FinanceIntake() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<FinancialProfile>({
    netWorth: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savingsRate: 0,
    passiveIncomeGoal: 0,
    riskTolerance: 'medium',
    investmentCategories: [],
    goals: []
  });

  const totalSteps = 4;

  const updateProfile = (field: keyof FinancialProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const addGoal = () => {
    const newGoal: FinancialGoal = {
      title: '',
      targetAmount: 0,
      targetDate: '',
      category: 'sparen'
    };
    setProfile(prev => ({
      ...prev,
      goals: [...prev.goals, newGoal]
    }));
  };

  const updateGoal = (index: number, field: keyof FinancialGoal, value: any) => {
    setProfile(prev => ({
      ...prev,
      goals: prev.goals.map((goal, i) => 
        i === index ? { ...goal, [field]: value } : goal
      )
    }));
  };

  const removeGoal = (index: number) => {
    setProfile(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  const calculateSavingsRate = () => {
    if (profile.monthlyIncome > 0) {
      const savings = profile.monthlyIncome - profile.monthlyExpenses;
      return Math.max(0, Math.round((savings / profile.monthlyIncome) * 100));
    }
    return 0;
  };

  const saveFinancialProfile = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await fetch('/api/finance/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          profile: {
            ...profile,
            savingsRate: calculateSavingsRate()
          }
        }),
      });

      if (response.ok) {
        router.push('/dashboard/finance-en-business');
      } else {
        console.error('Failed to save financial profile');
      }
    } catch (error) {
      console.error('Error saving financial profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Huidige Financiële Situatie</h3>
        <p className="text-gray-300">Laten we beginnen met je huidige financiële situatie in kaart te brengen.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
            <Tooltip content="Je totale vermogen: alle bezittingen (spaargeld, beleggingen, huis, auto) minus alle schulden (hypotheek, leningen, creditcard).">
              Netto Waarde (€)
            </Tooltip>
          </label>
          <input
            type="number"
            value={profile.netWorth === 0 ? '' : profile.netWorth}
            onChange={(e) => updateProfile('netWorth', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A]"
            placeholder="0"
          />
          <p className="text-xs text-gray-400 mt-1">Bezittingen minus schulden</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
            <Tooltip content="Je totale maandelijkse inkomsten: salaris, freelance werk, huurinkomsten, dividend, en andere regelmatige inkomsten.">
              Maandelijkse Inkomsten (€)
            </Tooltip>
          </label>
          <input
            type="number"
            value={profile.monthlyIncome === 0 ? '' : profile.monthlyIncome}
            onChange={(e) => updateProfile('monthlyIncome', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A]"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
            <Tooltip content="Je totale maandelijkse uitgaven: huur/hypotheek, boodschappen, verzekeringen, abonnementen, transport, en andere vaste kosten.">
              Maandelijkse Uitgaven (€)
            </Tooltip>
          </label>
          <input
            type="number"
            value={profile.monthlyExpenses === 0 ? '' : profile.monthlyExpenses}
            onChange={(e) => updateProfile('monthlyExpenses', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A]"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
            <Tooltip content="Het percentage van je inkomen dat je maandelijks kunt sparen. Wordt automatisch berekend op basis van je inkomsten en uitgaven.">
              Berekende Spaarquote
            </Tooltip>
          </label>
          <div className="px-4 py-3 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white">
            {calculateSavingsRate()}%
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {(profile.monthlyIncome - profile.monthlyExpenses).toLocaleString()}€ per maand
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Financiële Doelen</h3>
        <p className="text-gray-300">Wat zijn je belangrijkste financiële doelen?</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
            <Tooltip content="Het bedrag dat je maandelijks wilt verdienen zonder actief te werken. Bijvoorbeeld: dividend uit beleggingen, huurinkomsten, of inkomsten uit online business.">
              Passief Inkomen Doel (€/maand)
            </Tooltip>
          </label>
          <input
            type="number"
            value={profile.passiveIncomeGoal === 0 ? '' : profile.passiveIncomeGoal}
            onChange={(e) => updateProfile('passiveIncomeGoal', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A]"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
            <Tooltip content="Hoeveel risico je bereid bent te nemen met je investeringen. Laag = veilig maar lagere rendementen, Hoog = meer risico maar potentieel hogere rendementen.">
              Risicotolerantie
            </Tooltip>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['low', 'medium', 'high'] as const).map((risk) => (
              <button
                key={risk}
                onClick={() => updateProfile('riskTolerance', risk)}
                className={`px-4 py-3 rounded-lg border transition-colors ${
                  profile.riskTolerance === risk
                    ? 'bg-[#8BAE5A] border-[#8BAE5A] text-white'
                    : 'bg-[#181F17] border-[#3A4D23] text-gray-300 hover:border-[#8BAE5A]'
                }`}
              >
                {risk === 'low' && 'Laag'}
                {risk === 'medium' && 'Gemiddeld'}
                {risk === 'high' && 'Hoog'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">
          <Tooltip content="Deze categorieën helpen ons om je persoonlijke investeringsadviezen en tools te tonen die het beste bij je passen.">
            Investeringsvoorkeuren
          </Tooltip>
        </h3>
        <p className="text-gray-300">Selecteer de investeringscategorieën die je interesseren.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {investmentCategories.map((category) => (
          <button
            key={category}
            onClick={() => {
              const current = profile.investmentCategories;
              const updated = current.includes(category)
                ? current.filter(c => c !== category)
                : [...current, category];
              updateProfile('investmentCategories', updated);
            }}
            className={`px-4 py-3 rounded-lg border transition-colors ${
              profile.investmentCategories.includes(category)
                ? 'bg-[#8BAE5A] border-[#8BAE5A] text-white'
                : 'bg-[#181F17] border-[#3A4D23] text-gray-300 hover:border-[#8BAE5A]'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">
          <Tooltip content="Concrete financiële mijlpalen die je wilt bereiken. Deze helpen je om gefocust te blijven en je voortgang te tracken.">
            Financiële Doelen
          </Tooltip>
        </h3>
        <p className="text-gray-300">Voeg specifieke financiële doelen toe.</p>
      </div>

      <div className="space-y-4">
        {profile.goals.map((goal, index) => (
          <div key={index} className="p-4 bg-[#181F17] border border-[#3A4D23] rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-[#8BAE5A] mb-1">
                  <Tooltip content="Een duidelijke naam voor je doel, bijvoorbeeld: 'Noodfonds', 'Huis kopen', 'Pensioen sparen'.">
                    Doel naam
                  </Tooltip>
                </div>
                <input
                  type="text"
                  value={goal.title}
                  onChange={(e) => updateGoal(index, 'title', e.target.value)}
                  placeholder="Doel naam"
                  className="w-full px-3 py-2 bg-[#232D1A] border border-[#3A4D23] rounded text-white"
                />
              </div>
              <div>
                <div className="text-xs text-[#8BAE5A] mb-1">
                  <Tooltip content="Het totale bedrag dat je wilt sparen of bereiken voor dit doel.">
                    Bedrag (€)
                  </Tooltip>
                </div>
                <input
                  type="number"
                  value={goal.targetAmount === 0 ? '' : goal.targetAmount}
                  onChange={(e) => updateGoal(index, 'targetAmount', parseFloat(e.target.value) || 0)}
                  placeholder="Bedrag (€)"
                  className="w-full px-3 py-2 bg-[#232D1A] border border-[#3A4D23] rounded text-white"
                />
              </div>
              <div>
                <div className="text-xs text-[#8BAE5A] mb-1">
                  <Tooltip content="De datum waarop je dit doel wilt bereiken. Helpt je om je spaarplan te maken.">
                    Doel datum
                  </Tooltip>
                </div>
                <input
                  type="date"
                  value={goal.targetDate}
                  onChange={(e) => updateGoal(index, 'targetDate', e.target.value)}
                  className="w-full px-3 py-2 bg-[#232D1A] border border-[#3A4D23] rounded text-white"
                />
              </div>
              <button
                onClick={() => removeGoal(index)}
                className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Verwijder
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={addGoal}
          className="w-full px-4 py-3 bg-[#8BAE5A] text-white rounded-lg hover:bg-[#7A9D4A] transition-colors"
        >
          + Doel Toevoegen
        </button>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1411] via-[#181F17] to-[#232D1A]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={createBreadcrumbs(
              'Setup',
              'Finance & Business',
              '/dashboard/finance-en-business'
            )} 
          />
        </div>
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Finance & Business Setup
          </h1>
          <p className="text-gray-300">
            Stap {currentStep} van {totalSteps} - Laten we je financiële profiel opbouwen
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-[#3A4D23]/40 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6 md:p-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center px-6 py-3 bg-[#3A4D23] text-white rounded-lg hover:bg-[#4A5D33] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Vorige
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={nextStep}
              className="flex items-center px-6 py-3 bg-[#8BAE5A] text-white rounded-lg hover:bg-[#7A9D4A] transition-colors"
            >
              Volgende
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </button>
          ) : (
            <button
              onClick={saveFinancialProfile}
              disabled={loading}
              className="flex items-center px-6 py-3 bg-[#FFD700] text-black rounded-lg hover:bg-[#f0a14f] disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                  Opslaan...
                </>
              ) : (
                <>
                  <CheckIcon className="w-5 h-5 mr-2" />
                  Profiel Opslaan
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
