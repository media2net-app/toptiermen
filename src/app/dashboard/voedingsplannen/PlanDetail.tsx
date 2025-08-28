import React from "react";
import { useCalorieMacro } from "./CalorieMacroCalculator";
import { calculateMacrosFromIngredients } from "@/lib/nutrition-utils";

interface PlanDetailProps {
  slug: string;
  onBack: () => void;
}

const planData: Record<string, { title: string; meals: { time: string; name: string; main: string; options: string[]; ingredients: { name: string; amount: number; unit: string }[] }[] }> = {
  carnivoor_animal_based: {
    title: "Carnivoor / Animal Based",
    meals: [
      { 
        time: "08:00", 
        name: "Ontbijt", 
        main: "Orgaanvlees & Eieren Ontbijt", 
        options: ["Gebakken eieren met spek", "Ribeye steak"],
        ingredients: [
          { name: "Runderlever", amount: 100, unit: "g" },
          { name: "Runderhart", amount: 50, unit: "g" },
          { name: "Eieren", amount: 3, unit: "stuks" },
          { name: "Roomboter", amount: 25, unit: "g" },
          { name: "Honing", amount: 10, unit: "g" },
          { name: "Zout", amount: 5, unit: "g" }
        ]
      },
      { 
        time: "10:30", 
        name: "Snack 1", 
        main: "Gerookte Zalm met Boter", 
        options: ["Droge worst", "Goudse kaas"],
        ingredients: [
          { name: "Gerookte Zalm", amount: 120, unit: "g" },
          { name: "Roomboter", amount: 15, unit: "g" },
          { name: "Zout", amount: 2, unit: "g" }
        ]
      },
      { 
        time: "13:00", 
        name: "Lunch", 
        main: "Ribeye Steak met Boter", 
        options: ["T-Bone Steak", "Entrecote"],
        ingredients: [
          { name: "Ribeye Steak", amount: 250, unit: "g" },
          { name: "Roomboter", amount: 30, unit: "g" },
          { name: "Talow", amount: 10, unit: "g" },
          { name: "Zout", amount: 5, unit: "g" }
        ]
      },
      { 
        time: "15:30", 
        name: "Snack 2", 
        main: "Eieren met Spek", 
        options: ["Griekse yoghurt", "Droge worst"],
        ingredients: [
          { name: "Eieren", amount: 2, unit: "stuks" },
          { name: "Spek", amount: 40, unit: "g" },
          { name: "Roomboter", amount: 10, unit: "g" }
        ]
      },
      { 
        time: "19:00", 
        name: "Diner", 
        main: "Lamskotelet met Orgaanvlees", 
        options: ["Gans met eendenborst", "T-Bone Steak"],
        ingredients: [
          { name: "Lamskotelet", amount: 200, unit: "g" },
          { name: "Kippenlever", amount: 50, unit: "g" },
          { name: "Roomboter", amount: 20, unit: "g" },
          { name: "Honing", amount: 15, unit: "g" },
          { name: "Zout", amount: 5, unit: "g" }
        ]
      },
    ],
  },
  voedingsplan_op_maat: {
    title: "Voedingsplan op Maat",
    meals: [
      { 
        time: "08:00", 
        name: "Ontbijt", 
        main: "Flexibel Ontbijt", 
        options: ["Havermout met fruit", "Eieren met toast", "Griekse yoghurt"],
        ingredients: [
          { name: "Havermout", amount: 60, unit: "g" },
          { name: "Melk", amount: 250, unit: "ml" },
          { name: "Bessen", amount: 50, unit: "g" },
          { name: "Noten", amount: 15, unit: "g" },
          { name: "Honing", amount: 10, unit: "g" }
        ]
      },
      { 
        time: "12:30", 
        name: "Lunch", 
        main: "Flexibele Lunch", 
        options: ["Kipfilet met rijst", "Zalm met groenten", "Vegetarische optie"],
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
        main: "Flexibele Snack", 
        options: ["Fruit met noten", "Griekse yoghurt", "Proteïne reep"],
        ingredients: [
          { name: "Griekse yoghurt", amount: 150, unit: "g" },
          { name: "Bessen", amount: 50, unit: "g" },
          { name: "Honing", amount: 15, unit: "g" }
        ]
      },
      { 
        time: "18:30", 
        name: "Diner", 
        main: "Flexibel Diner", 
        options: ["Zalm met zoete aardappel", "Rundergehakt met pasta", "Vegetarische curry"],
        ingredients: [
          { name: "Zalm", amount: 150, unit: "g" },
          { name: "Zoete aardappel", amount: 200, unit: "g" },
          { name: "Spinazie", amount: 100, unit: "g" },
          { name: "Olijfolie", amount: 15, unit: "ml" }
        ]
      },
    ],
  },
  keto_optimalisatie: {
    title: "Keto Optimalisatie",
    meals: [
      { 
        time: "08:00", 
        name: "Ontbijt", 
        main: "Keto Omelet met Avocado", 
        options: ["Bulletproof koffie", "Griekse yoghurt met noten"],
        ingredients: [
          { name: "Eieren", amount: 3, unit: "stuks" },
          { name: "Avocado", amount: 1, unit: "stuks" },
          { name: "Roomboter", amount: 20, unit: "g" },
          { name: "Spek", amount: 30, unit: "g" },
          { name: "Kaas", amount: 30, unit: "g" }
        ]
      },
      { 
        time: "12:30", 
        name: "Lunch", 
        main: "Keto Salade met Vette Vis", 
        options: ["Kipfilet met avocado", "Biefstuk met boter"],
        ingredients: [
          { name: "Zalm", amount: 150, unit: "g" },
          { name: "Avocado", amount: 1, unit: "stuks" },
          { name: "Olijven", amount: 50, unit: "g" },
          { name: "Olijfolie", amount: 15, unit: "ml" },
          { name: "Noten", amount: 20, unit: "g" }
        ]
      },
      { 
        time: "15:30", 
        name: "Snack", 
        main: "Keto Snack", 
        options: ["Handje noten", "Kaasblokjes", "Olijven"],
        ingredients: [
          { name: "Amandelen", amount: 30, unit: "g" },
          { name: "Goudse kaas", amount: 40, unit: "g" },
          { name: "Olijven", amount: 30, unit: "g" }
        ]
      },
      { 
        time: "18:30", 
        name: "Diner", 
        main: "Keto Biefstuk met Groenten", 
        options: ["Kipfilet met broccoli", "Zalm met spinazie"],
        ingredients: [
          { name: "Biefstuk", amount: 200, unit: "g" },
          { name: "Broccoli", amount: 150, unit: "g" },
          { name: "Roomboter", amount: 25, unit: "g" },
          { name: "Olijfolie", amount: 10, unit: "ml" }
        ]
      },
    ],
  },


};

export default function PlanDetail({ slug, onBack }: PlanDetailProps) {
  const plan = planData[slug] || planData["carnivoor_animal_based"];
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