"use client";
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
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

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

interface CalculationResult {
  years: number[];
  totalValue: number[];
  principalContributed: number[];
  interestEarned: number[];
}

export default function CompoundInterest() {
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [annualReturn, setAnnualReturn] = useState(7);
  const [years, setYears] = useState(20);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);

  const calculateCompoundInterest = () => {
    const result: CalculationResult = {
      years: [],
      totalValue: [],
      principalContributed: [],
      interestEarned: []
    };

    let currentValue = initialInvestment;
    let totalPrincipal = initialInvestment;
    const monthlyRate = annualReturn / 100 / 12;

    for (let year = 0; year <= years; year++) {
      result.years.push(year);
      result.totalValue.push(currentValue);
      result.principalContributed.push(totalPrincipal);
      result.interestEarned.push(currentValue - totalPrincipal);

      // Add monthly contributions for the next year
      for (let month = 1; month <= 12; month++) {
        currentValue = currentValue * (1 + monthlyRate) + monthlyContribution;
        totalPrincipal += monthlyContribution;
      }
    }

    setCalculationResult(result);
  };

  useEffect(() => {
    calculateCompoundInterest();
  }, [initialInvestment, monthlyContribution, annualReturn, years]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount);
  };

  const chartData = calculationResult ? {
    labels: calculationResult.years.map(year => `Jaar ${year}`),
    datasets: [
      {
        label: 'Totaal Vermogen',
        data: calculationResult.totalValue,
        borderColor: '#8BAE5A',
        backgroundColor: 'rgba(139, 174, 90, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
      {
        label: 'Eigen Inleg',
        data: calculationResult.principalContributed,
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        fill: false,
        tension: 0.4,
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 6,
      },
      {
        label: 'Gegenereerd Rendement',
        data: calculationResult.interestEarned,
        borderColor: '#B6C948',
        backgroundColor: 'rgba(182, 201, 72, 0.1)',
        fill: false,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
      }
    ]
  } : null;

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
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
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
            return formatCurrency(value);
          }
        },
      },
    },
  };

  const getFinalValues = () => {
    if (!calculationResult) return null;
    const finalIndex = calculationResult.years.length - 1;
    return {
      totalValue: calculationResult.totalValue[finalIndex],
      principalContributed: calculationResult.principalContributed[finalIndex],
      interestEarned: calculationResult.interestEarned[finalIndex]
    };
  };

  const finalValues = getFinalValues();

  return (
    <div className="bg-[#232D1A] rounded-2xl shadow-xl p-6 border border-[#3A4D23]">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-xl font-bold text-[#B6C948]">🚀 Samengestelde Rente Calculator</h3>
      </div>
      
      <div className="space-y-6">
        {/* Input Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#181F17] rounded-xl p-4">
            <label className="block text-[#8BAE5A] font-semibold mb-2">
              Startkapitaal
            </label>
            <input
              type="number"
              value={initialInvestment === 0 ? '' : initialInvestment}
              onChange={e => setInitialInvestment(e.target.value === '' ? 0 : Number(e.target.value))}
              className="w-full bg-[#232D1A] border border-[#3A4D23] rounded-lg px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-[#8BAE5A]"
              placeholder="10000"
            />
          </div>

          <div className="bg-[#181F17] rounded-xl p-4">
            <label className="block text-[#8BAE5A] font-semibold mb-2">
              Maandelijkse Inleg
            </label>
            <input
              type="number"
              value={monthlyContribution === 0 ? '' : monthlyContribution}
              onChange={e => setMonthlyContribution(e.target.value === '' ? 0 : Number(e.target.value))}
              className="w-full bg-[#232D1A] border border-[#3A4D23] rounded-lg px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-[#8BAE5A]"
              placeholder="500"
            />
          </div>

          <div className="bg-[#181F17] rounded-xl p-4">
            <label className="block text-[#8BAE5A] font-semibold mb-2">
              Jaarlijks Rendement (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={annualReturn === 0 ? '' : annualReturn}
              onChange={e => setAnnualReturn(e.target.value === '' ? 0 : Number(e.target.value))}
              className="w-full bg-[#232D1A] border border-[#3A4D23] rounded-lg px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-[#8BAE5A]"
              placeholder="7"
            />
          </div>

          <div className="bg-[#181F17] rounded-xl p-4">
            <label className="block text-[#8BAE5A] font-semibold mb-2">
              Looptijd (Jaren)
            </label>
            <input
              type="number"
              value={years === 0 ? '' : years}
              onChange={e => setYears(e.target.value === '' ? 0 : Number(e.target.value))}
              className="w-full bg-[#232D1A] border border-[#3A4D23] rounded-lg px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-[#8BAE5A]"
              placeholder="20"
            />
          </div>
        </div>

        {/* Chart */}
        {chartData && (
          <div className="bg-[#181F17] rounded-xl p-4">
            <h3 className="text-[#8BAE5A] font-semibold mb-4">Vermogensgroei Over Tijd</h3>
            <div className="h-80">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Results Summary */}
        {finalValues && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#181F17] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {formatCurrency(finalValues.totalValue)}
              </div>
              <div className="text-[#8BAE5A] text-sm">Totaal Vermogen</div>
              <div className="text-[#A3AED6] text-xs mt-1">
                Na {years} jaar
              </div>
            </div>

            <div className="bg-[#181F17] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#FFD700] mb-1">
                {formatCurrency(finalValues.principalContributed)}
              </div>
              <div className="text-[#8BAE5A] text-sm">Eigen Inleg</div>
              <div className="text-[#A3AED6] text-xs mt-1">
                {((finalValues.principalContributed / finalValues.totalValue) * 100).toFixed(1)}% van totaal
              </div>
            </div>

            <div className="bg-[#181F17] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#B6C948] mb-1">
                {formatCurrency(finalValues.interestEarned)}
              </div>
              <div className="text-[#8BAE5A] text-sm">Gegenereerd Rendement</div>
              <div className="text-[#A3AED6] text-xs mt-1">
                {((finalValues.interestEarned / finalValues.totalValue) * 100).toFixed(1)}% van totaal
              </div>
            </div>
          </div>
        )}

        {/* Key Insights */}
        {finalValues && (
          <div className="bg-gradient-to-r from-[#8BAE5A]/20 to-[#FFD700]/20 rounded-xl p-4 border border-[#8BAE5A]/40">
            <h3 className="text-[#FFD700] font-bold mb-3">💡 Belangrijke Inzichten</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-[#8BAE5A] font-semibold mb-1">Het Achtste Wereldwonder</div>
                <div className="text-[#A3AED6]">
                  Je rendement ({formatCurrency(finalValues.interestEarned)}) is{' '}
                  {finalValues.interestEarned > finalValues.principalContributed ? 'groter' : 'kleiner'} dan je eigen inleg!
                </div>
              </div>
              <div>
                <div className="text-[#8BAE5A] font-semibold mb-1">Tijdsvoordeel</div>
                <div className="text-[#A3AED6]">
                  Elke extra jaar geeft exponentiële groei. Start vroeg voor maximaal effect.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preset Scenarios */}
        <div className="bg-[#181F17] rounded-xl p-4">
          <h3 className="text-[#8BAE5A] font-semibold mb-3">Snelle Scenario's</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => {
                setInitialInvestment(5000);
                setMonthlyContribution(300);
                setAnnualReturn(6);
                setYears(30);
              }}
              className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4 text-left hover:border-[#8BAE5A]/50 transition-colors"
            >
              <div className="font-semibold text-white">Conservatief</div>
              <div className="text-xs text-[#A3AED6]">€5K start, €300/maand, 6% rendement</div>
            </button>
            <button
              onClick={() => {
                setInitialInvestment(10000);
                setMonthlyContribution(500);
                setAnnualReturn(7);
                setYears(25);
              }}
              className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4 text-left hover:border-[#8BAE5A]/50 transition-colors"
            >
              <div className="font-semibold text-white">Gebalanceerd</div>
              <div className="text-xs text-[#A3AED6]">€10K start, €500/maand, 7% rendement</div>
            </button>
            <button
              onClick={() => {
                setInitialInvestment(20000);
                setMonthlyContribution(800);
                setAnnualReturn(8);
                setYears(20);
              }}
              className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4 text-left hover:border-[#8BAE5A]/50 transition-colors"
            >
              <div className="font-semibold text-white">Aggressief</div>
              <div className="text-xs text-[#A3AED6]">€20K start, €800/maand, 8% rendement</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 