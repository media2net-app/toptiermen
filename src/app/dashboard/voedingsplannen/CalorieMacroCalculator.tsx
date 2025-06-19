import React, { useState, createContext, useContext } from "react";

const activityLevels = [
  { label: "Zittend werk", value: 1.2 },
  { label: "Licht actief", value: 1.375 },
  { label: "Actief", value: 1.55 },
  { label: "Zeer actief", value: 1.725 },
];

const goals = [
  { label: "Vet verliezen (Cut)", value: "cut" },
  { label: "Op gewicht blijven (Onderhoud)", value: "maintain" },
  { label: "Spier opbouwen (Bulk)", value: "bulk" },
];

export interface MacroResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const CalorieMacroContext = createContext<MacroResult | null>(null);
export function useCalorieMacro() {
  return useContext(CalorieMacroContext);
}

export default function CalorieMacroCalculator({ children }: { children?: React.ReactNode }) {
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState(25);
  const [height, setHeight] = useState(180);
  const [weight, setWeight] = useState(75);
  const [activity, setActivity] = useState(activityLevels[0].value);
  const [goal, setGoal] = useState(goals[0].value);
  const [result, setResult] = useState<MacroResult | null>(null);

  function calculate() {
    // BMR berekening (Mifflin-St Jeor)
    let bmr = gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
    let calories = bmr * activity;
    if (goal === "cut") calories -= 400;
    if (goal === "bulk") calories += 300;
    // Macroverdeling: 1.8g eiwit/kg, 1g vet/kg, rest koolhydraten
    const protein = Math.round(weight * 1.8);
    const fat = Math.round(weight * 1);
    const proteinKcal = protein * 4;
    const fatKcal = fat * 9;
    const carbs = Math.round((calories - proteinKcal - fatKcal) / 4);
    setResult({
      calories: Math.round(calories),
      protein,
      carbs,
      fat,
    });
  }

  return (
    <CalorieMacroContext.Provider value={result}>
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#8BAE5A] mb-4">Calorie- & Macrocalculator</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[#A3AED6] text-sm mb-1.5">Geslacht</label>
            <select 
              value={gender} 
              onChange={e => setGender(e.target.value)} 
              className="w-full p-3 rounded-lg bg-[#181F17] text-white border border-[#3A4D23] focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] transition-colors text-base"
            >
              <option value="male">Man</option>
              <option value="female">Vrouw</option>
            </select>
          </div>
          <div>
            <label className="block text-[#A3AED6] text-sm mb-1.5">Leeftijd</label>
            <input 
              type="number" 
              value={age} 
              onChange={e => setAge(Number(e.target.value))} 
              className="w-full p-3 rounded-lg bg-[#181F17] text-white border border-[#3A4D23] focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] transition-colors text-base"
              min="16"
              max="100"
            />
          </div>
          <div>
            <label className="block text-[#A3AED6] text-sm mb-1.5">Lengte (cm)</label>
            <input 
              type="number" 
              value={height} 
              onChange={e => setHeight(Number(e.target.value))} 
              className="w-full p-3 rounded-lg bg-[#181F17] text-white border border-[#3A4D23] focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] transition-colors text-base"
              min="140"
              max="220"
            />
          </div>
          <div>
            <label className="block text-[#A3AED6] text-sm mb-1.5">Gewicht (kg)</label>
            <input 
              type="number" 
              value={weight} 
              onChange={e => setWeight(Number(e.target.value))} 
              className="w-full p-3 rounded-lg bg-[#181F17] text-white border border-[#3A4D23] focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] transition-colors text-base"
              min="40"
              max="200"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[#A3AED6] text-sm mb-1.5">Activiteitsniveau</label>
            <select 
              value={activity} 
              onChange={e => setActivity(Number(e.target.value))} 
              className="w-full p-3 rounded-lg bg-[#181F17] text-white border border-[#3A4D23] focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] transition-colors text-base"
            >
              {activityLevels.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[#A3AED6] text-sm mb-2">Doel</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {goals.map(g => (
                <label 
                  key={g.value} 
                  className={`flex items-center justify-center gap-2 text-[#8BAE5A] p-3 rounded-lg border ${
                    goal === g.value 
                      ? 'bg-[#3A4D23] border-[#8BAE5A]' 
                      : 'bg-[#181F17] border-[#3A4D23] hover:border-[#8BAE5A]'
                  } transition-colors cursor-pointer touch-manipulation`}
                >
                  <input 
                    type="radio" 
                    name="goal" 
                    value={g.value} 
                    checked={goal === g.value} 
                    onChange={e => setGoal(e.target.value)}
                    className="hidden" 
                  />
                  <span className="text-center text-sm sm:text-base">{g.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <button 
          onClick={calculate} 
          className="w-full py-3 sm:py-4 mt-4 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] text-lg font-bold shadow-lg hover:from-[#FFD700] hover:to-[#8BAE5A] transition-all active:scale-95 touch-manipulation"
        >
          Bereken mijn behoefte
        </button>
        {result && (
          <div className="mt-6 sm:mt-8 bg-[#181F17] rounded-xl p-4 sm:p-6 text-center border border-[#3A4D23]/40">
            <h3 className="text-lg sm:text-xl font-bold text-[#FFD700] mb-2">Jouw Dagelijkse Calorie-inname</h3>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-4">{result.calories} kcal</div>
            <div className="grid grid-cols-3 gap-2 sm:gap-8">
              <div className="bg-[#232D1A]/60 rounded-lg p-2 sm:p-3">
                <div className="text-[#8BAE5A] text-sm sm:text-lg font-bold">Eiwitten</div>
                <div className="text-white text-lg sm:text-2xl font-semibold">{result.protein}g</div>
              </div>
              <div className="bg-[#232D1A]/60 rounded-lg p-2 sm:p-3">
                <div className="text-[#8BAE5A] text-sm sm:text-lg font-bold">Koolhydraten</div>
                <div className="text-white text-lg sm:text-2xl font-semibold">{result.carbs}g</div>
              </div>
              <div className="bg-[#232D1A]/60 rounded-lg p-2 sm:p-3">
                <div className="text-[#8BAE5A] text-sm sm:text-lg font-bold">Vetten</div>
                <div className="text-white text-lg sm:text-2xl font-semibold">{result.fat}g</div>
              </div>
            </div>
          </div>
        )}
        {children}
      </div>
    </CalorieMacroContext.Provider>
  );
} 