import React from "react";
import { useCalorieMacro } from "./CalorieMacroCalculator";
import { calculateMacrosFromIngredients } from "@/lib/nutrition-utils";

interface PlanDetailProps {
  slug: string;
  onBack: () => void;
}

const planData: Record<string, { title: string; meals: { time: string; name: string; main: string; options: string[]; ingredients: { name: string; amount: number; unit: string }[] }[] }> = {
  balanced: {
    title: "Gebalanceerd Dieet",
    meals: [
      { 
        time: "08:00", 
        name: "Ontbijt", 
        main: "Havermout met fruit en noten", 
        options: ["Griekse yoghurt met muesli", "Volkoren boterham met pindakaas"],
        ingredients: [
          { name: "Havermout", amount: 60, unit: "g" },
          { name: "Melk (halfvolle)", amount: 250, unit: "ml" },
          { name: "Blauwe bessen", amount: 50, unit: "g" },
          { name: "Walnoten", amount: 15, unit: "g" },
          { name: "Honing", amount: 10, unit: "g" }
        ]
      },
      { 
        time: "12:30", 
        name: "Lunch", 
        main: "Kipfilet met rijst en broccoli", 
        options: ["Kabeljauw met aardappel en sperziebonen", "Tofu met quinoa en groenten"],
        ingredients: [
          { name: "Kipfilet", amount: 150, unit: "g" },
          { name: "Bruine rijst", amount: 100, unit: "g" },
          { name: "Broccoli", amount: 100, unit: "g" },
          { name: "Olijfolie", amount: 10, unit: "ml" }
        ]
      },
      { 
        time: "15:30", 
        name: "Snack", 
        main: "Griekse yoghurt met honing", 
        options: ["Handje noten", "Banaan"],
        ingredients: [
          { name: "Griekse yoghurt", amount: 150, unit: "g" },
          { name: "Honing", amount: 15, unit: "g" }
        ]
      },
      { 
        time: "18:30", 
        name: "Diner", 
        main: "Zalm met zoete aardappel en spinazie", 
        options: ["Rundergehakt met volkoren pasta en tomatensaus", "Vegetarische curry met kikkererwten"],
        ingredients: [
          { name: "Zalm", amount: 150, unit: "g" },
          { name: "Zoete aardappel", amount: 200, unit: "g" },
          { name: "Spinazie", amount: 100, unit: "g" },
          { name: "Olijfolie", amount: 15, unit: "ml" }
        ]
      },
    ],
  },
  lowcarb: {
    title: "Koolhydraatarm",
    meals: [
      { 
        time: "08:00", 
        name: "Ontbijt", 
        main: "Omelet met spinazie en kaas", 
        options: ["Griekse yoghurt met noten", "Kokoskwark met chiazaad"],
        ingredients: [
          { name: "Eieren", amount: 3, unit: "stuks" },
          { name: "Spinazie", amount: 50, unit: "g" },
          { name: "Feta", amount: 30, unit: "g" },
          { name: "Olijfolie", amount: 10, unit: "ml" }
        ]
      },
      { 
        time: "12:30", 
        name: "Lunch", 
        main: "Kipsalade met avocado", 
        options: ["Tonijnsalade", "Geitenkaas met walnoten"],
        ingredients: [
          { name: "Kipfilet", amount: 150, unit: "g" },
          { name: "Avocado", amount: 1, unit: "stuks" },
          { name: "Tomaat", amount: 1, unit: "stuks" },
          { name: "Komkommer", amount: 50, unit: "g" },
          { name: "Olijfolie", amount: 15, unit: "ml" }
        ]
      },
      { 
        time: "15:30", 
        name: "Snack", 
        main: "Komkommer met hummus", 
        options: ["Handje amandelen", "Olijven"],
        ingredients: [
          { name: "Komkommer", amount: 100, unit: "g" },
          { name: "Hummus", amount: 30, unit: "g" }
        ]
      },
      { 
        time: "18:30", 
        name: "Diner", 
        main: "Zalm met courgette en pesto", 
        options: ["Biefstuk met bloemkoolpuree", "Kipfilet met broccoli"],
        ingredients: [
          { name: "Zalm", amount: 150, unit: "g" },
          { name: "Courgette", amount: 200, unit: "g" },
          { name: "Pesto", amount: 20, unit: "g" },
          { name: "Olijfolie", amount: 10, unit: "ml" }
        ]
      },
    ],
  },
  vegetarian: {
    title: "Vegetarisch",
    meals: [
      { time: "08:00", name: "Ontbijt", main: "Sojayoghurt met muesli en bessen", options: ["Havermout met amandelmelk", "Smoothiebowl"] },
      { time: "12:30", name: "Lunch", main: "Falafel wrap met groenten", options: ["Linzensalade", "Gegrilde groente met hummus"] },
      { time: "15:30", name: "Snack", main: "Fruit met noten", options: ["Rijstwafels met pindakaas", "Snackgroenten"] },
      { time: "18:30", name: "Diner", main: "Vegetarische curry met kikkererwten", options: ["Tofu roerbak", "Vegetarische lasagne"] },
    ],
  },
  highprotein: {
    title: "High Protein",
    meals: [
      { time: "08:00", name: "Ontbijt", main: "Eiwitpannenkoeken met kwark", options: ["Proteïne shake met banaan", "Omelet met kipfilet"] },
      { time: "12:30", name: "Lunch", main: "Kipfilet met zoete aardappel en broccoli", options: ["Tonijn met quinoa", "Rundergehakt met bonen"] },
      { time: "15:30", name: "Snack", main: "Cottage cheese met ananas", options: ["Proteïne reep", "Griekse yoghurt"] },
      { time: "18:30", name: "Diner", main: "Zalmfilet met linzen en spinazie", options: ["Kipfilet met volkoren pasta", "Tofu met edamame"] },
    ],
  },
  carnivore: {
    title: "Carnivoor Dieet",
    meals: [
      { time: "08:00", name: "Ontbijt", main: "Ribeye steak", options: ["Gebakken eieren met spek", "Rundergehakt"] },
      { time: "12:30", name: "Lunch", main: "Kipfilet met roomboter", options: ["Zalmfilet", "Hamburger zonder brood"] },
      { time: "15:30", name: "Snack", main: "Gerookte zalm", options: ["Droge worst", "Kipreepjes"] },
      { time: "18:30", name: "Diner", main: "Lamskotelet", options: ["Entrecote", "Gebakken lever"] },
    ],
  },
};

