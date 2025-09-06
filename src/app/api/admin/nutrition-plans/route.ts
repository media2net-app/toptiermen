import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching nutrition plans from database...');
    
    // First try to get from nutrition_plans table
    let { data: plans, error } = await supabaseAdmin
      .from('nutrition_plans')
      .select('*');

    // If no plans in nutrition_plans, try nutrition_weekplans table
    if (!plans || plans.length === 0) {
      console.log('📊 No plans in nutrition_plans, trying nutrition_weekplans...');
      
      const { data: weekplans, error: weekplansError } = await supabaseAdmin
        .from('nutrition_weekplans')
        .select('*');
        
      if (weekplansError) {
        console.error('❌ Error fetching nutrition weekplans:', weekplansError);
        return NextResponse.json({ error: `Failed to fetch nutrition plans: ${weekplansError.message}` }, { status: 500 });
      }
      
      // Convert weekplans to nutrition plans format
      plans = weekplans?.map(weekplan => ({
        id: weekplan.id,
        name: weekplan.name,
        description: weekplan.description,
        target_calories: weekplan.target_calories,
        target_protein: weekplan.target_protein,
        target_carbs: weekplan.target_carbs,
        target_fat: weekplan.target_fat,
        duration_weeks: weekplan.duration_weeks,
        difficulty: weekplan.difficulty,
        goal: weekplan.goal,
        is_featured: weekplan.is_featured,
        is_public: weekplan.is_public,
        created_at: weekplan.created_at,
        updated_at: weekplan.updated_at
      })) || [];
    }

    if (error) {
      console.error('❌ Error fetching nutrition plans:', error);
      return NextResponse.json({ error: `Failed to fetch nutrition plans: ${error.message}` }, { status: 500 });
    }

    // If no plans exist, create the default nutrition plans
    if (!plans || plans.length === 0) {
      console.log('🔄 Creating default nutrition plans...');
      
      const nutritionPlans = [
        {
          name: 'Carnivoor - Onderhoud',
          description: 'Carnivoor dieet voor behoud van huidige lichaamscompositie. Gebalanceerde macro-verdeling binnen carnivoor kader.',
          target_calories: 2860,
          target_protein: 322, // 45% van calories (2860 * 0.45 / 4)
          target_carbs: 36, // 5% van calories (2860 * 0.05 / 4)
          target_fat: 159, // 50% van calories (2860 * 0.50 / 9)
          duration_weeks: 12,
          difficulty: 'intermediate',
          goal: 'Onderhoud',
          is_featured: true,
          is_public: true
        },
        {
          name: 'Carnivoor - Droogtrainen',
          description: 'Carnivoor dieet geoptimaliseerd voor vetverlies met behoud van spiermassa. Focus op hoge eiwitinname en lage koolhydraten.',
          target_calories: 2360,
          target_protein: 266, // 45% van calories (2360 * 0.45 / 4)
          target_carbs: 30, // 5% van calories (2360 * 0.05 / 4)
          target_fat: 131, // 50% van calories (2360 * 0.50 / 9)
          duration_weeks: 12,
          difficulty: 'intermediate',
          goal: 'Droogtrainen',
          is_featured: true,
          is_public: true
        },
        {
          name: 'Carnivoor - Spiermassa',
          description: 'Carnivoor dieet geoptimaliseerd voor spiergroei en krachttoename. Verhoogde calorie- en eiwitinname.',
          target_calories: 3260,
          target_protein: 367, // 45% van calories (3260 * 0.45 / 4)
          target_carbs: 41, // 5% van calories (3260 * 0.05 / 4)
          target_fat: 181, // 50% van calories (3260 * 0.50 / 9)
          duration_weeks: 12,
          difficulty: 'intermediate',
          goal: 'Spiermassa',
          is_featured: true,
          is_public: true
        },
        {
          name: 'Maaltijdplan normaal - Onderhoud',
          description: 'Gebalanceerd voedingsplan voor behoud van huidige lichaamscompositie. Mix van alle macronutriënten voor optimale gezondheid.',
          target_calories: 2860,
          target_protein: 250, // 35% van calories (2860 * 0.35 / 4)
          target_carbs: 286, // 40% van calories (2860 * 0.40 / 4)
          target_fat: 79, // 25% van calories (2860 * 0.25 / 9)
          duration_weeks: 12,
          difficulty: 'beginner',
          goal: 'Onderhoud',
          is_featured: true,
          is_public: true
        },
        {
          name: 'Maaltijdplan normaal - Droogtrainen',
          description: 'Gebalanceerd voedingsplan geoptimaliseerd voor vetverlies. Gezonde mix van alle voedingsgroepen voor duurzaam gewichtsverlies.',
          target_calories: 2360,
          target_protein: 236, // 40% van calories (2360 * 0.40 / 4)
          target_carbs: 236, // 40% van calories (2360 * 0.40 / 4)
          target_fat: 52, // 20% van calories (2360 * 0.20 / 9)
          duration_weeks: 12,
          difficulty: 'intermediate',
          goal: 'Droogtrainen',
          is_featured: true,
          is_public: true
        },
        {
          name: 'Maaltijdplan normaal - Spiermassa',
          description: 'Gebalanceerd voedingsplan geoptimaliseerd voor spiergroei. Verhoogde calorie-inname met focus op kwaliteitsvoeding.',
          target_calories: 3260,
          target_protein: 245, // 30% van calories (3260 * 0.30 / 4)
          target_carbs: 408, // 50% van calories (3260 * 0.50 / 4)
          target_fat: 72, // 20% van calories (3260 * 0.20 / 9)
          duration_weeks: 12,
          difficulty: 'intermediate',
          goal: 'Spiermassa',
          is_featured: true,
          is_public: true
        }
      ];
      
      try {
        const { data: newPlans, error: insertError } = await supabaseAdmin
          .from('nutrition_plans')
          .insert(nutritionPlans)
          .select();
          
        if (insertError) {
          console.error('❌ Error creating nutrition plans:', insertError);
          // Return empty plans instead of error
          return NextResponse.json({ success: true, plans: [] });
        }
        
        console.log('✅ Nutrition plans created successfully:', newPlans?.length || 0, 'plans');
        return NextResponse.json({ success: true, plans: newPlans || [] });
      } catch (error) {
        console.error('❌ Exception creating nutrition plans:', error);
        // Return empty plans instead of error
        return NextResponse.json({ success: true, plans: [] });
      }
    }

    // Custom sorting order: Carnivoor plans first (droogtrainen, balans, spiermassa), then regular plans in same order
    const sortOrder = [
      'carnivoor-droogtrainen',
      'carnivoor-balans', 
      'carnivoor-spiermassa',
      'voedingsplan-droogtrainen',
      'voedingsplan-balans',
      'voedingsplan-spiermassa'
    ];
    
    if (plans && plans.length > 0) {
      plans.sort((a, b) => {
        const aIndex = sortOrder.indexOf(a.plan_id);
        const bIndex = sortOrder.indexOf(b.plan_id);
        
        // If both plans are in the sort order, sort by their index
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
        
        // If only one is in the sort order, prioritize it
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        
        // If neither is in the sort order, fall back to alphabetical sorting
        return (a.name || '').localeCompare(b.name || '');
      });
      
      console.log('🔄 Plans sorted in custom order:', plans.map(p => p.plan_id || p.name));
    }

    // Transform plans to expose weekly_plan at top level for frontend compatibility
    const transformedPlans = plans?.map(plan => {
      const transformed = { ...plan };
      
      // If weekly_plan is nested in meals, bring it to top level
      if (plan.meals && plan.meals.weekly_plan && !plan.weekly_plan) {
        transformed.weekly_plan = plan.meals.weekly_plan;
        console.log(`🔄 Exposed weekly_plan for plan: ${plan.name}`);
      }
      
      return transformed;
    }) || [];

    console.log('✅ Nutrition plans fetched successfully:', transformedPlans?.length || 0, 'plans');
    return NextResponse.json({ success: true, plans: transformedPlans });
  } catch (error) {
    console.error('❌ Error in nutrition plans API:', error);
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 Creating new nutrition plan:', body);
    
    const { 
      name, 
      description, 
      target_calories, 
      target_protein, 
      target_carbs, 
      target_fat, 
      duration_weeks, 
      difficulty, 
      goal,
      fitness_goal,
      daily_plans
    } = body;

    // Generate plan_id from name
    const plan_id = name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    // Transform daily_plans to weekly_plan structure for frontend compatibility
    const weeklyPlan = {};
    const dayMapping = {
      'monday': 'monday',
      'tuesday': 'tuesday', 
      'wednesday': 'wednesday',
      'thursday': 'thursday',
      'friday': 'friday',
      'saturday': 'saturday',
      'sunday': 'sunday'
    };

    if (daily_plans && Array.isArray(daily_plans)) {
      daily_plans.forEach(dailyPlan => {
        const dayKey = dayMapping[dailyPlan.day];
        if (dayKey && dailyPlan.meals) {
          weeklyPlan[dayKey] = {
            ontbijt: dailyPlan.meals.ontbijt?.ingredients || [],
            ochtend_snack: dailyPlan.meals.snack1?.ingredients || dailyPlan.meals.ochtend_snack?.ingredients || [],
            lunch: dailyPlan.meals.lunch?.ingredients || [],
            lunch_snack: dailyPlan.meals.snack2?.ingredients || dailyPlan.meals.lunch_snack?.ingredients || [],
            diner: dailyPlan.meals.diner?.ingredients || [],
            avond_snack: dailyPlan.meals.avond_snack?.ingredients || [],
            dailyTotals: {
              calories: (dailyPlan.meals.ontbijt?.calories || 0) + 
                       (dailyPlan.meals.snack1?.calories || dailyPlan.meals.ochtend_snack?.calories || 0) +
                       (dailyPlan.meals.lunch?.calories || 0) + 
                       (dailyPlan.meals.snack2?.calories || dailyPlan.meals.lunch_snack?.calories || 0) +
                       (dailyPlan.meals.diner?.calories || 0) + 
                       (dailyPlan.meals.avond_snack?.calories || 0),
              protein: (dailyPlan.meals.ontbijt?.protein || 0) + 
                      (dailyPlan.meals.snack1?.protein || dailyPlan.meals.ochtend_snack?.protein || 0) +
                      (dailyPlan.meals.lunch?.protein || 0) + 
                      (dailyPlan.meals.snack2?.protein || dailyPlan.meals.lunch_snack?.protein || 0) +
                      (dailyPlan.meals.diner?.protein || 0) + 
                      (dailyPlan.meals.avond_snack?.protein || 0),
              carbs: (dailyPlan.meals.ontbijt?.carbs || 0) + 
                    (dailyPlan.meals.snack1?.carbs || dailyPlan.meals.ochtend_snack?.carbs || 0) +
                    (dailyPlan.meals.lunch?.carbs || 0) + 
                    (dailyPlan.meals.snack2?.carbs || dailyPlan.meals.lunch_snack?.carbs || 0) +
                    (dailyPlan.meals.diner?.carbs || 0) + 
                    (dailyPlan.meals.avond_snack?.carbs || 0),
              fat: (dailyPlan.meals.ontbijt?.fat || 0) + 
                  (dailyPlan.meals.snack1?.fat || dailyPlan.meals.ochtend_snack?.fat || 0) +
                  (dailyPlan.meals.lunch?.fat || 0) + 
                  (dailyPlan.meals.snack2?.fat || dailyPlan.meals.lunch_snack?.fat || 0) +
                  (dailyPlan.meals.diner?.fat || 0) + 
                  (dailyPlan.meals.avond_snack?.fat || 0)
            }
          };
        }
      });
    }

    // Calculate weekly averages
    const days = Object.keys(weeklyPlan);
    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
    
    days.forEach(day => {
      const dayTotals = weeklyPlan[day].dailyTotals;
      totalCalories += dayTotals.calories;
      totalProtein += dayTotals.protein;
      totalCarbs += dayTotals.carbs;
      totalFat += dayTotals.fat;
    });

    const weeklyAverages = {
      calories: days.length > 0 ? Math.round(totalCalories / days.length) : target_calories || 2000,
      protein: days.length > 0 ? Math.round((totalProtein / days.length) * 10) / 10 : target_protein || 150,
      carbs: days.length > 0 ? Math.round((totalCarbs / days.length) * 10) / 10 : target_carbs || 200,
      fat: days.length > 0 ? Math.round((totalFat / days.length) * 10) / 10 : target_fat || 70
    };

    // Create meals object for frontend compatibility
    const mealsData = {
      target_calories: target_calories || weeklyAverages.calories,
      target_protein: target_protein || weeklyAverages.protein,
      target_carbs: target_carbs || weeklyAverages.carbs,
      target_fat: target_fat || weeklyAverages.fat,
      goal: goal || fitness_goal || 'maintenance',
      fitness_goal: fitness_goal || goal,
      weekly_plan: weeklyPlan,
      weekly_averages: weeklyAverages
    };

    const { data: plan, error } = await supabaseAdmin
      .from('nutrition_plans')
      .insert({
        plan_id,
        name,
        description,
        meals: mealsData,
        is_active: true,
        is_featured: true,
        is_public: true
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating nutrition plan:', error);
      return NextResponse.json({ error: 'Failed to create nutrition plan' }, { status: 500 });
    }

    console.log('✅ Nutrition plan created successfully:', plan.plan_id);
    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error('❌ Error in nutrition plans POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('✏️ Updating nutrition plan:', body);
    console.log('🔍 DEBUG: Request method:', request.method);
    console.log('🔍 DEBUG: Request headers:', Object.fromEntries(request.headers.entries()));
    console.log('🔍 DEBUG: Request body keys:', Object.keys(body));
    
    const { id, daily_plans, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required for update' }, { status: 400 });
    }

    // Get current plan data
    const { data: currentPlan, error: fetchError } = await supabaseAdmin
      .from('nutrition_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentPlan) {
      console.error('❌ Error fetching current plan for update:', fetchError);
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    let finalUpdateData = { ...updateData };

    // If daily_plans are provided, transform them to weekly_plan structure
    if (daily_plans && Array.isArray(daily_plans)) {
      console.log('🔄 Transforming daily_plans to weekly_plan structure');
      
      const weeklyPlan = {};
      const dayMapping = {
        'maandag': 'maandag',
        'dinsdag': 'dinsdag', 
        'woensdag': 'woensdag',
        'donderdag': 'donderdag',
        'vrijdag': 'vrijdag',
        'zaterdag': 'zaterdag',
        'zondag': 'zondag'
      };

      daily_plans.forEach(dailyPlan => {
        const dayKey = dayMapping[dailyPlan.day];
        if (dayKey && dailyPlan.meals) {
          // Create meal objects in the correct format for database storage
          const createMealObject = (meal: any, defaultTime: string) => {
            if (!meal) {
              return {
                time: defaultTime,
                ingredients: [],
                nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 }
              };
            }
            
            return {
              time: defaultTime,
              ingredients: meal.ingredients || [],
              nutrition: {
                calories: meal.calories || 0,
                protein: meal.protein || 0,
                carbs: meal.carbs || 0,
                fat: meal.fat || 0
              }
            };
          };
          
          weeklyPlan[dayKey] = {
            ontbijt: createMealObject(dailyPlan.meals.ontbijt, '07:00'),
            ochtend_snack: createMealObject(dailyPlan.meals.snack1, '10:00'),
            lunch: createMealObject(dailyPlan.meals.lunch, '12:00'),
            lunch_snack: createMealObject(dailyPlan.meals.snack2, '15:00'),
            diner: createMealObject(dailyPlan.meals.diner, '18:00'),
            dailyTotals: {
              calories: (dailyPlan.meals.ontbijt?.calories || 0) + 
                       (dailyPlan.meals.snack1?.calories || dailyPlan.meals.ochtend_snack?.calories || 0) +
                       (dailyPlan.meals.lunch?.calories || 0) + 
                       (dailyPlan.meals.snack2?.calories || dailyPlan.meals.lunch_snack?.calories || 0) +
                       (dailyPlan.meals.diner?.calories || 0) + 
                       (dailyPlan.meals.avond_snack?.calories || 0),
              protein: (dailyPlan.meals.ontbijt?.protein || 0) + 
                      (dailyPlan.meals.snack1?.protein || dailyPlan.meals.ochtend_snack?.protein || 0) +
                      (dailyPlan.meals.lunch?.protein || 0) + 
                      (dailyPlan.meals.snack2?.protein || dailyPlan.meals.lunch_snack?.protein || 0) +
                      (dailyPlan.meals.diner?.protein || 0) + 
                      (dailyPlan.meals.avond_snack?.protein || 0),
              carbs: (dailyPlan.meals.ontbijt?.carbs || 0) + 
                    (dailyPlan.meals.snack1?.carbs || dailyPlan.meals.ochtend_snack?.carbs || 0) +
                    (dailyPlan.meals.lunch?.carbs || 0) + 
                    (dailyPlan.meals.snack2?.carbs || dailyPlan.meals.lunch_snack?.carbs || 0) +
                    (dailyPlan.meals.diner?.carbs || 0) + 
                    (dailyPlan.meals.avond_snack?.carbs || 0),
              fat: (dailyPlan.meals.ontbijt?.fat || 0) + 
                  (dailyPlan.meals.snack1?.fat || dailyPlan.meals.ochtend_snack?.fat || 0) +
                  (dailyPlan.meals.lunch?.fat || 0) + 
                  (dailyPlan.meals.snack2?.fat || dailyPlan.meals.lunch_snack?.fat || 0) +
                  (dailyPlan.meals.diner?.fat || 0) + 
                  (dailyPlan.meals.avond_snack?.fat || 0)
            }
          };
        }
      });

      // Calculate weekly averages
      const days = Object.keys(weeklyPlan);
      let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
      
      days.forEach(day => {
        const dayTotals = weeklyPlan[day].dailyTotals;
        totalCalories += dayTotals.calories;
        totalProtein += dayTotals.protein;
        totalCarbs += dayTotals.carbs;
        totalFat += dayTotals.fat;
      });

      const weeklyAverages = {
        calories: days.length > 0 ? Math.round(totalCalories / days.length) : finalUpdateData.target_calories || 2000,
        protein: days.length > 0 ? Math.round((totalProtein / days.length) * 10) / 10 : finalUpdateData.target_protein || 150,
        carbs: days.length > 0 ? Math.round((totalCarbs / days.length) * 10) / 10 : finalUpdateData.target_carbs || 200,
        fat: days.length > 0 ? Math.round((totalFat / days.length) * 10) / 10 : finalUpdateData.target_fat || 70
      };

      // Update meals object while preserving existing data
      const currentMeals = currentPlan.meals || {};
      finalUpdateData.meals = {
        ...currentMeals,
        target_calories: finalUpdateData.target_calories || weeklyAverages.calories,
        target_protein: finalUpdateData.target_protein || weeklyAverages.protein,
        target_carbs: finalUpdateData.target_carbs || weeklyAverages.carbs,
        target_fat: finalUpdateData.target_fat || weeklyAverages.fat,
        goal: finalUpdateData.goal || finalUpdateData.fitness_goal || currentMeals.goal,
        fitness_goal: finalUpdateData.fitness_goal || finalUpdateData.goal || currentMeals.fitness_goal,
        weekly_plan: weeklyPlan,
        weekly_averages: weeklyAverages
      };

      // Update plan_id if name changed
      if (finalUpdateData.name && finalUpdateData.name !== currentPlan.name) {
        finalUpdateData.plan_id = finalUpdateData.name.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .trim();
      }
    }

    finalUpdateData.updated_at = new Date().toISOString();

    // Convert target values to integers for database (it expects integer type)
    if (finalUpdateData.target_calories !== undefined) {
      finalUpdateData.target_calories = Math.round(finalUpdateData.target_calories);
    }
    if (finalUpdateData.target_protein !== undefined) {
      finalUpdateData.target_protein = Math.round(finalUpdateData.target_protein);
    }
    if (finalUpdateData.target_carbs !== undefined) {
      finalUpdateData.target_carbs = Math.round(finalUpdateData.target_carbs);
    }
    if (finalUpdateData.target_fat !== undefined) {
      finalUpdateData.target_fat = Math.round(finalUpdateData.target_fat);
    }

    console.log('🔄 Final update data with integer targets:', {
      target_calories: finalUpdateData.target_calories,
      target_protein: finalUpdateData.target_protein,
      target_carbs: finalUpdateData.target_carbs,
      target_fat: finalUpdateData.target_fat
    });

    const { data: plan, error } = await supabaseAdmin
      .from('nutrition_plans')
      .update(finalUpdateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating nutrition plan:', error);
      return NextResponse.json({ error: 'Failed to update nutrition plan' }, { status: 500 });
    }

    console.log('✅ Nutrition plan updated successfully:', plan.plan_id);
    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error('❌ Error in nutrition plans PUT API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required for deletion' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('nutrition_plans')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting nutrition plan:', error);
      return NextResponse.json({ error: 'Failed to delete nutrition plan' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Nutrition plan deleted successfully' });
  } catch (error) {
    console.error('Error in nutrition plans API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 