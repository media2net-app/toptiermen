'use client';

import { useState, useEffect } from 'react';
import { 
  CurrencyEuroIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ChartBarIcon,
  CreditCardIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface FinanceMetrics {
  period: string;
  totalRevenue: string;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  conversionRate: string;
  averageTransactionValue: string;
  paymentMethods: Record<string, number>;
  recentTransactions: Array<{
    id: string;
    amount: string;
    currency: string;
    method: string;
    status: string;
    description: string;
    createdAt: string;
    paidAt: string;
  }>;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    transactions: number;
  }>;
  currency: string;
  lastUpdated: string;
}

interface MollieFinanceMetricsProps {
  period: '7d' | '30d' | '90d';
}

// Payment method SVG icons
const PaymentMethodIcons = {
  ideal: () => (
    <svg width="32" height="32" viewBox="-4.064073 -4.064073 164.952366 143.597246" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon
        points="112.39258,7.5576172 87.466797,5.4667969 3.7255859,4.2070312 3.7255859,133.06152 93.114258,133.06152 122.90137,124.96094 143.17773,107.38379 153.0957,79.736328 153.0957,47.793945 138.26367,22.129883"
        style="fill:#ffffff" />
      <path
        d="m 6.37094,6.3694 0,122.7273 74.5639,0 c 45.02585,0 69.51942,-20.9738 69.51942,-61.5205 0,-41.6681 -26.54983,-61.2068 -69.51942,-61.2068 l -74.5639,0 z M 80.93484,0 c 66.02998,0 75.88938,42.3421 75.88938,67.5762 0,43.7821 -26.94973,67.8929 -75.88938,67.8929 0,0 -79.33721,0 -80.93484,0 C 0,133.8651 0,1.6 0,0 1.59763,0 80.93484,0 80.93484,0 Z"
        style="fill:#0a0b09" />
      <path
        d="m 52.37328,48.5485 c 0,3.8375 0,10.0121 0,13.8481 2.10277,0 4.25056,0 4.25056,0 2.94514,0 5.66513,-0.8512 5.66513,-7.0327 0,-6.041 -3.02689,-6.8154 -5.66513,-6.8154 0,0 -2.14779,0 -4.25056,0 z m 70.90609,-6.8878 6.87559,0 c 0,0 0,15.6763 0,20.7359 1.5247,0 5.71211,0 10.1888,0 -2.79438,-37.6255 -32.39361,-45.7547 -59.289,-45.7547 l -28.6756,0 0,25.033 4.24468,0 c 7.73852,0 12.54658,5.2476 12.54658,13.689 0,8.7092 -4.69254,13.9078 -12.54658,13.9078 l -4.24468,0 0,50.0894 28.6756,0 c 43.72924,0 58.94687,-20.3071 59.4843,-50.0894 l -17.25969,0 0,-27.611 z m -19.15736,15.4066 4.97448,0 -2.27457,-7.8056 -0.41311,0 -2.2868,7.8056 z M 93.39234,69.28 l 8.32637,-27.6203 9.78206,0 8.32393,27.6203 -7.15752,0 -1.56043,-5.343 -8.99401,0 -1.56484,5.343 -7.15556,0 z m -3.30197,-6.8834 0,6.8751 -17.01006,0 0,-27.6007 16.46088,0 0,6.8726 c 0,0 -5.85798,0 -9.58432,0 0,0.9477 0,2.0343 0,3.1997 l 9.0645,0 0,6.8707 -9.0645,0 c 0,1.3798 0,2.6808 0,3.7826 3.83402,0 10.1335,0 10.1335,0 z"
        style="fill:#d50172" />
      <path
        d="m 43.37536,55.4598 c 0,8.1943 -6.63966,14.8374 -14.83388,14.8374 -8.1903,0 -14.83632,-6.6431 -14.83632,-14.8374 0,-8.1878 6.64602,-14.8338 14.83632,-14.8338 8.19422,0 14.83388,6.646 14.83388,14.8338 m -26.73338,63.8788 23.86949,0 0,-42.4919 -23.86949,0 z" />
    </svg>
  ),
  creditcard: () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="4" fill="#1a1a1a"/>
      <rect x="4" y="8" width="24" height="16" rx="2" fill="#333"/>
      <rect x="6" y="12" width="20" height="8" rx="1" fill="#666"/>
      <circle cx="8" cy="16" r="1" fill="#999"/>
      <circle cx="11" cy="16" r="1" fill="#999"/>
      <circle cx="14" cy="16" r="1" fill="#999"/>
    </svg>
  ),
  paypal: () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="4" fill="#003087"/>
      <path d="M8 12h16v8H8z" fill="white"/>
      <path d="M10 14h12v4H10z" fill="#003087"/>
      <text x="16" y="17" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">PayPal</text>
    </svg>
  ),
  sofort: () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="4" fill="#FF6600"/>
      <path d="M8 12h16v8H8z" fill="white"/>
      <path d="M10 14h12v4H10z" fill="#FF6600"/>
      <text x="16" y="17" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">SOFORT</text>
    </svg>
  ),
  bancontact: () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="4" fill="#FF6600"/>
      <path d="M8 12h16v8H8z" fill="white"/>
      <path d="M10 14h12v4H10z" fill="#FF6600"/>
      <text x="16" y="17" textAnchor="middle" fill="white" fontSize="5" fontWeight="bold">Bancontact</text>
    </svg>
  ),
  banktransfer: () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="4" fill="#2E7D32"/>
      <path d="M8 12h16v8H8z" fill="white"/>
      <path d="M10 14h12v4H10z" fill="#2E7D32"/>
      <text x="16" y="17" textAnchor="middle" fill="white" fontSize="5" fontWeight="bold">Bank</text>
    </svg>
  ),
  default: () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="4" fill="#666"/>
      <path d="M8 12h16v8H8z" fill="white"/>
      <path d="M10 14h12v4H10z" fill="#666"/>
      <text x="16" y="17" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">$$$</text>
    </svg>
  )
};