export default function PlanDetail({ slug, onBack }: PlanDetailProps) {
  const plan = planData[slug] || planData["balanced"];
  const macro = useCalorieMacro();
  return (
    <div className="mt-8 bg-[#232D1A] rounded-2xl p-6 shadow-xl border border-[#8BAE5A]/40 max-w-2xl mx-auto">
      <button onClick={onBack} className="mb-4 px-4 py-2 rounded-xl bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23]/40 hover:bg-[#8BAE5A] hover:text-[#181F17] font-semibold transition-all">
        ← Terug naar overzicht
      </button>
      <h2 className="text-2xl font-bold text-[#8BAE5A] mb-4">{plan.title}</h2>
      <h3 className="text-xl font-bold text-[#FFD700] mb-4">Voorbeeld Dagindeling</h3>
      <div className="flex flex-col gap-6">
        {plan.meals.map((meal, idx) => {
          // Bereken werkelijke macro's op basis van ingrediënten
          let actualMacros: any = null;
          if (meal.ingredients) {
            actualMacros = calculateMacrosFromIngredients(meal.ingredients);
          }
          
          // Fallback naar percentage berekening als geen ingrediënten beschikbaar
          let portion: any = null;
          if (macro && !actualMacros) {
            const divider = meal.name === "Snack" ? 8 : 4;
            portion = {
              protein: Math.round(macro.protein / divider),
              carbs: Math.round(macro.carbs / divider),
              fat: Math.round(macro.fat / divider),
            };
          }
          return (
            <div key={idx} className="bg-[#181F17] rounded-xl p-4 border border-[#3A4D23]/40">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-[#FFD700] font-bold text-lg w-20">{meal.time}</span>
                <span className="text-white font-semibold text-lg">{meal.name}</span>
              </div>
              <div className="text-[#8BAE5A] mb-1">{meal.main}</div>
              <div className="text-[#A3AED6] text-sm mb-1">Variatie: {meal.options.join(", ")}</div>
              <div className="text-xs text-[#FFD700]">
                {actualMacros ? (
                  <div>
                    <div className="text-[#8BAE5A] font-semibold mb-1">Werkelijke Macro's:</div>
                    <div className="flex gap-4 mt-1">
                      <span className="text-white">Eiwit: <b>{actualMacros.protein}g</b></span>
                      <span className="text-white">Koolhydraten: <b>{actualMacros.carbs}g</b></span>
                      <span className="text-white">Vetten: <b>{actualMacros.fat}g</b></span>
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      {actualMacros.calories} kcal | {actualMacros.missingIngredients?.length > 0 && 
                        <span className="text-orange-400">⚠️ {actualMacros.missingIngredients.length} ingrediënt(en) ontbreken</span>
                      }
                    </div>
                  </div>
                ) : portion ? (
                  <div>
                    <div className="text-gray-400 font-semibold mb-1">Geschatte Macro's (percentage):</div>
                    <div className="flex gap-4 mt-1">
                      <span className="text-white">Eiwit: <b>{portion.protein}g</b></span>
                      <span className="text-white">Koolhydraten: <b>{portion.carbs}g</b></span>
                      <span className="text-white">Vetten: <b>{portion.fat}g</b></span>
                    </div>
                  </div>
                ) : (
                  <span className="text-white">(Vul eerst de calculator in)</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 