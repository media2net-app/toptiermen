import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching nutrition plans from database...');
    
    // First try to get from nutrition_plans table
    let { data: plans, error } = await supabaseAdmin
      .from('nutrition_plans')
      .select('*')
      .order('name');

    // If no plans in nutrition_plans, try nutrition_weekplans table
    if (!plans || plans.length === 0) {
      console.log('📊 No plans in nutrition_plans, trying nutrition_weekplans...');
      
      const { data: weekplans, error: weekplansError } = await supabaseAdmin
        .from('nutrition_weekplans')
        .select('*')
        .order('name');
        
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

    // If no plans exist, create the default Carnivoor plans
    if (!plans || plans.length === 0) {
      console.log('🔄 Creating default Carnivoor plans...');
      
      const carnivoorPlans = [
        {
          name: 'Carnivoor - Droogtrainen',
          description: 'Carnivoor dieet geoptimaliseerd voor vetverlies met behoud van spiermassa. Focus op hoge eiwitinname en lage koolhydraten.',
          target_calories: 1870,
          target_protein: 198,
          target_carbs: 154,
          target_fat: 66,
          duration_weeks: 12,
          difficulty: 'intermediate',
          goal: 'Droogtrainen',
          is_featured: true,
          is_public: true
        },
        {
          name: 'Carnivoor - Onderhoud',
          description: 'Carnivoor dieet voor behoud van huidige lichaamscompositie. Gebalanceerde macro-verdeling binnen carnivoor kader.',
          target_calories: 2200,
          target_protein: 165,
          target_carbs: 220,
          target_fat: 73,
          duration_weeks: 12,
          difficulty: 'beginner',
          goal: 'Onderhoud',
          is_featured: true,
          is_public: true
        },
        {
          name: 'Carnivoor - Spiermassa',
          description: 'Carnivoor dieet geoptimaliseerd voor spiergroei en krachttoename. Verhoogde calorie- en eiwitinname.',
          target_calories: 2530,
          target_protein: 215,
          target_carbs: 264,
          target_fat: 80,
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
          .insert(carnivoorPlans)
          .select();
          
        if (insertError) {
          console.error('❌ Error creating Carnivoor plans:', insertError);
          // Return empty plans instead of error
          return NextResponse.json({ success: true, plans: [] });
        }
        
        console.log('✅ Carnivoor plans created successfully:', newPlans?.length || 0, 'plans');
        return NextResponse.json({ success: true, plans: newPlans || [] });
      } catch (error) {
        console.error('❌ Exception creating Carnivoor plans:', error);
        // Return empty plans instead of error
        return NextResponse.json({ success: true, plans: [] });
      }
    }

    console.log('✅ Nutrition plans fetched successfully:', plans?.length || 0, 'plans');
    return NextResponse.json({ success: true, plans: plans || [] });
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
            ochtend_snack: dailyPlan.meals.ochtend_snack?.ingredients || [],
            lunch: dailyPlan.meals.lunch?.ingredients || [],
            lunch_snack: dailyPlan.meals.lunch_snack?.ingredients || [],
            diner: dailyPlan.meals.diner?.ingredients || [],
            avond_snack: dailyPlan.meals.avond_snack?.ingredients || [],
            dailyTotals: {
              calories: (dailyPlan.meals.ontbijt?.calories || 0) + 
                       (dailyPlan.meals.ochtend_snack?.calories || 0) +
                       (dailyPlan.meals.lunch?.calories || 0) + 
                       (dailyPlan.meals.lunch_snack?.calories || 0) +
                       (dailyPlan.meals.diner?.calories || 0) + 
                       (dailyPlan.meals.avond_snack?.calories || 0),
              protein: (dailyPlan.meals.ontbijt?.protein || 0) + 
                      (dailyPlan.meals.ochtend_snack?.protein || 0) +
                      (dailyPlan.meals.lunch?.protein || 0) + 
                      (dailyPlan.meals.lunch_snack?.protein || 0) +
                      (dailyPlan.meals.diner?.protein || 0) + 
                      (dailyPlan.meals.avond_snack?.protein || 0),
              carbs: (dailyPlan.meals.ontbijt?.carbs || 0) + 
                    (dailyPlan.meals.ochtend_snack?.carbs || 0) +
                    (dailyPlan.meals.lunch?.carbs || 0) + 
                    (dailyPlan.meals.lunch_snack?.carbs || 0) +
                    (dailyPlan.meals.diner?.carbs || 0) + 
                    (dailyPlan.meals.avond_snack?.carbs || 0),
              fat: (dailyPlan.meals.ontbijt?.fat || 0) + 
                  (dailyPlan.meals.ochtend_snack?.fat || 0) +
                  (dailyPlan.meals.lunch?.fat || 0) + 
                  (dailyPlan.meals.lunch_snack?.fat || 0) +
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
        'monday': 'monday',
        'tuesday': 'tuesday', 
        'wednesday': 'wednesday',
        'thursday': 'thursday',
        'friday': 'friday',
        'saturday': 'saturday',
        'sunday': 'sunday'
      };

      daily_plans.forEach(dailyPlan => {
        const dayKey = dayMapping[dailyPlan.day];
        if (dayKey && dailyPlan.meals) {
          weeklyPlan[dayKey] = {
            ontbijt: dailyPlan.meals.ontbijt?.ingredients || [],
            ochtend_snack: dailyPlan.meals.ochtend_snack?.ingredients || [],
            lunch: dailyPlan.meals.lunch?.ingredients || [],
            lunch_snack: dailyPlan.meals.lunch_snack?.ingredients || [],
            diner: dailyPlan.meals.diner?.ingredients || [],
            avond_snack: dailyPlan.meals.avond_snack?.ingredients || [],
            dailyTotals: {
              calories: (dailyPlan.meals.ontbijt?.calories || 0) + 
                       (dailyPlan.meals.ochtend_snack?.calories || 0) +
                       (dailyPlan.meals.lunch?.calories || 0) + 
                       (dailyPlan.meals.lunch_snack?.calories || 0) +
                       (dailyPlan.meals.diner?.calories || 0) + 
                       (dailyPlan.meals.avond_snack?.calories || 0),
              protein: (dailyPlan.meals.ontbijt?.protein || 0) + 
                      (dailyPlan.meals.ochtend_snack?.protein || 0) +
                      (dailyPlan.meals.lunch?.protein || 0) + 
                      (dailyPlan.meals.lunch_snack?.protein || 0) +
                      (dailyPlan.meals.diner?.protein || 0) + 
                      (dailyPlan.meals.avond_snack?.protein || 0),
              carbs: (dailyPlan.meals.ontbijt?.carbs || 0) + 
                    (dailyPlan.meals.ochtend_snack?.carbs || 0) +
                    (dailyPlan.meals.lunch?.carbs || 0) + 
                    (dailyPlan.meals.lunch_snack?.carbs || 0) +
                    (dailyPlan.meals.diner?.carbs || 0) + 
                    (dailyPlan.meals.avond_snack?.carbs || 0),
              fat: (dailyPlan.meals.ontbijt?.fat || 0) + 
                  (dailyPlan.meals.ochtend_snack?.fat || 0) +
                  (dailyPlan.meals.lunch?.fat || 0) + 
                  (dailyPlan.meals.lunch_snack?.fat || 0) +
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