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
    
    // Check if profile has actually changed - only reset if it has
    const hasActuallyChanged = existingProfile && (
      existingProfile.training_goal !== training_goal ||
      existingProfile.training_frequency !== training_frequency ||
      existingProfile.equipment_type !== equipment_type
    );

    if (hasActuallyChanged) {
      console.log('🔄 Training profile HAS CHANGED - resetting all training data for fresh start');
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
        console.log('🗑️ Starting complete data wipe for user:', profileData.id);
        
        // Delete all schema periods (removes active schema selection)
        const { error: e1 } = await supabase
          .from('user_schema_periods')
          .delete()
          .eq('user_id', profileData.id);
        console.log(e1 ? `  ⚠️ user_schema_periods: ${e1.message}` : '  ✅ user_schema_periods cleared');
        
        // Delete all training day progress
        const { error: e2 } = await supabase
          .from('user_training_day_progress')
          .delete()
          .eq('user_id', profileData.id);
        console.log(e2 ? `  ⚠️ user_training_day_progress: ${e2.message}` : '  ✅ user_training_day_progress cleared');
        
        // Delete legacy training progress if exists
        const { error: e3 } = await supabase
          .from('user_training_progress')
          .delete()
          .eq('user_id', profileData.id);
        console.log(e3 ? `  ⚠️ user_training_progress: ${e3.message}` : '  ✅ user_training_progress cleared');
        
        // Delete week completions (may not exist, suppress error)
        const { error: e4 } = await supabase
          .from('user_week_completions')
          .delete()
          .eq('user_id', profileData.id);
        if (e4 && e4.code !== 'PGRST204' && e4.code !== '42P01') {
          console.log(`  ⚠️ user_week_completions: ${e4.message}`);
        } else {
          console.log('  ✅ user_week_completions cleared');
        }
        
        // 🔴 KRITIEKE: Delete ALL schema progress (removes ALL completion and unlock status!)
        const { error: e5 } = await supabase
          .from('user_training_schema_progress')
          .delete()
          .eq('user_id', profileData.id);
        console.log(e5 ? `  ❌ CRITICAL: user_training_schema_progress: ${e5.message}` : '  ✅ user_training_schema_progress cleared (ALL SCHEMAS RESET)');
        
        // Clear selected schema from profiles
        const { error: e6 } = await supabase
          .from('profiles')
          .update({ selected_schema_id: null })
          .eq('id', profileData.id);
        console.log(e6 ? `  ⚠️ profiles.selected_schema_id: ${e6.message}` : '  ✅ selected_schema_id cleared');
        
        console.log('\n🎯 COMPLETE RESET PERFORMED:');
        console.log('   ✅ All schema progress deleted (no completed schemas remain)');
        console.log('   ✅ All training day progress deleted');
        console.log('   ✅ All schema periods deleted');
        console.log('   ✅ Selected schema cleared');
        console.log('   ✅ User will start fresh with ONLY Schema 1 unlocked');
        console.log('   🔄 Frontend should clear localStorage cache\n');
      }
    } else if (existingProfile) {
      console.log('ℹ️  Training profile unchanged - no reset needed');
      console.log('📊 Existing profile:', existingProfile);
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
      resetPerformed: !!hasActuallyChanged,
      clearCache: !!hasActuallyChanged, // Signal frontend to clear localStorage
      message: hasActuallyChanged 
        ? '🔄 Trainingsprofiel bijgewerkt! Alle oude data is gewist. Je begint opnieuw met Schema 1.' 
        : existingProfile
        ? 'Trainingsprofiel ongewijzigd'
        : 'Trainingsprofiel aangemaakt'
    });
    
  } catch (error) {
    console.error('❌ Error in training-profile POST:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
