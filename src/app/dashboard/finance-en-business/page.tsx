'use client';
import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import BankConnectionModal from '@/app/components/BankConnectionModal';
import Link from 'next/link';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { FinanceProvider, useFinance } from './FinanceContext';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import ZeroBasedBudget from './components/ZeroBasedBudget';
import DebtSnowball from './components/DebtSnowball';
import CompoundInterest from './components/CompoundInterest';
import FIRECalculator from './components/FIRECalculator';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const assets = [
  { name: 'Spaarrekening', amount: 25000 },
  { name: 'Beleggingen', amount: 15000 },
  { name: 'Crypto', amount: 5000 },
];

const debts = [
  { name: 'Hypotheek', amount: 200000 },
  { name: 'Studieschuld', amount: 15000 },
];

const generateChartData = (period: string) => {
  const now = new Date();
  let labels: string[] = [];
  let data: number[] = [];
  let goalData: number[] = [];
  const goalAmount = 100000; // €100.000 doelstelling
  let startAmount = 0;
  let points = 0;

  switch (period) {
    case '1m':
      labels = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (29 - i));
        return date.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' });
      });
      data = Array.from({ length: 30 }, (_, i) => 45000 + Math.random() * 5000);
      points = 30;
      break;
    case '6m':
      labels = Array.from({ length: 6 }, (_, i) => {
        const date = new Date(now);
        date.setMonth(date.getMonth() - (5 - i));
        return date.toLocaleDateString('nl-NL', { month: 'short' });
      });
      data = Array.from({ length: 6 }, (_, i) => 40000 + i * 2000 + Math.random() * 3000);
      points = 6;
      break;
    case '1y':
      labels = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(now);
        date.setMonth(date.getMonth() - (11 - i));
        return date.toLocaleDateString('nl-NL', { month: 'short' });
      });
      data = Array.from({ length: 12 }, (_, i) => 35000 + i * 5000 + Math.random() * 4000);
      points = 12;
      break;
    case 'all':
      labels = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
      data = Array.from({ length: 12 }, (_, i) => 30000 + i * 6000 + Math.random() * 5000);
      points = 12;
      break;
  }

  // Startbedrag is de eerste waarde van de data (dus begin van de periode)
  startAmount = data[0];
  // Lineaire groei van startAmount naar goalAmount
  goalData = Array.from({ length: points }, (_, i) => {
    return startAmount + ((goalAmount - startAmount) * i) / (points - 1);
  });

  return {
    labels,
    datasets: [
      {
        label: 'Netto Waarde',
        data,
        borderColor: '#8BAE5A',
        backgroundColor: 'rgba(139, 174, 90, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#8BAE5A',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      },
      {
        label: 'Doelstelling €100.000',
        data: goalData,
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
      },
    ],
  };
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        color: '#8BAE5A',
        font: {
          size: 12,
          family: "'Inter', sans-serif",
        },
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
    tooltip: {
      backgroundColor: 'rgba(35, 45, 26, 0.9)',
      titleColor: '#fff',
      bodyColor: '#8BAE5A',
      borderColor: '#3A4D23',
      borderWidth: 1,
      padding: 12,
      boxPadding: 6,
      usePointStyle: true,
      callbacks: {
        label: function(context: any) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(context.parsed.y);
          }
          return label;
        }
      }
    },
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(58, 77, 35, 0.1)',
      },
      ticks: {
        color: '#8BAE5A',
        font: {
          size: 11,
          family: "'Inter', sans-serif",
        },
      },
    },
    y: {
      grid: {
        color: 'rgba(58, 77, 35, 0.1)',
      },
      ticks: {
        color: '#8BAE5A',
        font: {
          size: 11,
          family: "'Inter', sans-serif",
        },
        callback: function(value: any) {
          return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumSignificantDigits: 3 }).format(value);
        }
      },
    },
  },
  animation: {
    duration: 2000,
    easing: 'easeInOutQuart' as const,
  },
};

