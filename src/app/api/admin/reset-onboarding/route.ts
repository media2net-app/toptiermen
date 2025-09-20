import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

export async function POST(request: NextRequest) {
  try {
    const { email, userId } = await request.json();
    
    if (!email && !userId) {
      return NextResponse.json({ error: 'Email or userId is required' }, { status: 400 });
    }

    console.log('🔄 Resetting onboarding for user:', email || userId);

    const supabase = getSupabaseClient();

    let finalUserId = userId;
    let finalEmail = email;

    // If we have userId but no email, get email from user
    if (userId && !email) {
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      if (userError || !userData.users) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
      }

      const user = userData.users.find(u => u.id === userId);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      finalEmail = user.email;
      console.log('✅ Found user email:', finalEmail);
    }
    // If we have email but no userId, get userId from email
    else if (email && !userId) {
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      if (userError || !userData.users) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
      }

      const user = userData.users.find(u => u.email === email);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      finalUserId = user.id;
      console.log('✅ Found user ID:', finalUserId);
    }

    // Delete onboarding status records
    const { error: onboardingError } = await supabase
      .from('user_onboarding_status')
      .delete()
      .eq('user_id', finalUserId);

    if (onboardingError) {
      console.log('⚠️ Error deleting onboarding status:', onboardingError.message);
    } else {
      console.log('✅ Onboarding status deleted');
    }

    // Delete user missions
    const { error: missionsError } = await supabase
      .from('user_missions')
      .delete()
      .eq('user_id', finalUserId);

    if (missionsError) {
      console.log('⚠️ Error deleting user missions:', missionsError.message);
    } else {
      console.log('✅ User missions deleted');
    }

    // Delete user training progress
    const { error: trainingError } = await supabase
      .from('user_training_progress')
      .delete()
      .eq('user_id', finalUserId);

    if (trainingError) {
      console.log('⚠️ Error deleting training progress:', trainingError.message);
    } else {
      console.log('✅ Training progress deleted');
    }

    // Delete user preferences
    const { error: preferencesError } = await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', finalUserId);

    if (preferencesError) {
      console.log('⚠️ Error deleting user preferences:', preferencesError.message);
    } else {
      console.log('✅ User preferences deleted');
    }

    // Reset main goal in profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ main_goal: null })
      .eq('id', finalUserId);

    if (profileError) {
      console.log('⚠️ Error resetting profile:', profileError.message);
    } else {
      console.log('✅ Profile reset');
    }

    console.log('🎉 Onboarding reset completed for:', finalEmail);

    return NextResponse.json({ 
      success: true,
      message: `Onboarding reset completed for ${finalEmail}`,
      userId: finalUserId,
      email: finalEmail
    });

  } catch (error) {
    console.error('❌ Error resetting onboarding:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 