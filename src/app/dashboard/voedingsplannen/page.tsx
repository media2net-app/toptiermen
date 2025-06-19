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
    <div className="flex flex-col gap-4 sm:gap-8 p-4 sm:p-6">
      <div className="bg-[#232D1A]/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-[#8BAE5A]/40">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
          Het Recept: Jouw Persoonlijke Voedingscoach
        </h1>
        <p className="text-[#A3AED6] text-base sm:text-lg mb-4">
          Volg deze stapsgewijze gids en ontdek jouw ideale voedingsplan. Start met de calorie- en macrocalculator, kies een flexibel plan, ontdek recepten en houd je voortgang bij!
        </p>
        <div className="flex flex-col items-stretch sm:items-center gap-4 mt-4 sm:mt-6">
          <span className="text-lg sm:text-xl font-semibold text-[#8BAE5A] text-center">
            Stap 1: Bereken jouw calorie- en macrobehoefte
          </span>
          {!showCalculator && (
            <button
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] text-lg sm:text-xl font-bold shadow-lg hover:from-[#FFD700] hover:to-[#8BAE5A] transition-all active:scale-95 touch-manipulation"
              onClick={() => setShowCalculator(true)}
            >
              Start de Calculator
            </button>
          )}
        </div>
      </div>
      <div className="mt-4 sm:mt-8">
        {showCalculator && (!selectedPlan ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 items-start">
            <div className="bg-[#232D1A]/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-[#3A4D23]/40">
              <CalorieMacroCalculator />
            </div>
            <div className="bg-[#232D1A]/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-[#3A4D23]/40">
              <PlanLibrary onSelect={slug => setSelectedPlan(slug)} />
            </div>
          </div>
        ) : (
          <div className="bg-[#232D1A]/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-[#3A4D23]/40">
            <CalorieMacroCalculator>
              <PlanDetail slug={selectedPlan} onBack={() => setSelectedPlan(null)} />
            </CalorieMacroCalculator>
          </div>
        ))}
      </div>
    </div>
  );
} 