"use client";
import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface BudgetCategory {
  id: string;
  name: string;
  amount: number;
  color: string;
}

const defaultCategories: BudgetCategory[] = [
  { id: '1', name: 'Vaste Lasten', amount: 0, color: '#8BAE5A' },
  { id: '2', name: 'Boodschappen', amount: 0, color: '#FFD700' },
  { id: '3', name: 'Transport', amount: 0, color: '#f0a14f' },
  { id: '4', name: 'Investeringen', amount: 0, color: '#B6C948' },
  { id: '5', name: 'Entertainment', amount: 0, color: '#FF6B6B' },
  { id: '6', name: 'Spaargeld', amount: 0, color: '#4ECDC4' },
];

export default function ZeroBasedBudget() {
  const [monthlyIncome, setMonthlyIncome] = useState(3000);
  const [categories, setCategories] = useState<BudgetCategory[]>(defaultCategories);
  const [remainingAmount, setRemainingAmount] = useState(monthlyIncome);

  useEffect(() => {
    const totalAllocated = categories.reduce((sum, cat) => sum + cat.amount, 0);
    setRemainingAmount(monthlyIncome - totalAllocated);
  }, [categories, monthlyIncome]);

  const updateCategoryAmount = (id: string, amount: number) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, amount: Math.max(0, amount) } : cat
    ));
  };

  const addCategory = () => {
    const newCategory: BudgetCategory = {
      id: Date.now().toString(),
      name: 'Nieuwe Categorie',
      amount: 0,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const removeCategory = (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
  };

  const updateCategoryName = (id: string, name: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, name } : cat
    ));
  };

  const getProgressPercentage = () => {
    return Math.min(100, ((monthlyIncome - remainingAmount) / monthlyIncome) * 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount);
  };

  return (
    <div className="bg-[#232D1A] rounded-2xl shadow-xl p-6 border border-[#3A4D23]">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-xl font-bold text-[#B6C948]">💰 Zero-Based Budget</h3>
      </div>
      
      <div className="space-y-6">
        {/* Income Input */}
        <div className="bg-[#181F17] rounded-xl p-4">
          <label className="block text-[#8BAE5A] font-semibold mb-2">
            Maandelijkse Netto Inkomen
          </label>
          <input
            type="number"
            value={monthlyIncome === 0 ? '' : monthlyIncome}
            onChange={e => setMonthlyIncome(e.target.value === '' ? 0 : Number(e.target.value))}
            className="w-full bg-[#232D1A] border border-[#3A4D23] rounded-lg px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-[#8BAE5A]"
            placeholder="3000"
          />
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#8BAE5A]">Budgettering Voortgang</span>
            <span className={`font-semibold ${remainingAmount < 0 ? 'text-red-400' : 'text-[#8BAE5A]'}`}>
              {formatCurrency(remainingAmount)} over
            </span>
          </div>
          <div className="w-full bg-[#3A4D23] rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                remainingAmount < 0 ? 'bg-red-500' : 'bg-gradient-to-r from-[#8BAE5A] to-[#FFD700]'
              }`}
              style={{ width: `${Math.min(100, getProgressPercentage())}%` }}
            />
          </div>
          <div className="text-xs text-[#A3AED6]">
            {getProgressPercentage().toFixed(1)}% van je inkomen gebudgetteerd
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Budget Categorieën</h3>
            <button 
              onClick={addCategory}
              className="bg-[#8BAE5A] text-[#232D1A] px-3 py-1 rounded-lg text-sm font-semibold hover:bg-[#B6C948] transition-colors"
            >
              + Categorie
            </button>
          </div>

          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="bg-[#181F17] rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => updateCategoryName(category.id, e.target.value)}
                    className="flex-1 bg-transparent text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] rounded px-2 py-1"
                  />
                  {categories.length > 1 && (
                    <button
                      onClick={() => removeCategory(category.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      🗑️
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={category.amount === 0 ? '' : category.amount}
                    onChange={e => {
                      const val = e.target.value;
                      updateCategoryAmount(category.id, val === '' ? 0 : Number(val));
                    }}
                    className="flex-1 bg-[#232D1A] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8BAE5A]"
                    placeholder="0"
                  />
                  <span className="text-[#8BAE5A] font-mono text-sm min-w-[80px]">
                    {formatCurrency(category.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        {remainingAmount === 0 && (
          <div className="bg-gradient-to-r from-[#8BAE5A]/20 to-[#FFD700]/20 rounded-xl p-4 border border-[#8BAE5A]/40">
            <div className="text-center">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="text-[#FFD700] font-bold mb-1">Perfect Gebudgetteerd!</h4>
              <p className="text-[#8BAE5A] text-sm">
                Je hebt elke euro een doel gegeven. Dit is de basis van financiële controle.
              </p>
            </div>
          </div>
        )}

        {remainingAmount < 0 && (
          <div className="bg-red-500/20 rounded-xl p-4 border border-red-500/40">
            <div className="text-center">
              <div className="text-2xl mb-2">⚠️</div>
              <h4 className="text-red-400 font-bold mb-1">Overbudgetteerd</h4>
              <p className="text-red-300 text-sm">
                Je hebt {formatCurrency(Math.abs(remainingAmount))} meer toegewezen dan je inkomen. Pas je budget aan.
              </p>
            </div>
          </div>
        )}

        {remainingAmount > 0 && (
          <div className="bg-[#3A4D23]/40 rounded-xl p-4 border border-[#3A4D23]">
            <div className="text-center">
              <div className="text-2xl mb-2">💡</div>
              <h4 className="text-[#8BAE5A] font-bold mb-1">Nog {formatCurrency(remainingAmount)} te verdelen</h4>
              <p className="text-[#A3AED6] text-sm">
                Geef elke euro een doel om volledige controle te krijgen over je geld.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 