import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching nutrition plans...');
    
    // Get all nutrition plans from database with explicit column selection
    const { data: plans, error } = await supabaseAdmin
      .from('nutrition_plans')
      .select(`
        id,
        plan_id,
        name,
        description,
        target_calories,
        target_protein,
        target_carbs,
        target_fat,
        protein_percentage,
        carbs_percentage,
        fat_percentage,
        duration_weeks,
        difficulty,
        goal,
        is_featured,
        is_public,
        meals,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('❌ Error fetching nutrition plans:', error);
      return NextResponse.json({ error: `Failed to fetch nutrition plans: ${error.message}` }, { status: 500 });
    }

    // If no plans exist, create the default 6 nutrition plans
    if (!plans || plans.length === 0) {
      console.log('🔄 Creating default nutrition plans...');
      
      const defaultPlans = [
        {
          plan_id: 'carnivoor-droogtrainen',
          name: 'Carnivoor - Droogtrainen',
          description: 'Carnivoor dieet geoptimaliseerd voor vetverlies met behoud van spiermassa. Focus op hoge eiwitinname en lage koolhydraten.',
          target_calories: 2360,
          target_protein: 207, // 35% van calories (2360 * 0.35 / 4)
          target_carbs: 30, // 5% van calories (2360 * 0.05 / 4)
          target_fat: 157, // 60% van calories (2360 * 0.60 / 9)
          duration_weeks: 12,
          difficulty: 'intermediate',
          goal: 'Droogtrainen',
          is_featured: true,
          is_public: true,
          meals: {
            target_calories: 2360,
            target_protein: 207,
            target_carbs: 30,
            target_fat: 157,
            goal: 'Droogtrainen',
            fitness_goal: 'droogtrainen',
            weekly_plan: {
              maandag: {},
              dinsdag: {},
              woensdag: {},
              donderdag: {},
              vrijdag: {},
              zaterdag: {},
              zondag: {}
            },
            weekly_averages: { calories: 0, protein: 0, carbs: 0, fat: 0 }
          }
        },
        {
          plan_id: 'carnivoor-onderhoud',
          name: 'Carnivoor - Onderhoud',
          description: 'Carnivoor dieet voor behoud van huidige lichaamscompositie. Gebalanceerde macro-verdeling binnen carnivoor kader.',
          target_calories: 2860,
          target_protein: 250, // 35% van calories (2860 * 0.35 / 4)
          target_carbs: 36, // 5% van calories (2860 * 0.05 / 4)
          target_fat: 191, // 60% van calories (2860 * 0.60 / 9)
          duration_weeks: 12,
          difficulty: 'intermediate',
          goal: 'Onderhoud',
          is_featured: true,
          is_public: true,
          meals: {
            target_calories: 2860,
            target_protein: 250,
            target_carbs: 36,
            target_fat: 191,
            goal: 'Onderhoud',
            fitness_goal: 'onderhoud',
            weekly_plan: {
              maandag: {},
              dinsdag: {},
              woensdag: {},
              donderdag: {},
              vrijdag: {},
              zaterdag: {},
              zondag: {}
            },
            weekly_averages: { calories: 0, protein: 0, carbs: 0, fat: 0 }
          }
        },
        {
          plan_id: 'carnivoor-spiermassa',
          name: 'Carnivoor - Spiermassa',
          description: 'Carnivoor dieet geoptimaliseerd voor spiergroei en krachttoename. Verhoogde calorie-inname met focus op eiwitrijke voeding.',
          target_calories: 3260,
          target_protein: 285, // 35% van calories (3260 * 0.35 / 4)
          target_carbs: 41, // 5% van calories (3260 * 0.05 / 4)
          target_fat: 218, // 60% van calories (3260 * 0.60 / 9)
          duration_weeks: 12,
          difficulty: 'intermediate',
          goal: 'Spiermassa',
          is_featured: true,
          is_public: true,
          meals: {
            target_calories: 3260,
            target_protein: 285,
            target_carbs: 41,
            target_fat: 218,
            goal: 'Spiermassa',
            fitness_goal: 'spiermassa',
            weekly_plan: {
              maandag: {},
              dinsdag: {},
              woensdag: {},
              donderdag: {},
              vrijdag: {},
              zaterdag: {},
              zondag: {}
            },
            weekly_averages: { calories: 0, protein: 0, carbs: 0, fat: 0 }
          }
        },
        {
          plan_id: 'voedingsplan-droogtrainen',
          name: 'Voedingsplan - Droogtrainen',
          description: 'Gebalanceerd voedingsplan voor vetverlies met behoud van spiermassa. Focus op eiwitrijke voeding en gecontroleerde calorie-inname.',
          target_calories: 2360,
          target_protein: 236, // 40% van calories (2360 * 0.40 / 4)
          target_carbs: 236, // 40% van calories (2360 * 0.40 / 4)
          target_fat: 79, // 20% van calories (2360 * 0.20 / 9)
          duration_weeks: 12,
          difficulty: 'intermediate',
          goal: 'Droogtrainen',
          is_featured: true,
          is_public: true,
          meals: {
            target_calories: 2360,
            target_protein: 236,
            target_carbs: 236,
            target_fat: 79,
            goal: 'Droogtrainen',
            fitness_goal: 'droogtrainen',
            weekly_plan: {
              maandag: {},
              dinsdag: {},
              woensdag: {},
              donderdag: {},
              vrijdag: {},
              zaterdag: {},
              zondag: {}
            },
            weekly_averages: { calories: 0, protein: 0, carbs: 0, fat: 0 }
          }
        },
        {
          plan_id: 'voedingsplan-onderhoud',
          name: 'Voedingsplan - Onderhoud',
          description: 'Gebalanceerd voedingsplan voor behoud van huidige lichaamscompositie. Geoptimaliseerde macro-verdeling voor duurzaam resultaat.',
          target_calories: 2860,
          target_protein: 214, // 30% van calories (2860 * 0.30 / 4)
          target_carbs: 357, // 50% van calories (2860 * 0.50 / 4)
          target_fat: 95, // 20% van calories (2860 * 0.20 / 9)
          duration_weeks: 12,
          difficulty: 'intermediate',
          goal: 'Onderhoud',
          is_featured: true,
          is_public: true,
          meals: {
            target_calories: 2860,
            target_protein: 214,
            target_carbs: 357,
            target_fat: 95,
            goal: 'Onderhoud',
            fitness_goal: 'onderhoud',
            weekly_plan: {
              maandag: {},
              dinsdag: {},
              woensdag: {},
              donderdag: {},
              vrijdag: {},
              zaterdag: {},
              zondag: {}
            },
            weekly_averages: { calories: 0, protein: 0, carbs: 0, fat: 0 }
          }
        },
        {
          plan_id: 'voedingsplan-spiermassa',
          name: 'Voedingsplan - Spiermassa',
          description: 'Gebalanceerd voedingsplan voor spiergroei en krachttoename. Verhoogde calorie-inname met focus op eiwitrijke voeding en complexe koolhydraten.',
          target_calories: 3260,
          target_protein: 245, // 30% van calories (3260 * 0.30 / 4)
          target_carbs: 408, // 50% van calories (3260 * 0.50 / 4)
          target_fat: 108, // 20% van calories (3260 * 0.20 / 9)
          duration_weeks: 12,
          difficulty: 'intermediate',
          goal: 'Spiermassa',
          is_featured: true,
          is_public: true,
          meals: {
            target_calories: 3260,
            target_protein: 245,
            target_carbs: 408,
            target_fat: 108,
            goal: 'Spiermassa',
            fitness_goal: 'spiermassa',
            weekly_plan: {
              maandag: {},
              dinsdag: {},
              woensdag: {},
              donderdag: {},
              vrijdag: {},
              zaterdag: {},
              zondag: {}
            },
            weekly_averages: { calories: 0, protein: 0, carbs: 0, fat: 0 }
          }
        }
      ];
      
      try {
        const { data: newPlans, error: insertError } = await supabaseAdmin
          .from('nutrition_plans')
          .insert(defaultPlans)
          .select(`
            id,
            plan_id,
            name,
            description,
            target_calories,
            target_protein,
            target_carbs,
            target_fat,
            duration_weeks,
            difficulty,
            goal,
            is_featured,
            is_public,
            meals,
            created_at,
            updated_at
          `);
          
        if (insertError) {
          console.error('❌ Error creating nutrition plans:', insertError);
          return NextResponse.json({ error: `Failed to create nutrition plans: ${insertError.message}` }, { status: 500 });
        }
        
        console.log('✅ Nutrition plans created successfully:', newPlans?.length || 0, 'plans');
        return NextResponse.json({ success: true, plans: newPlans || [] });
      } catch (error) {
        console.error('❌ Exception creating nutrition plans:', error);
        return NextResponse.json({ error: `Failed to create nutrition plans: ${error.message}` }, { status: 500 });
      }
    }

    // Custom sorting order: Carnivoor plans first, then regular plans
    const sortOrder = [
      'carnivoor-droogtrainen',
      'carnivoor-onderhoud', 
      'carnivoor-spiermassa',
      'voedingsplan-droogtrainen',
      'voedingsplan-onderhoud',
      'voedingsplan-spiermassa'
    ];
    
    if (plans && plans.length > 0) {
      plans.sort((a, b) => {
        const aIndex = sortOrder.indexOf(a.plan_id);
        const bIndex = sortOrder.indexOf(b.plan_id);
        
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
        
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        
        return (a.name || '').localeCompare(b.name || '');
      });
      
      console.log('🔄 Plans sorted in custom order:', plans.map(p => p.plan_id || p.name));
    }

    // Transform plans to expose weekly_plan at top level for frontend compatibility
    const transformedPlans = plans?.map(plan => {
      const transformed = { ...plan };
      
      // If weekly_plan is nested in meals, bring it to top level
      if (plan.meals && (plan.meals as any).weekly_plan && !(plan as any).weekly_plan) {
        (transformed as any).weekly_plan = (plan.meals as any).weekly_plan;
        console.log(`🔄 Exposed weekly_plan for plan: ${plan.name}`);
      }
      
      return transformed;
    }) || [];

    console.log('✅ Successfully fetched nutrition plans:', transformedPlans.length);
    return NextResponse.json({ success: true, plans: transformedPlans });
    
  } catch (error) {
    console.error('❌ Unexpected error in GET /api/admin/nutrition-plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      target_calories,
      target_protein,
      target_carbs,
      target_fat,
      protein_percentage,
      carbs_percentage,
      fat_percentage,
      duration_weeks,
      difficulty,
      goal,
      is_featured,
      is_public
    } = body;

    // Generate plan_id from name
    const plan_id = name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');

    // Create meals object with empty weekly plan
    const meals = {
      target_calories: target_calories || 2200,
      target_protein: target_protein || 165,
      target_carbs: target_carbs || 220,
      target_fat: target_fat || 73,
      goal: goal || 'onderhoud',
      fitness_goal: goal || 'onderhoud',
      weekly_plan: {
        maandag: {},
        dinsdag: {},
        woensdag: {},
        donderdag: {},
        vrijdag: {},
        zaterdag: {},
        zondag: {}
      },
      weekly_averages: { calories: 0, protein: 0, carbs: 0, fat: 0 }
    };

    const { data: plan, error } = await supabaseAdmin
      .from('nutrition_plans')
      .insert({
        plan_id,
        name,
        description,
        target_calories: target_calories || 2200,
        target_protein: target_protein || 165,
        target_carbs: target_carbs || 220,
        target_fat: target_fat || 73,
        protein_percentage,
        carbs_percentage,
        fat_percentage,
        duration_weeks: duration_weeks || 12,
        difficulty: difficulty || 'intermediate',
        goal: goal || 'onderhoud',
        is_featured: is_featured || false,
        is_public: is_public || true,
        meals
      })
      .select(`
        id,
        plan_id,
        name,
        description,
        target_calories,
        target_protein,
        target_carbs,
        target_fat,
        protein_percentage,
        carbs_percentage,
        fat_percentage,
        duration_weeks,
        difficulty,
        goal,
        is_featured,
        is_public,
        meals,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error('❌ Error creating nutrition plan:', error);
      return NextResponse.json({ error: `Failed to create nutrition plan: ${error.message}` }, { status: 500 });
    }

    console.log('✅ Nutrition plan created successfully:', plan.plan_id);
    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error('❌ Unexpected error in POST /api/admin/nutrition-plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required for update' }, { status: 400 });
    }

    // Get current plan data with explicit column selection
    const { data: currentPlan, error: fetchError } = await supabaseAdmin
      .from('nutrition_plans')
      .select(`
        id,
        plan_id,
        name,
        description,
        target_calories,
        target_protein,
        target_carbs,
        target_fat,
        protein_percentage,
        carbs_percentage,
        fat_percentage,
        duration_weeks,
        difficulty,
        goal,
        is_featured,
        is_public,
        meals,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching current plan:', fetchError);
      return NextResponse.json({ error: `Failed to fetch current plan: ${fetchError.message}` }, { status: 500 });
    }

    if (!currentPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Prepare update data
    const finalUpdateData = { ...updateData };

    // Update plan_id if name changed
    if (finalUpdateData.name && finalUpdateData.name !== currentPlan.name) {
      finalUpdateData.plan_id = finalUpdateData.name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');
    }

    // If meals data is being updated, ensure proper structure
    if (finalUpdateData.meals) {
      const currentMeals = currentPlan.meals || {};
      finalUpdateData.meals = {
        ...currentMeals,
        ...finalUpdateData.meals
      };
    }

    // Explicitly select all columns to refresh schema cache
    const { data: plan, error } = await supabaseAdmin
      .from('nutrition_plans')
      .update(finalUpdateData)
      .eq('id', id)
      .select(`
        id,
        plan_id,
        name,
        description,
        target_calories,
        target_protein,
        target_carbs,
        target_fat,
        protein_percentage,
        carbs_percentage,
        fat_percentage,
        duration_weeks,
        difficulty,
        goal,
        is_featured,
        is_public,
        meals,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error('❌ Error updating nutrition plan:', error);
      return NextResponse.json({ error: `Failed to update nutrition plan: ${error.message}` }, { status: 500 });
    }

    console.log('✅ Nutrition plan updated successfully:', plan.plan_id);
    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error('❌ Unexpected error in PUT /api/admin/nutrition-plans:', error);
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
      console.error('❌ Error deleting nutrition plan:', error);
      return NextResponse.json({ error: `Failed to delete nutrition plan: ${error.message}` }, { status: 500 });
    }

    console.log('✅ Nutrition plan deleted successfully:', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Unexpected error in DELETE /api/admin/nutrition-plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}