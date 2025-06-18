'use client';
import React from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import CalorieMacroCalculator from "./CalorieMacroCalculator";
import PlanLibrary from "./PlanLibrary";
import { CalorieMacroContext, MacroResult } from "./CalorieMacroCalculator";

const PlanDetail = dynamic(() => import("./PlanDetail"));

export default function VoedingsplannenPage() {
  const [selectedPlan, setSelectedPlan] = React.useState<string | null>(null);
  const [showCalculator, setShowCalculator] = React.useState(false);
  const router = useRouter();

  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="bg-[#232D1A]/90 rounded-2xl p-6 shadow-xl border border-[#8BAE5A]/40">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Het Recept: Jouw Persoonlijke Voedingscoach</h1>
        <p className="text-[#A3AED6] text-lg mb-4">
          Volg deze stapsgewijze gids en ontdek jouw ideale voedingsplan. Start met de calorie- en macrocalculator, kies een flexibel plan, ontdek recepten en houd je voortgang bij!
        </p>
        <div className="flex flex-col items-center gap-4 mt-6">
          <span className="text-xl font-semibold text-[#8BAE5A]">Stap 1: Bereken jouw calorie- en macrobehoefte</span>
          {!showCalculator && (
            <button
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] text-xl font-bold shadow-lg hover:from-[#FFD700] hover:to-[#8BAE5A] transition-all"
              onClick={() => setShowCalculator(true)}
            >
              Start de Calorie & Macro Calculator
            </button>
          )}
        </div>
      </div>
      <div className="mt-8">
        {showCalculator && (!selectedPlan ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <CalorieMacroCalculator />
            <PlanLibrary onSelect={slug => setSelectedPlan(slug)} />
          </div>
        ) : (
          <CalorieMacroCalculator>
            <PlanDetail slug={selectedPlan} onBack={() => setSelectedPlan(null)} />
          </CalorieMacroCalculator>
        ))}
      </div>
    </div>
  );
} 