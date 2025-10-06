"use client";
import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { PlusIcon, TrashIcon, CalculatorIcon } from '@heroicons/react/24/outline';

interface Debt {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
}

interface PaymentPlan {
  month: number;
  payments: { debtId: string; amount: number; remainingBalance: number }[];
  totalPaid: number;
  totalInterest: number;
}

export default function DebtSnowball() {
  const [debts, setDebts] = useState<Debt[]>([
    { id: '1', name: 'Creditcard', balance: 5000, interestRate: 15, minimumPayment: 150 },
    { id: '2', name: 'Studieschuld', balance: 15000, interestRate: 2.5, minimumPayment: 200 },
    { id: '3', name: 'Persoonlijke Lening', balance: 8000, interestRate: 8, minimumPayment: 300 },
  ]);
  const [monthlyPayment, setMonthlyPayment] = useState(800);
  const [strategy, setStrategy] = useState<'snowball' | 'avalanche'>('snowball');
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan[]>([]);
  const [showResults, setShowResults] = useState(false);

  const calculatePaymentPlan = () => {
    const plan: PaymentPlan[] = [];
    let currentDebts = [...debts];
    let month = 1;
    let totalPaid = 0;
    let totalInterest = 0;

    // Sort debts based on strategy
    const sortedDebts = [...currentDebts].sort((a, b) => {
      if (strategy === 'snowball') {
        return a.balance - b.balance; // Smallest balance first
      } else {
        return b.interestRate - a.interestRate; // Highest interest first
      }
    });

    while (sortedDebts.some(debt => debt.balance > 0) && month <= 120) { // Max 10 years
      const monthPayments: { debtId: string; amount: number; remainingBalance: number }[] = [];
      let remainingPayment = monthlyPayment;

      // Pay minimum payments first
      for (const debt of sortedDebts) {
        if (debt.balance > 0) {
          const payment = Math.min(debt.minimumPayment, debt.balance);
          const interest = (debt.balance * debt.interestRate) / 1200; // Monthly interest
          const principalPayment = Math.max(0, payment - interest);
          
          debt.balance = Math.max(0, debt.balance - principalPayment);
          totalInterest += interest;
          
          monthPayments.push({
            debtId: debt.id,
            amount: payment,
            remainingBalance: debt.balance
          });
          
          remainingPayment -= payment;
        }
      }

      // Apply remaining payment to the first debt in the strategy order
      if (remainingPayment > 0) {
        for (const debt of sortedDebts) {
          if (debt.balance > 0 && remainingPayment > 0) {
            const extraPayment = Math.min(remainingPayment, debt.balance);
            debt.balance -= extraPayment;
            remainingPayment -= extraPayment;
            
            const existingPayment = monthPayments.find(p => p.debtId === debt.id);
            if (existingPayment) {
              existingPayment.amount += extraPayment;
              existingPayment.remainingBalance = debt.balance;
            }
            
            if (debt.balance === 0) break;
          }
        }
      }

      totalPaid += monthlyPayment;
      
      plan.push({
        month,
        payments: monthPayments,
        totalPaid,
        totalInterest
      });

      month++;
    }

    setPaymentPlan(plan);
    setShowResults(true);
  };

  const addDebt = () => {
    const newDebt: Debt = {
      id: Date.now().toString(),
      name: 'Nieuwe Schuld',
      balance: 0,
      interestRate: 0,
      minimumPayment: 0
    };
    setDebts(prev => [...prev, newDebt]);
  };

  const removeDebt = (id: string) => {
    setDebts(prev => prev.filter(debt => debt.id !== id));
  };

  const updateDebt = (id: string, field: keyof Debt, value: number | string) => {
    setDebts(prev => prev.map(debt => 
      debt.id === id ? { ...debt, [field]: value } : debt
    ));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount);
  };

  const getTotalDebt = () => debts.reduce((sum, debt) => sum + debt.balance, 0);
  const getTotalMinimumPayments = () => debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);

  return (
    <Card>
      {/* Titel compacter op mobiel */}
      <div className="font-bold text-base sm:text-lg mb-1 sm:mb-2 leading-tight">
        🏔️ Schulden-Sneeuwbal Calculator
      </div>
      <div className="p-3 sm:p-4 max-w-full box-border">
        {/* Strategy Selection */}
        <div className="bg-[#181F17] rounded-xl p-3 sm:p-4">
          <h3 className="text-[#8BAE5A] font-semibold mb-3 text-sm sm:text-base">Kies je Strategie</h3>
          
          {/* Mobile-first responsive buttons */}
          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3">
            {/* Snowball Method */}
            <button
              onClick={() => setStrategy('snowball')}
              className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                strategy === 'snowball'
                  ? 'border-[#8BAE5A] bg-[#8BAE5A]/10 shadow-lg'
                  : 'border-[#3A4D23] bg-[#232D1A] hover:border-[#8BAE5A]/50 hover:bg-[#2A3A1A]'
              }`}
            >
              <div className="flex flex-col h-full">
                <div className="text-base font-bold text-white mb-2 leading-tight">
                  Sneeuwbal Methode
                </div>
                <div className="text-xs text-[#A3AED6] leading-relaxed flex-grow">
                  Los eerst de kleinste schuld af voor psychologische winst
                </div>
              </div>
            </button>

            {/* Avalanche Method */}
            <button
              onClick={() => setStrategy('avalanche')}
              className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                strategy === 'avalanche'
                  ? 'border-[#8BAE5A] bg-[#8BAE5A]/10 shadow-lg'
                  : 'border-[#3A4D23] bg-[#232D1A] hover:border-[#8BAE5A]/50 hover:bg-[#2A3A1A]'
              }`}
            >
              <div className="flex flex-col h-full">
                <div className="text-base font-bold text-white mb-2 leading-tight">
                  Lawaai Methode
                </div>
                <div className="text-xs text-[#A3AED6] leading-relaxed flex-grow">
                  Los eerst de schuld met hoogste rente af voor financiële winst
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Monthly Payment Input */}
        <div className="bg-[#181F17] rounded-xl p-4">
          <label className="block text-[#8BAE5A] font-semibold mb-2">
            Maandelijkse Extra Betaling
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="number"
              value={monthlyPayment === 0 ? '' : monthlyPayment}
              onChange={e => setMonthlyPayment(e.target.value === '' ? 0 : Number(e.target.value))}
              className="flex-1 bg-[#232D1A] border border-[#3A4D23] rounded-lg px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-[#8BAE5A] min-w-0"
              placeholder="800"
            />
            <Button 
              onClick={calculatePaymentPlan}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-3 whitespace-nowrap"
            >
              <CalculatorIcon className="h-5 w-5" />
              Bereken Plan
            </Button>
          </div>
          <div className="mt-2 text-sm text-[#A3AED6]">
            Minimum betalingen: {formatCurrency(getTotalMinimumPayments())} + Extra: {formatCurrency(monthlyPayment)}
          </div>
        </div>

        {/* Debts List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Je Schulden</h3>
            <Button 
              onClick={addDebt}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <PlusIcon className="h-4 w-4" />
              Schuld
            </Button>
          </div>

          <div className="space-y-3">
            {debts.map((debt) => (
              <div key={debt.id} className="bg-[#181F17] rounded-lg p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[#8BAE5A] text-sm mb-1">Naam</label>
                    <input
                      type="text"
                      value={debt.name}
                      onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                      className="w-full bg-[#232D1A] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8BAE5A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8BAE5A] text-sm mb-1">Openstaand Bedrag</label>
                    <input
                      type="number"
                      value={debt.balance === 0 ? '' : debt.balance}
                      onChange={e => updateDebt(debt.id, 'balance', e.target.value === '' ? 0 : Number(e.target.value))}
                      className="w-full bg-[#232D1A] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8BAE5A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8BAE5A] text-sm mb-1">Rente (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={debt.interestRate === 0 ? '' : debt.interestRate}
                      onChange={e => updateDebt(debt.id, 'interestRate', e.target.value === '' ? 0 : Number(e.target.value))}
                      className="w-full bg-[#232D1A] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8BAE5A]"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1 min-w-0">
                      <label className="block text-[#8BAE5A] text-sm mb-1">Min. Betaling</label>
                      <input
                        type="number"
                        value={debt.minimumPayment === 0 ? '' : debt.minimumPayment}
                        onChange={e => updateDebt(debt.id, 'minimumPayment', e.target.value === '' ? 0 : Number(e.target.value))}
                        className="w-full bg-[#232D1A] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8BAE5A]"
                      />
                    </div>
                    {debts.length > 1 && (
                      <button
                        onClick={() => removeDebt(debt.id)}
                        className="text-red-400 hover:text-red-300 transition-colors p-2 shrink-0"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#181F17] rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{formatCurrency(getTotalDebt())}</div>
            <div className="text-[#8BAE5A] text-sm">Totaal Schuld</div>
          </div>
          <div className="bg-[#181F17] rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{formatCurrency(getTotalMinimumPayments())}</div>
            <div className="text-[#8BAE5A] text-sm">Min. Betalingen</div>
          </div>
          <div className="bg-[#181F17] rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{formatCurrency(getTotalMinimumPayments() + monthlyPayment)}</div>
            <div className="text-[#8BAE5A] text-sm">Totaal Maandelijks</div>
          </div>
        </div>

        {/* Results */}
        {showResults && paymentPlan.length > 0 && (
          <div className="bg-[#181F17] rounded-xl p-4">
            <h3 className="text-[#8BAE5A] font-semibold mb-4">Aflossingsplan</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {paymentPlan.slice(0, 12).map((month) => (
                <div key={month.month} className="bg-[#232D1A] rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-semibold">Maand {month.month}</span>
                    <span className="text-[#8BAE5A] text-sm">
                      Totaal betaald: {formatCurrency(month.totalPaid)}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {month.payments.map((payment) => {
                      const debt = debts.find(d => d.id === payment.debtId);
                      return (
                        <div key={payment.debtId} className="flex justify-between">
                          <span className="text-[#A3AED6]">{debt?.name}</span>
                          <span className="text-white">{formatCurrency(payment.amount)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {paymentPlan.length > 12 && (
                <div className="text-center text-[#A3AED6] text-sm">
                  ... en nog {paymentPlan.length - 12} maanden
                </div>
              )}
            </div>
            <div className="mt-4 p-3 bg-[#8BAE5A]/10 rounded-lg border border-[#8BAE5A]/30">
              <div className="text-center">
                <div className="text-lg font-bold text-[#FFD700] mb-1">
                  Schuldenvrij in {paymentPlan.length} maanden!
                </div>
                <div className="text-[#8BAE5A] text-sm">
                  Totaal betaalde rente: {formatCurrency(paymentPlan[paymentPlan.length - 1]?.totalInterest || 0)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 