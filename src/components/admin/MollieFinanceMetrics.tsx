'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCardIcon,
  CurrencyEuroIcon,
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowPathIcon
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
    switch (method) {
      case 'ideal':
        return '🏦';
      case 'creditcard':
        return '💳';
      case 'paypal':
        return '📱';
      case 'sofort':
        return '🇩🇪';
      case 'bancontact':
        return '🇧🇪';
      case 'banktransfer':
        return '🏛️';
      default:
        return '💰';
    }
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
          <XCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#232D1A] p-4 rounded-lg border border-[#3A4D23]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Totale Omzet</p>
              <p className="text-2xl font-bold text-[#8BAE5A]">{formatCurrency(metrics.totalRevenue)}</p>
            </div>
            <TrendingUpIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#232D1A] p-4 rounded-lg border border-[#3A4D23]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Succesvolle Transacties</p>
              <p className="text-2xl font-bold text-green-400">{metrics.successfulTransactions}</p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#232D1A] p-4 rounded-lg border border-[#3A4D23]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Conversie Rate</p>
              <p className="text-2xl font-bold text-[#B6C948]">{metrics.conversionRate}%</p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-[#B6C948]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#232D1A] p-4 rounded-lg border border-[#3A4D23]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Gem. Transactie</p>
              <p className="text-2xl font-bold text-[#8BAE5A]">{formatCurrency(metrics.averageTransactionValue)}</p>
            </div>
            <CreditCardIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
        </motion.div>
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
              <div className="text-2xl mb-2">{getPaymentMethodIcon(method)}</div>
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
                <div className="text-xl">{getPaymentMethodIcon(transaction.method)}</div>
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
