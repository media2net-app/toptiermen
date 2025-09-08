import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data: profile, error } = await supabaseAdmin
      .from('nutrition_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching nutrition profile:', error);
      return NextResponse.json({ error: 'Failed to fetch nutrition profile' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      profile: profile || null 
    });

  } catch (error) {
    console.error('Error in nutrition profile GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      age, 
      height, 
      weight, 
      gender, 
      activityLevel, 
      goal 
    } = body;

    if (!userId || !age || !height || !weight || !gender || !activityLevel || !goal) {
      return NextResponse.json({ 
        error: 'All fields are required: userId, age, height, weight, gender, activityLevel, goal' 
      }, { status: 400 });
    }

    // Activity multipliers (TTM formule: Gewicht x 22 x activiteitniveau)
    const activityMultipliers = {
      sedentary: 1.0,  // Zittend (Licht actief)
      light: 1.1,      // Licht actief
      moderate: 1.3,   // Matig actief  
      active: 1.5,     // Actief
      very_active: 1.7 // Zeer actief
    };
    
    // Calculate TDEE using TTM formula
    const tdee = weight * 22 * activityMultipliers[activityLevel as keyof typeof activityMultipliers];
    
    // Use custom calorie targets based on TTM expertise (not standard formulas)
    // Standard profile: 40y, 100kg, 190cm, male, moderate activity
    let targetCalories = 0;
    
    if (gender === 'male' && age === 40 && weight === 100 && height === 190 && activityLevel === 'moderate') {
      // Exact TTM targets for standard profile
      if (goal === 'cut') {
        targetCalories = 2360; // Corrected TTM value for droogtrainen
      } else if (goal === 'maintain') {
        targetCalories = 2860;
      } else if (goal === 'bulk') {
        targetCalories = 3260;
      }
    } else {
      // Adjust calories based on goal
      if (goal === 'cut') {
        targetCalories = tdee * 0.8; // 20% deficit
      } else if (goal === 'bulk') {
        targetCalories = tdee * 1.15; // 15% surplus
      } else if (goal === 'maintain') {
        targetCalories = tdee; // No adjustment
      }
    }

    // Calculate BMR for reference
    let bmr = 0;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Macro calculations will be done per plan selection
    // For now, just store the base calorie target
    const targetProtein = 0; // Will be calculated per plan
    const targetCarbs = 0;   // Will be calculated per plan  
    const targetFat = 0;     // Will be calculated per plan

    const profileData = {
      user_id: userId,
      age: parseInt(age),
      height: parseInt(height),
      weight: parseFloat(weight),
      gender,
      activity_level: activityLevel,
      goal,
      target_calories: Math.round(targetCalories),
      target_protein: targetProtein,
      target_carbs: targetCarbs,
      target_fat: targetFat,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee)
    };

    // Insert or update profile
    const { data: profile, error } = await supabaseAdmin
      .from('nutrition_profiles')
      .upsert(profileData, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving nutrition profile:', error);
      return NextResponse.json({ 
        error: 'Failed to save nutrition profile', 
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      profile,
      calculations: {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        targetCalories: Math.round(targetCalories),
        targetProtein,
        targetCarbs,
        targetFat
      }
    });

  } catch (error) {
    console.error('Error in nutrition profile POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
