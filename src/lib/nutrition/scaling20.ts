// Scaling 2.0 helper
// Keeps original macro ratios and scales total calories linearly by user weight vs base weight.
// Returns display-only targets; does not mutate DB values.

export interface Scaling20Input {
  baseKcal: number;          // plan.target_calories or sum from macros
  baseProteinG: number;      // plan.target_protein
  baseCarbsG: number;        // plan.target_carbs
  baseFatG: number;          // plan.target_fat
  baseWeightKg: number;      // usually 100 for baseline plans
  userWeightKg: number;      // e.g., 90 for V2 testing
}

export interface Scaling20Result {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  ratios: { proteinPct: number; carbsPct: number; fatPct: number };
  factor: number; // userWeightKg / baseWeightKg
}

export function computeScaling20Targets(input: Scaling20Input): Scaling20Result {
  const baseKcalFromMacros = Math.max(
    1,
    Math.round((input.baseProteinG * 4) + (input.baseCarbsG * 4) + (input.baseFatG * 9))
  );
  const baseKcal = input.baseKcal || baseKcalFromMacros;
  const factor = input.baseWeightKg > 0 ? (input.userWeightKg / input.baseWeightKg) : 1;
  const scaledKcal = Math.round(baseKcal * factor);

  // Preserve original macro percentages
  const pShare = Math.max(0, Math.min(1, (input.baseProteinG * 4) / baseKcal));
  const cShare = Math.max(0, Math.min(1, (input.baseCarbsG * 4) / baseKcal));
  const fShare = Math.max(0, Math.min(1, (input.baseFatG * 9) / baseKcal));

  const proteinG = Math.round((scaledKcal * pShare) / 4);
  const carbsG = Math.round((scaledKcal * cShare) / 4);
  const fatG = Math.round((scaledKcal * fShare) / 9);

  return {
    kcal: scaledKcal,
    proteinG,
    carbsG,
    fatG,
    ratios: {
      proteinPct: Math.round(pShare * 100),
      carbsPct: Math.round(cShare * 100),
      fatPct: Math.round(fShare * 100),
    },
    factor,
  };
}
