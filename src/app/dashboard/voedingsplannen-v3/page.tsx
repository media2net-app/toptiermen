"use client";

import React, { useEffect, useMemo, useState } from "react";

// Simple types
interface NutritionPlan {
  id: string | number;
  plan_id?: string;
  name: string;
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fat?: number;
}

interface OriginalPlanData {
  id: string | number;
  name: string;
  meals: {
    target_calories?: number;
    target_protein?: number;
    target_carbs?: number;
    target_fat?: number;
    weekly_plan: Record<string, any>;
  };
}

const isPieceUnit = (u?: string) => {
  const x = String(u || "").toLowerCase();
  return (
    x === "per_piece" ||
    x === "stuk" ||
    x === "pieces" ||
    x === "per_plakje" ||
    x === "plakje" ||
    x === "per_slice" ||
    x === "slice"
  );
};

const gramsPerUnit = (ing: any) => {
  const u = String(ing?.unit || "").toLowerCase();
  if (u === "g") return 1;
  if (u === "per_100g") return 100;
  if (u === "ml" || u === "per_ml") return 1; // approx
  if (u === "per_tbsp" || u === "tbsp" || u === "eetlepel" || u === "el" || u === "per_eetlepel") return 15;
  if (u === "per_tsp" || u === "tsp" || u === "theelepel" || u === "tl" || u === "per_theelepel") return 5;
  if (u === "per_cup" || u === "cup" || u === "kop") return 240;
  if (u === "per_30g") return 30;
  // fallback try unit weight fields
  const w = Number(
    ing.unit_weight_g ?? ing.grams_per_unit ?? ing.weight_per_unit ?? ing.per_piece_grams ?? ing.slice_weight_g ?? ing.plakje_gram ?? ing.unit_weight
  );
  return Number.isFinite(w) && w > 0 ? w : 100; // fallback 100g
};

const roundAmount = (ing: any, amount: number) => {
  const u = String(ing?.unit || "").toLowerCase();
  if (isPieceUnit(u)) return Math.round(amount);
  if (u === "g" || u === "per_100g") return Math.round(amount);
  if (u === "ml" || u === "per_ml") return Math.round(amount);
  if (u === "per_tbsp" || u === "tbsp" || u === "eetlepel" || u === "el" || u === "per_eetlepel") return Math.round(amount * 2) / 2; // 0.5 step
  if (u === "per_tsp" || u === "tsp" || u === "theelepel" || u === "tl" || u === "per_theelepel") return Math.round(amount * 2) / 2;
  if (u === "per_cup" || u === "cup" || u === "kop") return Math.round(amount * 10) / 10;
  return Math.round(amount * 10) / 10;
};

const macroPerUnit = (ing: any) => {
  // returns grams of macros per 1 unit of the ingredient's unit
  const g100 = {
    cal: Number(ing.calories_per_100g || 0),
    p: Number(ing.protein_per_100g || 0),
    c: Number(ing.carbs_per_100g || 0),
    f: Number(ing.fat_per_100g || 0),
  };
  const gPerUnit = gramsPerUnit(ing);
  const factor = gPerUnit / 100;
  return {
    cal: g100.cal * factor,
    p: g100.p * factor,
    c: g100.c * factor,
    f: g100.f * factor,
  };
};

