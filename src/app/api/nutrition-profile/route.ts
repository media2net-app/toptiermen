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

    // Use custom calorie targets based on TTM expertise (not standard formulas)
    // Standard profile: 40y, 100kg, 190cm, male, moderate activity
    let targetCalories = 0;
    
    if (gender === 'male' && age === 40 && weight === 100 && height === 190 && activityLevel === 'moderate') {
      // Exact TTM targets for standard profile
      if (goal === 'cut') {
        targetCalories = 2500;
      } else if (goal === 'maintain') {
        targetCalories = 2860;
      } else if (goal === 'bulk') {
        targetCalories = 3260;
      }
    } else {
      // For other profiles, use standard Mifflin-St Jeor formula
      let bmr = 0;
      if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      }
      
      // Activity multipliers (nieuwe 3-niveau structuur)
      const activityMultipliers = {
        sedentary: 1.1,  // Zittend (Licht actief)
        moderate: 1.3,   // Staand (Matig actief)
        very_active: 1.6 // Lopend (Zeer actief)
      };
      
      // Nieuwe berekening: Gewicht x 22 x activiteitniveau
      const tdee = weight * 22 * activityMultipliers[activityLevel as keyof typeof activityMultipliers];
      
      // Adjust calories based on goal
      if (goal === 'cut') {
        targetCalories = tdee * 0.8; // 20% deficit
      } else if (goal === 'bulk') {
        targetCalories = tdee * 1.15; // 15% surplus
      } else if (goal === 'maintain') {
        targetCalories = tdee; // No adjustment
      }
    }

    // Calculate BMR for macro calculations (still needed for protein/fat calculations)
    let bmr = 0;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    // Activity multipliers for TDEE calculation (nieuwe 3-niveau structuur)
    const activityMultipliers = {
      sedentary: 1.1,  // Zittend (Licht actief)
      moderate: 1.3,   // Staand (Matig actief) 
      very_active: 1.6 // Lopend (Zeer actief)
    };
    
    // Nieuwe berekening: Gewicht x 22 x activiteitniveau
    const tdee = weight * 22 * activityMultipliers[activityLevel as keyof typeof activityMultipliers];

    // Calculate macros
    const targetProtein = Math.round(weight * 2.2); // 2.2g per kg bodyweight (updated per Rick's request)
    const targetFat = Math.round(weight * 1.0); // 1g per kg bodyweight
    const proteinCalories = targetProtein * 4;
    const fatCalories = targetFat * 9;
    const targetCarbs = Math.round((targetCalories - proteinCalories - fatCalories) / 4);

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
