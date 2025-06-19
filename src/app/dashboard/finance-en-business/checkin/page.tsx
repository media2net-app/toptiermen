import { useState } from 'react';
import { useFinance } from '../FinanceContext';
import { toast } from 'react-toastify';

// Mockdata van vorige maand
const defaultAssets = [
  { name: 'Spaarrekening', value: 5000 },
  { name: 'Aandelen', value: 2500 },
];
const defaultDebts = [
  { name: 'Hypotheek', value: 120000 },
];

export default function CheckinWizard() {
  const [step, setStep] = useState(1);
  const [assets, setAssets] = useState(defaultAssets);
  const [debts, setDebts] = useState(defaultDebts);
  const [income, setIncome] = useState(3000);
  const [savings, setSavings] = useState(500);
  const { updateFinance } = useFinance();

  // Handlers
  const handleAssetChange = (idx: number, value: number) => {
    setAssets(assets.map((a, i) => i === idx ? { ...a, value } : a));
  };
  const handleDebtChange = (idx: number, value: number) => {
    setDebts(debts.map((d, i) => i === idx ? { ...d, value } : d));
  };
  const handleFinish = () => {
    updateFinance({ assets, debts, income, savings });
    toast.success('Check-in opgeslagen! Widgets zijn bijgewerkt.');
    setStep(4);
  };

  // Step content
  let content;
  if (step === 1) {
    content = (
      <div>
        <h2 className="text-2xl font-bold text-[#B6C948] mb-4">Stap 1: Bezittingen</h2>
        <p className="text-[#8BAE5A] mb-4">Wat is de huidige waarde van je portfolio en spaarrekening?</p>
        <div className="space-y-4 mb-6">
          {assets.map((asset, idx) => (
            <div key={asset.name} className="flex items-center gap-4">
              <span className="w-40 text-[#B6C948]">{asset.name}</span>
              <input
                type="number"
                className="rounded-lg bg-[#181F17] border border-[#3A4D23] px-3 py-2 text-[#B6C948] w-40"
                value={asset.value}
                min={0}
                onChange={e => handleAssetChange(idx, Number(e.target.value))}
              />
              <span className="text-[#8BAE5A]">EUR</span>
            </div>
          ))}
        </div>
      </div>
    );
  } else if (step === 2) {
    content = (
      <div>
        <h2 className="text-2xl font-bold text-[#B6C948] mb-4">Stap 2: Schulden</h2>
        <p className="text-[#8BAE5A] mb-4">Wat is de resterende stand van je hypotheek of leningen?</p>
        <div className="space-y-4 mb-6">
          {debts.map((debt, idx) => (
            <div key={debt.name} className="flex items-center gap-4">
              <span className="w-40 text-[#B6C948]">{debt.name}</span>
              <input
                type="number"
                className="rounded-lg bg-[#181F17] border border-[#3A4D23] px-3 py-2 text-[#B6C948] w-40"
                value={debt.value}
                min={0}
                onChange={e => handleDebtChange(idx, Number(e.target.value))}
              />
              <span className="text-[#8BAE5A]">EUR</span>
            </div>
          ))}
        </div>
      </div>
    );
  } else if (step === 3) {
    content = (
      <div>
        <h2 className="text-2xl font-bold text-[#B6C948] mb-4">Stap 3: Inkomen & Sparen</h2>
        <p className="text-[#8BAE5A] mb-4">Wat was je netto inkomen en hoeveel heb je gespaard?</p>
        <div className="flex items-center gap-4 mb-4">
          <span className="w-40 text-[#B6C948]">Netto inkomen</span>
          <input
            type="number"
            className="rounded-lg bg-[#181F17] border border-[#3A4D23] px-3 py-2 text-[#B6C948] w-40"
            value={income}
            min={0}
            onChange={e => setIncome(Number(e.target.value))}
          />
          <span className="text-[#8BAE5A]">EUR</span>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <span className="w-40 text-[#B6C948]">Gespaard</span>
          <input
            type="number"
            className="rounded-lg bg-[#181F17] border border-[#3A4D23] px-3 py-2 text-[#B6C948] w-40"
            value={savings}
            min={0}
            onChange={e => setSavings(Number(e.target.value))}
          />
          <span className="text-[#8BAE5A]">EUR</span>
        </div>
        <div className="text-[#8BAE5A] font-semibold">Spaarquote: {income > 0 ? Math.round((savings / income) * 100) : 0}%</div>
      </div>
    );
  } else {
    // Overzicht stap
    content = (
      <div>
        <h2 className="text-2xl font-bold text-[#B6C948] mb-4">Check-in Overzicht</h2>
        <div className="mb-4">
          <div className="font-bold text-[#B6C948] mb-2">Bezittingen:</div>
          {assets.map(a => (
            <div key={a.name} className="text-[#8BAE5A]">{a.name}: €{a.value.toLocaleString()}</div>
          ))}
        </div>
        <div className="mb-4">
          <div className="font-bold text-[#B6C948] mb-2">Schulden:</div>
          {debts.map(d => (
            <div key={d.name} className="text-[#8BAE5A]">{d.name}: €{d.value.toLocaleString()}</div>
          ))}
        </div>
        <div className="mb-4">
          <div className="font-bold text-[#B6C948] mb-2">Inkomen & Sparen:</div>
          <div className="text-[#8BAE5A]">Netto inkomen: €{income.toLocaleString()}</div>
          <div className="text-[#8BAE5A]">Gespaard: €{savings.toLocaleString()}</div>
          <div className="text-[#8BAE5A]">Spaarquote: {income > 0 ? Math.round((savings / income) * 100) : 0}%</div>
        </div>
        <div className="text-[#B6C948] font-bold">Check-in voltooid! 🎉</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-[#B6C948] mb-6">Maandelijkse Financiële Check-in</h1>
      <div className="bg-[#232D1A] rounded-2xl shadow-xl p-8 border border-[#3A4D23] mb-8">
        {content}
        <div className="flex gap-4 mt-8">
          {step > 1 && step <= 3 && (
            <button
              className="px-6 py-2 rounded-xl bg-[#181F17] text-[#B6C948] border border-[#3A4D23] font-semibold hover:bg-[#2A341F]"
              onClick={() => setStep(step - 1)}
            >
              Vorige
            </button>
          )}
          {step < 4 && (
            <button
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-[#181F17] font-bold shadow hover:from-[#B6C948] hover:to-[#8BAE5A] border border-[#8BAE5A]"
              onClick={() => (step === 3 ? handleFinish() : setStep(step + 1))}
            >
              {step === 3 ? 'Afronden' : 'Volgende'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 