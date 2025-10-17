import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');

    // Get userId from email if not provided directly
    let actualUserId = userId;
    if (!actualUserId && email) {
      // Try exact match first
      let { data: userData, error: userError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      
      // If not found, try case-insensitive search
      if (userError && email) {
        console.log('Profile not found with exact email, trying case-insensitive search for:', email);
        const { data: caseInsensitiveData, error: caseInsensitiveError } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .ilike('email', email)
          .single();
        
        if (!caseInsensitiveError) {
          userData = caseInsensitiveData;
          userError = null;
          console.log('✅ Found profile with case-insensitive search');
        }
      }
      
      if (userError || !userData) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      actualUserId = userData.id;
    }

    if (!actualUserId) {
      return NextResponse.json({ error: 'User ID or email is required' }, { status: 400 });
    }

    console.log('📊 V2 Fetching nutrition profile for userId:', actualUserId);

    const { data: profile, error } = await supabaseAdmin
      .from('nutrition_profiles')
      .select('*')
      .eq('user_id', actualUserId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching nutrition profile v2:', error);
      return NextResponse.json({ error: 'Failed to fetch nutrition profile' }, { status: 500 });
    }

    console.log('📊 V2 Profile found:', profile ? 'Yes' : 'No');

    return NextResponse.json({ 
      success: true, 
      profile: profile || null 
    });

  } catch (error) {
    console.error('Error in nutrition profile v2 GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, weight, height, age, gender, activity_level, fitness_goal } = body;

    // Get userId from email if not provided directly
    let actualUserId = userId;
    if (!actualUserId && email) {
      // Try exact match first
      let { data: userData, error: userError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      
      // If not found, try case-insensitive search
      if (userError && email) {
        console.log('Profile not found with exact email, trying case-insensitive search for:', email);
        const { data: caseInsensitiveData, error: caseInsensitiveError } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .ilike('email', email)
          .single();
        
        if (!caseInsensitiveError) {
          userData = caseInsensitiveData;
          userError = null;
          console.log('✅ Found profile with case-insensitive search');
        }
      }
      
      if (userError || !userData) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      actualUserId = userData.id;
    }

    if (!actualUserId) {
      return NextResponse.json({ error: 'User ID or email is required' }, { status: 400 });
    }

    // Map the field names from the form
    const activityLevel = activity_level;
    const goal = fitness_goal;

    // Validate required fields
    if (!weight || !height || !age || !gender || !activityLevel || !goal) {
      return NextResponse.json({ error: 'All profile fields are required' }, { status: 400 });
    }

    console.log('📝 V2 Received nutrition profile data:', {
      userId: actualUserId,
      email,
      age,
      height,
      weight,
      gender,
      activityLevel,
      goal
    });

    // Goal mapping from Dutch to English for database consistency
    const goalMapping: { [key: string]: string } = {
      'droogtrainen': 'cut',
      'onderhoud': 'maintain', 
      'spiermassa': 'bulk'
    };

    const mappedGoal = goalMapping[goal] || goal;
    console.log('🎯 V2 Goal mapping:', goal, '->', mappedGoal);

    // Calculate BMR using Mifflin-St Jeor Equation
    const bmr = gender === 'male' 
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

    // Calculate TDEE based on activity level
    const activityMultipliers = {
      'sedentary': 1.2,
      'moderate': 1.3,
      'very_active': 1.6
    };

    const tdee = bmr * (activityMultipliers[activityLevel as keyof typeof activityMultipliers] || 1.3);

    const profileData = {
      user_id: actualUserId,
      weight: parseFloat(weight),
      height: parseInt(height),
      age: parseInt(age),
      gender,
      activity_level: activityLevel,
      goal: mappedGoal,
      target_calories: Math.round(tdee),
      target_protein: 0, // Will be calculated based on plan
      target_carbs: 0,   // Will be calculated based on plan
      target_fat: 0,     // Will be calculated based on plan
      bmr: Math.round(bmr),
      tdee: Math.round(tdee)
    };

    console.log('💾 V2 Saving profile data to database:', profileData);

    // Use upsert to either insert or update
    const { data, error } = await supabaseAdmin
      .from('nutrition_profiles')
      .upsert(profileData, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving nutrition profile v2:', error);
      return NextResponse.json({ error: 'Failed to save nutrition profile' }, { status: 500 });
    }

    console.log('✅ V2 Profile saved successfully:', data);

    return NextResponse.json({ 
      success: true, 
      profile: data 
    });

  } catch (error) {
    console.error('Error in nutrition profile v2 POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
