import React from "react";

const plans = [
  {
    key: "balanced",
    title: "Gebalanceerd Dieet",
    description: "Voor optimale gezondheid en energie. Mix van alle voedingsgroepen.",
    emoji: "🥗",
  },
  {
    key: "lowcarb",
    title: "Koolhydraatarm",
    description: "Focus op eiwitten en vetten, minder koolhydraten.",
    emoji: "🥑",
  },
  {
    key: "vegetarian",
    title: "Vegetarisch",
    description: "Volledig plantaardig, rijk aan groenten en peulvruchten.",
    emoji: "🌱",
  },
  {
    key: "highprotein",
    title: "High Protein",
    description: "Extra veel eiwitten voor spieropbouw en herstel.",
    emoji: "🍗",
  },
  {
    key: "carnivore",
    title: "Carnivoor Dieet",
    description: "Dierlijke producten, focus op vlees, vis en eieren.",
    emoji: "🥩",
  },
];

interface PlanLibraryProps {
  onSelect: (slug: string) => void;
}

export default function PlanLibrary({ onSelect }: PlanLibraryProps) {
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-[#8BAE5A] mb-6">Stap 2: Kies jouw voedingsplan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map(plan => (
          <div key={plan.key} className="bg-[#232D1A] rounded-2xl p-6 shadow-xl border border-[#8BAE5A]/40 flex flex-col gap-4 items-start">
            <div className="text-4xl">{plan.emoji}</div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{plan.title}</h3>
              <p className="text-[#A3AED6] mb-2">{plan.description}</p>
            </div>
            <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold shadow hover:from-[#FFD700] hover:to-[#8BAE5A] transition-all" onClick={() => onSelect(plan.key)}>
              Bekijk plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 