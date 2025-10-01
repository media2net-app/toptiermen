"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingV2 } from "@/contexts/OnboardingV2Context";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function OnboardingStep2() {
  const router = useRouter();
  const { completeStep } = useOnboardingV2();
  const [goal, setGoal] = useState("");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = setTimeout(() => textareaRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, []);

  const handleSave = async () => {
    if (!goal.trim()) return;
    setSaving(true);
    try {
      const ok = await completeStep(1, { goal: goal.trim() });
      // Ga door naar volgende stap in onboarding-flow
      router.replace("/dashboard/mijn-challenges");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#181F17] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#232D1A]/80 border border-[#3A4D23]/40 rounded-2xl p-6 shadow-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 text-center">Stap 2: Hoofddoel</h1>
        <p className="text-[#8BAE5A]/80 text-center mb-4">Beschrijf in één zin jouw hoofddoel met Top Tier Men.</p>

        <div className="mb-4">
          <textarea
            ref={textareaRef}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Bijv. Ik wil 10 kg afvallen en sterker worden."
            className="w-full h-36 p-4 bg-[#1a2e1a] border border-[#8BAE5A] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#8BAE5A] focus:ring-2 focus:ring-[#8BAE5A]"
          />
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleSave}
            disabled={!goal.trim() || saving}
            className={`px-6 py-3 rounded-lg font-bold transition-colors ${
              goal.trim() && !saving
                ? "bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-white"
                : "bg-gray-600 text-gray-300 cursor-not-allowed"
            }`}
          >
            {saving ? "Opslaan..." : "Doel opslaan →"}
          </button>
        </div>
      </div>
    </div>
  );
}
