import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // First, check current plan structure
    const { data: currentPlan, error: selectError } = await supabase
      .from('nutrition_plans')
      .select('plan_id, name, meals')
      .eq('plan_id', 'carnivoor-droogtrainen')
      .single();

    if (selectError) {
      console.error('Error fetching current plan:', selectError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch current plan',
        details: selectError.message 
      }, { status: 500 });
    }

    console.log('Current plan structure:', currentPlan);

    // Update the plan with 6 meals structure
    const updatedMeals = {
      target_calories: 1870,
      target_protein: 198,
      target_carbs: 154,
      target_fat: 66,
      goal: "Droogtrainen",
      difficulty: "intermediate",
      duration_weeks: 12,
      meal_distribution: {
        ontbijt: { percentage: 20, calories: 374 },
        ochtend_snack: { percentage: 10, calories: 187 },
        lunch: { percentage: 25, calories: 468 },
        lunch_snack: { percentage: 10, calories: 187 },
        diner: { percentage: 25, calories: 468 },
        avond_snack: { percentage: 10, calories: 187 }
      },
      weekly_plan: {
        monday: {
          ontbijt: [
            { name: "Runderlever", amount: 60, unit: "g", calories: 162, protein: 24, carbs: 4, fat: 4 },
            { name: "Eieren", amount: 2, unit: "stuks", calories: 140, protein: 12, carbs: 1, fat: 10 },
            { name: "Roomboter", amount: 10, unit: "g", calories: 72, protein: 0, carbs: 0, fat: 8 }
          ],
          ochtend_snack: [
            { name: "Gerookte Zalm", amount: 50, unit: "g", calories: 117, protein: 20, carbs: 0, fat: 4 }
          ],
          lunch: [
            { name: "Ribeye Steak", amount: 150, unit: "g", calories: 375, protein: 35, carbs: 0, fat: 25 },
            { name: "Roomboter", amount: 15, unit: "g", calories: 108, protein: 0, carbs: 0, fat: 12 }
          ],
          lunch_snack: [
            { name: "Eieren", amount: 1, unit: "stuks", calories: 70, protein: 6, carbs: 0, fat: 5 },
            { name: "Spek", amount: 20, unit: "g", calories: 92, protein: 3, carbs: 0, fat: 9 }
          ],
          diner: [
            { name: "Lamskotelet", amount: 180, unit: "g", calories: 360, protein: 32, carbs: 0, fat: 25 },
            { name: "Roomboter", amount: 10, unit: "g", calories: 72, protein: 0, carbs: 0, fat: 8 }
          ],
          avond_snack: [
            { name: "Goudse Kaas", amount: 30, unit: "g", calories: 108, protein: 7, carbs: 0, fat: 9 }
          ]
        },
        tuesday: {
          ontbijt: [
            { name: "Runderhart", amount: 80, unit: "g", calories: 120, protein: 20, carbs: 0, fat: 4 },
            { name: "Eieren", amount: 2, unit: "stuks", calories: 140, protein: 12, carbs: 1, fat: 10 },
            { name: "Roomboter", amount: 10, unit: "g", calories: 72, protein: 0, carbs: 0, fat: 8 }
          ],
          ochtend_snack: [
            { name: "Droge Worst", amount: 40, unit: "g", calories: 140, protein: 8, carbs: 0, fat: 12 }
          ],
          lunch: [
            { name: "T-Bone Steak", amount: 160, unit: "g", calories: 400, protein: 38, carbs: 0, fat: 26 },
            { name: "Roomboter", amount: 10, unit: "g", calories: 72, protein: 0, carbs: 0, fat: 8 }
          ],
          lunch_snack: [
            { name: "Tonijn in Olijfolie", amount: 60, unit: "g", calories: 120, protein: 20, carbs: 0, fat: 4 }
          ],
          diner: [
            { name: "Entrecote", amount: 170, unit: "g", calories: 425, protein: 40, carbs: 0, fat: 28 },
            { name: "Roomboter", amount: 10, unit: "g", calories: 72, protein: 0, carbs: 0, fat: 8 }
          ],
          avond_snack: [
            { name: "Griekse Yoghurt", amount: 50, unit: "g", calories: 50, protein: 5, carbs: 3, fat: 3 }
          ]
        },
        wednesday: {
          ontbijt: [
            { name: "Orgaanvlees Mix", amount: 70, unit: "g", calories: 105, protein: 18, carbs: 0, fat: 3 },
            { name: "Eieren", amount: 2, unit: "stuks", calories: 140, protein: 12, carbs: 1, fat: 10 },
            { name: "Roomboter", amount: 10, unit: "g", calories: 72, protein: 0, carbs: 0, fat: 8 }
          ],
          ochtend_snack: [
            { name: "Goudse Kaas", amount: 30, unit: "g", calories: 108, protein: 7, carbs: 0, fat: 9 }
          ],
          lunch: [
            { name: "Biefstuk", amount: 150, unit: "g", calories: 375, protein: 35, carbs: 0, fat: 25 },
            { name: "Roomboter", amount: 15, unit: "g", calories: 108, protein: 0, carbs: 0, fat: 12 }
          ],
          lunch_snack: [
            { name: "Eieren", amount: 1, unit: "stuks", calories: 70, protein: 6, carbs: 0, fat: 5 },
            { name: "Ham", amount: 25, unit: "g", calories: 50, protein: 8, carbs: 0, fat: 2 }
          ],
          diner: [
            { name: "Kipfilet (Gegrild)", amount: 180, unit: "g", calories: 324, protein: 54, carbs: 0, fat: 7 },
            { name: "Roomboter", amount: 15, unit: "g", calories: 108, protein: 0, carbs: 0, fat: 12 }
          ],
          avond_snack: [
            { name: "Gerookte Zalm", amount: 40, unit: "g", calories: 94, protein: 16, carbs: 0, fat: 3 }
          ]
        },
        thursday: {
          ontbijt: [
            { name: "Runderlever", amount: 60, unit: "g", calories: 162, protein: 24, carbs: 4, fat: 4 },
            { name: "Eieren", amount: 2, unit: "stuks", calories: 140, protein: 12, carbs: 1, fat: 10 },
            { name: "Roomboter", amount: 10, unit: "g", calories: 72, protein: 0, carbs: 0, fat: 8 }
          ],
          ochtend_snack: [
            { name: "Droge Worst", amount: 35, unit: "g", calories: 123, protein: 7, carbs: 0, fat: 10 }
          ],
          lunch: [
            { name: "Zalm (Wild)", amount: 160, unit: "g", calories: 320, protein: 48, carbs: 0, fat: 14 },
            { name: "Roomboter", amount: 15, unit: "g", calories: 108, protein: 0, carbs: 0, fat: 12 }
          ],
          lunch_snack: [
            { name: "Eieren", amount: 1, unit: "stuks", calories: 70, protein: 6, carbs: 0, fat: 5 },
            { name: "Spek", amount: 20, unit: "g", calories: 92, protein: 3, carbs: 0, fat: 9 }
          ],
          diner: [
            { name: "Ribeye Steak", amount: 170, unit: "g", calories: 425, protein: 40, carbs: 0, fat: 28 },
            { name: "Roomboter", amount: 10, unit: "g", calories: 72, protein: 0, carbs: 0, fat: 8 }
          ],
          avond_snack: [
            { name: "Goudse Kaas", amount: 30, unit: "g", calories: 108, protein: 7, carbs: 0, fat: 9 }
          ]
        },
        friday: {
          ontbijt: [
            { name: "Runderhart", amount: 80, unit: "g", calories: 120, protein: 20, carbs: 0, fat: 4 },
            { name: "Eieren", amount: 2, unit: "stuks", calories: 140, protein: 12, carbs: 1, fat: 10 },
            { name: "Roomboter", amount: 10, unit: "g", calories: 72, protein: 0, carbs: 0, fat: 8 }
          ],
          ochtend_snack: [
            { name: "Gerookte Zalm", amount: 50, unit: "g", calories: 117, protein: 20, carbs: 0, fat: 4 }
          ],
          lunch: [
            { name: "T-Bone Steak", amount: 160, unit: "g", calories: 400, protein: 38, carbs: 0, fat: 26 },
            { name: "Roomboter", amount: 15, unit: "g", calories: 108, protein: 0, carbs: 0, fat: 12 }
          ],
          lunch_snack: [
            { name: "Tonijn in Olijfolie", amount: 60, unit: "g", calories: 120, protein: 20, carbs: 0, fat: 4 }
          ],
          diner: [
            { name: "Lamskotelet", amount: 180, unit: "g", calories: 360, protein: 32, carbs: 0, fat: 25 },
            { name: "Roomboter", amount: 10, unit: "g", calories: 72, protein: 0, carbs: 0, fat: 8 }
          ],
          avond_snack: [
            { name: "Griekse Yoghurt", amount: 50, unit: "g", calories: 50, protein: 5, carbs: 3, fat: 3 }
          ]
        },
        saturday: {
          ontbijt: [
            { name: "Orgaanvlees Mix", amount: 70, unit: "g", calories: 105, protein: 18, carbs: 0, fat: 3 },
            { name: "Eieren", amount: 2, unit: "stuks", calories: 140, protein: 12, carbs: 1, fat: 10 },
            { name: "Roomboter", amount: 10, unit: "g", calories: 72, protein: 0, carbs: 0, fat: 8 }
          ],
          ochtend_snack: [
            { name: "Droge Worst", amount: 40, unit: "g", calories: 140, protein: 8, carbs: 0, fat: 12 }
          ],
          lunch: [
            { name: "Biefstuk", amount: 150, unit: "g", calories: 375, protein: 35, carbs: 0, fat: 25 },
            { name: "Roomboter", amount: 15, unit: "g", calories: 108, protein: 0, carbs: 0, fat: 12 }
          ],
          lunch_snack: [
            { name: "Eieren", amount: 1, unit: "stuks", calories: 70, protein: 6, carbs: 0, fat: 5 },
            { name: "Ham", amount: 25, unit: "g", calories: 50, protein: 8, carbs: 0, fat: 2 }
          ],
          diner: [
            { name: "Entrecote", amount: 170, unit: "g", calories: 425, protein: 40, carbs: 0, fat: 28 },
            { name: "Roomboter", amount: 10, unit: "g", calories: 72, protein: 0, carbs: 0, fat: 8 }
          ],
          avond_snack: [
            { name: "Goudse Kaas", amount: 30, unit: "g", calories: 108, protein: 7, carbs: 0, fat: 9 }
          ]
        },
        sunday: {
          ontbijt: [
            { name: "Runderlever", amount: 60, unit: "g", calories: 162, protein: 24, carbs: 4, fat: 4 },
            { name: "Eieren", amount: 2, unit: "stuks", calories: 140, protein: 12, carbs: 1, fat: 10 },
            { name: "Roomboter", amount: 10, unit: "g", calories: 72, protein: 0, carbs: 0, fat: 8 }
          ],
          ochtend_snack: [
            { name: "Gerookte Zalm", amount: 50, unit: "g", calories: 117, protein: 20, carbs: 0, fat: 4 }
          ],
          lunch: [
            { name: "Kipfilet (Gegrild)", amount: 180, unit: "g", calories: 324, protein: 54, carbs: 0, fat: 7 },
            { name: "Roomboter", amount: 15, unit: "g", calories: 108, protein: 0, carbs: 0, fat: 12 }
          ],
          lunch_snack: [
            { name: "Tonijn in Olijfolie", amount: 60, unit: "g", calories: 120, protein: 20, carbs: 0, fat: 4 }
          ],
          diner: [
            { name: "Zalm (Wild)", amount: 160, unit: "g", calories: 320, protein: 48, carbs: 0, fat: 14 },
            { name: "Roomboter", amount: 15, unit: "g", calories: 108, protein: 0, carbs: 0, fat: 12 }
          ],
          avond_snack: [
            { name: "Griekse Yoghurt", amount: 50, unit: "g", calories: 50, protein: 5, carbs: 3, fat: 3 }
          ]
        }
      }
    };

    // Update the plan
    const { data: updatedPlan, error: updateError } = await supabase
      .from('nutrition_plans')
      .update({ 
        meals: updatedMeals,
        updated_at: new Date().toISOString()
      })
      .eq('plan_id', 'carnivoor-droogtrainen')
      .select()
      .single();

    if (updateError) {
      console.error('Error updating plan:', updateError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update plan',
        details: updateError.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Carnivoor - Droogtrainen plan updated to 6 meals successfully',
      data: {
        plan_id: updatedPlan.plan_id,
        name: updatedPlan.name,
        meal_distribution: updatedMeals.meal_distribution,
        total_meals: Object.keys(updatedMeals.meal_distribution).length
      }
    });

  } catch (error: any) {
    console.error('Error updating carnivoor droogtrainen plan:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
