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

    // Calculate BMR using Mifflin-St Jeor equation
    let bmr = 0;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,      // Little to no exercise
      light: 1.375,        // Light exercise 1-3 days/week
      moderate: 1.55,      // Moderate exercise 3-5 days/week
      active: 1.725,       // Heavy exercise 6-7 days/week
      very_active: 1.9     // Very heavy exercise, physical job
    };

    // Calculate TDEE
    const tdee = bmr * activityMultipliers[activityLevel as keyof typeof activityMultipliers];

    // Adjust calories based on goal
    let targetCalories = tdee;
    if (goal === 'cut') {
      targetCalories = tdee - 400; // 400 calorie deficit
    } else if (goal === 'bulk') {
      targetCalories = tdee + 300; // 300 calorie surplus
    }

    // Calculate macros
    const targetProtein = Math.round(weight * 1.8); // 1.8g per kg bodyweight
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
      return NextResponse.json({ error: 'Failed to save nutrition profile' }, { status: 500 });
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
