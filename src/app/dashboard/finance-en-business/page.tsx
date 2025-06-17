'use client';
import { useState } from 'react';
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

export default function FinancePage() {
  const [selectedPeriod, setSelectedPeriod] = useState('1m');
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);

  const handleBankSelect = (bankId: string) => {
    console.log('Selected bank:', bankId);
    setIsBankModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Finance & Business</h1>
        <button
          onClick={() => setIsBankModalOpen(true)}
          className="px-4 py-2 bg-[#8BAE5A] text-white rounded-lg hover:bg-[#7A9A4A] transition-colors"
        >
          Mijn bank koppelen
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#232D1A] rounded-xl p-6 border border-[#3A4D23]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Netto Waarde</h2>
            <div className="flex gap-2">
              {['1m', '6m', '1y', 'all'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    selectedPeriod === period
                      ? 'bg-[#8BAE5A] text-white'
                      : 'bg-[#1B2214] text-[#8BAE5A] hover:bg-[#2A341F]'
                  }`}
                >
                  {period === '1m' ? '1M' : period === '6m' ? '6M' : period === '1y' ? '1J' : 'All'}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[400px]">
            <Line data={generateChartData(selectedPeriod)} options={chartOptions} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#232D1A] rounded-xl p-6 border border-[#3A4D23]">
            <h2 className="text-xl font-semibold text-white mb-4">Activa</h2>
            <div className="space-y-4">
              {assets.map((asset) => (
                <div key={asset.name} className="flex justify-between items-center">
                  <span className="text-[#8BAE5A]">{asset.name}</span>
                  <span className="text-white font-medium">
                    {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(asset.amount)}
                  </span>
                </div>
              ))}
              <div className="pt-4 border-t border-[#3A4D23]">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">Totaal Activa</span>
                  <span className="text-white font-bold">
                    {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
                      assets.reduce((sum, asset) => sum + asset.amount, 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#232D1A] rounded-xl p-6 border border-[#3A4D23]">
            <h2 className="text-xl font-semibold text-white mb-4">Schulden</h2>
            <div className="space-y-4">
              {debts.map((debt) => (
                <div key={debt.name} className="flex justify-between items-center">
                  <span className="text-[#8BAE5A]">{debt.name}</span>
                  <span className="text-white font-medium">
                    {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(debt.amount)}
                  </span>
                </div>
              ))}
              <div className="pt-4 border-t border-[#3A4D23]">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">Totaal Schulden</span>
                  <span className="text-white font-bold">
                    {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
                      debts.reduce((sum, debt) => sum + debt.amount, 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BankConnectionModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        onSelectBank={handleBankSelect}
      />
    </div>
  );
} 