export default function VoedingsplannenV3Page() {
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<NutritionPlan | null>(null);
  const [planData, setPlanData] = useState<OriginalPlanData | null>(null);
  const [weight, setWeight] = useState<number>(100);
  const [day, setDay] = useState<string>("maandag");
  const [goal, setGoal] = useState<string>(""); // '', 'onderhoud', 'spiermassa', 'droogtrainen'

  // Load available plans
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/nutrition-plans", { cache: "no-store" });
        const json = await res.json();
        setPlans(json.plans || []);
      } catch (e) {
        console.warn("Failed to load plans", e);
      }
    })();
  }, []);

  // Derived: filter plans by selected goal
  const filteredPlans = useMemo(() => {
    if (!goal) return plans;
    const needle = goal.toLowerCase();
    const map: Record<string,string[]> = {
      onderhoud: ["onderhoud", "behoud", "maintenance"],
      spiermassa: ["spiermassa", "bulk"],
      droogtrainen: ["droogtrainen", "cut", "droog"],
    };
    const keys = map[needle] || [needle];
    return plans.filter(p => {
      const n = (p.name || '').toLowerCase();
      const g = (p as any).goal ? String((p as any).goal).toLowerCase() : '';
      return keys.some(k => n.includes(k) || g === k);
    });
  }, [plans, goal]);

  // Reset selected plan if it no longer matches filter
  useEffect(() => {
    if (!selectedPlan) return;
    if (!filteredPlans.find(p => String(p.id||p.plan_id) === String(selectedPlan.id||selectedPlan.plan_id))) {
      setSelectedPlan(null);
      setPlanData(null);
    }
  }, [goal]);

  // Auto load user weight
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/nutrition-profile-v2", { cache: "no-store" });
        const json = await res.json();
        const w = Number(json?.profile?.weight || 100);
        if (Number.isFinite(w)) setWeight(w);
      } catch {}
    })();
  }, []);

  // Load plan meals when selected
  useEffect(() => {
    (async () => {
      if (!selectedPlan) return;
      try {
        const idToLoad = (selectedPlan.id || selectedPlan.plan_id) + "";
        const res = await fetch(`/api/admin/plan-meals?planId=${idToLoad}`, { cache: "no-store" });
        const json = await res.json();
        setPlanData(json.plan || json);
      } catch (e) {
        console.warn("Failed to load plan data", e);
      }
    })();
  }, [selectedPlan]);

  const scalingFactor = useMemo(() => {
    const w = Number(weight || 100);
    return Math.max(0.5, Math.min(1.5, w / 100));
  }, [weight]);

  const targets = useMemo(() => {
    // Derive targets for the selected day only
    const src = planData?.meals?.weekly_plan?.[day] as any;
    let baseCal = 0, baseP = 0, baseC = 0, baseF = 0;

    if (src) {
      // 1) Prefer explicit day-level targets if present in backend data (support multiple key variants)
      const dayTargets = src.targets || src.day_targets || src.doelen || {};
      const tCal = Number(dayTargets.calories ?? dayTargets.kcal ?? dayTargets.target_calories ?? 0);
      const tP   = Number(dayTargets.protein  ?? dayTargets.p   ?? dayTargets.target_protein  ?? 0);
      const tC   = Number(dayTargets.carbs    ?? dayTargets.c   ?? dayTargets.target_carbs    ?? 0);
      const tF   = Number(dayTargets.fat      ?? dayTargets.f   ?? dayTargets.target_fat      ?? 0);
      if (tCal > 0) { baseCal = tCal; baseP = tP; baseC = tC; baseF = tF; }

      // 2) If no explicit day targets, derive from backend meals (baseline, no scaling)
      if (baseCal === 0) {
        let t = { cal: 0, p: 0, c: 0, f: 0 };
        ["ontbijt","ochtend_snack","lunch","lunch_snack","diner","avond_snack"].forEach((mt) => {
          const meal = src?.[mt];
          if (!meal) return;
          if (meal.nutrition && typeof meal.nutrition === 'object') {
            t.cal += Number(meal.nutrition.calories)||0;
            t.p   += Number(meal.nutrition.protein)||0;
            t.c   += Number(meal.nutrition.carbs)||0;
            t.f   += Number(meal.nutrition.fat)||0;
          } else if (Array.isArray(meal.ingredients)) {
            meal.ingredients.forEach((ing:any) => {
              const u = String(ing.unit||'').toLowerCase();
              const amount = Number(ing.amount||0);
              const per = macroPerUnit(ing);
              const units = isPieceUnit(u) ? amount : amount / Math.max(1, gramsPerUnit(ing));
              t.cal += per.cal * units;
              t.p   += per.p   * units;
              t.c   += per.c   * units;
              t.f   += per.f   * units;
            });
          }
        });
        baseCal = Math.round(t.cal);
        baseP   = Math.round(t.p);
        baseC   = Math.round(t.c);
        baseF   = Math.round(t.f);
      }
    }

    return {
      calories: Math.round(baseCal * scalingFactor),
      protein: Math.round(baseP * scalingFactor),
      carbs: Math.round(baseC * scalingFactor),
      fat: Math.round(baseF * scalingFactor),
    };
  }, [planData, scalingFactor, day]);

  // Produce a scaled copy for the chosen day using simple rules
  const scaledDay = useMemo(() => {
    const src = planData?.meals?.weekly_plan?.[day];
    if (!src) return null;
    const copy = JSON.parse(JSON.stringify(src));

    // 1) scale only non-piece units by weight factor
    ["ontbijt","ochtend_snack","lunch","lunch_snack","diner","avond_snack"].forEach((mt) => {
      const meal = copy?.[mt];
      if (!meal?.ingredients) return;
      meal.ingredients.forEach((ing: any) => {
        if (typeof ing.amount !== "number") return;
        if (isPieceUnit(ing.unit)) return; // keep pieces
        let next = ing.amount * scalingFactor;
        next = roundAmount(ing, next);
        ing.amount = next;
      });
    });

    // Helper to compute totals from ingredients only
    const computeTotals = (data: any) => {
      let t = { cal: 0, p: 0, c: 0, f: 0 };
      ["ontbijt","ochtend_snack","lunch","lunch_snack","diner","avond_snack"].forEach((mt) => {
        const meal = data?.[mt];
        if (!meal?.ingredients) return;
        meal.mealTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        meal.ingredients.forEach((ing: any) => {
          const per = macroPerUnit(ing);
          const amount = Number(ing.amount || 0);
          const u = String(ing.unit || "").toLowerCase();
          const units = isPieceUnit(u) ? amount : amount / Math.max(1, gramsPerUnit(ing));
          const add = {
            cal: per.cal * (isPieceUnit(u) ? amount : amount / gramsPerUnit(ing)),
            p: per.p * (isPieceUnit(u) ? amount : amount / gramsPerUnit(ing)),
            c: per.c * (isPieceUnit(u) ? amount : amount / gramsPerUnit(ing)),
            f: per.f * (isPieceUnit(u) ? amount : amount / gramsPerUnit(ing)),
          };
          t.cal += add.cal;
          t.p += add.p;
          t.c += add.c;
          t.f += add.f;
          meal.mealTotals.calories += add.cal;
          meal.mealTotals.protein += add.p;
          meal.mealTotals.carbs += add.c;
          meal.mealTotals.fat += add.f;
        });
      });
      return { cal: t.cal, p: t.p, c: t.c, f: t.f };
    };

    // 2) even surplus reduction across meals using non-piece items only
    let totals = computeTotals(copy);
    const surplus = Math.max(0, Math.round(totals.cal) - targets.calories);
    if (surplus > 5) {
      const mealTypes = ["ontbijt","ochtend_snack","lunch","lunch_snack","diner","avond_snack"];
      // compute adjustable kcal per meal
      const mealAdj = mealTypes.map((mt) => {
        const meal = copy?.[mt];
        if (!meal?.ingredients) return { mt, kcal: 0 };
        let kcal = 0;
        meal.ingredients.forEach((ing: any) => {
          if (isPieceUnit(ing.unit)) return;
          const dens = macroPerUnit(ing);
          const perUnitK = dens.p * 4 + dens.c * 4 + dens.f * 9;
          kcal += perUnitK * (Number(ing.amount || 0) / Math.max(1, gramsPerUnit(ing)));
        });
        return { mt, kcal };
      });
      const totalAdj = mealAdj.reduce((a, b) => a + (b.kcal || 0), 0);
      if (totalAdj > 0) {
        mealAdj.forEach((entry) => {
          if (!entry.kcal) return;
          const meal = copy?.[entry.mt];
          if (!meal?.ingredients) return;
          let remaining = surplus * (entry.kcal / totalAdj);
          const adjustable = meal.ingredients.filter((ing: any) => !isPieceUnit(ing.unit));
          const perUnitKs = adjustable.map((ing: any) => {
            const dens = macroPerUnit(ing);
            return dens.p * 4 + dens.c * 4 + dens.f * 9;
          });
          const sumPerUnitK = perUnitKs.reduce((a: number, b: number) => a + b, 0);
          adjustable.forEach((ing: any, idx: number) => {
            if (remaining <= 0) return;
            const perK = perUnitKs[idx] || 0;
            if (perK <= 0) return;
            const portion = sumPerUnitK > 0 ? perK / sumPerUnitK : 0;
            const reduceK = remaining * portion;
            const deltaUnits = reduceK / perK;
            let next = Math.max(0, Number(ing.amount || 0) - deltaUnits * gramsPerUnit(ing));
            next = roundAmount(ing, next);
            remaining -= Math.max(0, Number(ing.amount || 0) - next) / Math.max(1, gramsPerUnit(ing)) * perK;
            ing.amount = next;
          });
        });
        totals = computeTotals(copy);
      }
    }

    // 3) deficit-fill (only when under target): evenly distribute kcal shortage across meals using adjustable items
    const deficit = Math.max(0, targets.calories - Math.round(totals.cal));
    if (deficit > 5) {
      const mealTypes2 = ["ontbijt","ochtend_snack","lunch","lunch_snack","diner","avond_snack"];
      const mealAdj2 = mealTypes2.map((mt) => {
        const meal = copy?.[mt];
        if (!meal?.ingredients) return { mt, kcal: 0 };
        let kcal = 0;
        meal.ingredients.forEach((ing: any) => {
          if (isPieceUnit(ing.unit)) return;
          const dens = macroPerUnit(ing);
          const perUnitK = dens.p * 4 + dens.c * 4 + dens.f * 9;
          kcal += perUnitK * (Number(ing.amount || 0) / Math.max(1, gramsPerUnit(ing)));
        });
        return { mt, kcal };
      });
      const totalAdj2 = mealAdj2.reduce((a, b) => a + (b.kcal || 0), 0);
      if (totalAdj2 > 0) {
        mealAdj2.forEach((entry) => {
          if (!entry.kcal) return;
          const meal = copy?.[entry.mt];
          if (!meal?.ingredients) return;
          let remaining = deficit * (entry.kcal / totalAdj2);
          const adjustable = meal.ingredients.filter((ing: any) => !isPieceUnit(ing.unit));
          const perUnitKs = adjustable.map((ing: any) => {
            const dens = macroPerUnit(ing);
            return dens.p * 4 + dens.c * 4 + dens.f * 9;
          });
          const sumPerUnitK = perUnitKs.reduce((a: number, b: number) => a + b, 0);
          adjustable.forEach((ing: any, idx: number) => {
            if (remaining <= 0) return;
            const perK = perUnitKs[idx] || 0;
            if (perK <= 0) return;
            const portion = sumPerUnitK > 0 ? perK / sumPerUnitK : 0;
            const addK = remaining * portion;
            const deltaUnits = addK / perK;
            let next = Number(ing.amount || 0) + deltaUnits * gramsPerUnit(ing);
            next = roundAmount(ing, next);
            // reduce what we actually added from remaining
            remaining -= Math.max(0, (next - Number(ing.amount || 0))) / Math.max(1, gramsPerUnit(ing)) * perK;
            ing.amount = next;
          });
        });
        totals = computeTotals(copy);
      }
    }

    return { data: copy, totals };
  }, [planData, day, scalingFactor, targets]);

  // Simple progress info helper
  const getProgressInfo = (current: number, target: number) => {
    const percentage = target > 0 ? (current / target) * 100 : 0;
    const dev = Math.abs(percentage - 100);
    let color = 'bg-red-500';
    if (dev <= 5) color = 'bg-green-500';
    else if (dev <= 10) color = 'bg-orange-500';
    return { percentage, color };
  };

  // Helper to compute targets for arbitrary factor using same base day backend data
  const computeTargetsForFactor = (factor: number) => {
    const src = planData?.meals?.weekly_plan?.[day] as any;
    let baseCal = 0, baseP = 0, baseC = 0, baseF = 0;
    if (src) {
      const dayTargets = src.targets || src.day_targets || src.doelen || {};
      const tCal = Number(dayTargets.calories ?? dayTargets.kcal ?? dayTargets.target_calories ?? 0);
      const tP   = Number(dayTargets.protein  ?? dayTargets.p   ?? dayTargets.target_protein  ?? 0);
      const tC   = Number(dayTargets.carbs    ?? dayTargets.c   ?? dayTargets.target_carbs    ?? 0);
      const tF   = Number(dayTargets.fat      ?? dayTargets.f   ?? dayTargets.target_fat      ?? 0);
      if (tCal > 0) { baseCal = tCal; baseP = tP; baseC = tC; baseF = tF; }
      if (baseCal === 0) {
        let t = { cal: 0, p: 0, c: 0, f: 0 };
        ["ontbijt","ochtend_snack","lunch","lunch_snack","diner","avond_snack"].forEach((mt) => {
          const meal = src?.[mt];
          if (!meal) return;
          if (meal.nutrition && typeof meal.nutrition === 'object') {
            t.cal += Number(meal.nutrition.calories)||0;
            t.p   += Number(meal.nutrition.protein)||0;
            t.c   += Number(meal.nutrition.carbs)||0;
            t.f   += Number(meal.nutrition.fat)||0;
          } else if (Array.isArray(meal.ingredients)) {
            meal.ingredients.forEach((ing:any) => {
              const u = String(ing.unit||'').toLowerCase();
              const amount = Number(ing.amount||0);
              const per = macroPerUnit(ing);
              const units = isPieceUnit(u) ? amount : amount / Math.max(1, gramsPerUnit(ing));
              t.cal += per.cal * units;
              t.p   += per.p   * units;
              t.c   += per.c   * units;
              t.f   += per.f   * units;
            });
          }
        });
        baseCal = Math.round(t.cal); baseP = Math.round(t.p); baseC = Math.round(t.c); baseF = Math.round(t.f);
      }
    }
    return {
      calories: Math.round(baseCal * factor),
      protein: Math.round(baseP * factor),
      carbs: Math.round(baseC * factor),
      fat: Math.round(baseF * factor),
    };
  };

  // Helper to compute scaled totals for arbitrary factor using the same simple scaling and surplus reduction
  const computeTotalsForFactor = (factor: number) => {
    const src = planData?.meals?.weekly_plan?.[day];
    if (!src) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const copy = JSON.parse(JSON.stringify(src));
    ["ontbijt","ochtend_snack","lunch","lunch_snack","diner","avond_snack"].forEach((mt) => {
      const meal = (copy as any)?.[mt];
      if (!meal?.ingredients) return;
      meal.ingredients.forEach((ing: any) => {
        if (typeof ing.amount !== 'number') return;
        if (isPieceUnit(ing.unit)) return;
        let next = ing.amount * factor;
        next = roundAmount(ing, next);
        ing.amount = next;
      });
    });
    const computeTotals = (data: any) => {
      let t = { cal: 0, p: 0, c: 0, f: 0 };
      ["ontbijt","ochtend_snack","lunch","lunch_snack","diner","avond_snack"].forEach((mt) => {
        const meal = data?.[mt];
        if (!meal?.ingredients) return;
        meal.ingredients.forEach((ing: any) => {
          const per = macroPerUnit(ing);
          const amount = Number(ing.amount || 0);
          const u = String(ing.unit || '').toLowerCase();
          const units = isPieceUnit(u) ? amount : amount / Math.max(1, gramsPerUnit(ing));
          t.cal += per.cal * units;
          t.p   += per.p   * units;
          t.c   += per.c   * units;
          t.f   += per.f   * units;
        });
      });
      return { cal: t.cal, p: t.p, c: t.c, f: t.f };
    };
    let totals = computeTotals(copy);
    const tgs = computeTargetsForFactor(factor);
    const surplus = Math.max(0, Math.round(totals.cal) - tgs.calories);
    if (surplus > 5) {
      const mealTypes = ["ontbijt","ochtend_snack","lunch","lunch_snack","diner","avond_snack"];
      const mealAdj = mealTypes.map((mt) => {
        const meal = (copy as any)?.[mt];
        if (!meal?.ingredients) return { mt, kcal: 0 };
        let kcal = 0;
        meal.ingredients.forEach((ing: any) => {
          if (isPieceUnit(ing.unit)) return;
          const dens = macroPerUnit(ing);
          const perUnitK = dens.p * 4 + dens.c * 4 + dens.f * 9;
          kcal += perUnitK * (Number(ing.amount || 0) / Math.max(1, gramsPerUnit(ing)));
        });
        return { mt, kcal };
      });
      const totalAdj = mealAdj.reduce((a, b) => a + (b.kcal || 0), 0);
      if (totalAdj > 0) {
        mealAdj.forEach((entry) => {
          if (!entry.kcal) return;
          const meal = (copy as any)?.[entry.mt];
          if (!meal?.ingredients) return;
          let remaining = surplus * (entry.kcal / totalAdj);
          const adjustable = meal.ingredients.filter((ing: any) => !isPieceUnit(ing.unit));
          const perUnitKs = adjustable.map((ing: any) => {
            const dens = macroPerUnit(ing);
            return dens.p * 4 + dens.c * 4 + dens.f * 9;
          });
          const sumPerUnitK = perUnitKs.reduce((a: number, b: number) => a + b, 0);
          adjustable.forEach((ing: any, idx: number) => {
            if (remaining <= 0) return;
            const perK = perUnitKs[idx] || 0;
            if (perK <= 0) return;
            const portion = sumPerUnitK > 0 ? perK / sumPerUnitK : 0;
            const reduceK = remaining * portion;
            const deltaUnits = reduceK / perK;
            let next = Math.max(0, Number(ing.amount || 0) - deltaUnits * gramsPerUnit(ing));
            next = roundAmount(ing, next);
            remaining -= Math.max(0, Number(ing.amount || 0) - next) / Math.max(1, gramsPerUnit(ing)) * perK;
            ing.amount = next;
          });
        });
        totals = computeTotals(copy);
      }
    }
    return {
      calories: Math.round(totals.cal),
      protein: Math.round(totals.p),
      carbs: Math.round(totals.c),
      fat: Math.round(totals.f),
    };
  };

  const resultsRows = useMemo(() => {
    if (!planData) return [] as any[];
    const rows: any[] = [];
    for (let w = 70; w <= 130; w += 1) {
      const factor = Math.max(0.5, Math.min(1.5, w / 100));
      const tgs = computeTargetsForFactor(factor);
      const tots = computeTotalsForFactor(factor);
      rows.push({ w, tgs, tots });
    }
    return rows;
  }, [planData, day]);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">Voedingsplannen V3 (Simple Scaling)</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-3">
          <div className="text-sm text-white mb-2">Gewicht (kg)</div>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value || 0))}
            className="w-full bg-[#0A0F0A] text-white rounded px-3 py-2 border border-[#3A4D23]"
          />
        </div>
        <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-3">
          <div className="text-sm text-white mb-2">Dag</div>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-full bg-[#0A0F0A] text-white rounded px-3 py-2 border border-[#3A4D23]"
          >
            {['maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag','zondag'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-3">
          <div className="text-sm text-white mb-2">Doel</div>
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full bg-[#0A0F0A] text-white rounded px-3 py-2 border border-[#3A4D23]"
          >
            <option value="">Alle doelen</option>
            <option value="onderhoud">Onderhoud</option>
            <option value="spiermassa">Spiermassa</option>
            <option value="droogtrainen">Droogtrainen</option>
          </select>
        </div>
        <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-3">
          <div className="text-sm text-white mb-2">Plan</div>
          <select
            value={selectedPlan ? String(selectedPlan.id) : ''}
            onChange={(e) => {
              const id = e.target.value;
              const p = filteredPlans.find(pl => String(pl.id) === id || String(pl.plan_id) === id);
              setSelectedPlan(p || null);
            }}
            className="w-full bg-[#0A0F0A] text-white rounded px-3 py-2 border border-[#3A4D23]"
          >
            <option value="">Selecteer plan</option>
            {filteredPlans.map(p => (
              <option key={String(p.id || p.plan_id)} value={String(p.id || p.plan_id)}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedPlan && planData && (
        <div className="space-y-4">
          <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-3">
            <div className="font-semibold text-white">Targets (scaled)</div>
            <div className="text-white text-sm">kcal: {targets.calories} • P: {targets.protein}g • C: {targets.carbs}g • F: {targets.fat}g</div>
          </div>

          <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-3">
            <div className="font-semibold mb-2 text-white">Dagtotalen</div>
            <div className="text-white text-sm">kcal: {Math.round((scaledDay?.totals?.cal || 0))} • P: {Math.round((scaledDay?.totals?.p || 0)*10)/10}g • C: {Math.round((scaledDay?.totals?.c || 0)*10)/10}g • F: {Math.round((scaledDay?.totals?.f || 0)*10)/10}g</div>
            <div className="mt-3 space-y-2">
              {(() => {
                const bars = [
                  { key: 'kcal', label: 'Calorieën', current: Math.round(scaledDay?.totals?.cal || 0), target: targets.calories },
                  { key: 'p', label: 'Eiwit', current: Math.round((scaledDay?.totals?.p || 0)), target: targets.protein },
                  { key: 'c', label: 'Koolhydraten', current: Math.round((scaledDay?.totals?.c || 0)), target: targets.carbs },
                  { key: 'f', label: 'Vetten', current: Math.round((scaledDay?.totals?.f || 0)), target: targets.fat },
                ];
                return bars.map(b => {
                  const { percentage, color } = getProgressInfo(b.current, b.target);
                  const width = Math.min(percentage, 120); // cap for display
                  return (
                    <div key={b.key}>
                      <div className="flex justify-between text-xs text-white mb-1">
                        <span>{b.label}</span>
                        <span>{Math.round(percentage)}% ({b.current}/{b.target}{b.key==='kcal' ? ' kcal' : 'g'})</span>
                      </div>
                      <div className="w-full h-2 bg-[#3A4D23] rounded">
                        <div className={`${color} h-2 rounded`} style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          <div className="space-y-3">
            {['ontbijt','ochtend_snack','lunch','lunch_snack','diner','avond_snack'].map(mt => {
              const meal = (scaledDay as any)?.data?.[mt];
              if (!meal) return null;
              return (
                <div key={mt} className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-3">
                  <div className="font-semibold capitalize mb-2 text-white">{mt.replace('_',' ')}</div>
                  <div className="text-xs text-white mb-2">kcal: {Math.round(meal?.mealTotals?.calories || 0)} • P: {Math.round((meal?.mealTotals?.protein||0)*10)/10}g • C: {Math.round((meal?.mealTotals?.carbs||0)*10)/10}g • F: {Math.round((meal?.mealTotals?.fat||0)*10)/10}g</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-white">
                      <thead>
                        <tr className="text-white">
                          <th className="py-1 pr-2">Ingrediënt</th>
                          <th className="py-1 pr-2">Aantal</th>
                          <th className="py-1 pr-2">Eenheid</th>
                          <th className="py-1 pr-2">kcal/100g</th>
                          <th className="py-1 pr-2">P/100g</th>
                          <th className="py-1 pr-2">C/100g</th>
                          <th className="py-1 pr-2">F/100g</th>
                        </tr>
                      </thead>
                      <tbody>
                        {meal.ingredients?.map((ing: any, idx: number) => (
                          <tr key={idx} className="border-t border-[#3A4D23]/50">
                            <td className="py-1 pr-2">{ing.name}</td>
                            <td className="py-1 pr-2">{String(ing.amount)}</td>
                            <td className="py-1 pr-2">{String(ing.unit)}</td>
                            <td className="py-1 pr-2">{Number(ing.calories_per_100g||0)}</td>
                            <td className="py-1 pr-2">{Number(ing.protein_per_100g||0)}</td>
                            <td className="py-1 pr-2">{Number(ing.carbs_per_100g||0)}</td>
                            <td className="py-1 pr-2">{Number(ing.fat_per_100g||0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedPlan && planData && (
        <div className="space-y-3">
          <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-3">
            <div className="font-semibold text-white mb-2">Resultaten (70–130 kg) — {selectedPlan.name} — {day}</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-white">
                <thead>
                  <tr className="text-white">
                    <th className="py-2 pr-3">Gewicht</th>
                    <th className="py-2 pr-3">kcal %</th>
                    <th className="py-2 pr-3">Eiwit %</th>
                    <th className="py-2 pr-3">Koolhydraten %</th>
                    <th className="py-2 pr-3">Vetten %</th>
                  </tr>
                </thead>
                <tbody>
                  {resultsRows.map((row) => {
                    const pK = getProgressInfo(row.tots.calories, row.tgs.calories);
                    const pP = getProgressInfo(row.tots.protein, row.tgs.protein);
                    const pC = getProgressInfo(row.tots.carbs, row.tgs.carbs);
                    const pF = getProgressInfo(row.tots.fat, row.tgs.fat);
                    const pct = (n:number)=> `${Math.round(Math.min(n,120))}%`;
                    const chip = (pi:any)=> {
                      const base = 'px-2 py-0.5 rounded text-xs font-semibold';
                      const color = pi.color === 'bg-green-500' ? 'bg-green-500 text-black' : pi.color === 'bg-orange-500' ? 'bg-orange-500 text-black' : 'bg-red-500 text-black';
                      return <span className={`${base} ${color}`}>{Math.round(pi.percentage)}%</span>;
                    };
                    return (
                      <tr key={row.w} className="border-t border-[#3A4D23]/50">
                        <td className="py-1 pr-3">{row.w} kg</td>
                        <td className="py-1 pr-3">{chip(pK)}</td>
                        <td className="py-1 pr-3">{chip(pP)}</td>
                        <td className="py-1 pr-3">{chip(pC)}</td>
                        <td className="py-1 pr-3">{chip(pF)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
