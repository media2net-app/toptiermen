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

interface FIRECalculation {
  fireNumber: number;
  yearsToFire: number;
  fireDate: Date;
  projectedGrowth: {
    years: number[];
    netWorth: number[];
    fireTarget: number[];
  };
}

export default function FIRECalculator() {
  const [annualExpenses, setAnnualExpenses] = useState(30000);
  const [currentNetWorth, setCurrentNetWorth] = useState(50000);
  const [monthlySavings, setMonthlySavings] = useState(1500);
  const [expectedReturn, setExpectedReturn] = useState(7);
  const [inflationRate, setInflationRate] = useState(2);
  const [currentAge, setCurrentAge] = useState(30);
  const [calculation, setCalculation] = useState<FIRECalculation | null>(null);

  const calculateFIRE = () => {
    // 4% rule: FIRE number = annual expenses / 0.04
    const fireNumber = annualExpenses / 0.04;
    
    // Calculate years to FIRE
    let yearsToFire = 0;
    let projectedNetWorth = currentNetWorth;
    const monthlyReturn = expectedReturn / 100 / 12;
    
    while (projectedNetWorth < fireNumber && yearsToFire < 50) {
      projectedNetWorth = projectedNetWorth * (1 + monthlyReturn) + monthlySavings;
      yearsToFire++;
    }

    // Calculate FIRE date
    const fireDate = new Date();
    fireDate.setFullYear(fireDate.getFullYear() + yearsToFire);

    // Generate projection data
    const projectedGrowth = {
      years: [],
      netWorth: [],
      fireTarget: []
    } as any;

    let currentValue = currentNetWorth;
    for (let year = 0; year <= Math.min(yearsToFire + 5, 50); year++) {
      projectedGrowth.years.push(year);
      projectedGrowth.netWorth.push(currentValue);
      projectedGrowth.fireTarget.push(fireNumber);

      // Calculate next year's value
      for (let month = 1; month <= 12; month++) {
        currentValue = currentValue * (1 + monthlyReturn) + monthlySavings;
      }
    }

    setCalculation({
      fireNumber,
      yearsToFire,
      fireDate,
      projectedGrowth
    });
  };

  useEffect(() => {
    calculateFIRE();
  }, [annualExpenses, currentNetWorth, monthlySavings, expectedReturn, inflationRate, currentAge]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('nl-NL', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const chartData = calculation ? {
    labels: calculation.projectedGrowth.years.map(year => `Jaar ${year}`),
    datasets: [
      {
        label: 'Netto Waarde',
        data: calculation.projectedGrowth.netWorth,
        borderColor: '#8BAE5A',
        backgroundColor: 'rgba(139, 174, 90, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
      {
        label: 'FIRE Doel',
        data: calculation.projectedGrowth.fireTarget,
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        fill: false,
        tension: 0,
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 0,
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

  const getSavingsRate = () => {
    const annualIncome = (monthlySavings * 12) + (currentNetWorth * (expectedReturn / 100));
    return ((monthlySavings * 12) / annualIncome) * 100;
  };

  return (
    <div className="bg-[#232D1A] rounded-2xl shadow-xl p-6 border border-[#3A4D23]">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-xl font-bold text-[#B6C948]">🔥 FIRE Calculator</h3>
      </div>
      
      <div className="space-y-6">
        {/* Input Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[#181F17] rounded-xl p-4">
            <label className="block text-[#8BAE5A] font-semibold mb-2">
              Jaarlijkse Uitgaven
            </label>
            <input
              type="number"
              value={annualExpenses === 0 ? '' : annualExpenses}
              onChange={e => setAnnualExpenses(e.target.value === '' ? 0 : Number(e.target.value))}
              className="w-full bg-[#232D1A] border border-[#3A4D23] rounded-lg px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-[#8BAE5A]"
              placeholder="30000"
            />
            <div className="text-xs text-[#A3AED6] mt-1">
              Wat je per jaar wilt uitgeven
            </div>
          </div>

          <div className="bg-[#181F17] rounded-xl p-4">
            <label className="block text-[#8BAE5A] font-semibold mb-2">
              Huidige Netto Waarde
            </label>
            <input
              type="number"
              value={currentNetWorth === 0 ? '' : currentNetWorth}
              onChange={e => setCurrentNetWorth(e.target.value === '' ? 0 : Number(e.target.value))}
              className="w-full bg-[#232D1A] border border-[#3A4D23] rounded-lg px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-[#8BAE5A]"
              placeholder="50000"
            />
          </div>

          <div className="bg-[#181F17] rounded-xl p-4">
            <label className="block text-[#8BAE5A] font-semibold mb-2">
              Maandelijkse Spaarquote
            </label>
            <input
              type="number"
              value={monthlySavings === 0 ? '' : monthlySavings}
              onChange={e => setMonthlySavings(e.target.value === '' ? 0 : Number(e.target.value))}
              className="w-full bg-[#232D1A] border border-[#3A4D23] rounded-lg px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-[#8BAE5A]"
              placeholder="1500"
            />
          </div>

          <div className="bg-[#181F17] rounded-xl p-4">
            <label className="block text-[#8BAE5A] font-semibold mb-2">
              Verwacht Rendement (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={expectedReturn === 0 ? '' : expectedReturn}
              onChange={e => setExpectedReturn(e.target.value === '' ? 0 : Number(e.target.value))}
              className="w-full bg-[#232D1A] border border-[#3A4D23] rounded-lg px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-[#8BAE5A]"
              placeholder="7"
            />
          </div>

          <div className="bg-[#181F17] rounded-xl p-4">
            <label className="block text-[#8BAE5A] font-semibold mb-2">
              Inflatie (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={inflationRate === 0 ? '' : inflationRate}
              onChange={e => setInflationRate(e.target.value === '' ? 0 : Number(e.target.value))}
              className="w-full bg-[#232D1A] border border-[#3A4D23] rounded-lg px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-[#8BAE5A]"
              placeholder="2"
            />
          </div>

          <div className="bg-[#181F17] rounded-xl p-4">
            <label className="block text-[#8BAE5A] font-semibold mb-2">
              Huidige Leeftijd
            </label>
            <input
              type="number"
              value={currentAge === 0 ? '' : currentAge}
              onChange={e => setCurrentAge(e.target.value === '' ? 0 : Number(e.target.value))}
              className="w-full bg-[#232D1A] border border-[#3A4D23] rounded-lg px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-[#8BAE5A]"
              placeholder="30"
            />
          </div>
        </div>

        {/* FIRE Results */}
        {calculation && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#181F17] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#FFD700] mb-1">
                {formatCurrency(calculation.fireNumber)}
              </div>
              <div className="text-[#8BAE5A] text-sm">FIRE Number</div>
              <div className="text-[#A3AED6] text-xs mt-1">
                (4% regel)
              </div>
            </div>

            <div className="bg-[#181F17] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {calculation.yearsToFire}
              </div>
              <div className="text-[#8BAE5A] text-sm">Jaren tot FIRE</div>
              <div className="text-[#A3AED6] text-xs mt-1">
                Leeftijd: {currentAge + calculation.yearsToFire}
              </div>
            </div>

            <div className="bg-[#181F17] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#B6C948] mb-1">
                {formatDate(calculation.fireDate)}
              </div>
              <div className="text-[#8BAE5A] text-sm">FIRE Datum</div>
              <div className="text-[#A3AED6] text-xs mt-1">
                {calculation.yearsToFire > 0 ? `${calculation.yearsToFire} jaar` : 'Nu!'}
              </div>
            </div>

            <div className="bg-[#181F17] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#f0a14f] mb-1">
                {getSavingsRate().toFixed(1)}%
              </div>
              <div className="text-[#8BAE5A] text-sm">Spaarquote</div>
              <div className="text-[#A3AED6] text-xs mt-1">
                Van inkomen
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        {chartData && (
          <div className="bg-[#181F17] rounded-xl p-4">
            <h3 className="text-[#8BAE5A] font-semibold mb-4">Pad naar Financiële Onafhankelijkheid</h3>
            <div className="h-80">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Key Insights */}
        {calculation && (
          <div className="bg-gradient-to-r from-[#8BAE5A]/20 to-[#FFD700]/20 rounded-xl p-4 border border-[#8BAE5A]/40">
            <h3 className="text-[#FFD700] font-bold mb-3">💡 FIRE Inzichten</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-[#8BAE5A] font-semibold mb-1">De 4% Regel</div>
                <div className="text-[#A3AED6]">
                  Je hebt {formatCurrency(calculation.fireNumber)} nodig om {formatCurrency(annualExpenses)} per jaar te kunnen uitgeven zonder je vermogen op te maken.
                </div>
              </div>
              <div>
                <div className="text-[#8BAE5A] font-semibold mb-1">Spaarquote Impact</div>
                <div className="text-[#A3AED6]">
                  Een hogere spaarquote versnelt je FIRE datum exponentieel. Elke extra euro telt dubbel!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preset Scenarios */}
        <div className="bg-[#181F17] rounded-xl p-4">
          <h3 className="text-[#8BAE5A] font-semibold mb-3">FIRE Scenario's</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => {
                setAnnualExpenses(25000);
                setCurrentNetWorth(30000);
                setMonthlySavings(1000);
                setExpectedReturn(6);
                setCurrentAge(25);
              }}
              className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4 text-left hover:border-[#8BAE5A]/50 transition-colors"
            >
              <div className="font-semibold text-white">Lean FIRE</div>
              <div className="text-xs text-[#A3AED6]">Minimale uitgaven, vroeg starten</div>
            </button>
            <button
              onClick={() => {
                setAnnualExpenses(40000);
                setCurrentNetWorth(75000);
                setMonthlySavings(2000);
                setExpectedReturn(7);
                setCurrentAge(30);
              }}
              className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4 text-left hover:border-[#8BAE5A]/50 transition-colors"
            >
              <div className="font-semibold text-white">Regular FIRE</div>
              <div className="text-xs text-[#A3AED6]">Gebalanceerde levensstijl</div>
            </button>
            <button
              onClick={() => {
                setAnnualExpenses(60000);
                setCurrentNetWorth(150000);
                setMonthlySavings(3000);
                setExpectedReturn(8);
                setCurrentAge(35);
              }}
              className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4 text-left hover:border-[#8BAE5A]/50 transition-colors"
            >
              <div className="font-semibold text-white">Fat FIRE</div>
              <div className="text-xs text-[#A3AED6]">Luxe levensstijl, hogere uitgaven</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 