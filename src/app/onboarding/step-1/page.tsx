"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingV2 } from "@/contexts/OnboardingV2Context";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function OnboardingStep1() {
  const router = useRouter();
  const { completeStep, isCompleted } = useOnboardingV2();
  const [videoWatched, setVideoWatched] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoEnd = () => setVideoWatched(true);

  const handleContinue = async () => {
    if (!videoWatched) return;
    await completeStep(0);
    router.replace("/onboarding/step-2");
  };

  return (
    <div className="min-h-screen bg-[#181F17] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#232D1A]/80 border border-[#3A4D23]/40 rounded-2xl p-6 shadow-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 text-center">Stap 1: Welkomstvideo</h1>
        <p className="text-[#8BAE5A]/80 text-center mb-4">Je moet de video volledig bekijken om door te gaan.</p>
        <div className="rounded-xl overflow-hidden bg-black mb-4">
          <video
            ref={videoRef}
            className="w-full h-56 sm:h-72 object-cover"
            controls
            preload="metadata"
            onEnded={handleVideoEnd}
          >
            <source src="https://wkjvstuttbeyqzyjayxj.supabase.co/storage/v1/object/public/workout-videos/onboarding-v2-video.mp4" type="video/mp4" />
            Je browser ondersteunt geen video element.
          </video>
        </div>
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!videoWatched}
            className={`px-6 py-3 rounded-lg font-bold transition-colors ${
              videoWatched
                ? "bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-white"
                : "bg-gray-600 text-gray-300 cursor-not-allowed"
            }`}
          >
            {videoWatched ? "Ga naar stap 2 →" : "Bekijk eerst de video"}
          </button>
        </div>
      </div>
    </div>
  );
}
