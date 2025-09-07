'use client';

import { useState, useEffect } from 'react';

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: Ingredient[];
}

interface DayPlan {
  [mealType: string]: Meal;
}

interface NutritionPlan {
  id: number;
  name: string;
  plan_id: string;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  meals: {
    [day: string]: DayPlan;
  };
  created_at: string;
}

interface BackupStatistics {
  totalPlans: number;
  plansWithData: number;
  totalDays: number;
  backupDate: string;
}

export default function VoedingsplannenBackupPage() {
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [statistics, setStatistics] = useState<BackupStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<NutritionPlan | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAllPlans();
  }, []);

  const fetchAllPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/nutrition-plans-backup');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch plans');
      }

      setPlans(result.data.plans);
      setStatistics(result.data.statistics);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Fout bij ophalen van voedingsplannen');
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(day)) {
        newSet.delete(day);
      } else {
        newSet.add(day);
      }
      return newSet;
    });
  };

  const calculateDayTotal = (dayPlan: any): { calories: number; protein: number; carbs: number; fat: number } => {
    // Handle new weekly_plan structure
    if (dayPlan.dailyTotals) {
      return {
        calories: dayPlan.dailyTotals.calories || 0,
        protein: dayPlan.dailyTotals.protein || 0,
        carbs: dayPlan.dailyTotals.carbs || 0,
        fat: dayPlan.dailyTotals.fat || 0
      };
    }
    
    // Handle old structure
    const meals = Object.values(dayPlan) as any[];
    return meals.reduce((total: { calories: number; protein: number; carbs: number; fat: number }, meal: any) => ({
      calories: total.calories + (meal.calories || 0),
      protein: total.protein + (meal.protein || 0),
      carbs: total.carbs + (meal.carbs || 0),
      fat: total.fat + (meal.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const calculatePlanTotal = (plan: NutritionPlan): { calories: number; protein: number; carbs: number; fat: number } => {
    if (!plan.meals) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    // Handle new weekly_plan structure
    if (plan.meals.weekly_plan) {
      const weeklyPlan = plan.meals.weekly_plan;
      const days = Object.values(weeklyPlan);
      const totals = days.map((dayPlan: any) => calculateDayTotal(dayPlan));
      
      return totals.reduce((total: { calories: number; protein: number; carbs: number; fat: number }, dayTotal: { calories: number; protein: number; carbs: number; fat: number }) => ({
        calories: total.calories + dayTotal.calories,
        protein: total.protein + dayTotal.protein,
        carbs: total.carbs + dayTotal.carbs,
        fat: total.fat + dayTotal.fat
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    }
    
    // Handle old structure
    const days = Object.values(plan.meals);
    const totals = days.map(dayPlan => calculateDayTotal(dayPlan));
    
    return totals.reduce((total: { calories: number; protein: number; carbs: number; fat: number }, dayTotal: { calories: number; protein: number; carbs: number; fat: number }) => ({
      calories: total.calories + dayTotal.calories,
      protein: total.protein + dayTotal.protein,
      carbs: total.carbs + dayTotal.carbs,
      fat: total.fat + dayTotal.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const exportPlanData = (plan: NutritionPlan) => {
    const dataStr = JSON.stringify(plan, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${plan.name.replace(/\s+/g, '_')}_backup.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAllPlans = () => {
    const dataStr = JSON.stringify(plans, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alle_voedingsplannen_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <div className="text-[#8BAE5A] text-xl">Backup data laden...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Fout</div>
          <div className="text-[#B6C948] mb-4">{error}</div>
          <button
            onClick={fetchAllPlans}
            className="px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#A6C97B] transition"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181F17] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#8BAE5A] mb-2">
            🗄️ Voedingsplannen Backup
          </h1>
          <p className="text-[#B6C948] text-lg">
            Volledige backup van alle voedingsplannen en hun data
          </p>
          <div className="mt-4 flex gap-4">
            <button
              onClick={exportAllPlans}
              className="px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#A6C97B] transition font-semibold"
            >
              📥 Export Alle Plannen
            </button>
            <button
              onClick={fetchAllPlans}
              className="px-4 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition font-semibold"
            >
              🔄 Refresh Data
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#232D1A] p-4 rounded-lg border border-[#3A4D23]">
            <div className="text-[#8BAE5A] text-2xl font-bold">
              {statistics?.totalPlans || plans.length}
            </div>
            <div className="text-[#B6C948] text-sm">Totaal Plannen</div>
          </div>
          <div className="bg-[#232D1A] p-4 rounded-lg border border-[#3A4D23]">
            <div className="text-[#8BAE5A] text-2xl font-bold">
              {statistics?.plansWithData || plans.filter(p => p.meals && Object.keys(p.meals).length > 0).length}
            </div>
            <div className="text-[#B6C948] text-sm">Met Maaltijd Data</div>
          </div>
          <div className="bg-[#232D1A] p-4 rounded-lg border border-[#3A4D23]">
            <div className="text-[#8BAE5A] text-2xl font-bold">
              {statistics?.totalDays || plans.reduce((total, plan) => {
                if (!plan.meals) return total;
                return total + Object.keys(plan.meals).length;
              }, 0)}
            </div>
            <div className="text-[#B6C948] text-sm">Totaal Dagen</div>
          </div>
          <div className="bg-[#232D1A] p-4 rounded-lg border border-[#3A4D23]">
            <div className="text-[#8BAE5A] text-2xl font-bold">
              {statistics?.backupDate ? new Date(statistics.backupDate).toLocaleDateString('nl-NL') : new Date().toLocaleDateString('nl-NL')}
            </div>
            <div className="text-[#B6C948] text-sm">Backup Datum</div>
          </div>
        </div>

        {/* Plans List */}
        <div className="space-y-6">
          {plans.map((plan) => {
            const planTotal = calculatePlanTotal(plan);
            const hasData = plan.meals && (
              (plan.meals.weekly_plan && Object.values(plan.meals.weekly_plan).some((day: any) => 
                day && day.dailyTotals && day.dailyTotals.calories > 0
              )) ||
              Object.keys(plan.meals).length > 0
            );
            
            return (
              <div key={plan.id} className="bg-[#232D1A] rounded-lg border border-[#3A4D23] overflow-hidden">
                {/* Plan Header */}
                <div className="p-6 border-b border-[#3A4D23]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-[#8BAE5A] mb-2">
                        {plan.name}
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-[#B6C948]">Plan ID:</span>
                          <div className="text-[#8BAE5A] font-mono">{plan.plan_id}</div>
                        </div>
                        <div>
                          <span className="text-[#B6C948]">Target:</span>
                          <div className="text-[#8BAE5A]">{plan.target_calories} cal</div>
                        </div>
                        <div>
                          <span className="text-[#B6C948]">Actual:</span>
                          <div className="text-[#8BAE5A]">{planTotal.calories} cal</div>
                        </div>
                        <div>
                          <span className="text-[#B6C948]">Status:</span>
                          <div className={`font-semibold ${hasData ? 'text-green-400' : 'text-red-400'}`}>
                            {hasData ? '✅ Heeft Data' : '❌ Geen Data'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => exportPlanData(plan)}
                        className="px-3 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#A6C97B] transition text-sm font-semibold"
                      >
                        📥 Export
                      </button>
                      <button
                        onClick={() => setSelectedPlan(selectedPlan?.id === plan.id ? null : plan)}
                        className="px-3 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition text-sm font-semibold"
                      >
                        {selectedPlan?.id === plan.id ? '👁️ Verberg' : '👁️ Bekijk'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Plan Details */}
                {selectedPlan?.id === plan.id && (
                  <div className="p-6">
                    {/* Target vs Actual */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-[#181F17] p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-[#8BAE5A] mb-3">Target Waarden</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#B6C948]">Calorieën:</span>
                            <span className="text-[#8BAE5A]">{plan.target_calories} cal</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#B6C948]">Eiwit:</span>
                            <span className="text-[#8BAE5A]">{plan.target_protein}g</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#B6C948]">Koolhydraten:</span>
                            <span className="text-[#8BAE5A]">{plan.target_carbs}g</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#B6C948]">Vet:</span>
                            <span className="text-[#8BAE5A]">{plan.target_fat}g</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-[#181F17] p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-[#8BAE5A] mb-3">Actual Waarden</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#B6C948]">Calorieën:</span>
                            <span className="text-[#8BAE5A]">{planTotal.calories} cal</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#B6C948]">Eiwit:</span>
                            <span className="text-[#8BAE5A]">{planTotal.protein.toFixed(1)}g</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#B6C948]">Koolhydraten:</span>
                            <span className="text-[#8BAE5A]">{planTotal.carbs.toFixed(1)}g</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#B6C948]">Vet:</span>
                            <span className="text-[#8BAE5A]">{planTotal.fat.toFixed(1)}g</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Days */}
                    {hasData ? (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-[#8BAE5A]">Dagelijkse Plannen</h3>
                        {(() => {
                          // Use weekly_plan if available, otherwise fallback to old structure
                          const daysData = plan.meals.weekly_plan || plan.meals;
                          return Object.entries(daysData).filter(([key]) => 
                            !['fitness_goal', 'goal', 'target_calories', 'target_carbs', 'target_fat', 'target_protein', 'updated_at', 'weekly_averages'].includes(key)
                          );
                        })().map(([day, dayPlan]) => {
                          const dayTotal = calculateDayTotal(dayPlan);
                          const isExpanded = expandedDays.has(`${plan.id}-${day}`);
                          
                          return (
                            <div key={day} className="bg-[#181F17] rounded-lg border border-[#3A4D23]">
                              <button
                                onClick={() => toggleDay(`${plan.id}-${day}`)}
                                className="w-full p-4 text-left flex items-center justify-between hover:bg-[#232D1A] transition"
                              >
                                <div>
                                  <h4 className="text-[#8BAE5A] font-semibold capitalize">
                                    {day === 'monday' ? 'Maandag' :
                                     day === 'tuesday' ? 'Dinsdag' :
                                     day === 'wednesday' ? 'Woensdag' :
                                     day === 'thursday' ? 'Donderdag' :
                                     day === 'friday' ? 'Vrijdag' :
                                     day === 'saturday' ? 'Zaterdag' :
                                     day === 'sunday' ? 'Zondag' : day}
                                  </h4>
                                  <div className="text-sm text-[#B6C948]">
                                    {dayTotal.calories} cal • {dayTotal.protein.toFixed(1)}g eiwit • {dayTotal.carbs.toFixed(1)}g carbs • {dayTotal.fat.toFixed(1)}g vet
                                  </div>
                                </div>
                                <div className="text-[#8BAE5A]">
                                  {isExpanded ? '▼' : '▶'}
                                </div>
                              </button>
                              
                              {isExpanded && (
                                <div className="p-4 border-t border-[#3A4D23]">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Object.entries(dayPlan).filter(([key]) => 
                                      !['dailyTotals', 'time'].includes(key)
                                    ).map(([mealType, meal]: [string, any]) => (
                                      <div key={mealType} className="bg-[#232D1A] p-3 rounded-lg">
                                        <h5 className="text-[#8BAE5A] font-semibold mb-2 capitalize">
                                          {mealType === 'ontbijt' ? 'Ontbijt' :
                                           mealType === 'lunch' ? 'Lunch' :
                                           mealType === 'diner' ? 'Diner' :
                                           mealType === 'avondsnack' ? 'Avond Snack' :
                                           mealType === 'ochtend_snack' ? 'Ochtend Snack' :
                                           mealType === 'lunch_snack' ? 'Middag Snack' : mealType}
                                        </h5>
                                        <div className="text-sm space-y-1">
                                          <div className="text-[#B6C948]">
                                            {meal.nutrition ? 
                                              `${meal.nutrition.calories} cal • ${meal.nutrition.protein}g eiwit • ${meal.nutrition.carbs}g carbs • ${meal.nutrition.fat}g vet` :
                                              `${meal.calories || 0} cal • ${meal.protein || 0}g eiwit • ${meal.carbs || 0}g carbs • ${meal.fat || 0}g vet`
                                            }
                                          </div>
                                          {meal.ingredients && meal.ingredients.length > 0 && (
                                            <div className="mt-2">
                                              <div className="text-[#8BAE5A] text-xs font-semibold">Ingrediënten:</div>
                                              {meal.ingredients.map((ingredient: any, idx: number) => (
                                                <div key={idx} className="text-[#B6C948] text-xs">
                                                  • {ingredient.name}: {ingredient.amount}{ingredient.unit}
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-red-400 text-lg mb-2">❌ Geen maaltijd data gevonden</div>
                        <div className="text-[#B6C948] text-sm">
                          Dit plan heeft geen ingevulde maaltijden in de database
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-[#B6C948] text-sm">
          <p>Backup gegenereerd op {new Date().toLocaleString('nl-NL')}</p>
          <p className="mt-2">
            💡 Tip: Export individuele plannen of alle plannen als JSON voor volledige backup
          </p>
        </div>
      </div>
    </div>
  );
}
