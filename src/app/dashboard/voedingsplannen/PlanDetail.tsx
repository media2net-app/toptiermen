import React from "react";
import { useCalorieMacro } from "./CalorieMacroCalculator";

interface PlanDetailProps {
  slug: string;
  onBack: () => void;
}

const planData: Record<string, { title: string; meals: { time: string; name: string; main: string; options: string[] }[] }> = {
  balanced: {
    title: "Gebalanceerd Dieet",
    meals: [
      { time: "08:00", name: "Ontbijt", main: "Havermout met fruit en noten", options: ["Griekse yoghurt met muesli", "Volkoren boterham met pindakaas"] },
      { time: "12:30", name: "Lunch", main: "Kipfilet met rijst en broccoli", options: ["Kabeljauw met aardappel en sperziebonen", "Tofu met quinoa en groenten"] },
      { time: "15:30", name: "Snack", main: "Griekse yoghurt met honing", options: ["Handje noten", "Banaan"] },
      { time: "18:30", name: "Diner", main: "Zalm met zoete aardappel en spinazie", options: ["Rundergehakt met volkoren pasta en tomatensaus", "Vegetarische curry met kikkererwten"] },
    ],
  },
  lowcarb: {
    title: "Koolhydraatarm",
    meals: [
      { time: "08:00", name: "Ontbijt", main: "Omelet met spinazie en kaas", options: ["Griekse yoghurt met noten", "Kokoskwark met chiazaad"] },
      { time: "12:30", name: "Lunch", main: "Kipsalade met avocado", options: ["Tonijnsalade", "Geitenkaas met walnoten"] },
      { time: "15:30", name: "Snack", main: "Komkommer met hummus", options: ["Handje amandelen", "Olijven"] },
      { time: "18:30", name: "Diner", main: "Zalm met courgette en pesto", options: ["Biefstuk met bloemkoolpuree", "Kipfilet met broccoli"] },
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
          // Simpele portieberekening: hoofdmaaltijd = 1/4, snack = 1/8 van dagtotaal
          let portion: any = null;
          if (macro) {
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
              <div className="text-xs text-[#FFD700]">Portiegids:
                {portion ? (
                  <div className="flex gap-4 mt-1">
                    <span className="text-white">Eiwit: <b>{portion.protein}g</b></span>
                    <span className="text-white">Koolhydraten: <b>{portion.carbs}g</b></span>
                    <span className="text-white">Vetten: <b>{portion.fat}g</b></span>
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