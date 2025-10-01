import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Frontend fetching nutrition plans from database...');
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const goal = searchParams.get('goal');
    const featured = searchParams.get('featured');

    // Get all plans from nutrition_plans table (same as admin interface)
    let query = supabaseAdmin
      .from('nutrition_plans')
      .select('*')
      .eq('is_active', true);

    // Add filters if provided
    if (category) {
      query = query.eq('category', category);
    }
    if (goal) {
      // For goal filtering, check both 'goal' and 'meals.goal' fields
      query = query.or(`goal.eq.${goal},meals->goal.eq.${goal}`);
    }
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    // Execute query with proper ordering
    const { data: plans, error } = await query.order('name');

    if (error) {
      console.error('❌ Error fetching nutrition plans:', error);
      return NextResponse.json({ error: 'Failed to fetch nutrition plans' }, { status: 500 });
    }

    // Transform the data to include frontend-compatible fields
    const transformedPlans = (plans || []).map(plan => ({
      id: plan.id,
      plan_id: plan.plan_id,
      name: plan.name,
      subtitle: plan.subtitle,
      description: plan.description,
      icon: plan.icon,
      color: plan.color,
      meals: plan.meals,
      is_active: plan.is_active,
      is_featured: plan.is_featured || false,
      is_public: plan.is_public || true,
      goal: plan.goal,
      fitness_goal: plan.fitness_goal,
      target_calories: plan.meals?.target_calories || plan.target_calories,
      target_protein: plan.meals?.target_protein || plan.target_protein,
      target_carbs: plan.meals?.target_carbs || plan.target_carbs,
      target_fat: plan.meals?.target_fat || plan.target_fat,
      // Add macro percentages for frontend calculation
      protein_percentage: plan.protein_percentage,
      carbs_percentage: plan.carbs_percentage,
      fat_percentage: plan.fat_percentage,
      created_at: plan.created_at,
      updated_at: plan.updated_at
    }));

    // Exclude test V2 plans from public frontend by default
    const filteredForFrontend = transformedPlans.filter(p => !String(p.plan_id || '').endsWith('-v2'));

    console.log(`✅ Frontend nutrition plans fetched successfully: ${filteredForFrontend.length} plans (V2 hidden)`);
    
    return NextResponse.json({ 
      success: true, 
      plans: filteredForFrontend
    });

  } catch (error) {
    console.error('❌ Error in nutrition plans API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();

    if (!plan) {
      return NextResponse.json({ error: 'Plan data is required' }, { status: 400 });
    }

    const { data: newPlan, error } = await supabaseAdmin
      .from('nutrition_plans')
      .insert(plan)
      .select()
      .single();

    if (error) {
      console.error('Error creating nutrition plan:', error);
      return NextResponse.json({ error: 'Failed to create nutrition plan' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      plan: newPlan 
    });

  } catch (error) {
    console.error('Error in nutrition plans POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
