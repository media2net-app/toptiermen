import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const getSupabaseAdminClient = () => {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔍 Fetching training profile for user:', userId);
    
    // Use userId directly (now supports email as TEXT)
    const actualUserId = userId;
    
    const { data, error } = await supabase
      .from('training_profiles')
      .select('*')
      .eq('user_id', actualUserId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        console.log('ℹ️ No training profile found for user');
        return NextResponse.json({
          success: true,
          profile: null
        });
      }
      console.error('❌ Error fetching training profile:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }
    
    console.log('✅ Training profile fetched:', data);
    
    return NextResponse.json({
      success: true,
      profile: data
    });
    
  } catch (error) {
    console.error('❌ Error in training-profile GET:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, userEmail, training_goal, training_frequency, equipment_type } = body;

    if ((!userId && !userEmail) || !training_goal || !training_frequency || !equipment_type) {
      return NextResponse.json({ 
        success: false, 
        error: 'All fields are required' 
      }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('💾 Saving training profile:', body);
    
    // Use userEmail if provided, otherwise use userId
    const emailToLookup = userEmail || userId;
    
    // For now, let's use a simple approach - store the email directly
    // and handle UUID conversion later if needed
    let actualUserId = emailToLookup;
    
    console.log('💾 Using user identifier:', actualUserId);
    
    // Check if profile exists - if so, ALWAYS reset training data (fresh start)
    const { data: existingProfile } = await supabase
      .from('training_profiles')
      .select('training_frequency, training_goal, equipment_type')
      .eq('user_id', emailToLookup)
      .single();
    
    // ALWAYS reset if profile exists (user wants to start fresh with Schema 1)
    if (existingProfile) {
      console.log('🔄 Training profile is being updated - resetting all training data for fresh start');
      console.log('📊 Previous profile:', existingProfile);
      console.log('📊 New profile:', { training_goal, training_frequency, equipment_type });
      console.log('🗑️ Resetting all training data to start fresh...');
      
      // Get user UUID from email
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', emailToLookup)
        .single();
      
      if (profileData?.id) {
        // Delete all schema periods (removes active schema selection)
        await supabase
          .from('user_schema_periods')
          .delete()
          .eq('user_id', profileData.id);
        
        // Delete all training day progress
        await supabase
          .from('user_training_day_progress')
          .delete()
          .eq('user_id', profileData.id);
        
        // Delete legacy training progress if exists
        await supabase
          .from('user_training_progress')
          .delete()
          .eq('user_id', profileData.id);
        
        // Delete week completions
        await supabase
          .from('user_week_completions')
          .delete()
          .eq('user_id', profileData.id);
        
        console.log('✅ Training data reset complete - user can now select Schema 1 again');
      }
    }
    
    const profileData = {
      user_id: emailToLookup, // Store email directly as user_id (TEXT field)
      training_goal,
      training_frequency,
      equipment_type,
      updated_at: new Date().toISOString()
    };
    
    // First try to update existing profile
    let { data, error } = await supabase
      .from('training_profiles')
      .update(profileData)
      .eq('user_id', emailToLookup)
      .select()
      .single();
    
    // If no existing profile found, create a new one
    if (error && error.code === 'PGRST116') {
      console.log('📝 No existing profile found, creating new one...');
      const { data: newData, error: newError } = await supabase
        .from('training_profiles')
        .insert({
          ...profileData,
          experience_level: 'intermediate' // Temporary default value
        })
        .select()
        .single();
      
      data = newData;
      error = newError;
    }
    
    if (error) {
      console.error('❌ Error saving training profile:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }
    
    console.log('✅ Training profile saved:', data);
    
    return NextResponse.json({
      success: true,
      profile: data,
      wasReset: !!existingProfile // Always true if profile was updated
    });
    
  } catch (error) {
    console.error('❌ Error in training-profile POST:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
