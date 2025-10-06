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
import { ArrowRightIcon, PencilIcon, Cog6ToothIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import ZeroBasedBudget from './components/ZeroBasedBudget';
import DebtSnowball from './components/DebtSnowball';
import Breadcrumb, { createBreadcrumbs } from '@/components/Breadcrumb';
import CompoundInterest from './components/CompoundInterest';
import FIRECalculator from './components/FIRECalculator';
import PageLayout from '@/components/PageLayout';
import ModalBase from '@/components/ui/ModalBase';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';


// Force dynamic rendering to prevent navigator errors
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const { finance } = useFinance();
  const [activeTab, setActiveTab] = useState<'overview' | 'planning'>('overview');
  const [financialProfile, setFinancialProfile] = useState<any>(null);
  const [financialGoals, setFinancialGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newCurrentAmount, setNewCurrentAmount] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any>(null);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    targetDate: '',
    category: 'sparen'
  });

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
            setFinancialGoals(data.goals || []);
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

  const updateGoalProgress = async (goalId: string, currentAmount: number) => {
    try {
      const response = await fetch('/api/finance/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goalId,
          currentAmount
        }),
      });

      if (response.ok) {
        // Refresh the goals data
        const profileResponse = await fetch(`/api/finance/profile?userId=${user?.id}`);
        if (profileResponse.ok) {
          const data = await profileResponse.json();
          setFinancialGoals(data.goals || []);
        }
        setShowEditModal(false);
        setEditingGoal(null);
        setNewCurrentAmount('');
      }
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Weet je zeker dat je dit doel wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.')) {
      return;
    }

    try {
      const response = await fetch(`/api/finance/profile?goalId=${goalId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Remove goal from local state
          setFinancialGoals(prev => prev.filter(goal => goal.id !== goalId));
          toast.success('Doel succesvol verwijderd!');
        }
      } else {
        toast.error('Fout bij verwijderen van doel');
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Fout bij verwijderen van doel');
    }
  };

  const handleEditGoal = (goal: any) => {
    setEditingGoal(goal);
    setNewCurrentAmount(goal.current_amount?.toString() || '0');
    setShowEditModal(true);
  };

  const handleSaveGoalProgress = () => {
    if (editingGoal && newCurrentAmount) {
      updateGoalProgress(editingGoal.id, parseFloat(newCurrentAmount));
    }
  };

  const handleSaveProfile = async () => {
    if (!editingProfile || !user?.id) return;

    try {
      const response = await fetch('/api/finance/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          profile: {
            netWorth: editingProfile.net_worth,
            monthlyIncome: editingProfile.monthly_income,
            monthlyExpenses: editingProfile.monthly_expenses,
            savingsRate: Math.round(((editingProfile.monthly_income - editingProfile.monthly_expenses) / editingProfile.monthly_income) * 100),
            passiveIncomeGoal: editingProfile.passive_income_goal,
            riskTolerance: editingProfile.risk_tolerance,
            investmentCategories: editingProfile.investment_categories || [],
            goals: financialGoals.map(goal => ({
              title: goal.title,
              targetAmount: goal.target_amount,
              targetDate: goal.target_date,
              category: goal.category
            }))
          }
        }),
      });

      if (response.ok) {
        // Refresh the profile data
        const profileResponse = await fetch(`/api/finance/profile?userId=${user.id}`);
        if (profileResponse.ok) {
          const data = await profileResponse.json();
          setFinancialProfile(data.profile);
          setFinancialGoals(data.goals || []);
        }
        setShowSettingsModal(false);
        setEditingProfile(null);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const updateEditingProfile = (field: string, value: any) => {
    setEditingProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddGoal = async () => {
    if (!user?.id || !newGoal.title || !newGoal.targetAmount || !newGoal.targetDate) {
      return;
    }

    try {
      const response = await fetch('/api/finance/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          profile: {
            netWorth: financialProfile?.net_worth || 0,
            monthlyIncome: financialProfile?.monthly_income || 0,
            monthlyExpenses: financialProfile?.monthly_expenses || 0,
            savingsRate: financialProfile?.savings_rate_percentage || 0,
            passiveIncomeGoal: financialProfile?.passive_income_goal || 0,
            riskTolerance: financialProfile?.risk_tolerance || 'medium',
            investmentCategories: financialProfile?.investment_categories || [],
            goals: [
              ...financialGoals.map(goal => ({
                title: goal.title,
                targetAmount: goal.target_amount,
                targetDate: goal.target_date,
                category: goal.category
              })),
              {
                title: newGoal.title,
                targetAmount: parseFloat(newGoal.targetAmount),
                targetDate: newGoal.targetDate,
                category: newGoal.category
              }
            ]
          }
        }),
      });

      if (response.ok) {
        // Refresh the goals data
        const profileResponse = await fetch(`/api/finance/profile?userId=${user.id}`);
        if (profileResponse.ok) {
          const data = await profileResponse.json();
          setFinancialGoals(data.goals || []);
        }
        setShowAddGoalModal(false);
        setNewGoal({
          title: '',
          targetAmount: '',
          targetDate: '',
          category: 'sparen'
        });
      } else {
        console.error('Failed to add goal:', await response.text());
      }
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const updateNewGoal = (field: string, value: string) => {
    setNewGoal(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
    <PageLayout
      title="Finance & Business"
      subtitle="Jouw financiële gezondheid en planning in één oogopslag"
      actionButtons={
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setEditingProfile(financialProfile);
              setShowSettingsModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-[#8BAE5A] hover:bg-[#3A4D23] hover:text-[#B6C948] transition-colors"
            title="Instellingen bewerken"
          >
            <Cog6ToothIcon className="w-5 h-5" />
            <span className="text-sm">Instellingen</span>
          </button>
          <button
            onClick={() => {
              if (confirm('Weet je zeker dat je je financiële profiel wilt resetten? Dit zal je terug naar de intake flow sturen.')) {
                router.push('/dashboard/finance-en-business/intake');
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#8BAE5A] hover:bg-[#3A4D23] hover:text-[#B6C948] transition-colors"
            title="Profiel resetten"
          >
            <TrashIcon className="w-5 h-5" />
            <span className="text-sm">Reset</span>
          </button>
        </div>
      }
    >
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb items={createBreadcrumbs('Finance & Business')} />
      </div>
      
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

              {/* Financiële Doelen Sectie */}
        {activeTab === 'overview' && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#B6C948]">Jouw Financiële Doelen</h2>
              <button
                onClick={() => setShowAddGoalModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Nieuw Doel</span>
              </button>
            </div>
                      {financialGoals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {financialGoals.map((goal, index) => {
              const targetDate = new Date(goal.target_date);
              const today = new Date();
              const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              const progress = Math.min(100, Math.round((goal.current_amount || 0) / goal.target_amount * 100));
              
              return (
                <div key={index} className="bg-[#232D1A] rounded-2xl shadow-xl p-6 border border-[#3A4D23] hover:border-[#B6C948] transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">{goal.title}</h3>
                      <span className="text-xs text-[#8BAE5A] bg-[#181F17] px-2 py-1 rounded-full">
                        {goal.category}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditGoal(goal)}
                        className="p-2 text-[#8BAE5A] hover:text-[#B6C948] hover:bg-[#181F17] rounded-lg transition-colors"
                        title="Voortgang bijwerken"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Doel verwijderen"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#8BAE5A]">Voortgang</span>
                      <span className="text-white">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#181F17] rounded-full">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-[#8BAE5A] to-[#B6C948]" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#8BAE5A]">Doelbedrag:</span>
                      <span className="text-white font-semibold">€{goal.target_amount?.toLocaleString('nl-NL')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8BAE5A]">Huidig bedrag:</span>
                      <span className="text-white">€{(goal.current_amount || 0).toLocaleString('nl-NL')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8BAE5A]">Doeldatum:</span>
                      <span className="text-white">{targetDate.toLocaleDateString('nl-NL')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8BAE5A]">Dagen resterend:</span>
                      <span className={`font-semibold ${daysRemaining < 0 ? 'text-red-400' : daysRemaining < 30 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {daysRemaining < 0 ? `${Math.abs(daysRemaining)} dagen over tijd` : `${daysRemaining} dagen`}
                      </span>
                    </div>
                  </div>
                                  </div>
                );
              })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-[#232D1A] rounded-2xl p-8 border border-[#3A4D23]">
                  <div className="w-16 h-16 bg-[#8BAE5A] rounded-full mx-auto mb-4 flex items-center justify-center">
                    <PlusIcon className="w-8 h-8 text-[#232D1A]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#B6C948] mb-2">Nog geen doelen</h3>
                  <p className="text-[#8BAE5A] mb-6">Voeg je eerste financiële doel toe om te beginnen met plannen</p>
                  <button
                    onClick={() => setShowAddGoalModal(true)}
                    className="px-6 py-3 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold"
                  >
                    Eerste Doel Toevoegen
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      {activeTab === 'planning' && (
        <div className="space-y-6 sm:space-y-8">
          {/* Fundamentele Planningstools */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#B6C948] mb-4 sm:mb-6">Fundamentele Planningstools</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <ZeroBasedBudget />
              <DebtSnowball />
            </div>
          </div>

          {/* Investerings- & Groeitools */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#B6C948] mb-4 sm:mb-6">Investerings- & Groeitools</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <CompoundInterest />
              <FIRECalculator />
            </div>
          </div>
        </div>
      )}

      {/* Edit Goal Progress Modal */}
      {showEditModal && editingGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
              Voortgang bijwerken: {editingGoal.title}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                Huidig bedrag (€)
              </label>
              <input
                type="number"
                value={newCurrentAmount}
                onChange={(e) => setNewCurrentAmount(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded text-white"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingGoal(null);
                  setNewCurrentAmount('');
                }}
                className="flex-1 px-4 py-2 sm:py-2 bg-[#181F17] text-[#8BAE5A] rounded-lg hover:bg-[#3A4D23] transition-colors text-sm sm:text-base"
              >
                Annuleren
              </button>
              <button
                onClick={handleSaveGoalProgress}
                className="flex-1 px-4 py-2 sm:py-2 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold text-sm sm:text-base"
              >
                Opslaan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && editingProfile && (
        <ModalBase
          isOpen={showSettingsModal}
          onClose={() => { setShowSettingsModal(false); setEditingProfile(null); }}
          className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Financiële Profiel Bewerken
              </h3>
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  setEditingProfile(null);
                }}
                className="text-[#8BAE5A] hover:text-[#B6C948] transition-colors text-lg sm:text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              {/* Stap 1: Huidige Financiële Situatie */}
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-[#B6C948] mb-3 sm:mb-4">Huidige Financiële Situatie</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                      Netto Waarde (€)
                    </label>
                    <input
                      type="number"
                      value={editingProfile.net_worth || ''}
                      onChange={(e) => updateEditingProfile('net_worth', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-3 py-2 sm:py-2 bg-[#181F17] border border-[#3A4D23] rounded text-white text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                      Maandelijkse Inkomsten (€)
                    </label>
                    <input
                      type="number"
                      value={editingProfile.monthly_income || ''}
                      onChange={(e) => updateEditingProfile('monthly_income', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-3 py-2 sm:py-2 bg-[#181F17] border border-[#3A4D23] rounded text-white text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                      Maandelijkse Uitgaven (€)
                    </label>
                    <input
                      type="number"
                      value={editingProfile.monthly_expenses || ''}
                      onChange={(e) => updateEditingProfile('monthly_expenses', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-3 py-2 sm:py-2 bg-[#181F17] border border-[#3A4D23] rounded text-white text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                      Berekende Spaarquote
                    </label>
                    <div className="px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded text-white">
                      {editingProfile.monthly_income > 0 
                        ? Math.round(((editingProfile.monthly_income - editingProfile.monthly_expenses) / editingProfile.monthly_income) * 100)
                        : 0}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Stap 2: Financiële Doelen */}
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-[#B6C948] mb-3 sm:mb-4">Financiële Doelen</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                      Passief Inkomen Doel (€/maand)
                    </label>
                    <input
                      type="number"
                      value={editingProfile.passive_income_goal || ''}
                      onChange={(e) => updateEditingProfile('passive_income_goal', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-3 py-2 sm:py-2 bg-[#181F17] border border-[#3A4D23] rounded text-white text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                      Risicotolerantie
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['low', 'medium', 'high'].map((risk) => (
                        <button
                          key={risk}
                          onClick={() => updateEditingProfile('risk_tolerance', risk)}
                          className={`py-2 px-2 sm:px-3 rounded text-xs sm:text-sm font-medium transition-colors ${
                            editingProfile.risk_tolerance === risk
                              ? 'bg-[#8BAE5A] text-[#232D1A]'
                              : 'bg-[#181F17] text-[#8BAE5A] hover:bg-[#3A4D23]'
                          }`}
                        >
                          {risk === 'low' ? 'Laag' : risk === 'medium' ? 'Gemiddeld' : 'Hoog'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stap 3: Investeringsvoorkeuren */}
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-[#B6C948] mb-3 sm:mb-4">Investeringsvoorkeuren</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {investmentCategories.map((category) => (
                    <label key={category} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProfile.investment_categories?.includes(category) || false}
                        onChange={(e) => {
                          const current = editingProfile.investment_categories || [];
                          const updated = e.target.checked
                            ? [...current, category]
                            : current.filter((c: string) => c !== category);
                          updateEditingProfile('investment_categories', updated);
                        }}
                        className="w-4 h-4 text-[#8BAE5A] bg-[#181F17] border-[#3A4D23] rounded focus:ring-[#8BAE5A]"
                      />
                      <span className="text-sm text-[#8BAE5A]">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:space-x-3 mt-6 sm:mt-8">
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  setEditingProfile(null);
                }}
                className="flex-1 px-4 py-2 sm:py-2 bg-[#181F17] text-[#8BAE5A] rounded-lg hover:bg-[#3A4D23] transition-colors text-sm sm:text-base"
              >
                Annuleren
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 px-4 py-2 sm:py-2 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold text-sm sm:text-base"
              >
                Opslaan
              </button>
            </div>
        </ModalBase>
      )}

      {/* Add Goal Modal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-4 sm:p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-xl font-bold text-white">
                Nieuw Financieel Doel Toevoegen
              </h3>
              <button
                onClick={() => {
                  setShowAddGoalModal(false);
                  setNewGoal({
                    title: '',
                    targetAmount: '',
                    targetDate: '',
                    category: 'sparen'
                  });
                }}
                className="text-[#8BAE5A] hover:text-[#B6C948] transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                  Doel Naam
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => updateNewGoal('title', e.target.value)}
                  placeholder="Bijv. Huis kopen, Noodfonds, Vakantie"
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                  Doelbedrag (€)
                </label>
                <input
                  type="number"
                  value={newGoal.targetAmount}
                  onChange={(e) => updateNewGoal('targetAmount', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                  Doeldatum
                </label>
                <input
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => updateNewGoal('targetDate', e.target.value)}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                  Categorie
                </label>
                <select
                  value={newGoal.category}
                  onChange={(e) => updateNewGoal('category', e.target.value)}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded text-white"
                >
                  <option value="sparen">Sparen</option>
                  <option value="investeren">Investeren</option>
                  <option value="aflossen">Aflossen</option>
                  <option value="vakantie">Vakantie</option>
                  <option value="onderhoud">Onderhoud</option>
                  <option value="overig">Overig</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-8">
              <button
                onClick={() => {
                  setShowAddGoalModal(false);
                  setNewGoal({
                    title: '',
                    targetAmount: '',
                    targetDate: '',
                    category: 'sparen'
                  });
                }}
                className="flex-1 px-4 py-2 bg-[#181F17] text-[#8BAE5A] rounded-lg hover:bg-[#3A4D23] transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={handleAddGoal}
                disabled={!newGoal.title || !newGoal.targetAmount || !newGoal.targetDate}
                className="flex-1 px-4 py-2 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Doel Toevoegen
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

export default function FinanceDashboard() {
  return (
    <FinanceProvider>
      <FinanceDashboardContent />
    </FinanceProvider>
  );
} 