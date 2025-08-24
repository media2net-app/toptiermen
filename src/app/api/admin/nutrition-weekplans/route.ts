import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching nutrition weekplans from database...');
    
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');
    const day = searchParams.get('day');

    let query = supabaseAdmin
      .from('nutrition_plans')
      .select('*')
      .order('name');

    if (planId) {
      query = query.eq('id', planId);
    }

    const { data: plans, error } = await query;

    if (error) {
      console.error('❌ Error fetching nutrition weekplans:', error);
      return NextResponse.json({ error: `Failed to fetch nutrition weekplans: ${error.message}` }, { status: 500 });
    }

    // Process weekplan data for each plan
    const weekplans = plans.map(plan => {
      const weekplanData = {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        target_calories: plan.target_calories,
        target_protein: plan.target_protein,
        target_carbs: plan.target_carbs,
        target_fat: plan.target_fat,
        difficulty: plan.difficulty,
        duration_weeks: plan.duration_weeks,
        goal: plan.goal,
        weekly_variations: getWeeklyVariations(plan.name),
        meal_distribution: {
          ontbijt: { percentage: 25, time: '08:00', calories: Math.round(plan.target_calories * 0.25) },
          snack1: { percentage: 10, time: '10:30', calories: Math.round(plan.target_calories * 0.10) },
          lunch: { percentage: 30, time: '13:00', calories: Math.round(plan.target_calories * 0.30) },
          snack2: { percentage: 10, time: '15:30', calories: Math.round(plan.target_calories * 0.10) },
          diner: { percentage: 25, time: '19:00', calories: Math.round(plan.target_calories * 0.25) }
        },
        meal_suggestions: getMealSuggestions(plan.name)
      };

      return weekplanData;
    });

    console.log('✅ Nutrition weekplans fetched successfully:', weekplans?.length || 0, 'weekplans');
    return NextResponse.json({ success: true, weekplans: weekplans || [] });
  } catch (error) {
    console.error('❌ Error in nutrition weekplans API:', error);
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}

function getWeeklyVariations(dietName: string) {
  if (dietName === 'Carnivoor (Rick\'s Aanpak)') {
    return {
      monday: { theme: 'Training Dag', focus: 'protein', description: 'Eiwit-rijk voor training' },
      tuesday: { theme: 'Herstel', focus: 'protein', description: 'Eiwit-rijk voor spierherstel' },
      wednesday: { theme: 'Rust Dag', focus: 'protein', description: 'Eiwit-rijk voor rust' },
      thursday: { theme: 'Training Dag', focus: 'protein', description: 'Eiwit-rijk voor training' },
      friday: { theme: 'Herstel', focus: 'protein', description: 'Eiwit-rijk voor weekend voorbereiding' },
      saturday: { theme: 'Weekend', focus: 'protein', description: 'Eiwit-rijk weekend menu' },
      sunday: { theme: 'Rust', focus: 'protein', description: 'Eiwit-rijk rust dag' }
    };
  }

  // Standard variations for other diets
  return {
    monday: { theme: 'Energie Boost', focus: 'carbs', description: 'Koolhydraat-rijk voor training dag' },
    tuesday: { theme: 'Herstel', focus: 'protein', description: 'Eiwit-rijk voor spierherstel' },
    wednesday: { theme: 'Rust Dag', focus: 'balanced', description: 'Gebalanceerd voor rust' },
    thursday: { theme: 'Training Dag', focus: 'carbs', description: 'Koolhydraat-rijk voor training' },
    friday: { theme: 'Herstel', focus: 'protein', description: 'Eiwit-rijk voor weekend voorbereiding' },
    saturday: { theme: 'Weekend', focus: 'balanced', description: 'Gebalanceerd weekend menu' },
    sunday: { theme: 'Rust', focus: 'light', description: 'Lichter menu voor rust dag' }
  };
}

function getMealSuggestions(dietName: string) {
  const suggestions = {
    'Gebalanceerd': {
      ontbijt: ['Havermout met Banaan en Noten', 'Whey Protein Shake', 'Eieren met Volkoren Brood'],
      lunch: ['Gegrilde Kipfilet met Groenten', 'Zalm met Basmati Rijst', 'Magere Kwark met Noten'],
      diner: ['Kalkoenfilet met Volkoren Pasta', 'Tonijn met Groenten', 'Biefstuk met Aardappelen'],
      snack: ['Noten Mix', 'Eiwitrijke Yoghurt', 'Fruit met Kwark']
    },
    'Koolhydraatarm / Keto': {
      ontbijt: ['Eieren met Spek', 'Gegrilde Ribeye Steak', 'Avocado met Eieren'],
      lunch: ['Salade met Tartaar en Noten', 'Gegrilde Kipfilet met Groenten', 'Zalm met Groenten'],
      diner: ['Gegrilde Ribeye met Boter', 'Kipfilet met Groenten', 'Tartaar met Noten'],
      snack: ['Noten Mix', 'Kaas', 'Eigeel']
    },
    'Carnivoor (Rick\'s Aanpak)': {
      ontbijt: ['Orgaanvlees Mix', 'Gegrilde T-Bone Steak', 'Eieren met Spek'],
      lunch: ['Gegrilde T-Bone Steak', 'Gans met Eendenborst', 'Ribeye Steak'],
      diner: ['Gans met Eendenborst', 'T-Bone Steak', 'Orgaanvlees Mix'],
      snack: ['Spek', 'Kaas', 'Eieren']
    },
    'High Protein': {
      ontbijt: ['Whey Protein Shake', 'Eieren met Kipfilet', 'Magere Kwark met Whey'],
      lunch: ['Magere Kwark met Noten', 'Gegrilde Kipfilet met Groenten', 'Tonijn met Eiwit'],
      diner: ['Kalkoenfilet met Volkoren Pasta', 'Kipfilet met Groenten', 'Witvis met Eiwit'],
      snack: ['Whey Protein Shake', 'Magere Kwark', 'Eiwitrijke Yoghurt']
    }
  };

  return suggestions[dietName as keyof typeof suggestions] || suggestions['Gebalanceerd'];
}
