"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useOnboardingV2 } from "@/contexts/OnboardingV2Context";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { usePathname } from "next/navigation";

export default function OnboardingDebugger() {
  const [enabled, setEnabled] = useState(false);
  const pathname = usePathname();
  const { user, isAdmin } = useSupabaseAuth();
  const sub = useSubscription();
  const ob = useOnboardingV2();

  // Init from URL/localStorage/env
  useEffect(() => {
    try {
      const qp = new URLSearchParams(window.location.search);
      const byQuery = qp.get("onboarding") === "1" || qp.get("debug") === "onboarding";
      const byLS = localStorage.getItem("ttm_debug_onboarding") === "1";
      const byEnv = process.env.NEXT_PUBLIC_ONBOARDING_DEBUG === "1";
      setEnabled(Boolean(byQuery || byLS || byEnv));
    } catch {}
  }, []);

  // Persist
  useEffect(() => {
    try { localStorage.setItem("ttm_debug_onboarding", enabled ? "1" : "0"); } catch {}
  }, [enabled]);

  // Derive active menu (dashboard)
  const activeMenu = useMemo(() => {
    if (!pathname) return "";
    // Expected: /dashboard/<section>/...
    const parts = pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("dashboard");
    return idx >= 0 && parts[idx + 1] ? parts[idx + 1] : "";
  }, [pathname]);

  // Menu note: Only current page clickable during onboarding
  const menuPolicy = `Alleen huidig menu-item actief: ${activeMenu || "dashboard"}`;

  if (!enabled) {
    return (
      <button
        type="button"
        onClick={() => setEnabled(true)}
        aria-label="Open Onboarding Debugger"
        className="fixed bottom-3 left-14 z-[99998] px-2 py-1 text-[11px] font-semibold rounded-md bg-[#FFD700] text-black shadow-lg hover:opacity-90"
      >
        OD
      </button>
    );
  }

  return (
    <div>
      {/* Toggle */}
      <button
        type="button"
        onClick={() => setEnabled(false)}
        aria-label="Close Onboarding Debugger"
        className="fixed bottom-3 left-14 z-[99998] px-2 py-1 text-[11px] font-semibold rounded-md bg-[#FFD700] text-black shadow-lg hover:opacity-90"
      >
        OD:ON
      </button>

      {/* Panel */}
      <div
        className="fixed bottom-3 left-24 z-[99999] max-w-[92vw] rounded-lg border border-[#FFD700]/40 bg-[#0F1411]/95 text-white shadow-2xl"
        style={{ backdropFilter: "blur(4px)" }}
      >
        <div className="px-3 py-2 text-[11px] leading-4">
          <div className="font-bold text-[#FFD700] mb-1">Onboarding Debugger</div>

          {/* User / Package */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
            <div>
              <div className="text-gray-400">User</div>
              <div>{user?.email || "-"}</div>
              <div className="text-gray-400">Role/Admin</div>
              <div>{isAdmin ? "admin" : "user"}</div>
            </div>
            <div>
              <div className="text-gray-400">Pakket</div>
              <div>
                {sub.isPremium ? "Premium" : sub.isBasic ? "Basic" : sub.isLifetime ? "Lifetime" : (sub.subscription?.subscription_tier || "-")}
              </div>
              <div className="text-gray-400">Sub status</div>
              <div>{sub.subscription?.subscription_status || "active"}</div>
            </div>
          </div>

          {/* Onboarding core */}
          <div className="grid grid-cols-3 gap-x-4 gap-y-1 mb-2">
            <div>
              <div className="text-gray-400">Stap</div>
              <div>
                {ob.currentStep ?? "-"} / {ob.availableSteps.length}
              </div>
              <div className="text-gray-400">Volgende</div>
              <div>{ob.getNextStep() ?? "-"}</div>
            </div>
            <div>
              <div className="text-gray-400">Status</div>
              <div>{ob.isLoading ? "loading" : ob.isCompleted ? "completed" : "in-progress"}</div>
              <div className="text-gray-400">Overlay</div>
              <div>{ob.showLoadingOverlay ? `${ob.loadingText} (${ob.loadingProgress}%)` : "hidden"}</div>
            </div>
            <div>
              <div className="text-gray-400">Toegang</div>
              <div>Training: {String(ob.hasTrainingAccess)}</div>
              <div>Voeding: {String(ob.hasNutritionAccess)}</div>
            </div>
          </div>

          {/* Menu policy */}
          <div className="mt-2 border-t border-[#3A4D23]/50 pt-2">
            <div className="text-gray-400 mb-1">Menu</div>
            <div>{menuPolicy}</div>
            <div className="text-gray-500">Pad: {pathname}</div>
          </div>

          {/* Steps list preview */}
          <div className="mt-2 border-t border-[#3A4D23]/50 pt-2">
            <div className="text-gray-400 mb-1">Beschikbare stappen</div>
            {ob.availableSteps.length === 0 ? (
              <div className="text-gray-500">Geen</div>
            ) : (
              <ul className="space-y-0.5 max-h-[28vh] overflow-auto pr-1">
                {ob.availableSteps.map((s) => (
                  <li key={s.id} className="flex items-center justify-between">
                    <span className="text-gray-300">{s.id}. {ob.getStepTitle(s.id)}</span>
                    <span className="text-xs text-gray-500">req: {s.requiresAccess || '-'}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
