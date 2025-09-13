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

    console.log('📝 Received nutrition profile data:', { userId, age, height, weight, gender, activityLevel, goal });

    if (!userId || !age || !height || !weight || !gender || !activityLevel || !goal) {
      console.error('❌ Missing required fields:', { userId, age, height, weight, gender, activityLevel, goal });
      return NextResponse.json({ 
        error: 'All fields are required: userId, age, height, weight, gender, activityLevel, goal',
        received: { userId, age, height, weight, gender, activityLevel, goal }
      }, { status: 400 });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.error('❌ Invalid UUID format:', userId);
      return NextResponse.json({ 
        error: 'Invalid user ID format. Expected UUID format.',
        received: { userId }
      }, { status: 400 });
    }

    // Activity multipliers (TTM formule: Gewicht x 22 x activiteitniveau)
    const activityMultipliers = {
      sedentary: 1.1,  // Zittend (Licht actief) - corrected to 1.1
      light: 1.1,      // Licht actief
      moderate: 1.3,   // Matig actief  
      active: 1.5,     // Actief
      very_active: 1.6 // Zeer actief
    };
    
    // Calculate TDEE using TTM formula
    const tdee = weight * 22 * activityMultipliers[activityLevel as keyof typeof activityMultipliers];
    
    // Use TTM formula for calories: Gewicht x 22 x activiteitniveau
    // Apply goal-based adjustments
    let targetCalories = tdee;
    
    // Map Dutch goal values to English database values
    const goalMapping: { [key: string]: string } = {
      'droogtrainen': 'cut',
      'onderhoud': 'maintain', 
      'spiermassa': 'bulk'
    };

    const mappedGoal = goalMapping[goal] || goal;
    console.log(`🎯 Goal mapping: ${goal} -> ${mappedGoal}`);

    // Apply goal-based calorie adjustments
    switch (mappedGoal) {
      case 'cut':
        targetCalories = tdee - 500; // -500 kcal van onderhoud
        break;
      case 'maintain':
        targetCalories = tdee; // Geen aanpassing
        break;
      case 'bulk':
        targetCalories = tdee + 400; // +400 kcal van onderhoud
        break;
      default:
        targetCalories = tdee;
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
      goal: mappedGoal, // Use mapped goal value for database
      target_calories: Math.round(targetCalories),
      target_protein: targetProtein,
      target_carbs: targetCarbs,
      target_fat: targetFat,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee)
    };

    console.log('💾 Saving profile data to database:', profileData);

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
      console.error('❌ Error saving nutrition profile:', error);
      console.error('❌ Profile data that failed:', profileData);
      return NextResponse.json({ 
        error: 'Failed to save nutrition profile', 
        details: error.message,
        code: error.code,
        profileData: profileData
      }, { status: 500 });
    }

    console.log('✅ Profile saved successfully:', profile);

    return NextResponse.json({ 
      success: true, 
      profile: {
        ...profile,
        goal: goal // Return original Dutch goal value to frontend
      },
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
