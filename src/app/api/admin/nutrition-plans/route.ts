import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching nutrition plans from database...');
    
    const { data: plans, error } = await supabaseAdmin
      .from('nutrition_plans')
      .select('*')
      .order('name');

    if (error) {
      console.error('❌ Error fetching nutrition plans:', error);
      return NextResponse.json({ error: `Failed to fetch nutrition plans: ${error.message}` }, { status: 500 });
    }

    // If no plans exist or we need to reset to Carnivoor only, create the default Carnivoor plans
    if (!plans || plans.length === 0 || plans.some(p => !p.name.startsWith('Carnivoor'))) {
      console.log('🔄 Creating default Carnivoor plans...');
      
      // Delete all existing plans first
      await supabaseAdmin.from('nutrition_plans').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
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
      
      const { data: newPlans, error: insertError } = await supabaseAdmin
        .from('nutrition_plans')
        .insert(carnivoorPlans)
        .select();
        
      if (insertError) {
        console.error('❌ Error creating Carnivoor plans:', insertError);
        return NextResponse.json({ error: 'Failed to create Carnivoor plans' }, { status: 500 });
      }
      
      console.log('✅ Carnivoor plans created successfully:', newPlans?.length || 0, 'plans');
      return NextResponse.json({ success: true, plans: newPlans || [] });
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
    const { 
      name, 
      description, 
      target_calories, 
      target_protein, 
      target_carbs, 
      target_fat, 
      duration_weeks, 
      difficulty, 
      goal 
    } = body;

    const { data: plan, error } = await supabaseAdmin
      .from('nutrition_plans')
      .insert({
        name,
        description,
        target_calories,
        target_protein,
        target_carbs,
        target_fat,
        duration_weeks,
        difficulty,
        goal
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating nutrition plan:', error);
      return NextResponse.json({ error: 'Failed to create nutrition plan' }, { status: 500 });
    }

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error('Error in nutrition plans API:', error);
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

    const { data: plan, error } = await supabaseAdmin
      .from('nutrition_plans')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating nutrition plan:', error);
      return NextResponse.json({ error: 'Failed to update nutrition plan' }, { status: 500 });
    }

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error('Error in nutrition plans API:', error);
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