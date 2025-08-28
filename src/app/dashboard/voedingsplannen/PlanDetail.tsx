import React from "react";
import { useCalorieMacro } from "./CalorieMacroCalculator";
import { calculateMacrosFromIngredients } from "@/lib/nutrition-utils";

interface PlanDetailProps {
  slug: string;
  onBack: () => void;
}

const planData: Record<string, { title: string; meals: { time: string; name: string; main: string; options: string[]; ingredients: { name: string; amount: number; unit: string }[] }[] }> = {
  // CARNIVOOR PLANNEN
  carnivoor_droogtrainen: {
    title: "Carnivoor Droogtrainen",
    meals: [
      { 
        time: "08:00", 
        name: "Ontbijt", 
        main: "Orgaanvlees & Eieren Ontbijt", 
        options: ["Gebakken eieren met spek", "Ribeye steak"],
        ingredients: [
          { name: "Runderlever", amount: 80, unit: "g" },
          { name: "Runderhart", amount: 40, unit: "g" },
          { name: "Eieren", amount: 3, unit: "stuks" },
          { name: "Roomboter", amount: 20, unit: "g" },
          { name: "Zout", amount: 5, unit: "g" }
        ]
      },
      { 
        time: "10:30", 
        name: "Snack 1", 
        main: "Gerookte Zalm", 
        options: ["Droge worst", "Goudse kaas"],
        ingredients: [
          { name: "Gerookte Zalm", amount: 100, unit: "g" },
          { name: "Roomboter", amount: 10, unit: "g" },
          { name: "Zout", amount: 2, unit: "g" }
        ]
      },
      { 
        time: "13:00", 
        name: "Lunch", 
        main: "Ribeye Steak", 
        options: ["T-Bone Steak", "Entrecote"],
        ingredients: [
          { name: "Ribeye Steak", amount: 200, unit: "g" },
          { name: "Roomboter", amount: 25, unit: "g" },
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
          { name: "Spek", amount: 30, unit: "g" },
          { name: "Roomboter", amount: 8, unit: "g" }
        ]
      },
      { 
        time: "19:00", 
        name: "Diner", 
        main: "Lamskotelet", 
        options: ["Gans", "T-Bone Steak"],
        ingredients: [
          { name: "Lamskotelet", amount: 180, unit: "g" },
          { name: "Kippenlever", amount: 40, unit: "g" },
          { name: "Roomboter", amount: 15, unit: "g" },
          { name: "Zout", amount: 5, unit: "g" }
        ]
      },
    ],
  },
  carnivoor_spiermassa: {
    title: "Carnivoor Spiermassa",
    meals: [
      { 
        time: "08:00", 
        name: "Ontbijt", 
        main: "Orgaanvlees & Eieren Ontbijt", 
        options: ["Gebakken eieren met spek", "Ribeye steak"],
        ingredients: [
          { name: "Runderlever", amount: 120, unit: "g" },
          { name: "Runderhart", amount: 60, unit: "g" },
          { name: "Eieren", amount: 4, unit: "stuks" },
          { name: "Roomboter", amount: 30, unit: "g" },
          { name: "Honing", amount: 15, unit: "g" },
          { name: "Zout", amount: 5, unit: "g" }
        ]
      },
      { 
        time: "10:30", 
        name: "Snack 1", 
        main: "Gerookte Zalm met Boter", 
        options: ["Droge worst", "Goudse kaas"],
        ingredients: [
          { name: "Gerookte Zalm", amount: 150, unit: "g" },
          { name: "Roomboter", amount: 20, unit: "g" },
          { name: "Zout", amount: 2, unit: "g" }
        ]
      },
      { 
        time: "13:00", 
        name: "Lunch", 
        main: "Ribeye Steak met Boter", 
        options: ["T-Bone Steak", "Entrecote"],
        ingredients: [
          { name: "Ribeye Steak", amount: 300, unit: "g" },
          { name: "Roomboter", amount: 35, unit: "g" },
          { name: "Talow", amount: 15, unit: "g" },
          { name: "Zout", amount: 5, unit: "g" }
        ]
      },
      { 
        time: "15:30", 
        name: "Snack 2", 
        main: "Eieren met Spek", 
        options: ["Griekse yoghurt", "Droge worst"],
        ingredients: [
          { name: "Eieren", amount: 3, unit: "stuks" },
          { name: "Spek", amount: 50, unit: "g" },
          { name: "Roomboter", amount: 12, unit: "g" }
        ]
      },
      { 
        time: "19:00", 
        name: "Diner", 
        main: "Lamskotelet met Orgaanvlees", 
        options: ["Gans met eendenborst", "T-Bone Steak"],
        ingredients: [
          { name: "Lamskotelet", amount: 250, unit: "g" },
          { name: "Kippenlever", amount: 60, unit: "g" },
          { name: "Roomboter", amount: 25, unit: "g" },
          { name: "Honing", amount: 20, unit: "g" },
          { name: "Zout", amount: 5, unit: "g" }
        ]
      },
    ],
  },
  carnivoor_onderhoud: {
    title: "Carnivoor Onderhoud",
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
  // VOEDINGSPLANNEN OP MAAT
  op_maat_droogtrainen: {
    title: "Voedingsplan op Maat - Droogtrainen",
    meals: [
      { 
        time: "08:00", 
        name: "Ontbijt", 
        main: "Eiwitrijk Ontbijt", 
        options: ["Havermout met eiwit", "Eieren met toast", "Griekse yoghurt"],
        ingredients: [
          { name: "Havermout", amount: 50, unit: "g" },
          { name: "Eiwitpoeder", amount: 30, unit: "g" },
          { name: "Melk", amount: 200, unit: "ml" },
          { name: "Bessen", amount: 30, unit: "g" },
          { name: "Noten", amount: 10, unit: "g" }
        ]
      },
      { 
        time: "12:30", 
        name: "Lunch", 
        main: "Mager Eiwit Lunch", 
        options: ["Kipfilet met groenten", "Zalm met quinoa", "Tofu salade"],
        ingredients: [
          { name: "Kipfilet", amount: 180, unit: "g" },
          { name: "Quinoa", amount: 80, unit: "g" },
          { name: "Broccoli", amount: 100, unit: "g" },
          { name: "Olijfolie", amount: 10, unit: "ml" }
        ]
      },
      { 
        time: "15:30", 
        name: "Snack", 
        main: "Eiwitrijke Snack", 
        options: ["Griekse yoghurt", "Proteïne reep", "Noten"],
        ingredients: [
          { name: "Griekse yoghurt", amount: 150, unit: "g" },
          { name: "Bessen", amount: 30, unit: "g" },
          { name: "Noten", amount: 15, unit: "g" }
        ]
      },
      { 
        time: "18:30", 
        name: "Diner", 
        main: "Mager Eiwit Diner", 
        options: ["Zalm met groenten", "Kipfilet met rijst", "Tofu curry"],
        ingredients: [
          { name: "Zalm", amount: 150, unit: "g" },
          { name: "Zoete aardappel", amount: 100, unit: "g" },
          { name: "Spinazie", amount: 100, unit: "g" },
          { name: "Olijfolie", amount: 10, unit: "ml" }
        ]
      },
    ],
  },
  op_maat_spiermassa: {
    title: "Voedingsplan op Maat - Spiermassa",
    meals: [
      { 
        time: "08:00", 
        name: "Ontbijt", 
        main: "Eiwitrijk Ontbijt", 
        options: ["Havermout met eiwit", "Eieren met toast", "Griekse yoghurt"],
        ingredients: [
          { name: "Havermout", amount: 80, unit: "g" },
          { name: "Eiwitpoeder", amount: 30, unit: "g" },
          { name: "Melk", amount: 250, unit: "ml" },
          { name: "Bessen", amount: 50, unit: "g" },
          { name: "Noten", amount: 20, unit: "g" },
          { name: "Honing", amount: 15, unit: "g" }
        ]
      },
      { 
        time: "12:30", 
        name: "Lunch", 
        main: "Eiwitrijke Lunch", 
        options: ["Kipfilet met rijst", "Zalm met quinoa", "Rundergehakt pasta"],
        ingredients: [
          { name: "Kipfilet", amount: 200, unit: "g" },
          { name: "Bruine rijst", amount: 120, unit: "g" },
          { name: "Broccoli", amount: 100, unit: "g" },
          { name: "Olijfolie", amount: 15, unit: "ml" }
        ]
      },
      { 
        time: "15:30", 
        name: "Snack", 
        main: "Eiwitrijke Snack", 
        options: ["Griekse yoghurt", "Proteïne reep", "Noten"],
        ingredients: [
          { name: "Griekse yoghurt", amount: 200, unit: "g" },
          { name: "Bessen", amount: 50, unit: "g" },
          { name: "Noten", amount: 25, unit: "g" },
          { name: "Honing", amount: 15, unit: "g" }
        ]
      },
      { 
        time: "18:30", 
        name: "Diner", 
        main: "Eiwitrijk Diner", 
        options: ["Zalm met zoete aardappel", "Rundergehakt met pasta", "Kipfilet curry"],
        ingredients: [
          { name: "Zalm", amount: 200, unit: "g" },
          { name: "Zoete aardappel", amount: 150, unit: "g" },
          { name: "Spinazie", amount: 100, unit: "g" },
          { name: "Olijfolie", amount: 15, unit: "ml" }
        ]
      },
    ],
  },
  op_maat_onderhoud: {
    title: "Voedingsplan op Maat - Onderhoud",
    meals: [
      { 
        time: "08:00", 
        name: "Ontbijt", 
        main: "Gebalanceerd Ontbijt", 
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
        main: "Gebalanceerde Lunch", 
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
        main: "Gezonde Snack", 
        options: ["Fruit met noten", "Griekse yoghurt", "Proteïne reep"],
        ingredients: [
          { name: "Griekse yoghurt", amount: 150, unit: "g" },
          { name: "Bessen", amount: 50, unit: "g" },
          { name: "Noten", amount: 15, unit: "g" },
          { name: "Honing", amount: 10, unit: "g" }
        ]
      },
      { 
        time: "18:30", 
        name: "Diner", 
        main: "Gebalanceerd Diner", 
        options: ["Zalm met zoete aardappel", "Rundergehakt met pasta", "Vegetarische curry"],
        ingredients: [
          { name: "Zalm", amount: 150, unit: "g" },
          { name: "Zoete aardappel", amount: 120, unit: "g" },
          { name: "Spinazie", amount: 100, unit: "g" },
          { name: "Olijfolie", amount: 12, unit: "ml" }
        ]
      },
    ],
  },
};

export default function PlanDetail({ slug, onBack }: PlanDetailProps) {
  const plan = planData[slug] || planData["carnivoor_droogtrainen"];
  const { totalCalories, totalProtein, totalCarbs, totalFat } = useCalorieMacro();

  return (
    <div className="min-h-screen bg-[#181F17] text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-[#B6C948] hover:text-white transition-colors mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Terug naar Voedingsplannen
          </button>
          
          <h1 className="text-3xl font-bold text-[#B6C948] mb-2">{plan.title}</h1>
          <p className="text-[#8BAE5A] text-lg">
            Een compleet voedingsplan met dagelijkse maaltijden en voedingswaarden
          </p>
        </div>

        {/* Macro Overview */}
        <div className="bg-[#232D1A] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-[#B6C948] mb-4">Dagelijkse Voedingswaarden</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#B6C948]">{totalCalories}</div>
              <div className="text-[#8BAE5A] text-sm">Calorieën</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#B6C948]">{totalProtein}g</div>
              <div className="text-[#8BAE5A] text-sm">Eiwitten</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#B6C948]">{totalCarbs}g</div>
              <div className="text-[#8BAE5A] text-sm">Koolhydraten</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#B6C948]">{totalFat}g</div>
              <div className="text-[#8BAE5A] text-sm">Vetten</div>
            </div>
          </div>
        </div>

        {/* Daily Meals */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-[#B6C948] mb-6">Dagelijkse Maaltijden</h2>
          
          {plan.meals.map((meal, index) => (
            <div key={index} className="bg-[#232D1A] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-[#B6C948]">{meal.name}</h3>
                  <p className="text-[#8BAE5A] text-sm">{meal.time}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-white">{meal.main}</div>
                </div>
              </div>

              {/* Alternatives */}
              <div className="mb-4">
                <h4 className="text-[#B6C948] font-medium mb-2">Alternatieven:</h4>
                <div className="flex flex-wrap gap-2">
                  {meal.options.map((option, optionIndex) => (
                    <span
                      key={optionIndex}
                      className="px-3 py-1 bg-[#3A4D23] text-[#8BAE5A] rounded-full text-sm"
                    >
                      {option}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <h4 className="text-[#B6C948] font-medium mb-2">Ingrediënten:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {meal.ingredients.map((ingredient, ingredientIndex) => (
                    <div
                      key={ingredientIndex}
                      className="flex justify-between items-center py-2 px-3 bg-[#181F17] rounded-lg"
                    >
                      <span className="text-[#8BAE5A]">{ingredient.name}</span>
                      <span className="text-[#B6C948] font-medium">
                        {ingredient.amount} {ingredient.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-[#232D1A] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-[#B6C948] mb-4">Tips voor Succes</h2>
          <ul className="space-y-2 text-[#8BAE5A]">
            <li>• Plan je maaltijden vooruit en bereid ze voor</li>
            <li>• Houd je aan de portiegroottes voor optimale resultaten</li>
            <li>• Drink voldoende water gedurende de dag</li>
            <li>• Pas het plan aan aan je persoonlijke voorkeuren</li>
            <li>• Combineer met regelmatige lichaamsbeweging</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 