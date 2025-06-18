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
      <div className="bg-[#232D1A] rounded-2xl p-6 shadow-xl border border-[#8BAE5A]/40 max-w-xl mx-auto mt-8">
        <h2 className="text-2xl font-bold text-[#8BAE5A] mb-4">Calorie- & Macrocalculator</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[#A3AED6] mb-1">Geslacht</label>
            <select value={gender} onChange={e => setGender(e.target.value)} className="w-full p-2 rounded bg-[#181F17] text-white">
              <option value="male">Man</option>
              <option value="female">Vrouw</option>
            </select>
          </div>
          <div>
            <label className="block text-[#A3AED6] mb-1">Leeftijd</label>
            <input type="number" value={age} onChange={e => setAge(Number(e.target.value))} className="w-full p-2 rounded bg-[#181F17] text-white" />
          </div>
          <div>
            <label className="block text-[#A3AED6] mb-1">Lengte (cm)</label>
            <input type="number" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full p-2 rounded bg-[#181F17] text-white" />
          </div>
          <div>
            <label className="block text-[#A3AED6] mb-1">Gewicht (kg)</label>
            <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} className="w-full p-2 rounded bg-[#181F17] text-white" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[#A3AED6] mb-1">Activiteitsniveau</label>
            <select value={activity} onChange={e => setActivity(Number(e.target.value))} className="w-full p-2 rounded bg-[#181F17] text-white">
              {activityLevels.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-[#A3AED6] mb-1">Doel</label>
            <div className="flex gap-4 mt-1">
              {goals.map(g => (
                <label key={g.value} className="flex items-center gap-2 text-[#8BAE5A]">
                  <input type="radio" name="goal" value={g.value} checked={goal === g.value} onChange={e => setGoal(e.target.value)} />
                  {g.label}
                </label>
              ))}
            </div>
          </div>
        </div>
        <button onClick={calculate} className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] text-lg font-bold shadow-lg hover:from-[#FFD700] hover:to-[#8BAE5A] transition-all">
          Bereken mijn behoefte
        </button>
        {result && (
          <div className="mt-8 bg-[#181F17] rounded-xl p-6 text-center border border-[#3A4D23]/40">
            <h3 className="text-xl font-bold text-[#FFD700] mb-2">Jouw Dagelijkse Calorie-inname</h3>
            <div className="text-3xl font-bold text-white mb-4">{result.calories} kcal</div>
            <div className="flex justify-center gap-8 mb-2">
              <div>
                <div className="text-[#8BAE5A] text-lg font-bold">Eiwitten</div>
                <div className="text-white text-2xl">{result.protein}g</div>
              </div>
              <div>
                <div className="text-[#8BAE5A] text-lg font-bold">Koolhydraten</div>
                <div className="text-white text-2xl">{result.carbs}g</div>
              </div>
              <div>
                <div className="text-[#8BAE5A] text-lg font-bold">Vetten</div>
                <div className="text-white text-2xl">{result.fat}g</div>
              </div>
            </div>
          </div>
        )}
        {children}
      </div>
    </CalorieMacroContext.Provider>
  );
} 