function FinanceDashboardContent() {
  const { user } = useSupabaseAuth();
  const { finance } = useFinance();
  const [activeTab, setActiveTab] = useState<'overview' | 'planning'>('overview');
  const [financialProfile, setFinancialProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  // Fetch financial profile on component mount
  useEffect(() => {
    const fetchFinancialProfile = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/finance/profile?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.profile) {
            setFinancialProfile(data.profile);
            setHasProfile(true);
          } else {
            setHasProfile(false);
          }
        } else {
          setHasProfile(false);
        }
      } catch (error) {
        console.error('Error fetching financial profile:', error);
        setHasProfile(false);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialProfile();
  }, [user?.id]);

  // Use real data from profile if available, otherwise fallback to demo data
  const totalAssets = finance.assets.reduce((sum, a) => sum + a.value, 0);
  const totalDebts = finance.debts.reduce((sum, d) => sum + d.value, 0);
  const netWorth = financialProfile?.net_worth || (totalAssets - totalDebts);
  const savings = financialProfile?.monthly_income - financialProfile?.monthly_expenses || finance.savings;
  const income = financialProfile?.monthly_income || finance.income;
  const savingsRate = financialProfile?.savings_rate_percentage || (income > 0 ? Math.round((savings / income) * 100) : 0);
  const passiveGoal = financialProfile?.passive_income_goal || 100;
  const passiveIncome = savings; // Simplified for now
  const passiveProgress = Math.min(100, Math.round((passiveIncome / passiveGoal) * 100));

  // Show loading state
  if (loading) {
    return (
      <div className="p-6 md:p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#8BAE5A] mx-auto"></div>
          <p className="text-white mt-4 text-lg">Finance & Business laden...</p>
        </div>
      </div>
    );
  }

  // Show intake flow if no profile exists
  if (!hasProfile) {
    return (
      <div className="p-6 md:p-12">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-[#B6C948] mb-4">Finance & Business Setup</h1>
          <p className="text-[#8BAE5A] text-lg mb-8">
            Laten we je financiële profiel opbouwen zodat je optimaal gebruik kunt maken van de Finance & Business tools.
          </p>
          
          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-8 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Wat ga je instellen?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-[#8BAE5A] rounded-full flex items-center justify-center text-black text-sm font-bold mt-0.5">1</div>
                <div>
                  <h3 className="text-white font-semibold">Huidige Financiële Situatie</h3>
                  <p className="text-gray-300 text-sm">Netto waarde, inkomsten en uitgaven</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-[#8BAE5A] rounded-full flex items-center justify-center text-black text-sm font-bold mt-0.5">2</div>
                <div>
                  <h3 className="text-white font-semibold">Financiële Doelen</h3>
                  <p className="text-gray-300 text-sm">Passief inkomen en risicotolerantie</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-[#8BAE5A] rounded-full flex items-center justify-center text-black text-sm font-bold mt-0.5">3</div>
                <div>
                  <h3 className="text-white font-semibold">Investeringsvoorkeuren</h3>
                  <p className="text-gray-300 text-sm">Categorieën die je interesseren</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-[#8BAE5A] rounded-full flex items-center justify-center text-black text-sm font-bold mt-0.5">4</div>
                <div>
                  <h3 className="text-white font-semibold">Specifieke Doelen</h3>
                  <p className="text-gray-300 text-sm">Concrete financiële mijlpalen</p>
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/finance-en-business/intake"
            className="inline-flex items-center px-8 py-4 bg-[#8BAE5A] text-[#232D1A] rounded-xl font-bold text-lg hover:bg-[#7A9D4A] transition-colors"
          >
            Start Setup
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12">
      <h1 className="text-3xl md:text-4xl font-bold text-[#B6C948] mb-2 drop-shadow-lg">Finance & Business</h1>
      <p className="text-[#8BAE5A] text-lg mb-8">Jouw financiële gezondheid en planning in één oogopslag</p>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-[#181F17] rounded-xl p-1 mb-8">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
            activeTab === 'overview'
              ? 'bg-[#8BAE5A] text-[#232D1A] shadow-lg'
              : 'text-[#8BAE5A] hover:bg-[#232D1A]'
          }`}
        >
          📊 Overzicht
        </button>
        <button
          onClick={() => setActiveTab('planning')}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
            activeTab === 'planning'
              ? 'bg-[#8BAE5A] text-[#232D1A] shadow-lg'
              : 'text-[#8BAE5A] hover:bg-[#232D1A]'
          }`}
        >
          🎯 Planningstools
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Netto Waarde Widget */}
          <Link href="/dashboard/finance-en-business/netto-waarde" className="bg-[#232D1A] rounded-2xl shadow-xl p-6 border border-[#3A4D23] hover:border-[#B6C948] transition-all flex flex-col items-center cursor-pointer group">
            <div className="w-full h-40 flex flex-col items-center justify-center mb-4">
              {/* Placeholder voor grafiek */}
              <div className="w-full h-32 bg-[#181F17] rounded-xl flex flex-col items-center justify-center border border-[#3A4D23] text-[#B6C948] text-lg font-bold">
                <span className="text-2xl">€{netWorth.toLocaleString('nl-NL')}</span>
                <span className="text-[#8BAE5A] text-sm mt-2">Netto Waarde</span>
              </div>
            </div>
            <div className="text-xl font-bold text-[#B6C948] mb-1">Netto Waarde</div>
            <div className="text-[#8BAE5A] text-sm">Bekijk je vermogen in detail</div>
          </Link>
          {/* Spaarquote Widget */}
          <Link href="/dashboard/finance-en-business/cashflow" className="bg-[#232D1A] rounded-2xl shadow-xl p-6 border border-[#3A4D23] hover:border-[#B6C948] transition-all flex flex-col items-center cursor-pointer group">
            <div className="w-full h-40 flex flex-col items-center justify-center mb-4">
              {/* Gauge */}
              <div className="w-32 h-32 bg-[#181F17] rounded-full flex flex-col items-center justify-center border-4 border-[#8BAE5A] text-[#B6C948] text-lg font-bold">
                <span className="text-3xl">{savingsRate}%</span>
                <span className="text-[#8BAE5A] text-sm mt-2">Spaarquote</span>
              </div>
            </div>
            <div className="text-xl font-bold text-[#B6C948] mb-1">Spaarquote</div>
            <div className="text-[#8BAE5A] text-sm">Gespaard: €{savings.toLocaleString('nl-NL')} / Inkomen: €{income.toLocaleString('nl-NL')}</div>
          </Link>
          {/* Passief Inkomen Widget */}
          <Link href="/dashboard/finance-en-business/portfolio" className="bg-[#232D1A] rounded-2xl shadow-xl p-6 border border-[#3A4D23] hover:border-[#B6C948] transition-all flex flex-col items-center cursor-pointer group">
            <div className="w-full h-40 flex flex-col items-center justify-center mb-4">
              {/* Progress bar */}
              <div className="w-full h-6 bg-[#181F17] rounded-full border border-[#3A4D23] mb-2">
                <div className="h-6 rounded-full bg-gradient-to-r from-[#8BAE5A] to-[#B6C948]" style={{ width: `${passiveProgress}%` }} />
              </div>
              <div className="text-[#B6C948] text-sm font-bold">€{passiveIncome.toLocaleString('nl-NL')} / €{passiveGoal.toLocaleString('nl-NL')} doel</div>
            </div>
            <div className="text-xl font-bold text-[#B6C948] mb-1">Passief Inkomen</div>
            <div className="text-[#8BAE5A] text-sm">Hoe dicht zit je bij je doel?</div>
          </Link>
        </div>
      )}

      {activeTab === 'planning' && (
        <div className="space-y-8">
          {/* Fundamentele Planningstools */}
          <div>
            <h2 className="text-2xl font-bold text-[#B6C948] mb-6">Fundamentele Planningstools</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ZeroBasedBudget />
              <DebtSnowball />
            </div>
          </div>

          {/* Investerings- & Groeitools */}
          <div>
            <h2 className="text-2xl font-bold text-[#B6C948] mb-6">Investerings- & Groeitools</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CompoundInterest />
              <FIRECalculator />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FinanceDashboard() {
  return (
    <FinanceProvider>
      <FinanceDashboardContent />
    </FinanceProvider>
  );
} 