export default function MollieFinanceMetrics({ period }: MollieFinanceMetricsProps) {
  const [metrics, setMetrics] = useState<FinanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/mollie-finance?period=${period}`);
      const result = await response.json();

      if (result.success) {
        setMetrics(result.data);
      } else {
        setError(result.error || 'Failed to fetch finance metrics');
      }
    } catch (error) {
      setError('Error fetching finance metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [period]);

  const formatCurrency = (amount: string | number) => {
    return `€${parseFloat(amount.toString()).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodIcon = (method: string) => {
    const IconComponent = PaymentMethodIcons[method as keyof typeof PaymentMethodIcons] || PaymentMethodIcons.default;
    return <IconComponent />;
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'ideal':
        return 'iDEAL';
      case 'creditcard':
        return 'Creditcard';
      case 'paypal':
        return 'PayPal';
      case 'sofort':
        return 'SOFORT';
      case 'bancontact':
        return 'Bancontact';
      case 'banktransfer':
        return 'Banktransfer';
      default:
        return method.charAt(0).toUpperCase() + method.slice(1);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#181F17] p-6 rounded-lg border border-[#3A4D23]">
        <div className="flex items-center justify-center py-8">
          <ArrowPathIcon className="w-8 h-8 text-[#8BAE5A] animate-spin" />
          <span className="ml-2 text-[#8BAE5A]">Finance metrics laden...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#181F17] p-6 rounded-lg border border-[#3A4D23]">
        <div className="text-center py-8">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Finance Metrics Error</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchMetrics}
            className="px-4 py-2 bg-[#8BAE5A] text-white rounded-lg hover:bg-[#3A4D23] transition-colors"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-[#181F17] p-6 rounded-lg border border-[#3A4D23]">
        <div className="text-center py-8">
          <p className="text-gray-400">Geen finance data beschikbaar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] rounded-lg flex items-center justify-center">
            <CurrencyEuroIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Mollie Finance Metrics</h2>
            <p className="text-sm text-gray-400">
              Laatste {period === '7d' ? '7 dagen' : period === '30d' ? '30 dagen' : '90 dagen'}
            </p>
          </div>
        </div>
        <button
          onClick={fetchMetrics}
          className="p-2 text-[#8BAE5A] hover:text-[#B6C948] transition-colors"
        >
          <ArrowPathIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#232D1A] p-4 rounded-lg border border-[#3A4D23]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Totale Omzet</p>
              <p className="text-2xl font-bold text-[#8BAE5A]">{formatCurrency(metrics.totalRevenue)}</p>
            </div>
            <ArrowTrendingUpIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
        </div>

        <div className="bg-[#232D1A] p-4 rounded-lg border border-[#3A4D23]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Succesvolle Transacties</p>
              <p className="text-2xl font-bold text-green-400">{metrics.successfulTransactions}</p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-[#232D1A] p-4 rounded-lg border border-[#3A4D23]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Conversie Rate</p>
              <p className="text-2xl font-bold text-[#B6C948]">{metrics.conversionRate}%</p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-[#B6C948]" />
          </div>
        </div>

        <div className="bg-[#232D1A] p-4 rounded-lg border border-[#3A4D23]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Gem. Transactie</p>
              <p className="text-2xl font-bold text-[#8BAE5A]">{formatCurrency(metrics.averageTransactionValue)}</p>
            </div>
            <CreditCardIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
        </div>
      </div>

      {/* Transaction Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#232D1A] p-4 rounded-lg border border-[#3A4D23]">
          <div className="flex items-center gap-2 mb-2">
            <ClockIcon className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-400">In behandeling</span>
          </div>
          <p className="text-xl font-bold text-yellow-400">{metrics.pendingTransactions}</p>
        </div>

        <div className="bg-[#232D1A] p-4 rounded-lg border border-[#3A4D23]">
          <div className="flex items-center gap-2 mb-2">
            <XCircleIcon className="w-5 h-5 text-red-400" />
            <span className="text-sm text-gray-400">Mislukt</span>
          </div>
          <p className="text-xl font-bold text-red-400">{metrics.failedTransactions}</p>
        </div>

        <div className="bg-[#232D1A] p-4 rounded-lg border border-[#3A4D23]">
          <div className="flex items-center gap-2 mb-2">
            <CreditCardIcon className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">Totaal</span>
          </div>
          <p className="text-xl font-bold text-blue-400">{metrics.totalTransactions}</p>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-[#232D1A] p-6 rounded-lg border border-[#3A4D23]">
        <h3 className="text-lg font-semibold text-white mb-4">Betaalmethoden</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(metrics.paymentMethods).map(([method, count]) => (
            <div key={method} className="text-center">
              <div className="flex justify-center mb-2">
                {getPaymentMethodIcon(method)}
              </div>
              <p className="text-sm text-gray-400">{getPaymentMethodName(method)}</p>
              <p className="text-lg font-bold text-[#8BAE5A]">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-[#232D1A] p-6 rounded-lg border border-[#3A4D23]">
        <h3 className="text-lg font-semibold text-white mb-4">Recente Transacties</h3>
        <div className="space-y-3">
          {metrics.recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 bg-[#181F17] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex justify-center">
                  {getPaymentMethodIcon(transaction.method)}
                </div>
                <div>
                  <p className="text-white font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-400">
                    {formatDate(transaction.paidAt || transaction.createdAt)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[#8BAE5A] font-bold">{formatCurrency(transaction.amount)}</p>
                <p className="text-xs text-gray-400">{getPaymentMethodName(transaction.method)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Revenue Chart */}
      <div className="bg-[#232D1A] p-6 rounded-lg border border-[#3A4D23]">
        <h3 className="text-lg font-semibold text-white mb-4">Dagelijkse Omzet (7 dagen)</h3>
        <div className="grid grid-cols-7 gap-2">
          {metrics.dailyRevenue.map((day, index) => (
            <div key={day.date} className="text-center">
              <div className="bg-[#8BAE5A] rounded-t-lg" style={{ 
                height: `${Math.max(20, (day.revenue / Math.max(...metrics.dailyRevenue.map(d => d.revenue))) * 100)}px` 
              }}></div>
              <div className="bg-[#181F17] p-2 rounded-b-lg">
                <p className="text-xs text-[#8BAE5A] font-bold">{formatCurrency(day.revenue)}</p>
                <p className="text-xs text-gray-400">{day.transactions} tx</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-400">
        Laatste update: {formatDate(metrics.lastUpdated)}
      </div>
    </div>
  );
}
